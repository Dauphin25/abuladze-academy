import { useEffect, useState } from "react";
import { api } from "../../api";
import Modal from "../../components/Modal";
import type { Course } from "../../types";

const EMPTY: Partial<Course> = {
  title: "",
  summary: "",
  description: "",
  level: "დამწყები",
  duration: "",
  price: null,
  icon: "code",
  image_url: "",
  aim: "",
  target_audience: "",
  prerequisites: "",
  what_you_learn: [],
  schedule: "",
  start_date: "",
  language: "ქართული",
  format: "ოფლაინ",
  min_age: null,
  max_age: null,
  max_students: null,
  certificate: true,
  order: 0,
  is_active: true,
};

const ICONS = ["code", "globe", "server", "chart", "cpu", "rocket"];
const LEVELS = ["დამწყები", "საშუალო", "მაღალი"];
const FORMATS = ["ოფლაინ", "ონლაინ", "ჰიბრიდი"];

export default function CoursesAdmin() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState<Partial<Course>>(EMPTY);
  const [learnText, setLearnText] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setCourses(await api.getCourses(true));
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setLearnText("");
    setOpen(true);
  }
  function openEdit(c: Course) {
    setEditing(c);
    setForm(c);
    setLearnText((c.what_you_learn ?? []).join("\n"));
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: form.price === null || form.price === undefined || (form.price as unknown) === "" ? null : Number(form.price),
        min_age: form.min_age === null || (form.min_age as unknown) === "" ? null : Number(form.min_age),
        max_age: form.max_age === null || (form.max_age as unknown) === "" ? null : Number(form.max_age),
        max_students: form.max_students === null || (form.max_students as unknown) === "" ? null : Number(form.max_students),
        what_you_learn: learnText.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      if (editing) await api.updateCourse(editing.id, payload);
      else await api.createCourse(payload);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: Course) {
    if (!confirm(`წაიშალოს კურსი "${c.title}"?`)) return;
    await api.deleteCourse(c.id);
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">კურსები</h1>
          <p className="mt-1 text-slate-500">მართე საიტზე გამოსახული პროგრამები.</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          + ახალი კურსი
        </button>
      </div>

      <div className="mt-6 card overflow-hidden">
        {loading ? (
          <p className="p-6 text-slate-400">იტვირთება…</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">სათაური</th>
                <th className="px-5 py-3 font-semibold">დონე</th>
                <th className="px-5 py-3 font-semibold">ფასი</th>
                <th className="px-5 py-3 font-semibold">ფორმატი</th>
                <th className="px-5 py-3 font-semibold">სტატუსი</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{c.title}</td>
                  <td className="px-5 py-3 text-slate-600">{c.level}</td>
                  <td className="px-5 py-3 text-slate-600">
                    {c.price != null ? `₾${c.price}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-slate-600">{c.format || "—"}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        c.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {c.is_active ? "აქტიური" : "დამალული"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button className="text-sm font-semibold text-brand-700 hover:underline" onClick={() => openEdit(c)}>
                      რედაქტირება
                    </button>
                    <button className="ml-4 text-sm font-semibold text-red-600 hover:underline" onClick={() => remove(c)}>
                      წაშლა
                    </button>
                  </td>
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-slate-400">
                    კურსები ჯერ არ არის.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "კურსის რედაქტირება" : "ახალი კურსი"}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn-outline" onClick={() => setOpen(false)}>
              გაუქმება
            </button>
            <button className="btn-primary" onClick={save} disabled={saving || !form.title}>
              {saving ? "ინახება…" : "შენახვა"}
            </button>
          </>
        }
      >
        <div className="grid gap-5">
          {/* Basic info */}
          <fieldset className="rounded-lg border border-slate-200 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">ძირითადი ინფო</legend>
            <div className="grid gap-4">
              <div>
                <label className="label">სათაური *</label>
                <input
                  className="input"
                  value={form.title ?? ""}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="label">მოკლე აღწერა (ბარათებზე)</label>
                <input
                  className="input"
                  value={form.summary ?? ""}
                  onChange={(e) => setForm({ ...form, summary: e.target.value })}
                />
              </div>
              <div>
                <label className="label">სრული აღწერა</label>
                <textarea
                  rows={3}
                  className="input"
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div>
                <label className="label">სურათის URL (ბანერი)</label>
                <input
                  className="input"
                  placeholder="https://…"
                  value={form.image_url ?? ""}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                />
              </div>
            </div>
          </fieldset>

          {/* Details */}
          <fieldset className="rounded-lg border border-slate-200 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">დეტალები</legend>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">დონე</label>
                <select
                  className="input"
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                >
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="label">ფორმატი</label>
                <select
                  className="input"
                  value={form.format}
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                >
                  {FORMATS.map((f) => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="label">ხანგრძლივობა</label>
                <input
                  className="input"
                  placeholder="12 კვირა"
                  value={form.duration ?? ""}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                />
              </div>
              <div>
                <label className="label">ენა</label>
                <input
                  className="input"
                  placeholder="ქართული"
                  value={form.language ?? ""}
                  onChange={(e) => setForm({ ...form, language: e.target.value })}
                />
              </div>
              <div>
                <label className="label">გრაფიკი</label>
                <input
                  className="input"
                  placeholder="კვირაში 3-ჯერ, 18:00–20:00"
                  value={form.schedule ?? ""}
                  onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                />
              </div>
              <div>
                <label className="label">დაწყების თარიღი</label>
                <input
                  className="input"
                  placeholder="15 სექტემბერი 2026"
                  value={form.start_date ?? ""}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="label">ფასი (₾)</label>
                <input
                  type="number"
                  className="input"
                  value={form.price ?? ""}
                  onChange={(e) => setForm({ ...form, price: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">მაქს. სტუდენტი</label>
                <input
                  type="number"
                  className="input"
                  value={form.max_students ?? ""}
                  onChange={(e) => setForm({ ...form, max_students: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">მინ. ასაკი</label>
                <input
                  type="number"
                  className="input"
                  value={form.min_age ?? ""}
                  onChange={(e) => setForm({ ...form, min_age: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">მაქს. ასაკი</label>
                <input
                  type="number"
                  className="input"
                  value={form.max_age ?? ""}
                  onChange={(e) => setForm({ ...form, max_age: e.target.value === "" ? null : Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">ხატი</label>
                <select
                  className="input"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                >
                  {ICONS.map((i) => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="label">რიგი</label>
                <input
                  type="number"
                  className="input"
                  value={form.order ?? 0}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="mt-4 flex gap-6">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.certificate ?? true}
                  onChange={(e) => setForm({ ...form, certificate: e.target.checked })}
                />
                სერტიფიკატი
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.is_active ?? true}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                />
                საიტზე ჩანს
              </label>
            </div>
          </fieldset>

          {/* Educational content */}
          <fieldset className="rounded-lg border border-slate-200 p-4">
            <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">საგანმანათლებლო შინაარსი</legend>
            <div className="grid gap-4">
              <div>
                <label className="label">კურსის მიზანი</label>
                <textarea
                  rows={2}
                  className="input"
                  placeholder="კურსის მიზანია…"
                  value={form.aim ?? ""}
                  onChange={(e) => setForm({ ...form, aim: e.target.value })}
                />
              </div>
              <div>
                <label className="label">ვისთვისაა განკუთვნილი</label>
                <textarea
                  rows={2}
                  className="input"
                  placeholder="კურსი განკუთვნილია…"
                  value={form.target_audience ?? ""}
                  onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                />
              </div>
              <div>
                <label className="label">წინასწარი ცოდნა</label>
                <textarea
                  rows={2}
                  className="input"
                  placeholder="საჭიროა…"
                  value={form.prerequisites ?? ""}
                  onChange={(e) => setForm({ ...form, prerequisites: e.target.value })}
                />
              </div>
              <div>
                <label className="label">რას ისწავლი — თითო ელემენტი ახალ სტრიქონზე</label>
                <textarea
                  rows={6}
                  className="input font-mono text-sm"
                  placeholder="HTML5 და CSS3&#10;JavaScript ES6+&#10;React — კომპონენტები"
                  value={learnText}
                  onChange={(e) => setLearnText(e.target.value)}
                />
              </div>
            </div>
          </fieldset>
        </div>
      </Modal>
    </div>
  );
}
