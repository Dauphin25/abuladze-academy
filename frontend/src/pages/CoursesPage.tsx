import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import Icon from "../components/Icon";
import Reveal from "../components/Reveal";
import { useI18n } from "../i18n";
import type { Course } from "../types";

export default function CoursesPage() {
  const { t } = useI18n();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("ყველა");

  useEffect(() => {
    api.getCourses().then((c) => {
      setCourses(c);
      setLoading(false);
    });
  }, []);

  const levels = ["ყველა", ...Array.from(new Set(courses.map((c) => c.level)))];
  const visible = filter === "ყველა" ? courses : courses.filter((c) => c.level === filter);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-slate-950 py-16">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-brand-600/25 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-python-blue/25 blur-3xl" />
        </div>
        <div className="container-page text-center text-white">
          <span className="pill-python bg-white/10 text-python-yellow ring-python-yellow/30">
            <span className="h-1.5 w-1.5 rounded-full bg-python-yellow" />
            {t("nav.courses")}
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">
            ჩვენი პროგრამები
          </h1>
          <p className="mt-4 text-lg text-slate-300">
            აირჩიე მიმართულება — ყველა კურსი ქართულ ენაზე, პრაქტიკული პედაგოგებისგან.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-slate-200 bg-white">
        <div className="container-page flex flex-wrap items-center gap-2 py-4">
          <span className="text-sm font-medium text-slate-500">დონე:</span>
          {levels.map((l) => (
            <button
              key={l}
              onClick={() => setFilter(l)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filter === l
                  ? "bg-brand-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="container-page py-12">
        {loading ? (
          <p className="text-center text-slate-400">{t("common.loading")}</p>
        ) : visible.length === 0 ? (
          <p className="text-center text-slate-400">{t("courses.empty")}</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {visible.map((course, i) => (
              <Reveal as="article" key={course.id} delay={(i % 3) * 80}>
                <Link
                  to={`/courses/${course.id}`}
                  className="card card-hover group flex h-full flex-col p-6"
                >
                  {course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.title}
                      className="mb-4 h-40 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-python-blue text-white transition-transform group-hover:scale-110">
                      <Icon name={course.icon} />
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-python-blue/10 px-2.5 py-0.5 text-xs font-semibold text-python-dark">
                      {course.level}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                      {course.format}
                    </span>
                    {course.certificate && (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        სერტიფიკატი
                      </span>
                    )}
                  </div>

                  <h2 className="mt-3 text-lg font-bold text-slate-900">{course.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-slate-600">{course.summary}</p>

                  {/* Meta row */}
                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
                    {course.duration && (
                      <span>⏱ {course.duration}</span>
                    )}
                    {course.schedule && (
                      <span>📅 {course.schedule}</span>
                    )}
                    {course.max_students && (
                      <span>👥 მაქს. {course.max_students} სტ.</span>
                    )}
                    {course.language && (
                      <span>🌐 {course.language}</span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      {course.price != null ? `₾${course.price}` : t("courses.free")}
                    </span>
                    <span className="text-sm font-semibold text-brand-700 transition group-hover:translate-x-0.5">
                      დეტალები →
                    </span>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
