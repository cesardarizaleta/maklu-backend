import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThesesService } from './theses.service';
import { Thesis } from './entities/thesis.entity';
import { ThesisPart } from './entities/thesis-part.entity';
import { ThesisGeneratorService } from '../generation/thesis-generator.service';

describe('ThesesService', () => {
  let service: ThesesService;
  let thesisRepo: Repository<Thesis>;
  let partRepo: Repository<ThesisPart>;
  let generator: ThesisGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThesesService,
        {
          provide: getRepositoryToken(Thesis),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ThesisPart),
          useClass: Repository,
        },
        {
          provide: ThesisGeneratorService,
          useValue: {
            createFromIdea: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ThesesService>(ThesesService);
    thesisRepo = module.get<Repository<Thesis>>(getRepositoryToken(Thesis));
    partRepo = module.get<Repository<ThesisPart>>(
      getRepositoryToken(ThesisPart),
    );
    generator = module.get<ThesisGeneratorService>(ThesisGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a thesis', async () => {
      const user = { id: '1' } as any;
      const title = 'Test Thesis';
      const thesis = { id: '1', title, userId: user.id } as Thesis;
      jest.spyOn(thesisRepo, 'create').mockReturnValue(thesis);
      jest.spyOn(thesisRepo, 'save').mockResolvedValue(thesis);

      const result = await service.create(user, title);
      expect(result).toBe(thesis);
    });

    it('should throw error for empty title', async () => {
      const user = { id: '1' } as any;
      await expect(service.create(user, '')).rejects.toThrow(
        'Title is required',
      );
    });
  });

  describe('list', () => {
    it('should return user theses', async () => {
      const user = { id: '1' } as any;
      const theses = [{ id: '1', userId: user.id }] as Thesis[];
      jest.spyOn(thesisRepo, 'find').mockResolvedValue(theses);

      const result = await service.list(user);
      expect(result).toBe(theses);
    });
  });

  describe('getTree', () => {
    it('should return thesis tree', async () => {
      const user = { id: '1' } as any;
      const id = '1';
      const thesis = { id, userId: user.id } as Thesis;
      const parts = [{ key: 'intro', title: 'Introduction' }] as ThesisPart[];
      jest.spyOn(thesisRepo, 'findOne').mockResolvedValue(thesis);
      jest.spyOn(partRepo, 'find').mockResolvedValue(parts);

      const result = await service.getTree(user, id);
      expect(result).toEqual({ intro: 'Introduction' });
    });

    it('should throw not found', async () => {
      const user = { id: '1' } as any;
      jest.spyOn(thesisRepo, 'findOne').mockResolvedValue(null);

      await expect(service.getTree(user, '1')).rejects.toThrow(
        'Thesis not found',
      );
    });
  });
});
