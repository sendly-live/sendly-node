/**
 * Sendly Sandbox Test Numbers
 *
 * These phone numbers provide predictable behaviors for testing
 * with test API keys (sl_test_*). Use these constants to ensure
 * consistent testing across your application.
 */

/**
 * Test numbers organized by category
 */
export const SANDBOX_TEST_NUMBERS = {
  /**
   * Success scenarios - Messages that will be delivered successfully
   */
  SUCCESS: {
    /** Instant delivery success */
    INSTANT: '+15550001234' as const,
    /** Success with 5 second delay */
    DELAY_5S: '+15550001235' as const,
    /** Success with Verizon carrier simulation */
    VERIZON_CARRIER: '+15550001236' as const,
  },

  /**
   * Error scenarios - Messages that will fail with specific errors
   */
  ERRORS: {
    /** Invalid phone number format (400) */
    INVALID_NUMBER: '+15550001001' as const,
    /** Carrier content rejection (400) */
    CARRIER_REJECTION: '+15550001002' as const,
    /** Rate limit exceeded (429) */
    RATE_LIMIT: '+15550001003' as const,
    /** Request timeout (500) */
    TIMEOUT: '+15550001004' as const,
    /** Insufficient account balance (402) */
    INSUFFICIENT_BALANCE: '+15550001005' as const,
  },

  /**
   * Delay testing - Messages with various delivery delays
   */
  DELAYS: {
    /** 10 second delivery delay */
    SECONDS_10: '+15550001010' as const,
    /** 30 second delivery delay */
    SECONDS_30: '+15550001030' as const,
    /** 60 second delivery delay */
    SECONDS_60: '+15550001060' as const,
  },

  /**
   * Carrier simulations - Test carrier-specific behaviors
   */
  CARRIERS: {
    /** Verizon network behavior */
    VERIZON: '+15550002001' as const,
    /** AT&T network behavior */
    ATT: '+15550002002' as const,
    /** T-Mobile network behavior */
    TMOBILE: '+15550002003' as const,
  },

  /**
   * Webhook testing - Test webhook delivery scenarios
   */
  WEBHOOKS: {
    /** Successful webhook delivery */
    SUCCESS: '+15550003001' as const,
    /** Webhook timeout simulation */
    TIMEOUT: '+15550003002' as const,
    /** Webhook 500 error with retry */
    ERROR_500: '+15550003003' as const,
  }
} as const;

/**
 * Type representing any test number
 */
export type TestNumber = typeof SANDBOX_TEST_NUMBERS[keyof typeof SANDBOX_TEST_NUMBERS][keyof typeof SANDBOX_TEST_NUMBERS[keyof typeof SANDBOX_TEST_NUMBERS]];

/**
 * Test number metadata for documentation
 */
export interface TestNumberInfo {
  number: string;
  category: 'success' | 'error' | 'delay' | 'carrier' | 'webhook';
  description: string;
  httpStatus?: number;
  delay?: number;
  error?: string;
}

/**
 * Complete test number documentation
 */
export const TEST_NUMBER_INFO: Record<string, TestNumberInfo> = {
  // Success scenarios
  '+15550001234': {
    number: '+15550001234',
    category: 'success',
    description: 'Instant delivery success'
  },
  '+15550001235': {
    number: '+15550001235',
    category: 'success',
    description: 'Success with 5 second delay',
    delay: 5000
  },
  '+15550001236': {
    number: '+15550001236',
    category: 'success',
    description: 'Verizon carrier simulation'
  },

  // Error scenarios
  '+15550001001': {
    number: '+15550001001',
    category: 'error',
    description: 'Invalid phone number format',
    httpStatus: 400,
    error: 'invalid_number'
  },
  '+15550001002': {
    number: '+15550001002',
    category: 'error',
    description: 'Carrier content rejection',
    httpStatus: 400,
    error: 'carrier_rejection'
  },
  '+15550001003': {
    number: '+15550001003',
    category: 'error',
    description: 'Rate limit exceeded',
    httpStatus: 429,
    error: 'rate_limit_exceeded'
  },
  '+15550001004': {
    number: '+15550001004',
    category: 'error',
    description: 'Request timeout',
    httpStatus: 500,
    error: 'timeout_error'
  },
  '+15550001005': {
    number: '+15550001005',
    category: 'error',
    description: 'Insufficient account balance',
    httpStatus: 402,
    error: 'insufficient_balance'
  },

  // Delay scenarios
  '+15550001010': {
    number: '+15550001010',
    category: 'delay',
    description: '10 second delivery delay',
    delay: 10000
  },
  '+15550001030': {
    number: '+15550001030',
    category: 'delay',
    description: '30 second delivery delay',
    delay: 30000
  },
  '+15550001060': {
    number: '+15550001060',
    category: 'delay',
    description: '60 second delivery delay',
    delay: 60000
  },

  // Carrier scenarios
  '+15550002001': {
    number: '+15550002001',
    category: 'carrier',
    description: 'Verizon network simulation'
  },
  '+15550002002': {
    number: '+15550002002',
    category: 'carrier',
    description: 'AT&T network simulation'
  },
  '+15550002003': {
    number: '+15550002003',
    category: 'carrier',
    description: 'T-Mobile network simulation'
  },

  // Webhook scenarios
  '+15550003001': {
    number: '+15550003001',
    category: 'webhook',
    description: 'Successful webhook delivery'
  },
  '+15550003002': {
    number: '+15550003002',
    category: 'webhook',
    description: 'Webhook timeout simulation'
  },
  '+15550003003': {
    number: '+15550003003',
    category: 'webhook',
    description: 'Webhook 500 error with retry'
  }
};

/**
 * Check if a phone number is a test number
 * @param phoneNumber - The phone number to check
 * @returns true if the number is a test number, false otherwise
 */
export function isTestNumber(phoneNumber: string): boolean {
  return phoneNumber in TEST_NUMBER_INFO;
}

/**
 * Get test number information
 * @param phoneNumber - The test number to get info for
 * @returns Test number information or undefined if not found
 */
export function getTestNumberInfo(phoneNumber: string): TestNumberInfo | undefined {
  return TEST_NUMBER_INFO[phoneNumber];
}

/**
 * Get all test numbers by category
 * @param category - The category to filter by
 * @returns Array of test numbers in the specified category
 */
export function getTestNumbersByCategory(category: TestNumberInfo['category']): string[] {
  return Object.values(TEST_NUMBER_INFO)
    .filter(info => info.category === category)
    .map(info => info.number);
}

/**
 * Get all test numbers that produce errors
 * @returns Array of error-producing test numbers
 */
export function getErrorTestNumbers(): string[] {
  return getTestNumbersByCategory('error');
}

/**
 * Get all test numbers that succeed
 * @returns Array of success test numbers
 */
export function getSuccessTestNumbers(): string[] {
  return getTestNumbersByCategory('success');
}
