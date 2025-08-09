import { Injectable } from '@nestjs/common';
import {
  ThrottlerGuard as BaseThrottlerGuard,
  ThrottlerException,
  ThrottlerLimitDetail,
} from '@nestjs/throttler';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class ThrottlerByUserGuard extends BaseThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    if (req.user?.id) {
      return req.user.id;
    }
    return req.ip;
  }

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    throw new ThrottlerException(
      'Has excedido el número de peticiones permitidas. Intenta de nuevo más tarde.',
    );
  }
}
