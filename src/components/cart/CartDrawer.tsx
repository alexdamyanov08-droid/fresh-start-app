import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-store";
import { useI18n } from "@/lib/i18n";
import { Pencil, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";


export function CartDrawer() {
  const { items, remove, total, open, setOpen, count, unitPrice } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="font-display text-2xl uppercase tracking-tight">
            {t("cart_title")} <span className="text-muted-foreground">({count})</span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <p className="mt-16 text-center text-sm text-muted-foreground">{t("cart_empty")}</p>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={i.id} className="flex gap-3 rounded-lg border border-border bg-card p-3">
                  <div
                    className="h-20 w-20 shrink-0 rounded-md border border-border"
                    style={{ backgroundColor: i.colorHex }}
                  >
                    {i.image && (
                      <img src={i.image} alt={i.name} className="h-full w-full object-contain mix-blend-multiply" />
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate font-display text-sm uppercase">{i.name}</p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setOpen(false);
                            navigate({ to: "/product/$code", params: { code: i.code }, search: { edit: i.id } });
                          }}
                          aria-label="Edit"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => remove(i.id)}
                          aria-label={t("cart_remove")}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("summary_size")} {i.size} · {i.colorName} · {t("summary_qty")} {i.qty}
                    </p>
                    {i.elements.filter((el) => el.kind === "text" && el.text).map((el) => (
                      <p key={el.id} className="text-xs text-muted-foreground">
                        {t("summary_text")}: "{el.text}"
                      </p>
                    ))}
                    {i.elements.some((el) => el.kind === "image") && (
                      <p className="text-xs text-muted-foreground">{t("logo_label")}</p>
                    )}
                    <p className="mt-auto text-sm font-semibold">
                      €{(unitPrice(i) * i.qty).toFixed(2)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-border p-4">
            <div className="mb-3 flex items-center justify-between font-display text-lg uppercase">
              <span>{t("cart_total")}</span>
              <span>€{total.toFixed(2)}</span>
            </div>
            <button
              onClick={() => { setOpen(false); navigate({ to: "/checkout" }); }}
              className="holo-gradient w-full rounded-full py-3 font-display text-sm uppercase tracking-wider text-white shadow-lg transition active:scale-95"
            >
              {t("cart_checkout")}
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
