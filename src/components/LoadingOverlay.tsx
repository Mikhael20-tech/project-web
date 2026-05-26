import React from "react";
import { motion } from "motion/react";
import { LogoIcon } from "@/src/components/Logo";

const LoadingOverlay: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-white/80 backdrop-blur-md flex flex-col items-center justify-center"
    >
      <div className="relative">
        {/* Spinner ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-teal-100 border-t-teal-500 rounded-full"
        />
        
        {/* Logo in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <LogoIcon className="w-9 h-9" />
        </div>
      </div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-teal-900/40"
      >
        Loading WarDosen...
      </motion.p>
    </motion.div>
  );
};

export default LoadingOverlay;
