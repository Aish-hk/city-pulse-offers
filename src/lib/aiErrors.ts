import { toast } from "sonner";

/**
 * Inspect a response from a Lovable AI–backed edge function and surface
 * billing/rate-limit problems to the user. Returns true when the call
 * succeeded (no AI gateway error), false when the caller should bail.
 */
export function handleAiResponse(data: any, error: any, opts?: { silent?: boolean }): boolean {
  if (error) {
    if (!opts?.silent) toast.error("Couldn't reach the AI service. Try again in a moment.");
    return false;
  }
  if (!data) return true;
  if (data.error === "credits_required") {
    if (!opts?.silent) {
      toast.error("AI credits exhausted", {
        description: "Top up in Settings → Workspace → Usage to keep generating offers.",
        duration: 8000,
      });
    }
    return false;
  }
  if (data.error === "rate_limited") {
    if (!opts?.silent) toast.warning("Too many requests — give it a few seconds.");
    return false;
  }
  if (data.error === "ai_gateway_error") {
    if (!opts?.silent) toast.error("AI gateway hiccup. Try again.");
    return false;
  }
  return true;
}
