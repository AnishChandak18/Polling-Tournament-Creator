"use client";

import PageShell from "@/components/layout/PageShell";

export default function SettingsClient() {
  return (
    <PageShell active="settings" maxWidth="max-w-md">
      {/* Account section */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="h-6 w-1.5 rounded-full bg-primary" />
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-primary/80">
            Account
          </h2>
        </div>
        <div className="space-y-3">
          <div className="settings-row">
            <div className="flex flex-col">
              <span className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Display Identity
              </span>
              <span className="font-medium text-on-surface">Edit Nickname</span>
            </div>
            <span className="text-sm font-bold text-primary">Soon</span>
          </div>
        </div>
      </section>

      {/* Appearance section */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <span className="h-6 w-1.5 rounded-full bg-secondary" />
          <h2 className="font-display text-lg font-bold uppercase tracking-tight text-secondary/80">
            Appearance
          </h2>
        </div>
        <div className="space-y-3">
          <div className="settings-row">
            <div className="flex flex-col">
              <span className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Environment
              </span>
              <span className="font-medium text-on-surface">Theme Selection</span>
            </div>
            <span className="text-sm font-bold text-primary">Coming Soon</span>
          </div>

          <div className="settings-row">
            <div className="flex flex-col">
              <span className="mb-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                Readability
              </span>
              <span className="font-medium text-on-surface">Font Size</span>
            </div>
            <span className="text-sm font-bold text-primary">Soon</span>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
