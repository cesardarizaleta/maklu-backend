import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async issueApiKey(owner: string): Promise<User> {
    // Validate uniqueness of owner
    const existing = await this.usersRepo.findOne({ where: { owner } });
    if (existing) {
      throw new BadRequestException('Owner already exists');
    }
    // Generate a unique apiKey (extremely rare to collide, but double-check)
    let apiKey = randomUUID();
    // Ensure apiKey uniqueness
    let exists = await this.usersRepo.exist({ where: { apiKey } });
    while (exists) {
      apiKey = randomUUID();
      exists = await this.usersRepo.exist({ where: { apiKey } });
    }
    const user = this.usersRepo.create({ owner, apiKey });
    return this.usersRepo.save(user);
  }

  async validateApiKey(apiKey: string): Promise<User | undefined> {
    const user = await this.usersRepo.findOne({ where: { apiKey } });
    return user ?? undefined;
  }
}
