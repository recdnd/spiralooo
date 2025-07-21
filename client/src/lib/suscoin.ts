// Pluggable Suscoin System for Spiral Apps
// Import this file and use SUS.init() to enable suscoin functionality

import { apiRequest } from "./queryClient";

export interface SusUserData {
  userId: string;
  displayName?: string;
  suscoin: number;
  subscriptionType: string;
  memberships: Record<string, {
    type: string;
    expires?: string;
    status: string;
  }>;
}

export interface SusConfig {
  userId?: string;
  onStatus?: (data: SusUserData) => void;
  onPaymentSuccess?: (result: any) => void;
  onPaymentError?: (error: any) => void;
}

class SusconinManager {
  private config: SusConfig = {};
  private userData: SusUserData | null = null;

  async init(config: SusConfig) {
    this.config = config;
    if (config.userId) {
      await this.refreshStatus();
    }
  }

  async refreshStatus() {
    try {
      const response = await apiRequest("GET", "/api/sus/status");
      const data = await response.json();
      
      this.userData = {
        userId: data.user.flameMarkId || data.user.id,
        displayName: data.user.displayName,
        suscoin: data.user.suscoins || 0,
        subscriptionType: data.user.subscriptionType || "free",
        memberships: data.memberships || {}
      };

      if (this.config.onStatus) {
        this.config.onStatus(this.userData);
      }
    } catch (error) {
      console.error("SUS: Failed to refresh status", error);
    }
  }

  async startPayment(planId: string) {
    try {
      const response = await apiRequest("POST", "/api/sus/create-payment", {
        planId
      });
      const { checkoutUrl } = await response.json();
      
      // Redirect to Stripe Checkout
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error("SUS: Payment failed", error);
      if (this.config.onPaymentError) {
        this.config.onPaymentError(error);
      }
    }
  }

  async addSuscoins(amount: number, description: string = "Manual addition") {
    try {
      const response = await apiRequest("POST", "/api/sus/add-suscoins", {
        amount,
        description
      });
      await this.refreshStatus();
      return response.json();
    } catch (error) {
      console.error("SUS: Failed to add suscoins", error);
      throw error;
    }
  }

  async spendSuscoins(amount: number, description: string) {
    try {
      const response = await apiRequest("POST", "/api/sus/spend-suscoins", {
        amount,
        description
      });
      await this.refreshStatus();
      return response.json();
    } catch (error) {
      console.error("SUS: Failed to spend suscoins", error);
      throw error;
    }
  }

  getUserData() {
    return this.userData;
  }

  hasMembership(service: string) {
    return this.userData?.memberships[service]?.status === "active";
  }

  canAfford(amount: number) {
    return (this.userData?.suscoin || 0) >= amount;
  }
}

// Global instance for easy access
export const SUS = new SusconinManager();

// Make it available globally for other Spiral apps
(window as any).SUS = SUS;