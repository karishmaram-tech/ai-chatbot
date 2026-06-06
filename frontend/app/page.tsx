"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/store/useStore";
import LandingPage from "@/app/landing/page";

export default function Home() {
  const { token } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (token) router.replace("/chat");
  }, [token]);

  if (token) return null;
  return <LandingPage />;
}
