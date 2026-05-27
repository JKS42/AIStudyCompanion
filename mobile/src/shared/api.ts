import Constants from "expo-constants";

export function getApiBaseUrl(): string {
  const extra = (Constants.expoConfig?.extra ?? {}) as Record<string, unknown>;
  const url =
    (process.env.EXPO_PUBLIC_API_URL as string | undefined) ??
    (extra.EXPO_PUBLIC_API_URL as string | undefined);

  return url ?? "http://localhost:8787";
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { accessToken: string }
): Promise<T> {
  const { accessToken, ...init } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 50000);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        ...(init.headers ?? {})
      }
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        typeof payload.error === "string" ? payload.error : "Request failed. Try again.";
      throw new Error(message);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out. Check that the backend is running.");
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}
