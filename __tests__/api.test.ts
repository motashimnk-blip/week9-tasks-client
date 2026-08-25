import { api, ApiError } from "@/lib/api";

describe("api wrapper", () => {
  beforeEach(() => {
    localStorage.clear();

    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("adds the Authorization header when a token exists", async () => {
    localStorage.setItem(
      "week9_token",
      "test-token",
    );

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await api("/tasks");

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/tasks"),
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );

    const options =
      (global.fetch as jest.Mock).mock
        .calls[0][1];

    const headers =
      options.headers as Headers;

    expect(
      headers.get("Authorization"),
    ).toBe("Bearer test-token");
  });

  it("does not add Authorization when there is no token", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    await api("/tasks");

    const options =
      (global.fetch as jest.Mock).mock
        .calls[0][1];

    const headers =
      options.headers as Headers;

    expect(
      headers.get("Authorization"),
    ).toBeNull();
  });

  it("handles 204 responses", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      status: 204,
    });

    const result =
      await api<void>("/tasks/1");

    expect(result).toBeUndefined();
  });

  it("throws ApiError for failed responses", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        statusCode: 400,
        message: "Invalid request",
        error: "Bad Request",
      }),
    });

    await expect(
      api("/tasks"),
    ).rejects.toBeInstanceOf(ApiError);
  });
});