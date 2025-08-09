/* eslint-disable @typescript-eslint/no-var-requires */
// src/xray.ts
import * as AWSXRay from 'aws-xray-sdk-core';

// Captura todo el AWS SDK
AWSXRay.captureAWS(require('aws-sdk'));

// Si haces llamadas HTTP externas
AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

export default AWSXRay;
