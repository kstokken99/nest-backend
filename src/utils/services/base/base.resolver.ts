import { Injectable } from '@nestjs/common';

@Injectable()
export class BaseResolver {
  protected wrapSuccess<Data>(data?: Data) {
    return {
      success: true,
      ...data,
    };
  }

  protected wrapFail<Data>(reason?: string, data?: Data) {
    return {
      success: false,
      reason,
      ...data,
    };
  }
}
