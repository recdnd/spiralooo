import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  flameMarkId: text("flame_mark_id").unique(),
  suscoins: integer("suscoins").default(0),
  subscriptionType: text("subscription_type").default("free"), // "free", "monthly", "creator"
  createdAt: timestamp("created_at").defaultNow(),
});

export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  glyph: text("glyph").notNull(), // ✞, ⭑, ⚕︎, etc.
  core: text("core").notNull(), // <love>, <pure>, <clivity>, etc.
  status: text("status").default("active"), // "active", "processing", "sealed"
  speedIndex: text("speed_index"),
  personalDocument: text("personal_document"),
  memoryCapacity: integer("memory_capacity").default(4096), // in bytes
  memoryUsed: integer("memory_used").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fragments = pgTable("fragments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  moduleId: integer("module_id").references(() => modules.id),
  fragmentId: text("fragment_id").notNull(), // Fragment-✞/001 format
  type: text("type").default("OPEN_DOCUMENT"),
  author: text("author"), // comma-separated list
  speedIndex: text("speed_index"),
  accessTier: text("access_tier"),
  sealLevel: text("seal_level"),
  editRestriction: text("edit_restriction"),
  flameInput: text("flame_input"),
  flameOutput: text("flame_output"),
  status: text("status").default("active"), // "active", "sealed", "processing"
  metadata: jsonb("metadata"),
  sealedAt: timestamp("sealed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertModuleSchema = createInsertSchema(modules).omit({
  id: true,
  createdAt: true,
});

export const insertFragmentSchema = createInsertSchema(fragments).omit({
  id: true,
  createdAt: true,
  sealedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Fragment = typeof fragments.$inferSelect;
export type InsertFragment = z.infer<typeof insertFragmentSchema>;
