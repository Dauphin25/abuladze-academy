import { useEffect, useState } from "react";
import { api } from "../api";
import { EnrollForm } from "./LandingPage";
import { useI18n } from "../i18n";
import type { Course } from "../types";

export default function RegisterPage() {
  const { t } = useI18n();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    api.getCourses().then(setCourses).catch(() => setCourses([]));
  }, []);

  return (
    <section className="bg-slate-50 py-16">
      <div className="container-page max-w-2xl">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-slate-900">{t("register.title")}</h1>
          <p className="mt-3 text-lg text-slate-600">{t("register.subtitle")}</p>
        </div>
        <div className="mt-8">
          <EnrollForm courses={courses} t={t} />
        </div>
      </div>
    </section>
  );
}
