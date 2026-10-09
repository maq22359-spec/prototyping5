"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import "./styles.css";
import {
  ArrowRight, Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain,
  CloudSnow, CloudSun, Droplets, LocateFixed, MapPin, RefreshCw, Search,
  Sun, Sunrise, Sunset, Thermometer, Wind,
} from "lucide-react";
import type { WeatherResponse } from "@/lib/local-weather";

type Language = "zh" | "en";
type Unit = "C" | "F";
type Place = { name: string; state?: string; country: string; lat: number; lon: number };

const copy = {
  zh: {
    brand: "天气此刻", eyebrow: "你的本地天气，一目了然", title: "看看天空，安排今天。",
    subtitle: "实时天气与未来五天的变化，都在这里。", searchPlaceholder: "搜索城市，例如 Shanghai",
    search: "搜索", useLocation: "使用我的位置", refresh: "刷新天气", now: "当前天气",
    details: "天气详情", feelsLike: "体感温度", humidity: "湿度", wind: "风速",
    sunrise: "日出", sunset: "日落", forecast: "未来五天",
    forecastNote: "根据当地时间，每 3 小时预报汇总", rain: "降水概率", today: "今天",
    updated: "更新于", locating: "正在获取你的位置…", loading: "正在读取天气…",
    searching: "正在搜索城市…", locationDenied: "无法获取位置。你可以在上方搜索城市。",
    invalidCity: "请输入至少两个字符的城市名称。", noCity: "没有找到这个城市。试试城市名加国家或地区。",
    configMissing: "天气服务还未连接 API key。完成配置后即可查看实时数据。",
    keyInvalid: "OpenWeather API key 无效或尚未生效。", rateLimited: "天气服务请求过多，请稍后再试。",
    unavailable: "暂时无法获取天气，请稍后刷新。", chooseCity: "选择城市",
    emptyTitle: "天气，从你所在的地方开始。", emptyBody: "允许定位，或搜索一个城市，即可查看当地天气。",
    attribution: "天气数据由 OpenWeather 提供",
    forecastNow: "实时天气", localForecast: "接下来五天", noWeather: "选择城市，查看此刻天空。",
    weatherStory: {
      storm: "云层翻涌，雷暴正在经过。出门前留意天气变化。",
      rain: "雨落在城市上空，带一把伞，让行程从容一点。",
      snow: "空气变得清冷，雪正轻轻落下。注意保暖。",
      mist: "空气朦胧，远处的风景藏在雾里。",
      clear: "天空明亮，适合走出去享受今天。",
      night: "夜空清朗，让今天慢慢安静下来。",
      cloudy: "云层缓缓移动，天气也在悄悄变化。",
    },
    clear: "晴朗", partlyCloudy: "局部多云", cloudy: "多云", drizzle: "毛毛雨",
    rainWeather: "有雨", snow: "有雪", storm: "雷暴", mist: "有雾",
  },
  en: {
    brand: "Weather, now", eyebrow: "YOUR LOCAL WEATHER, AT A GLANCE", title: "Look up. Plan ahead.",
    subtitle: "Current conditions and the next five days, all in one place.", searchPlaceholder: "Search a city, e.g. London",
    search: "Search", useLocation: "Use my location", refresh: "Refresh weather", now: "Current conditions",
    details: "The details", feelsLike: "Feels like", humidity: "Humidity", wind: "Wind",
    sunrise: "Sunrise", sunset: "Sunset", forecast: "The next five days",
    forecastNote: "3-hour forecasts grouped by local day", rain: "Chance of rain", today: "Today",
    updated: "Updated", locating: "Finding your location…", loading: "Reading the weather…",
    searching: "Searching cities…", locationDenied: "Location is unavailable. Search for a city above instead.",
    invalidCity: "Enter at least two characters of a city name.",
    noCity: "No matching city found. Try adding a country or region.",
    configMissing: "The weather service needs an API key before live data can appear.",
    keyInvalid: "The OpenWeather API key is invalid or not active yet.",
    rateLimited: "Too many weather requests. Please try again later.",
    unavailable: "Weather is temporarily unavailable. Please refresh later.",
    chooseCity: "Choose a city", emptyTitle: "Weather starts where you are.",
    emptyBody: "Allow location access or search for a city to see its forecast.",
    attribution: "Weather data by OpenWeather",
    forecastNow: "LIVE WEATHER", localForecast: "The next five days", noWeather: "Choose a city to see the sky right now.",
    weatherStory: {
      storm: "Thunderclouds are moving through. Keep an eye on changing conditions.",
      rain: "Rain is moving across the city. Take an umbrella and enjoy a slower pace.",
      snow: "The air is crisp and snow is falling. Keep warm out there.",
      mist: "A soft haze hangs in the air, blurring the view beyond.",
      clear: "The sky is bright. Make the most of the day outside.",
      night: "A clear night sky brings a quieter close to the day.",
      cloudy: "Clouds drift overhead as the weather gently shifts.",
    },
    clear: "Clear sky", partlyCloudy: "Partly cloudy", cloudy: "Cloudy", drizzle: "Drizzle",
    rainWeather: "Rain", snow: "Snow", storm: "Thunderstorms", mist: "Mist",
  },
} as const;

