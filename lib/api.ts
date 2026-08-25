import { clearSession, getToken } from "./session";

export type ApiErrorBody = {
  statusCode?: number;
  timestamp?: string;
  path?: string;
  message?: string | string[];
  error?: string;
};

export class ApiError extends Error {
  status: number;
  error: string;
  messages: string[];

  constructor(
    status: number,
    message: string,
    error: string,
    messages: string[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.error = error;
    this.messages = messages;
  }
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "";

export async function api<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? getToken()
      : null;

  const headers = new Headers(init?.headers);

  if (!headers.has("Content-Type") && init?.body) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`,
    );
  }

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...init,
      headers,
    },
  );

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    let body: ApiErrorBody = {};

    try {
      body = await response.json();
    } catch {
      // Response did not contain JSON.
    }

    const rawMessages = body.message;

    const messages = Array.isArray(rawMessages)
      ? rawMessages
      : rawMessages
        ? [rawMessages]
        : [];

    const message =
      messages[0] ??
      body.error ??
      "Something went wrong";

    const apiError = new ApiError(
      response.status,
      message,
      body.error ?? "Error",
      messages,
    );

    /*
     * Central 401 handling.
     *
     * Login itself is allowed to return 401 so that
     * the login page can display the incorrect
     * credentials message.
     */
    if (
      response.status === 401 &&
      path !== "/auth/login"
    ) {
      clearSession();

      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }

    throw apiError;
  }

  return response.json() as Promise<T>;
}