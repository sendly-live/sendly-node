import { SendlyClient } from '../../src/client';

// Comprehensive message type routing tests (skipped for CI/CD)
describe.skip('Message Type Routing Integration', () => {
  let client: SendlyClient;

  beforeAll(() => {
    client = new SendlyClient({ 
      apiKey: 'sl_live_BfxV0sFfa5PesFEJU_Bey4AU7oCBReQk',
      baseUrl: 'https://sendly.live/api'
    });
  });

  describe('Message Type Priority Routing', () => {
    it('should route OTP messages with highest priority to toll-free', async () => {
      const result = await client.sms.send({
        to: '+14155552671',
        text: 'Your verification code is 123456. Do not share this code.',
        messageType: 'otp'
      });

      expect(result.routing.type).toBe('toll_free');
      expect(result.routing.reason).toContain('OTP message - using toll-free for maximum speed');
    });

    it('should route alert messages to toll-free for urgency', async () => {
      const result = await client.sms.send({
        to: '+14155552671',
        text: 'ALERT: Suspicious activity detected on your account.',
        messageType: 'alert'
      });

      expect(result.routing.type).toBe('toll_free');
      expect(result.routing.reason).toContain('ALERT message - using toll-free');
    });

    it('should route transactional messages to toll-free for reliability', async () => {
      const result = await client.sms.send({
        to: '+14155552671',
        text: 'Your payment of $29.99 has been processed successfully.',
        messageType: 'transactional'
      });

      expect(result.routing.type).toBe('toll_free');
      expect(result.routing.reason).toContain('transactional message - using toll-free');
    });

    it('should route marketing messages to long code to avoid filtering', async () => {
      const result = await client.sms.send({
        to: '+14155552671',
        text: 'Special Black Friday Deal! Get 70% off everything today only!',
        messageType: 'marketing'
      });

      expect(result.routing.type).toBe('long_code');
      expect(result.routing.reason).toContain('Marketing message - using long code to avoid carrier filtering');
    });

    it('should route promotional messages with standard routing', async () => {
      const result = await client.sms.send({
        to: '+14155552671',
        text: 'Check out our new product line! Limited time offer.',
        messageType: 'promotional'
      });

      expect(result.routing.type).toBe('toll_free');
      expect(result.routing.reason).toContain('promotional message - using toll-free');
    });
  });

  describe('Geographic Routing with Message Types', () => {
    it('should prioritize UK routing over message type for UK destinations', async () => {
      const result = await client.sms.send({
        to: '+447700900123',
        text: 'Your OTP for UK account: 789012',
        messageType: 'otp'
      });

      expect(result.routing.from).toBe('+442038070097'); // UK number takes priority
      expect(result.routing.type).toBe('long_code');
      expect(result.routing.reason).toContain('UK destination');
    });

    it('should use US long code for international marketing regardless of message type', async () => {
      const result = await client.sms.send({
        to: '+33123456789',
        text: 'Special offer for our French customers!',
        messageType: 'marketing'
      });

      expect(result.routing.from).toBe('+19093180009');
      expect(result.routing.type).toBe('long_code');
      expect(result.routing.reason).toContain('International destination');
    });
  });

  describe('Default Message Type Handling', () => {
    it('should default to transactional when no messageType specified', async () => {
      const result = await client.sms.send({
        to: '+14155552671',
        text: 'Message without explicit type'
      });

      expect(result.routing.type).toBe('toll_free');
      expect(result.routing.reason).toContain('transactional message');
    });
  });
});