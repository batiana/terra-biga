let csrfTokenCache: string | null = null;

export async function getCsrfToken(): Promise<string> {
  if (csrfTokenCache) return csrfTokenCache;

  const response = await fetch("/api/csrf-token", {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("CSRF_TOKEN_FETCH_FAILED");
  }

  const data = (await response.json()) as { csrfToken?: string };
  if (!data.csrfToken) {
    throw new Error("CSRF_TOKEN_MISSING");
  }

  csrfTokenCache = data.csrfToken;
  return csrfTokenCache;
}

export function clearCsrfTokenCache(): void {
  csrfTokenCache = null;
}
