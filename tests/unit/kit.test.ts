import test from "node:test";
import assert from "node:assert/strict";

type Reply = { status: number; json?: unknown } | "network-down";
type Call = { method: string; path: string; body: Record<string, unknown>; key: string };

/** Replaces fetch with a scripted Kit and records each call. */
function fakeKit(routes: (method: string, path: string, body: Record<string, unknown>) => Reply) {
  const calls: Call[] = [];
  const original = globalThis.fetch;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    const path = String(url).replace("https://api.kit.com/v4", "");
    const body = init.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : {};
    const key = new Headers(init.headers).get("X-Kit-Api-Key") ?? "";
    calls.push({ method: String(init.method), path, body, key });
    const reply = routes(String(init.method), path, body);
    if (reply === "network-down") throw new Error("offline");
    return new Response(reply.json === undefined ? null : JSON.stringify(reply.json), {
      status: reply.status,
    });
  }) as typeof fetch;
  return { calls, restore: () => (globalThis.fetch = original) };
}

const sub = (state: string, status = 200): Reply => ({
  status,
  json: { subscriber: { id: 7, state } },
});
const FORM = "/forms/123/subscribers/7";
const TAG = "/tags/55/subscribers/7";
const paths = (calls: Call[]) => calls.map((call) => call.path);

/** A normal Kit where every step after the create call works. */
const happy = (create: Reply) => (_method: string, path: string) => {
  if (path === "/subscribers") return create;
  if (path === "/tags") return { status: 201, json: { tag: { id: 55 } } };
  return { status: 201, json: {} };
};
const CLEAN = { member: true, statusDone: false, ok: false, refused: false, rejected: false };

async function load(t: test.TestContext) {
  process.env["KIT_API_KEY"] = "test-key";
  process.env["KIT_FORM_ID"] = "123";
  const logged = t.mock.method(console, "error", () => {});
  t.after(() => {
    delete process.env["KIT_API_KEY"];
    delete process.env["KIT_FORM_ID"];
  });
  // A fresh copy each time, so the tag id cache doesn't leak between tests.
  const kit = await import(`../../src/lib/kit.server.ts?v=${Math.random()}`);
  return { ...kit, logged };
}

test("not configured without both settings and a numeric form id", async (t) => {
  const kit = await load(t);
  assert.equal(kit.kitConfigured(), true);
  process.env["KIT_FORM_ID"] = "abc";
  assert.equal(kit.kitConfigured(), false);
  delete process.env["KIT_API_KEY"];
  process.env["KIT_FORM_ID"] = "123";
  assert.equal(kit.kitConfigured(), false);
  assert.deepEqual(await kit.kitOptIn("a@b.co", [], { resubscribe: true }), {
    ...CLEAN,
    member: false,
  });
  assert.equal(await kit.kitOptOut("a@b.co"), false);
  assert.equal(await kit.kitOptOutIfListed("a@b.co"), false);
});

test("a new address starts unconfirmed, is tagged, then joins the form last", async (t) => {
  const kit = await load(t);
  const f = fakeKit(happy(sub("inactive", 201)));
  t.after(f.restore);
  const result = await kit.kitOptIn(" A@B.co ", ["account"], { resubscribe: true });
  assert.deepEqual(result, { ...CLEAN, statusDone: true, ok: true });
  assert.deepEqual(f.calls[0], {
    method: "POST",
    path: "/subscribers",
    body: { email_address: "a@b.co", state: "inactive" },
    key: "test-key",
  });
  assert.deepEqual(paths(f.calls), ["/subscribers", "/tags", TAG, FORM]);
  assert.equal(typeof f.calls[3]?.body["referrer"], "string");
});

test("a failed tag sends no confirmation, so retries can't repeat the email", async (t) => {
  const kit = await load(t);
  let tagsWork = false;
  const f = fakeKit((_method, path) => {
    if (path === "/subscribers") return sub("inactive");
    if (path === "/tags") return { status: 201, json: { tag: { id: 55 } } };
    if (path === TAG) return { status: tagsWork ? 201 : 429, json: {} };
    return { status: 201, json: {} };
  });
  t.after(f.restore);
  for (let run = 0; run < 3; run++) {
    assert.deepEqual(await kit.kitOptIn("a@b.co", ["account"], { resubscribe: true }), CLEAN);
  }
  assert.equal(paths(f.calls).includes(FORM), false);
  tagsWork = true;
  assert.equal((await kit.kitOptIn("a@b.co", ["account"], { resubscribe: true })).ok, true);
  assert.equal(paths(f.calls).filter((path) => path === FORM).length, 1);
});

