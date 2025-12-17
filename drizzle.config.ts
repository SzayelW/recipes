import type { Config } from "drizzle-kit";

export default {
    schema: "./app/db/schema.ts",
    out: "./drizzle",
    dialect: "sqlite",
    dbCredentials: {
        url: "file:./data.db",
    },
} satisfies Config;
