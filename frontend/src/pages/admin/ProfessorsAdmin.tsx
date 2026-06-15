import { useEffect, useState } from "react";
import { api } from "../../api";
import Modal from "../../components/Modal";
import type { Professor } from "../../types";

const EMPTY: Partial<Professor> = {
  name: "",
  title: "",
  bio: "",
  biography: "",
  photo_url: "",
  specialties: "",
  email: "",
  books: [],
  links: [],
  order: 0,
  is_active: true,
};

function parseBooks(text: string): string[] {
  return text.split("\n").map((s) => s.trim()).filter(Boolean);
}
function parseLinks(text: string): { label: string; url: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...rest] = line.split("|");
      return { label: (label ?? "").trim(), url: rest.join("|").trim() };
    })
    .filter((l) => l.label && l.url);
}

export default function ProfessorsAdmin() {
  const [items, setItems] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Professor | null>(null);
  const [form, setForm] = useState<Partial<Professor>>(EMPTY);
  const [booksText, setBooksText] = useState("");
  const [linksText, setLinksText] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setItems(await api.getProfessors(true));
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  function openNew() {
    setEditing(null);
    setForm(EMPTY);
    setBooksText("");
    setLinksText("");
    setOpen(true);
  }
  function openEdit(p: Professor) {
    setEditing(p);
    setForm(p);
    setBooksText((p.books ?? []).join("\n"));
    setLinksText((p.links ?? []).map((l) => `${l.label} | ${l.url}`).join("\n"));
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        books: parseBooks(booksText),
        links: parseLinks(linksText),
      };
      if (editing) await api.updateProfessor(editing.id, payload);
      else await api.createProfessor(payload);
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(p: Professor) {
    if (!confirm(`წაიშალოს ლექტორი "${p.name}"?`)) return;
    await api.deleteProfessor(p.id);
    await load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">ლექტორები</h1>
          <p className="mt-1 text-slate-500">მართე საიტზე გამოსახული ლექტორები.</p>
        </div>
        <button className="btn-primary" onClick={openNew}>
          + ახალი ლექტორი
        </button>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-slate-400">იტვირთება…</p>
        ) : (
          items.map((p) => (
            <div key={p.id} className="card p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-brand-100 font-bold text-brand-700">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)
                  )}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-slate-900">{p.name}</div>
                  <div className="truncate text-sm text-brand-700">{p.title}</div>
                </div>
              </div>
              <p className="mt-3 line-clamp-2 text-sm text-slate-600">{p.bio}</p>
              <div className="mt-4 flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    p.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {p.is_active ? "აქტიური" : "დამალული"}
                </span>
                <div>
                  <button className="text-sm font-semibold text-brand-700 hover:underline" onClick={() => openEdit(p)}>
                    რედაქტირება
                  </button>
                  <button className="ml-3 text-sm font-semibold text-red-600 hover:underline" onClick={() => remove(p)}>
                    წაშლა
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
        {!loading && items.length === 0 && (
          <p className="text-slate-400">ლექტორები ჯერ არ არის.</p>
        )}
      </div>

      <Modal
        open={open}
        title={editing ? "ლექტორის რედაქტირება" : "ახალი ლექტორი"}
        onClose={() => setOpen(false)}
        footer={
          <>
            <button className="btn-outline" onClick={() => setOpen(false)}>
              გაუქმება
            </button>
            <button className="btn-primary" onClick={save} disabled={saving || !form.name}>
              {saving ? "ინახება…" : "შენახვა"}
            </button>
          </>
        }
      >
        <div className="grid gap-4">
          <div>
            <label className="label">სახელი *</label>
            <input
              className="input"
              value={form.name ?? ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="label">თანამდებობა</label>
            <input
              className="input"
              placeholder="სენიორ ინჟინერი"
              value={form.title ?? ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">მოკლე ბიო (ბარათებზე)</label>
            <textarea
              rows={2}
              className="input"
              value={form.bio ?? ""}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </div>
          <div>
            <label className="label">სრული ბიოგრაფია (ლექტორის გვერდი)</label>
            <textarea
              rows={5}
              className="input"
              placeholder="პარაგრაფები გაყავი ცარიელი სტრიქონებით."
              value={form.biography ?? ""}
              onChange={(e) => setForm({ ...form, biography: e.target.value })}
            />
          </div>
          <div>
            <label className="label">წიგნები / პუბლიკაციები — თითო ახალ სტრიქონზე</label>
            <textarea
              rows={3}
              className="input"
              placeholder="Clean Python: A Practical Guide (2021)"
              value={booksText}
              onChange={(e) => setBooksText(e.target.value)}
            />
          </div>
          <div>
            <label className="label">ბმულები — "სახელი | https://url" ფორმატი, ახალ სტრიქონზე</label>
            <textarea
              rows={3}
              className="input"
              placeholder="LinkedIn | https://linkedin.com/in/..."
              value={linksText}
              onChange={(e) => setLinksText(e.target.value)}
            />
          </div>
          <div>
            <label className="label">სპეციალიზაციები (მძიმით გამოყოფილი)</label>
            <input
              className="input"
              placeholder="React, Python, UX"
              value={form.specialties ?? ""}
              onChange={(e) => setForm({ ...form, specialties: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">ელ. ფოსტა</label>
              <input
                className="input"
                value={form.email ?? ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
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
          <div>
            <label className="label">ფოტოს URL</label>
            <input
              className="input"
              placeholder="https://…"
              value={form.photo_url ?? ""}
              onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={form.is_active ?? true}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            საიტზე ჩანს
          </label>
        </div>
      </Modal>
    </div>
  );
}