test("an active subscriber isn't sent another confirmation", async (t) => {
  const kit = await load(t);
  const f = fakeKit(happy(sub("active")));
  t.after(f.restore);
  const result = await kit.kitOptIn("a@b.co", ["account"], { resubscribe: true });
  assert.deepEqual(result, { ...CLEAN, statusDone: true, ok: true });
  assert.equal(paths(f.calls).includes(FORM), false);
});

for (const state of ["cancelled", "bounced", "complained"]) {
  test(`${state}: an explicit new choice is refused and nothing else is called`, async (t) => {
    const kit = await load(t);
    const f = fakeKit(happy(sub(state)));
    t.after(f.restore);
    const result = await kit.kitOptIn("a@b.co", ["account"], { resubscribe: true });
    assert.deepEqual(result, { ...CLEAN, refused: true });
    assert.equal(f.calls.length, 1);
  });

  test(`${state}: a plain sync leaves them alone and never joins the form`, async (t) => {
    const kit = await load(t);
    const f = fakeKit(happy(sub(state)));
    t.after(f.restore);
    const result = await kit.kitOptIn("a@b.co", ["account"], { resubscribe: false });
    assert.deepEqual(result, { ...CLEAN, ok: true });
    assert.equal(paths(f.calls).includes(FORM), false);
  });
}

test("a lost reply still counts as a possible subscriber, and can be retried", async (t) => {
  const kit = await load(t);
  const f = fakeKit(() => "network-down");
  t.after(f.restore);
  assert.deepEqual(await kit.kitOptIn("a@b.co", [], { resubscribe: false }), CLEAN);
});

test("a definite failure to create reports no subscriber", async (t) => {
  const kit = await load(t);
  const f = fakeKit(() => ({ status: 500, json: {} }));
  t.after(f.restore);
  const result = await kit.kitOptIn("a@b.co", [], { resubscribe: false });
  assert.deepEqual(result, { ...CLEAN, member: false });
});

test("a key, plan or form problem is rejected, never refused, and is logged", async (t) => {
  const kit = await load(t);
  let status = 429;
  const f = fakeKit(() => ({ status, json: {} }));
  t.after(f.restore);
  assert.equal((await kit.kitOptIn("a@b.co", [], { resubscribe: true })).rejected, false);
  assert.equal(kit.logged.mock.callCount(), 0);
  for (status of [401, 403]) {
    const result = await kit.kitOptIn("a@b.co", [], { resubscribe: true });
    assert.equal(result.rejected, true);
    assert.equal(result.refused, false);
  }
  assert.equal(kit.logged.mock.callCount(), 2);
  const line = String(kit.logged.mock.calls[0]?.arguments[0]);
  assert.equal(line.includes("a@b.co") || line.includes("test-key"), false);
});

test("a form add that fails is rejected or retried, and never counts as done", async (t) => {
  const kit = await load(t);
  let status = 404;
  const f = fakeKit((_method, path) =>
    path === "/subscribers" ? sub("inactive", 201) : { status, json: {} },
  );
  t.after(f.restore);
  assert.deepEqual(await kit.kitOptIn("a@b.co", [], { resubscribe: true }), {
    ...CLEAN,
    rejected: true,
  });
  status = 500;
  assert.deepEqual(await kit.kitOptIn("a@b.co", [], { resubscribe: true }), CLEAN);
});

