import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";

const nav = [
  ["", "მთავარი პანელი", "home"],
  ["courses", "კურსები", "book"],
  ["professors", "ლექტორები", "users"],
  ["students", "განაცხადები", "inbox"],
  ["messages", "შეტყობინებები", "mail"],
  ["content", "საიტის კონტენტი", "edit"],
  ["email", "ელ. ფოსტა", "send"],
];

export default function AdminLayout() {
  const { username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white md:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-python-blue font-mono text-sm font-extrabold text-python-yellow">
            Py
          </span>
          <span className="font-extrabold text-slate-900 text-sm leading-tight">ადმინ პანელი</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map(([path, label]) => (
            <NavLink
              key={path}
              to={`/admin/${path}`}
              end={path === ""}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm font-medium ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <a href="/" className="block rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100">
            ← საიტის ნახვა
          </a>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div className="md:hidden font-bold text-slate-900">ადმინი</div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-slate-500">
              შესული: <span className="font-semibold text-slate-700">{username}</span>
            </span>
            <button onClick={handleLogout} className="btn-outline px-4 py-2 text-sm">
              გასვლა
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
