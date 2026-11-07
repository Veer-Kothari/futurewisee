import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const migrationDir = new URL("../../supabase/migrations/", import.meta.url);
let files;
try {
  files = (await readdir(migrationDir)).filter((name) => name.endsWith(".sql")).sort();
} catch (error) {
  if (error.code !== "ENOENT") throw error;
  files = [];
}

if (files.length === 0) {
  console.log("skipped: no migrations");
  test("database contract", { skip: "skipped: no migrations" }, () => {});
} else {
  test("database contract against real migrations", async (t) => {
    const { PGlite } = await import("@electric-sql/pglite");
    const db = new PGlite();
    t.after(() => db.close());
    await db.exec(await readFile(new URL("./supabase-stub.sql", import.meta.url), "utf8"));
    const migrations = await Promise.all(
      files.map((name) => readFile(fileURLToPath(new URL(name, migrationDir)), "utf8")),
    );
    await t.test("all migrations apply twice without pg_cron", async () => {
      assert.equal(
        (await db.query("select count(*)::int as n from pg_extension where extname = 'pg_cron'"))
          .rows[0].n,
        0,
      );
      for (let pass = 0; pass < 2; pass++) for (const sql of migrations) await db.exec(sql);
    });

    const A = "00000000-0000-4000-8000-000000000001";
    const B = "00000000-0000-4000-8000-000000000002";
    const ADMIN = "00000000-0000-4000-8000-000000000003";
    const DELETED = "00000000-0000-4000-8000-000000000004";
    const DEFAULTS = "00000000-0000-4000-8000-000000000005";
    const own = async (role, userId, action) => {
      await db.exec("begin");
      try {
        await db.exec("set local role " + role);
        await db.query(
          "select set_config('request.jwt.claim.sub', $1, true), set_config('request.jwt.claim.role', $2, true)",
          [userId ?? "", role],
        );
        return await action();
      } finally {
        await db.exec("rollback");
      }
    };
    const queryAs = (role, userId, sql, params = []) =>
      own(role, userId, () => db.query(sql, params));
    const denied = async (role, userId, sql, params = [], mayFilter = false) => {
      let result;
      try {
        result = await queryAs(role, userId, sql, params);
      } catch (error) {
        assert.equal(error.code, "42501", sql + ": " + error.message);
        return;
      }
      assert.ok(mayFilter, "Expected permission denial: " + sql);
      assert.equal(result.affectedRows, 0, "RLS must affect no rows: " + sql);
    };
    const invisible = async (role, userId, table) => {
      let result;
      try {
        result = await queryAs(role, userId, "select * from public." + table);
      } catch (error) {
        assert.equal(error.code, "42501");
        return;
      }
      assert.deepEqual(result.rows, [], table);
    };
    const constraint = async (sql, params = []) => {
      await assert.rejects(db.query(sql, params), (error) => error.code === "23514", sql);
    };
    const signup = (id, email, meta) =>
      db.query("insert into auth.users (id,email,raw_user_meta_data) values ($1,$2,$3::jsonb)", [
        id,
        email,
        JSON.stringify(meta),
      ]);
    await signup(A, "a@example.org", {
      age_confirmed: true,
      full_name: "  Student A  ",
      marketing_opt_in: true,
    });
    await signup(B, "b@example.org", { age_confirmed: true, full_name: "Student B" });
    await signup(ADMIN, "reviewer@example.org", {
      age_confirmed: true,
      full_name: "Administrator",
    });
    await signup(DELETED, "delete@example.org", { age_confirmed: true });

    await t.test(
      "sign-up creates a trimmed profile and defaults missing optional metadata",
      async () => {
        const row = (await db.query("select * from public.profiles where id=$1", [A])).rows[0];
        assert.equal(row.full_name, "Student A");
        assert.equal(row.age_confirmed, true);
        assert.equal(row.marketing_opt_in, true);
        assert.ok(row.created_at && row.updated_at);
        await signup(DEFAULTS, "defaults@example.org", { age_confirmed: true });
        const defaults = (await db.query("select * from public.profiles where id=$1", [DEFAULTS]))
          .rows[0];
        assert.equal(defaults.full_name, "");
        assert.equal(defaults.marketing_opt_in, false);
        assert.equal(defaults.age_confirmed, true);
        assert.equal(defaults.mailchimp_synced_at, null);
        assert.equal(defaults.mailchimp_survey_tagged, false);
        const longId = "00000000-0000-4000-8000-000000000006";
        await signup(longId, "long@example.org", {
          age_confirmed: true,
          full_name: "x".repeat(150),
        });
        assert.equal(
          (await db.query("select full_name from public.profiles where id=$1", [longId])).rows[0]
            .full_name,
          "x".repeat(120),
        );
      },
    );
    await t.test(
      "sign-up rejects missing, false and non-true age confirmation atomically",
      async () => {
        for (const meta of [
          {},
          { age_confirmed: false },
          { age_confirmed: "yes" },
          { age_confirmed: 1 },
          { age_confirmed: null },
        ]) {
          const id = "00000000-0000-4000-8000-000000000099";
          await assert.rejects(
            signup(id, "invalid@example.org", meta),
            /age_confirmation_required/,
          );
          assert.equal(
            (await db.query("select count(*)::int as n from auth.users where id=$1", [id])).rows[0]
              .n,
            0,
          );
          assert.equal(
            (await db.query("select count(*)::int as n from public.profiles where id=$1", [id]))
              .rows[0].n,
            0,
          );
        }
      },
    );
    await t.test(
      "admin bootstrap is safe twice and email comparison is case-insensitive",
      async () => {
        const sql =
          "insert into public.user_roles (user_id, role) select id, 'admin' from auth.users where lower(email) = lower('REVIEWER@example.org') on conflict do nothing";
        await db.exec(sql);
        await db.exec(sql);
        const rows = (await db.query("select * from public.user_roles where user_id=$1", [ADMIN]))
          .rows;
        assert.equal(rows.length, 1);
        assert.ok(rows[0].id);
        assert.equal(rows[0].role, "admin");
      },
    );

    const createPost = async (slug, published) =>
      (
        await db.query(
          "insert into public.posts (slug,title,category,author_name,published) values ($1,'Test post','personal-finance','Author',$2) returning id",
          [slug, published],
        )
      ).rows[0].id;
    const createInsight = async (published) =>
      (
        await db.query(
          "insert into public.insight_items (industry,kind,title,body,published) values ('law','guide','Test guide','Guide text',$1) returning id",
          [published],
        )
      ).rows[0].id;
    const PUBLIC_POST = await createPost("public-post", true);
    const PRIVATE_POST = await createPost("private-post", false);
    const PUBLIC_INSIGHT = await createInsight(true);
    const PRIVATE_INSIGHT = await createInsight(false);
    await db.query("insert into public.user_roles (user_id,role) values ($1,'admin')", [DELETED]);
    await db.query("insert into public.rate_events (kind,ip) values ('survey','192.0.2.99')");
    const responseSql =
      "insert into public.survey_responses (user_id,source,respondent_role,industries,needs,confidence,claim_token_hash) values ($1,'School','High school student',ARRAY['Law'],ARRAY['Career readiness'],3,$2) returning id";
    for (const userId of [A, B, DELETED, null])
      await db.query(responseSql, [userId, userId === null ? "a".repeat(64) : null]);
    for (const userId of [A, A, B, DELETED, null])
      await db.query(
        "insert into public.resource_clicks (resource_id,user_id,source_path) values ('test-resource',$1,'/resources')",
        [userId],
      );

    await t.test("RLS is enabled on every protected table", async () => {
      for (const table of [
        "profiles",
        "user_roles",
        "survey_responses",
        "resource_clicks",
        "posts",
        "insight_items",
        "rate_events",
      ]) {
        assert.equal(
          (
            await db.query("select relrowsecurity from pg_class where oid=$1::regclass", [
              "public." + table,
            ])
          ).rows[0].relrowsecurity,
          true,
          table,
        );
      }
      assert.equal(
        (
          await db.query(
            "select relrowsecurity from pg_class where oid='storage.objects'::regclass",
          )
        ).rows[0].relrowsecurity,
        true,
      );
    });
    await t.test(
      "anonymous readers see published content only and no private records",
      async () => {
        assert.deepEqual(
          (await queryAs("anon", null, "select id from public.posts")).rows.map((r) => r.id),
          [PUBLIC_POST],
        );
        assert.deepEqual(
          (await queryAs("anon", null, "select id from public.insight_items")).rows.map(
            (r) => r.id,
          ),
          [PUBLIC_INSIGHT],
        );
        for (const table of [
          "profiles",
          "survey_responses",
          "resource_clicks",
          "user_roles",
          "rate_events",
        ])
          await invisible("anon", null, table);
      },
    );
    await t.test(
      "scheduled and my-journey posts stay hidden until the site would show them",
      async () => {
        const hidden = [];
        for (const [slug, category, interval] of [
          ["scheduled-post", "personal-finance", "7 days"],
          ["journey-post", "my-journey", "-1 day"],
        ])
          hidden.push(
            (
              await db.query(
                `insert into public.posts (slug,title,category,author_name,published,published_at)
                 values ($1,'Hidden post',$2,'Author',true, now() + $3::interval) returning id`,
                [slug, category, interval],
              )
            ).rows[0].id,
          );
        try {
          for (const [role, userId] of [
            ["anon", null],
            ["authenticated", A],
          ]) {
            const ids = (await queryAs(role, userId, "select id from public.posts")).rows.map(
              (r) => r.id,
            );
            assert.deepEqual(ids, [PUBLIC_POST], role);
          }
          const adminIds = (
            await queryAs("authenticated", ADMIN, "select id from public.posts")
          ).rows.map((r) => r.id);
          for (const id of hidden) assert.ok(adminIds.includes(id), "admin sees " + id);
        } finally {
          await db.query("delete from public.posts where id = any($1::uuid[])", [hidden]);
        }
      },
    );
    await t.test(
      "ordinary users see only their own private rows and published content",
      async () => {
        for (const userId of [A, B]) {
          assert.deepEqual(
            (await queryAs("authenticated", userId, "select id from public.profiles")).rows.map(
              (r) => r.id,
            ),
            [userId],
          );
          const answers = (
            await queryAs("authenticated", userId, "select user_id from public.survey_responses")
          ).rows;
          assert.equal(answers.length, 1);
          assert.ok(answers.every((r) => r.user_id === userId));
          const clicks = (
            await queryAs("authenticated", userId, "select user_id from public.resource_clicks")
          ).rows;
          assert.equal(clicks.length, userId === A ? 2 : 1);
          assert.ok(clicks.every((r) => r.user_id === userId));
          assert.deepEqual(
            (await queryAs("authenticated", userId, "select id from public.posts")).rows.map(
              (r) => r.id,
            ),
            [PUBLIC_POST],
          );
          assert.deepEqual(
            (
              await queryAs("authenticated", userId, "select id from public.insight_items")
            ).rows.map((r) => r.id),
            [PUBLIC_INSIGHT],
          );
          await invisible("authenticated", userId, "user_roles");
          await invisible("authenticated", userId, "rate_events");
        }
        const roles = (
          await queryAs("authenticated", ADMIN, "select user_id from public.user_roles")
        ).rows;
        assert.deepEqual(
          roles.map((r) => r.user_id),
          [ADMIN],
        );
      },
    );
    await t.test("only own full_name can be updated by a user", async () => {
      await own("authenticated", A, async () => {
        await db.query("update public.profiles set full_name='New name' where id=$1", [A]);
        assert.equal(
          (await db.query("select full_name from public.profiles where id=$1", [A])).rows[0]
            .full_name,
          "New name",
        );
        const other = await db.query("update public.profiles set full_name='Wrong' where id=$1", [
          B,
        ]);
        assert.equal(other.affectedRows, 0);
      });
      for (const column of [
        "id",
        "age_confirmed",
        "marketing_opt_in",
        "mailchimp_synced_at",
        "mailchimp_survey_tagged",
        "mailchimp_member",
        "mailchimp_synced_choice",
        "marketing_version",
        "mailchimp_resubscribe_pending",
        "mailchimp_lock_until",
        "mailchimp_lock_owner",
        "created_at",
        "updated_at",
      ]) {
        await denied(
          "authenticated",
          A,
          "update public.profiles set " + column + "=" + column + " where id=$1",
          [A],
        );
      }
      await denied("authenticated", A, "insert into public.profiles (id) values ($1)", [A]);
      await denied("authenticated", A, "delete from public.profiles where id=$1", [A], true);
      await denied("anon", null, "insert into public.profiles (id) values ($1)", [A]);
      await denied(
        "anon",
        null,
        "update public.profiles set full_name='Wrong' where id=$1",
        [A],
        true,
      );
      await denied("anon", null, "delete from public.profiles where id=$1", [A], true);
    });
    await t.test(
      "users and anonymous visitors cannot write survey answers or click records",
      async () => {
        for (const [role, userId] of [
          ["anon", null],
          ["authenticated", A],
        ]) {
          await denied(role, userId, responseSql, [A, null]);
          await denied(
            role,
            userId,
            "update public.survey_responses set confidence=4 where user_id=$1",
            [A],
            true,
          );
          await denied(
            role,
            userId,
            "delete from public.survey_responses where user_id=$1",
            [A],
            true,
          );
          await denied(
            role,
            userId,
            "insert into public.resource_clicks (resource_id,user_id) values ('test-resource',$1)",
            [A],
          );
          await denied(
            role,
            userId,
            "update public.resource_clicks set source_path='/changed' where user_id=$1",
            [A],
            true,
          );
          await denied(
            role,
            userId,
            "delete from public.resource_clicks where user_id=$1",
            [A],
            true,
          );
        }
      },
    );
    await t.test("roles and rate-limiter permissions cannot be self-granted", async () => {
      for (const [role, userId] of [
        ["anon", null],
        ["authenticated", A],
      ]) {
        await denied(
          role,
          userId,
          "insert into public.user_roles (user_id,role) values ($1,'admin')",
          [A],
        );
        await denied(role, userId, "update public.user_roles set user_id=$1", [A], true);
        await denied(role, userId, "delete from public.user_roles", [], true);
        await denied(role, userId, "select public.rate_attempt('survey','192.0.2.1',10,60,true)");
        await denied(
          role,
          userId,
          "insert into public.rate_events (kind,ip) values ('survey','192.0.2.1')",
        );
        await denied(role, userId, "update public.rate_events set ip='192.0.2.2'", [], true);
        await denied(role, userId, "delete from public.rate_events", [], true);
      }
      const row = (
        await queryAs(
          "service_role",
          null,
          "select public.rate_attempt('survey','192.0.2.1',10,60,true) as limited",
        )
      ).rows[0];
      assert.equal(typeof row.limited, "boolean");
    });
    await t.test("non-admins cannot write content or call the admin click RPC", async () => {
      for (const [role, userId] of [
        ["anon", null],
        ["authenticated", A],
      ]) {
        await denied(
          role,
          userId,
          "insert into public.posts (slug,title,category,author_name) values ('forbidden','Title','my-journey','Author')",
        );
        await denied(
          role,
          userId,
          "update public.posts set title='Forbidden' where id=$1",
          [PUBLIC_POST],
          true,
        );
        await denied(role, userId, "delete from public.posts where id=$1", [PUBLIC_POST], true);
        await denied(
          role,
          userId,
          "insert into public.insight_items (industry,kind,title,body) values ('law','guide','Title','Body')",
        );
        await denied(
          role,
          userId,
          "update public.insight_items set title='Forbidden' where id=$1",
          [PUBLIC_INSIGHT],
          true,
        );
        await denied(
          role,
          userId,
          "delete from public.insight_items where id=$1",
          [PUBLIC_INSIGHT],
          true,
        );
        await denied(role, userId, "select * from public.admin_click_counts()");
      }
    });
    await t.test("admin can read all private rows and click aggregates", async () => {
      for (const table of ["profiles", "survey_responses", "resource_clicks"]) {
        const expected = (await db.query("select count(*)::int as n from public." + table)).rows[0]
          .n;
        assert.equal(
          (await queryAs("authenticated", ADMIN, "select * from public." + table)).rows.length,
          expected,
          table,
        );
      }
      assert.equal(
        (await queryAs("authenticated", ADMIN, "select * from public.posts")).rows.length,
        2,
      );
      assert.equal(
        (await queryAs("authenticated", ADMIN, "select * from public.insight_items")).rows.length,
        2,
      );
      const rows = (
        await queryAs("authenticated", ADMIN, "select * from public.admin_click_counts()")
      ).rows;
      assert.equal(rows.length, 1);
      assert.equal(rows[0].resource_id, "test-resource");
      assert.equal(Number(rows[0].total_clicks), 5);
      assert.equal(Number(rows[0].signed_in_clicks), 4);
      assert.equal(Number(rows[0].unique_users), 3);
      assert.ok(rows[0].last_click_at);
    });
    await t.test("admin can create, read, update and delete posts and insights", async () => {
      await own("authenticated", ADMIN, async () => {
        const p = (
          await db.query(
            "insert into public.posts (slug,title,category,author_name) values ('admin-created','New post','practical-skills','Author') returning id,published_at",
          )
        ).rows[0];
        assert.equal(p.published_at, null);
        assert.equal(
          (await db.query("select * from public.posts where id=$1", [p.id])).rows.length,
          1,
        );
        await db.query("update public.posts set published=true,title='Changed' where id=$1", [
          p.id,
        ]);
        const published = (await db.query("select * from public.posts where id=$1", [p.id]))
          .rows[0];
        assert.ok(published.published_at);
        assert.equal(published.title, "Changed");
        await db.query("update public.posts set title='Again' where id=$1", [p.id]);
        assert.deepEqual(
          (await db.query("select published_at from public.posts where id=$1", [p.id])).rows[0]
            .published_at,
          published.published_at,
        );
        assert.equal(
          (await db.query("delete from public.posts where id=$1", [p.id])).affectedRows,
          1,
        );
        const item = (
          await db.query(
            "insert into public.insight_items (industry,kind,title,body) values ('economics','guide','New guide','Guide') returning id",
          )
        ).rows[0];
        assert.equal(
          (await db.query("select * from public.insight_items where id=$1", [item.id])).rows.length,
          1,
        );
        await db.query(
          "update public.insight_items set title='Changed guide',published=true where id=$1",
          [item.id],
        );
        assert.equal(
          (await db.query("select title from public.insight_items where id=$1", [item.id])).rows[0]
            .title,
          "Changed guide",
        );
        assert.equal(
          (await db.query("delete from public.insight_items where id=$1", [item.id])).affectedRows,
          1,
        );
      });
    });
    await t.test("timestamps are updated by profile, post and insight triggers", async () => {
      for (const [table, id, column, value] of [
        ["profiles", A, "full_name", "Timestamp name"],
        ["posts", PRIVATE_POST, "title", "Timestamp post"],
        ["insight_items", PRIVATE_INSIGHT, "title", "Timestamp insight"],
      ]) {
        await db.query(
          "update public." + table + " set updated_at='2000-01-01', " + column + "=$1 where id=$2",
          [value, id],
        );
        const at = (await db.query("select updated_at from public." + table + " where id=$1", [id]))
          .rows[0].updated_at;
        assert.ok(new Date(at).getUTCFullYear() > 2000, table);
      }
    });
    await t.test("CHECK constraints reject invalid post fields", async () => {
      const base = {
        slug: "constraint-post",
        title: "Title",
        category: "personal-finance",
        author_name: "Author",
        excerpt: "",
        body: "",
        cover_image_url: null,
        cover_image_alt: "",
        video_url: null,
      };
      const bad = {
        slug: ["Bad", "a--b", "-a", "a-", "a".repeat(101)],
        title: ["", "   ", "a".repeat(161)],
        category: ["other"],
        author_name: ["", "a".repeat(81)],
        excerpt: ["a".repeat(301)],
        body: ["a".repeat(50001)],
        cover_image_alt: ["a".repeat(201)],
        cover_image_url: ["http://example.org", "https://example.org/" + "a".repeat(482)],
        video_url: ["http://example.org", "https://example.org/" + "a".repeat(482)],
      };
      for (const [field, values] of Object.entries(bad))
        for (const value of values) {
          const data = { ...base, [field]: value };
          const keys = Object.keys(data);
          await constraint(
            "insert into public.posts (" +
              keys.join(",") +
              ") values (" +
              keys.map((_, i) => "$" + (i + 1)).join(",") +
              ")",
            Object.values(data),
          );
        }
    });
    await t.test("CHECK constraints reject invalid insight fields", async () => {
      const base = {
        industry: "law",
        kind: "guide",
        title: "Guide",
        summary: "",
        body: "Guide text",
        video_url: null,
        link_url: null,
        file_url: null,
        file_name: null,
        position: 0,
      };
      const bad = {
        industry: ["medicine"],
        kind: ["podcast"],
        title: ["", "a".repeat(161)],
        summary: ["a".repeat(501)],
        body: ["a".repeat(30001)],
        video_url: ["http://example.org"],
        link_url: ["http://example.org"],
        file_url: ["http://example.org", "https://example.org/" + "a".repeat(482)],
        file_name: ["a".repeat(201)],
        position: [-1, 10001],
      };
      for (const [field, values] of Object.entries(bad))
        for (const value of values) {
          const data = { ...base, [field]: value };
          const keys = Object.keys(data);
          await constraint(
            "insert into public.insight_items (" +
              keys.join(",") +
              ") values (" +
              keys.map((_, i) => "$" + (i + 1)).join(",") +
              ")",
            Object.values(data),
          );
        }
    });
    await t.test("CHECK constraints bound surveys, clicks, profiles and rate events", async () => {
      for (const confidence of [0, 6])
        await constraint(
          "insert into public.survey_responses (source,respondent_role,industries,needs,confidence) values ('School','Student',ARRAY['Law'],ARRAY['Career readiness'],$1)",
          [confidence],
        );
      for (const field of ["source", "respondent_role"])
        for (const value of ["", "a".repeat(61)])
          await constraint(
            "insert into public.survey_responses (source,respondent_role,industries,needs,confidence) values (" +
              (field === "source" ? "$1,'Student'" : "'School',$1") +
              ",ARRAY['Law'],ARRAY['Career readiness'],3)",
            [value],
          );
      for (const field of ["industries", "needs"])
        for (const values of [[], Array(13).fill("Law")]) {
          await constraint(
            "insert into public.survey_responses (source,respondent_role,industries,needs,confidence) values ('School','Student'," +
              (field === "industries"
                ? "$1::text[],ARRAY['Career readiness']"
                : "ARRAY['Law'],$1::text[]") +
              ",3)",
            [values],
          );
        }
      for (const hash of ["a".repeat(63), "a".repeat(65), "z".repeat(64)])
        await constraint(responseSql, [null, hash]);
      for (const resource of ["", "Upper", "has space", "a".repeat(81)])
        await constraint("insert into public.resource_clicks (resource_id) values ($1)", [
          resource,
        ]);
      await constraint(
        "insert into public.resource_clicks (resource_id,source_path) values ('test',$1)",
        ["a".repeat(201)],
      );
      await constraint("update public.profiles set full_name=$1 where id=$2", ["a".repeat(121), A]);
      await constraint("insert into public.rate_events (kind,ip) values ('unknown','192.0.2.1')");
      await constraint("insert into public.rate_events (kind,ip) values ('survey',$1)", [
        "a".repeat(101),
      ]);
    });
    await t.test(
      "storage bucket has the agreed limits and only admins can access objects",
      async () => {
        const bucket = (await db.query("select * from storage.buckets where id='content-media'"))
          .rows[0];
        assert.equal(bucket.public, true);
        assert.equal(Number(bucket.file_size_limit), 20 * 1024 * 1024);
        assert.deepEqual(
          [...bucket.allowed_mime_types].sort(),
          ["image/jpeg", "image/png", "image/webp", "application/pdf"].sort(),
        );
        await db.query(
          "insert into storage.buckets (id,name,public) values ('other','other',false)",
        );
        const object = (
          await db.query(
            "insert into storage.objects (bucket_id,name,owner) values ('content-media','test.pdf',$1) returning id",
            [ADMIN],
          )
        ).rows[0].id;
        const outside = (
          await db.query(
            "insert into storage.objects (bucket_id,name,owner) values ('other','private.pdf',$1) returning id",
            [ADMIN],
          )
        ).rows[0].id;
        assert.deepEqual(
          (await queryAs("authenticated", A, "select * from storage.objects")).rows,
          [],
        );
        assert.deepEqual(
          (await queryAs("authenticated", ADMIN, "select id from storage.objects")).rows.map(
            (r) => r.id,
          ),
          [object],
        );
        await denied(
          "authenticated",
          ADMIN,
          "update storage.objects set name='blocked.pdf' where id=$1",
          [outside],
          true,
        );
        await denied(
          "authenticated",
          ADMIN,
          "delete from storage.objects where id=$1",
          [outside],
          true,
        );
        await denied(
          "authenticated",
          A,
          "insert into storage.objects (bucket_id,name,owner) values ('content-media','bad.pdf',$1)",
          [A],
        );
        await denied(
          "authenticated",
          A,
          "update storage.objects set name='bad.pdf' where id=$1",
          [object],
          true,
        );
        await denied("authenticated", A, "delete from storage.objects where id=$1", [object], true);
        await denied(
          "authenticated",
          ADMIN,
          "insert into storage.objects (bucket_id,name,owner) values ('other','bad.pdf',$1)",
          [ADMIN],
        );
        await own("authenticated", ADMIN, async () => {
          assert.equal(
            (await db.query("select * from storage.objects where id=$1", [object])).rows.length,
            1,
          );
          const created = (
            await db.query(
              "insert into storage.objects (bucket_id,name,owner) values ('content-media','admin.pdf',$1) returning id",
              [ADMIN],
            )
          ).rows[0].id;
          assert.equal(
            (await db.query("update storage.objects set name='updated.pdf' where id=$1", [created]))
              .affectedRows,
            1,
          );
          await assert.rejects(
            db.query("update storage.objects set bucket_id='other' where id=$1", [created]),
            (error) => error.code === "42501",
          );
        });
        await own("authenticated", ADMIN, async () => {
          assert.equal(
            (await db.query("delete from storage.objects where id=$1", [object])).affectedRows,
            1,
          );
        });
      },
    );
    await t.test(
      "deleting an auth user cascades private data and leaves anonymous clicks",
      async () => {
        const click = (
          await db.query("select id from public.resource_clicks where user_id=$1", [DELETED])
        ).rows[0].id;
        await db.query("delete from auth.users where id=$1", [DELETED]);
        for (const [table, column] of [
          ["profiles", "id"],
          ["survey_responses", "user_id"],
          ["user_roles", "user_id"],
        ])
          assert.equal(
            (
              await db.query(
                "select count(*)::int as n from public." + table + " where " + column + "=$1",
                [DELETED],
              )
            ).rows[0].n,
            0,
            table,
          );
        const rows = (
          await db.query("select user_id from public.resource_clicks where id=$1", [click])
        ).rows;
        assert.equal(rows.length, 1);
        assert.equal(rows[0].user_id, null);
      },
    );
    await t.test("visitors can't read or write the content-media bucket directly", async () => {
      await db.query(
        "insert into storage.objects (bucket_id,name,owner) values ('content-media','anon-probe.pdf',$1)",
        [ADMIN],
      );
      const seen = await queryAs(
        "anon",
        null,
        "select * from storage.objects where bucket_id='content-media'",
      );
      assert.deepEqual(seen.rows, []);
      await denied(
        "anon",
        null,
        "insert into storage.objects (bucket_id,name) values ('content-media','anon.pdf')",
      );
      await denied(
        "anon",
        null,
        "update storage.objects set name='x.pdf' where bucket_id='content-media'",
        [],
        true,
      );
      await denied(
        "anon",
        null,
        "delete from storage.objects where bucket_id='content-media'",
        [],
        true,
      );
    });
    await t.test(
      "optional marketing metadata never blocks sign-up and only 'true' opts in",
      async () => {
        const cases = [false, "yes", 1, null, "TRUE"];
        for (const [index, value] of cases.entries()) {
          const id = `00000000-0000-4000-8000-0000000001${String(index).padStart(2, "0")}`;
          await signup(id, `optin${index}@example.org`, {
            age_confirmed: true,
            full_name: "Case",
            marketing_opt_in: value,
          });
          const row = (
            await db.query("select marketing_opt_in from public.profiles where id=$1", [id])
          ).rows[0];
          assert.equal(row.marketing_opt_in, false, JSON.stringify(value));
        }
      },
    );
    await t.test("visitors can't call the role helper; signed-in users can", async () => {
      await denied("anon", null, "select public.has_role($1::uuid, 'admin')", [ADMIN]);
      const own = await queryAs(
        "authenticated",
        A,
        "select public.has_role($1::uuid, 'admin') as is_admin",
        [A],
      );
      assert.equal(own.rows[0].is_admin, false);
      await denied("anon", null, "select public.handle_new_user()");
      await denied("authenticated", A, "select public.handle_new_user()");
      const visible = await queryAs(
        "anon",
        null,
        "select count(*)::int as n from public.posts where not published",
      );
      assert.equal(visible.rows[0].n, 0);
    });
    await t.test("one Mailchimp sync per account at a time (lease)", async () => {
      const one = "11111111-1111-4111-8111-111111111111";
      const two = "22222222-2222-4222-8222-222222222222";
      const lock = (owner) =>
        db.query("select public.acquire_mailchimp_lock($1::uuid, $2::uuid, 90) as ok", [A, owner]);
      assert.equal((await lock(one)).rows[0].ok, true);
      assert.equal((await lock(two)).rows[0].ok, false);
      assert.equal((await lock(one)).rows[0].ok, true);
      await db.query("select public.release_mailchimp_lock($1::uuid, $2::uuid)", [A, two]);
      assert.equal((await lock(two)).rows[0].ok, false);
      await db.query("select public.release_mailchimp_lock($1::uuid, $2::uuid)", [A, one]);
      assert.equal((await lock(two)).rows[0].ok, true);
      await db.query("select public.release_mailchimp_lock($1::uuid, $2::uuid)", [A, two]);
      await denied(
        "authenticated",
        A,
        "select public.acquire_mailchimp_lock($1::uuid, $2::uuid, 90)",
        [A, one],
      );
      await denied("anon", null, "select public.release_mailchimp_lock($1::uuid, $2::uuid)", [
        A,
        one,
      ]);
      const optedIn = (
        await db.query(
          "select marketing_opt_in, mailchimp_resubscribe_pending from public.profiles where id=$1",
          [A],
        )
      ).rows[0];
      assert.equal(optedIn.marketing_opt_in, true);
      assert.equal(optedIn.mailchimp_resubscribe_pending, true);
      // No profile at all: null, so a sync stops instead of waiting for a lease.
      assert.equal(
        (
          await db.query("select public.acquire_mailchimp_lock($1::uuid, $2::uuid, 45) as ok", [
            "99999999-9999-4999-8999-999999999999",
            one,
          ])
        ).rows[0].ok,
        null,
      );
      // The holder can renew its own lease.
      assert.equal((await lock(one)).rows[0].ok, true);
      assert.equal((await lock(one)).rows[0].ok, true);
      await db.query("select public.release_mailchimp_lock($1::uuid, $2::uuid)", [A, one]);
    });
    await t.test(
      "a change of email choice bumps the version, so a stale sync can't record itself",
      async () => {
        const before = (
          await db.query("select marketing_version from public.profiles where id=$1", [B])
        ).rows[0].marketing_version;
        await db.query("update public.profiles set marketing_opt_in = true where id=$1", [B]);
        const after = (
          await db.query("select marketing_version from public.profiles where id=$1", [B])
        ).rows[0].marketing_version;
        assert.equal(after, before + 1);
        // Same value again: no bump.
        await db.query("update public.profiles set marketing_opt_in = true where id=$1", [B]);
        assert.equal(
          (await db.query("select marketing_version from public.profiles where id=$1", [B])).rows[0]
            .marketing_version,
          after,
        );
        // A sync that read the old version records nothing.
        const stale = await db.query(
          "update public.profiles set mailchimp_synced_choice = false where id=$1 and marketing_version=$2",
          [B, before],
        );
        assert.equal(stale.affectedRows, 0);
        const fresh = await db.query(
          "update public.profiles set mailchimp_synced_choice = true where id=$1 and marketing_version=$2",
          [B, after],
        );
        assert.equal(fresh.affectedRows, 1);
        await denied("authenticated", B, "select public.bump_marketing_version()");
      },
    );
    await t.test("re-applying the migrations on a populated database keeps every row", async () => {
      const before = (
        await db.query(
          "select (select count(*)::int from public.posts) as posts, (select count(*)::int from public.profiles) as profiles, (select count(*)::int from public.survey_responses) as responses, (select count(*)::int from public.user_roles) as roles, (select row_to_json(b)::text from storage.buckets b where id='content-media') as bucket",
        )
      ).rows[0];
      for (const sql of migrations) await db.exec(sql);
      const after = (
        await db.query(
          "select (select count(*)::int from public.posts) as posts, (select count(*)::int from public.profiles) as profiles, (select count(*)::int from public.survey_responses) as responses, (select count(*)::int from public.user_roles) as roles, (select row_to_json(b)::text from storage.buckets b where id='content-media') as bucket",
        )
      ).rows[0];
      assert.deepEqual(after, before);
    });
  });
}
