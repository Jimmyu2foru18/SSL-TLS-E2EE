import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Network, Smartphone, Server, Database, Shield, ArrowRight,
  CheckCircle2, XCircle, Code2, GitBranch, Zap, Lock, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    id: "client",
    icon: Smartphone,
    title: "The Client",
    subtitle: "React Native / Flutter",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/30",
    glow: "shadow-[0_0_20px_rgba(34,211,238,0.15)]",
    desc: "Manages local E2EE state and hardware signatures. Private keys never leave the device.",
    details: [
      "Ed25519 key generation via Secure Enclave / StrongBox",
      "XSalsa20 message encryption before transmission",
      "Salted SHA-256 contact discovery (local only)",
      "SMS-OTP phone number verification flow",
    ],
  },
  {
    id: "relay",
    icon: Server,
    title: "The Relay",
    subtitle: "Node.js / Go — Stateless",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30",
    glow: "shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    desc: "Routes encrypted packets via WebSockets. Rejects any message without a valid signature.",
    details: [
      "Stateless WSS packet router",
      "Signature verification before routing",
      "Zero message storage — pure relay",
      "Spam rejection at protocol layer",
    ],
  },
  {
    id: "directory",
    icon: Database,
    title: "The Directory",
    subtitle: "PostgreSQL + Redis",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/30",
    glow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    desc: "Maps hashed phone numbers to active public keys. Never stores plaintext phone numbers.",
    details: [
      "SHA-256 hashed MSISDN → Public Key mapping",
      "Redis cache for low-latency key lookups",
      "PostgreSQL for persistent key registration",
      "Key revocation and rotation support",
    ],
  },
];

const FLOW_STEPS = [
  { from: "Alice", to: "Secure Enclave", action: "Sign message with Ed25519 private key", color: "text-cyan-400", icon: Lock },
  { from: "Client", to: "Directory", action: "Fetch Bob's public key (hashed lookup)", color: "text-violet-400", icon: Eye },
  { from: "Client", to: "Client", action: "Encrypt payload with Bob's public key (XSalsa20)", color: "text-emerald-400", icon: Lock },
  { from: "Client", to: "Relay", action: "Send: { ciphertext, signature, from_hash }", color: "text-amber-400", icon: ArrowRight },
  { from: "Relay", to: "Relay", action: "Verify Ed25519 signature — reject if invalid", color: "text-red-400", icon: Shield },
  { from: "Relay", to: "Bob's Client", action: "Route encrypted packet to recipient", color: "text-emerald-400", icon: ArrowRight },
  { from: "Bob's Enclave", to: "Bob", action: "Decrypt with private key — display plaintext", color: "text-cyan-400", icon: CheckCircle2 },
];

const CODE_SNIPPET = `// CVT Quick Start
git clone https://github.com/Jimmyu2foru18/SSL-TLS-E2EE.git
cd SSL-TLS-E2EE

# Configure relay
echo "PORT=3000
DATABASE_URL=postgres://user:pass@localhost:5432/cvt
REDIS_URL=redis://localhost:6379
SMS_PROVIDER_API_KEY=your_key" > server/.env

# Launch
cd server && npm install && npm start
cd client && npm install && npx react-native run-ios`;

