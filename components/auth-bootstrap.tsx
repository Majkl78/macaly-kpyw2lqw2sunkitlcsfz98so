"use client";

import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexAuth } from "convex/react";

export function AuthBootstrap() {
  const { isAuthenticated, isLoading } = useConvexAuth();

  const me = useQuery(api.profiles.me);
  const ensure = useMutation(api.profiles.ensureMyProfile);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) return;

    // Přihlášený, ale profil ještě není → vytvořit
    if (me === null) {
      ensure({ orgName: "Moje firma" }).catch(() => {});
    }
  }, [isAuthenticated, isLoading, me, ensure]);

  return null;
}
