interface PyBadgeProps {
  className?: string;
}

/** A small Python-styled monogram badge (blue/yellow) used as a hero accent. */
export default function PyBadge({ className = "" }: PyBadgeProps) {
  return (
    <span
      className={`grid place-items-center rounded-2xl bg-gradient-to-br from-python-blue to-python-dark font-mono font-bold text-python-yellow shadow-lg ${className}`}
    >
      Py
    </span>
  );
}
