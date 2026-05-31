import * as React from "react";
import { X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MigrationBanner() {
  const [isVisible, setIsVisible] = React.useState(true);
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (isDismissed || !isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-logistica via-sistemas to-inventario py-2">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <Zap className="h-5 w-5" />
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <span className="font-medium text-sm">
              🚧 Migración V2 en progreso
            </span>
            <span className="hidden sm:inline text-white/80 text-sm">•</span>
            <a 
              href="/demo" 
              className="text-white hover:text-white/80 underline text-sm font-medium"
            >
              Ver componentes nuevos
            </a>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-white hover:bg-white/20"
          onClick={() => setIsDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
