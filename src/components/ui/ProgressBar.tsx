export default function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="progress-bar h-2 w-full">
      <div className="progress-bar-fill" style={{ width: `${Math.min(100, progress)}%` }} />
    </div>
  );
}
