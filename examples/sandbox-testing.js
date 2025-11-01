/**
 * Sendly Sandbox Testing Example
 * 
 * This example demonstrates comprehensive testing using test numbers
 * in the Sendly sandbox environment. Use this with test API keys (sl_test_*)
 * to validate your integration without incurring charges.
 */

const { Sendly } = require('@sendly/node');

// Replace with your test API key from https://sendly.live/dashboard
const API_KEY = process.env.SENDLY_TEST_KEY || 'sl_test_YOUR_TEST_KEY';

// Initialize the Sendly client with test key
const sendly = new Sendly(API_KEY);

// Test number reference for testing
const MAGIC_NUMBERS = {
  // Success scenarios
  INSTANT_SUCCESS: '+15550001234',
  DELAYED_5S: '+15550001235',
  VERIZON_CARRIER: '+15550001236',
  
  // Error scenarios
  INVALID_NUMBER: '+15550001001',
  CARRIER_REJECTION: '+15550001002',
  RATE_LIMIT: '+15550001003',
  TIMEOUT: '+15550001004',
  INSUFFICIENT_BALANCE: '+15550001005',
  
  // Delay scenarios
  DELAY_10S: '+15550001010',
  DELAY_30S: '+15550001030',
  DELAY_60S: '+15550001060',
  
  // Carrier simulations
  VERIZON: '+15550002001',
  ATT: '+15550002002',
  TMOBILE: '+15550002003',
  
  // Webhook scenarios
  WEBHOOK_SUCCESS: '+15550003001',
  WEBHOOK_TIMEOUT: '+15550003002',
  WEBHOOK_ERROR: '+15550003003'
};

/**
 * Test all sandbox scenarios
 */
async function runSandboxTests() {
  console.log('Starting Sendly Sandbox Tests\n');
  console.log('='repeat(50));
  
  // Run test suites
  await testSuccessScenarios();
  await testErrorScenarios();
  await testDelayScenarios();
  await testCarrierScenarios();
  await testWebhookScenarios();
  
  console.log('\n' + '='repeat(50));
  console.log('Sandbox tests completed');
}

/**
 * Test successful delivery scenarios
 */
async function testSuccessScenarios() {
  console.log('\n[SUCCESS SCENARIOS]\n');
  
  // Test instant delivery
  try {
    const result = await sendly.sms.send({
      to: MAGIC_NUMBERS.INSTANT_SUCCESS,
      text: 'Testing instant delivery'
    });
    console.log(`✓ Instant delivery: ${result.status} (ID: ${result.id})`);
  } catch (error) {
    console.error(`✗ Instant delivery failed: ${error.message}`);
  }
  
  // Test delayed delivery
  try {
    const result = await sendly.sms.send({
      to: MAGIC_NUMBERS.DELAYED_5S,
      text: 'Testing 5 second delay'
    });
    console.log(`✓ Delayed delivery: queued (ID: ${result.id})`);
    console.log('  Message will be delivered after 5 seconds');
  } catch (error) {
    console.error(`✗ Delayed delivery failed: ${error.message}`);
  }
  
  // Test carrier simulation
  try {
    const result = await sendly.sms.send({
      to: MAGIC_NUMBERS.VERIZON_CARRIER,
      text: 'Testing Verizon carrier simulation'
    });
    console.log(`✓ Verizon simulation: ${result.status}`);
    if (result.routing && result.routing.carrier) {
      console.log(`  Carrier: ${result.routing.carrier}`);
    }
  } catch (error) {
    console.error(`✗ Verizon simulation failed: ${error.message}`);
  }
}

/**
 * Test error handling scenarios
 */
async function testErrorScenarios() {
  console.log('\n[ERROR SCENARIOS]\n');
  
  // Test invalid number error
  try {
    await sendly.sms.send({
      to: MAGIC_NUMBERS.INVALID_NUMBER,
      text: 'Testing invalid number'
    });
    console.error('✗ Invalid number: Expected error but got success');
  } catch (error) {
    console.log(`✓ Invalid number error caught: ${error.message}`);
  }
  
  // Test carrier rejection
  try {
    await sendly.sms.send({
      to: MAGIC_NUMBERS.CARRIER_REJECTION,
      text: 'Testing carrier rejection'
    });
    console.error('✗ Carrier rejection: Expected error but got success');
  } catch (error) {
    console.log(`✓ Carrier rejection caught: ${error.message}`);
  }
  
  // Test rate limit error
  try {
    await sendly.sms.send({
      to: MAGIC_NUMBERS.RATE_LIMIT,
      text: 'Testing rate limit'
    });
    console.error('✗ Rate limit: Expected error but got success');
  } catch (error) {
    console.log(`✓ Rate limit error caught: ${error.message}`);
    if (error.retryAfter) {
      console.log(`  Retry after: ${error.retryAfter} seconds`);
    }
  }
  
  // Test timeout error
  try {
    await sendly.sms.send({
      to: MAGIC_NUMBERS.TIMEOUT,
      text: 'Testing timeout'
    });
    console.error('✗ Timeout: Expected error but got success');
  } catch (error) {
    console.log(`✓ Timeout error caught: ${error.message}`);
  }
  
  // Test insufficient balance error
  try {
    await sendly.sms.send({
      to: MAGIC_NUMBERS.INSUFFICIENT_BALANCE,
      text: 'Testing insufficient balance'
    });
    console.error('✗ Insufficient balance: Expected error but got success');
  } catch (error) {
    console.log(`✓ Insufficient balance caught: ${error.message}`);
  }
}

