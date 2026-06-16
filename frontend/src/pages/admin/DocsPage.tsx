import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

// ─── Sidebar sections ────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "overview", label: "სისტემის მიმოხილვა" },
  { id: "public-pages", label: "საჯარო გვერდები" },
  { id: "admin-sections", label: "ადმინ სექციები" },
  { id: "api", label: "API ენდფოინტები" },
  { id: "models", label: "მონაცემთა ბაზა" },
  { id: "cms", label: "CMS — კონტენტის სისტემა" },
  { id: "email", label: "ელ. ფოსტის სისტემა" },
  { id: "flows", label: "სრული ნაკადები" },
  { id: "stack", label: "ტექნიკური სტეკი" },
  { id: "faq", label: "FAQ" },
];

// ─── Helper UI components ─────────────────────────────────────────────────────
function SectionTitle({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-5 flex items-center gap-3 scroll-mt-6 text-2xl font-extrabold text-slate-900">
      <span className="h-8 w-1 rounded-full bg-brand-600" />
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-3 mt-6 text-base font-bold text-slate-800">{children}</h3>;
}

function InfoBox({ color = "blue", children }: { color?: "blue" | "green" | "yellow" | "purple" | "red"; children: React.ReactNode }) {
  const cls = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    green: "bg-green-50 border-green-200 text-green-900",
    yellow: "bg-amber-50 border-amber-200 text-amber-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
    red: "bg-red-50 border-red-200 text-red-900",
  }[color];
  return <div className={`mb-4 rounded-xl border px-4 py-3 text-sm leading-relaxed ${cls}`}>{children}</div>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <pre className="mb-4 overflow-x-auto rounded-xl bg-slate-900 px-5 py-4 text-xs leading-relaxed text-green-300">
      <code>{children}</code>
    </pre>
  );
}

function Badge({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>
      {children}
    </span>
  );
}

function LiveLink({ to, external, children }: { to: string; external?: boolean; children: React.ReactNode }) {
  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer"
        className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition">
        {children} ↗
      </a>
    );
  }
  return (
    <Link to={to}
      className="inline-flex items-center gap-1 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition">
      {children} →
    </Link>
  );
}

