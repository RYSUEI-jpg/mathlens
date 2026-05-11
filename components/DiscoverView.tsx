"use client";

import { Grade } from "@/lib/types";
import { DailyTopicCard } from "./DailyTopicCard";
import { DiscoverCameraCard } from "./DiscoverCameraCard";
import { InterestExploreCard } from "./InterestExploreCard";
import { MathChatCard } from "./MathChatCard";

interface Props {
  grade: Grade;
}

export function DiscoverView({ grade }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-center py-2">
        <h2 className="text-base font-bold text-slate-900">
          🔭 数学のおもしろい入り口
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          解くじゃなくて、見つける・知る
        </p>
      </div>

      <DailyTopicCard grade={grade} />
      <DiscoverCameraCard grade={grade} />
      <InterestExploreCard grade={grade} />
      <MathChatCard grade={grade} />
    </div>
  );
}
