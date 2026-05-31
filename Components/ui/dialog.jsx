import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80"
        onClick={() => onOpenChange?.(false)}
      />
      {/* Content */}
      <div className="relative z-50 grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg rounded-lg">
        {children}
        <button
          onClick={() => onOpenChange?.(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </button>
      </div>
    </div>
  );
};

const DialogContent = ({ className, children, ...props }) => (
  <>{children}</>
);

const DialogHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />
);

const DialogFooter = ({ className, ...props }) => (
  <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />
);

const DialogTitle = ({ className, ...props }) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props} />
);

const DialogDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-muted-foreground", className)} {...props} />
);

export { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription };
