import { ValidationError } from './errors';
import { SMS } from './resources/sms';
import { HttpClient } from './utils/http-client';

export interface SendlyClientOptions {
  apiKey?: string;
  baseUrl?: string;
  timeout?: number;
}

export class SendlyClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;
  private readonly httpClient: HttpClient;

  public readonly sms: SMS;

  constructor(options: SendlyClientOptions = {}) {
    if (options.apiKey === undefined || options.apiKey === null) {
      throw new ValidationError('API key is required');
    }

    if (!this.isValidApiKey(options.apiKey)) {
      throw new ValidationError('Invalid API key format. Expected: sl_test_*** or sl_live_***');
    }

    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl || 'https://sendly.live/api';
    this.timeout = options.timeout || 30000;

    this.httpClient = new HttpClient({
      baseUrl: this.baseUrl,
      apiKey: this.apiKey,
      timeout: this.timeout
    });

    this.sms = new SMS(this.httpClient);
  }

  private isValidApiKey(key: string): boolean {
    // Support API keys with hyphens, underscores, and alphanumeric characters
    // Format: sl_test_*** or sl_live_***
    const apiKeyRegex = /^sl_(test|live)_[a-zA-Z0-9_-]{24,50}$/;
    return apiKeyRegex.test(key);
  }
}
