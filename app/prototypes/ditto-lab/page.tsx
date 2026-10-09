"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./styles.module.css";

const endpoint = "https://pokeapi.co/api/v2/pokemon/ditto";
type Language = "zh" | "en";
type Pokemon = {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: { type: { name: string } }[];
  abilities: { ability: { name: string }; is_hidden: boolean }[];
  stats: { base_stat: number; stat: { name: string } }[];
  moves: { move: { name: string } }[];
  sprites: {
    front_default: string | null;
    front_shiny: string | null;
    other?: { "official-artwork"?: { front_default: string | null; front_shiny: string | null } };
  };
};

const words = {
  zh: {
    back: "返回作品集", eyebrow: "一个真实 API · 一个会变身的小实验", title: "Ditto 数据实验室",
    intro: "网页向 PokéAPI 询问百变怪的数据，再把返回的 JSON 变成你看到的卡片。按按钮，亲自看一次请求过程。",
    ask: "重新请求数据", asking: "正在请求…", success: "已收到 API 回复", error: "暂时无法连接 PokéAPI，请重试。",
    normal: "普通形态", shiny: "闪光形态", type: "属性", height: "身高", weight: "体重", abilities: "特性", hidden: "隐藏特性", move: "招式",
    stats: "基础能力值", statsNote: "这些数字来自 stats 数组。百变怪的六项数值刚好相同。",
    how: "API 到底做了什么？", step1: "网页发出请求", step1Body: "浏览器访问这个网址，询问“百变怪的数据是什么？”",
    step2: "API 返回 JSON", step2Body: "JSON 是有名字的数据格子，例如 name、id、sprites 和 stats。",
    step3: "网页画出结果", step3Body: "代码读取这些格子，显示图片、编号、特性和能力值。",
    inspect: "展开这次收到的 JSON", inspectBody: "在下面寻找 name、sprites 或 stats，就能看到页面的数据来源。",
    source: "打开 PokéAPI 原始地址", waiting: "等待百变怪出现…", response: "API 回复", responseTime: "耗时", ms: "毫秒",
  },
  en: {
    back: "Back to portfolio", eyebrow: "ONE REAL API · ONE SHAPESHIFTING EXPERIMENT", title: "Ditto Data Lab",
    intro: "The page asks PokéAPI for Ditto, then turns the returned JSON into the cards you see. Press the button to watch another request.",
    ask: "Request data again", asking: "Requesting…", success: "API response received", error: "PokéAPI is unavailable. Please retry.",
    normal: "Normal form", shiny: "Shiny form", type: "Type", height: "Height", weight: "Weight", abilities: "Abilities", hidden: "Hidden ability", move: "Move",
    stats: "Base stats", statsNote: "These numbers come from the stats array. Ditto happens to have the same value for all six.",
    how: "What does an API do?", step1: "The page sends a request", step1Body: "Your browser visits this URL and asks, “What is Ditto’s data?”",
    step2: "The API returns JSON", step2Body: "JSON is labeled data, with fields such as name, id, sprites, and stats.",
    step3: "The page draws the result", step3Body: "Code reads those fields and shows the image, number, abilities, and stats.",
    inspect: "Open the returned JSON", inspectBody: "Find name, sprites, or stats below to see where the page gets its data.",
    source: "Open the PokéAPI endpoint", waiting: "Waiting for Ditto…", response: "API response", responseTime: "Time", ms: "ms",
  },
} as const;

const statLabels: Record<string, { zh: string; en: string }> = {
  hp: { zh: "生命", en: "HP" }, attack: { zh: "攻击", en: "Attack" }, defense: { zh: "防御", en: "Defense" },
  "special-attack": { zh: "特攻", en: "Sp. Atk" }, "special-defense": { zh: "特防", en: "Sp. Def" }, speed: { zh: "速度", en: "Speed" },
};

function isPokemon(value: unknown): value is Pokemon {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Pokemon>;
  return item.name === "ditto" && typeof item.id === "number" && Array.isArray(item.stats) &&
    Array.isArray(item.types) && Array.isArray(item.abilities) && !!item.sprites;
}

