export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: "#020408" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-xl" style={{ background: "linear-gradient(145deg, #1a1025, #0d0a18)", border: "1px solid rgba(139,92,246,0.25)", boxShadow: "0 0 20px rgba(139,92,246,0.2)" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="3.5" fill="#a78bfa" />
              <line x1="12" y1="3" x2="12" y2="8" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              <line x1="12" y1="16" x2="12" y2="21" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              <line x1="3" y1="12" x2="8" y2="12" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              <line x1="16" y1="12" x2="21" y2="12" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
            </svg>
          </div>
        </div>
        <div className="flex gap-1">
          {[0,1,2].map((i) => (
            <div key={i} className="w-1 h-1 rounded-full" style={{ background: "#a78bfa", animation: "loadDot 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
