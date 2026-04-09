import { Args, ID, Query, Resolver } from '@nestjs/graphql';

import { DescribeContext } from '@/utils/decorators';
import { BaseResolver } from '@/utils/services';

import { Otp } from './entities';
import { OtpsService } from './otps.service';

@Resolver('☄️ otps query')
@DescribeContext('OtpsQuery')
@Resolver(() => Otp)
export class OtpsQuery extends BaseResolver {
  constructor(private readonly otpsService: OtpsService) {
    super();
  }

  @Query(() => Otp, { name: 'otp' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return this.otpsService.findOne({ _id: id });
  }

  @Query(() => [Otp], { name: 'otps' })
  async findAll() {
    return this.otpsService.find({});
  }
}
