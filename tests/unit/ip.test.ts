import test from "node:test";
import assert from "node:assert/strict";

import { rateLimitAddress } from "../../src/lib/ip.ts";

test("IPv4 and IPv4-mapped addresses are counted as they are", () => {
  assert.equal(rateLimitAddress("203.0.113.7"), "203.0.113.7");
  assert.equal(rateLimitAddress(" 203.0.113.7 "), "203.0.113.7");
  assert.equal(rateLimitAddress("::ffff:198.51.100.2"), "198.51.100.2");
});

test("IPv6 addresses are counted per /64 network", () => {
  assert.equal(rateLimitAddress("2001:db8:abcd:12:1:2:3:4"), "2001:db8:abcd:12::/64");
  assert.equal(rateLimitAddress("2001:db8:abcd:12:ffff:ffff:ffff:ffff"), "2001:db8:abcd:12::/64");
  assert.equal(rateLimitAddress("2001:db8::1"), "2001:db8:0:0::/64");
  assert.equal(rateLimitAddress("[2001:0DB8:0000:0042::8a2e:370:7334]"), "2001:db8:0:42::/64");
  assert.equal(rateLimitAddress("fe80::1%eth0"), "fe80:0:0:0::/64");
});

test("missing or odd values never throw", () => {
  assert.equal(rateLimitAddress(""), "unknown");
  assert.equal(rateLimitAddress("unknown"), "unknown");
  assert.ok(rateLimitAddress("x".repeat(300)).length <= 100);
});
