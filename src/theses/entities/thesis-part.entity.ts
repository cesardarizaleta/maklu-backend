import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Thesis } from './thesis.entity';

@Entity('thesis_parts')
export class ThesisPart {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  key!: string; // e.g., introduction, theoreticalFramework, methodology, etc.

  @Column({ type: 'varchar', length: 512, nullable: true })
  title?: string | null;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'uuid' })
  thesisId!: string;

  @ManyToOne(() => Thesis, (t: Thesis) => t.parts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'thesisId' })
  thesis!: Thesis;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
