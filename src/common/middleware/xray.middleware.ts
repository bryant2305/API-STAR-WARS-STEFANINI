import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as AWSXRay from 'aws-xray-sdk-core';

@Injectable()
export class XRayMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const segment = AWSXRay.getSegment();
    if (segment) {
      segment.addAnnotation('path', req.path);
      segment.addAnnotation('method', req.method);

      if ((req as any).user?.id) {
        segment.addAnnotation('userId', (req as any).user.id);
      }
    }
    next();
  }
}
