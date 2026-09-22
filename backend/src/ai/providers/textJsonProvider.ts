import type { AiProvider, AiProviderRequest } from './types.js';

export class TextJsonProvider implements AiProvider {
  readonly name = 'configured-json-provider';
  private readonly url: string;
  private readonly apiKey: string;
  private readonly model?: string;

  constructor(url: string, apiKey: string, model?: string) {
    this.url = url;
    this.apiKey = apiKey;
    this.model = model;
  }

  async complete(request: AiProviderRequest): Promise<unknown | null> {
    try {
      const response = await fetch(this.url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          system: request.system,
          context: request.context,
          response_schema: request.responseSchema,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!response.ok) return null;
      const payload = await response.json() as { output?: unknown; result?: unknown; choices?: Array<{ message?: { content?: unknown } }> };
      return payload.output ?? payload.result ?? payload.choices?.[0]?.message?.content ?? null;
    } catch {
      return null;
    }
  }
}
