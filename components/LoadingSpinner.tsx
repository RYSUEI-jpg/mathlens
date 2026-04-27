"use client";

export function LoadingSpinner({ message = "解析中..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-200 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin" />
      </div>
      <p className="text-slate-600">{message}</p>
    </div>
  );
}
