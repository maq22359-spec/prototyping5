import { NextRequest, NextResponse } from "next/server";
import { weatherError } from "@/lib/local-weather";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 2 || query.length > 100) {
    return NextResponse.json({ code: "INVALID_CITY" }, { status: 400 });
  }
  const key = process.env.OPENWEATHER_API_KEY;
  if (!key) return NextResponse.json({ code: "CONFIG_MISSING" }, { status: 503 });

  const params = new URLSearchParams({ q: query, limit: "5", appid: key });
  try {
    const result = await fetch(`https://api.openweathermap.org/geo/1.0/direct?${params}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(9000),
    });
    if (!result.ok) {
      const error = weatherError(result.status);
      return NextResponse.json({ code: error.code }, { status: error.status });
    }
    const locations = (await result.json()) as Array<{ name: string; state?: string; country: string; lat: number; lon: number }>;
    return NextResponse.json({ locations: locations.map(({ name, state, country, lat, lon }) => ({ name, state, country, lat, lon })) });
  } catch {
    return NextResponse.json({ code: "WEATHER_UNAVAILABLE" }, { status: 502 });
  }
}
