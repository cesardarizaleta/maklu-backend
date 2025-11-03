import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import * as path from 'node:path';

@Injectable()
export class PromptLoaderService {
  private readonly logger = new Logger(PromptLoaderService.name);
  private cache: { data: string[]; loadedAt: number } | null = null;
  private readonly ttlMs = 60_000; // 1 minuto de TTL

  private async readAllFilesFrom(dir: string): Promise<string[]> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const contents: string[] = [];
      for (const e of entries) {
        const full = path.join(dir, e.name);
        if (e.isDirectory()) {
          contents.push(...(await this.readAllFilesFrom(full)));
        } else if (
          e.isFile() &&
          (e.name.endsWith('.txt') || e.name.endsWith('.md'))
        ) {
          try {
            const data = await fs.readFile(full, 'utf8');
            contents.push(`\n\n# ${e.name}\n\n${data}`);
          } catch {
            this.logger.warn(`Cannot read prompt file: ${full}`);
          }
        }
      }
      return contents;
    } catch {
      return [];
    }
  }

  async loadAllContext(): Promise<string[]> {
    if (this.cache && Date.now() - this.cache.loadedAt < this.ttlMs) {
      return this.cache.data;
    }
    const base = path.join(process.cwd(), 'src', 'docs');
    const promptsDir = path.join(base, 'prompts');
    const rulesDir = path.join(base, 'rules');
    const [prompts, rules] = await Promise.all([
      this.readAllFilesFrom(promptsDir),
      this.readAllFilesFrom(rulesDir),
    ]);
    const data = [...rules, ...prompts];
    this.cache = { data, loadedAt: Date.now() };
    return data;
  }

  private async safeRead(filePath: string, maxChars?: number): Promise<string> {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      if (maxChars && content.length > maxChars) {
        const truncated = content.slice(0, maxChars);
        return `${truncated}\n\n[Truncado a ${maxChars} caracteres]`;
      }
      return content;
    } catch {
      return '';
    }
  }

  async loadCompactContext(): Promise<string[]> {
    // Selecciona archivos clave y limita tamaño para evitar prompts demasiado largos
    const base = path.join(process.cwd(), 'src', 'docs');
    const promptsDir = path.join(base, 'prompts');
    const rulesDir = path.join(base, 'rules');

    const selectedPromptFiles = [
      path.join(promptsDir, '01-role-setup.txt'),
      path.join(promptsDir, '00-reglas-generales.txt'),
      path.join(promptsDir, '00-variables-comunes.txt'),
      path.join(promptsDir, 'index.md'),
    ];
    const selectedRuleFiles = [
      path.join(
        rulesDir,
        'Normas APA con plantilla y generador 2025 - Séptima edición.txt',
      ),
      path.join(
        rulesDir,
        'MANUAL DE TRABAJOS DE GRADO UPEL 5ta EDICION 2016.txt',
      ),
    ];

    const [prompts, normas, upel] = await Promise.all([
      Promise.all(selectedPromptFiles.map((f) => this.safeRead(f, 8000))).then(
        (arr) => arr.filter(Boolean),
      ),
      this.safeRead(selectedRuleFiles[0], 8000),
      this.safeRead(selectedRuleFiles[1], 8000),
    ]);

    const parts = [
      '# CONTEXTO PROMPTS',
      ...prompts,
      '# CONTEXTO NORMAS APA (resumen)',
      normas,
      '# CONTEXTO MANUAL UPEL (resumen)',
      upel,
    ].filter(Boolean);

    return parts;
  }
}
