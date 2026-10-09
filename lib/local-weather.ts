export type WeatherResponse = {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
    timezone: number;
  };
  current: {
    observedAt: number;
    tempC: number;
    feelsLikeC: number;
    humidity: number;
    windMs: number;
    conditionCode: number;
    description: string;
    sunrise: number;
    sunset: number;
  };
  daily: Array<{
    date: string;
    minC: number;
    maxC: number;
    conditionCode: number;
    description: string;
    precipitationChance: number;
  }>;
};

type ForecastItem = {
  dt: number;
  main: { temp_min: number; temp_max: number };
  weather: Array<{ id: number; description: string }>;
  pop?: number;
};

export function groupForecast(items: ForecastItem[], timezone: number): WeatherResponse["daily"] {
  const days = new Map<string, ForecastItem[]>();
  for (const item of items) {
    const local = new Date((item.dt + timezone) * 1000);
    const date = local.toISOString().slice(0, 10);
    days.set(date, [...(days.get(date) ?? []), item]);
  }

  return [...days.entries()].slice(0, 5).map(([date, entries]) => {
    const midday = entries.reduce((best, item) => {
      const hour = new Date((item.dt + timezone) * 1000).getUTCHours();
      const bestHour = new Date((best.dt + timezone) * 1000).getUTCHours();
      return Math.abs(hour - 12) < Math.abs(bestHour - 12) ? item : best;
    });
    return {
      date,
      minC: Math.round(Math.min(...entries.map((item) => item.main.temp_min))),
      maxC: Math.round(Math.max(...entries.map((item) => item.main.temp_max))),
      conditionCode: midday.weather[0]?.id ?? 800,
      description: midday.weather[0]?.description ?? "",
      precipitationChance: Math.round(Math.max(...entries.map((item) => item.pop ?? 0)) * 100),
    };
  });
}

export function weatherError(status: number): { status: number; code: string } {
  if (status === 401 || status === 403) return { status: 503, code: "KEY_INVALID" };
  if (status === 429) return { status: 503, code: "RATE_LIMITED" };
  return { status: 502, code: "WEATHER_UNAVAILABLE" };
}
