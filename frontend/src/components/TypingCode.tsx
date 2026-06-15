import { useEffect, useRef, useState } from "react";

const CODE = `class Student:
    def __init__(self, name):
        self.name = name
        self.skills = []

    def learn(self, topic):
        self.skills.append(topic)
        return f"{self.name} learned {topic}!"


you = Student("you")
print(you.learn("Python"))
# -> you learned Python! 🐍`;

/**
 * A macOS-style terminal that "types" a Python snippet character by character,
 * pauses, then restarts. Pure setTimeout, no dependencies.
 */
export default function TypingCode() {
  const [count, setCount] = useState(0);
  const timer = useRef<number>();

  useEffect(() => {
    if (count < CODE.length) {
      const ch = CODE[count];
      // type punctuation/newlines a touch slower for a natural rhythm
      const delay = ch === "\n" ? 90 : 22 + Math.random() * 30;
      timer.current = window.setTimeout(() => setCount((c) => c + 1), delay);
    } else {
      timer.current = window.setTimeout(() => setCount(0), 3500);
    }
    return () => window.clearTimeout(timer.current);
  }, [count]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0d1117] shadow-2xl shadow-brand-900/30">
      <div className="flex items-center gap-2 border-b border-slate-700/50 bg-[#161b22] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-red-400" />
        <span className="h-3 w-3 rounded-full bg-yellow-400" />
        <span className="h-3 w-3 rounded-full bg-green-400" />
        <span className="ml-3 font-mono text-xs text-slate-400">academy.py</span>
        <span className="ml-auto rounded bg-python-blue/20 px-2 py-0.5 font-mono text-[10px] font-semibold text-python-yellow">
          Python 3.12
        </span>
      </div>
      <pre className="min-h-[19rem] overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-slate-100 sm:text-sm">
        <code>{CODE.slice(0, count)}</code>
        <span className="ml-0.5 inline-block h-4 w-2 -translate-y-0.5 animate-blink bg-python-yellow align-middle" />
      </pre>
    </div>
  );
}
