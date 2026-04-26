import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { addPassForOffer, activatePass, generatePassNumber } from "@/lib/wallet-pass";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Step = "preview" | "adding" | "added" | "faceid" | "tapping" | "done";

interface AddToAppleWalletProps {
  offer: {
    id: string;
    headline: string;
    discount_pct: number;
    expires_at: string;
    merchant?: { name: string; neighborhood?: string | null; cuisine?: string | null } | null;
  };
}

export function AddToAppleWalletButton({ offer }: AddToAppleWalletProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("preview");
  const [passNumber, setPassNumber] = useState(generatePassNumber());

  async function start() {
    setStep("preview");
    setPassNumber(generatePassNumber());
    setOpen(true);
  }

  async function add() {
    setStep("adding");
    try {
      const pass = await addPassForOffer(offer.id);
      if (pass?.pass_number) setPassNumber(pass.pass_number);
      setTimeout(() => setStep("added"), 700);
    } catch (e) {
      toast.error("Could not add to Wallet. Please try again.");
      setOpen(false);
    }
  }

  async function tapToPay() {
    setStep("faceid");
    setTimeout(() => setStep("tapping"), 1100);
    setTimeout(async () => {
      await activatePass(offer.id);
      setStep("done");
    }, 2400);
  }

  return (
    <>
      <button
        type="button"
        onClick={start}
        className="inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full bg-ink text-cream font-medium text-sm hover:bg-ink-2 transition-colors"
      >
        <i className="ph-fill ph-apple-logo text-lg" />
        Add to Apple Wallet
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden bg-cream-warm border-0">
          <DialogTitle className="sr-only">Add to Apple Wallet</DialogTitle>

          {/* Step: Preview */}
          {step === "preview" && (
            <div className="p-6">
              <div className="text-center font-mono text-[11px] tracking-widest uppercase text-ink/60 mb-3">
                Preview pass
              </div>
              <PassCard pn={passNumber} offer={offer} />
              <p className="mt-4 text-center text-sm text-ink/70">
                Add this offer as a digital card so it's ready when you tap to pay.
              </p>
              <button
                onClick={add}
                className="mt-5 w-full h-12 rounded-full bg-ink text-cream font-medium"
              >
                Add to Wallet
              </button>
            </div>
          )}

          {/* Step: Adding */}
          {step === "adding" && (
            <div className="p-10 text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-full border-2 border-ink/20 border-t-ink animate-spin" />
              <p className="text-ink/70 text-sm">Adding to your Wallet…</p>
            </div>
          )}

          {/* Step: Added */}
          {step === "added" && (
            <div className="p-6">
              <div className="text-center font-mono text-[11px] tracking-widest uppercase text-moss mb-3">
                ✓ Added · ready to pay
              </div>
              <PassCard pn={passNumber} offer={offer} />
              <button
                onClick={tapToPay}
                className="mt-5 w-full h-12 rounded-full bg-ink text-cream font-medium inline-flex items-center justify-center gap-2"
              >
                <i className="ph-fill ph-hand-tap" /> Tap to pay (demo)
              </button>
              <button
                onClick={() => setOpen(false)}
                className="mt-2 w-full h-10 text-ink/60 text-sm"
              >
                Close
              </button>
            </div>
          )}

          {/* Step: Face ID */}
          {step === "faceid" && (
            <div className="p-10 text-center bg-cream">
              <PassCard pn={passNumber} offer={offer} small />
              <div className="mt-8 mx-auto h-20 w-20 rounded-2xl border-2 border-ink/40 inline-flex items-center justify-center animate-pulse">
                <i className="ph ph-scan text-4xl text-ink/70" />
              </div>
              <p className="mt-3 font-medium text-ink">Face ID</p>
            </div>
          )}

          {/* Step: Tapping */}
          {step === "tapping" && (
            <div className="p-10 text-center bg-cream">
              <PassCard pn={passNumber} offer={offer} small />
              <div className="mt-8 mx-auto inline-flex items-center justify-center">
                <span className="relative inline-flex h-24 w-24 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-tomato/20 animate-ping" />
                  <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-tomato text-cream">
                    <i className="ph-fill ph-wave-sine text-2xl" />
                  </span>
                </span>
              </div>
              <p className="mt-3 font-medium text-ink">Hold near reader…</p>
            </div>
          )}

          {/* Step: Done */}
          {step === "done" && (
            <div className="p-8 text-center">
              <div className="mx-auto h-16 w-16 rounded-full bg-moss text-cream inline-flex items-center justify-center">
                <i className="ph-fill ph-check text-3xl" />
              </div>
              <h3 className="font-display text-3xl mt-3 text-ink">Done!</h3>
              <p className="mt-1 text-ink/70 text-sm">
                {offer.discount_pct}% magically deducted from the bill.
              </p>
              <button
                onClick={() => setOpen(false)}
                className="mt-5 w-full h-12 rounded-full bg-ink text-cream font-medium"
              >
                Close
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function PassCard({
  pn,
  offer,
  small = false,
}: {
  pn: string;
  offer: AddToAppleWalletProps["offer"];
  small?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-ink text-cream p-4 mx-auto shadow-lg",
        small ? "max-w-[260px]" : "max-w-full"
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-display italic text-2xl">EatClub</span>
        <span className="font-mono text-[10px] tracking-widest uppercase opacity-70">
          Prepaid ))
        </span>
      </div>
      <div className="mt-8 font-mono text-[13px] tracking-[0.4em] opacity-80">
        ···· {pn}
      </div>
      <div className="mt-3 border-t border-cream/15 pt-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-widest opacity-80">
        <span className="truncate max-w-[55%]">{offer.merchant?.name || "Venue"}</span>
        <span>−{offer.discount_pct}%</span>
      </div>
    </div>
  );
}
