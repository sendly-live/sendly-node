import { ApiError } from '../../../src/errors/api-error';

describe('ApiError', () => {
  it('should create ApiError with message and status code', () => {
    const error = new ApiError('HTTP 404: Not Found', 404);
    
    expect(error.message).toBe('HTTP 404: Not Found');
    expect(error.statusCode).toBe(404);
    expect(error.type).toBe('api_error');
    expect(error.name).toBe('ApiError');
  });

  it('should extend base Error class', () => {
    const error = new ApiError('Test error', 500);
    
    expect(error).toBeInstanceOf(Error);
    expect(error.stack).toBeDefined();
  });
});