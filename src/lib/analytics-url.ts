/** Query parameters that can carry sign-in secrets or personal data: never sent to Google. */
const PRIVATE_PARAMS = new Set([
  "code",
  "token",
  "token_hash",
  "access_token",
  "refresh_token",
  "type",
  "error",
  "error_code",
  "error_description",
  "email",
  "redirect",
]);

/**
 * The page address Google Analytics may see: no #fragment (emailed sign-in
 * and reset links put tokens there) and none of the private parameters above.
 */
export function analyticsUrl(href: string): { page_location: string; page_path: string } {
  const url = new URL(href);
  url.hash = "";
  for (const key of [...url.searchParams.keys()]) {
    if (PRIVATE_PARAMS.has(key.toLowerCase())) url.searchParams.delete(key);
  }
  return { page_location: url.toString(), page_path: url.pathname };
}

/** Parameter names that only ever carry sign-in secrets on this site. */
const TOKEN_PARAMS = new Set(["code", "token", "token_hash", "access_token", "refresh_token"]);

/**
 * True while an emailed sign-in or reset link's credentials are still in the
 * address — in the query or in the #fragment, whatever the order or encoding
 * of the parameter names.
 */
export function hasAuthTokens(href: string): boolean {
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return false;
  }
  const params = [
    ...url.searchParams.entries(),
    ...new URLSearchParams(url.hash.replace(/^#/, "")).entries(),
  ];
  return params.some(
    ([key, value]) =>
      (TOKEN_PARAMS.has(key.toLowerCase()) && value !== "") ||
      key.toLowerCase() === "error_description" ||
      (key.toLowerCase() === "type" && value.toLowerCase() === "recovery"),
  );
}
