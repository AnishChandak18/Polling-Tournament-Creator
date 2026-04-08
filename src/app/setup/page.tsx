import BackButton from "@/components/common/BackButton";

export default function SetupPage() {
  return (
    <main className="relative min-h-screen overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-8 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
      </div>
      <div className="relative mx-auto w-full max-w-2xl">
        <BackButton fallbackHref="/" className="mb-4" />
        <section className="rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
          <div className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-primary">
            Setup Required
          </div>
          <h1 className="mt-4 text-4xl font-black uppercase italic tracking-tight">Finish Supabase setup</h1>
          <p className="mt-2 text-text/70">
            Your Supabase URL and anon key are missing, so auth pages can’t work yet.
          </p>
          <div className="mt-6 text-sm text-text/80">
            Add these to <code className="rounded bg-black/5 px-1">.env.local</code>:
          </div>
          <pre className="mt-3 overflow-auto rounded-xl border border-white/10 bg-black/20 p-4 text-sm">
{`NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
DATABASE_URL=...`}
          </pre>
          <div className="mt-4 text-sm text-text/80">
            You can copy <code className="rounded bg-black/5 px-1">.env.local.example</code> →
            <code className="rounded bg-black/5 px-1">.env.local</code> and fill it.
          </div>
        </section>
      </div>
    </main>
  );
}

