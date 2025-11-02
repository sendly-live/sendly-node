export declare const SANDBOX_TEST_NUMBERS: {
    readonly SUCCESS: {
        readonly INSTANT: "+15550001234";
        readonly DELAY_5S: "+15550001235";
        readonly VERIZON_CARRIER: "+15550001236";
    };
    readonly ERRORS: {
        readonly INVALID_NUMBER: "+15550001001";
        readonly CARRIER_REJECTION: "+15550001002";
        readonly RATE_LIMIT: "+15550001003";
        readonly TIMEOUT: "+15550001004";
        readonly INSUFFICIENT_BALANCE: "+15550001005";
    };
    readonly DELAYS: {
        readonly SECONDS_10: "+15550001010";
        readonly SECONDS_30: "+15550001030";
        readonly SECONDS_60: "+15550001060";
    };
    readonly CARRIERS: {
        readonly VERIZON: "+15550002001";
        readonly ATT: "+15550002002";
        readonly TMOBILE: "+15550002003";
    };
    readonly WEBHOOKS: {
        readonly SUCCESS: "+15550003001";
        readonly TIMEOUT: "+15550003002";
        readonly ERROR_500: "+15550003003";
    };
};
export type TestNumber = typeof SANDBOX_TEST_NUMBERS[keyof typeof SANDBOX_TEST_NUMBERS][keyof typeof SANDBOX_TEST_NUMBERS[keyof typeof SANDBOX_TEST_NUMBERS]];
export interface TestNumberInfo {
    number: string;
    category: 'success' | 'error' | 'delay' | 'carrier' | 'webhook';
    description: string;
    httpStatus?: number;
    delay?: number;
    error?: string;
}
export declare const TEST_NUMBER_INFO: Record<string, TestNumberInfo>;
export declare function isTestNumber(phoneNumber: string): boolean;
export declare function getTestNumberInfo(phoneNumber: string): TestNumberInfo | undefined;
export declare function getTestNumbersByCategory(category: TestNumberInfo['category']): string[];
export declare function getErrorTestNumbers(): string[];
export declare function getSuccessTestNumbers(): string[];
//# sourceMappingURL=test-numbers.d.ts.map