/**
 * Test various delay scenarios
 */
async function testDelayScenarios() {
  console.log('\n[DELAY SCENARIOS]\n');
  
  const delays = [
    { number: MAGIC_NUMBERS.DELAY_10S, duration: '10 seconds' },
    { number: MAGIC_NUMBERS.DELAY_30S, duration: '30 seconds' },
    { number: MAGIC_NUMBERS.DELAY_60S, duration: '60 seconds' }
  ];
  
  for (const delay of delays) {
    try {
      const result = await sendly.sms.send({
        to: delay.number,
        text: `Testing ${delay.duration} delay`
      });
      console.log(`✓ ${delay.duration} delay: Message queued (ID: ${result.id})`);
      console.log(`  Status progression will take ${delay.duration}`);
    } catch (error) {
      console.error(`✗ ${delay.duration} delay failed: ${error.message}`);
    }
  }
}

/**
 * Test carrier-specific behaviors
 */
async function testCarrierScenarios() {
  console.log('\n[CARRIER SCENARIOS]\n');
  
  const carriers = [
    { number: MAGIC_NUMBERS.VERIZON, name: 'Verizon' },
    { number: MAGIC_NUMBERS.ATT, name: 'AT&T' },
    { number: MAGIC_NUMBERS.TMOBILE, name: 'T-Mobile' }
  ];
  
  for (const carrier of carriers) {
    try {
      const result = await sendly.sms.send({
        to: carrier.number,
        text: `Testing ${carrier.name} carrier behavior`
      });
      console.log(`✓ ${carrier.name}: Message sent (ID: ${result.id})`);
      if (result.routing && result.routing.carrier) {
        console.log(`  Simulated carrier: ${result.routing.carrier}`);
      }
    } catch (error) {
      console.error(`✗ ${carrier.name} test failed: ${error.message}`);
    }
  }
}

/**
 * Test webhook simulation scenarios
 */
async function testWebhookScenarios() {
  console.log('\n[WEBHOOK SCENARIOS]\n');
  
  const webhookUrl = 'https://example.com/webhook';
  const webhookFailoverUrl = 'https://example.com/webhook-failover';
  
  // Test successful webhook
  try {
    const result = await sendly.sms.send({
      to: MAGIC_NUMBERS.WEBHOOK_SUCCESS,
      text: 'Testing webhook success',
      webhookUrl: webhookUrl
    });
    console.log(`✓ Webhook success: Message sent (ID: ${result.id})`);
    console.log(`  Webhook will be simulated to: ${webhookUrl}`);
  } catch (error) {
    console.error(`✗ Webhook success failed: ${error.message}`);
  }
  
  // Test webhook timeout
  try {
    const result = await sendly.sms.send({
      to: MAGIC_NUMBERS.WEBHOOK_TIMEOUT,
      text: 'Testing webhook timeout',
      webhookUrl: webhookUrl,
      webhookFailoverUrl: webhookFailoverUrl
    });
    console.log(`✓ Webhook timeout: Message sent (ID: ${result.id})`);
    console.log(`  Timeout simulation will trigger failover`);
  } catch (error) {
    console.error(`✗ Webhook timeout failed: ${error.message}`);
  }
  
  // Test webhook error with retry
  try {
    const result = await sendly.sms.send({
      to: MAGIC_NUMBERS.WEBHOOK_ERROR,
      text: 'Testing webhook error',
      webhookUrl: webhookUrl
    });
    console.log(`✓ Webhook error: Message sent (ID: ${result.id})`);
    console.log(`  500 error will trigger retry logic`);
  } catch (error) {
    console.error(`✗ Webhook error failed: ${error.message}`);
  }
}

/**
 * Test MMS functionality with test numbers
 */
async function testMMSScenarios() {
  console.log('\n[MMS SCENARIOS]\n');
  
  try {
    const result = await sendly.sms.send({
      to: MAGIC_NUMBERS.INSTANT_SUCCESS,
      text: 'Testing MMS with media',
      mediaUrls: ['https://example.com/image.jpg'],
      subject: 'MMS Test'
    });
    console.log(`✓ MMS sent: ${result.status} (ID: ${result.id})`);
    console.log(`  Media type: ${result.mediaType || 'MMS'}`);
  } catch (error) {
    console.error(`✗ MMS failed: ${error.message}`);
  }
}

/**
 * Test message tagging and analytics
 */
async function testTagging() {
  console.log('\n[TAGGING SCENARIOS]\n');
  
  try {
    const result = await sendly.sms.send({
      to: MAGIC_NUMBERS.INSTANT_SUCCESS,
      text: 'Testing message tags',
      tags: ['test', 'sandbox', 'automated', 'v1.0']
    });
    console.log(`✓ Tagged message sent (ID: ${result.id})`);
    if (result.tags) {
      console.log(`  Tags: ${result.tags.join(', ')}`);
    }
  } catch (error) {
    console.error(`✗ Tagged message failed: ${error.message}`);
  }
}

// Execute all tests if running directly
if (require.main === module) {
  runSandboxTests()
    .then(() => {
      console.log('\nAll tests completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\nTest suite failed:', error);
      process.exit(1);
    });
}

// Export for use in other test files
module.exports = {
  MAGIC_NUMBERS,
  runSandboxTests,
  testSuccessScenarios,
  testErrorScenarios,
  testDelayScenarios,
  testCarrierScenarios,
  testWebhookScenarios,
  testMMSScenarios,
  testTagging
};