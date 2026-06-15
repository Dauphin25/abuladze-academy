import { useEffect, useState } from "react";
import { api, ApiError } from "../../api";
import type { EmailEvent, EmailSettings, EmailTemplate } from "../../types";

type Tab = "settings" | "templates";

export default function EmailAdmin() {
  const [tab, setTab] = useState<Tab>("settings");

  const tabLabels: Record<Tab, string> = {
    settings: "SMTP პარამეტრები",
    templates: "შაბლონები",
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">ელ. ფოსტა</h1>
      <p className="mt-1 text-slate-500">
        დააკონფიგურე გამავალი ელ. ფოსტა და დაარედაქტირე შაბლონები, რომლებიც ავტომატურად იგზავნება (მაგ. რეგისტრაციის შემდეგ).
      </p>

      <div className="mt-4 flex gap-2">
        {(["settings", "templates"] as Tab[]).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              tab === tb ? "bg-brand-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tabLabels[tb]}
          </button>
        ))}
      </div>

      <div className="mt-6">{tab === "settings" ? <SettingsTab /> : <TemplatesTab />}</div>
    </div>
  );
}

function SettingsTab() {
  const [form, setForm] = useState<EmailSettings | null>(null);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testTo, setTestTo] = useState("");
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    api.getEmailSettings().then(setForm);
  }, []);

  if (!form) return <p className="text-slate-400">იტვირთება…</p>;

  function set<K extends keyof EmailSettings>(key: K, value: EmailSettings[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
  }

  async function save() {
    if (!form) return;
    setSaving(true);
    setSaved(false);
    try {
      const payload: Partial<EmailSettings> & { password?: string } = { ...form };
      delete (payload as { has_password?: boolean }).has_password;
      if (password) payload.password = password;
      const updated = await api.updateEmailSettings(payload);
      setForm(updated);
      setPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    setTesting(true);
    setTestMsg(null);
    try {
      const res = await api.sendTestEmail(testTo);
      setTestMsg({ ok: true, text: res.detail });
    } catch (e) {
      setTestMsg({
        ok: false,
        text: e instanceof ApiError ? e.message : "ტესტ ელ. ფოსტის გაგზავნა ვერ მოხერხდა",
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => set("enabled", e.target.checked)}
          />
          <span className="font-semibold text-slate-800">ელ. ფოსტის გაგზავნის ჩართვა</span>
        </label>
        <p className="mt-1 text-sm text-slate-500">
          გამორთვის შემთხვევაში ავტომატური ელ. ფოსტები არ გაიგზავნება (ფორმები კვლავ მუშაობს).
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">SMTP სერვერი</label>
            <input
              className="input"
              placeholder="smtp.gmail.com"
              value={form.smtp_host}
              onChange={(e) => set("smtp_host", e.target.value)}
            />
          </div>
          <div>
            <label className="label">პორტი</label>
            <input
              type="number"
              className="input"
              value={form.smtp_port}
              onChange={(e) => set("smtp_port", Number(e.target.value))}
            />
            <p className="mt-1 text-xs text-slate-400">587 = STARTTLS, 465 = SSL</p>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 pb-2.5 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={form.use_tls}
                onChange={(e) => set("use_tls", e.target.checked)}
              />
              გამოიყენე STARTTLS
            </label>
          </div>
          <div>
            <label className="label">მომხმარებელი</label>
            <input
              className="input"
              placeholder="you@gmail.com"
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
            />
          </div>
          <div>
            <label className="label">პაროლი {form.has_password && "(შენახულია)"}</label>
            <input
              type="password"
              className="input"
              placeholder={form.has_password ? "•••••••• (ცარიელი = შეინახება)" : "App password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="label">გამომგზავნის ელ. ფოსტა</label>
            <input
              className="input"
              placeholder="no-reply@academy.ge"
              value={form.from_email}
              onChange={(e) => set("from_email", e.target.value)}
            />
          </div>
          <div>
            <label className="label">გამომგზავნის სახელი</label>
            <input
              className="input"
              placeholder="STEM ინგა აბულაძის აკადემია"
              value={form.from_name}
              onChange={(e) => set("from_name", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">ადმინის ელ. ფოსტა (შეტყობინებები)</label>
            <input
              className="input"
              placeholder="admin@academy.ge"
              value={form.admin_email}
              onChange={(e) => set("admin_email", e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-400">
              სწორედ ამ მისამართზე მოვა "ახალი განაცხადი / ახალი შეტყობინება" ნოტიფიკაციები.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "ინახება…" : "პარამეტრების შენახვა"}
          </button>
          {saved && <span className="text-sm font-medium text-green-600">✓ შენახულია</span>}
        </div>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-900">ტესტ ელ. ფოსტის გაგზავნა</h2>
        <p className="mt-1 text-sm text-slate-500">
          ჯერ შეინახე პარამეტრები, შემდეგ გაგზავნე ტესტი — შეამოწმე მუშაობს თუ არა.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="email"
            className="input max-w-xs"
            placeholder="test@example.com"
            value={testTo}
            onChange={(e) => setTestTo(e.target.value)}
          />
          <button className="btn-outline" onClick={sendTest} disabled={testing || !testTo}>
            {testing ? "იგზავნება…" : "ტესტის გაგზავნა"}
          </button>
        </div>
        {testMsg && (
          <p className={`mt-3 text-sm ${testMsg.ok ? "text-green-600" : "text-red-600"}`}>
            {testMsg.text}
          </p>
        )}
      </div>
    </div>
  );
}

function TemplatesTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [events, setEvents] = useState<Record<string, EmailEvent>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getEmailTemplates(), api.getEmailEvents()]).then(([tpls, evs]) => {
      setTemplates(tpls);
      setEvents(Object.fromEntries(evs.map((e) => [e.key, e])));
      setLoading(false);
    });
  }, []);

  function edit(key: string, patch: Partial<EmailTemplate>) {
    setTemplates((prev) => prev.map((t) => (t.key === key ? { ...t, ...patch } : t)));
  }

  async function save(t: EmailTemplate) {
    setSavingKey(t.key);
    try {
      await api.updateEmailTemplate(t.key, {
        subject: t.subject,
        body: t.body,
        is_active: t.is_active,
      });
      setSavedKey(t.key);
      setTimeout(() => setSavedKey((k) => (k === t.key ? null : k)), 2500);
    } finally {
      setSavingKey(null);
    }
  }

  if (loading) return <p className="text-slate-400">იტვირთება…</p>;

  return (
    <div className="space-y-6">
      {templates.map((t) => {
        const ev = events[t.key];
        return (
          <div key={t.key} className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-semibold text-slate-900">{t.name}</h2>
                {ev && (
                  <p className="text-xs text-slate-400">
                    მიმღები: <span className="font-medium capitalize">{ev.recipient}</span>
                  </p>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={t.is_active}
                  onChange={(e) => edit(t.key, { is_active: e.target.checked })}
                />
                აქტიური
              </label>
            </div>

            <div className="mt-4">
              <label className="label">სათაური (Subject)</label>
              <input
                className="input"
                value={t.subject}
                onChange={(e) => edit(t.key, { subject: e.target.value })}
              />
            </div>
            <div className="mt-4">
              <label className="label">ტექსტი (Body)</label>
              <textarea
                rows={6}
                className="input font-mono text-sm"
                value={t.body}
                onChange={(e) => edit(t.key, { body: e.target.value })}
              />
            </div>

            {ev && ev.variables.length > 0 && (
              <div className="mt-3">
                <span className="text-xs font-medium text-slate-400">ხელმისაწვდომი ცვლადები: </span>
                {ev.variables.map((v) => (
                  <code
                    key={v}
                    className="mr-1.5 rounded bg-slate-100 px-1.5 py-0.5 text-xs text-brand-700"
                  >
                    {`{{${v}}}`}
                  </code>
                ))}
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
              <button
                className="btn-primary"
                onClick={() => save(t)}
                disabled={savingKey === t.key}
              >
                {savingKey === t.key ? "ინახება…" : "შენახვა"}
              </button>
              {savedKey === t.key && (
                <span className="text-sm font-medium text-green-600">✓ შენახულია</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
