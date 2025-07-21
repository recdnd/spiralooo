import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertModuleSchema, insertFragmentSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user authentication - in production, use Firebase Auth
  const getCurrentUserId = (req: any) => 1; // Always return user ID 1 for demo

  // User routes
  app.get("/api/user", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/user", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Module routes
  app.get("/api/modules", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const modules = await storage.getModules(userId);
      res.json(modules);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/modules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const module = await storage.getModule(id);
      if (!module) {
        return res.status(404).json({ message: "Module not found" });
      }
      res.json(module);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/modules", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const moduleData = insertModuleSchema.parse({ ...req.body, userId });
      const module = await storage.createModule(moduleData);
      res.json(module);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/modules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const moduleData = req.body;
      const module = await storage.updateModule(id, moduleData);
      res.json(module);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/modules/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteModule(id);
      res.json({ message: "Module deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Fragment routes
  app.get("/api/fragments", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const fragments = await storage.getFragments(userId);
      res.json(fragments);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/fragments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const fragment = await storage.getFragment(id);
      if (!fragment) {
        return res.status(404).json({ message: "Fragment not found" });
      }
      res.json(fragment);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/fragments", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const fragmentData = insertFragmentSchema.parse({ ...req.body, userId });
      const fragment = await storage.createFragment(fragmentData);
      res.json(fragment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.patch("/api/fragments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const fragmentData = req.body;
      const fragment = await storage.updateFragment(id, fragmentData);
      res.json(fragment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/fragments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFragment(id);
      res.json({ message: "Fragment deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
