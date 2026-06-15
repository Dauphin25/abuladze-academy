import { useEffect, useState } from "react";
import { api } from "../../api";
import type { Course, Student } from "../../types";

const STATUS_STYLES: Record<Student["status"], string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-700",
  enrolled: "bg-green-100 text-green-700",
};

const STATUS_LABELS: Record<Student["status"], string> = {
  new: "ახალი",
  contacted: "დაკავშირდა",
  enrolled: "ჩარიცხული",
};

export default function StudentsAdmin() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | Student["status"]>("all");

  async function load() {
    setLoading(true);
    const [s, c] = await Promise.all([api.getStudents(), api.getCourses(true)]);
    setStudents(s);
    setCourses(Object.fromEntries((c as Course[]).map((x) => [x.id, x.title])));
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(s: Student, status: Student["status"]) {
    await api.updateStudentStatus(s.id, status);
    setStudents((prev) => prev.map((x) => (x.id === s.id ? { ...x, status } : x)));
  }

  async function remove(s: Student) {
    if (!confirm(`წაიშალოს ${s.full_name}-ის განაცხადი?`)) return;
    await api.deleteStudent(s.id);
    setStudents((prev) => prev.filter((x) => x.id !== s.id));
  }

  const filterLabels: Record<string, string> = {
    all: "ყველა",
    new: "ახალი",
    contacted: "დაკავშირდა",
    enrolled: "ჩარიცხული",
  };

  const visible = students.filter((s) => filter === "all" || s.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">განაცხადები</h1>
      <p className="mt-1 text-slate-500">საიტიდან შემოსული სარეგისტრაციო განაცხადები.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["all", "new", "contacted", "enrolled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium ${
              filter === f ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-slate-400">იტვირთება…</p>
        ) : visible.length === 0 ? (
          <p className="card p-8 text-center text-slate-400">განაცხადები არ არის.</p>
        ) : (
          visible.map((s) => (
            <div key={s.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{s.full_name}</span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[s.status]}`}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-500">
                    {s.email}
                    {s.phone && ` · ${s.phone}`}
                  </div>
                  {s.course_id && courses[s.course_id] && (
                    <div className="mt-1 text-sm text-slate-600">
                      მაინტერესებს: <span className="font-medium">{courses[s.course_id]}</span>
                    </div>
                  )}
                  {s.message && <p className="mt-2 max-w-2xl text-sm text-slate-600">{s.message}</p>}
                </div>
                <div className="text-right text-xs text-slate-400">
                  {new Date(s.created_at).toLocaleDateString("ka-GE")}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
                <span className="text-xs font-medium text-slate-400">სტატუსი:</span>
                {(["new", "contacted", "enrolled"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatus(s, st)}
                    disabled={s.status === st}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      s.status === st
                        ? "bg-slate-100 text-slate-400"
                        : "bg-white text-brand-700 ring-1 ring-slate-200 hover:bg-brand-50"
                    }`}
                  >
                    {STATUS_LABELS[st]}
                  </button>
                ))}
                <button
                  onClick={() => remove(s)}
                  className="ml-auto text-xs font-semibold text-red-600 hover:underline"
                >
                  წაშლა
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
