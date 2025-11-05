import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GeminiService } from './gemini.service';
import { PromptLoaderService } from './prompt-loader.service';
import { PROMPTS } from './prompts';
import { Thesis } from '../theses/entities/thesis.entity';
import { ThesisPart } from '../theses/entities/thesis-part.entity';

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
    // Paso 0: extraer palabras clave de la idea para amarrar los títulos al tema
    const rawKeywords = await this.gemini.generateWithContext(
      contexts,
      [
        PROMPTS.role,
        'Extrae entre 5 y 12 palabras clave/expresiones cortas de la siguiente idea. Devuelve una lista separada por comas, sin comentarios adicionales.',
        `Idea: ${idea}`,
        discipline ? `Disciplina: ${discipline}` : '',
      ]
        .filter(Boolean)
        .join('\n'),
    );
    const keywords = rawKeywords
      .split(/,|\n/) // soporta coma o saltos de línea
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .slice(0, 12);
    // 1) Generar título (dos pasos: candidatos y selección) evitando sesgo metodológico
    const candidatesRaw = await this.gemini.generateWithContext(
      contexts,
      [
        PROMPTS.role,
        'Genera exactamente 5 títulos de tesis diferentes, concretos y orientados al tema (no metodológicos).',
        keywords.length
          ? `Cada título debe incluir al menos 2 de estas palabras/expresiones clave: ${keywords.join(
              ', ',
            )}.`
          : '',
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
    // Normaliza un texto: minúsculas, sin tildes ni signos
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const kwNorm = keywords.map(normalize);
    const hasAtLeastNKeywords = (title: string, n: number) => {
      const t = normalize(title);
      let count = 0;
      for (const kw of kwNorm) {
        if (kw && t.includes(kw)) count++;
        if (count >= n) return true;
      }
      return false;
    };
    const titlesFiltered = titlesAll.filter((t) => !banned.test(t));
    let titles =
      kwNorm.length >= 2
        ? titlesFiltered.filter((t) => hasAtLeastNKeywords(t, 2))
        : titlesFiltered.filter((t) => hasAtLeastNKeywords(t, 1));
    if (titles.length === 0) titles = titlesFiltered;
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
      // 1) Objetivos y preguntas previas (consistentes para reutilizar)
      const goalText = await this.gemini.generateWithContext(
        contexts,
        PROMPTS.generalObjective(topic, thesis.discipline ?? undefined),
      );
      const specificsText = await this.gemini.generateWithContext(
        contexts,
        PROMPTS.specificObjectives(topic, thesis.discipline ?? undefined),
      );
      const specificsList = specificsText
        .split(/\r?\n/)
        .map((l) => l.replace(/^\s*\d+\.?\s*/, '').trim())
        .filter((l) => l.length > 0);
      const goal = goalText.replace(/\r?\n/g, ' ').trim();
      const specifics = specificsList.length > 0 ? specificsList : ['—'];
      // Guardar objetivos como partes independientes
      await Promise.all([
        this.savePart(
          thesis,
          'introduction.generalObjective',
          'Objetivo General',
          goal,
        ),
        this.savePart(
          thesis,
          'introduction.specificObjectives',
          'Objetivos Específicos',
          specifics.map((s, i) => `${i + 1}. ${s}`).join('\n'),
        ),
      ]);
      const discipline = thesis.discipline ?? undefined;

      const tasks: Array<Promise<void>> = [
        // Preliminares
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.preliminariesCover(topic, discipline),
            );
          return this.generateAndSave(
            thesis,
            'preliminaries.cover',
            'Portada',
            gen,
          );
        })(),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.preliminariesSignatures(),
            );
          return this.generateAndSave(
            thesis,
            'preliminaries.signatures',
            'Firmas',
            gen,
          );
        })(),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.preliminariesDedication(),
            );
          return this.generateAndSave(
            thesis,
            'preliminaries.dedication',
            'Dedicatoria',
            gen,
          );
        })(),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.preliminariesAcknowledgments(),
            );
          return this.generateAndSave(
            thesis,
            'preliminaries.acknowledgments',
            'Agradecimientos',
            gen,
          );
        })(),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.preliminariesTOC(topic),
            );
          return this.generateAndSave(
            thesis,
            'preliminaries.tableOfContents',
            'Tabla de Contenidos',
            gen,
          );
        })(),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.preliminariesListFigures(),
            );
          return this.generateAndSave(
            thesis,
            'preliminaries.lists.figures',
            'Lista de Figuras',
            gen,
          );
        })(),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.preliminariesListTables(),
            );
          return this.generateAndSave(
            thesis,
            'preliminaries.lists.tables',
            'Lista de Tablas',
            gen,
          );
        })(),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.preliminariesListGraphs(),
            );
          return this.generateAndSave(
            thesis,
            'preliminaries.lists.graphs',
            'Lista de Gráficos',
            gen,
          );
        })(),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.preliminariesAbstract(topic, discipline),
            );
          return this.generateAndSave(
            thesis,
            'preliminaries.abstract',
            'Resumen / Abstract',
            gen,
          );
        })(),
        // Introducción (granular)
        this.generateAndSave(
          thesis,
          'introduction.problemStatement',
          'Planteamiento del Problema',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.problemStatement(topic, discipline),
            ),
        ),
        this.generateAndSave(
          thesis,
          'introduction.researchQuestions',
          'Pregunta(s) de Investigación',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.researchQuestions(topic, discipline),
            ),
        ),
        this.generateAndSave(
          thesis,
          'introduction.justification',
          'Justificación',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.justification(topic, discipline),
            ),
        ),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.scope(topic, discipline),
            );
          return this.generateAndSave(
            thesis,
            'introduction.scope',
            'Alcance',
            gen,
          );
        })(),
        this.generateAndSave(
          thesis,
          'introduction.delimitations',
          'Delimitaciones',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.delimitations(topic, discipline),
            ),
        ),
        this.generateAndSave(
          thesis,
          'introduction.limitations',
          'Limitaciones',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.limitations(topic, discipline),
            ),
        ),
        this.generateAndSave(
          thesis,
          'theoreticalFramework',
          'Marco Teórico y Antecedentes',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.theoretical(topic, discipline),
            ),
        ),
        // Marco teórico granular
        this.generateAndSave(
          thesis,
          'theoretical.background',
          'Antecedentes',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.antecedentes(topic, discipline),
            ),
        ),
        this.generateAndSave(
          thesis,
          'theoretical.bases',
          'Bases Teóricas',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.basesTeoricas(topic, discipline),
            ),
        ),
        this.generateAndSave(
          thesis,
          'theoretical.definitions',
          'Definiciones Operacionales',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.definiciones(topic, discipline),
            ),
        ),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.methodology(topic, discipline),
            );
          return this.generateAndSave(
            thesis,
            'methodology',
            'Metodología',
            gen,
          );
        })(),
        // Metodología granular
        this.generateAndSave(
          thesis,
          'methodology.design',
          'Enfoque, Tipo y Diseño',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.metodoDiseno(topic, discipline),
            ),
        ),
        this.generateAndSave(
          thesis,
          'methodology.populationSample',
          'Población y Muestra',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.poblacionMuestra(topic, discipline),
            ),
        ),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.muestreo(topic, discipline),
            );
          return this.generateAndSave(
            thesis,
            'methodology.sampling',
            'Muestreo',
            gen,
          );
        })(),
        this.generateAndSave(
          thesis,
          'methodology.operationalization',
          'Operacionalización de Variables',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.operacionalizacion(topic, discipline),
            ),
        ),
        this.generateAndSave(
          thesis,
          'methodology.instruments',
          'Instrumentos',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.instrumentos(topic, discipline),
            ),
        ),
        this.generateAndSave(
          thesis,
          'methodology.validityReliability',
          'Validez y Confiabilidad',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.validezConfiabilidad(topic, discipline),
            ),
        ),
        this.generateAndSave(
          thesis,
          'methodology.procedure',
          'Procedimiento',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.procedimiento(topic, discipline),
            ),
        ),
        this.generateAndSave(
          thesis,
          'methodology.ethics',
          'Consideraciones Éticas',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.etica(topic, discipline),
            ),
        ),
        this.generateAndSave(
          thesis,
          'methodology.analysisPlan',
          'Plan de Análisis',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.planAnalisis(topic, discipline),
            ),
        ),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.cronograma(topic, discipline),
            );
          return this.generateAndSave(
            thesis,
            'methodology.timeline',
            'Cronograma',
            gen,
          );
        })(),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.results(topic, discipline),
            );
          return this.generateAndSave(thesis, 'results', 'Resultados', gen);
        })(),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.discussion(discipline),
            );
          return this.generateAndSave(thesis, 'discussion', 'Discusión', gen);
        })(),
        this.generateAndSave(
          thesis,
          'conclusions',
          'Conclusiones y Recomendaciones',
          () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.conclusions(goal, specifics, discipline),
            ),
        ),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.references(discipline),
            );
          return this.generateAndSave(thesis, 'references', 'Referencias', gen);
        })(),
        (() => {
          const gen = () =>
            this.gemini.generateWithContext(
              contexts,
              PROMPTS.appendices(discipline),
            );
          return this.generateAndSave(thesis, 'appendices', 'Anexos', gen);
        })(),
      ];

      await Promise.all(tasks);
      // Asegurar tamaño mínimo total aproximado
      await this.ensureMinWordCount(thesis, contexts, topic, discipline);
      await this.thesisRepo.update(thesis.id, { status: 'ready' });
    } catch (e) {
      await this.thesisRepo.update(thesis.id, { status: 'failed' });
      throw e;
    }
  }

  private countWords(text: string): number {
    return (text || '').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)
      .length;
  }

  private async ensureMinWordCount(
    thesis: Thesis,
    contexts: string[],
    topic: string,
    discipline?: string,
  ): Promise<void> {
    const TARGET_MIN_WORDS = 12000; // ~50 páginas a ~240 palabras por página
    const MAX_ROUNDS = 3;
    const EXTRA_PER_EXPANSION = 600; // palabras aprox por expansión

    const parts = await this.partRepo.find({ where: { thesisId: thesis.id } });
    const total0 = parts.reduce(
      (acc, p) => acc + this.countWords(p.content),
      0,
    );
    if (total0 >= TARGET_MIN_WORDS) return;

    const priorityKeys = [
      'theoreticalFramework',
      'theoretical.background',
      'theoretical.bases',
      'methodology',
      'methodology.design',
      'methodology.analysisPlan',
      'results',
      'discussion',
      'conclusions',
      'introduction.problemStatement',
      'introduction.justification',
    ];

    let total = total0;
    let round = 0;
    while (total < TARGET_MIN_WORDS && round < MAX_ROUNDS) {
      for (const key of priorityKeys) {
        if (total >= TARGET_MIN_WORDS) break;
        const part = parts.find((p) => p.key === key);
        if (!part) continue;
        try {
          const add = await this.gemini.generateWithContext(
            contexts,
            PROMPTS.expandSection(
              key,
              topic,
              part.content.slice(0, 1000),
              EXTRA_PER_EXPANSION,
              discipline,
            ),
          );
          const newContent = `${part.content}\n\n${add.trim()}`;
          part.content = newContent;
          await this.partRepo.update({ id: part.id }, { content: newContent });
          total += this.countWords(add);
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          this.logger.warn(`Expansion failed for ${key}: ${msg}`);
        }
      }
      round++;
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

  private async generateAndSave(
    thesis: Thesis,
    key: string,
    title: string,
    gen: () => Promise<string>,
  ): Promise<void> {
    try {
      const content = await gen();
      await this.savePart(thesis, key, title, content);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      this.logger.warn(`Generation failed for part ${key}: ${msg}`);
    }
  }
}
