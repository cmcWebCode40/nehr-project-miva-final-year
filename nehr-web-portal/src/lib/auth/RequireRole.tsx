"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ActorType } from "@/types/auth";
import { useSession } from "./useSession";
import { loginPathFor } from "./session";
import { Loader2 } from "lucide-react";

/**
 * Client-side route guard: renders nothing (past a spinner) until the
 * stored session is confirmed to match the required actor type,
 * redirecting to that role's own login page otherwise. Deliberately not
 * a Next.js proxy/middleware check - the session lives in localStorage,
 * not a cookie, so there's nothing for server-side middleware to read;
 * every actual authorization decision still happens on the backend.
 */
export function RequireRole({
  role,
  children,
}: {
  role: ActorType;
  children: React.ReactNode;
}) {
  const { session, hydrated } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;
    if (!session || session.actorType !== role) {
      router.replace(loginPathFor(role));
    }
  }, [hydrated, session, role, router]);

  if (!hydrated || !session || session.actorType !== role) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return <>{children}</>;
}
