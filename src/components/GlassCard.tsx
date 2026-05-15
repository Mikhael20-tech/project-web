import React from "react";
import { cn } from "@/src/lib/utils";

const GlassCard = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      "bg-white/70 backdrop-blur-md border border-white border-opacity-40 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300",
      className,
    )}
  >
    {children}
  </div>
);

export default GlassCard;
