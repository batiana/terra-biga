/**
 * client/src/pages/Login.tsx
 * ─────────────────────────────────────────────────────────────────────
 * Two-step OTP login: phone number → OTP code entry.
 * Redirects to `?next=` param (or /) after successful login.
 * Compatible with the existing useAuth hook (reads trpc.auth.me).
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Smartphone, ArrowLeft, Loader2, CheckCircle, RefreshCw } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

// ─── Types & constants ────────────────────────────────────────────────
const OTP_EXPIRY_S = 10 * 60; // 10 minutes in seconds
const RESEND_COOLDOWN_S = 60;  // 1 minute before resend allowed

type Step = "phone" | "otp";

// ─── Component ────────────────────────────────────────────────────────

export default function Login() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      const params = new URLSearchParams(window.location.search);
      navigate(params.get("next") ?? "/");
    }
  }, [isAuthenticated]);

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(0);       // OTP expiry countdown
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRef = useRef<HTMLInputElement>(null);

  // ── Countdown ticker ────────────────────────────────────────────
  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((expiresAt.getTime() - Date.now()) / 1000));
      setCountdown(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ── Normalise phone display ──────────────────────────────────────
  function formatPhoneDisplay(raw: string): string {
    const digits = raw.replace(/\D/g, "");
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)}`;
  }

  // ── Step 1: request OTP ──────────────────────────────────────────
  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/phone/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\s/g, "") }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "rate_limit") {
          setError("Trop de tentatives. Attendez 15 minutes avant de réessayer.");
        } else {
          setError(data.message ?? "Impossible d'envoyer le code. Réessayez.");
        }
        return;
      }
      setExpiresAt(new Date(data.expiresAt));
      setCountdown(OTP_EXPIRY_S);
      setResendCooldown(RESEND_COOLDOWN_S);
      setStep("otp");
      setTimeout(() => otpRef.current?.focus(), 100);
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: verify OTP ───────────────────────────────────────────
  async function handleVerifyOtp() {
    if (otp.length !== 6) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/phone/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\s/g, ""), code: otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "otp_invalid") setError("Code incorrect. Vérifiez et réessayez.");
        else if (data.error === "otp_expired") setError("Code expiré. Demandez-en un nouveau.");
        else setError(data.message ?? "Erreur de vérification.");
        setOtp("");
        return;
      }
      // Success — reload auth state and redirect
      const params = new URLSearchParams(window.location.search);
      window.location.href = params.get("next") ?? "/";
    } catch {
      setError("Erreur réseau. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  }

  // Auto-verify when 6 digits entered
  useEffect(() => {
    if (otp.length === 6) handleVerifyOtp();
  }, [otp]);

  // ── Resend OTP ───────────────────────────────────────────────────
  async function handleResend() {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/phone/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.replace(/\s/g, "") }),
      });
      const data = await res.json();
      if (res.ok) {
        setExpiresAt(new Date(data.expiresAt));
        setCountdown(OTP_EXPIRY_S);
        setResendCooldown(RESEND_COOLDOWN_S);
        setOtp("");
      } else {
        setError(data.message ?? "Impossible de renvoyer le code.");
      }
    } catch {
      setError("Erreur réseau.");
    } finally {
      setLoading(false);
    }
  }

  const formattedCountdown = countdown > 0
    ? `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, "0")}`
    : null;

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-orange-50 px-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-2xl flex items-center justify-center">
            <Smartphone className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {step === "phone" ? "Connexion" : "Code de vérification"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {step === "phone"
              ? "Entrez votre numéro pour recevoir un code"
              : `Code envoyé sur WhatsApp au ${formatPhoneDisplay(phone)}`}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {/* ── Step 1: Phone ── */}
          {step === "phone" && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Numéro de téléphone
                </Label>
                <div className="mt-1.5 flex rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-orange-400 focus-within:border-transparent transition">
                  <span className="flex items-center px-3 bg-gray-50 text-gray-500 text-sm font-medium border-r border-gray-200 shrink-0">
                    🇧🇫 +226
                  </span>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="70 00 00 00"
                    value={phone}
                    onChange={e => setPhone(formatPhoneDisplay(e.target.value.replace(/\D/g, "").slice(0, 8)))}
                    className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-12 px-3"
                    autoComplete="tel"
                    inputMode="numeric"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading || phone.replace(/\D/g, "").length < 8}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-base font-medium"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Recevoir le code"}
              </Button>

              <p className="text-xs text-center text-gray-400 pt-2">
                Code envoyé par WhatsApp. Connexion sécurisée, sans mot de passe.
              </p>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === "otp" && (
            <div className="space-y-5">
              <button
                onClick={() => { setStep("phone"); setError(null); setOtp(""); }}
                className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition -mt-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Changer de numéro
              </button>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otp}
                  onChange={setOtp}
                  disabled={loading}
                >
                  <InputOTPGroup className="gap-2">
                    {[0,1,2,3,4,5].map(i => (
                      <InputOTPSlot
                        key={i}
                        index={i}
                        className="w-11 h-14 text-xl border-2 border-gray-200 rounded-xl data-[active=true]:border-orange-400 data-[active=true]:ring-2 data-[active=true]:ring-orange-200"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {loading && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Vérification...
                </div>
              )}

              {error && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 text-center">{error}</p>
              )}

              {/* Expiry countdown */}
              {formattedCountdown && !loading && (
                <p className="text-xs text-center text-gray-400">
                  Code valide encore {formattedCountdown}
                </p>
              )}

              {/* Resend */}
              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-sm text-gray-400">
                    Renvoyer dans {resendCooldown}s
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-sm text-orange-500 hover:text-orange-600 mx-auto transition"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Renvoyer le code
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-xs text-center text-gray-400 mt-4">
          En vous connectant, vous acceptez les{" "}
          <a href="/cgu" className="underline hover:text-gray-600">CGU</a> de Terra Biga.
        </p>
      </div>
    </div>
  );
}
