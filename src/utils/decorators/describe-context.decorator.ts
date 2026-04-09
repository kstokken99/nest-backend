import { SetMetadata } from '@nestjs/common';

export const APP_DESCRIBE_CONTEXT = Symbol('APP_DESCRIBE_CONTEXT');

export const DescribeContext = (context: string) =>
  SetMetadata(APP_DESCRIBE_CONTEXT, context);