function condition(code: number, language: Language) {
  const t = copy[language];
  if (code >= 200 && code < 300) return { label: t.storm, Icon: CloudLightning };
  if (code >= 300 && code < 400) return { label: t.drizzle, Icon: CloudDrizzle };
  if (code >= 500 && code < 600) return { label: t.rainWeather, Icon: CloudRain };
  if (code >= 600 && code < 700) return { label: t.snow, Icon: CloudSnow };
  if (code >= 700 && code < 800) return { label: t.mist, Icon: CloudFog };
  if (code === 800) return { label: t.clear, Icon: Sun };
  if (code <= 802) return { label: t.partlyCloudy, Icon: CloudSun };
  return { label: t.cloudy, Icon: Cloud };
}

function localTime(timestamp: number, offset: number, language: Language) {
  if (!timestamp) return "—";
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    hour: "numeric", minute: "2-digit", timeZone: "UTC",
  }).format(new Date((timestamp + offset) * 1000));
}

function dayLabel(date: string, language: Language) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
  }).format(new Date(date + "T12:00:00Z"));
}

type WeatherMood = "storm" | "rain" | "snow" | "mist" | "clear" | "night" | "cloudy";

function weatherMood(code: number, isNight: boolean): WeatherMood {
  if (code >= 200 && code < 300) return "storm";
  if (code >= 300 && code < 600) return "rain";
  if (code >= 600 && code < 700) return "snow";
  if (code >= 700 && code < 800) return "mist";
  if (code === 800) return isNight ? "night" : "clear";
  return "cloudy";
}

function graphY(value: number, min: number, max: number) {
  return 58 - ((value - min) / Math.max(1, max - min)) * 18;
}

