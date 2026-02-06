import { ValidationError, weatherValidation } from '@onlysnow/pipeline-core';

interface DailyForecastData {
  date: string;
  snowfall: number | null;
  tempHigh: number | null;
  tempLow: number | null;
  windSpeed: number | null;
}

export function validateForecastData(data: DailyForecastData): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.tempHigh !== null && !weatherValidation.temperature(data.tempHigh)) {
    errors.push(
      new ValidationError('tempHigh', data.tempHigh, `Temperature ${data.tempHigh}F out of range`),
    );
  }

  if (data.tempLow !== null && !weatherValidation.temperature(data.tempLow)) {
    errors.push(
      new ValidationError('tempLow', data.tempLow, `Temperature ${data.tempLow}F out of range`),
    );
  }

  if (data.snowfall !== null && !weatherValidation.snowfall24h(data.snowfall)) {
    errors.push(
      new ValidationError(
        'snowfall',
        data.snowfall,
        `Snowfall ${data.snowfall}" out of range (0-60)`,
      ),
    );
  }

  if (data.windSpeed !== null && !weatherValidation.windSpeed(data.windSpeed)) {
    errors.push(
      new ValidationError(
        'windSpeed',
        data.windSpeed,
        `Wind speed ${data.windSpeed}mph out of range`,
      ),
    );
  }

  return errors;
}
