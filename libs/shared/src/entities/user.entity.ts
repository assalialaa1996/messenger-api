import {
  ChildEntity,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';

@TableInheritance({ column: { type: 'text', name: 'kind' } })
@Entity('user')
export abstract class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  fullName: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  phoneCountryCode: string;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ unique: true })
  phone: string;

  @Column({ select: false, nullable: true })
  otp: string;
}

@ChildEntity('Customer')
export class CustomerEntity extends UserEntity {}
