import { motion } from "framer-motion";
import { Shield, Key, Lock, Zap, Eye, Cpu, ArrowRight, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";
import { useCVTStore } from "@/lib/cvtStore";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Key,
    title: "Cryptographic Identity",
    desc: "Every phone number bound to a unique Ed25519 public key, verified via SMS-OTP.",
    color: "text-cyan-400",
    bg: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  {
    icon: Lock,
    title: "End-to-End Encryption",
    desc: "All payloads encrypted locally using XSalsa20. The relay sees only ciphertext.",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  {
    icon: Cpu,
    title: "Hardware Root of Trust",
    desc: "Private keys generated and stored in iOS Secure Enclave or Android StrongBox.",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    border: "border-violet-400/20",
  },
  {
    icon: Zap,
    title: "Signature-Based Filtering",
    desc: "The relay rejects any message lacking a valid digital signature — spam dies at the protocol layer.",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  {
    icon: Eye,
    title: "Privacy-Preserving Discovery",
    desc: "Find CVT-ready contacts using salted SHA-256 hashing. Your address book never leaves your device.",
    color: "text-pink-400",
    bg: "bg-pink-400/10",
    border: "border-pink-400/20",
  },
  {
    icon: Shield,
    title: "Zero-Trust Protocol",
    desc: "From the 1970s PSTN 'Open Door' to a 21st century 'Proof-of-Permission' model.",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
];

const stats = [
  { value: "Ed25519", label: "Signature Algorithm" },
  { value: "XSalsa20", label: "Encryption Cipher" },
  { value: "SHA-256", label: "Discovery Hash" },
  { value: "WSS", label: "Transport Layer" },
];

export default function Home() {
  const [, navigate] = useLocation();
  const { identity } = useCVTStore();

  return (
    <div className="px-4 pt-4 pb-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden mb-6"
        style={{ minHeight: 220 }}
      >
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663425202623/DAHKdudC96AfPrgfKrtTMA/cvt-hero-bg-NbLbzgC5VNbz4tpbWDA7jA.webp"
          alt="CVT Network"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050B18]/60 via-[#050B18]/40 to-[#050B18]/90" />
        <div className="relative z-10 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-cyan-400/20 border border-cyan-400/30">
              <Shield className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
              Zero-Trust Protocol
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mb-2 leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            Cryptographically<br />
            <span className="text-cyan-400">Verified</span> Telephony
          </h1>
          <p className="text-sm text-slate-300 mb-4 leading-relaxed max-w-xs">
            A phone number is no longer a public target — it's a secure, private endpoint bound to a hardware-backed key pair.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => navigate(identity ? "/messages" : "/identity")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-400 text-slate-900 text-sm font-semibold hover:bg-cyan-300 transition-colors"
            >
              {identity ? "Open Messages" : "Get Started"}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate("/architecture")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass-card text-slate-300 text-sm font-medium hover:text-white transition-colors"
            >
              View Protocol
            </button>
          </div>
        </div>
      </motion.div>

      {/* Identity Status Banner */}
      {identity ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card trust-verified p-3 mb-5 flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-emerald-400 font-semibold">Identity Verified</p>
            <p className="text-xs text-slate-400 font-mono truncate">{identity.phoneNumber}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500 font-mono">
              {identity.hardwareBackend}
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card trust-pending p-3 mb-5 flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/identity")}
        >
          <Key className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="flex-1">
            <p className="text-xs text-amber-400 font-semibold">No Identity Registered</p>
            <p className="text-xs text-slate-400">Tap to generate your Ed25519 key pair</p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500" />
        </motion.div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card p-2 text-center"
          >
            <p className="text-[10px] font-mono text-cyan-400 font-semibold leading-tight">{stat.value}</p>
            <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Feature Cards */}
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider" style={{ fontFamily: 'Syne, sans-serif' }}>
          Protocol Features
        </h2>
        <div className="space-y-2.5">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className="glass-card glass-card-hover p-3.5 flex items-start gap-3"
            >
              <div className={cn("p-2 rounded-lg shrink-0", feature.bg, "border", feature.border)}>
                <feature.icon className={cn("w-4 h-4", feature.color)} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-200 mb-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Computational Friction Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-4 border border-cyan-400/10"
      >
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Syne, sans-serif' }}>
            Computational Friction
          </h3>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          By requiring a valid, number-bound signature for every interaction, we make it{" "}
          <span className="text-cyan-400 font-medium">economically impossible</span> for a spammer to blast millions of messages. 
          The cost of one text equals the cost of one verified phone line.
        </p>
        <div className="mt-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-700/50">
          <div className="flex justify-between items-center text-xs font-mono">
            <span className="text-red-400">Legacy SMS cost per spam:</span>
            <span className="text-red-400">$0.001</span>
          </div>
          <div className="flex justify-between items-center text-xs font-mono mt-1">
            <span className="text-emerald-400">CVT cost per message:</span>
            <span className="text-emerald-400">= 1 verified line</span>
          </div>
        </div>
      </motion.div>
    </div>
  );