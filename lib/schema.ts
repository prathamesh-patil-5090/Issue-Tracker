import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const boards = pgTable("boards", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const columns = pgTable("columns", {
  id: serial("id").primaryKey(),
  boardId: integer("board_id")
    .references(() => boards.id)
    .notNull(),
  name: text("name").notNull(),
  order: integer("order").notNull(),
});

export const issues = pgTable("issues", {
  id: serial("id").primaryKey(),
  columnId: integer("column_id")
    .references(() => columns.id)
    .notNull(),
  title: text("title").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  order: integer("order").notNull(),
});
