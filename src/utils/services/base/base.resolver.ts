import { Injectable } from '@nestjs/common';

@Injectable()
export class BaseResolver {
  protected wrapSuccess<Data extends object>(
    data?: Data,
  ): { success: true } & Data {
    return {
      success: true,
      ...data,
    } as { success: true } & Data;
  }

  protected wrapFail<Data>(reason?: string, data?: Data) {
    return {
      success: false,
      reason,
      ...data,
    };
  }
}
