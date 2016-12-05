
'use strict';
const crypto = require('crypto');
const util = require('util');

console.log('Loading box-node-webhook-to-lambda-sample');

// Validate message signatures using the keys below
// This ensures that messages have been sent from your Box application
const primarySignatureKey = '<YOUR_PRIMARY_SIGNATURE_KEY>';
const secondarySignatureKey = '<YOUR_SECONDARY_SIGNATURE_KEY>';
const validateSignatures = primarySignatureKey || secondarySignatureKey;

// Enable this to validate message timestamps
// This prevents replay attacks
const maxMessageAge = 10 * 60; // 10 minutes
const validateTimestamps = true;

console.log('Signature validation: %s', validateSignatures ? 'enabled' : 'disabled');
console.log('Timestamp validation: %s', validateTimestamps ? 'enabled' : 'disabled');

// Compute the message signature (see https://docs.box.com/reference#signatures)
function computeSignature(event, signatureKey) {
   if (!signatureKey) {
     return undefined;
   }

  if (event.headers['box-signature-version'] !== '1') {
    console.log('Unrecognized signature version: %s', event.headers['box-signature-version']);
    return undefined;
  }

  if (event.headers['box-signature-algorithm'] !== 'HmacSHA256') {
    console.log('Unrecognized signature algorithm: %s', event.headers['box-signature-algorithm']);
    return undefined;
  }

  let hmac = crypto.createHmac('sha256', signatureKey);
  hmac.update(event.body);
  hmac.update(event.headers['box-delivery-timestamp']);

  const signature = hmac.digest('base64');
  console.log('Signature: %s', signature);

  return signature;
}

// Validate the message signature (see https://docs.box.com/reference#signatures)
function validateSignature(event, primarySignatureKey, secondarySignatureKey) {
  // Either the primary or secondary signature must match the corresponding signature from Box
  // (The use of two signatures allows the signing keys to be rotated one at a time)
  const primarySignature = computeSignature(event, primarySignatureKey);

  if (primarySignature && primarySignature === event.headers['box-signature-primary']) {
    console.log('Primary signature verified');
    return true;
  }

  const secondarySignature = computeSignature(event, secondarySignatureKey);

  if (secondarySignature && secondarySignature === event.headers['box-signature-secondary']) {
    console.log('Secondary signature verified');
    return true;
  }

  console.log('Signature not verified');
  return false;
}

// Validate that the delivery timestamp is not too far in the past (to prevent replay attacks)
function validateDeliveryTimestamp(event, maxMessageAge) {
  const deliveryTime = Date.parse(event.headers['box-delivery-timestamp']);
  const currentTime = Date.now();
  const messageAge = (currentTime - deliveryTime) / 1000;

  console.log('Message age: %d', messageAge);

  if (messageAge > maxMessageAge) {
    console.log('Message too old');
    return false;
  }

  return true;
}

// Validate the message by verifying the signature and the delivery timestamp
function validateMessage(event) {
  if (validateSignatures && !validateSignature(event, primarySignatureKey, secondarySignatureKey)) {
    return false;
  }

  if (validateTimestamps && !validateDeliveryTimestamp(event, maxMessageAge)) {
    return false;
  }

  return true;
}

//////////////////////////
// YOUR CODE GOES HERE! //
//////////////////////////
function handleWebhookEvent(webhookEvent) {
  // Print basic information about the Box event
  let message = util.format('webhook=%s', webhookEvent.webhook.id);

  // The event trigger: FILE.DOWNLOADED, FILE.UPLOADED, etc.
  message = message + util.format(', trigger=%s', webhookEvent.trigger);

  // The source that triggered the event: a file, folder, etc.
  if (webhookEvent.source) {
    message = message + util.format(', source=<%s id=%s name=\"%s\">',
        webhookEvent.source.type, webhookEvent.source.id, webhookEvent.source.name || 'unknown');
  }

  console.log("Box event: " + message);
  return { statusCode: 200, body: message };
}

exports.handler = (event, context, callback) => {
  console.log('Received event: ' + JSON.stringify(event, null, 2));

  if (!validateMessage(event)) {
    const response = { statusCode: 403, body: 'Message authenticity not verified' };
    console.log("Response: " + JSON.stringify(response, null, 2));
    callback(null, response);
    return;
  }

  if (!event.body) {
    const response = { statusCode: 403, body: 'Missing event body' };
    console.log("Response: " + JSON.stringify(response, null, 2));
    callback(null, response);
    return;
  }

  // Parse the message body from the Lambda proxy
  var body = JSON.parse(event.body);
  console.log('Event body: ' + JSON.stringify(body, null, 2));

  // Handle the webhook event
  const response = handleWebhookEvent(body);

  console.log("Response: " + JSON.stringify(response, null, 2));
  callback(null, response);
};
