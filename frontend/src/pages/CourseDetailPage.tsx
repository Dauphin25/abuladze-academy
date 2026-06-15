import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import Icon from "../components/Icon";
import { useI18n } from "../i18n";
import type { Course } from "../types";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .getCourse(Number(id))
      .then(setCourse)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-400">
        {t("common.loading")}
      </div>
    );
  }

  if (notFound || !course) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-slate-500">კურსი ვერ მოიძებნა.</p>
        <Link to="/courses" className="btn-primary mt-6 inline-block">
          ← კურსებთან დაბრუნება
        </Link>
      </div>
    );
  }

  const ageLabel = course.min_age
    ? course.max_age
      ? `${course.min_age}–${course.max_age} წელი`
      : `${course.min_age}+ წელი`
    : null;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-950 py-14">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-brand-600/25 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-python-blue/20 blur-3xl" />
        </div>
        <div className="container-page">
          <Link
            to="/courses"
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
          >
            ← კურსებთან დაბრუნება
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
            <div className="text-white">
              {/* Level + format badges */}
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-python-yellow">
                  {course.level}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                  {course.format}
                </span>
                {course.certificate && (
                  <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                    სერტიფიკატი
                  </span>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                {course.title}
              </h1>
              <p className="mt-4 text-lg text-slate-300">{course.summary}</p>

              {/* Quick facts */}
              <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { icon: "⏱", label: "ხანგრძლივობა", value: course.duration },
                  { icon: "🌐", label: "ენა", value: course.language },
                  { icon: "👥", label: "მაქს. ჯგუფი", value: course.max_students ? `${course.max_students} კაცი` : null },
                  { icon: "🎂", label: "ასაკი", value: ageLabel },
                ]
                  .filter((f) => f.value)
                  .map((f) => (
                    <div key={f.label} className="rounded-xl bg-white/8 p-3 text-center">
                      <div className="text-xl">{f.icon}</div>
                      <div className="mt-1 text-xs text-slate-400">{f.label}</div>
                      <div className="mt-0.5 text-sm font-semibold text-white">{f.value}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Enroll card */}
            <div className="card overflow-hidden">
              {course.image_url ? (
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center bg-gradient-to-br from-brand-600 to-python-blue text-white">
                  <span className="text-6xl opacity-60">
                    <Icon name={course.icon} />
                  </span>
                </div>
              )}
              <div className="p-6">
                <div className="text-3xl font-extrabold text-slate-900">
                  {course.price != null ? `₾${course.price}` : "უფასო"}
                </div>
                {course.start_date && (
                  <div className="mt-1 text-sm text-slate-500">
                    დაწყება: <span className="font-medium text-slate-700">{course.start_date}</span>
                  </div>
                )}
                {course.schedule && (
                  <div className="mt-1 text-sm text-slate-500">
                    გრაფიკი: <span className="font-medium text-slate-700">{course.schedule}</span>
                  </div>
                )}
                {course.max_students && (
                  <div className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                    ⚠️ ადგილების რაოდენობა შეზღუდულია — {course.max_students} სტუდენტი
                  </div>
                )}
                <Link
                  to={`/register?course=${course.id}`}
                  className="btn-primary mt-5 block w-full py-3 text-center"
                >
                  რეგისტრაცია კურსზე
                </Link>
                <Link
                  to="/register"
                  className="mt-3 block text-center text-sm text-slate-500 hover:text-brand-700"
                >
                  კითხვები? დაგვიკავშირდი
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="container-page py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            {/* Aim */}
            {course.aim && (
              <Section title="კურსის მიზანი">
                <p className="text-slate-700">{course.aim}</p>
              </Section>
            )}

            {/* What you learn */}
            {course.what_you_learn?.length > 0 && (
              <Section title="რას ისწავლი">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {course.what_you_learn.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gradient-to-br from-python-blue to-python-dark text-xs text-python-yellow font-bold">
                        ✓
                      </span>
                      <span className="text-sm text-slate-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Description */}
            {course.description && (
              <Section title="კურსის შესახებ">
                <p className="whitespace-pre-wrap text-slate-700">{course.description}</p>
              </Section>
            )}

            {/* Target audience */}
            {course.target_audience && (
              <Section title="ვისთვის არის განკუთვნილი">
                <p className="text-slate-700">{course.target_audience}</p>
              </Section>
            )}

            {/* Prerequisites */}
            {course.prerequisites && (
              <Section title="საჭირო წინასწარი ცოდნა">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm text-amber-800">{course.prerequisites}</p>
                </div>
              </Section>
            )}
          </div>

          {/* Sidebar — repeat enroll card on desktop without image */}
          <div className="hidden lg:block">
            <div className="sticky top-24 card p-6">
              <h3 className="font-semibold text-slate-900">კურსის დეტალები</h3>
              <dl className="mt-4 space-y-3 text-sm">
                {[
                  ["დონე", course.level],
                  ["ხანგრძლივობა", course.duration],
                  ["ფორმატი", course.format],
                  ["ენა", course.language],
                  ["გრაფიკი", course.schedule],
                  ["დაწყება", course.start_date],
                  ["ასაკი", ageLabel],
                  ["ჯგუფის ზომა", course.max_students ? `${course.max_students} სტუდენტი` : null],
                  ["ფასი", course.price != null ? `₾${course.price}` : "უფასო"],
                  ["სერტიფიკატი", course.certificate ? "კი ✓" : "არა"],
                ]
                  .filter(([, v]) => v)
                  .map(([label, value]) => (
                    <div key={label as string} className="flex justify-between gap-2 border-b border-slate-100 pb-3">
                      <dt className="font-medium text-slate-500">{label}</dt>
                      <dd className="text-right font-semibold text-slate-800">{value}</dd>
                    </div>
                  ))}
              </dl>
              <Link
                to={`/register?course=${course.id}`}
                className="btn-primary mt-6 block w-full py-3 text-center"
              >
                დარეგისტრირდი
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="card p-6">
      <h2 className="mb-4 text-xl font-bold text-slate-900">{title}</h2>
      {children}
    </section>
  );
}
