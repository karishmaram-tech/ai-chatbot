export function MessageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto py-6 px-6 space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
          <div className="w-7 h-7 rounded-lg flex-shrink-0 mt-0.5"
            style={{ background: "rgba(255,255,255,0.06)", animation: "skeletonPulse 1.8s ease-in-out infinite", animationDelay: `${i * 0.15}s` }} />
          <div className={`flex flex-col gap-2 max-w-[70%] ${i % 2 === 0 ? "items-end" : ""}`}>
            <div className="h-10 rounded-2xl" style={{ width: `${180 + i * 40}px`, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.05)", animation: "skeletonPulse 1.8s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
            <div className="h-4 rounded-xl" style={{ width: `${100 + i * 30}px`, background: "rgba(255,255,255,0.03)", animation: "skeletonPulse 1.8s ease-in-out infinite", animationDelay: `${i * 0.25}s` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
