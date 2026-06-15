import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Icon from "../components/Icon";
import Reveal from "../components/Reveal";
import CountUp from "../components/CountUp";
import TypingCode from "../components/TypingCode";
import TechMarquee from "../components/TechMarquee";
import PyBadge from "../components/PyBadge";
import { useI18n } from "../i18n";
import type { Course, Professor, SiteContent } from "../types";

export default function LandingPage() {
  const { t, lang } = useI18n();
  const [content, setContent] = useState<SiteContent>({});
  const [courses, setCourses] = useState<Course[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getContent(lang), api.getCourses(), api.getProfessors()])
      .then(([c, co, pr]) => {
        setContent(c);
        setCourses(co);
        setProfessors(pr);
      })
      .catch((e) => console.error("Failed to load site data", e))
      .finally(() => setLoading(false));
  }, [lang]);

  const c = (key: string, fallback = "") => content[key] ?? fallback;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        {t("common.loading")}
      </div>
    );
  }

  return (
    <>
      <Hero c={c} t={t} />
      <TechMarquee value={c("tech_marquee")} />
      <Stats c={c} t={t} />
      <About c={c} t={t} />
      <Courses courses={courses} c={c} t={t} />
      <Professors professors={professors} c={c} t={t} />
      <Enroll courses={courses} t={t} />
      <Contact c={c} t={t} />
    </>
  );
}

type C = (key: string, fallback?: string) => string;
type T = (key: string) => string;

