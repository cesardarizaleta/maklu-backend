import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import type { AuthenticatedUser } from '../../auth/guards/api-key.guard';
import { Thesis } from '../../theses/entities/thesis.entity.js';
import { ThesisPart } from '../../theses/entities/thesis-part.entity.js';

export interface UpdatePartPayload {
  title?: string | null;
  content?: string | null;
}

@Injectable()
export class ThesisSectionsService {
  constructor(
    @InjectRepository(Thesis) private readonly thesisRepo: Repository<Thesis>,
    @InjectRepository(ThesisPart)
    private readonly partRepo: Repository<ThesisPart>,
  ) {}

  private async ensureThesis(
    user: AuthenticatedUser,
    id: string,
  ): Promise<Thesis> {
    const t = await this.thesisRepo.findOne({ where: { id, userId: user.id } });
    if (!t) throw new NotFoundException('Thesis not found');
    return t;
  }

  async listByPrefix(
    user: AuthenticatedUser,
    thesisId: string,
    prefix: string,
  ): Promise<Array<Pick<ThesisPart, 'id' | 'key' | 'title' | 'updatedAt'>>> {
    const thesis = await this.ensureThesis(user, thesisId);
    const parts = await this.partRepo.find({
      where: [
        { thesisId: thesis.id, key: Like(`${prefix}.%`) },
        { thesisId: thesis.id, key: prefix },
      ],
      order: { key: 'ASC' },
      select: { id: true, key: true, title: true, updatedAt: true },
    });
    return parts;
  }

  async get(
    user: AuthenticatedUser,
    thesisId: string,
    key: string,
  ): Promise<ThesisPart> {
    const thesis = await this.ensureThesis(user, thesisId);
    const part = await this.partRepo.findOne({
      where: { thesisId: thesis.id, key },
    });
    if (!part) throw new NotFoundException('Part not found');
    return part;
  }

  async upsert(
    user: AuthenticatedUser,
    thesisId: string,
    key: string,
    payload: UpdatePartPayload,
  ): Promise<ThesisPart> {
    const thesis = await this.ensureThesis(user, thesisId);
    let part = await this.partRepo.findOne({
      where: { thesisId: thesis.id, key },
    });
    if (!part) {
      part = this.partRepo.create({
        thesisId: thesis.id,
        key,
        title: payload.title ?? null,
        content: payload.content ?? '',
      });
    } else {
      if (payload.title !== undefined) part.title = payload.title;
      if (payload.content !== undefined && payload.content !== null)
        part.content = payload.content;
    }
    return this.partRepo.save(part);
  }
}
