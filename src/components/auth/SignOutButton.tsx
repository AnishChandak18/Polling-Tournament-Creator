"use client";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function SignOutButton({ className = "" }: { className?: string }) {
  async function signOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <Button
      onClick={signOut}
      variant="outline"
      size="sm"
      className={cn(
        "border-transparent bg-tertiary text-white hover:bg-tertiary/90 hover:text-white",
        "dark:border-transparent dark:bg-tertiary dark:text-white dark:hover:bg-tertiary/90 dark:hover:text-white",
        className
      )}
    >
      Sign out
    </Button>
  );
}

