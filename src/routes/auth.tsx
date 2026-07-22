import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Merchango" },
      { name: "description", content: "Sign in or create a Merchango account to save your custom designs." },
      { property: "og:title", content: "Sign in — Merchango" },
      { property: "og:description", content: "Sign in or create your Merchango account." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { user, signIn, signUp, resetPassword } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) nav({ to: "/" });
  }, [user, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const fn = mode === "signin" ? signIn : signUp;
    const { error } = await fn(email, password);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success(mode === "signin" ? t("auth_success_signin") : t("auth_success_signup"));
    nav({ to: "/" });
  };

  const isSignup = mode === "signup";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-10 sm:px-6">
      <div className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Merchango</p>
        <h1 className="mt-1 font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl">
          {isSignup ? t("auth_signup_title") : t("auth_signin_title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {isSignup ? t("auth_signup_sub") : t("auth_signin_sub")}
        </p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-widest">{t("email")}</label>
            <input
              id="email" type="email" required autoComplete="email"
              value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition focus:border-foreground"
            />
          </div>
          <div>
            <label htmlFor="pw" className="mb-1.5 block text-xs uppercase tracking-widest">{t("password")}</label>
            <input
              id="pw" type="password" required minLength={6}
              autoComplete={isSignup ? "new-password" : "current-password"}
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition focus:border-foreground"
            />
          </div>
          {!isSignup && (
            <div className="text-right">
              <button
                type="button"
                onClick={async () => {
                  if (!email) { toast.error(t("forgot_need_email")); return; }
                  const { error } = await resetPassword(email);
                  if (error) toast.error(error);
                  else toast.success(t("forgot_sent"));
                }}
                className="text-xs uppercase tracking-widest text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                {t("forgot_password")}
              </button>
            </div>
          )}
          <button
            type="submit" disabled={busy}
            className="holo-gradient w-full rounded-full py-3 font-display text-sm uppercase tracking-widest text-white shadow-lg transition active:scale-95 disabled:opacity-60"
          >
            {busy ? "..." : isSignup ? t("auth_submit_signup") : t("auth_submit_signin")}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? t("have_account") : t("no_account")}{" "}
          <button
            onClick={() => setMode(isSignup ? "signin" : "signup")}
            className="font-semibold text-foreground underline underline-offset-4"
          >
            {isSignup ? t("sign_in") : t("sign_up")}
          </button>
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline underline-offset-4">← {t("back_to_shop")}</Link>
        </p>
      </div>
    </div>
  );
}
