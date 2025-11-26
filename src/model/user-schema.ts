import { SavedLocation } from '@/types/place-type';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true }) // nullable just for testing
  name!: string;

  @Column({ unique: true, type: 'varchar', length: 255, nullable: true })
  email!: string;

  @Column({ unique: true, type: 'bigint' })
  mobile!: string;

  @Column({ type: 'varchar', nullable: true })
  user_image!: string;

  @Column({ type: 'varchar', nullable: true })
  referral_code!: string;

  @CreateDateColumn()
  joining_date!: Date;

  @Column({ type: 'enum', enum: ['Good', 'Block'], default: 'Good' })
  account_status!: 'Good' | 'Block';

  @Column({ type: 'varchar', nullable: true })
  reason!: string;

  @Column({ type: 'enum', enum: ['Admin', 'User'], default: 'User' })
  role!: 'Admin' | 'User';

  @Column({ type: 'bigint', default: 0 })
  cancel_ride_count!: number;

  @Column({ type: 'bigint', default: 0 })
  completed_ride_count!: number;

  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" })
  saved_locations!: SavedLocation[];
}
