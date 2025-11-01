import { SendlyClient } from '../../src/client';
import { ValidationError } from '../../src/errors';

describe('SendlyClient', () => {
  describe('constructor', () => {
    it('should throw ValidationError when no API key provided', () => {
      expect(() => {
        new SendlyClient();
      }).toThrow('API key is required');
      
      expect(() => {
        new SendlyClient();
      }).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid API key format', () => {
      const invalidKeys = [
        'invalid',
        'sk_test_',
        'sl_test_tooshort',
        'sl_prod_invalid',
        '',
        '   ',
        'sl_test_1234567890123456789012345678901234567890X' // 41 chars
      ];

      invalidKeys.forEach(key => {
        expect(() => {
          new SendlyClient({ apiKey: key });
        }).toThrow('Invalid API key format. Expected: sl_test_*** or sl_live_***');
        
        expect(() => {
          new SendlyClient({ apiKey: key });
        }).toThrow(ValidationError);
      });
    });

    it('should accept valid API key formats', () => {
      const validKeys = [
        'sl_test_1234567890123456789012345678901234567890',
        'sl_live_abcdefghijklmnopqrstuvwxyz1234567890abcd'
      ];

      validKeys.forEach(key => {
        expect(() => {
          new SendlyClient({ apiKey: key });
        }).not.toThrow();
      });
    });
  });
});