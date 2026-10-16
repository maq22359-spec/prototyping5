"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
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
    intro: "先看到百变怪 Ditto。试着把名字改成 pikachu：请求网址、API 返回的 JSON 和卡牌都会跟着变。",
    edit: "你可以更改网址最后的宝可梦名字", examples: "挑一只宝可梦", browseHelp: "选分类，再点名字即可换卡牌", ask: "发送请求", asking: "正在请求…", success: "已收到 API 回复", error: "没有收到结果。请检查名字或网络后重试。",
    invalid: "请输入英文名字或编号，例如 pikachu 或 25。", notFound: "API 没找到这个名字，试试下方的例子。",
    normal: "普通形态", shiny: "闪光形态", type: "属性", height: "身高", weight: "体重", abilities: "特性", hidden: "隐藏特性", move: "招式",
    stats: "基础能力值", statsNote: "这些数字来自返回的 stats 数组。百变怪的六项数值刚好相同。", otherStatsNote: "这些数字来自这只宝可梦返回的 stats 数组。",
    how: "你改了哪里？", step1: "你改请求", step1Body: "把网址末尾的 ditto 改成 pikachu，再按“发送请求”。",
    step2: "API 决定回答", step2Body: "PokéAPI 根据名字返回另一份 JSON。你不能在这里修改它的数据库。",
    step3: "网页改变显示", step3Body: "页面读取新 JSON 的 name、sprites 和 stats，换成新的图片与数字。",
    inputLabel: "你输入的名字", jsonLabel: "API 返回的 name", screenLabel: "卡片显示", readOnly: "“闪光形态”只切换 JSON 里已有的图片；它不会改变 API 的原始数据。",
    inspect: "展开这次收到的 JSON", inspectBody: "在下面寻找 name、sprites 或 stats，就能看到页面的数据来源。",
    source: "打开 PokéAPI 原始地址", waiting: "等待 API 回复…", response: "API 回复", responseTime: "耗时", ms: "毫秒",
    basic: "基础", cardAbility: "特性", cardMove: "招式", cardNumber: "图鉴编号", cardHint: "卡牌颜色跟随宝可梦变化", cardStats: "来自 API 的能力值",
  },
  en: {
    back: "Back to portfolio", eyebrow: "CHANGE ONE NAME · WATCH THREE THINGS CHANGE", title: "PokéAPI Data Lab",
    intro: "Start with Ditto. Change the name to pikachu and watch the request URL, the API's JSON, and the card change together.",
    edit: "You can edit the Pokémon name at the end of the URL", examples: "Pick a Pokémon", browseHelp: "Choose a type, then a name to change the card", ask: "Send request", asking: "Requesting…", success: "API response received", error: "No result received. Check the name or connection and retry.",
    invalid: "Enter a name or number, such as pikachu or 25.", notFound: "The API could not find that name. Try an example below.",
    normal: "Normal form", shiny: "Shiny form", type: "Type", height: "Height", weight: "Weight", abilities: "Abilities", hidden: "Hidden ability", move: "Move",
    stats: "Base stats", statsNote: "These numbers come from the returned stats array. Ditto happens to have the same value for all six.", otherStatsNote: "These numbers come from this Pokémon's returned stats array.",
    how: "What did you change?", step1: "You change the request", step1Body: "Change ditto to pikachu at the end of the URL, then press “Send request.”",
    step2: "The API decides its answer", step2Body: "PokéAPI returns another JSON response. This page cannot edit PokéAPI's database.",
    step3: "The page changes its display", step3Body: "The page reads name, sprites, and stats from the new JSON to show new art and numbers.",
    inputLabel: "Name you entered", jsonLabel: "API's returned name", screenLabel: "Card on this page", readOnly: "“Shiny form” only switches between images already in the JSON; it does not change the API's data.",
    inspect: "Open the returned JSON", inspectBody: "Find name, sprites, or stats below to see where the page gets its data.",
    source: "Open the PokéAPI endpoint", waiting: "Waiting for API response…", response: "API response", responseTime: "Time", ms: "ms",
    basic: "BASIC", cardAbility: "ABILITY", cardMove: "MOVE", cardNumber: "POKÉDEX NO.", cardHint: "Card colors change with each Pokémon", cardStats: "Stats from the API",
  },
} as const;