function titleCase(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function DittoLab() {
  const [language, setLanguage] = useState<Language>("zh");
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [shiny, setShiny] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const sequence = useRef(0);
  const t = words[language];

  const load = useCallback(async () => {
    const request = ++sequence.current;
    const started = performance.now();
    setStatus("loading");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const result = await fetch(endpoint, { cache: "no-store", signal: controller.signal });
      if (!result.ok) throw new Error(`HTTP ${result.status}`);
      const body: unknown = await result.json();
      if (!isPokemon(body)) throw new Error("Unexpected response");
      if (request !== sequence.current) return;
      setPokemon(body);
      setElapsed(Math.round(performance.now() - started));
      setStatus("ready");
    } catch {
      if (request === sequence.current) setStatus("error");
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => { sequence.current += 1; };
  }, [load]);

  const artwork = pokemon && (shiny
    ? pokemon.sprites.other?.["official-artwork"]?.front_shiny ?? pokemon.sprites.front_shiny
    : pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default);

  return <main className={`${styles.page} ${shiny ? styles.shinyPage : ""}`} lang={language === "zh" ? "zh-CN" : "en"}>
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link className={styles.backLink} href="/">↖ {t.back}</Link>
        <span className={styles.wordmark}>DITTO <span>✦</span> API LAB</span>
        <div className={styles.languageSwitch} aria-label="Language">
          <button type="button" aria-pressed={language === "zh"} onClick={() => setLanguage("zh")}>中文</button>
          <button type="button" aria-pressed={language === "en"} onClick={() => setLanguage("en")}>EN</button>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="ditto-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}><span aria-hidden="true">●</span>{t.eyebrow}</p>
          <h1 id="ditto-title">{t.title}<span aria-hidden="true">✳</span></h1>
          <p className={styles.intro}>{t.intro}</p>
          <div className={styles.endpoint}><strong>GET</strong><code>{endpoint}</code></div>
          <div className={styles.requestRow}>
            <button className={styles.requestButton} type="button" onClick={() => void load()} disabled={status === "loading"}>↻ &nbsp;{status === "loading" ? t.asking : t.ask}</button>
            <span className={`${styles.status} ${status === "error" ? styles.error : ""}`} role="status" aria-live="polite">● &nbsp;{status === "loading" ? t.asking : status === "error" ? t.error : `${t.success} · 200 OK`}</span>
          </div>
        </div>
        <div className={styles.dittoCard}>
          <div className={styles.cardTop}><span>POKÉDEX / {String(pokemon?.id ?? 132).padStart(3, "0")}</span><span>✦</span></div>
          <div className={styles.spriteStage}><span className={styles.halo} aria-hidden="true" />{artwork ? <img className={styles.sprite} src={artwork} alt={shiny ? "Shiny Ditto" : "Ditto"} /> : <span className={styles.spritePlaceholder}>{t.waiting}</span>}</div>
          <div className={styles.cardBottom}>
            <div><small>name + sprites</small><strong>{pokemon ? titleCase(pokemon.name) : "Ditto"}</strong></div>
            <div className={styles.formSwitch} aria-label="Ditto form">
              <button type="button" aria-pressed={!shiny} onClick={() => setShiny(false)}>{t.normal}</button>
              <button type="button" aria-pressed={shiny} onClick={() => setShiny(true)} disabled={!pokemon?.sprites.front_shiny}>{t.shiny}</button>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.dataSection} aria-label={t.response}>
        <div className={styles.sectionMeta}><span>01 / {t.response}</span><span>{status === "ready" ? "200 OK" : status === "error" ? "ERROR" : "…"}{elapsed !== null && status === "ready" ? ` · ${t.responseTime}: ${elapsed} ${t.ms}` : ""}</span></div>
        <div className={styles.facts}>
          <article className={styles.fact}><code>id</code><strong>#{String(pokemon?.id ?? 0).padStart(3, "0")}</strong><small>Pokédex</small></article>
          <article className={styles.fact}><code>types[0].type.name</code><strong>{pokemon ? titleCase(pokemon.types[0]?.type.name ?? "—") : "—"}</strong><small>{t.type}</small></article>
          <article className={styles.fact}><code>height</code><strong>{pokemon ? (pokemon.height / 10).toFixed(1) : "—"}<em>m</em></strong><small>{t.height}</small></article>
          <article className={styles.fact}><code>weight</code><strong>{pokemon ? (pokemon.weight / 10).toFixed(1) : "—"}<em>kg</em></strong><small>{t.weight}</small></article>
        </div>
        <div className={styles.details}>
          <article className={styles.detailCard}>
            <div className={styles.detailHeading}><h2>{t.stats}</h2><code>stats[].base_stat</code></div>
            <p>{t.statsNote}</p>
            <div className={styles.statList}>{pokemon?.stats.map(({ base_stat, stat }) => <div className={styles.stat} key={stat.name}>
              <span>{statLabels[stat.name]?.[language] ?? titleCase(stat.name)}</span><div className={styles.statTrack}><span style={{ width: `${Math.min(100, base_stat / 160 * 100)}%` }} /></div><strong>{base_stat}</strong>
            </div>) ?? <span>{t.waiting}</span>}</div>
          </article>
          <article className={styles.detailCard}>
            <div className={styles.detailHeading}><h2>{t.abilities}</h2><code>abilities[]</code></div>
            <div className={styles.abilityList}>{pokemon?.abilities.map(({ ability, is_hidden }) => <div className={styles.ability} key={ability.name}><span aria-hidden="true">✳</span><div><strong>{titleCase(ability.name)}</strong><small>{is_hidden ? t.hidden : t.abilities}</small></div></div>) ?? <span>{t.waiting}</span>}</div>
            <div className={styles.move}><span>{t.move} · moves[0].move.name</span><strong>{pokemon?.moves[0] ? titleCase(pokemon.moves[0].move.name) : "—"}</strong></div>
          </article>
        </div>
      </section>

      <section className={styles.learn} aria-labelledby="api-explainer">
        <div className={styles.sectionMeta}><span>02 / API 101</span><span>REQUEST → RESPONSE → INTERFACE</span></div>
        <h2 id="api-explainer">{t.how}</h2>
        <div className={styles.steps}>
          <article className={styles.step}><span>01 / ↗</span><h3>{t.step1}</h3><p>{t.step1Body}</p></article>
          <article className={styles.step}><span>02 / {`{ }`}</span><h3>{t.step2}</h3><p>{t.step2Body}</p></article>
          <article className={styles.step}><span>03 / ✳</span><h3>{t.step3}</h3><p>{t.step3Body}</p></article>
        </div>
        <details className={styles.json}><summary>{t.inspect}<span aria-hidden="true">＋</span></summary><p>{t.inspectBody}</p><pre>{pokemon ? JSON.stringify(pokemon, null, 2) : status === "error" ? t.error : t.asking}</pre></details>
      </section>
      <footer className={styles.footer}><span>DITTO API LAB · 2026</span><a href={endpoint} target="_blank" rel="noreferrer">{t.source} ↗</a></footer>
    </div>
  </main>;
}
