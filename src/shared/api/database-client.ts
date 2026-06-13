export type DatabaseValue = string | number | boolean | null;

export type DatabaseQuery = Record<
  string,
  DatabaseValue | DatabaseValue[] | undefined
>;

export type DatabaseMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export interface DatabaseClientOptions {
  baseUrl?: string;
  token?: string;
  headers?: HeadersInit;
}

export interface DatabaseRequestOptions<TBody = unknown> {
  method?: DatabaseMethod;
  query?: DatabaseQuery;
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
}

export class DatabaseRequestError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.name = "DatabaseRequestError";
    this.status = status;
    this.payload = payload;
  }
}

function createUrl(baseUrl: string, path: string, query?: DatabaseQuery) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${normalizedBaseUrl}${normalizedPath}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item !== null) {
          url.searchParams.append(key, String(item));
        }
      });
      return;
    }

    if (value !== null) {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

function readDatabaseEnv() {
  return {
    baseUrl: import.meta.env.VITE_DATABASE_URL as string | undefined,
    token: import.meta.env.VITE_DATABASE_TOKEN as string | undefined,
  };
}

export function createDatabaseClient(options: DatabaseClientOptions = {}) {
  const env = readDatabaseEnv();
  const baseUrl = options.baseUrl ?? env.baseUrl;
  const token = options.token ?? env.token;

  async function request<TResponse, TBody = unknown>(
    path: string,
    requestOptions: DatabaseRequestOptions<TBody> = {},
  ) {
    if (!baseUrl) {
      throw new DatabaseRequestError(
        0,
        "VITE_DATABASE_URL is not configured.",
        null,
      );
    }

    const method = requestOptions.method ?? "GET";
    const headers = new Headers(options.headers);

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    new Headers(requestOptions.headers).forEach((value, key) => {
      headers.set(key, value);
    });

    const init: RequestInit = {
      method,
      headers,
      signal: requestOptions.signal,
    };

    if (requestOptions.body !== undefined) {
      headers.set("Content-Type", "application/json");
      init.body = JSON.stringify(requestOptions.body);
    }

    const response = await fetch(createUrl(baseUrl, path, requestOptions.query), init);
    const contentType = response.headers.get("content-type") ?? "";
    const payload =
      response.status === 204
        ? null
        : contentType.includes("application/json")
          ? await response.json()
          : await response.text();

    if (!response.ok) {
      throw new DatabaseRequestError(
        response.status,
        `Database request failed with status ${response.status}.`,
        payload,
      );
    }

    return payload as TResponse;
  }

  return {
    request,
    select: <TResponse>(table: string, query?: DatabaseQuery) =>
      request<TResponse[]>(`/${table}`, { query }),
    insert: <TResponse, TBody = Partial<TResponse>>(table: string, body: TBody) =>
      request<TResponse, TBody>(`/${table}`, { method: "POST", body }),
    update: <TResponse, TBody = Partial<TResponse>>(
      table: string,
      id: string | number,
      body: TBody,
    ) => request<TResponse, TBody>(`/${table}/${id}`, { method: "PATCH", body }),
    remove: <TResponse>(table: string, id: string | number) =>
      request<TResponse>(`/${table}/${id}`, { method: "DELETE" }),
  };
}

export const databaseClient = createDatabaseClient();
