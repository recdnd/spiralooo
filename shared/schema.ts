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
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
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

export const memberships = pgTable("memberships", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  service: text("service").notNull(), // "monthly-card", "creator-mode", "spiral-core", etc.
  type: text("type").notNull(), // "subscription", "one-time", "lifetime"
  status: text("status").notNull().default("active"), // "active", "cancelled", "expired"
  stripeSubscriptionId: text("stripe_subscription_id"),
  stripePriceId: text("stripe_price_id"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // "purchase", "refund", "suscoin-earn", "suscoin-spend"
  amount: integer("amount").notNull(), // in cents for payments, suscoin count for suscoin transactions
  suscoinsChanged: integer("suscoins_changed").default(0),
  description: text("description").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  metadata: jsonb("metadata"),
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

export const insertMembershipSchema = createInsertSchema(memberships).omit({
  id: true,
  createdAt: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;
export type Fragment = typeof fragments.$inferSelect;
export type InsertFragment = z.infer<typeof insertFragmentSchema>;
export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
