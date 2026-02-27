import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Share2, Copy, Check, ExternalLink } from "lucide-react";

/* ─── Types ─────────────────────────────────────────────────────── */
interface CagnotteShareData {
  id: number;
  title: string;
  description?: string | null;
  currentAmount: number;
  targetAmount?: number | null;  // FIX: nullable (objectif optionnel)
  contributorsCount: number;
  category?: string;
  slug?: string | null;
}

interface ShareCagnotteProps {
  cagnotte: CagnotteShareData;
  /** Render as icon-only button (for cards) or full button */
  variant?: "icon" | "button" | "button-outline";
  className?: string;
}

/* ─── Social platforms ──────────────────────────────────────────── */
const PLATFORMS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    color: "#25D366",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    buildUrl: (url: string, text: string) =>
      `https://wa.me/?text=${encodeURIComponent(text + "\n\n" + url)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    color: "#1877F2",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    buildUrl: (url: string, _text: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(_text)}`,
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    color: "#000000",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    buildUrl: (url: string, text: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    color: "#0088CC",
    icon: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.492-1.302.48-.428-.013-1.252-.242-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    buildUrl: (url: string, text: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  },
] as const;

/* ─── Helpers ───────────────────────────────────────────────────── */
function formatFCFA(n: number) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}

function buildShareText(c: CagnotteShareData): string {
  const percent = c.targetAmount && c.targetAmount > 0
    ? Math.min(Math.round((c.currentAmount / c.targetAmount) * 100), 100)
    : 0;
  const progressLine = c.targetAmount && c.targetAmount > 0
    ? `💰 ${formatFCFA(c.currentAmount)} collectés sur ${formatFCFA(c.targetAmount)} (${percent}%)\n`
    : `💰 ${formatFCFA(c.currentAmount)} collectés\n`;
  return `🤝 Soutenez "${c.title}" sur Terra Biga !\n\n${progressLine}👥 ${c.contributorsCount} contributeur${c.contributorsCount > 1 ? "s" : ""}\n\nChaque contribution compte !`;
}

function getCagnotteUrl(id: number): string {
  return `${window.location.origin}/ma-cagnotte/${id}`;
}

/* ─── Component ─────────────────────────────────────────────────── */
export default function ShareCagnotte({
  cagnotte,
  variant = "button",
  className = "",
}: ShareCagnotteProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = getCagnotteUrl(cagnotte.id);
  const shareText = buildShareText(cagnotte);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      toast.success("Lien copié !");
      setTimeout(() => setCopied(false), 2500);
    }
  }, [shareUrl]);

  const handleNativeShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: cagnotte.title,
          text: shareText,
          url: shareUrl,
        });
        toast.success("Partagé avec succès !");
      } catch (err: any) {
        if (err?.name !== "AbortError") {
          setOpen(true);
        }
      }
    } else {
      setOpen(true);
    }
  }, [cagnotte.title, shareText, shareUrl]);

  const handlePlatformShare = useCallback(
    (buildUrl: (url: string, text: string) => string) => {
      window.open(buildUrl(shareUrl, shareText), "_blank", "noopener,noreferrer,width=600,height=500");
    },
    [shareUrl, shareText]
  );

  const percent = cagnotte.targetAmount && cagnotte.targetAmount > 0
    ? Math.min(Math.round((cagnotte.currentAmount / cagnotte.targetAmount) * 100), 100)
    : 0;

  /* ─── Trigger button ──────────────────────────────────────────── */
  const triggerButton =
    variant === "icon" ? (
      <button
        onClick={handleNativeShare}
        className={`w-9 h-9 rounded-full flex items-center justify-center border border-border text-muted-foreground hover:text-tb-blue hover:border-tb-blue transition-colors ${className}`}
        title="Partager"
        aria-label="Partager cette cagnotte"
      >
        <Share2 className="w-4 h-4" />
      </button>
    ) : variant === "button-outline" ? (
      <Button
        onClick={handleNativeShare}
        variant="outline"
        className={`gap-2 rounded-xl border-tb-blue text-tb-blue hover:bg-tb-blue/5 ${className}`}
      >
        <Share2 className="w-4 h-4" /> Partager
      </Button>
    ) : (
      <Button
        onClick={handleNativeShare}
        variant="outline"
        className={`h-12 rounded-xl gap-2 border-tb-blue text-tb-blue hover:bg-tb-blue/5 ${className}`}
      >
        <Share2 className="w-5 h-5" /> Partager
      </Button>
    );

  return (
    <>
      {triggerButton}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-center text-lg">
              Partager cette cagnotte
            </DialogTitle>
          </DialogHeader>

          {/* Preview card */}
          <div className="bg-gradient-to-br from-tb-blue/5 to-tb-green/5 rounded-xl p-4 border border-border/50">
            <h4 className="font-semibold text-foreground text-sm line-clamp-2 mb-1">
              {cagnotte.title}
            </h4>
            {cagnotte.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {cagnotte.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-tb-green">
                {formatFCFA(cagnotte.currentAmount)}
              </span>
              <span className="text-muted-foreground">
                {percent}% atteint
              </span>
              <span className="text-muted-foreground">
                {cagnotte.contributorsCount} contributeur{cagnotte.contributorsCount > 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-4 gap-3">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.key}
                onClick={() => handlePlatformShare(platform.buildUrl)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
                aria-label={`Partager sur ${platform.label}`}
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110"
                  style={{ backgroundColor: platform.color }}
                >
                  {platform.icon}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground">
                  {platform.label}
                </span>
              </button>
            ))}
          </div>

          {/* Copy link */}
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="h-11 rounded-xl text-sm bg-muted/30 font-mono"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button
              onClick={handleCopy}
              variant="outline"
              className={`h-11 px-4 rounded-xl shrink-0 gap-2 transition-colors ${
                copied
                  ? "bg-tb-green/10 text-tb-green border-tb-green"
                  : "border-border"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copié
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copier
                </>
              )}
            </Button>
          </div>

          {/* Encouragement message */}
          <p className="text-center text-xs text-muted-foreground">
            Chaque partage peut faire la différence. Aidez cette cagnotte à atteindre son objectif !
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}