const statLabels: Record<string, { zh: string; en: string }> = {
  hp: { zh: "生命", en: "HP" }, attack: { zh: "攻击", en: "Attack" }, defense: { zh: "防御", en: "Defense" },
  "special-attack": { zh: "特攻", en: "Sp. Atk" }, "special-defense": { zh: "特防", en: "Sp. Def" }, speed: { zh: "速度", en: "Speed" },
};

// The colors are a design choice. Most follow the API type; Ditto gets its familiar lavender.
const typeColors: Record<string, { main: string; deep: string; pale: string; glow: string }> = {
  normal: { main: "#b9b1a0", deep: "#615b51", pale: "#f2ede2", glow: "#dfd9cd" },
  electric: { main: "#f3d343", deep: "#86600c", pale: "#fff5b8", glow: "#fff0a4" },
  grass: { main: "#8fc55c", deep: "#3d7138", pale: "#e7f6b8", glow: "#d8edb2" },
  fire: { main: "#ee8d57", deep: "#99452f", pale: "#ffdfc4", glow: "#fbd0ae" },
  water: { main: "#73b9dc", deep: "#326c92", pale: "#d3f1fa", glow: "#c1e7f7" },
  poison: { main: "#b493d4", deep: "#704b87", pale: "#efddf8", glow: "#e6d2f2" },
  psychic: { main: "#ee9ab2", deep: "#a64a6c", pale: "#ffe1e9", glow: "#fbd3de" },
  ice: { main: "#9cdad9", deep: "#417a82", pale: "#e0f8f6", glow: "#ccefed" },
  dragon: { main: "#9f9ae1", deep: "#5754a0", pale: "#e6e4ff", glow: "#d9d8f6" },
  dark: { main: "#8f817b", deep: "#4d3f3c", pale: "#e4dcd6", glow: "#cec1bd" },
  fairy: { main: "#efb3d0", deep: "#965a7b", pale: "#ffe6f1", glow: "#f8d6e8" },
  fighting: { main: "#cb8170", deep: "#8c4235", pale: "#f5d6ca", glow: "#efc6ba" },
  flying: { main: "#aabce9", deep: "#6178a0", pale: "#e4ebff", glow: "#dce5fa" },
  ground: { main: "#d9bb83", deep: "#89683b", pale: "#f5e9cd", glow: "#ebd9b5" },
  rock: { main: "#c5ae87", deep: "#766044", pale: "#f2e5ce", glow: "#e6d6b9" },
  bug: { main: "#b8ca68", deep: "#667936", pale: "#eef3cb", glow: "#e2eab7" },
  ghost: { main: "#a59ac7", deep: "#60547f", pale: "#e8e0f5", glow: "#ddd4ed" },
  steel: { main: "#aebbc2", deep: "#536770", pale: "#e2ebed", glow: "#d4e0e4" },
};
const dittoColors = { main: "#c9a6dd", deep: "#704e88", pale: "#f3e3fb", glow: "#ead7f0" };

