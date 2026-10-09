"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import styles from "./styles.module.css";

const endpointBase = "https://pokeapi.co/api/v2/pokemon/";
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
    back: "返回作品集", eyebrow: "改一个名字，观察三个地方变化", title: "PokéAPI 数据实验室",
    intro: "先看到百变怪 Ditto。试着把名字改成 pikachu：请求网址、API 返回的 JSON、右边的卡片都会跟着变。",
    edit: "你可以更改网址最后的宝可梦名字", examples: "点一个例子试试", ask: "发送请求", asking: "正在请求…", success: "已收到 API 回复", error: "没有收到结果。请检查名字或网络后重试。",
    invalid: "请输入英文名字或编号，例如 pikachu 或 25。", notFound: "API 没找到这个名字，试试下方的例子。",
    normal: "普通形态", shiny: "闪光形态", type: "属性", height: "身高", weight: "体重", abilities: "特性", hidden: "隐藏特性", move: "招式",
    stats: "基础能力值", statsNote: "这些数字来自返回的 stats 数组。百变怪的六项数值刚好相同。", otherStatsNote: "这些数字来自这只宝可梦返回的 stats 数组。",
    how: "你改了哪里？", step1: "你改请求", step1Body: "把网址末尾的 ditto 改成 pikachu，再按“发送请求”。",
    step2: "API 决定回答", step2Body: "PokéAPI 根据名字返回另一份 JSON。你不能在这里修改它的数据库。",
    step3: "网页改变显示", step3Body: "页面读取新 JSON 的 name、sprites 和 stats，换成新的图片与数字。",
    inputLabel: "你输入的名字", jsonLabel: "API 返回的 name", screenLabel: "卡片显示", readOnly: "“闪光形态”只切换 JSON 里已有的图片；它不会改变 API 的原始数据。",
    inspect: "展开这次收到的 JSON", inspectBody: "在下面寻找 name、sprites 或 stats，就能看到页面的数据来源。",
    source: "打开 PokéAPI 原始地址", waiting: "等待 API 回复…", response: "API 回复", responseTime: "耗时", ms: "毫秒",
  },
  en: {
    back: "Back to portfolio", eyebrow: "CHANGE ONE NAME · WATCH THREE THINGS CHANGE", title: "PokéAPI Data Lab",
    intro: "Start with Ditto. Change the name to pikachu and watch the request URL, the API's JSON, and the card change together.",
    edit: "You can edit the Pokémon name at the end of the URL", examples: "Try an example", ask: "Send request", asking: "Requesting…", success: "API response received", error: "No result received. Check the name or connection and retry.",
    invalid: "Enter a name or number, such as pikachu or 25.", notFound: "The API could not find that name. Try an example below.",
    normal: "Normal form", shiny: "Shiny form", type: "Type", height: "Height", weight: "Weight", abilities: "Abilities", hidden: "Hidden ability", move: "Move",
    stats: "Base stats", statsNote: "These numbers come from the returned stats array. Ditto happens to have the same value for all six.", otherStatsNote: "These numbers come from this Pokémon's returned stats array.",
    how: "What did you change?", step1: "You change the request", step1Body: "Change ditto to pikachu at the end of the URL, then press “Send request.”",
    step2: "The API decides its answer", step2Body: "PokéAPI returns another JSON response. This page cannot edit PokéAPI's database.",
    step3: "The page changes its display", step3Body: "The page reads name, sprites, and stats from the new JSON to show new art and numbers.",
    inputLabel: "Name you entered", jsonLabel: "API's returned name", screenLabel: "Card on this page", readOnly: "“Shiny form” only switches between images already in the JSON; it does not change the API's data.",
    inspect: "Open the returned JSON", inspectBody: "Find name, sprites, or stats below to see where the page gets its data.",
    source: "Open the PokéAPI endpoint", waiting: "Waiting for API response…", response: "API response", responseTime: "Time", ms: "ms",
  },
} as const;

const statLabels: Record<string, { zh: string; en: string }> = {
  hp: { zh: "生命", en: "HP" }, attack: { zh: "攻击", en: "Attack" }, defense: { zh: "防御", en: "Defense" },
  "special-attack": { zh: "特攻", en: "Sp. Atk" }, "special-defense": { zh: "特防", en: "Sp. Def" }, speed: { zh: "速度", en: "Speed" },
};

function isPokemon(value: unknown): value is Pokemon {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Pokemon>;
  return typeof item.name === "string" && typeof item.id === "number" && Array.isArray(item.stats) &&
    Array.isArray(item.types) && Array.isArray(item.abilities) && Array.isArray(item.moves) && !!item.sprites;
}

