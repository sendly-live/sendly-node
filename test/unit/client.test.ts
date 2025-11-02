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
        'sk_test_',  // Wrong prefix (sk_ instead of sl_)
        'sl_test_short',  // Too short (less than 24 chars after prefix)
        'sl_prod_invalid',  // Wrong type (prod instead of test/live)
        '',
        '   ',
        'sl_test_' + 'x'.repeat(51),  // Too long (>50 chars after prefix)
        'sl_test_has spaces in it',  // Contains spaces
        'sl_test_has@special#chars',  // Contains invalid special chars
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
        'sl_live_abcdefghijklmnopqrstuvwxyz1234567890abcd',
        'sl_test_w7unrDSwW9kGr-dh-5-b7eIfI1PiaLopEBaC5KZ4NuY',  // With hyphens (real format)
        'sl_live_ABC-123_def-456_GHI-789_jkl',  // Mixed hyphens and underscores
        'sl_test_' + 'a'.repeat(24),  // Minimum length (24 chars)
        'sl_test_' + 'b'.repeat(50),  // Maximum length (50 chars)
      ];

      validKeys.forEach(key => {
        expect(() => {
          new SendlyClient({ apiKey: key });
        }).not.toThrow();
      });
    });
  });
});
