import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertModuleSchema, insertFragmentSchema, insertMembershipSchema, insertTransactionSchema } from "@shared/schema";
import { z } from "zod";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Suscoin Plans Configuration
const SUSCOIN_PLANS = {
  "monthly-card": {
    name: "月卡",
    price: 300, // $3.00 in cents
    type: "subscription",
    interval: "month",
    suscoinsPerDay: 1,
    description: "每日登入自動返還 1 枚 suscoin"
  },
  "topup-1usd": {
    name: "單次充值",
    price: 100, // $1.00 in cents
    type: "one-time",
    suscoins: 10,
    description: "$1 = 10 枚 suscoin"
  },
  "creator-mode": {
    name: "創作者模式",
    price: 6000, // $60.00 in cents
    type: "subscription",
    interval: "month",
    description: "免除所有 suscoin 扣款，GPT 模型使用無限制"
  }
};

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

  // ===== SUSCOIN PAYMENT SYSTEM API =====
  
  // Get user status with memberships
  app.get("/api/sus/status", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const user = await storage.getUser(userId);
      const memberships = await storage.getMemberships?.(userId) || [];
      
      const membershipMap: Record<string, any> = {};
      memberships.forEach((m: any) => {
        membershipMap[m.service] = {
          type: m.type,
          status: m.status,
          expires: m.expiresAt ? m.expiresAt.toISOString().split('T')[0] : null
        };
      });

      res.json({
        user,
        memberships: membershipMap
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create payment for plans
  app.post("/api/sus/create-payment", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const { planId } = req.body;
      
      const plan = SUSCOIN_PLANS[planId as keyof typeof SUSCOIN_PLANS];
      if (!plan) {
        return res.status(400).json({ message: "Invalid plan" });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let checkoutSession;

      if (plan.type === "subscription") {
        // Create subscription
        checkoutSession = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: plan.name,
                description: plan.description,
              },
              unit_amount: plan.price,
              recurring: {
                interval: plan.interval as any,
              },
            },
            quantity: 1,
          }],
          mode: 'subscription',
          success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/dashboard`,
          customer_email: user.email,
          metadata: {
            userId: userId.toString(),
            planId,
          },
        });
      } else {
        // One-time payment
        checkoutSession = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [{
            price_data: {
              currency: 'usd',
              product_data: {
                name: plan.name,
                description: plan.description,
              },
              unit_amount: plan.price,
            },
            quantity: 1,
          }],
          mode: 'payment',
          success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${req.headers.origin}/dashboard`,
          customer_email: user.email,
          metadata: {
            userId: userId.toString(),
            planId,
          },
        });
      }

      res.json({ checkoutUrl: checkoutSession.url });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Add suscoins manually
  app.post("/api/sus/add-suscoins", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const { amount, description } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const newBalance = (user.suscoins || 0) + amount;
      await storage.updateUser?.(userId, { suscoins: newBalance });

      if (storage.createTransaction) {
        await storage.createTransaction({
          userId,
          type: "suscoin-earn",
          amount: 0,
          suscoinsChanged: amount,
          description,
        });
      }

      res.json({ success: true, newBalance });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Spend suscoins
  app.post("/api/sus/spend-suscoins", async (req, res) => {
    try {
      const userId = getCurrentUserId(req);
      const { amount, description } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if ((user.suscoins || 0) < amount) {
        return res.status(400).json({ message: "Insufficient suscoins" });
      }

      const newBalance = (user.suscoins || 0) - amount;
      await storage.updateUser?.(userId, { suscoins: newBalance });

      if (storage.createTransaction) {
        await storage.createTransaction({
          userId,
          type: "suscoin-spend",
          amount: 0,
          suscoinsChanged: -amount,
          description,
        });
      }

      res.json({ success: true, newBalance });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Webhook endpoint for Stripe
  app.post("/api/sus/stripe-webhook", async (req, res) => {
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.get('stripe-signature') || '',
        process.env.STRIPE_WEBHOOK_SECRET || ''
      );
    } catch (err: any) {
      console.log(`Webhook signature verification failed.`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        const userId = parseInt(session.metadata?.userId || '0');
        const planId = session.metadata?.planId;

        if (userId && planId) {
          const plan = SUSCOIN_PLANS[planId as keyof typeof SUSCOIN_PLANS];
          
          if (plan) {
            if (plan.type === 'one-time' && plan.suscoins) {
              // Add suscoins for one-time purchase
              const user = await storage.getUser(userId);
              if (user) {
                const newBalance = (user.suscoins || 0) + plan.suscoins;
                await storage.updateUser?.(userId, { suscoins: newBalance });

                if (storage.createTransaction) {
                  await storage.createTransaction({
                    userId,
                    type: "purchase",
                    amount: plan.price,
                    suscoinsChanged: plan.suscoins,
                    description: `購買 ${plan.name}`,
                    stripePaymentIntentId: session.payment_intent as string,
                  });
                }
              }
            } else if (plan.type === 'subscription') {
              // Create membership record
              if (storage.createMembership) {
                await storage.createMembership({
                  userId,
                  service: planId,
                  type: "subscription",
                  status: "active",
                  stripeSubscriptionId: session.subscription as string,
                  expiresAt: null, // Recurring subscription
                });
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      return res.status(500).json({ message: error.message });
    }

    res.json({ received: true });
  });

  const httpServer = createServer(app);
  return httpServer;
}
