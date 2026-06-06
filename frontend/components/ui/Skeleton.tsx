export function MessageSkeleton() {
  return (
    <div className="max-w-3xl mx-auto py-6 px-6 space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? "flex-row-reverse" : ""}`}>
          <div
            className="w-7 h-7 rounded-lg flex-shrink-0 mt-0.5"
            style={{ background: "rgba(255,255,255,0.06)", animation: "skeletonPulse 1.8s ease-in-out infinite", animationDelay: `${i * 0.15}s` }}
          />
          <div className={`flex flex-col gap-2 max-w-[70%] ${i % 2 === 0 ? "items-end" : ""}`}>
            <div
              className="h-10 rounded-2xl"
              style={{
                width: `${180 + i * 40}px`,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.05)",
                animation: "skeletonPulse 1.8s ease-in-out infinite",
                animationDelay: `${i * 0.2}s`,
              }}
            />
            <div
              className="h-4 rounded-xl"
              style={{
                width: `${100 + i * 30}px`,
                background: "rgba(255,255,255,0.03)",
                animation: "skeletonPulse 1.8s ease-in-out infinite",
                animationDelay: `${i * 0.25}s`,
              }}
            />
          </div>
        </div>
      ))}
      <style>{`
        @keyframes skeletonPulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}

export function SidebarSkeleton() {
  return (
    <div className="px-3 py-2 space-y-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-3 h-3 rounded flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.06)", animation: `skeletonPulse 1.8s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
          <div className="h-3 rounded-lg flex-1"
            style={{ background: "rgba(255,255,255,0.04)", maxWidth: `${50 + i * 12}%`, animation: `skeletonPulse 1.8s ease-in-out infinite`, animationDelay: `${i * 0.12}s` }} />
        </div>
      ))}
    </div>
  );
}
