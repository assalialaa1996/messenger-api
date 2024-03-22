import { BaseInterfaceRepository } from '@app/shared';

import { CustomerEntity } from '../entities/user.entity';

export interface CustomerRepositoryInterface
  extends BaseInterfaceRepository<CustomerEntity> {}
