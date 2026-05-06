import { ApiError, apiRequest } from "@/lib/api";

type RefreshSession = () => Promise<string | null>;

export async function requestWithAuth(
  accessToken: string,
  refreshSession: RefreshSession,
  path: string,
  init: RequestInit = {},
  retry = true,
) {
  try {
    return await apiRequest(path, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        ...(init.headers ?? {}),
      },
    });
  } catch (error) {
    if (retry && error instanceof ApiError && error.status === 401) {
      const nextAccessToken = await refreshSession();

      if (nextAccessToken) {
        return apiRequest(path, {
          ...init,
          headers: {
            Authorization: `Bearer ${nextAccessToken}`,
            ...(init.headers ?? {}),
          },
        });
      }
    }

    throw error;
  }
}
