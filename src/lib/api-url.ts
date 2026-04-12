/**
 * Get the API base URL.
 * Uses NEXT_PUBLIC_API_URL in all environments (with localhost fallback).
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
}
