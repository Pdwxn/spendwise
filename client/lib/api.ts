const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

function getErrorMessage(data: unknown) {
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;

    if (typeof record.detail === "string") {
      return record.detail;
    }

    if (Array.isArray(record.non_field_errors) && record.non_field_errors.length > 0) {
      const first = record.non_field_errors[0];
      if (typeof first === "string") {
        return first;
      }
    }

    const firstField = Object.values(record).find((value) => Array.isArray(value) && value.length > 0);
    if (Array.isArray(firstField) && typeof firstField[0] === "string") {
      return firstField[0];
    }
  }

  return "Request failed.";
}

export function buildApiUrl(path: string) {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export async function apiRequest(path: string, init: RequestInit = {}) {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data), response.status, data);
  }

  return data;
}
