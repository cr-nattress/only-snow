import { ResortConditions, TimeWindow } from "@/data/types";

export interface WeatherTier {
  icon: string;
  bg: string;
  ring: string;
}

export interface ResortRowData {
  resortName: string;
  resortId: string;
  passType: string;
  onPass: boolean;
  snowfall24hr: number;
  has24hrSnow: boolean;
  snowfall24hrDisplay: string;
  forecastDisplay: string;
  forecastSort: number;
  hasSnow: boolean;
  baseDepth: number;
  openPercent: number;
  daily: number[] | undefined;
  weather: WeatherTier;
}

function getWeatherTier(daily?: number[]): WeatherTier {
  if (!daily) return { icon: "☀️", bg: "bg-amber-100", ring: "ring-amber-300" };
  const snowDays = daily.filter((d) => d > 0).length;
  const totalSnow = daily.reduce((sum, d) => sum + d, 0);
  if (snowDays >= 5 || totalSnow >= 20)
    return { icon: "🏔️", bg: "bg-blue-200", ring: "ring-blue-400" };
  if (snowDays >= 4)
    return { icon: "❄️", bg: "bg-sky-200", ring: "ring-sky-400" };
  if (snowDays >= 2)
    return { icon: "🌨️", bg: "bg-indigo-100", ring: "ring-indigo-300" };
  if (snowDays === 1)
    return { icon: "🌤️", bg: "bg-purple-100", ring: "ring-purple-300" };
  return { icon: "☀️", bg: "bg-amber-100", ring: "ring-amber-300" };
}

export function useResortRow(
  data: ResortConditions,
  userPass: string,
  timeWindow: TimeWindow,
): ResortRowData {
  const { resort, snowfall24hr, baseDepth, openPercent, forecasts } = data;
  const onPass = resort.passType === userPass;
  const forecastEntry = forecasts[timeWindow];
  const daily = forecastEntry.daily;

  return {
    resortName: resort.name,
    resortId: resort.id,
    passType: resort.passType,
    onPass,
    snowfall24hr,
    has24hrSnow: snowfall24hr > 0,
    snowfall24hrDisplay: snowfall24hr > 0 ? `${Math.ceil(snowfall24hr)}"` : "—",
    forecastDisplay: forecastEntry.display,
    forecastSort: forecastEntry.sort,
    hasSnow: forecastEntry.sort > 0,
    baseDepth,
    openPercent,
    daily,
    weather: getWeatherTier(daily),
  };
}
