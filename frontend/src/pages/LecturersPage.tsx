import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useI18n } from "../i18n";
import type { Professor } from "../types";

export default function LecturersPage() {
  const { t } = useI18n();
  const [lecturers, setLecturers] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getProfessors()
      .then(setLecturers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-16">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">{t("lecturers.title")}</h1>
          <p className="mt-3 text-lg text-slate-600">{t("lecturers.subtitle")}</p>
        </div>

        {loading ? (
          <p className="mt-12 text-center text-slate-400">{t("common.loading")}</p>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {lecturers.map((p) => (
              <Link
                key={p.id}
                to={`/lecturers/${p.id}`}
                className="card flex flex-col p-6 text-center transition hover:shadow-md"
              >
                <div className="mx-auto h-28 w-28 overflow-hidden rounded-full bg-brand-100">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-3xl font-bold text-brand-700">
                      {p.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                  )}
                </div>
                <h2 className="mt-4 text-lg font-bold text-slate-900">{p.name}</h2>
                <p className="text-sm font-medium text-brand-700">{p.title}</p>
                <p className="mt-3 flex-1 line-clamp-3 text-sm text-slate-600">{p.bio}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-brand-700">
                  {t("lecturers.viewProfile")}
                </span>
              </Link>
            ))}
            {lecturers.length === 0 && (
              <p className="col-span-full text-center text-slate-400">{t("lecturers.empty")}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
