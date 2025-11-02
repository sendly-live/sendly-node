export interface HttpClientOptions {
    baseUrl: string;
    apiKey: string;
    timeout: number;
}
export declare class HttpClient {
    private options;
    private readonly maxRetries;
    private readonly baseDelay;
    constructor(options: HttpClientOptions);
    post<T>(endpoint: string, data: any): Promise<T>;
    get<T>(endpoint: string, queryParams?: Record<string, any>): Promise<T>;
    private makeRequest;
    private isRetryableError;
    private calculateDelay;
    private sleep;
}
//# sourceMappingURL=http-client.d.ts.map