export default function ArchitecturePage() {
  const [activeTier, setActiveTier] = useState<string | null>(null);
  const [flowStep, setFlowStep] = useState(-1);
  const [showCode, setShowCode] = useState(false);

  function runFlow() {
    setFlowStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step >= FLOW_STEPS.length) {
        clearInterval(interval);
        setTimeout(() => setFlowStep(-1), 2000);
      } else {
        setFlowStep(step);
      }
    }, 700);
  }

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-1">
          <Network className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            System Architecture
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Three-tier zero-trust protocol stack
        </p>
      </div>

      {/* Architecture Visual */}
      <div className="glass-card p-4 mb-4">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663425202623/DAHKdudC96AfPrgfKrtTMA/cvt-relay-visual-3Eq5TgSmYvu9cVxepMzA8Q.webp"
          alt="CVT Relay Architecture"
          className="w-full rounded-xl mb-3 object-cover"
          style={{ maxHeight: 180 }}
        />
        <p className="text-xs text-slate-400 text-center">
          Client → Relay → Directory — all communication cryptographically verified
        </p>
      </div>

      {/* 3 Tiers */}
      <div className="space-y-3 mb-5">
        {TIERS.map((tier, i) => {
          const Icon = tier.icon;
          const isActive = activeTier === tier.id;
          return (
            <motion.button
              key={tier.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setActiveTier(isActive ? null : tier.id)}
              className={cn(
                "w-full glass-card p-4 text-left transition-all duration-200",
                isActive ? [tier.border, tier.glow, "border"] : "hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={cn("p-2 rounded-xl", tier.bg, "border", tier.border)}>
                  <Icon className={cn("w-4 h-4", tier.color)} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-mono">TIER {i + 1}</span>
                    <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded-full border", tier.bg, tier.border, tier.color)}>
                      {tier.subtitle}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Syne, sans-serif' }}>
                    {tier.title}
                  </h3>
                </div>
                <motion.div animate={{ rotate: isActive ? 90 : 0 }}>
                  <ArrowRight className="w-4 h-4 text-slate-600" />
                </motion.div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{tier.desc}</p>

              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1.5">
                      {tier.details.map((d, j) => (
                        <div key={j} className="flex items-start gap-2">
                          <CheckCircle2 className={cn("w-3 h-3 mt-0.5 shrink-0", tier.color)} />
                          <span className="text-xs text-slate-400">{d}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Protocol Flow Animation */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Syne, sans-serif' }}>
              Message Flow
            </h3>
          </div>
          <button
            onClick={runFlow}
            disabled={flowStep >= 0}
            className="text-xs px-3 py-1.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-400 font-semibold hover:bg-amber-400/20 disabled:opacity-50 transition-colors"
          >
            {flowStep >= 0 ? "Running..." : "▶ Simulate"}
          </button>
        </div>

        <div className="space-y-2">
          {FLOW_STEPS.map((step, i) => {
            const StepIcon = step.icon;
            const isActive = flowStep === i;
            const isDone = flowStep > i;
            return (
              <motion.div
                key={i}
                animate={{
                  opacity: flowStep === -1 ? 0.5 : isDone ? 1 : isActive ? 1 : 0.3,
                  scale: isActive ? 1.01 : 1,
                }}
                className={cn(
                  "flex items-start gap-2.5 p-2.5 rounded-xl transition-all duration-300",
                  isActive && "bg-white/5 border border-white/10",
                  isDone && "opacity-60"
                )}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  isDone ? "bg-emerald-400/20" : isActive ? "bg-white/10" : "bg-slate-800"
                )}>
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <span className="text-[9px] font-mono text-slate-500">{i + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <StepIcon className={cn("w-3 h-3 shrink-0", step.color)} />
                    <span className={cn("text-[10px] font-mono font-semibold", step.color)}>
                      {step.from} → {step.to}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{step.action}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Spam vs CVT */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Syne, sans-serif' }}>
            Legacy SMS vs CVT
          </h3>
        </div>
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663425202623/DAHKdudC96AfPrgfKrtTMA/cvt-spam-shield-CaqN3BnVqs8SDQ8EvuRxdE.webp"
          alt="Spam Shield"
          className="w-full rounded-xl mb-3 object-cover"
          style={{ maxHeight: 140 }}
        />
        <div className="space-y-2">
          {[
            { label: "Sender Authentication", legacy: "None", cvt: "Ed25519 Signature", ok: true },
            { label: "Spam Prevention", legacy: "Carrier filters (bypassable)", cvt: "Protocol-layer rejection", ok: true },
            { label: "Message Privacy", legacy: "Carrier can read", cvt: "E2EE (XSalsa20)", ok: true },
            { label: "Identity Spoofing", legacy: "Trivial", cvt: "Cryptographically impossible", ok: true },
            { label: "Cost to Spam", legacy: "$0.001/msg", cvt: "= 1 verified phone line", ok: true },
          ].map(row => (
            <div key={row.label} className="grid grid-cols-3 gap-2 text-xs">
              <span className="text-slate-400 font-medium">{row.label}</span>
              <div className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-400 shrink-0" />
                <span className="text-red-400/80 text-[10px]">{row.legacy}</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="text-emerald-400/80 text-[10px]">{row.cvt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Developer Quick Start */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Syne, sans-serif' }}>
              Quick Start
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/Jimmyu2foru18/SSL-TLS-E2EE"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 border border-cyan-400/20 px-2 py-1 rounded-lg transition-colors"
            >
              <GitBranch className="w-3 h-3" />
              GitHub
            </a>
            <button
              onClick={() => setShowCode(!showCode)}
              className="text-[10px] text-slate-500 hover:text-slate-300 border border-slate-700 px-2 py-1 rounded-lg transition-colors"
            >
              {showCode ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showCode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <pre className="bg-slate-900/80 rounded-xl p-3 text-[10px] font-mono text-slate-300 overflow-x-auto border border-slate-700/50 whitespace-pre-wrap">
                {CODE_SNIPPET}
              </pre>
            </motion.div>
          )}
        </AnimatePresence>

        {!showCode && (
          <p className="text-xs text-slate-500">
            Clone the repository and follow the setup guide to run your own CVT relay.
          </p>
        )}
      </div>
    </div>
  );
}