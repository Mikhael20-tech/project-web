import React from "react";
import { motion } from "motion/react";

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-teal-50/50 rounded-xl ${className}`} />
);

export const DosenCardSkeleton = () => (
  <div className="bg-white border border-teal-50 rounded-[3rem] p-10 shadow-sm flex flex-col relative overflow-hidden">
    <div className="flex flex-col items-center text-center mb-10 relative">
      <Skeleton className="w-28 h-28 rounded-[2.25rem] mb-6" />
      <div className="space-y-3 w-full flex flex-col items-center">
        <Skeleton className="w-24 h-4 rounded-full" />
        <Skeleton className="w-48 h-8 rounded-full" />
        <Skeleton className="w-32 h-3 rounded-full" />
      </div>
    </div>
    <div className="space-y-6 flex-1">
      <div className="p-6 bg-teal-50/30 rounded-[2.5rem] space-y-4">
        <div className="flex justify-between">
          <div className="space-y-2">
            <Skeleton className="w-16 h-2 rounded-full" />
            <Skeleton className="w-20 h-6 rounded-full" />
          </div>
          <div className="text-right space-y-2">
            <Skeleton className="w-16 h-2 rounded-full" />
            <Skeleton className="w-12 h-4 rounded-full ml-auto" />
          </div>
        </div>
        <Skeleton className="w-full h-2 rounded-full" />
      </div>
      <Skeleton className="w-full h-16 rounded-[2rem]" />
    </div>
  </div>
);

export default DosenCardSkeleton;
