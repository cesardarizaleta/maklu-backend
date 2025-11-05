import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('issueApiKey', () => {
    it('should create a new user with API key', async () => {
      const owner = 'testowner';
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepo, 'exist').mockResolvedValue(false);
      jest.spyOn(userRepo, 'create').mockReturnValue({} as User);
      jest.spyOn(userRepo, 'save').mockResolvedValue({
        id: '1',
        owner,
        apiKey: 'uuid',
      } as User);

      const result = await service.issueApiKey(owner);
      expect(result.owner).toBe(owner);
      expect(result.apiKey).toBeDefined();
    });

    it('should throw error if owner exists', async () => {
      const owner = 'existingowner';
      jest.spyOn(userRepo, 'findOne').mockResolvedValue({} as User);

      await expect(service.issueApiKey(owner)).rejects.toThrow(
        'Owner already exists',
      );
    });
  });

  describe('validateApiKey', () => {
    it('should return user if API key exists', async () => {
      const apiKey = 'validkey';
      const user = { id: '1', apiKey } as User;
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(user);

      const result = await service.validateApiKey(apiKey);
      expect(result).toBe(user);
    });

    it('should return undefined if API key does not exist', async () => {
      const apiKey = 'invalidkey';
      jest.spyOn(userRepo, 'findOne').mockResolvedValue(null);

      const result = await service.validateApiKey(apiKey);
      expect(result).toBeUndefined();
    });
  });
});
