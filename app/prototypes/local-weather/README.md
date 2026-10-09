# Weather, now / 天气此刻

A bilingual local weather prototype with current conditions and a five-day forecast. The page is at `/prototypes/local-weather`; the existing homepage links to it.

中英文天气原型，显示实时天气和未来五天预报。页面路径是 `/prototypes/local-weather`，原网站首页有入口。

## Setup / 配置

1. Run `npm install`.
2. Add `OPENWEATHER_API_KEY=...` to an ignored `.env.local` file, or configure the same name as a sensitive environment variable in Vercel. Never commit the key.
3. Run `npm run dev` and open `http://localhost:3000/prototypes/local-weather`.

1. 运行 `npm install`。
2. 在不提交到 Git 的 `.env.local` 中填写 `OPENWEATHER_API_KEY=...`；部署时在 Vercel 中设置同名敏感环境变量。不要提交密钥。
3. 运行 `npm run dev`，打开 `http://localhost:3000/prototypes/local-weather`。

The API routes are `/api/local-weather/weather` and `/api/local-weather/locations`. They call OpenWeather from the server, so browser code does not receive the API key.

接口位于 `/api/local-weather/weather` 和 `/api/local-weather/locations`。OpenWeather 请求只在服务器执行，浏览器不会收到 API 密钥。
