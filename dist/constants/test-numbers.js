"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEST_NUMBER_INFO = exports.SANDBOX_TEST_NUMBERS = void 0;
exports.isTestNumber = isTestNumber;
exports.getTestNumberInfo = getTestNumberInfo;
exports.getTestNumbersByCategory = getTestNumbersByCategory;
exports.getErrorTestNumbers = getErrorTestNumbers;
exports.getSuccessTestNumbers = getSuccessTestNumbers;
exports.SANDBOX_TEST_NUMBERS = {
    SUCCESS: {
        INSTANT: '+15550001234',
        DELAY_5S: '+15550001235',
        VERIZON_CARRIER: '+15550001236',
    },
    ERRORS: {
        INVALID_NUMBER: '+15550001001',
        CARRIER_REJECTION: '+15550001002',
        RATE_LIMIT: '+15550001003',
        TIMEOUT: '+15550001004',
        INSUFFICIENT_BALANCE: '+15550001005',
    },
    DELAYS: {
        SECONDS_10: '+15550001010',
        SECONDS_30: '+15550001030',
        SECONDS_60: '+15550001060',
    },
    CARRIERS: {
        VERIZON: '+15550002001',
        ATT: '+15550002002',
        TMOBILE: '+15550002003',
    },
    WEBHOOKS: {
        SUCCESS: '+15550003001',
        TIMEOUT: '+15550003002',
        ERROR_500: '+15550003003',
    }
};
exports.TEST_NUMBER_INFO = {
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
function isTestNumber(phoneNumber) {
    return phoneNumber in exports.TEST_NUMBER_INFO;
}
function getTestNumberInfo(phoneNumber) {
    return exports.TEST_NUMBER_INFO[phoneNumber];
}
function getTestNumbersByCategory(category) {
    return Object.values(exports.TEST_NUMBER_INFO)
        .filter(info => info.category === category)
        .map(info => info.number);
}
function getErrorTestNumbers() {
    return getTestNumbersByCategory('error');
}
function getSuccessTestNumbers() {
    return getTestNumbersByCategory('success');
}
//# sourceMappingURL=test-numbers.js.map