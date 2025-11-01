export class BaseError extends Error {
  public readonly type: string;
  
  constructor(message: string, type: string) {
    super(message);
    this.type = type;
    this.name = 'BaseError';
  }
}