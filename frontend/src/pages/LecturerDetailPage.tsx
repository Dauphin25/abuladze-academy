import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../api";
import { useI18n } from "../i18n";
import type { Professor } from "../types";

export default function LecturerDetailPage() {
  const { t } = useI18n();
  const { id } = useParams<{ id: string }>();
  const [lecturer, setLecturer] = useState<Professor | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api
      .getProfessor(Number(id))
      .then(setLecturer)
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <p className="container-page py-20 text-center text-slate-400">{t("common.loading")}</p>;
  }

  if (notFound || !lecturer) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-slate-500">{t("lecturers.notFound")}</p>
        <Link to="/lecturers" className="mt-4 inline-block font-semibold text-brand-700 hover:underline">
          {t("lecturers.back")}
        </Link>
      </div>
    );
  }

  const p = lecturer;
  const specialties = p.specialties
    ? p.specialties.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <article className="py-12">
      <div className="container-page">
        <Link to="/lecturers" className="text-sm font-semibold text-brand-700 hover:underline">
          {t("lecturers.back")}
        </Link>

        <div className="mt-6 grid gap-10 md:grid-cols-3">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="card p-6 text-center">
              <div className="mx-auto h-36 w-36 overflow-hidden rounded-full bg-brand-100">
                {p.photo_url ? (
                  <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-4xl font-bold text-brand-700">
                    {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                )}
              </div>
              <h1 className="mt-5 text-2xl font-extrabold text-slate-900">{p.name}</h1>
              <p className="mt-1 font-medium text-brand-700">{p.title}</p>
              {p.email && (
                <a
                  href={`mailto:${p.email}`}
                  className="mt-3 inline-block break-all text-sm text-slate-500 hover:text-brand-700"
                >
                  {p.email}
                </a>
              )}

              {specialties.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-5 text-left">
                  <h2 className="text-sm font-semibold text-slate-400">{t("lecturers.specialties")}</h2>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {specialties.map((s) => (
                      <span
                        key={s}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {p.links.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-5 text-left">
                  <h2 className="text-sm font-semibold text-slate-400">{t("lecturers.links")}</h2>
                  <ul className="mt-2 space-y-1.5">
                    {p.links.map((l, i) => (
                      <li key={i}>
                        <a
                          href={l.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-brand-700 hover:underline"
                        >
                          {l.label} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <div className="md:col-span-2">
            <section>
              <h2 className="text-2xl font-bold text-slate-900">{t("lecturers.biography")}</h2>
              <div className="mt-4 space-y-4 text-slate-600">
                {(p.biography || p.bio)
                  .split("\n")
                  .filter(Boolean)
                  .map((para, i) => (
                    <p key={i} className="leading-relaxed">
                      {para}
                    </p>
                  ))}
              </div>
            </section>

            {p.books.length > 0 && (
              <section className="mt-10">
                <h2 className="text-2xl font-bold text-slate-900">{t("lecturers.books")}</h2>
                <ul className="mt-4 space-y-2">
                  {p.books.map((book, i) => (
                    <li key={i} className="flex items-start gap-3 card p-4">
                      <span className="mt-0.5 text-brand-600">📘</span>
                      <span className="text-slate-700">{book}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-10">
              <Link to="/register" className="btn-primary px-7 py-3 text-base">
                {t("nav.register")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
