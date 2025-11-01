# @sendly/node

Official Node.js SDK for Sendly - SMS for developers.

## Installation

```bash
npm install @sendly/node
```

## Quick Start

```javascript
import { Sendly } from '@sendly/node';

const sendly = new Sendly('sl_live_YOUR_API_KEY');

await sendly.sms.send({
  to: '+14155552671',
  text: 'Hello from Sendly!'
});
```

## Features

- **Instant setup** - From npm install to first SMS in under 2 minutes
- **Smart routing** - Automatic number selection (toll-free for US, local for UK)
- **High throughput** - 1,200 messages/minute on toll-free numbers
- **TypeScript support** - Full type definitions included
- **Auto-retry** - Built-in exponential backoff for failed requests
- **Real-time tracking** - Monitor delivery status and costs

## Authentication

Get your API key from [sendly.live](https://sendly.live):

```javascript
import { Sendly } from '@sendly/node';

// Initialize with API key
const sendly = new Sendly('sl_live_YOUR_API_KEY');

// Or with options
const sendly = new Sendly({
  apiKey: process.env.SENDLY_API_KEY,
  baseUrl: 'https://sendly.live',
  timeout: 30000
});
```

## Basic Usage

### Send SMS

```javascript
const result = await sendly.sms.send({
  to: '+14155552671',
  text: 'Hello from Sendly!'
});

console.log(`Message sent! ID: ${result.id}`);
console.log(`Status: ${result.status}`);
console.log(`From: ${result.from_}`);
```

### Send MMS

```javascript
await sendly.sms.send({
  to: '+14155552671',
  text: 'Check out this image!',
  mediaUrls: ['https://example.com/image.jpg'],
  subject: 'Photo from our trip'
});
```

### Message Types

```javascript
// OTP/Verification
await sendly.sms.send({
  to: '+14155552671',
  text: 'Your verification code: 123456',
  messageType: 'otp'
});

// Transactional
await sendly.sms.send({
  to: '+14155552671',
  text: 'Your order #12345 has shipped!',
  messageType: 'transactional'
});

// Marketing
await sendly.sms.send({
  to: '+14155552671',
  text: '50% off this weekend only!',
  messageType: 'marketing'
});
```

## Error Handling

```javascript
import { ValidationError, AuthenticationError, RateLimitError, ApiError } from '@sendly/node';

try {
  await sendly.sms.send({
    to: '+14155552671',
    text: 'Hello!'
  });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log('Invalid input:', error.message);
  } else if (error instanceof AuthenticationError) {
    console.log('Authentication failed:', error.message);
  } else if (error instanceof RateLimitError) {
    console.log('Rate limit exceeded:', error.message);
    console.log('Retry after:', error.retryAfter, 'seconds');
  } else if (error instanceof ApiError) {
    console.log('API error:', error.message);
    console.log('Status code:', error.statusCode);
  }
}
```

## Sandbox Testing

Use test API keys for development. The sandbox provides magic numbers for testing different scenarios:

### Success Scenarios

| Phone Number | Behavior |
|--------------|----------|
| `+15550001234` | Instant delivery |
| `+15550001010` | 10 second delay |
| `+15550001030` | 30 second delay |

### Error Scenarios

| Phone Number | Error Type | HTTP Status |
|--------------|------------|-------------|
| `+15550009999` | Invalid number | 400 |
| `+15550009998` | Carrier rejection | 400 |
| `+15550009997` | Rate limit exceeded | 429 |
| `+15550009996` | Timeout error | 500 |

Example:

```javascript
const sendly = new Sendly('sl_test_YOUR_TEST_KEY');

// Test instant success
await sendly.sms.send({
  to: '+15550001234',
  text: 'Testing instant delivery'
});

// Test rate limit error
try {
  await sendly.sms.send({
    to: '+15550009997',
    text: 'Testing rate limit'
  });
} catch (error) {
  console.log('Rate limit handled:', error.retryAfter);
}
```

## Framework Integration

### Express.js

```javascript
const express = require('express');
const { Sendly } = require('@sendly/node');

const app = express();
const sendly = new Sendly(process.env.SENDLY_API_KEY);

app.post('/send-notification', async (req, res) => {
  try {
    const result = await sendly.sms.send({
      to: req.body.phone,
      text: `Your order #${req.body.orderId} is ready!`
    });
    res.json({ success: true, messageId: result.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Next.js API Routes

```javascript
import { Sendly } from '@sendly/node';

const sendly = new Sendly(process.env.SENDLY_API_KEY);

export async function POST(request) {
  const { phone } = await request.json();
  const otp = Math.random().toString().slice(2, 8);
  
  await sendly.sms.send({
    to: phone,
    text: `Your verification code: ${otp}`,
    messageType: 'otp'
  });
  
  return Response.json({ success: true });
}
```

## TypeScript Support

```typescript
import { Sendly, SMSSendRequest, SMSSendResponse } from '@sendly/node';

const sendly = new Sendly(process.env.SENDLY_API_KEY!);

const sendWelcome = async (phone: string, name: string): Promise<string> => {
  const request: SMSSendRequest = {
    to: phone,
    text: `Welcome ${name}! Thanks for signing up.`,
    messageType: 'transactional'
  };
  
  const response: SMSSendResponse = await sendly.sms.send(request);
  return response.id;
};
```

## Response Format

```javascript
{
  id: "msg_abc123def456",
  status: "sent",
  from_: "+18332930104",
  to: "+14155552671", 
  text: "Hello from Sendly!",
  created_at: "2024-01-27T10:30:00Z",
  segments: 1,
  cost: 0.0045,
  direction: "outbound",
  routing: {
    number_type: "toll_free",
    rate_limit: 1200,
    coverage: "US/Canada",
    country_code: "1"
  }
}
```

## Links

- Documentation: [sendly.live/docs](https://sendly.live/docs)
- Dashboard: [sendly.live](https://sendly.live)
- Issues: [GitHub Issues](https://github.com/sendly-live/sendly-node/issues)
- Support: support@sendly.live

## License

MIT
