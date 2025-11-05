import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthenticatedUser } from '../auth/guards/api-key.guard';
import { Thesis } from './entities/thesis.entity';
import { ThesisPart } from './entities/thesis-part.entity';
import { ThesisGeneratorService } from '../generation/thesis-generator.service';

@Injectable()
export class ThesesService {
  constructor(
    @InjectRepository(Thesis) private readonly thesisRepo: Repository<Thesis>,
    @InjectRepository(ThesisPart)
    private readonly partRepo: Repository<ThesisPart>,
    private readonly generator: ThesisGeneratorService,
  ) {}

  async create(user: AuthenticatedUser, title: string): Promise<Thesis> {
    if (!title || !title.trim()) {
      throw new BadRequestException('Title is required');
    }
    const thesis = this.thesisRepo.create({
      title: title.trim(),
      status: 'ready',
      userId: user.id,
    });
    return this.thesisRepo.save(thesis);
  }

  async createFromIdea(
    user: AuthenticatedUser,
    idea: string,
    discipline?: string,
  ): Promise<Thesis> {
    const thesis = await this.generator.createFromIdea(
      user.id,
      idea,
      discipline,
    );
    return thesis;
  }

  async list(user: AuthenticatedUser): Promise<Thesis[]> {
    return this.thesisRepo.find({ where: { userId: user.id } });
  }

  async getTree(
    user: AuthenticatedUser,
    id: string,
  ): Promise<Record<string, string>> {
    const thesis = await this.thesisRepo.findOne({
      where: { id, userId: user.id },
    });
    if (!thesis) throw new NotFoundException('Thesis not found');
    const parts = await this.partRepo.find({ where: { thesisId: thesis.id } });
    const tree: Record<string, string> = {};
    for (const p of parts) tree[p.key] = p.title ?? p.key;
    return tree;
  }

  async getFull(
    user: AuthenticatedUser,
    id: string,
  ): Promise<{
    id: string;
    title: string;
    idea?: string | null;
    discipline?: string | null;
    status: string;
    progress: number; // porcentaje de completitud (0-100)
    createdAt: Date;
    updatedAt: Date;
    parts: Record<
      string,
      {
        id: string;
        key: string;
        title?: string | null;
        content: string;
        updatedAt: Date;
      }
    >;
  }> {
    const thesis = await this.thesisRepo.findOne({
      where: { id, userId: user.id },
    });
    if (!thesis) throw new NotFoundException('Thesis not found');
    const parts = await this.partRepo.find({
      where: { thesisId: thesis.id },
      order: { key: 'ASC' },
    });
    const byKey: Record<
      string,
      {
        id: string;
        key: string;
        title?: string | null;
        content: string;
        updatedAt: Date;
      }
    > = {};
    for (const p of parts) {
      byKey[p.key] = {
        id: p.id,
        key: p.key,
        title: p.title ?? null,
        content: p.content,
        updatedAt: p.updatedAt,
      };
    }
    // Calcular progreso: número de partes generadas / total esperado
    const expectedParts = 35; // aproximado basado en el número de secciones
    const progress = Math.min(
      100,
      Math.round((Object.keys(byKey).length / expectedParts) * 100),
    );
    return {
      id: thesis.id,
      title: thesis.title,
      idea: thesis.idea ?? null,
      discipline: thesis.discipline ?? null,
      status: thesis.status,
      progress,
      createdAt: thesis.createdAt,
      updatedAt: thesis.updatedAt,
      parts: byKey,
    };
  }
}
