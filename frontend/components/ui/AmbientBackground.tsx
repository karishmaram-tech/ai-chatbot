"use client";

export function AmbientBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <div style={{
        position: "absolute", borderRadius: "50%",
        width: 800, height: 800, top: -300, left: -200,
        background: "radial-gradient(circle, rgba(139,92,246,0.11) 0%, transparent 65%)",
        animation: "breatheOrb1 9s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", borderRadius: "50%",
        width: 600, height: 600, bottom: -200, right: -150,
        background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 65%)",
        animation: "breatheOrb2 11s ease-in-out infinite",
        animationDelay: "3s",
      }} />
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "linear-gradient(rgba(139,92,246,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.025) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }} />
    </div>
  );
}
