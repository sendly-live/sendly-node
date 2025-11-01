import { BaseError } from "./base-error";

export class RateLimitError extends BaseError {
  public readonly statusCode: number;
  public readonly retryAfter: number | undefined;

  constructor(message: string, statusCode: number = 429, retryAfter?: number) {
    super(message, "rate_limit_error");
    this.statusCode = statusCode;
    this.retryAfter = retryAfter;
    this.name = "RateLimitError";
  }
}
