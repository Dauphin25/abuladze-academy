import { useEffect, useState } from "react";
import { api } from "../../api";
import type { ContactMessage } from "../../types";

export default function MessagesAdmin() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setMessages(await api.getMessages());
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function markRead(m: ContactMessage) {
    await api.markMessageRead(m.id);
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_read: true } : x)));
  }

  async function remove(m: ContactMessage) {
    if (!confirm(`წაიშალოს ${m.name}-ის შეტყობინება?`)) return;
    await api.deleteMessage(m.id);
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900">შეტყობინებები</h1>
      <p className="mt-1 text-slate-500">კონტაქტის ფორმიდან შემოსული შეტყობინებები.</p>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-slate-400">იტვირთება…</p>
        ) : messages.length === 0 ? (
          <p className="card p-8 text-center text-slate-400">შეტყობინებები არ არის.</p>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`card p-5 ${!m.is_read ? "ring-1 ring-brand-200" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{m.name}</span>
                    {!m.is_read && (
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                        ახალი
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-slate-500">{m.email}</div>
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(m.created_at).toLocaleString("ka-GE")}
                </div>
              </div>
              {m.subject && <div className="mt-3 font-medium text-slate-800">{m.subject}</div>}
              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{m.message}</p>
              <div className="mt-4 flex gap-3 border-t border-slate-100 pt-3">
                <a
                  href={`mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject || "Your message")}`}
                  className="text-sm font-semibold text-brand-700 hover:underline"
                >
                  პასუხი
                </a>
                {!m.is_read && (
                  <button
                    onClick={() => markRead(m)}
                    className="text-sm font-semibold text-slate-600 hover:underline"
                  >
                    წაკითხულად მონიშვნა
                  </button>
                )}
                <button
                  onClick={() => remove(m)}
                  className="ml-auto text-sm font-semibold text-red-600 hover:underline"
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
