import * as React from "react";

import { cn } from "@/lib/utils";

const Sheet = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/80"
        onClick={() => onOpenChange?.(false)}
      />
      {children}
    </div>
  );
};

const SheetContent = ({ className, children, side = "right", ...props }) => (
  <div
    className={cn(
      "fixed z-50 gap-4 bg-background p-6 shadow-lg border",
      side === "left" && "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
      side === "right" && "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);

const SheetTitle = ({ className, ...props }) => (
  <h3 className={cn("text-lg font-semibold", className)} {...props} />
);

export { Sheet, SheetContent, SheetHeader, SheetTitle };
