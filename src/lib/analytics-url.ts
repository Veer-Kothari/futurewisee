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

/** True while an emailed sign-in or reset link's tokens are still in the address. */
export function hasAuthTokens(hashAndSearch: string): boolean {
  return /(access_token|refresh_token|token_hash|type=recovery|error_description)/i.test(
    hashAndSearch,
  );
}
