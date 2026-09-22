export interface AiProviderRequest {
  system: string;
  context: unknown;
  responseSchema: unknown;
}

export interface AiProvider {
  readonly name: string;
  complete(request: AiProviderRequest): Promise<unknown | null>;
}
