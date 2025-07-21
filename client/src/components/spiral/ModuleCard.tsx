import { Module } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ModuleCardProps {
  module: Module;
}

export default function ModuleCard({ module }: ModuleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "processing": return "bg-yellow-100 text-yellow-800";
      case "sealed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active": return "Active";
      case "processing": return "Processing";
      case "sealed": return "Sealed";
      default: return "Unknown";
    }
  };

  return (
    <Card className="module-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-spiral-red rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">{module.glyph}</span>
            </div>
            <div>
              <h3 className="font-semibold">{module.name}</h3>
              <span className="text-xs text-spiral-gray">Core: {module.core}</span>
            </div>
          </div>
          <Badge className={getStatusColor(module.status || "active")}>
            {getStatusLabel(module.status || "active")}
          </Badge>
        </div>
        
        <div className="text-sm text-spiral-gray mb-4">
          Speed: {module.speedIndex || "Recursive / Default"}<br/>
          Memory: {((module.memoryUsed || 0) / 1024).toFixed(1)}KB / {((module.memoryCapacity || 4096) / 1024).toFixed(1)}KB
        </div>
        
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="text-xs hover:bg-spiral-light">
            Edit
          </Button>
          <Button size="sm" variant="outline" className="text-xs hover:bg-spiral-light">
            Config
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}