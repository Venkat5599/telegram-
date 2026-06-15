import postgres from "postgres";
import { config } from "../shared/config.ts";

export const sql = postgres(config.databaseUrl, { max: 10 });
