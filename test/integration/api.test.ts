import { SendlyClient } from '../../src/client';

// Integration tests with live Sendly API (conditional based on environment)
describe.skip('Live API Integration Tests', () => {
  let client: SendlyClient;

  beforeAll(() => {
    // Use live API endpoint and test key
    client = new SendlyClient({ 
      apiKey: 'sl_live_BfxV0sFfa5PesFEJU_Bey4AU7oCBReQk',
      baseUrl: 'https://sendly.live/api'
    });
  });

  describe('E2E Routing Tests', () => {
    it('should send OTP to UK number using UK sender with high priority', async () => {
      const result = await client.sms.send({
        to: '+447700900123',
        text: 'Your verification code is 123456',
        messageType: 'otp'
      });

      expect(result.id).toBeDefined();
      expect(result.status).toBe('queued');
      expect(result.routing.from).toBe('+442038070097'); // UK sender
      expect(result.routing.type).toBe('long_code');
      expect(result.routing.reason).toContain('UK destination');
    });

    it('should send marketing to US number using long code to avoid filtering', async () => {
      const result = await client.sms.send({
        to: '+14155552671',
        text: 'Special offer just for you! 50% off today only.',
        messageType: 'marketing'
      });

      expect(result.id).toBeDefined();
      expect(result.status).toBe('queued');
      expect(result.routing.from).toBe('+19093180009'); // US long code
      expect(result.routing.type).toBe('long_code');
      expect(result.routing.reason).toContain('Marketing message');
    });

    it('should send alert to US number using toll-free for speed', async () => {
      const result = await client.sms.send({
        to: '+14155552671',
        text: 'URGENT: Your account has been accessed from a new device.',
        messageType: 'alert'
      });

      expect(result.id).toBeDefined();
      expect(result.status).toBe('queued');
      expect(result.routing.from).toBe('+18332930104'); // Toll-free
      expect(result.routing.type).toBe('toll_free');
      expect(result.routing.reason).toContain('ALERT message');
    });

    it('should send to international number using US long code', async () => {
      const result = await client.sms.send({
        to: '+33123456789',
        text: 'Hello from Sendly international!'
      });

      expect(result.id).toBeDefined();
      expect(result.status).toBe('queued');
      expect(result.routing.from).toBe('+19093180009'); // US long code
      expect(result.routing.type).toBe('long_code');
      expect(result.routing.reason).toContain('International destination');
    });

    it('should send transactional message using toll-free by default', async () => {
      const result = await client.sms.send({
        to: '+14155552671',
        text: 'Your order #12345 has been confirmed.'
      });

      expect(result.id).toBeDefined();
      expect(result.status).toBe('queued');
      expect(result.routing.from).toBe('+18332930104'); // Toll-free
      expect(result.routing.type).toBe('toll_free');
      expect(result.routing.reason).toContain('transactional message');
    });
  });

  describe('Auto-routing without from field', () => {
    it('should automatically select optimal sender for UK destination', async () => {
      const result = await client.sms.send({
        to: '+447700900123',
        text: 'Auto-routed message to UK'
      });

      expect(result.routing.from).toBe('+442038070097');
      expect(result.routing.reason).toContain('UK destination');
    });

    it('should automatically select toll-free for US OTP', async () => {
      const result = await client.sms.send({
        to: '+14155552671',
        text: 'Your OTP is 987654',
        messageType: 'otp'
      });

      expect(result.routing.from).toBe('+18332930104');
      expect(result.routing.type).toBe('toll_free');
      expect(result.routing.reason).toContain('OTP message');
    });
  });

  describe('Explicit from field override', () => {
    it('should respect user-specified sender number', async () => {
      const result = await client.sms.send({
        to: '+14155552671',
        from: '+19093180009',
        text: 'Message with explicit sender'
      });

      expect(result.routing.from).toBe('+19093180009');
      expect(result.routing.reason).toContain('User-specified');
    });
  });
});