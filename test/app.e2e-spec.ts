/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    jest.setTimeout(10000);
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true,
          dropSchema: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('Auth', () => {
    it('should create API key for new user', () => {
      return request(app.getHttpServer())
        .post('/auth/apikey')
        .send({ owner: 'testuser' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.apiKey).toBeDefined();
          expect(res.body.data.user.owner).toBe('testuser');
        });
    });

    it('should fail to create API key for existing owner', async () => {
      await request(app.getHttpServer())
        .post('/auth/apikey')
        .send({ owner: 'testuser2' });

      return request(app.getHttpServer())
        .post('/auth/apikey')
        .send({ owner: 'testuser2' })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe('Owner already exists');
        });
    });
  });

  describe('Theses', () => {
    let apiKey: string;

    beforeEach(async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/apikey')
        .send({ owner: 'thesisuser' });
      apiKey = res.body.data.apiKey;
    });

    it('should create a thesis', () => {
      return request(app.getHttpServer())
        .post('/theses')
        .set('Authorization', `Bearer ${apiKey}`)
        .send({ title: 'Test Thesis' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(res.body.data.title).toBe('Test Thesis');
        });
    });

    it('should list theses', async () => {
      await request(app.getHttpServer())
        .post('/theses')
        .set('Authorization', `Bearer ${apiKey}`)
        .send({ title: 'Test Thesis 1' });

      return request(app.getHttpServer())
        .get('/theses')
        .set('Authorization', `Bearer ${apiKey}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    // it('should create thesis from idea', () => {
    //   return request(app.getHttpServer())
    //     .post('/theses/idea')
    //     .set('Authorization', `Bearer ${apiKey}`)
    //     .send({ idea: 'A study on AI in education' })
    //     .expect(201)
    //     .expect((res) => {
    //       expect(res.body.success).toBe(true);
    //       expect(res.body.data.id).toBeDefined();
    //       expect(res.body.data.title).toBeDefined();
    //     });
    // });
  });

  describe('Thesis Sections - Introduction', () => {
    let apiKey: string;
    let thesisId: string;

    beforeEach(async () => {
      const authRes = await request(app.getHttpServer())
        .post('/auth/apikey')
        .send({ owner: 'introuser' });
      apiKey = authRes.body.data.apiKey;

      const thesisRes = await request(app.getHttpServer())
        .post('/theses')
        .set('Authorization', `Bearer ${apiKey}`)
        .send({ title: 'Introduction Test Thesis' });
      thesisId = thesisRes.body.data.id;
    });

    it('should list introduction parts', () => {
      return request(app.getHttpServer())
        .get(`/thesis/${thesisId}/introduction`)
        .set('Authorization', `Bearer ${apiKey}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(Array.isArray(res.body.data.items)).toBe(true);
        });
    });

    it('should get problem statement', () => {
      return request(app.getHttpServer())
        .get(`/thesis/${thesisId}/introduction/problem-statement`)
        .set('Authorization', `Bearer ${apiKey}`)
        .expect(404);
    });

    it('should update a part', () => {
      return request(app.getHttpServer())
        .patch(`/thesis/${thesisId}/introduction/problemStatement`)
        .set('Authorization', `Bearer ${apiKey}`)
        .send({ content: 'Updated problem statement' })
        .expect(200)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });
});
