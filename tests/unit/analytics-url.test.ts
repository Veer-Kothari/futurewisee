import test from "node:test";
import assert from "node:assert/strict";

import { analyticsUrl, hasAuthTokens } from "../../src/lib/analytics-url.ts";

test("analytics never sees fragments or sign-in parameters", () => {
  const confirm = analyticsUrl(
    "https://futurewisee.lovable.app/account?welcome=1#access_token=abc&refresh_token=def&type=signup",
  );
  assert.equal(confirm.page_location, "https://futurewisee.lovable.app/account?welcome=1");
  assert.equal(confirm.page_path, "/account");
  const pkce = analyticsUrl(
    "https://x.app/reset-password?code=123&token_hash=456&type=recovery&utm_source=a",
  );
  assert.equal(pkce.page_location, "https://x.app/reset-password?utm_source=a");
  const plain = analyticsUrl("https://x.app/blog?category=my-journey");
  assert.equal(plain.page_location, "https://x.app/blog?category=my-journey");
  const mixedCase = analyticsUrl("https://x.app/?Email=a%40b.c&Redirect=%2Fadmin");
  assert.equal(mixedCase.page_location, "https://x.app/");
});

test("auth tokens in the address are detected, in the query or the fragment", () => {
  assert.equal(hasAuthTokens("https://x.app/account#access_token=abc&refresh_token=def"), true);
  assert.equal(hasAuthTokens("https://x.app/#error=access_denied&error_description=expired"), true);
  assert.equal(hasAuthTokens("https://x.app/reset-password?code=1&type=recovery"), true);
  assert.equal(hasAuthTokens("https://x.app/account?code=secret"), true);
  assert.equal(hasAuthTokens("https://x.app/account?token=secret&type=signup"), true);
  assert.equal(hasAuthTokens("https://x.app/account?%61ccess_token=secret"), true);
  assert.equal(hasAuthTokens("https://x.app/account#type=recovery"), true);
  assert.equal(hasAuthTokens("https://x.app/blog?category=personal-finance"), false);
  assert.equal(hasAuthTokens("https://x.app/account?welcome=1"), false);
  assert.equal(hasAuthTokens("not a url"), false);
});
