import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { WalletTransaction } from './wallet-transaction.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ unique: true, type: 'bigint' })
  mobile!: string;

  // @Column()
  // password!: string;

  @Column({ nullable: true })
  user_image!: string;

  @Column({ nullable: true })
  referral_code!: string;

  @CreateDateColumn()
  joining_date!: Date;

  @Column({ type: 'enum', enum: ['Good', 'Block'], default: 'Good' })
  account_status!: 'Good' | 'Block';

  @Column({ nullable: true })
  reason!: string;

  @Column({ type: 'enum', enum: ['Admin', 'User'], default: 'User' })
  role!: 'Admin' | 'User';

  @Column({ type: 'bigint', default: 0 })
  cancel_ride_count!: number;

  @Column({ type: 'bigint', default: 0 })
  completed_ride_count!: number;
}
