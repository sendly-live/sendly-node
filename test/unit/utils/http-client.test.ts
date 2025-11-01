import { HttpClient } from "../../../src/utils/http-client";
import { ApiError } from "../../../src/errors/api-error";
import { RateLimitError } from "../../../src/errors/rate-limit-error";
import { AuthenticationError } from "../../../src/errors/authentication-error";
import fetch from "node-fetch";

// Mock fetch
jest.mock("node-fetch");
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe("HttpClient", () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({
      baseUrl: "https://api.sendly.live",
      apiKey: "sl_test_1234567890123456789012345678901234567890",
      timeout: 30000,
    });
    mockFetch.mockClear();
  });

  describe("post method", () => {
    it("should make successful POST request", async () => {
      const mockResponse = { id: "test", status: "success" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await httpClient.post("/test", { data: "test" });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith("https://api.sendly.live/test", {
        method: "POST",
        headers: {
          Authorization:
            "Bearer sl_test_1234567890123456789012345678901234567890",
          "Content-Type": "application/json",
          "User-Agent": "@sendly/node@0.1.0",
        },
        body: JSON.stringify({ data: "test" }),
      });
    });

    it("should throw ApiError on HTTP error response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
      } as any);

      await expect(httpClient.post("/test", { data: "test" })).rejects.toThrow(
        ApiError,
      );

      // Reset mock for second call with proper JSON response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({
          error: "not_found",
          message: "Resource not found",
        }),
      } as any);

      await expect(httpClient.post("/test", { data: "test" })).rejects.toThrow(
        "Resource not found",
      );
    });
  });

  describe("retry logic", () => {
    let mockSleep: jest.SpiedFunction<any>;

    beforeEach(() => {
      // Mock the sleep method directly on the HttpClient prototype
      mockSleep = jest
        .spyOn(HttpClient.prototype as any, "sleep")
        .mockResolvedValue(undefined);
    });

    afterEach(() => {
      mockSleep.mockRestore();
    });

    it("should retry on 429 rate limit and succeed", async () => {
      const rateLimitResponse = {
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        json: async () => ({
          error: "rate_limit_exceeded",
          message: "Too many requests. Please retry after 1 seconds.",
          retry_after: 1,
        }),
      };

      const successResponse = {
        ok: true,
        status: 200,
        json: async () => ({ id: "retry_success", status: "queued" }),
      };

      mockFetch
        .mockResolvedValueOnce(rateLimitResponse as any)
        .mockResolvedValueOnce(successResponse as any);

      const result = await httpClient.post("/test", { data: "test" });

      expect(result).toEqual({ id: "retry_success", status: "queued" });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should retry with exponential backoff", async () => {
      const rateLimitResponse = {
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        json: async () => ({
          error: "rate_limit_exceeded",
          message: "Rate limit exceeded",
          retry_after: null,
        }),
      };

      const successResponse = {
        ok: true,
        status: 200,
        json: async () => ({ id: "backoff_success", status: "queued" }),
      };

      mockFetch
        .mockResolvedValueOnce(rateLimitResponse as any)
        .mockResolvedValueOnce(rateLimitResponse as any)
        .mockResolvedValueOnce(successResponse as any);

      const result = await httpClient.post("/test", { data: "test" });

      expect(result).toEqual({ id: "backoff_success", status: "queued" });
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should fail after max retries exceeded", async () => {
      const rateLimitResponse = {
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        json: async () => ({
          error: "rate_limit_exceeded",
          message: "Rate limit exceeded",
        }),
      };

      mockFetch.mockResolvedValue(rateLimitResponse as any);

      try {
        await httpClient.post("/test", { data: "test" });
        fail("Expected RateLimitError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        expect((error as RateLimitError).message).toBe(
          "Max retry attempts exceeded",
        );
      }

      expect(mockFetch).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it("should not retry on non-retryable errors", async () => {
      const unauthorizedResponse = {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({
          error: "invalid_api_key",
          message: "Invalid API key provided",
        }),
      };

      mockFetch.mockResolvedValueOnce(unauthorizedResponse as any);

      await expect(httpClient.post("/test", { data: "test" })).rejects.toThrow(
        AuthenticationError,
      );

      expect(mockFetch).toHaveBeenCalledTimes(1); // No retries
    });

    it("should retry on 500 internal server errors", async () => {
      const serverErrorResponse = {
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => ({
          error: "internal_error",
          message: "Something went wrong",
        }),
      };

      const successResponse = {
        ok: true,
        status: 200,
        json: async () => ({ id: "server_error_retry", status: "queued" }),
      };

      mockFetch
        .mockResolvedValueOnce(serverErrorResponse as any)
        .mockResolvedValueOnce(successResponse as any);

      const result = await httpClient.post("/test", { data: "test" });

      expect(result).toEqual({ id: "server_error_retry", status: "queued" });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("get method", () => {
    beforeEach(() => {
      mockFetch.mockClear();
    });

    it("should make successful GET request without query parameters", async () => {
      const mockResponse = { data: "test", total: 100 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await httpClient.get("/messages");

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.sendly.live/messages",
        {
          method: "GET",
          headers: {
            Authorization:
              "Bearer sl_test_1234567890123456789012345678901234567890",
            "Content-Type": "application/json",
            "User-Agent": "@sendly/node@0.1.0",
          },
        },
      );
    });

    it("should make successful GET request with query parameters", async () => {
      const mockResponse = { messages: [], page: 1, limit: 10 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await httpClient.get("/messages", {
        page: 1,
        limit: 10,
        status: "sent",
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.sendly.live/messages?page=1&limit=10&status=sent",
        {
          method: "GET",
          headers: {
            Authorization:
              "Bearer sl_test_1234567890123456789012345678901234567890",
            "Content-Type": "application/json",
            "User-Agent": "@sendly/node@0.1.0",
          },
        },
      );
    });

    it("should handle array query parameters", async () => {
      const mockResponse = { messages: [] };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await httpClient.get("/messages", {
        tags: ["marketing", "campaign"],
        status: "sent",
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.sendly.live/messages?tags=marketing&tags=campaign&status=sent",
        {
          method: "GET",
          headers: {
            Authorization:
              "Bearer sl_test_1234567890123456789012345678901234567890",
            "Content-Type": "application/json",
            "User-Agent": "@sendly/node@0.1.0",
          },
        },
      );
    });

    it("should handle undefined and null query parameters", async () => {
      const mockResponse = { data: "test" };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as any);

      const result = await httpClient.get("/messages", {
        page: 1,
        filter: undefined,
        sort: null,
        limit: 10,
      });

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.sendly.live/messages?page=1&limit=10",
        {
          method: "GET",
          headers: {
            Authorization:
              "Bearer sl_test_1234567890123456789012345678901234567890",
            "Content-Type": "application/json",
            "User-Agent": "@sendly/node@0.1.0",
          },
        },
      );
    });

    it("should throw ApiError on HTTP error response", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        json: async () => ({
          error: "not_found",
          message: "Resource not found",
        }),
      } as any);

      await expect(httpClient.get("/invalid-endpoint")).rejects.toThrow(
        ApiError,
      );

      await expect(httpClient.get("/invalid-endpoint")).rejects.toThrow(
        "Resource not found",
      );
    });

    it("should retry GET requests on retryable errors", async () => {
      const rateLimitResponse = {
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        json: async () => ({
          error: "rate_limit_exceeded",
          message: "Rate limit exceeded",
        }),
      };

      const successResponse = {
        ok: true,
        status: 200,
        json: async () => ({ data: "retry_success" }),
      };

      mockFetch
        .mockResolvedValueOnce(rateLimitResponse as any)
        .mockResolvedValueOnce(successResponse as any);

      const result = await httpClient.get("/stats");

      expect(result).toEqual({ data: "retry_success" });
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should not retry GET requests on non-retryable errors", async () => {
      const unauthorizedResponse = {
        ok: false,
        status: 401,
        statusText: "Unauthorized",
        json: async () => ({
          error: "invalid_api_key",
          message: "Invalid API key provided",
        }),
      };

      mockFetch.mockResolvedValueOnce(unauthorizedResponse as any);

      await expect(httpClient.get("/messages")).rejects.toThrow(
        AuthenticationError,
      );

      expect(mockFetch).toHaveBeenCalledTimes(1); // No retries
    });
  });
});
