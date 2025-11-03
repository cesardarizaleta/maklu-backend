import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeminiService } from './gemini.service.js';
import { PromptLoaderService } from './prompt-loader.service.js';
import { PROMPTS } from './prompts.js';
import { Thesis } from '../theses/entities/thesis.entity.js';
import { ThesisPart } from '../theses/entities/thesis-part.entity.js';

@Injectable()
export class ThesisGeneratorService {
  private readonly logger = new Logger(ThesisGeneratorService.name);

  constructor(
    private readonly gemini: GeminiService,
    private readonly promptLoader: PromptLoaderService,
    @InjectRepository(Thesis) private readonly thesisRepo: Repository<Thesis>,
    @InjectRepository(ThesisPart)
    private readonly partRepo: Repository<ThesisPart>,
  ) {}

  async createFromIdea(
    userId: string,
    idea: string,
    discipline?: string,
  ): Promise<Thesis> {
    const contexts = await this.promptLoader.loadCompactContext();
    // 1) Generar título (dos pasos: candidatos y selección) evitando sesgo metodológico
    const candidatesRaw = await this.gemini.generateWithContext(
      contexts,
      [
        PROMPTS.role,
        'Genera exactamente 5 títulos de tesis diferentes, concretos y orientados al tema (no metodológicos).',
        'Evita palabras como: metodología, metodológico, consideraciones metodológicas, estándares APA/UJAP en el título.',
        `Idea base: ${idea}.`,
        discipline ? `Disciplina: ${discipline}.` : '',
        'Formato de salida: una lista numerada del 1 al 5, cada línea con un título. No agregues saludos, explicaciones ni texto adicional.',
      ]
        .filter(Boolean)
        .join('\n'),
    );
    const titlesAll = candidatesRaw
      .split(/\r?\n/)
      .map((l) => l.replace(/^\s*\d+\.?\s*/, '').trim())
      .filter((l) => l.length > 0);
    const banned = /(metodol|metodolog|APA|UJAP)/i;
    const titles = titlesAll.filter((t) => !banned.test(t));
    if (titles.length === 0) titles.push(...titlesAll);
    const selectionPrompt = [
      PROMPTS.role,
      'Elige el mejor título de la lista siguiente, priorizando claridad temática y ajuste a la disciplina.',
      'No devuelvas nada más que el título elegido. No incluyas saludos ni explicaciones.',
      titles.map((t, i) => `${i + 1}. ${t}`).join('\n'),
    ].join('\n');
    const title = (
      await this.gemini.generateWithContext(contexts, selectionPrompt)
    ).trim();
    const thesis = this.thesisRepo.create({
      title,
      idea,
      discipline: discipline ?? null,
      status: 'generating',
      userId,
    });
    await this.thesisRepo.save(thesis);

    // 2) Disparar generación de secciones en background (no bloquear la respuesta)
    void this.generateAllSections(thesis).catch((e: unknown) => {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.error(`Background generation failed: ${msg}`);
      void this.thesisRepo.update(thesis.id, { status: 'failed' });
    });

    return thesis;
  }

  private async generateAllSections(thesis: Thesis): Promise<void> {
    try {
      const contexts = await this.promptLoader.loadCompactContext();
      const topic = thesis.title;
      const context = 'contexto local o institucional';
      const goal = 'objetivo general tentativo';
      const specifics = ['objetivo específico 1', 'objetivo específico 2'];
      const discipline = thesis.discipline ?? undefined;

      const tasks: Array<Promise<void>> = [
        this.savePart(
          thesis,
          'introduction',
          'Introducción',
          await this.gemini.generateWithContext(
            contexts,
            PROMPTS.introduction(topic, context, discipline),
          ),
        ),
        this.savePart(
          thesis,
          'theoreticalFramework',
          'Marco Teórico y Antecedentes',
          await this.gemini.generateWithContext(
            contexts,
            PROMPTS.theoretical(topic, discipline),
          ),
        ),
        this.savePart(
          thesis,
          'methodology',
          'Metodología',
          await this.gemini.generateWithContext(
            contexts,
            PROMPTS.methodology(topic, discipline),
          ),
        ),
        this.savePart(
          thesis,
          'results',
          'Resultados',
          await this.gemini.generateWithContext(
            contexts,
            PROMPTS.results(topic, discipline),
          ),
        ),
        this.savePart(
          thesis,
          'discussion',
          'Discusión',
          await this.gemini.generateWithContext(
            contexts,
            PROMPTS.discussion(discipline),
          ),
        ),
        this.savePart(
          thesis,
          'conclusions',
          'Conclusiones y Recomendaciones',
          await this.gemini.generateWithContext(
            contexts,
            PROMPTS.conclusions(goal, specifics, discipline),
          ),
        ),
        this.savePart(
          thesis,
          'references',
          'Referencias',
          await this.gemini.generateWithContext(
            contexts,
            PROMPTS.references(discipline),
          ),
        ),
        this.savePart(
          thesis,
          'appendices',
          'Anexos',
          await this.gemini.generateWithContext(
            contexts,
            PROMPTS.appendices(discipline),
          ),
        ),
      ];

      await Promise.all(tasks);
      await this.thesisRepo.update(thesis.id, { status: 'ready' });
    } catch (e) {
      await this.thesisRepo.update(thesis.id, { status: 'failed' });
      throw e;
    }
  }

  private async savePart(
    thesis: Thesis,
    key: string,
    title: string,
    content: string,
  ): Promise<void> {
    const part = this.partRepo.create({
      thesisId: thesis.id,
      key,
      title,
      content,
    });
    await this.partRepo.save(part);
  }
}
