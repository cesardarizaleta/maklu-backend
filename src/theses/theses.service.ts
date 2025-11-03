import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { AuthenticatedUser } from '../auth/guards/api-key.guard';
import { Thesis } from './entities/thesis.entity.js';
import { ThesisPart } from './entities/thesis-part.entity.js';
import { ThesisGeneratorService } from '../generation/thesis-generator.service.js';

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

  async getPart(
    user: AuthenticatedUser,
    id: string,
    key: string,
  ): Promise<ThesisPart> {
    const thesis = await this.thesisRepo.findOne({
      where: { id, userId: user.id },
    });
    if (!thesis) throw new NotFoundException('Thesis not found');
    const part = await this.partRepo.findOne({
      where: { thesisId: thesis.id, key },
    });
    if (!part) throw new NotFoundException('Part not found');
    return part;
  }
}