export default function LocalWeatherPrototype() {
  const [language, setLanguage] = useState<Language>("zh");
  const [unit, setUnit] = useState<Unit>("C");
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState<"locating" | "weather" | "searching" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ lat: number; lon: number } | null>(null);
  const started = useRef(false);
  const requestId = useRef(0);
  const t = copy[language];
  const degree = (celsius: number) => String(Math.round(unit === "C" ? celsius : celsius * 9 / 5 + 32)) + "°";
  const errorText = (code: string) => {
    if (code === "LOCATION_DENIED") return t.locationDenied;
    if (code === "NO_CITY") return t.noCity;
    if (code === "CONFIG_MISSING") return t.configMissing;
    if (code === "KEY_INVALID") return t.keyInvalid;
    if (code === "RATE_LIMITED") return t.rateLimited;
    if (code === "INVALID_CITY") return t.invalidCity;
    return t.unavailable;
  };

  async function loadWeather(lat: number, lon: number, id = ++requestId.current) {
    setSelected({ lat, lon });
    setLoading("weather");
    setError(null);
    setPlaces([]);
    try {
      const result = await fetch("/api/local-weather/weather?lat=" + encodeURIComponent(lat) + "&lon=" + encodeURIComponent(lon), { cache: "no-store" });
      const body = await result.json() as WeatherResponse & { code?: string };
      if (!result.ok) throw new Error(body.code || "WEATHER_UNAVAILABLE");
      if (id === requestId.current) setWeather(body as WeatherResponse);
    } catch (caught) {
      if (id === requestId.current) setError(caught instanceof Error ? caught.message : "WEATHER_UNAVAILABLE");
    } finally {
      if (id === requestId.current) setLoading(null);
    }
  }

  function locate() {
    const id = ++requestId.current;
    setLoading("locating");
    setError(null);
    setPlaces([]);
    if (!navigator.geolocation) {
      setLoading(null);
      setError("LOCATION_DENIED");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { if (id === requestId.current) void loadWeather(coords.latitude, coords.longitude, id); },
      () => { if (id === requestId.current) { setLoading(null); setError("LOCATION_DENIED"); } },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 },
    );
  }

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    locate();
    // First-visit location request; changing language does not repeat it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function searchCity(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const city = query.trim();
    if (city.length < 2) { setError("INVALID_CITY"); return; }
    const id = ++requestId.current;
    setLoading("searching");
    setError(null);
    setPlaces([]);
    try {
      const result = await fetch("/api/local-weather/locations?q=" + encodeURIComponent(city), { cache: "no-store" });
      const body = await result.json() as { code?: string; locations: Place[] };
      if (!result.ok) throw new Error(body.code || "WEATHER_UNAVAILABLE");
      if (id !== requestId.current) return;
      const options = body.locations as Place[];
      if (options.length === 0) { setError("NO_CITY"); return; }
      if (options.length === 1) { void loadWeather(options[0].lat, options[0].lon); return; }
      setPlaces(options);
    } catch (caught) {
      if (id === requestId.current) setError(caught instanceof Error ? caught.message : "WEATHER_UNAVAILABLE");
    } finally {
      if (id === requestId.current) setLoading(null);
    }
  }

  const currentCondition = weather ? condition(weather.current.conditionCode, language) : null;
  const currentLocalDate = weather
    ? new Date((weather.current.observedAt + weather.location.timezone) * 1000).toISOString().slice(0, 10)
    : null;
  const isNight = weather
    ? weather.current.observedAt < weather.current.sunrise || weather.current.observedAt > weather.current.sunset
    : false;
  const mood = weather ? weatherMood(weather.current.conditionCode, isNight) : "cloudy";
  const artwork = mood === "clear" ? "/local-weather-clear.png" : mood === "snow" ? "/local-weather-snow.png" : "/local-weather-storm.png";
  const dayProgress = weather
    ? Math.max(0, Math.min(1, (weather.current.observedAt - weather.current.sunrise) / Math.max(1, weather.current.sunset - weather.current.sunrise)))
    : 0;
  const highs = weather?.daily.map((day) => day.maxC) ?? [];
  const low = Math.min(...highs);
  const high = Math.max(...highs);
  const forecastPoints = highs.map((value, index) => `${10 + index * 20},${graphY(value, low, high)}`).join(" ");

  return <main lang={language === "zh" ? "zh-CN" : "en"} className={`weather-page site-shell mood-${mood}${isNight ? " is-night" : ""}`}>
    <div className="ambient ambient-one" aria-hidden="true" /><div className="ambient ambient-two" aria-hidden="true" />
    <div className="dashboard">
      <div className="sky-backdrop" aria-hidden="true" />
      <header className="topbar">
        <div className="brand"><span className="brand-mark"><CloudSun size={20} strokeWidth={1.7} /></span><span>{t.brand}</span><span className="brand-divider" /><span className="brand-caption">LOCAL WEATHER</span></div>
        <div className="top-controls">
          <div className="segmented" aria-label="Language">
            <button type="button" aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>中文</button>
            <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
          </div>
          <div className="segmented" aria-label="Temperature unit">
            <button type="button" aria-pressed={unit === "C"} onClick={() => setUnit("C")}>°C</button>
            <button type="button" aria-pressed={unit === "F"} onClick={() => setUnit("F")}>°F</button>
          </div>
        </div>
      </header>

      <div className="search-row">
        <form className="search-form" onSubmit={searchCity} role="search">
          <Search size={17} aria-hidden="true" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.searchPlaceholder} aria-label={t.searchPlaceholder} />
          <button type="submit" className="search-button" disabled={loading === "searching"} aria-label={t.search}><ArrowRight size={18} /></button>
        </form>
        <button className="location-button" type="button" onClick={locate} disabled={loading === "locating"}><LocateFixed size={16} /><span>{t.useLocation}</span></button>
        <button type="button" className="refresh-button" onClick={() => selected && void loadWeather(selected.lat, selected.lon)} aria-label={t.refresh} title={t.refresh} disabled={!selected || loading === "weather"}><RefreshCw size={17} /></button>
      </div>

      {places.length > 0 && <section className="place-results" aria-label={t.chooseCity}>
        <p>{t.chooseCity}</p>
        {places.map((place) => <button type="button" key={place.lat + "," + place.lon} onClick={() => void loadWeather(place.lat, place.lon)}>
          <MapPin size={15} /><span>{place.name}{place.state ? ", " + place.state : ""}, {place.country}</span><ArrowRight size={15} />
        </button>)}
      </section>}
      {(loading || error) && <div className={"status" + (error ? " status-error" : "")} role="status" aria-live="polite">
        {loading === "locating" ? t.locating : loading === "weather" ? t.loading : loading === "searching" ? t.searching : error ? errorText(error) : null}
      </div>}

      <section className="hero" aria-label={t.now}>
        <div className="hero-copy">
          <div className="live-label"><span className="pulse-dot" />{t.forecastNow}</div>
          <h1>{weather ? currentCondition?.label : t.emptyTitle}</h1>
          <p className="weather-story">{weather ? t.weatherStory[mood] : t.noWeather}</p>
          {weather ? <>
            <div className="hero-temperature">{degree(weather.current.tempC)}<span>{unit}</span></div>
            <div className="hero-location"><MapPin size={15} />{weather.location.name}{weather.location.country ? ", " + weather.location.country : ""}</div>
            <div className="updated-time">{t.updated} {localTime(weather.current.observedAt, weather.location.timezone, language)} · {t.feelsLike} {degree(weather.current.feelsLikeC)}</div>
          </> : <div className="empty-cta"><LocateFixed size={16} />{t.emptyBody}</div>}
        </div>

        <div className="weather-art" aria-hidden="true">
          {mood === "night" ? <div className="moon" /> : <Image src={artwork} alt="" width={mood === "clear" ? 1536 : 1774} height={mood === "clear" ? 1024 : 887} unoptimized priority />}
          {mood === "rain" && <div className="rain-fall" />}
          {mood === "mist" && <div className="mist-layer" />}
        </div>

        <aside className="insights" aria-label={t.details}>
          <div className="insight-card wind-card">
            <div className="insight-heading"><span><Wind size={15} />{t.wind}</span></div>
            <strong>{weather ? Math.round(weather.current.windMs * 3.6) : "—"}<small>km/h</small></strong>
            <div className="wind-lines" aria-hidden="true"><i /><i /><i /></div>
          </div>
          <div className="insight-card sun-card">
            <div className="insight-heading"><span><Sunrise size={15} />{t.sunrise}</span><span><Sunset size={15} />{t.sunset}</span></div>
            <div className="sun-arc" aria-hidden="true">
              <svg viewBox="0 0 100 75" preserveAspectRatio="none"><path d="M 10 66 A 40 42 0 0 1 90 66" /><line x1="8" y1="66" x2="92" y2="66" /><circle cx={10 + dayProgress * 80} cy={66 - Math.sin(dayProgress * Math.PI) * 42} r="3.5" /></svg>
            </div>
            <div className="sun-times"><span>{weather ? localTime(weather.current.sunrise, weather.location.timezone, language) : "—"}</span><span>{weather ? localTime(weather.current.sunset, weather.location.timezone, language) : "—"}</span></div>
          </div>
          <div className="insight-mini"><span><Thermometer size={15} />{t.feelsLike} <strong>{weather ? degree(weather.current.feelsLikeC) : "—"}</strong></span><span><Droplets size={15} />{t.humidity} <strong>{weather ? `${weather.current.humidity}%` : "—"}</strong></span></div>
        </aside>
      </section>

      <section className="forecast-section" aria-label={t.forecast}>
        <div className="forecast-heading"><div><span className="section-kicker">FORECAST / 05</span><h2>{t.localForecast}</h2></div><p>{t.forecastNote}</p></div>
        {weather && weather.daily.length > 0 ? <div className="forecast-scroll"><div className="forecast-timeline">
          <svg className="forecast-curve" viewBox="0 0 100 90" preserveAspectRatio="none" aria-hidden="true"><polyline points={forecastPoints} /></svg>
          {weather.daily.map((day, index) => {
            const { label, Icon } = condition(day.conditionCode, language);
            return <article className="forecast-day" key={day.date}>
              <span className="day-name">{day.date === currentLocalDate ? t.today : dayLabel(day.date, language)}</span>
              <strong className="day-high">{degree(day.maxC)}</strong>
              <span className="day-low">{degree(day.minC)}</span>
              <span className="forecast-marker" style={{ top: `${graphY(day.maxC, low, high) / 90 * 100}%` }}><Icon size={19} strokeWidth={1.6} aria-hidden="true" /></span>
              <span className="day-condition">{label}</span>
              <span className="day-rain"><Droplets size={12} />{day.precipitationChance}%</span>
              <span className="sr-only">{index + 1}. {day.date}</span>
            </article>;
          })}
        </div></div> : <p className="forecast-empty">{t.noWeather}</p>}
      </section>
      <footer className="footer"><span>{weather ? `${weather.location.name} · ${t.updated} ${localTime(weather.current.observedAt, weather.location.timezone, language)}` : t.brand}</span><span>{t.attribution}</span></footer>
    </div>
  </main>;
}
