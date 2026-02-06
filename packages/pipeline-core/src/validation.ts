export interface ValidationRule<T> {
  field: string;
  validate: (value: T) => boolean;
  message: string;
}

export class ValidationError extends Error {
  constructor(
    public readonly field: string,
    public readonly value: unknown,
    message: string,
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Run validation rules against a value. Returns an array of errors (empty if valid).
 */
export function validate<T>(value: T, rules: ValidationRule<T>[]): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(new ValidationError(rule.field, value, rule.message));
    }
  }
  return errors;
}

// Common validation rules for weather data
export const weatherValidation = {
  temperature: (tempF: number): boolean => tempF >= -40 && tempF <= 60,
  snowfall24h: (inches: number): boolean => inches >= 0 && inches <= 60,
  baseDepth: (inches: number): boolean => inches >= 0 && inches <= 300,
  liftsOpen: (count: number, total: number): boolean => count >= 0 && count <= total,
  windSpeed: (mph: number): boolean => mph >= 0 && mph <= 200,
  cloudCover: (pct: number): boolean => pct >= 0 && pct <= 100,
  flightPrice: (cents: number): boolean => cents > 0 && cents < 500000, // $0-$5000
};
