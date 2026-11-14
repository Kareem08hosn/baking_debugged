// Where to send someone after they sign in. The address comes from the URL
// (?next=/bakes), which anyone can edit, so it must only ever be a page on
// THIS site. Otherwise a link like ?next=https://evil.example would bounce
// people to another website straight after signing in (an "open redirect").

export const NEXT_COOKIE = "bd-next";

// Returns the path if it is a safe local one ("/bakes/12/edit"), or "/".
export function safeNextPath(value) {
  if (typeof value !== "string" || value.length > 300) {
    return "/";
  }
  // Must start with exactly one slash. "//evil.example" and "/\evil.example"
  // are read by browsers as other websites, so both are refused.
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return "/";
  }
  // Coming back to the sign-in page itself would be pointless
  if (value === "/login" || value.startsWith("/login?") || value.startsWith("/auth/")) {
    return "/";
  }
  return value;
}
