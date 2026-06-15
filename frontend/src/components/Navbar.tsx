import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useI18n, type Lang } from "../i18n";
import { api } from "../api";

export default function Navbar() {
  const { t, lang, setLang } = useI18n();
  const { pathname } = useLocation();
  const onHome = pathname === "/";
  const [brand, setBrand] = useState("STEM ინგა აბულაძის აკადემია");
  const [logoUrl, setLogoUrl] = useState("");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    api.getContent(lang).then((c) => {
      if (c.academy_name) setBrand(c.academy_name);
      if (c.academy_logo_url) setLogoUrl(c.academy_logo_url);
    });
  }, [lang]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // On the home page anchors scroll to sections; elsewhere they link home first.
  const link = (hash: string) => (onHome ? hash : `/${hash}`);

  const links = [
    [t("nav.about"), link("#about")],
    [t("nav.courses"), "/courses"],
    [t("nav.lecturers"), "/lecturers"],
    [t("nav.contact"), link("#contact")],
  ];

  return (
    <header
      className={`sticky top-0 z-40 border-b backdrop-blur transition-all ${
        scrolled
          ? "border-slate-200/70 bg-white/85 shadow-sm"
          : "border-transparent bg-white/60"
      }`}
    >
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 font-extrabold text-slate-900">
          {logoUrl ? (
            <img src={logoUrl} alt={brand} className="h-8 w-auto object-contain" />
          ) : (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-python-blue font-mono text-sm text-python-yellow">
              Py
            </span>
          )}
          <span className="hidden sm:inline leading-tight">{brand}</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map(([label, href]) => (
            <NavItem key={href} label={label} href={href} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LangSwitcher lang={lang} setLang={setLang} />
          <Link to="/register" className="btn-primary">
            {t("nav.register")}
          </Link>
        </div>
      </div>
    </header>
  );
}

function NavItem({ label, href }: { label: string; href: string }) {
  const cls = "text-sm font-medium text-slate-600 hover:text-brand-700";
  return href.startsWith("#") || href.includes("#") ? (
    <a href={href} className={cls}>
      {label}
    </a>
  ) : (
    <Link to={href} className={cls}>
      {label}
    </Link>
  );
}

function LangSwitcher({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex items-center rounded-lg border border-slate-200 p-0.5 text-xs font-semibold">
      {(["ka", "en"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`rounded-md px-2.5 py-1 transition ${
            lang === l ? "bg-brand-600 text-white" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          {l === "ka" ? "ქარ" : "ENG"}
        </button>
      ))}
    </div>
  );
}
