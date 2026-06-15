import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { sql } from "./client.ts";

const here = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(here, "schema.sql"), "utf8");

await sql.unsafe(schema);
console.log("✅ migrated");
await sql.end();
