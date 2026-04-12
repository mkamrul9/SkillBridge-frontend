/**
 * Get the API base URL.
 * Browser requests should use same-origin (/api via Next rewrites) so auth
 * cookies are sent consistently. Server-side calls can use backend URL.
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}
