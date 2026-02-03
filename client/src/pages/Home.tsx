import * as React from "react";
import Landing from "@/pages/Landing";
import AppIndex from "@/pages/AppIndex";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { redirectToLogin } from "@/lib/auth-utils";

export default function Home() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    // If auth hook finishes and user is null, we show landing (no redirect).
    // Redirect behavior is reserved for 401 during API usage.
    // This keeps / as a legit marketing entry point.
  }, [user, isLoading, toast]);

  if (isLoading) {
    // quick polished fallback; landing is heavy; keep minimal
    return (
      <div className="bg-aurora min-h-screen grid place-items-center px-6" data-testid="home-loading">
        <div className="rounded-3xl border border-border/60 bg-card/40 p-8 text-center shadow-premium">
          <div className="text-2xl">Loading</div>
          <div className="mt-2 text-sm text-muted-foreground">
            Establishing secure session…
          </div>
          <button
            className="mt-5 inline-flex items-center justify-center rounded-2xl border border-border/60 bg-card/40 px-4 py-2 text-sm font-semibold transition-all duration-200 hover:bg-card hover:border-border hover:-translate-y-0.5 active:translate-y-0"
            onClick={() => redirectToLogin((opts) => toast(opts))}
            data-testid="home-loading-login"
          >
            Re-authenticate
          </button>
        </div>
      </div>
    );
  }

  if (!user) return <Landing />;

  return <AppIndex />;
}
