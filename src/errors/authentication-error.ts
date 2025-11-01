import { BaseError } from './base-error';

export class AuthenticationError extends BaseError {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 401) {
    super(message, 'authentication_error');
    this.statusCode = statusCode;
    this.name = 'AuthenticationError';
  }
}