function titleCase(value: string) {
  return value.replaceAll("-", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function DittoLab() {
  const [language, setLanguage] = useState<Language>("zh");
  const [input, setInput] = useState("ditto");
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorKind, setErrorKind] = useState<"invalid" | "notFound" | "network">("network");
  const [shiny, setShiny] = useState(false);
  const [elapsed, setElapsed] = useState<number | null>(null);
  const sequence = useRef(0);
  const t = words[language];

  const load = useCallback(async (rawName: string) => {
    const request = ++sequence.current;
    const name = rawName.trim().toLowerCase();
    setPokemon(null);
    setShiny(false);
    setElapsed(null);
    if (!/^[a-z0-9-]+$/.test(name)) {
      setErrorKind("invalid");
      setStatus("error");
      return;
    }
    const started = performance.now();
    setStatus("loading");
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);
    try {
      const result = await fetch(endpointBase + encodeURIComponent(name), { cache: "no-store", signal: controller.signal });
      if (result.status === 404) throw new Error("NOT_FOUND");
      if (!result.ok) throw new Error(`HTTP ${result.status}`);
      const body: unknown = await result.json();
      if (!isPokemon(body)) throw new Error("Unexpected response");
      if (request !== sequence.current) return;
      setPokemon(body);
      setElapsed(Math.round(performance.now() - started));
      setStatus("ready");
    } catch (error) {
      if (request === sequence.current) {
        setErrorKind(error instanceof Error && error.message === "NOT_FOUND" ? "notFound" : "network");
        setStatus("error");
      }
    } finally {
      window.clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    void load("ditto");
    return () => { sequence.current += 1; };
  }, [load]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void load(input);
  }

  function select(name: string) {
    setInput(name);
    void load(name);
  }

  const message = status === "loading" ? t.asking : status === "ready" ? `${t.success} · 200 OK` : t[errorKind === "notFound" ? "notFound" : errorKind === "invalid" ? "invalid" : "error"];
  const previewName = input.trim().toLowerCase() || "…";
  const currentUrl = endpointBase + (pokemon?.name ?? (/^[a-z0-9-]+$/.test(previewName) ? previewName : "ditto"));

  const artwork = pokemon && (shiny
    ? pokemon.sprites.other?.["official-artwork"]?.front_shiny ?? pokemon.sprites.front_shiny
    : pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default);

  return <main className={`${styles.page} ${shiny ? styles.shinyPage : ""}`} lang={language === "zh" ? "zh-CN" : "en"}>
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <Link className={styles.backLink} href="/">↖ {t.back}</Link>
        <span className={styles.wordmark}>POKÉAPI <span>✦</span> LAB</span>
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
          <form className={styles.requestForm} onSubmit={submit}>
            <label htmlFor="pokemon-name">{t.edit}</label>
            <div className={styles.endpoint}><strong>GET</strong><code>{endpointBase}<mark>{previewName}</mark></code></div>
            <div className={styles.inputRow}>
              <input id="pokemon-name" value={input} onChange={(event) => setInput(event.target.value)} autoComplete="off" spellCheck={false} aria-label={t.edit} />
              <button className={styles.requestButton} type="submit" disabled={status === "loading"}>↗ &nbsp;{status === "loading" ? t.asking : t.ask}</button>
            </div>
          </form>
          <div className={styles.examples}><span>{t.examples}</span>{["ditto", "pikachu", "eevee"].map((name) => <button type="button" key={name} onClick={() => select(name)}>{name}</button>)}</div>
          <p className={`${styles.status} ${status === "error" ? styles.error : ""}`} role="status" aria-live="polite">● &nbsp;{message}</p>
        </div>
        <div className={styles.dittoCard}>
          <div className={styles.cardTop}><span>POKÉDEX / {String(pokemon?.id ?? 132).padStart(3, "0")}</span><span>✦</span></div>
          <div className={styles.spriteStage}><span className={styles.halo} aria-hidden="true" />{artwork ? <img className={styles.sprite} src={artwork} alt={`${shiny ? "Shiny " : ""}${titleCase(pokemon?.name ?? "Pokémon")}`} /> : <span className={styles.spritePlaceholder}>{t.waiting}</span>}</div>
          <div className={styles.cardBottom}>
            <div><small>name + sprites</small><strong>{pokemon ? titleCase(pokemon.name) : "—"}</strong></div>
            <div className={styles.formSwitch} aria-label="Pokémon form">
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
            <p>{pokemon?.name === "ditto" ? t.statsNote : t.otherStatsNote}</p>
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
        <div className={styles.pipeline}>
          <div><small>{t.inputLabel}</small><strong>{previewName}</strong></div><span aria-hidden="true">→</span>
          <div><small>{t.jsonLabel}</small><strong>{pokemon?.name ?? "—"}</strong></div><span aria-hidden="true">→</span>
          <div><small>{t.screenLabel}</small><strong>{pokemon ? titleCase(pokemon.name) : "—"}</strong></div>
        </div>
        <div className={styles.steps}>
          <article className={styles.step}><span>01 / ↗</span><h3>{t.step1}</h3><p>{t.step1Body}</p></article>
          <article className={styles.step}><span>02 / {`{ }`}</span><h3>{t.step2}</h3><p>{t.step2Body}</p></article>
          <article className={styles.step}><span>03 / ✳</span><h3>{t.step3}</h3><p>{t.step3Body}</p></article>
        </div>
        <p className={styles.readOnly}>{t.readOnly}</p>
        <details className={styles.json}><summary>{t.inspect}<span aria-hidden="true">＋</span></summary><p>{t.inspectBody}</p><pre>{pokemon ? JSON.stringify(pokemon, null, 2) : status === "error" ? t.error : t.asking}</pre></details>
      </section>
      <footer className={styles.footer}><span>POKÉAPI LAB · 2026</span><a href={currentUrl} target="_blank" rel="noreferrer">{t.source} ↗</a></footer>
    </div>
  </main>;
}
