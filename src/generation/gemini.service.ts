import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenerativeAI;
  private readonly modelName = 'gemini-2.5-flash';
  private readonly logger = new Logger(GeminiService.name);

  // Rate limit y reintentos
  private readonly maxRetries: number;
  private readonly minIntervalMs: number; // separación mínima entre requests
  private readonly maxConcurrent: number; // máximo de llamadas concurrentes
  private lastCallAt = 0;
  private activeCalls = 0;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.maxRetries = Number(this.config.get('GEMINI_MAX_RETRIES') ?? 3);
    this.minIntervalMs = Number(
      this.config.get('GEMINI_MIN_INTERVAL_MS') ?? 7000,
    );
    this.maxConcurrent = Number(this.config.get('GEMINI_MAX_CONCURRENT') ?? 3);
  }

  private async sleep(ms: number) {
    if (ms > 0) await new Promise((res) => setTimeout(res, ms));
  }

  private normalizeText(text?: string): string {
    if (!text) return '';
    // Normaliza saltos de línea y elimina espacios finales y líneas en blanco extra
    let s = text.replace(/\r\n/g, '\n');
    s = s
      .split('\n')
      .map((l) => l.replace(/[\t ]+$/g, ''))
      .join('\n');
    s = s.replace(/\n{3,}/g, '\n\n').trim();
    return s;
  }

  private async gated<T>(fn: () => Promise<T>): Promise<T> {
    // Semáforo para controlar concurrencia máxima y intervalo mínimo entre llamadas
    while (this.activeCalls >= this.maxConcurrent) {
      await this.sleep(100); // Esperar hasta que haya slot disponible
    }
    this.activeCalls++;
    try {
      const now = Date.now();
      const wait = Math.max(0, this.lastCallAt + this.minIntervalMs - now);
      if (wait > 0) await this.sleep(wait);
      this.lastCallAt = Date.now();
      return await fn();
    } finally {
      this.activeCalls--;
    }
  }

  private async callModel(input: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    let attempt = 0;
    // Ejecutar dentro del gate para controlar el ritmo global
    return this.gated<string>(async () => {
      // Reintentos con backoff y respeto de Retry-After sugerido
      for (;;) {
        try {
          const result = await model.generateContent(input);
          return this.normalizeText(result.response.text());
        } catch (err) {
          attempt += 1;
          const msg = err instanceof Error ? err.message : String(err);
          // Detectar 429 y extraer retryDelay si viene en el mensaje
          let retryMs: number | null = null;
          const retryMatch = /RetryInfo.*?retryDelay":"(\d+)s"/i.exec(msg);
          if (retryMatch) retryMs = Number(retryMatch[1]) * 1000;
          if (/\b429\b|Too Many Requests|quota/i.test(msg)) {
            retryMs = retryMs ?? Math.min(60_000, (attempt + 1) * 10_000);
          }
          if (attempt > this.maxRetries || retryMs == null) {
            this.logger.warn(`Gemini error (no retry or maxed): ${msg}`);
            throw err;
          }
          this.logger.warn(
            `Gemini 429/quota, retrying in ${Math.round(retryMs / 1000)}s (attempt ${attempt}/${this.maxRetries})`,
          );
          await this.sleep(retryMs);
        }
      }
    });
  }

  async generate(prompt: string): Promise<string> {
    return this.callModel(prompt);
  }

  async generateWithContext(
    contexts: string[],
    prompt: string,
  ): Promise<string> {
    // Cap the size of the context to avoid exceeding model limits
    const prefaceRaw = contexts.filter(Boolean).join('\n\n');
    const MAX_PREFACE = 60000; // characters
    const preface =
      prefaceRaw.length > MAX_PREFACE
        ? `${prefaceRaw.slice(0, MAX_PREFACE)}\n\n[Contexto truncado por longitud]`
        : prefaceRaw;
    const input = preface ? `${preface}\n\n${prompt}` : prompt;
    return this.callModel(input);
  }
}
