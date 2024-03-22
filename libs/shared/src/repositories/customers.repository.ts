import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseAbstractRepository } from './base/base.abstract.repository';
import { CustomerEntity } from '../entities/user.entity';
import { CustomerRepositoryInterface } from '../interfaces/customers.repository.interface';

@Injectable()
export class CustomersRepository
  extends BaseAbstractRepository<CustomerEntity>
  implements CustomerRepositoryInterface
{
  constructor(
    @InjectRepository(CustomerEntity)
    private readonly CustomerRepository: Repository<CustomerEntity>,
  ) {
    super(CustomerRepository);
  }
}