test("tag ids are reused, and looked up again after a 404", async (t) => {
  const kit = await load(t);
  let tagStatus = 201;
  const f = fakeKit((_method, path) => {
    if (path === "/subscribers") return sub("active");
    if (path === "/tags") return { status: 201, json: { tag: { id: 55 } } };
    return { status: tagStatus, json: {} };
  });
  t.after(f.restore);
  const lookups = () => paths(f.calls).filter((path) => path === "/tags").length;
  await kit.kitOptIn("a@b.co", ["account"], { resubscribe: false });
  await kit.kitOptIn("a@b.co", ["account"], { resubscribe: false });
  assert.equal(lookups(), 1);
  tagStatus = 404;
  assert.equal((await kit.kitOptIn("a@b.co", ["account"], { resubscribe: false })).ok, false);
  tagStatus = 201;
  await kit.kitOptIn("a@b.co", ["account"], { resubscribe: false });
  assert.equal(lookups(), 2);
});

test("opt-out finds the subscriber through the create call, not the lagging lookup", async (t) => {
  const kit = await load(t);
  const f = fakeKit((_method, path) => (path === "/subscribers" ? sub("active") : { status: 204 }));
  t.after(f.restore);
  assert.equal(await kit.kitOptOut(" A@b.co "), true);
  assert.deepEqual(paths(f.calls), ["/subscribers", "/subscribers/7/unsubscribe"]);
  assert.deepEqual(f.calls[0]?.body, { email_address: "a@b.co", state: "cancelled" });
  assert.equal(
    f.calls.some((call) => call.method === "GET"),
    false,
  );
});

test("opt-out of someone already cancelled, or never added, makes no second call", async (t) => {
  const kit = await load(t);
  for (const reply of [sub("cancelled"), sub("cancelled", 201)]) {
    const f = fakeKit(() => reply);
    assert.equal(await kit.kitOptOut("a@b.co"), true);
    assert.equal(f.calls.length, 1);
    f.restore();
  }
});

for (const state of ["inactive", "bounced", "complained"]) {
  test(`opt-out still unsubscribes someone ${state}`, async (t) => {
    const kit = await load(t);
    const f = fakeKit((_method, path) => (path === "/subscribers" ? sub(state) : { status: 204 }));
    t.after(f.restore);
    assert.equal(await kit.kitOptOut("a@b.co"), true);
    assert.equal(paths(f.calls).includes("/subscribers/7/unsubscribe"), true);
  });
}

test("opt-out: only a real failure reports false", async (t) => {
  const kit = await load(t);
  const check = async (routes: Parameters<typeof fakeKit>[0], want: boolean) => {
    const f = fakeKit(routes);
    assert.equal(await kit.kitOptOut("a@b.co"), want);
    f.restore();
  };
  await check(() => "network-down", false);
  await check(() => ({ status: 401, json: {} }), false);
  await check(() => ({ status: 429, json: {} }), false);
  await check(() => ({ status: 422, json: {} }), true); // Kit won't accept the address at all
  await check((_m, path) => (path === "/subscribers" ? sub("active") : { status: 500 }), false);
  await check((_m, path) => (path === "/subscribers" ? sub("active") : { status: 404 }), true);
});

test("opt-out if listed never creates a record", async (t) => {
  const kit = await load(t);
  const none = fakeKit(() => ({ status: 200, json: { subscribers: [] } }));
  assert.equal(await kit.kitOptOutIfListed("A+b@c.co"), true);
  assert.deepEqual(
    none.calls.map((call) => call.method),
    ["GET"],
  );
  assert.equal(none.calls[0]?.path, "/subscribers?email_address=a%2Bb%40c.co&status=all");
  none.restore();

  const gone = fakeKit(() => ({
    status: 200,
    json: { subscribers: [{ id: 7, state: "cancelled" }] },
  }));
  assert.equal(await kit.kitOptOutIfListed("a@b.co"), true);
  assert.equal(gone.calls.length, 1);
  gone.restore();

  const active = fakeKit((method) =>
    method === "GET"
      ? { status: 200, json: { subscribers: [{ id: 7, state: "active" }] } }
      : { status: 204 },
  );
  assert.equal(await kit.kitOptOutIfListed("a@b.co"), true);
  assert.equal(active.calls[1]?.path, "/subscribers/7/unsubscribe");
  active.restore();

  const down = fakeKit(() => ({ status: 500, json: {} }));
  t.after(down.restore);
  assert.equal(await kit.kitOptOutIfListed("a@b.co"), false);
});
