"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type BackButtonProps = {
  fallbackHref?: string;
  label?: string;
  className?: string;
};

export default function BackButton({
  fallbackHref = "/",
  label = "Back",
  className,
}: BackButtonProps) {
  const router = useRouter();

  function onBack() {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    router.push(fallbackHref);
  }

  return (
    <Button variant="outline" size="sm" onClick={onBack} className={className}>
      ← {label}
    </Button>
  );
}

