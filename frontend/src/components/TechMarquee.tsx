// Default Python ecosystem list, used when the admin hasn't set one.
const DEFAULT_TECH = [
  "Python",
  "FastAPI",
  "Django",
  "Flask",
  "NumPy",
  "pandas",
  "PostgreSQL",
  "Docker",
  "Git",
  "scikit-learn",
  "pytest",
  "SQLAlchemy",
  "Linux",
  "REST APIs",
];

interface TechMarqueeProps {
  /** Raw value from the CMS (comma- or newline-separated). Falls back to defaults. */
  value?: string;
}

export default function TechMarquee({ value }: TechMarqueeProps) {
  const tech = (value ?? "")
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
  const list = tech.length > 0 ? tech : DEFAULT_TECH;

  // Duplicate the list so the -50% translate loops seamlessly.
  const items = [...list, ...list];
  return (
    <div className="relative overflow-hidden border-y border-slate-200 bg-white py-5">
      {/* edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-4 pr-4">
        {items.map((item, i) => (
          <span
            key={i}
            className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-python-blue" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