// A small curated index makes the API easy to explore without knowing English names.
const sampleGroups = [
  { type: "electric", zh: "电", en: "Electric", items: [
    { id: 25, slug: "pikachu", zh: "皮卡丘" }, { id: 26, slug: "raichu", zh: "雷丘" },
    { id: 81, slug: "magnemite", zh: "小磁怪" }, { id: 82, slug: "magneton", zh: "三合一磁怪" },
    { id: 100, slug: "voltorb", zh: "霹雳电球" }, { id: 125, slug: "electabuzz", zh: "电击兽" },
  ] },
  { type: "grass", zh: "草", en: "Grass", items: [
    { id: 1, slug: "bulbasaur", zh: "妙蛙种子" }, { id: 2, slug: "ivysaur", zh: "妙蛙草" },
    { id: 3, slug: "venusaur", zh: "妙蛙花" }, { id: 43, slug: "oddish", zh: "走路草" },
    { id: 69, slug: "bellsprout", zh: "喇叭芽" }, { id: 114, slug: "tangela", zh: "蔓藤怪" },
  ] },
  { type: "fire", zh: "火", en: "Fire", items: [
    { id: 4, slug: "charmander", zh: "小火龙" }, { id: 5, slug: "charmeleon", zh: "火恐龙" },
    { id: 6, slug: "charizard", zh: "喷火龙" }, { id: 37, slug: "vulpix", zh: "六尾" },
    { id: 58, slug: "growlithe", zh: "卡蒂狗" }, { id: 77, slug: "ponyta", zh: "小火马" },
  ] },
  { type: "water", zh: "水", en: "Water", items: [
    { id: 7, slug: "squirtle", zh: "杰尼龟" }, { id: 8, slug: "wartortle", zh: "卡咪龟" },
    { id: 9, slug: "blastoise", zh: "水箭龟" }, { id: 54, slug: "psyduck", zh: "可达鸭" },
    { id: 60, slug: "poliwag", zh: "蚊香蝌蚪" }, { id: 131, slug: "lapras", zh: "拉普拉斯" },
  ] },
  { type: "psychic", zh: "超能力", en: "Psychic", items: [
    { id: 63, slug: "abra", zh: "凯西" }, { id: 64, slug: "kadabra", zh: "勇基拉" },
    { id: 65, slug: "alakazam", zh: "胡地" }, { id: 79, slug: "slowpoke", zh: "呆呆兽" },
    { id: 96, slug: "drowzee", zh: "催眠貘" }, { id: 151, slug: "mew", zh: "梦幻" },
  ] },
  { type: "normal", zh: "一般", en: "Normal", items: [
    { id: 132, slug: "ditto", zh: "百变怪" }, { id: 133, slug: "eevee", zh: "伊布" },
    { id: 143, slug: "snorlax", zh: "卡比兽" }, { id: 39, slug: "jigglypuff", zh: "胖丁" },
    { id: 52, slug: "meowth", zh: "喵喵" }, { id: 16, slug: "pidgey", zh: "波波" },
  ] },
  { type: "ghost", zh: "幽灵", en: "Ghost", items: [
    { id: 92, slug: "gastly", zh: "鬼斯" }, { id: 93, slug: "haunter", zh: "鬼斯通" },
    { id: 94, slug: "gengar", zh: "耿鬼" }, { id: 200, slug: "misdreavus", zh: "梦妖" },
    { id: 353, slug: "shuppet", zh: "怨影娃娃" }, { id: 355, slug: "duskull", zh: "夜巡灵" },
  ] },
  { type: "dragon", zh: "龙", en: "Dragon", items: [
    { id: 147, slug: "dratini", zh: "迷你龙" }, { id: 148, slug: "dragonair", zh: "哈克龙" },
    { id: 149, slug: "dragonite", zh: "快龙" }, { id: 371, slug: "bagon", zh: "宝贝龙" },
    { id: 443, slug: "gible", zh: "圆陆鲨" }, { id: 610, slug: "axew", zh: "牙牙" },
  ] },
] as const;

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
  const [selectedGroup, setSelectedGroup] = useState<string>("electric");
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
  const visibleGroup = sampleGroups.find(({ type }) => type === selectedGroup) ?? sampleGroups[0];

  const artwork = pokemon && (shiny
    ? pokemon.sprites.other?.["official-artwork"]?.front_shiny ?? pokemon.sprites.front_shiny
    : pokemon.sprites.other?.["official-artwork"]?.front_default ?? pokemon.sprites.front_default);
  const pokemonType = pokemon?.types[0]?.type.name ?? "normal";
  const palette = pokemon?.name === "ditto" ? dittoColors : typeColors[pokemonType] ?? typeColors.normal;
  const cardStyle = {
    "--type-main": palette.main,
    "--type-deep": palette.deep,
    "--type-pale": palette.pale,
    "--type-glow": palette.glow,
  } as CSSProperties;
  const hp = pokemon?.stats.find(({ stat }) => stat.name === "hp")?.base_stat;
  const attack = pokemon?.stats.find(({ stat }) => stat.name === "attack")?.base_stat;
  const defense = pokemon?.stats.find(({ stat }) => stat.name === "defense")?.base_stat;

  return <main className={`${styles.page} ${shiny ? styles.shinyPage : ""}`} style={cardStyle} lang={language === "zh" ? "zh-CN" : "en"}>
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
          <div className={styles.sampleBrowser}>
            <div className={styles.sampleHeading}><strong>{t.examples}</strong><small>{t.browseHelp}</small></div>
            <div className={styles.sampleCategories} aria-label={t.examples}>
              {sampleGroups.map((group) => <button key={group.type} type="button" className={styles.sampleCategory} aria-pressed={selectedGroup === group.type} onClick={() => setSelectedGroup(group.type)} style={{ "--chip-color": typeColors[group.type].deep } as CSSProperties}>{language === "zh" ? group.zh : group.en}</button>)}
            </div>
            <div className={styles.sampleGrid} aria-label={language === "zh" ? visibleGroup.zh : visibleGroup.en}>
              {visibleGroup.items.map((sample) => <button key={sample.slug} type="button" className={styles.sampleItem} aria-pressed={pokemon?.name === sample.slug} onClick={() => select(sample.slug)}>
                <span className={styles.sampleNumber}>#{String(sample.id).padStart(3, "0")}</span>
                <span><strong>{language === "zh" ? sample.zh : titleCase(sample.slug)}</strong><small>{language === "zh" ? titleCase(sample.slug) : sample.zh}</small></span>
                <span aria-hidden="true">↗</span>
              </button>)}
            </div>
          </div>
          <p className={`${styles.status} ${status === "error" ? styles.error : ""}`} role="status" aria-live="polite">● &nbsp;{message}</p>
        </div>
        <div className={styles.cardGallery}>
          <p className={styles.galleryLabel}>✦ {t.cardHint}</p>
          <div className={styles.pokemonCard} aria-label={`${pokemon ? titleCase(pokemon.name) : "Pokémon"} card`}>
            <div className={styles.cardInner}>
              <div className={styles.cardTop}>
                <div className={styles.cardIdentity}><span className={styles.cardBasic}>{t.basic}</span><strong>{pokemon ? titleCase(pokemon.name) : "—"}</strong></div>
                <div className={styles.cardHp}><small>HP</small><strong>{hp ?? "—"}</strong><span aria-hidden="true">✦</span></div>
              </div>
              <div className={styles.artFrame}>
                <div className={styles.spriteStage}><span className={styles.artSun} aria-hidden="true" /><span className={styles.artHills} aria-hidden="true" />{artwork ? <img className={styles.sprite} src={artwork} alt={`${shiny ? "Shiny " : ""}${titleCase(pokemon?.name ?? "Pokémon")}`} /> : <span className={styles.spritePlaceholder}>{t.waiting}</span>}</div>
                <div className={styles.artCaption}><span>{t.cardNumber} {pokemon ? String(pokemon.id).padStart(3, "0") : "—"}</span><span>{titleCase(pokemonType)}</span></div>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.cardFeature}><span className={styles.featureIcon} aria-hidden="true">✦</span><div><small>{t.cardAbility}</small><strong>{pokemon?.abilities[0] ? titleCase(pokemon.abilities[0].ability.name) : "—"}</strong></div></div>
                <div className={styles.cardFeature}><span className={styles.featureIcon} aria-hidden="true">✧</span><div><small>{t.cardMove}</small><strong>{pokemon?.moves[0] ? titleCase(pokemon.moves[0].move.name) : "—"}</strong></div></div>
                <div className={styles.cardStatLine}><span>HP <strong>{hp ?? "—"}</strong></span><span>ATK <strong>{attack ?? "—"}</strong></span><span>DEF <strong>{defense ?? "—"}</strong></span></div>
              </div>
              <div className={styles.cardFoot}><span>POKÉAPI • {t.cardStats}</span><span>#{String(pokemon?.id ?? 0).padStart(3, "0")}</span></div>
            </div>
          </div>
          <div className={styles.formSwitch} aria-label="Pokémon form">
            <button type="button" aria-pressed={!shiny} onClick={() => setShiny(false)}>{t.normal}</button>
            <button type="button" aria-pressed={shiny} onClick={() => setShiny(true)} disabled={!pokemon?.sprites.front_shiny}>{t.shiny}</button>
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