function Table({ heads, rows }: { heads: string[]; rows: (string | React.ReactNode)[][] }) {
  return (
    <div className="mb-5 overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>{heads.map((h) => <th key={h} className="px-4 py-2.5">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-2.5 align-top text-slate-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Accordion({ question, children }: { question: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold text-slate-800 hover:text-brand-700">
        {question}
        <span className={`ml-3 shrink-0 text-brand-600 transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
      </button>
      {open && <div className="pb-4 text-sm leading-relaxed text-slate-600">{children}</div>}
    </div>
  );
}

function FlowStep({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">{step}</div>
        <div className="mt-1 w-px flex-1 bg-brand-100" />
      </div>
      <div className="mb-4 flex-1 pt-1">
        <div className="font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-sm text-slate-600">{children}</div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DocsPage() {
  const [activeId, setActiveId] = useState("overview");
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="flex min-h-full gap-0">
      {/* ── Sticky sidebar ── */}
      <aside className="hidden w-56 shrink-0 xl:block">
        <div className="sticky top-0 pt-1">
          <p className="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-slate-400">სარჩევი</p>
          <nav className="space-y-0.5">
            {SECTIONS.map(({ id, label }) => (
              <button key={id} onClick={() => scrollTo(id)}
                className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium transition ${
                  activeId === id ? "bg-brand-50 text-brand-700 font-semibold" : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* ── Content ── */}
      <div ref={mainRef} className="min-w-0 flex-1 space-y-12 pl-0 xl:pl-8">

        {/* Header */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-python-dark p-8 text-white">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-python-blue font-mono text-lg font-extrabold text-python-yellow">Py</span>
            <div>
              <h1 className="text-2xl font-extrabold">ტექნიკური დოკუმენტაცია</h1>
              <p className="text-sm text-slate-300">STEM ინგა აბულაძის აკადემია — სრული სახელმძღვანელო</p>
            </div>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300">
            ეს გვერდი განკუთვნილია ლექტორისთვის. აქ ნახავ ყველა ფუნქციას, API ენდფოინტს,
            მონაცემთა ბაზის სქემას, ელ. ფოსტის სისტემის მუშაობის პრინციპს და ნაკადებს — ცოცხალი
            ბმულებით, კოდის მაგალითებით და ნაბიჯ-ნაბიჯ სქემებით.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <LiveLink to="/" external>საჯარო საიტი</LiveLink>
            <LiveLink to="http://127.0.0.1:8000/docs" external>Swagger UI (API)</LiveLink>
          </div>
        </div>

        {/* ══════════════════════════════════════════════
            1. OVERVIEW
        ══════════════════════════════════════════════ */}
        <section>
          <SectionTitle id="overview">სისტემის მიმოხილვა</SectionTitle>
          <InfoBox color="blue">
            <strong>STEM ინგა აბულაძის აკადემია</strong> — სრული Full-Stack ვებ-აპლიკაცია Python-ის
            სასწავლო აკადემიისთვის. FastAPI ბექენდი + React ფრონტენდი + ადმინ პანელი = ერთი სისტემა.
          </InfoBox>

          <SubTitle>სისტემის სქემა</SubTitle>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              { color: "from-blue-500 to-blue-700", label: "ბრაუზერი (ვიზიტორი)", desc: "React SPA · http://localhost:5173", icon: "🌐" },
              { color: "from-python-blue to-python-dark", label: "FastAPI სერვერი", desc: "REST API · http://localhost:8000", icon: "⚡" },
              { color: "from-slate-600 to-slate-800", label: "მონაცემთა ბაზა", desc: "SQLite (dev) · PostgreSQL (prod)", icon: "🗄️" },
            ].map((c) => (
              <div key={c.label} className={`rounded-xl bg-gradient-to-br ${c.color} p-5 text-white`}>
                <div className="text-2xl">{c.icon}</div>
                <div className="mt-2 font-bold">{c.label}</div>
                <div className="mt-1 text-xs opacity-80">{c.desc}</div>
              </div>
            ))}
          </div>

          <SubTitle>საიტის სტრუქტურა (URL რუქა)</SubTitle>
          <div className="mb-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-blue-500">საჯარო გვერდები</p>
              {[
                ["/", "Landing Page — მთავარი"],
                ["/courses", "კურსების სია"],
                ["/courses/:id", "კურსის დეტალები"],
                ["/lecturers", "ლექტორების სია"],
                ["/lecturers/:id", "ლექტორის პროფილი"],
                ["/register", "რეგისტრაციის ფორმა"],
              ].map(([url, label]) => (
                <div key={url} className="flex items-center justify-between border-t border-blue-100 py-1.5 first:border-0">
                  <code className="text-xs text-blue-700">{url}</code>
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-purple-100 bg-purple-50 p-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-purple-500">ადმინ გვერდები</p>
              {[
                ["/admin", "Dashboard — სტატისტიკა"],
                ["/admin/courses", "კურსების მართვა"],
                ["/admin/professors", "ლექტორების მართვა"],
                ["/admin/students", "განაცხადები"],
                ["/admin/messages", "შეტყობინებები"],
                ["/admin/content", "CMS — ტექსტები"],
                ["/admin/email", "ელ. ფოსტა"],
              ].map(([url, label]) => (
                <div key={url} className="flex items-center justify-between border-t border-purple-100 py-1.5 first:border-0">
                  <code className="text-xs text-purple-700">{url}</code>
                  <span className="text-xs text-slate-600">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <SubTitle>ძირითადი ფუნქციები</SubTitle>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: "📚", t: "კურსების კატალოგი", d: "სია + დეტალური გვერდი 13 ველით: ასაკი, გრაფიკი, სერტ., ფორმატი..." },
              { icon: "👩‍🏫", t: "ლექტორების პროფილი", d: "ბიოგრაფია, წიგნები, ბმულები, სპეციალიზაცია" },
              { icon: "📋", t: "განაცხადები", d: "რეგისტრაციის ფორმა → ადმინის პანელი → სტატუსების მართვა" },
              { icon: "✏️", t: "CMS — კონტენტი", d: "ყველა ტექსტი ბაზიდან, ადმინიდან რედაქტირებადი, ყო 2 ენაზე" },
              { icon: "📧", t: "ელ. ფოსტა", d: "SMTP + 4 ავტომატური შაბლონი, {{ცვლადები}}, ფონური გაგზავნა" },
              { icon: "🌐", t: "ორი ენა", d: "ქართული (ძირითადი) + ინგლისური — navbar-ში გადამრთველი" },
            ].map((f) => (
              <div key={f.t} className="card p-4">
                <div className="text-2xl">{f.icon}</div>
                <div className="mt-2 font-semibold text-slate-900">{f.t}</div>
                <div className="mt-1 text-xs text-slate-500">{f.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            2. PUBLIC PAGES
        ══════════════════════════════════════════════ */}
        <section>
          <SectionTitle id="public-pages">საჯარო გვერდები</SectionTitle>
          <InfoBox color="blue">
            ყველა საჯარო გვერდი ხელმისაწვდომია ავთენტიფიკაციის გარეშე.
            მონაცემები იტვირთება FastAPI-დან, კონტენტი — CMS ბაზიდან.
          </InfoBox>

          {/* Landing */}
          <div className="mb-6 card overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-5 py-3">
              <div>
                <span className="font-mono text-sm font-bold text-white">/ — Landing Page</span>
                <span className="ml-3 text-xs text-slate-400">LandingPage.tsx</span>
              </div>
              <LiveLink to="/" external>გახსნა ↗</LiveLink>
            </div>
            <div className="p-5">
              <p className="mb-3 text-sm text-slate-600">7 სექციისგან შედგება, ყველა CMS-ით კონტროლირებადი:</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {["Hero + TypingCode", "Tech Marquee", "სტატისტიკა", "ჩვენ შესახებ", "კურსების სია", "ლექტორები", "Enroll ფორმა", "კონტაქტი"].map((s) => (
                  <div key={s} className="rounded-lg bg-slate-50 px-3 py-2 text-center text-xs font-medium text-slate-700">{s}</div>
                ))}
              </div>
              <SubTitle>API calls (გვერდის ჩატვირთვაზე)</SubTitle>
              <Code>{`GET /api/content?lang=ka   → ყველა CMS ტექსტი
GET /api/courses           → კურსების სია
GET /api/professors        → ლექტორების სია`}</Code>
            </div>
          </div>

          {/* Courses */}
          <div className="mb-6 card overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-5 py-3">
              <div>
                <span className="font-mono text-sm font-bold text-white">/courses — კურსების სია</span>
                <span className="ml-3 text-xs text-slate-400">CoursesPage.tsx</span>
              </div>
              <LiveLink to="/courses" external>გახსნა ↗</LiveLink>
            </div>
            <div className="p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">ფუნქციები:</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    <li>✅ ფილტრაცია დონის მიხედვით (დამწყები / საშუალო / მაღალი)</li>
                    <li>✅ ბარათები: სურათი/ხატი, badge-ები, ფასი, მეტა-ინფო</li>
                    <li>✅ კლიკი → <code className="text-xs bg-slate-100 px-1 rounded">/courses/:id</code></li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">ბარათზე ჩანს:</p>
                  <ul className="mt-2 space-y-1 text-xs text-slate-500">
                    <li>🏷 დონე, ფორმატი, სერტიფიკატი (badge)</li>
                    <li>📋 სათაური + მოკლე აღწერა</li>
                    <li>⏱ ხანგრძლივობა &nbsp;|&nbsp; 📅 გრაფიკი</li>
                    <li>👥 მაქს. სტუდ. &nbsp;|&nbsp; 🌐 ენა</li>
                    <li>💰 ფასი ან "უფასო"</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Course Detail */}
          <div className="mb-6 card overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-5 py-3">
              <div>
                <span className="font-mono text-sm font-bold text-white">/courses/:id — კურსის დეტალები</span>
                <span className="ml-3 text-xs text-slate-400">CourseDetailPage.tsx</span>
              </div>
              <LiveLink to="/courses/1" external>მაგ. კურსი ↗</LiveLink>
            </div>
            <div className="p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">Hero სექცია (მარცხნივ):</p>
                  <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
                    <li>• სათაური, badge-ები</li>
                    <li>• სწრაფი ფაქტები (4 ბოქსი): ხანგრძლივობა, ენა, ჯგუფი, ასაკი</li>
                  </ul>
                  <p className="mt-3 text-sm font-semibold text-slate-800">Enroll Card (მარჯვნივ):</p>
                  <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
                    <li>• ფასი, დაწყება, გრაფიკი</li>
                    <li>• ⚠️ ადგილების შეზღუდვა</li>
                    <li>• ღილაკი → <code className="bg-slate-100 px-1 rounded">/register?course=ID</code></li>
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">ძირითადი სექციები:</p>
                  <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
                    <li>📌 კურსის მიზანი (aim)</li>
                    <li>✅ რას ისწავლი — bullet list</li>
                    <li>📝 კურსის სრული აღწერა</li>
                    <li>👥 ვისთვისაა (target_audience)</li>
                    <li>⚠️ წინასწარი ცოდნა — ყვითელ ბოქსში</li>
                    <li>📊 Sidebar: ყველა დეტალი + ღილაკი</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Lecturers */}
          <div className="mb-6 card overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-5 py-3">
              <div>
                <span className="font-mono text-sm font-bold text-white">/lecturers + /lecturers/:id</span>
                <span className="ml-3 text-xs text-slate-400">LecturersPage.tsx / LecturerDetailPage.tsx</span>
              </div>
              <div className="flex gap-2">
                <LiveLink to="/lecturers" external>სია ↗</LiveLink>
                <LiveLink to="/lecturers/1" external>პროფილი ↗</LiveLink>
              </div>
            </div>
            <div className="p-5 text-sm text-slate-600">
              <p><strong>სია:</strong> ბარათები — ფოტო/ინიციალები, სახელი, თანამდებობა, მოკლე ბიო.</p>
              <p className="mt-2"><strong>პროფილი:</strong> Sidebar (ფოტო, სახელი, სპეც-ები, ბმულები) + Main (სრული ბიოგრაფია პარაგრაფებად, წიგნები 📘).</p>
            </div>
          </div>

          {/* Register */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between bg-slate-900 px-5 py-3">
              <div>
                <span className="font-mono text-sm font-bold text-white">/register — სარეგისტრაციო ფორმა</span>
                <span className="ml-3 text-xs text-slate-400">RegisterPage.tsx + EnrollForm</span>
              </div>
              <LiveLink to="/register" external>გახსნა ↗</LiveLink>
            </div>
            <div className="p-5">
              <p className="mb-2 text-sm text-slate-600">ველები: სახელი*, ელ. ფოსტა*, ტელეფონი, კურსი (dropdown), შეტყობინება</p>
              <Code>{`POST /api/students {
  full_name, email, phone,
  course_id: 2,          // dropdown-დან
  message: "..."
}
← 201 Created
↓ Background: 2 ელ. ფოსტა (სტუდენტს + ადმინს)`}</Code>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            3. ADMIN SECTIONS
        ══════════════════════════════════════════════ */}
        <section>
          <SectionTitle id="admin-sections">ადმინ სექციები</SectionTitle>
          <InfoBox color="purple">
            ყველა ადმინ გვერდი <strong>JWT ტოკენით დაცულია</strong>. შესვლა: <code>admin / admin123</code>.
            ტოკენი ინახება localStorage-ში, ვადა: 12 საათი.
          </InfoBox>

          <div className="space-y-4">
            {/* Dashboard */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between bg-purple-900 px-5 py-3">
                <span className="font-mono text-sm font-bold text-white">/admin — მთავარი პანელი</span>
                <Link to="/admin" className="text-xs font-semibold text-purple-200 hover:text-white">გახსნა →</Link>
              </div>
              <div className="p-4 text-sm text-slate-600">
                4 სტატისტიკის ბარათი (კლიკადი): <strong>კურსები · ლექტორები · განაცხადები (+ X ახალი) · შეტყობინებები (+ X წაუკითხავი).</strong>
                სწრაფი ბმულები ყველა სექციაზე.
              </div>
            </div>

            {/* Courses Admin */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between bg-purple-900 px-5 py-3">
                <span className="font-mono text-sm font-bold text-white">/admin/courses — კურსების მართვა</span>
                <Link to="/admin/courses" className="text-xs font-semibold text-purple-200 hover:text-white">გახსნა →</Link>
              </div>
              <div className="p-4">
                <p className="mb-3 text-sm text-slate-600">CRUD — შექმნა, რედაქტირება, წაშლა. Modal 3 სექციად:</p>
                <div className="grid gap-2 text-xs sm:grid-cols-3">
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="font-bold text-slate-800">1. ძირითადი ინფო</p>
                    <p className="mt-1 text-slate-500">სათაური, მოკლე/სრული აღწერა, სურათის URL</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="font-bold text-slate-800">2. დეტალები</p>
                    <p className="mt-1 text-slate-500">დონე, ფორმატი, ხანგრძლივობა, გრაფიკი, ფასი, ასაკი, მაქს. სტ., სერტ.</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3">
                    <p className="font-bold text-slate-800">3. სასწ. შინაარსი</p>
                    <p className="mt-1 text-slate-500">მიზანი, target audience, წინ. ცოდნა, რას ისწავლი (list)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professors Admin */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between bg-purple-900 px-5 py-3">
                <span className="font-mono text-sm font-bold text-white">/admin/professors — ლექტორები</span>
                <Link to="/admin/professors" className="text-xs font-semibold text-purple-200 hover:text-white">გახსნა →</Link>
              </div>
              <div className="p-4 text-sm text-slate-600">
                <p>Modal ველები: სახელი, თანამდებობა, მოკლე ბიო (ბარათებზე), სრული ბიოგ. (პროფილ გვერდზე), წიგნები (ახალ სტრ-ზე), ბმულები ("სახ | URL"), სპეც., ელ. ფოსტა, ფოტოს URL.</p>
                <InfoBox color="yellow">წიგნები — <code>ახალ სტრიქონზე</code> ① ②. ბმულები — <code>LinkedIn | https://...</code> ფორმატი, ახალ სტრიქონზე.</InfoBox>
              </div>
            </div>

            {/* Students */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between bg-purple-900 px-5 py-3">
                <span className="font-mono text-sm font-bold text-white">/admin/students — განაცხადები</span>
                <Link to="/admin/students" className="text-xs font-semibold text-purple-200 hover:text-white">გახსნა →</Link>
              </div>
              <div className="p-4 text-sm text-slate-600">
                <p className="mb-2">ფილტრები: <Badge color="bg-slate-100 text-slate-700">ყველა</Badge> <Badge color="bg-blue-100 text-blue-700">ახალი</Badge> <Badge color="bg-amber-100 text-amber-700">დაკავშირდა</Badge> <Badge color="bg-green-100 text-green-700">ჩარიცხული</Badge></p>
                <p>სტატუსის ცვლა: ახალი → დაკავშირდა → ჩარიცხული (ღილაკებით, inline).</p>
              </div>
            </div>

            {/* Messages */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between bg-purple-900 px-5 py-3">
                <span className="font-mono text-sm font-bold text-white">/admin/messages — შეტყობინებები</span>
                <Link to="/admin/messages" className="text-xs font-semibold text-purple-200 hover:text-white">გახსნა →</Link>
              </div>
              <div className="p-4 text-sm text-slate-600">
                კონტაქტის ფორმიდან შემოსული შეტყობინებები. <Badge color="bg-brand-100 text-brand-700">ახალი</Badge> badge წაუკითხავებზე.
                "პასუხი" ღილაკი — <code>mailto:</code> ბმული. "წაკითხულად მონიშვნა" + "წაშლა".
              </div>
            </div>

            {/* Content */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between bg-purple-900 px-5 py-3">
                <span className="font-mono text-sm font-bold text-white">/admin/content — CMS კონტენტი</span>
                <Link to="/admin/content" className="text-xs font-semibold text-purple-200 hover:text-white">გახსნა →</Link>
              </div>
              <div className="p-4 text-sm text-slate-600">
                ენის გადამრთველი: <Badge color="bg-brand-600 text-white">ქართული</Badge> <Badge color="bg-slate-100 text-slate-700">English</Badge>.
                8 სექცია — საიტის პარამ., Hero, სტატ., About, Marquee, კურსები, ლექტ., კონტაქტი.
                თითო ველს გვერდით "შენახვა" — ცვლილება დაუყოვნებლივ ეფექტს ახდენს.
              </div>
            </div>

            {/* Email */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between bg-purple-900 px-5 py-3">
                <span className="font-mono text-sm font-bold text-white">/admin/email — ელ. ფოსტა</span>
                <Link to="/admin/email" className="text-xs font-semibold text-purple-200 hover:text-white">გახსნა →</Link>
              </div>
              <div className="p-4 text-sm text-slate-600">
                <p><strong>SMTP ჩანართი:</strong> სერვერი, პორტი, TLS, მომხ., პაროლი (App Password), From Name, ადმინ ელ. ფოსტა. ტესტ გაგზავნა.</p>
                <p className="mt-1"><strong>შაბლონები ჩანართი:</strong> 4 ღონისძიების შაბლონი — subject + body, <code>{`{{ცვლადი}}`}</code> chips, ✅ აქტიური.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            4. API ENDPOINTS
        ══════════════════════════════════════════════ */}
        <section>
          <SectionTitle id="api">API ენდფოინტები</SectionTitle>
          <InfoBox color="green">
            Base URL: <code className="bg-green-100 px-1 rounded">http://127.0.0.1:8000</code>&nbsp;·&nbsp;
            Swagger UI:{" "}
            <a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer"
              className="font-semibold text-green-800 underline">
              /docs ↗
            </a>
            &nbsp;(ყველა endpoint ინტერაქტიულად)
          </InfoBox>

          <SubTitle>ავთენტიფიკაცია</SubTitle>
          <Table
            heads={["Method", "Path", "Access", "აღწერა"]}
            rows={[
              [<Badge color="bg-blue-100 text-blue-700">POST</Badge>, "/api/auth/login", "Public", "JWT ტოკენის მიღება (form-urlencoded)"],
              [<Badge color="bg-green-100 text-green-700">GET</Badge>, "/api/auth/me", "🔒 Admin", "მიმდინარე ადმინის info"],
            ]}
          />
          <Code>{`# Login — Content-Type: application/x-www-form-urlencoded (არა JSON!)
POST /api/auth/login
body: username=admin&password=admin123

# Response:
{ "access_token": "eyJhbGci...", "token_type": "bearer" }

# შემდეგ ყველა admin request-ზე:
Authorization: Bearer eyJhbGci...`}</Code>

          <SubTitle>კურსები</SubTitle>
          <Table
            heads={["Method", "Path", "Access", "აღწერა"]}
            rows={[
              [<Badge color="bg-green-100 text-green-700">GET</Badge>, "/api/courses", "Public", "ყველა აქტიური კურსი"],
              [<Badge color="bg-green-100 text-green-700">GET</Badge>, "/api/courses?include_inactive=true", "🔒 Admin", "+ დამალული კურსები"],
              [<Badge color="bg-green-100 text-green-700">GET</Badge>, "/api/courses/{id}", "Public", "ერთი კურსი ID-ით"],
              [<Badge color="bg-blue-100 text-blue-700">POST</Badge>, "/api/courses", "🔒 Admin", "ახალი კურსი"],
              [<Badge color="bg-amber-100 text-amber-700">PUT</Badge>, "/api/courses/{id}", "🔒 Admin", "კურსის განახლება"],
              [<Badge color="bg-red-100 text-red-700">DELETE</Badge>, "/api/courses/{id}", "🔒 Admin", "კურსის წაშლა"],
            ]}
          />

          <SubTitle>ლექტორები</SubTitle>
          <Table
            heads={["Method", "Path", "Access", "აღწერა"]}
            rows={[
              [<Badge color="bg-green-100 text-green-700">GET</Badge>, "/api/professors", "Public", "ყველა აქტიური ლექტორი"],
              [<Badge color="bg-green-100 text-green-700">GET</Badge>, "/api/professors/{id}", "Public", "ერთი ლექტორი"],
              [<Badge color="bg-blue-100 text-blue-700">POST</Badge>, "/api/professors", "🔒 Admin", "ახალი ლექტორი"],
              [<Badge color="bg-amber-100 text-amber-700">PUT</Badge>, "/api/professors/{id}", "🔒 Admin", "განახლება"],
              [<Badge color="bg-red-100 text-red-700">DELETE</Badge>, "/api/professors/{id}", "🔒 Admin", "წაშლა"],
            ]}
          />

          <SubTitle>განაცხადები, კონტაქტი, CMS, ელ. ფოსტა</SubTitle>
          <Table
            heads={["Method", "Path", "Access", "აღწერა"]}
            rows={[
              [<Badge color="bg-blue-100 text-blue-700">POST</Badge>, "/api/students", "Public", "განაცხადის გაგზავნა + 2 ემაილი"],
              [<Badge color="bg-green-100 text-green-700">GET</Badge>, "/api/students", "🔒 Admin", "ყველა განაცხადი"],
              [<Badge color="bg-amber-100 text-amber-700">PATCH</Badge>, "/api/students/{id}", "🔒 Admin", "სტატუსის შეცვლა"],
              [<Badge color="bg-blue-100 text-blue-700">POST</Badge>, "/api/contact", "Public", "კონტაქტ ფორმა + 2 ემაილი"],
              [<Badge color="bg-green-100 text-green-700">GET</Badge>, "/api/content?lang=ka", "Public", "ყველა CMS კონტენტი"],
              [<Badge color="bg-amber-100 text-amber-700">PUT</Badge>, "/api/content/{key}?lang=ka", "🔒 Admin", "ერთი გასაღების განახლება"],
              [<Badge color="bg-green-100 text-green-700">GET</Badge>, "/api/email/settings", "🔒 Admin", "SMTP (პაროლი დამალულია)"],
              [<Badge color="bg-blue-100 text-blue-700">POST</Badge>, "/api/email/test", "🔒 Admin", "ტესტ ელ. ფოსტის გაგზავნა"],
            ]}
          />
        </section>

        {/* ══════════════════════════════════════════════
            5. DATABASE MODELS
        ══════════════════════════════════════════════ */}
        <section>
          <SectionTitle id="models">მონაცემთა ბაზა</SectionTitle>
          <InfoBox color="blue">
            Development-ში: <strong>SQLite</strong> (<code>backend/abuladze.db</code>).
            Production/Docker-ში: <strong>PostgreSQL 16</strong>. ORM: SQLAlchemy 2.0.
            ყველა მოდელი <code>backend/app/models.py</code>-შია.
          </InfoBox>
          <InfoBox color="yellow">
            <strong>მნიშვნელოვანი:</strong> <code>models.py</code>-ში ველის დამატების შემდეგ, SQLite ბაზა ხელახლა უნდა შეიქმნას.
            გაუშვი: <code>rm backend/abuladze.db</code> და გადატვირთე backend.
          </InfoBox>

          <SubTitle>Course — კურსის მოდელი (13 rich field)</SubTitle>
          <Table
            heads={["ველი", "ტიპი", "მაგალითი"]}
            rows={[
              ["title", "VARCHAR(160)", "Python და ბექენდ ინჟინერია"],
              ["summary", "VARCHAR(400)", "მოკლე — ბარათებზე"],
              ["description", "TEXT", "სრული აღწერა — detail გვერდზე"],
              ["level", "VARCHAR", "დამწყები / საშუალო / მაღალი"],
              ["duration", "VARCHAR", "12 კვირა"],
              ["price", "NUMERIC NULL", "1100 (null = უფასო)"],
              ["format", "VARCHAR", "ოფლაინ / ონლაინ / ჰიბრიდი"],
              ["language", "VARCHAR", "ქართული"],
              ["schedule", "VARCHAR", "კვირაში 2-ჯერ, 11:00–14:00"],
              ["start_date", "VARCHAR", "2026 წ. 1 ოქტომბერი"],
              ["aim", "TEXT", "კურსის მიზანია…"],
              ["target_audience", "TEXT", "ვისთვისაა განკუთვნილი"],
              ["prerequisites", "TEXT", "წინ. ცოდნა"],
              ["what_you_learn", "JSON[]", '["FastAPI", "Docker", ...]'],
              ["min_age / max_age", "INTEGER NULL", "18 / null"],
              ["max_students", "INTEGER NULL", "10"],
              ["certificate", "BOOLEAN", "true"],
              ["image_url", "VARCHAR", "https://…(ბანერი)"],
              ["is_active", "BOOLEAN", "false = იმალება საიტზე"],
            ]}
          />

          <SubTitle>Professor — ლექტორის მოდელი</SubTitle>
          <Table
            heads={["ველი", "ტიპი", "შენიშვნა"]}
            rows={[
              ["name", "VARCHAR(120)", ""],
              ["title", "VARCHAR(120)", "თანამდებობა"],
              ["bio", "TEXT", "მოკლე — ბარათებზე"],
              ["biography", "TEXT", "სრული — detail გვერდზე"],
              ["photo_url", "VARCHAR", "სურათის URL"],
              ["specialties", "VARCHAR", "მძიმით: Python, React"],
              ["books", "JSON", '["წიგნი (2021)", ...]'],
              ["links", "JSON", '[{"label":"LinkedIn","url":"…"}]'],
              ["email", "VARCHAR", ""],
            ]}
          />

          <SubTitle>SiteContent — CMS ბაზა (კომბინირებული PK)</SubTitle>
          <Code>{`(key, locale) → PK   ← ერთი key-ს შეიძლება ჰქონდეს ka + en ვერსია

SELECT * FROM site_content WHERE key = 'hero_title';
│ key         │ locale │ value                              │
│ hero_title  │ ka     │ გახდი პროგრამისტი პრაქტიკული გზით │
│ hero_title  │ en     │ Become a Software Engineer         │`}</Code>
        </section>

        {/* ══════════════════════════════════════════════
            6. CMS
        ══════════════════════════════════════════════ */}
        <section>
          <SectionTitle id="cms">CMS — კონტენტის სისტემა</SectionTitle>
          <InfoBox color="green">
            ყველა marketing ტექსტი ბაზაში ინახება. ადმინი ცვლის → API → DB → საიტი დაუყოვნებლივ განახლდება.
            კოდის ხელახლა გამართვა <strong>არ სჭირდება</strong>.
          </InfoBox>

          <SubTitle>ყველა CMS გასაღები</SubTitle>
          <Table
            heads={["გასაღები", "სად ჩანს", "ორი ენა?"]}
            rows={[
              ["academy_name", "Navbar-ი", "✅"],
              ["academy_logo_url", "Navbar-ი (ლოგო)", "✅"],
              ["hero_eyebrow", "Hero — badge", "✅"],
              ["hero_title", "Hero — მთ. სათ.", "✅"],
              ["hero_subtitle", "Hero — ქვე-სათ.", "✅"],
              ["hero_cta", "Hero — ღილაკი", "✅"],
              ["hero_badge_1 / 2", "Hero — checkmark-ები", "✅"],
              ["stat_students / courses / rate", "სტატ. სექცია", "✅"],
              ["about_title / about_text", "About სექცია", "✅"],
              ["tech_marquee", "გადამოძ. სტრიქი", "✅"],
              ["courses_title / subtitle", "კურსების სექცია", "✅"],
              ["professors_title / subtitle", "ლექტ. სექცია", "✅"],
              ["contact_title / email / phone / address", "კონტაქტი", "✅"],
            ]}
          />

          <SubTitle>ახალი CMS გასაღების დამატება (3 ნაბიჯი)</SubTitle>
          <div className="space-y-3">
            <FlowStep step="1" title="seed.py — CONTENT dict-ში დაამატე">
              <Code>{`"my_key": {
    "ka": "ქართული ტექსტი",
    "en": "English text",
},`}</Code>
            </FlowStep>
            <FlowStep step="2" title="Frontend — c() ფუნქციით გამოიყენე">
              <Code>{`<h2>{c("my_key", "fallback")}</h2>`}</Code>
            </FlowStep>
            <FlowStep step="3" title="ContentAdmin.tsx — GROUPS-ში დაამატე">
              <Code>{`{ title: "ჩემი სექცია", fields: [["my_key", "ლეიბელი"]] }`}</Code>
            </FlowStep>
          </div>
          <InfoBox color="yellow">შემდეგ წაშალე <code>backend/abuladze.db</code> და გადატვირთე backend — seed-ი ახალ key-ს ჩაწერს.</InfoBox>

          <SubTitle>ka Fallback სისტემა</SubTitle>
          <Code>{`GET /api/content?lang=en

# Backend logic (content.py):
base = {ყველა ka key}          # ← ყოველთვის ბაზა
en   = {ყველა en key}          # ← override
result = {**base, **en}        # en-ი ფარავს ka-ს სადაც ითარგმნა

# თუ en ვერსია ცარიელია → ka ჩანს (fallback)`}</Code>
        </section>

        {/* ══════════════════════════════════════════════
            7. EMAIL SYSTEM
        ══════════════════════════════════════════════ */}
        <section>
          <SectionTitle id="email">ელ. ფოსტის სისტემა</SectionTitle>
          <InfoBox color="green">
            ელ. ფოსტა <strong>ყოველთვის ფონში</strong> იგზავნება (FastAPI BackgroundTasks).
            SMTP შეცდომა <strong>არასოდეს ამტვრევს</strong> ფორმის გაგზავნას. ვიზიტორი ყოველთვის 201 იღებს.
          </InfoBox>

          <SubTitle>4 ავტომატური ღონისძიება</SubTitle>
          <Table
            heads={["გასაღები", "ვინ იგზავნება", "ცვლადები"]}
            rows={[
              ["registration", "სტუდენტი (განმცხადებელი)", "name, email, phone, course, message"],
              ["admin_new_application", "ადმინი", "name, email, phone, course, message"],
              ["contact_confirmation", "კონტაქტის გამომგზავნი", "name, email, subject, message"],
              ["admin_new_message", "ადმინი", "name, email, subject, message"],
            ]}
          />

          <SubTitle>{"შაბლონები — {{ცვლადები}} სინტაქსი"}</SubTitle>
          <Code>{`# მაგალითი — registration შაბლონი:
Subject: თქვენი განაცხადი მიღებულია — {{course}}
Body:
გამარჯობა {{name}},

გმადლობთ {{course}}-ზე რეგისტრაციისთვის!
ჩვენ მალე დაგიკავშირდებით.

# render() ფუნქცია ავტომატურად ცვლის:
{{name}}    → "ნინო ბერიძე"
{{course}}  → "Python კურსი"
{{email}}   → "nino@example.com"`}</Code>

          <SubTitle>SMTP — Gmail App Password</SubTitle>
          <div className="space-y-2">
            {[
              ["1", "myaccount.google.com → Security → 2-Step Verification (ჩართვა)"],
              ["2", "Security → App passwords → სახელი: AbuladzeAcademy → Generate"],
              ["3", "16-სიმბ. კოდი (ერთხელ ჩანს) → admin/email-ში ჩასვი"],
              ["4", "smtp.gmail.com, პორტი: 587, STARTTLS: ✅"],
              ["5", "შენახვა → ტესტ ემაილი → inbox შეამოწმე"],
            ].map(([s, t]) => (
              <div key={s} className="flex items-start gap-3 rounded-lg bg-slate-50 px-4 py-2.5">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-green-500 text-xs font-bold text-white">{s}</span>
                <span className="text-sm text-slate-700">{t}</span>
              </div>
            ))}
          </div>

          <SubTitle>პაროლის უსაფრთხოება</SubTitle>
          <Code>{`# API პასუხი (GET /api/email/settings):
{
  "enabled": true,
  "smtp_host": "smtp.gmail.com",
  "has_password": true,   // ← true = პაროლი დაყენებულია
  // "password" ველი საერთოდ არ არსებობს!
}

# პაროლი ბაზაში ინახება plain text-ად.
# Production-ისთვის გამოიყენე environment variable.`}</Code>
        </section>

        {/* ══════════════════════════════════════════════
            8. FLOWS
        ══════════════════════════════════════════════ */}
        <section>
          <SectionTitle id="flows">სრული ნაკადები</SectionTitle>

          <SubTitle>ნაკადი 1 — სტუდენტი კურსზე ირეგისტრირება</SubTitle>
          <div className="card mb-6 p-5">
            <FlowStep step="1" title="სტუდენტი გახსნის საიტს">React ჩატვირთავს, GET /api/content + /courses + /professors</FlowStep>
            <FlowStep step="2" title="კლიკავს კურსის ბარათზე">/courses → /courses/2 → GET /api/courses/2 → detail გვერდი</FlowStep>
            <FlowStep step="3" title='"რეგისტრაცია" ღილაკი'>/register?course=2 → RegisterPage → EnrollForm (dropdown შევსებული)</FlowStep>
            <FlowStep step="4" title="ფორმის გაგზავნა">POST /api/students {"{"} full_name, email, course_id: 2 {"}"} → 201 Created</FlowStep>
            <FlowStep step="5" title="ფონში 2 ემაილი">
              BackgroundTask #1: "registration" → სტუდენტის ელ. ფოსტაზე<br />
              BackgroundTask #2: "admin_new_application" → ადმინის ელ. ფოსტაზე
            </FlowStep>
            <FlowStep step="6" title='UI: "განაცხადი მიღებულია! ✓"'>სტუდენტი ხედავს Success შეტყობინებას. ემაილი ფონშია.</FlowStep>
          </div>

          <SubTitle>ნაკადი 2 — ადმინი კურსს ამატებს</SubTitle>
          <div className="card mb-6 p-5">
            <FlowStep step="1" title="/admin/login → შესვლა">POST /api/auth/login → JWT ტოკენი localStorage-ში</FlowStep>
            <FlowStep step="2" title={'/admin/courses → "+ ახალი კურსი"'}>Modal-ი იხსნება, ყველა ველი ცარიელია</FlowStep>
            <FlowStep step="3" title="ველების შევსება">"Python კურსი", მიზანი, რას ისწავლი (ახ. სტრ-ზე), ✅ სერტ., ✅ ჩანს</FlowStep>
            <FlowStep step="4" title='"შენახვა"'>POST /api/courses + Authorization: Bearer ... → 201 → Modal დაიხურება</FlowStep>
            <FlowStep step="5" title="კურსი მაშინვე ჩანს">/courses და / გვერდზე (ახლად fetch-ზე)</FlowStep>
          </div>

          <SubTitle>ნაკადი 3 — ადმინი ტექსტს ცვლის (CMS)</SubTitle>
          <div className="card mb-6 p-5">
            <FlowStep step="1" title="/admin/content → ქართული ჩანართი">GET /api/content?lang=ka → ყველა ველი ივსება</FlowStep>
            <FlowStep step="2" title="Hero სათაური → ახალი ტექსტი">ველში ჩაწერა</FlowStep>
            <FlowStep step="3" title='"შენახვა"'>PUT /api/content/hero_title?lang=ka {"{"}"value": "ახალი"{"}"} → DB UPDATE</FlowStep>
            <FlowStep step="4" title="საიტი განახლდება">Landing Page-ი შემდეგ გახსნაზე → GET /api/content → {"<h1>"}ახალი{"</h1>"}</FlowStep>
          </div>

          <SubTitle>ნაკადი 4 — JWT ავთენტიფიკაცია</SubTitle>
          <Code>{`Browser                     FastAPI
  │                              │
  ├── POST /api/auth/login ────▶ │ verify_password() → True
  │   username=admin             │ create_token("admin") → eyJ...
  │   password=admin123          │
  │ ◀── {access_token: "eyJ..."} │
  │                              │
  ├── GET /api/students ───────▶ │ get_current_admin():
  │   Authorization: Bearer eyJ  │   jwt.decode() → "admin"
  │                              │   db.get(Admin, username)
  │ ◀── [{id:1, ...}] ─────────  │   ← 200 OK`}</Code>
        </section>

        {/* ══════════════════════════════════════════════
            9. STACK
        ══════════════════════════════════════════════ */}
        <section>
          <SectionTitle id="stack">ტექნიკური სტეკი</SectionTitle>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-5">
              <h3 className="mb-3 font-bold text-slate-900">Backend</h3>
              <Table
                heads={["ბიბლიოთეკა", "დანიშნულება"]}
                rows={[
                  ["FastAPI 0.115", "REST API ფრეიმვ."],
                  ["SQLAlchemy 2.0", "ORM"],
                  ["Pydantic 2", "ვალიდაცია"],
                  ["PyJWT 2.10", "JWT ტოკენები"],
                  ["bcrypt 4.2", "პაროლ. hash"],
                  ["smtplib", "ელ. ფოსტა (ჩაშენ.)"],
                  ["psycopg[binary]", "PostgreSQL დრაივ."],
                ]}
              />
            </div>
            <div className="card p-5">
              <h3 className="mb-3 font-bold text-slate-900">Frontend</h3>
              <Table
                heads={["ბიბლიოთეკა", "დანიშნულება"]}
                rows={[
                  ["React 18", "UI"],
                  ["TypeScript 5", "ტიპიზ. JS"],
                  ["Vite 5", "Build tool"],
                  ["Tailwind CSS 3", "სტილი"],
                  ["React Router 6", "Routing"],
                  ["IntersectionObserver", "Scroll reveal"],
                ]}
              />
            </div>
          </div>

          <SubTitle>ფაილების სტრუქტურა (მთავარი ფაილები)</SubTitle>
          <Code>{`backend/app/
├── main.py          ← FastAPI app + CORS + routers
├── models.py        ← ORM (ბაზის ცხრილები)
├── schemas.py       ← Pydantic (request/response ტიპები)
├── seed.py          ← demo მონაცემები + CMS keys
├── email_service.py ← SMTP + template render
├── security.py      ← bcrypt + JWT
├── deps.py          ← get_current_admin()
└── routers/         ← auth, courses, professors, students,
                        contact, content, email

frontend/src/
├── App.tsx          ← ყველა Route
├── api.ts           ← ყველა HTTP request (ერთ ფაილში)
├── auth.tsx         ← AuthContext (JWT localStorage)
├── i18n.tsx         ← UI სტრიქონები (ka + en)
├── types.ts         ← TypeScript interfaces
├── pages/           ← LandingPage, CoursesPage, CourseDetail,
│                       Lecturers, Register, admin/*
└── components/      ← Navbar, Footer, Modal, Reveal,
                        CountUp, TypingCode, TechMarquee`}</Code>

          <SubTitle>გაშვება</SubTitle>
          <Code>{`# Backend
cd backend
.venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

# Frontend (სხვა terminal)
cd frontend
npm run dev
# → http://localhost:5173`}</Code>

          <SubTitle>Docker (Production)</SubTitle>
          <Code>{`docker compose up --build
# → http://localhost:8080
# PostgreSQL + FastAPI + nginx (SPA + /api proxy)`}</Code>
        </section>

        {/* ══════════════════════════════════════════════
            10. FAQ
        ══════════════════════════════════════════════ */}
        <section>
          <SectionTitle id="faq">FAQ — ხშირი კითხვები</SectionTitle>
          <div className="card divide-y divide-slate-100 px-5">
            <Accordion question="ახალი ლექტორი დავამატე, საიტზე არ ჩანს?">
              შეამოწმე Admin → ლექტორები — Modal-ში <strong>✅ "საიტზე ჩანს"</strong> checkbox.
              ამოიყვანება მხოლოდ <code>is_active = True</code> ლექტორები.
            </Accordion>
            <Accordion question="CMS-ში ტექსტი შევცვალე მაგრამ ნავიგაციაში ძველი სახელი ჩანს?">
              Navbar ელოდება <code>academy_name</code> გასაღებს (Admin → კონტენტი → "საიტის პარამეტრები").
              ასევე შეამოწმე <code>hero_eyebrow</code>.
            </Accordion>
            <Accordion question={'ემაილი არ მოდის, მაგრამ ფორმა "განაცხადი მიღებულია" ამბობს?'}>
              ნორმალურია — ფორმა ყოველთვის 201-ს იღებს, ემაილი ფონში გაიგზავნება.
              Admin → ელ. ფოსტა → SMTP პარამეტრები → ტესტ ემაილი გაგზავნე და inbox შეამოწმე.
            </Accordion>
            <Accordion question="models.py-ში ველი დავამატე, სერვერი crash-ობს?">
              SQLAlchemy-ის <code>create_all()</code> <strong>ახალ სვეტებს ვერ ამატებს</strong> არსებულ ცხრილებში.
              გადაწყვეტა: <code>rm backend/abuladze.db</code> → backend-ის გადატვირთვა.
            </Accordion>
            <Accordion question="ადმინ login-ი ვერ მუშაობს?">
              FastAPI login endpoint-ი ითხოვს <code>application/x-www-form-urlencoded</code> (არა JSON).
              <code>api.ts</code>-ში login ფუნქცია იყენებს <code>URLSearchParams</code> — ეს სწორია.
              შეამოწმე username/password: default <code>admin / admin123</code>.
            </Accordion>
            <Accordion question="Vite dev server-ი ძველ კოდს გვიბრუნებს?">
              Windows-ზე orphaned node.exe შეიძლება პორტ 5173-ს ჭერდეს.
              PowerShell: <code>Get-CimInstance Win32_Process -Filter "name='node.exe'" | Where-Object {'{'} $_.CommandLine -like '*vite*' {'}'} | ForEach-Object {'{'} Stop-Process -Id $_.ProcessId -Force {'}'}</code>
              შემდეგ ახლიდან <code>npm run dev</code>.
            </Accordion>
            <Accordion question="production-ში /api request-ები 404-ს იძლევა?">
              nginx-ი (<code>frontend/nginx.conf</code>) <code>/api/</code> path-ს <code>http://backend:8000</code>-ზე proxy-ავს.
              Docker-ში ეს ავტომატურია. ლოკალურად Vite-ის <code>vite.config.ts</code> proxy-ს ახდენს.
            </Accordion>
            <Accordion question="Gmail App Password-ი სად ვიპოვო?">
              myaccount.google.com → Security → 2-Step Verification (ჩართვა) → App passwords → AbuladzeAcademy → Generate.
              16-სიმბ. კოდი ერთხელ ჩანს — შეინახე სადმე უსაფრთხოდ.
            </Accordion>
            <Accordion question="ახალი CMS გასაღები როგორ დავამატო?">
              1. <code>seed.py → CONTENT</code>-ში დაამატე key (ka + en). &nbsp;
              2. Frontend-ში <code>c("my_key")</code>-ით გამოიყენე. &nbsp;
              3. <code>ContentAdmin.tsx → GROUPS</code>-ში ჩაამატე ველი. &nbsp;
              4. DB წაშალე და backend გადატვირთე.
            </Accordion>
          </div>
        </section>

        {/* Footer */}
        <div className="rounded-xl bg-slate-100 p-5 text-center text-xs text-slate-400">
          STEM ინგა აბულაძის აკადემია — ტექნიკური დოკუმენტაცია · 2026
        </div>

      </div>
    </div>
  );
}
