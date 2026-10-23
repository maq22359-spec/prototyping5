import { loadEnvFile } from "node:process";
import { spawnSync } from "node:child_process";

loadEnvFile(".env.local");
const args = process.argv.slice(2);
if (!args.length || !["generate", "check"].includes(args[0])) {
  console.error("Only schema generation and read-only checks are supported. Apply saved migrations through Supabase MCP.");
  process.exit(1);
}
// Keep credentials out of command arguments and redact them from CLI errors.
const result = spawnSync("npx", ["--yes", "auth@1.7.12", ...args, "--config", "./auth.cli.ts"], {
  encoding: "utf8", env: process.env, timeout: 120_000,
});
let output = `${result.stdout ?? ""}${result.stderr ?? ""}`;
const secrets = [process.env.DATABASE_URL, process.env.BETTER_AUTH_SECRET];
try {
  const url = new URL(process.env.DATABASE_URL);
  secrets.push(url.password, decodeURIComponent(url.password));
} catch { /* No connection details in the fallback output. */ }
for (const secret of secrets.filter(Boolean)) output = output.split(secret).join("[REDACTED]");
output = output.replace(/postgres(?:ql)?:\/\/[^\s"'<>]+/gi, "[REDACTED_DATABASE_URL]");
process.stdout.write(output);
if (result.error) console.error("The Better Auth CLI could not finish (credentials redacted).");
process.exit(result.status ?? 1);
