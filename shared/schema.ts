import { pgTable, text, serial, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define the data types for the UI elements
export const DataType = {
  INT: "int",
  FLOAT: "float",
  STRING: "string"
} as const;

// Define the screen element schema
export const screenElementSchema = z.object({
  id: z.string(),
  type: z.literal("text"),
  x: z.number(),
  y: z.number(),
  font: z.string(),
  text: z.string(),
  dataType: z.enum([DataType.INT, DataType.FLOAT, DataType.STRING]).optional(),
  dataVariable: z.string().optional()
});

export type ScreenElement = z.infer<typeof screenElementSchema>;

// Define the menu item schema
export const menuItemSchema = z.object({
  id: z.string(),
  label: z.string(),
  iconPath: z.string().optional(),
  font: z.string(),
  screenElements: z.array(screenElementSchema)
});

export type MenuItem = z.infer<typeof menuItemSchema>;

// OLED Display types
export const OLEDDisplayType = {
  SSD1306_128x64: "SSD1306_128x64",
  SSD1306_128x32: "SSD1306_128x32",
  SH1106_128x64: "SH1106_128x64",
  SSD1309_128x64: "SSD1309_128x64"
} as const;

// Define the project schema
export const projectSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayType: z.enum([
    OLEDDisplayType.SSD1306_128x64,
    OLEDDisplayType.SSD1306_128x32,
    OLEDDisplayType.SH1106_128x64,
    OLEDDisplayType.SSD1309_128x64
  ]).default(OLEDDisplayType.SSD1306_128x64),
  width: z.number(),
  height: z.number(),
  menuItems: z.array(menuItemSchema),
  selectedIndex: z.number().default(0)
});

export type Project = z.infer<typeof projectSchema>;

// Database tables
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  data: jsonb("data").notNull().$type<Project>()
});

export const insertProjectSchema = createInsertSchema(projects).pick({
  userId: true,
  name: true,
  data: true
});

export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ProjectRecord = typeof projects.$inferSelect;

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
