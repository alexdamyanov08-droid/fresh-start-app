import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset password — Merchango" },
      { name: "description", content: "Set a new password for your Merchango account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { t } = useI18n();
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) { toast.error(t("reset_mismatch")); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(t("reset_success"));
    nav({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-10 sm:px-6">
      <div className="w-full rounded-2xl border border-border bg-card p-6 sm:p-8">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Merchango</p>
        <h1 className="mt-1 font-display text-3xl uppercase leading-none tracking-tight sm:text-4xl">
          {t("reset_title")}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("reset_sub")}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest">{t("new_password")}</label>
            <input type="password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition focus:border-foreground" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs uppercase tracking-widest">{t("confirm_password")}</label>
            <input type="password" required minLength={6} value={pw2} onChange={(e) => setPw2(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 outline-none transition focus:border-foreground" />
          </div>
          <button type="submit" disabled={busy}
            className="holo-gradient w-full rounded-full py-3 font-display text-sm uppercase tracking-widest text-white shadow-lg transition active:scale-95 disabled:opacity-60">
            {busy ? "..." : t("reset_submit")}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline underline-offset-4">← {t("back_to_shop")}</Link>
        </p>
      </div>
    </div>
  );
}
