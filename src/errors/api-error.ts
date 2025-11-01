import { BaseError } from './base-error';

export class ApiError extends BaseError {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message, 'api_error');
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}