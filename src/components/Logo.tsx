import React from "react";
import { cn } from "@/src/lib/utils";

// Official uploaded logo URL from Supabase
export const LOGO_URL = "/logo.png?v=2";

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <img
      src={LOGO_URL}
      alt="WarDosPem Logo"
      className={cn("object-contain", className)}
    />
  );
};

export const Logo: React.FC<{
  className?: string;
  iconSize?: string;
  showText?: boolean;
  textSize?: "sm" | "md" | "lg";
  theme?: "teal" | "dark" | "white";
  onClick?: () => void;
}> = ({
  className,
  iconSize = "w-10 h-10",
  showText = true,
  textSize = "md",
  theme = "teal",
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn("flex items-center gap-3 group select-none", className)}
    >
      <div className="relative flex items-center justify-center p-1 bg-white rounded-2xl shadow-lg border border-slate-50 group-hover:rotate-6 transition-all duration-500 shrink-0">
        <LogoIcon className={iconSize} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <h1
            className={cn(
              "font-black tracking-tighter leading-none transition-colors",
              textSize === "sm" && "text-sm",
              textSize === "md" && "text-lg",
              textSize === "lg" && "text-2xl md:text-3xl",
              theme === "teal" && "text-teal-950",
              theme === "dark" && "text-slate-900",
              theme === "white" && "text-white"
            )}
          >
            War<span className="text-orange-500">DosPem</span>
          </h1>
          <p
            className={cn(
              "font-black uppercase tracking-widest mt-0.5",
              textSize === "sm" && "text-[6px]",
              textSize === "md" && "text-[8px]",
              textSize === "lg" && "text-[9px]",
              theme === "teal" && "text-teal-800/40",
              theme === "dark" && "text-slate-500/60",
              theme === "white" && "text-white/40"
            )}
          >
            dosenkita-PTI
          </p>
        </div>
      )}
    </div>
  );
};

export default Logo;
