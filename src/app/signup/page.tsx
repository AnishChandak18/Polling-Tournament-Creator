import { Suspense } from "react";
import SignupClient from "./SignupClient";

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pt-24 text-center text-on-surface-variant">Loading…</div>}>
      <SignupClient />
    </Suspense>
  );
}
