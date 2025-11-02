# @sendly/node

Official Node.js SDK for the Sendly SMS API.

## Installation

```bash
npm install @sendly/node
```

## Quick Start

```javascript
import { SendlyClient } from '@sendly/node';

const sendly = new SendlyClient('sl_live_...');

await sendly.sms.send({
  to: '+14155552671',
  text: 'Hello from Sendly!'
});
```

## API Reference

### Initialize Client

```javascript
import { SendlyClient } from '@sendly/node';

// Simple initialization
const sendly = new SendlyClient('sl_live_...');

// With options
const sendly = new SendlyClient({
  apiKey: process.env.SENDLY_API_KEY,
  baseUrl: 'https://sendly.live/api',  // Optional: custom base URL
  timeout: 30000                         // Optional: request timeout (ms)
});
```

### Send SMS

```javascript
const result = await sendly.sms.send({
  to: string,              // Required: E.164 format (+14155552671)
  text: string,            // Required: Message content
  from?: string,           // Optional: Sender ID (auto-selected if omitted)
  messageType?: string,    // Optional: 'transactional' | 'marketing' | 'otp'
  webhookUrl?: string,     // Optional: Delivery status webhook
  webhookFailoverUrl?: string, // Optional: Backup webhook URL
  tags?: string[]          // Optional: Custom tags for filtering
});

// Returns
{
  id: string,              // Message ID
  status: string,          // 'queued' | 'sent' | 'delivered' | 'failed'
  to: string,              // Recipient number
  from: string,            // Sender number
  cost: number,            // Cost in USD
  segments: number         // Number of message segments
}
```

### Send MMS

```javascript
await sendly.sms.send({
  to: '+14155552671',
  text: 'Check this out!',
  mediaUrls: [
    'https://example.com/image.jpg',
    'https://example.com/video.mp4'
  ],
  subject: 'Photo Gallery'  // Optional: MMS subject line
});
```

## Error Handling

All errors extend `SendlyError` with a `code` property:

```javascript
import { 
  SendlyClient, 
  ValidationError, 
  AuthenticationError, 
  RateLimitError, 
  ApiError 
} from '@sendly/node';

try {
  await sendly.sms.send({ to: '+1...', text: '...' });
} catch (error) {
  console.error(error.code, error.message);
}
```

### Error Codes

| Code | Class | Description | Action |
|------|-------|-------------|--------|
| `INVALID_PHONE` | `ValidationError` | Invalid phone number format | Fix number, use E.164 |
| `INVALID_API_KEY` | `AuthenticationError` | API key missing or invalid | Check API key |
| `RATE_LIMIT` | `RateLimitError` | Too many requests | Retry after delay |
| `INSUFFICIENT_BALANCE` | `ApiError` | No credits remaining | Add credits |
| `NETWORK_ERROR` | `ApiError` | Network/timeout issue | Retry with backoff |

### Retry Example

```javascript
async function sendWithRetry(params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await sendly.sms.send(params);
    } catch (error) {
      if (error instanceof RateLimitError && i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}
```

## Rate Limits

**Toll-Free Numbers (US/Canada):**
- **1,200 messages/minute** for transactional/OTP
- **600 messages/minute** for marketing

**International Numbers:**
- **100 messages/minute** per destination country

**429 Response Headers:**
```
X-RateLimit-Limit: 1200
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1640000000
```

SDK automatically retries 429 responses with exponential backoff.

## Sandbox Testing

Test keys (`sl_test_...`) use magic numbers for testing scenarios:

### Success Scenarios

| Number | Behavior |
|--------|----------|
| `+15550001234` | Instant delivery (0ms) |
| `+15550001010` | 10 second delay |
| `+15550001030` | 30 second delay |
| `+15550001060` | 60 second delay |

### Error Scenarios

| Number | Error | HTTP Status |
|--------|-------|-------------|
| `+15550009999` | Invalid number | 400 |
| `+15550009998` | Carrier rejection | 400 |
| `+15550009997` | Rate limit | 429 |
| `+15550009996` | Temporary failure | 500 |
| `+15550009995` | Server error | 503 |

### Example

```javascript
// Test instant delivery
await sendly.sms.send({
  to: '+15550001234',
  text: 'Test message'
});

// Test error handling
try {
  await sendly.sms.send({
    to: '+15550009999',  // Invalid number
    text: 'This will fail'
  });
} catch (error) {
  console.log(error.code); // 'INVALID_PHONE'
}
```

## TypeScript Support

Full TypeScript definitions included:

```typescript
import { SendlyClientSendlyClient, SMSSendRequest, SMSSendResponse } from '@sendly/node';

const sendly = new SendlyClient(process.env.SENDLY_API_KEY!);

const request: SMSSendRequest = {
  to: '+14155552671',
  text: 'Hello!',
  messageType: 'transactional'
};

const response: SMSSendResponse = await sendly.sms.send(request);
console.log(response.id);
```

## Webhooks

Receive delivery status updates:

```javascript
import express from 'express';

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  const { type, messageId, status, to } = req.body;
  
  switch (type) {
    case 'message.delivered':
      console.log(`Message ${messageId} delivered to ${to}`);
      break;
    case 'message.failed':
      console.log(`Message ${messageId} failed`);
      break;
  }
  
  res.status(200).send('OK');
});

app.listen(3000);
```

## Support

- **Documentation:** https://sendly.live/docs
- **API Reference:** https://sendly.live/api-reference
- **Dashboard:** https://sendly.live/dashboard
- **Issues:** https://github.com/sendly/sendly-node/issues

## License

MIT
