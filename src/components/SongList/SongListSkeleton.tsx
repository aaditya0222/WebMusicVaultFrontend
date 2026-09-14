"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface SongListSkeletonProps {
  rows?: number; // number of placeholder song rows
}

const SongListSkeleton: React.FC<SongListSkeletonProps> = ({ rows = 5 }) => {
  return (
    <div className="space-y-4 p-2 md:p-4">
      {Array.from({ length: rows }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center gap-4 p-2 rounded-xl animate-pulse bg-white/5"
        >
          {/* Play / Pause Circle */}
          <Skeleton className="w-14 h-14 rounded-xl shrink-0" />

          {/* Title */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4 rounded-md md:h-5" />
            <Skeleton className="h-3 w-1/2 rounded-md md:h-4" />
          </div>

          {/* Duration Badge */}
          <Skeleton className="h-5 w-10 rounded-full shrink-0 md:h-6 md:w-12" />
        </div>
      ))}
    </div>
  );
};

export default SongListSkeleton;
