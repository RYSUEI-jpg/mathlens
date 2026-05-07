"use client";

import { Stats } from "@/lib/stats";

interface Props {
  stats: Stats;
}

export function StatsCard({ stats }: Props) {
  if (stats.totalProblems === 0) {
    return (
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-sm text-indigo-700 text-center">
        まだ問題を解いていません。
        <br />
        最初の問題を解くとここに統計が表示されます 📊
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <Cell label="解いた問題" value={String(stats.totalProblems)} unit="問" />
        <Cell label="連続日数" value={String(stats.streakDays)} unit="日" />
        <Cell
          label="役立った率"
          value={stats.helpfulRate === null ? "—" : String(stats.helpfulRate)}
          unit={stats.helpfulRate === null ? "" : "%"}
        />
      </div>

      {stats.byCategory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-3">
          <div className="text-xs font-medium text-slate-500 mb-2">📚 取り組んだ分野</div>
          <div className="flex flex-wrap gap-1.5">
            {stats.byCategory.slice(0, 8).map((c) => (
              <span
                key={c.category}
                className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
              >
                {c.category} <span className="text-indigo-400">×{c.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Cell({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 text-center">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1">
        <span className="text-2xl font-bold text-indigo-600">{value}</span>
        {unit && <span className="text-xs text-slate-500 ml-0.5">{unit}</span>}
      </div>
    </div>
  );
}
