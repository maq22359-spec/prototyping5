import { NextRequest, NextResponse } from "next/server";
import { groupForecast, weatherError, type WeatherResponse } from "@/lib/local-weather";

export const dynamic = "force-dynamic";

type CurrentPayload = {
  name?: string;
  timezone?: number;
  dt: number;
  main: { temp: number; feels_like: number; humidity: number };
  wind?: { speed: number };
  weather?: Array<{ id: number; description: string }>;
  sys?: { country?: string; sunrise?: number; sunset?: number };
};
type ForecastPayload = {
  city?: { name?: string; country?: string; timezone?: number };
  list?: Parameters<typeof groupForecast>[0];
};

export async function GET(request: NextRequest) {
  const rawLat = request.nextUrl.searchParams.get("lat");
  const rawLon = request.nextUrl.searchParams.get("lon");
  const lat = Number(rawLat);
  const lon = Number(rawLon);
  if (rawLat === null || rawLon === null || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return NextResponse.json({ code: "INVALID_LOCATION" }, { status: 400 });
  }

  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return NextResponse.json({ code: "CONFIG_MISSING" }, { status: 503 });

  const params = new URLSearchParams({ lat: String(lat), lon: String(lon), appid: key, units: "metric" });
  try {
    const [currentResult, forecastResult] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?${params}`, { cache: "no-store", signal: AbortSignal.timeout(9000) }),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?${params}`, { cache: "no-store", signal: AbortSignal.timeout(9000) }),
    ]);
    if (!currentResult.ok || !forecastResult.ok) {
      const error = weatherError(!currentResult.ok ? currentResult.status : forecastResult.status);
      return NextResponse.json({ code: error.code }, { status: error.status });
    }

    const current = await currentResult.json() as CurrentPayload;
    const forecast = await forecastResult.json() as ForecastPayload;
    const response: WeatherResponse = {
      location: {
        name: current.name || forecast.city?.name || "Selected location",
        country: current.sys?.country || forecast.city?.country || "",
        lat,
        lon,
        timezone: forecast.city?.timezone ?? current.timezone ?? 0,
      },
      current: {
        observedAt: current.dt,
        tempC: current.main.temp,
        feelsLikeC: current.main.feels_like,
        humidity: current.main.humidity,
        windMs: current.wind?.speed ?? 0,
        conditionCode: current.weather?.[0]?.id ?? 800,
        description: current.weather?.[0]?.description ?? "",
        sunrise: current.sys?.sunrise ?? 0,
        sunset: current.sys?.sunset ?? 0,
      },
      daily: groupForecast(forecast.list ?? [], forecast.city?.timezone ?? current.timezone ?? 0),
    };
    return NextResponse.json(response, { headers: { "Cache-Control": "private, max-age=120" } });
  } catch {
    return NextResponse.json({ code: "WEATHER_UNAVAILABLE" }, { status: 502 });
  }
}
