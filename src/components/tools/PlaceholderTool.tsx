'use client';

export default function PlaceholderTool() {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--color-purple)]/10 to-[var(--color-blue)]/10 flex items-center justify-center mx-auto mb-6">
        <i className="fas fa-wrench text-2xl text-[var(--color-text)]"></i>
      </div>
      <h2 className="text-2xl font-semibold mb-3">Coming Soon</h2>
      <p className="text-[var(--color-text-muted)] max-w-sm mx-auto">
        This tool is under development. Check back soon!
      </p>
    </div>
  );
}