/* -------------------------------- Hero -------------------------------- */
function Hero({ c, t }: { c: C; t: T }) {
  return (
    <section id="top" className="relative overflow-hidden bg-slate-950">
      {/* gradient mesh background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute right-0 top-20 h-80 w-80 rounded-full bg-python-blue/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-python-yellow/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
      </div>

      <div className="container-page grid gap-12 py-20 md:grid-cols-2 md:items-center md:py-28">
        <div className="text-white">
          <span className="pill-python bg-white/10 text-python-yellow ring-python-yellow/30">
            <span className="h-1.5 w-1.5 rounded-full bg-python-yellow" />
            🐍 {c("hero_eyebrow", "აბულაძის აკადემია")}
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
            {c("hero_title")}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-300">{c("hero_subtitle")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/register" className="btn-primary px-7 py-3 text-base">
              {c("hero_cta", t("nav.apply"))}
            </Link>
            <a
              href="#courses"
              className="btn px-7 py-3 text-base border border-white/25 text-white hover:bg-white/10"
            >
              {t("hero.explore")}
            </a>
          </div>
          <div className="mt-8 flex items-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <span className="text-python-yellow">✓</span> {c("hero_badge_1", t("about.point1"))}
            </span>
            <span className="hidden items-center gap-2 sm:flex">
              <span className="text-python-yellow">✓</span> {c("hero_badge_2", t("about.point3"))}
            </span>
          </div>
        </div>

        <div className="relative">
          {/* floating accents */}
          <PyBadge className="absolute -left-5 -top-5 z-10 h-16 w-16 animate-float text-xl" />
          <div className="absolute -bottom-4 -right-3 z-10 animate-float rounded-xl bg-python-yellow px-3 py-1.5 font-mono text-xs font-bold text-slate-900 shadow-lg [animation-delay:1.2s]">
            pip install future
          </div>
          <div className="absolute inset-0 -z-0 animate-spin-slow rounded-[2rem] border border-dashed border-white/10" />
          <TypingCode />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- Stats ------------------------------- */
function Stats({ c, t }: { c: C; t: T }) {
  const stats = [
    [c("stat_students", "1200+"), t("stats.students")],
    [c("stat_courses", "12"), t("stats.courses")],
    [c("stat_rate", "92%"), t("stats.rate")],
  ];
  return (
    <section className="bg-white">
      <div className="container-page grid grid-cols-1 gap-8 py-14 sm:grid-cols-3">
        {stats.map(([value, label], i) => (
          <Reveal key={label} delay={i * 120} className="text-center">
            <div className="text-5xl font-extrabold text-gradient">
              <CountUp value={value} />
            </div>
            <div className="mt-2 text-sm font-medium text-slate-500">{label}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* -------------------------------- About ------------------------------- */
function About({ c, t }: { c: C; t: T }) {
  const points = [t("about.point1"), t("about.point2"), t("about.point3"), t("about.point4")];
  return (
    <section id="about" className="py-20">
      <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
        <Reveal>
          <span className="pill-python">{"</>"} {t("nav.about")}</span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{c("about_title")}</h2>
          <p className="mt-4 text-lg text-slate-600">{c("about_text")}</p>
        </Reveal>
        <ul className="grid gap-3">
          {points.map((p, i) => (
            <Reveal as="li" key={p} delay={i * 100}>
              <div className="flex items-start gap-3 card card-hover p-4">
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-python-blue to-python-dark text-sm text-python-yellow">
                  ✓
                </span>
                <span className="text-slate-700">{p}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------- Courses ------------------------------ */
function Courses({ courses, c, t }: { courses: Course[]; c: C; t: T }) {
  return (
    <section id="courses" className="relative overflow-hidden bg-slate-50 py-20">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="pill-python">{t("nav.courses")}</span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{c("courses_title")}</h2>
          <p className="mt-3 text-lg text-slate-600">{c("courses_subtitle")}</p>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <Reveal as="article" key={course.id} delay={(i % 3) * 120}>
              <div className="card card-hover group flex h-full flex-col p-6">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-python-blue text-white transition-transform group-hover:scale-110">
                  <Icon name={course.icon} />
                </span>
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-full bg-python-blue/10 px-2.5 py-0.5 text-xs font-semibold text-python-dark">
                    {course.level}
                  </span>
                  {course.duration && (
                    <span className="text-xs text-slate-400">{course.duration}</span>
                  )}
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{course.title}</h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">{course.summary}</p>
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="font-bold text-slate-900">
                    {course.price != null ? `₾${course.price}` : t("courses.free")}
                  </span>
                  <Link
                    to={`/courses/${course.id}`}
                    className="text-sm font-semibold text-brand-700 transition group-hover:translate-x-0.5"
                  >
                    {t("courses.enroll")}
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
          {courses.length === 0 && (
            <p className="col-span-full text-center text-slate-400">{t("courses.empty")}</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- Professors ----------------------------- */
function Professors({ professors, c, t }: { professors: Professor[]; c: C; t: T }) {
  return (
    <section id="instructors" className="py-20">
      <div className="container-page">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="pill-python">{t("nav.lecturers")}</span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">
            {c("professors_title")}
          </h2>
          <p className="mt-3 text-lg text-slate-600">{c("professors_subtitle")}</p>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {professors.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 120}>
              <Link to={`/lecturers/${p.id}`} className="card card-hover block p-6 text-center">
                <div className="mx-auto h-24 w-24 overflow-hidden rounded-full bg-gradient-to-br from-python-blue/15 to-python-yellow/15 ring-4 ring-white">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-2xl font-bold text-python-dark">
                      {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                  )}
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{p.name}</h3>
                <p className="text-sm font-medium text-python-blue">{p.title}</p>
                <p className="mt-3 line-clamp-3 text-sm text-slate-600">{p.bio}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-brand-700">
                  {t("lecturers.viewProfile")}
                </span>
              </Link>
            </Reveal>
          ))}
          {professors.length === 0 && (
            <p className="col-span-full text-center text-slate-400">{t("lecturers.empty")}</p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------- Enroll ------------------------------- */
function Enroll({ courses, t }: { courses: Course[]; t: T }) {
  return (
    <section id="enroll" className="relative overflow-hidden bg-slate-950 py-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-python-blue/30 blur-3xl" />
      </div>
      <div className="container-page grid gap-10 md:grid-cols-2 md:items-center">
        <Reveal className="text-white">
          <h2 className="text-3xl font-bold sm:text-4xl">{t("enroll.title")}</h2>
          <p className="mt-4 text-lg text-slate-300">{t("enroll.subtitle")}</p>
          <Link
            to="/register"
            className="mt-6 inline-block rounded-lg bg-python-yellow px-7 py-3 text-base font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-python-amber"
          >
            {t("enroll.submit")}
          </Link>
        </Reveal>
        <Reveal delay={120}>
          <EnrollForm courses={courses} t={t} />
        </Reveal>
      </div>
    </section>
  );
}

export function EnrollForm({ courses, t }: { courses: Course[]; t: T }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    course_id: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await api.createStudent({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        message: form.message,
        course_id: form.course_id ? Number(form.course_id) : null,
      });
      setStatus("done");
      setForm({ full_name: "", email: "", phone: "", course_id: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : t("form.error"));
    }
  }

  if (status === "done") {
    return (
      <div className="card p-7">
        <div className="py-10 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-2xl text-green-600">
            ✓
          </div>
          <h3 className="mt-4 text-xl font-bold text-slate-900">{t("enroll.successTitle")}</h3>
          <p className="mt-2 text-slate-600">{t("enroll.successText")}</p>
          <button className="btn-outline mt-6" onClick={() => setStatus("idle")}>
            {t("enroll.another")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card grid gap-4 p-7">
      <div>
        <label className="label">{t("enroll.fullName")} *</label>
        <input
          required
          className="input"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">{t("enroll.email")} *</label>
          <input
            required
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="label">{t("enroll.phone")}</label>
          <input
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </div>
      <div>
        <label className="label">{t("enroll.interestedIn")}</label>
        <select
          className="input"
          value={form.course_id}
          onChange={(e) => setForm({ ...form, course_id: e.target.value })}
        >
          <option value="">{t("enroll.notSure")}</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">{t("enroll.message")}</label>
        <textarea
          rows={3}
          className="input"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
        />
      </div>
      {status === "error" && <p className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary py-3" disabled={status === "sending"}>
        {status === "sending" ? t("enroll.sending") : t("enroll.submit")}
      </button>
    </form>
  );
}

/* ------------------------------- Contact ------------------------------ */
function Contact({ c, t }: { c: C; t: T }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    try {
      await api.createContact(form);
      setStatus("done");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : t("form.error"));
    }
  }

  return (
    <section id="contact" className="py-20">
      <div className="container-page grid gap-10 md:grid-cols-2">
        <Reveal>
          <span className="pill-python">{t("nav.contact")}</span>
          <h2 className="mt-4 text-3xl font-bold text-slate-900 sm:text-4xl">{c("contact_title")}</h2>
          <p className="mt-4 text-lg text-slate-600">{t("contact.subtitle")}</p>
          <dl className="mt-8 space-y-4 text-slate-700">
            <div>
              <dt className="text-sm font-semibold text-slate-400">{t("contact.labelEmail")}</dt>
              <dd>{c("contact_email")}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-400">{t("contact.labelPhone")}</dt>
              <dd>{c("contact_phone")}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-slate-400">{t("contact.labelAddress")}</dt>
              <dd>{c("contact_address")}</dd>
            </div>
          </dl>
        </Reveal>
        <Reveal delay={120} className="card p-7">
          {status === "done" ? (
            <div className="py-10 text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-green-100 text-2xl text-green-600">
                ✓
              </div>
              <h3 className="mt-4 text-xl font-bold text-slate-900">{t("contact.successTitle")}</h3>
              <p className="mt-2 text-slate-600">{t("contact.successText")}</p>
              <button className="btn-outline mt-6" onClick={() => setStatus("idle")}>
                {t("enroll.another")}
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">{t("contact.name")} *</label>
                  <input
                    required
                    className="input"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">{t("contact.labelEmail")} *</label>
                  <input
                    required
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="label">{t("contact.subject")}</label>
                <input
                  className="input"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="label">{t("contact.message")} *</label>
                <textarea
                  required
                  rows={4}
                  className="input"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              {status === "error" && <p className="text-sm text-red-600">{error}</p>}
              <button className="btn-primary py-3" disabled={status === "sending"}>
                {status === "sending" ? t("enroll.sending") : t("contact.submit")}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
