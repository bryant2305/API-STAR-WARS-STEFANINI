/* eslint-disable @typescript-eslint/no-var-requires */

import * as AWSXRay from 'aws-xray-sdk-core';

AWSXRay.captureAWS(require('aws-sdk'));

AWSXRay.captureHTTPsGlobal(require('http'));
AWSXRay.captureHTTPsGlobal(require('https'));

export default AWSXRay;
