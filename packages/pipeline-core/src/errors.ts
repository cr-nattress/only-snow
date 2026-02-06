export class PipelineError extends Error {
  constructor(
    message: string,
    public readonly pipeline: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'PipelineError';
  }
}

export class ExternalApiError extends PipelineError {
  constructor(
    public readonly apiName: string,
    public readonly statusCode: number | undefined,
    message: string,
    cause?: unknown,
  ) {
    super(message, apiName, cause);
    this.name = 'ExternalApiError';
  }
}

export class DataQualityError extends PipelineError {
  constructor(
    public readonly field: string,
    public readonly value: unknown,
    public readonly rule: string,
    pipeline: string,
  ) {
    super(`Data quality violation: ${field} = ${value} (rule: ${rule})`, pipeline);
    this.name = 'DataQualityError';
  }
}
