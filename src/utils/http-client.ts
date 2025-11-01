import fetch from "node-fetch";
import { ApiError } from "../errors/api-error";
import { RateLimitError } from "../errors/rate-limit-error";
import { AuthenticationError } from "../errors/authentication-error";

export interface HttpClientOptions {
  baseUrl: string;
  apiKey: string;
  timeout: number;
}

export class HttpClient {
  private readonly maxRetries = 3;
  private readonly baseDelay = 1000; // 1 second

  constructor(private options: HttpClientOptions) {}

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.makeRequest<T>("POST", endpoint, data);
  }

  async get<T>(
    endpoint: string,
    queryParams?: Record<string, any>,
  ): Promise<T> {
    let url = endpoint;

    // Build query string if params provided
    if (queryParams) {
      const searchParams = new URLSearchParams();

      for (const [key, value] of Object.entries(queryParams)) {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle array parameters (e.g., tags=[tag1, tag2])
            value.forEach((item) => searchParams.append(key, String(item)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      }

      const queryString = searchParams.toString();
      if (queryString) {
        url += "?" + queryString;
      }
    }

    return this.makeRequest<T>("GET", url);
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
  ): Promise<T> {
    const url = `${this.options.baseUrl}${endpoint}`;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${this.options.apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": "@sendly/node@0.1.0",
          },
          body: data ? JSON.stringify(data) : undefined,
        });

        if (response.ok) {
          return response.json() as T;
        }

        // Parse error response
        let errorData: any;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: "unknown", message: response.statusText };
        }

        // Check if this is a retryable error
        if (
          this.isRetryableError(response.status) &&
          attempt < this.maxRetries
        ) {
          const delay = this.calculateDelay(attempt, errorData.retry_after);
          await this.sleep(delay);
          continue;
        }

        // Final attempt or non-retryable error
        if (response.status === 429) {
          throw new RateLimitError(
            attempt >= this.maxRetries
              ? "Max retry attempts exceeded"
              : errorData.message || "Rate limit exceeded",
            response.status,
            errorData.retry_after,
          );
        } else if (response.status === 401 || response.status === 403) {
          throw new AuthenticationError(
            errorData.message || "Authentication failed",
            response.status,
          );
        } else {
          throw new ApiError(
            errorData.message ||
              `HTTP ${response.status}: ${response.statusText}`,
            response.status,
          );
        }
      } catch (error) {
        // If it's our custom error, re-throw it
        if (
          error instanceof RateLimitError ||
          error instanceof ApiError ||
          error instanceof AuthenticationError
        ) {
          throw error;
        }

        // For network errors, retry if we haven't exceeded max attempts
        if (attempt < this.maxRetries) {
          const delay = this.calculateDelay(attempt);
          await this.sleep(delay);
          continue;
        }

        throw error;
      }
    }

    // This should never be reached, but just in case
    throw new RateLimitError("Max retry attempts exceeded", 429);
  }

  private isRetryableError(statusCode: number): boolean {
    // Retry on rate limits (429) and server errors (5xx)
    return statusCode === 429 || (statusCode >= 500 && statusCode < 600);
  }

  private calculateDelay(attempt: number, retryAfter?: number): number {
    if (retryAfter) {
      return retryAfter * 1000; // Convert seconds to milliseconds
    }

    // Exponential backoff: 1s, 2s, 4s
    return this.baseDelay * Math.pow(2, attempt);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
