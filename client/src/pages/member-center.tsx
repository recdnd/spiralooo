import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { SUS } from "@/lib/suscoin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import blobPenLogo from "@assets/blobpen_1753121234492.png";

interface MembershipData {
  type: string;
  status: string;
  expires?: string;
}

interface SusStatus {
  user: {
    id: number;
    displayName?: string;
    suscoins: number;
    subscriptionType: string;
  };
  memberships: Record<string, MembershipData>;
}

const PLAN_CONFIG = {
  "monthly-card": {
    name: "🎫 月卡",
    price: "$3",
    period: "/ 月",
    description: "每日登入自動返還 1 枚 suscoin",
    features: ["每日 +1 suscoin", "限購一張", "自動續訂"],
    color: "bg-blue-50 border-blue-200"
  },
  "topup-1usd": {
    name: "💵 單次充值",
    price: "$1",
    period: "",
    description: "$1 = 10 枚 suscoin",
    features: ["即時到帳", "無限制購買", "永久有效"],
    color: "bg-green-50 border-green-200"
  },
  "creator-mode": {
    name: "👑 創作者模式",
    price: "$60",
    period: "/ 月",
    description: "免除所有 suscoin 扣款",
    features: ["無限 suscoin", "GPT 模型無限制", "優先支援"],
    color: "bg-purple-50 border-purple-200"
  }
};

export default function MemberCenter() {
  const [susStatus, setSusStatus] = useState<SusStatus | null>(null);
  const { toast } = useToast();

  const { data: statusData, isLoading } = useQuery({
    queryKey: ["/api/sus/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  useEffect(() => {
    if (statusData) {
      setSusStatus(statusData);
    }
  }, [statusData]);

  const handlePurchase = async (planId: string) => {
    try {
      await SUS.startPayment(planId);
    } catch (error: any) {
      toast({
        title: "支付失敗",
        description: error.message || "無法啟動支付流程",
        variant: "destructive",
      });
    }
  };

  const getMembershipStatus = (service: string) => {
    const membership = susStatus?.memberships[service];
    if (!membership || membership.status !== "active") {
      return { status: "未開通", color: "bg-gray-100 text-gray-600" };
    }
    return { 
      status: membership.expires ? `到期：${membership.expires}` : "已開通",
      color: "bg-green-100 text-green-600"
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-spiral-cream flex items-center justify-center">
        <div className="text-spiral-dark font-mono">載入會員中心...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-spiral-cream font-mono">
      {/* Header */}
      <header className="bg-white border-b-2 border-spiral-red px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src={blobPenLogo} alt="Spiral" className="w-8 h-8" />
            <h1 className="text-xl font-semibold text-spiral-dark">🧧 Spiral 會員中心</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="border-spiral-red text-spiral-red hover:bg-spiral-red hover:text-white"
          >
            返回平台
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* User Status */}
        <Card className="mb-8 border-2 border-spiral-red">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🌟 使用者狀態</span>
              <Badge className="bg-spiral-red text-white">
                {susStatus?.user.subscriptionType || "free"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-spiral-light rounded-lg">
                <div className="text-2xl font-bold text-spiral-dark">
                  {susStatus?.user.displayName || "Spiral User"}
                </div>
                <div className="text-sm text-spiral-gray">使用者名稱</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="text-3xl font-bold text-yellow-600">
                  {susStatus?.user.suscoins || 0}
                </div>
                <div className="text-sm text-yellow-600">🪙 Suscoin 餘額</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xl font-bold text-blue-600">
                  {Object.keys(susStatus?.memberships || {}).length}
                </div>
                <div className="text-sm text-blue-600">活躍會員服務</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Membership Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>📦 會員持有狀態</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(PLAN_CONFIG).map(([planId, plan]) => {
                const membershipStatus = getMembershipStatus(planId);
                return (
                  <div key={planId} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">{plan.name}</span>
                      <span className="text-sm text-spiral-gray ml-2">{plan.description}</span>
                    </div>
                    <Badge className={membershipStatus.color}>
                      {membershipStatus.status}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Purchase Options */}
        <Card>
          <CardHeader>
            <CardTitle>🛒 購買選項</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(PLAN_CONFIG).map(([planId, plan]) => (
                <div key={planId} className={`p-6 rounded-lg border-2 ${plan.color}`}>
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold mb-2">{plan.name}</h3>
                    <div className="text-2xl font-bold text-spiral-dark">
                      {plan.price}<span className="text-sm font-normal">{plan.period}</span>
                    </div>
                    <p className="text-sm text-spiral-gray mt-2">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-2 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-sm flex items-center">
                        <span className="text-green-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handlePurchase(planId)}
                    className="w-full bg-spiral-red text-white hover:bg-red-600"
                    disabled={planId === "monthly-card" && getMembershipStatus(planId).status !== "未開通"}
                  >
                    {planId === "monthly-card" && getMembershipStatus(planId).status !== "未開通" 
                      ? "已購買" 
                      : planId === "topup-1usd" 
                        ? "立即充值"
                        : "購買"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-spiral-gray">
          <div className="flex items-center justify-center mb-2">
            <img src={blobPenLogo} alt="Spiral" className="w-4 h-4 mr-2 opacity-60" />
            <span>螺旋語焰平台</span>
          </div>
          <p>安全支付由 Stripe 提供保障</p>
        </div>
      </div>
    </div>
  );
}