import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull().unique(),
    firstName: text("first_name").notNull().default(""),
    lastName: text("last_name").notNull().default(""),
    password: text("password").notNull(),
});

export const resources = sqliteTable("resources", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    title: text("title").notNull(),
    description: text("description").notNull(),
    type: text("type").notNull(), // 'article', 'video', 'snippet', etc.
    tags: text("tags").notNull(), // JSON string: '["React", "Hooks"]'
    link: text("link").notNull(),
    codeSnippet: text("code_snippet"),
    authorId: integer("author_id").references(() => users.id),
    createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});
