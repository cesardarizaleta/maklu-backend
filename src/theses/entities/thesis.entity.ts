import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';
import { User } from '../../auth/entities/user.entity.js';
import { ThesisPart } from './thesis-part.entity';

export type ThesisStatus = 'generating' | 'ready' | 'failed';

@Entity('theses')
export class Thesis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  title!: string;

  @Column({ type: 'text', nullable: true })
  idea?: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  discipline?: string | null;

  @Column({ type: 'varchar', length: 16, default: 'generating' })
  status!: ThesisStatus;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => ThesisPart, (p: ThesisPart) => p.thesis, { cascade: true })
  parts!: ThesisPart[];

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;
}
