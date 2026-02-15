import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ROUTES } from "../lib/constants";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(username, password);

    if (result.success) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 bg-surface rounded-3xl backdrop-blur-md shadow-2xl border border-border animate-[fadeIn_0.4s_ease-out]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white m-0">CineVerse Admin</h1>
          <p className="text-text-muted text-sm mt-2">
            Inicia sesión para gestionar el cine
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="flex items-center gap-2 bg-danger/15 text-red-300 p-3 rounded-lg mb-6 text-sm border border-danger/30">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="mb-4">
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-primary mb-1.5"
            >
              Usuario
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3.5 border-none rounded-xl bg-white/10 text-white placeholder-text-muted text-sm
                focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Introduce tu usuario"
              required
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-primary mb-1.5"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 border-none rounded-xl bg-white/10 text-white placeholder-text-muted text-sm
                focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="Introduce tu contraseña"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-linear-to-r from-primary to-sky rounded-xl font-bold text-gray-900 text-base
              shadow-lg transition-all duration-200 hover:shadow-primary/30 hover:scale-[1.02]
              focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
              border-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? "Entrando..." : "Entrar al Sistema"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-text-muted space-y-1">
          <p className="m-0 font-medium mb-2">Credenciales de prueba</p>
          <p className="m-0">Admin: admin / password</p>
          <p className="m-0">Empleado: empleado1 / password</p>
          <p className="m-0">Cliente: cliente1 / password</p>
        </div>
      </div>
    </div>
  );
}
