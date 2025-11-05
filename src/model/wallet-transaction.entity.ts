import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from './user-schema';

@Entity()
export class WalletTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  transaction_id!: string;

  @CreateDateColumn()
  date!: Date;

  @Column()
  details!: string;

  @Column()
  ride_id!: string;

  @Column({ type: 'float' })
  amount!: number;

  @Column({ type: 'enum', enum: ['Debit', 'Credit'] })
  status!: 'Debit' | 'Credit';

  @ManyToOne(() => User, (user) => user.transactions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
