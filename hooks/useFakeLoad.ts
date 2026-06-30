"use client";
import { useEffect, useState } from "react";

export function useFakeLoad(ms: number = 550) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}
