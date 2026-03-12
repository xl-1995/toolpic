'use client';

export default function PlaceholderTool() {
  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-wrench text-3xl text-[var(--color-primary)]"></i>
      </div>
      <h2 className="text-xl font-semibold mb-3">Coming Soon</h2>
      <p className="text-[var(--color-text-muted)]">This tool is under development. Check back soon!</p>
    </div>
  );
}
