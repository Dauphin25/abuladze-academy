import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth";

export default function AdminLogin() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate("/admin", { replace: true });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(username, password);
      navigate("/admin", { replace: true });
    } catch {
      setError("მომხმარებლის სახელი ან პაროლი არასწორია");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex items-center justify-center gap-2 text-xl font-extrabold text-slate-900">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-600 to-python-blue font-mono text-sm text-python-yellow">
            Py
          </span>
          STEM ინგა აბულაძის აკადემია
        </div>
        <form onSubmit={submit} className="card space-y-4 p-7">
          <h1 className="text-lg font-bold text-slate-900">ადმინ პანელში შესვლა</h1>
          <div>
            <label className="label">მომხმარებლის სახელი</label>
            <input
              className="input"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="label">პაროლი</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? "შესვლა…" : "შესვლა"}
          </button>
          <a href="/" className="block text-center text-sm text-slate-400 hover:text-brand-700">
            ← საიტზე დაბრუნება
          </a>
        </form>
      </div>
    </div>
  );
}
