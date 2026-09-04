import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../state/AppContext";
import type { Role } from "../lib/types";
import { Button, Field, Icon, Input, Logo, Segmented } from "../components/ui";

export default function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { login, register, demoLogin } = useApp();
  const navigate = useNavigate();
  const isLogin = mode === "login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [role, setRole] = useState<Role>("developer");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const err = isLogin ? login(email, pw) : register(name, email, pw, role);
    if (err) {
      setError(err);
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-4xl overflow-hidden card rounded-2xl! lg:grid-cols-[0.9fr_1.1fr]">
        {/* brand panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/[0.07] bg-ink-900 p-9 lg:flex">
          <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(80% 60% at 20% 0%, rgba(99,102,241,0.18), transparent 65%)" }} />
          <Logo onClick={() => navigate("/")} />
          <div className="relative">
            <p className="mono-tag text-indigo-400">// the forge awaits</p>
            <h2 className="mt-3 font-display text-[1.7rem] font-bold leading-snug text-white">
              Five minutes of describing.
              <br />
              A full roadmap forever.
            </h2>
            <div className="mt-8 space-y-4">
              {[
                ["hammer", "6 phases, ~40 tasks, milestones & risks"],
                ["layers", "Progress tracking that rolls up automatically"],
                ["file", "Professional PDF report in one click"],
              ].map(([icon, text]) => (
                <div key={text} className="flex items-center gap-3 text-sm text-slate-300">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-400/25 bg-indigo-500/10 text-indigo-300">
                    <Icon name={icon as never} size={15} />
                  </span>
                  {text}
                </div>
              ))}
            </div>
          </div>
          <p className="relative font-mono text-[11px] text-slate-600">local-first demo — your data never leaves this browser</p>
        </div>

        {/* form panel */}
        <div className="p-7 sm:p-10">
          <div className="mb-7 lg:hidden">
            <Logo onClick={() => navigate("/")} />
          </div>
          <p className="mono-tag text-indigo-400">{isLogin ? "// welcome back" : "// create your account"}</p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white">{isLogin ? "Log in to DevForge" : "Start forging"}</h1>
          <p className="mt-1.5 text-sm text-slate-400">
            {isLogin ? "Your projects and roadmaps are right where you left them." : "Free while in beta. No card, no spam."}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {!isLogin && (
              <Field label="Full name">
                <div className="relative">
                  <Icon name="user" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input className="pl-9!" placeholder="Ada Lovelace" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </Field>
            )}
            <Field label="Email">
              <div className="relative">
                <Icon name="mail" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input className="pl-9!" type="email" placeholder="you@studio.dev" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </Field>
            <Field label="Password" hint={isLogin ? undefined : "At least 6 characters"}>
              <div className="relative">
                <Icon name="lock" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <Input className="pl-9!" type="password" placeholder="••••••••" value={pw} onChange={(e) => setPw(e.target.value)} />
              </div>
            </Field>
            {!isLogin && (
              <Field label="I am a…">
                <Segmented
                  options={[
                    { value: "developer", label: "Developer" },
                    { value: "manager", label: "Manager" },
                    { value: "freelancer", label: "Freelancer" },
                  ]}
                  value={role}
                  onChange={setRole}
                />
              </Field>
            )}

            {error && (
              <p className="anim-fade-up flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3.5 py-2.5 text-[13px] font-medium text-rose-300">
                <Icon name="alert" size={15} className="mt-0.5" /> {error}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" icon={isLogin ? "arrow-right" : "spark"}>
              {isLogin ? "Log in" : "Create account"}
            </Button>
          </form>

          {isLogin && (
            <button
              onClick={() => {
                demoLogin();
                navigate("/dashboard");
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-indigo-400/40 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition-all hover:border-indigo-300/70 hover:bg-indigo-500/10"
            >
              <Icon name="eye" size={15} /> Explore the demo workspace instead
            </button>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            {isLogin ? "New to DevForge?" : "Already have an account?"}{" "}
            <Link to={isLogin ? "/register" : "/login"} className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300">
              {isLogin ? "Create an account" : "Log in"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
