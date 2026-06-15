import { useEffect, useState } from "react";
import { api } from "../../api";

const GROUPS: { title: string; fields: [string, string, boolean?][] }[] = [
  {
    title: "საიტის პარამეტრები",
    fields: [
      ["academy_name", "აკადემიის სახელი (ნავიგაციაში)"],
      ["academy_logo_url", "ლოგოს URL (ცარიელი = ტექსტური ლოგო)"],
    ],
  },
  {
    title: "Hero სექცია",
    fields: [
      ["hero_eyebrow", "ბრენდი / eyebrow"],
      ["hero_title", "სათაური"],
      ["hero_subtitle", "ქვე-სათაური", true],
      ["hero_cta", "ღილაკის ტექსტი (CTA)"],
      ["hero_badge_1", "Feature badge 1"],
      ["hero_badge_2", "Feature badge 2"],
    ],
  },
  {
    title: "სტატისტიკა",
    fields: [
      ["stat_students", "სტუდენტების სტატ."],
      ["stat_courses", "კურსების სტატ."],
      ["stat_rate", "დასაქმების სტატ."],
    ],
  },
  {
    title: "ჩვენ შესახებ",
    fields: [
      ["about_title", "სათაური"],
      ["about_text", "ძირითადი ტექსტი", true],
    ],
  },
  {
    title: "ტექ-სტრიქი (გადამოძრავებელი ტასმა)",
    fields: [["tech_marquee", "ტექნოლოგიები — მძიმით ან ახალი სტრიქონით გამოყოფილი", true]],
  },
  {
    title: "კურსების სექცია",
    fields: [
      ["courses_title", "სათაური"],
      ["courses_subtitle", "ქვე-სათაური"],
    ],
  },
  {
    title: "ლექტორების სექცია",
    fields: [
      ["professors_title", "სათაური"],
      ["professors_subtitle", "ქვე-სათაური"],
    ],
  },
  {
    title: "კონტაქტი",
    fields: [
      ["contact_title", "სათაური"],
      ["contact_email", "ელ. ფოსტა"],
      ["contact_phone", "ტელეფონი"],
      ["contact_address", "მისამართი"],
    ],
  },
];

type Lang = "ka" | "en";

export default function ContentAdmin() {
  const [lang, setLang] = useState<Lang>("ka");
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getContent(lang).then((c) => {
      setContent(c);
      setLoading(false);
    });
  }, [lang]);

  async function save(key: string) {
    setSavingKey(key);
    try {
      await api.updateContent(key, content[key] ?? "", lang);
      setSavedKey(key);
      setTimeout(() => setSavedKey((k) => (k === key ? null : k)), 2000);
    } finally {
      setSavingKey(null);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-slate-900">საიტის კონტენტი</h1>
      <p className="mt-1 text-slate-500">
        დაარედაქტირე ტექსტები მთელ საიტზე. ცვლილებები დაუყოვნებლივ ძალაში შედის.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-medium text-slate-500">ენა:</span>
        <div className="flex rounded-lg border border-slate-200 p-0.5 text-sm font-semibold">
          {(["ka", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-md px-3 py-1 ${
                lang === l ? "bg-brand-600 text-white" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {l === "ka" ? "ქართული" : "English"}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="mt-6 text-slate-400">იტვირთება…</p>}

      <div className="mt-6 space-y-6">
        {GROUPS.map((group) => (
          <section key={group.title} className="card p-6">
            <h2 className="font-semibold text-slate-900">{group.title}</h2>
            <div className="mt-4 space-y-4">
              {group.fields.map(([key, label, multiline]) => (
                <div key={key}>
                  <label className="label">{label}</label>
                  <div className="flex gap-2">
                    {multiline ? (
                      <textarea
                        rows={3}
                        className="input"
                        value={content[key] ?? ""}
                        onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                      />
                    ) : (
                      <input
                        className="input"
                        value={content[key] ?? ""}
                        onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                      />
                    )}
                    <button
                      className="btn-primary shrink-0"
                      onClick={() => save(key)}
                      disabled={savingKey === key}
                    >
                      {savingKey === key ? "…" : savedKey === key ? "✓" : "შენახვა"}
                    </button>
                  </div>
                  {key === "academy_logo_url" && content[key] && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={content[key]}
                        alt="logo preview"
                        className="h-8 w-auto rounded border border-slate-200 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <span className="text-xs text-slate-400">ლოგოს პრევიუ</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
