import { SMS } from './resources/sms';
export interface SendlyClientOptions {
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
}
export declare class SendlyClient {
    private readonly apiKey;
    private readonly baseUrl;
    private readonly timeout;
    private readonly httpClient;
    readonly sms: SMS;
    constructor(options?: SendlyClientOptions);
    private isValidApiKey;
}
//# sourceMappingURL=client.d.ts.map