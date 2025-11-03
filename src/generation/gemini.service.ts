import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private readonly client: GoogleGenerativeAI;
  private readonly modelName = 'gemini-2.5-flash';

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not configured');
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async generate(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text ?? '';
  }

  async generateWithContext(
    contexts: string[],
    prompt: string,
  ): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    // Cap the size of the context to avoid exceeding model limits
    const prefaceRaw = contexts.filter(Boolean).join('\n\n');
    const MAX_PREFACE = 60000; // characters
    const preface =
      prefaceRaw.length > MAX_PREFACE
        ? `${prefaceRaw.slice(0, MAX_PREFACE)}\n\n[Contexto truncado por longitud]`
        : prefaceRaw;
    const input = preface ? `${preface}\n\n${prompt}` : prompt;
    const result = await model.generateContent(input);
    const text = result.response.text();
    return text ?? '';
  }
}
