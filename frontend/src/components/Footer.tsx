import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useI18n } from "../i18n";

export default function Footer() {
  const { t, lang } = useI18n();
  const [brand, setBrand] = useState("აბულაძის აკადემია");

  useEffect(() => {
    api.getContent(lang).then((c) => c.hero_eyebrow && setBrand(c.hero_eyebrow));
  }, [lang]);

  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="container-page flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-600 text-sm text-white">
            A
          </span>
          {brand}
        </div>
        <p className="text-sm text-slate-500">
          © {new Date().getFullYear()} {brand}. {t("footer.rights")}
        </p>
        <Link to="/admin" className="text-sm text-slate-400 hover:text-brand-700">
          {t("nav.admin")}
        </Link>
      </div>
    </footer>
  );
}
