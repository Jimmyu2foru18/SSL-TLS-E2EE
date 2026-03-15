import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Search, Shield, CheckCircle2, Clock, XCircle,
  Hash, Copy, Phone, Key, ChevronRight, Plus, Lock
} from "lucide-react";
import { toast } from "sonner";
import { useCVTStore, saltedHash, formatKeyDisplay, type CVTContact } from "@/lib/cvtStore";
import { cn } from "@/lib/utils";

const TRUST_CONFIG = {
  verified: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20", label: "Verified" },
  pending: { icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20", label: "Pending" },
  rejected: { icon: XCircle, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "Rejected" },
};

function ContactCard({ contact, onSelect }: { contact: CVTContact; onSelect: () => void }) {
  const trust = TRUST_CONFIG[contact.trustState];
  const TrustIcon = trust.icon;
  const timeSince = Math.floor((Date.now() - contact.lastSeen) / 60000);
  const timeLabel = timeSince < 60
    ? `${timeSince}m ago`
    : timeSince < 1440
      ? `${Math.floor(timeSince / 60)}h ago`
      : `${Math.floor(timeSince / 1440)}d ago`;

  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={cn(
        "w-full glass-card p-3.5 flex items-center gap-3 text-left transition-all duration-200",
        "hover:bg-white/5",
        contact.trustState === "verified" && "trust-verified",
        contact.trustState === "pending" && "trust-pending",
        contact.trustState === "rejected" && "trust-rejected"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
        trust.bg, trust.border, "border"
      )}>
        <span className={trust.color}>{contact.avatar}</span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-semibold text-slate-200 truncate">{contact.name}</span>
          <TrustIcon className={cn("w-3.5 h-3.5 shrink-0", trust.color)} />
        </div>
        <p className="text-xs text-slate-500 font-mono truncate">{contact.phoneNumber}</p>
        <p className="text-[10px] text-slate-600 font-mono truncate mt-0.5">
          {contact.keyFingerprint.slice(0, 19).toUpperCase()}
        </p>
      </div>

      {/* Meta */}
      <div className="text-right shrink-0">
        <p className="text-[10px] text-slate-600 mb-1">{timeLabel}</p>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 ml-auto" />
      </div>
    </motion.button>
  );
}

function ContactDetail({ contact, onClose }: { contact: CVTContact; onClose: () => void }) {
  const [hashedPhone, setHashedPhone] = useState<string | null>(null);
  const [showHash, setShowHash] = useState(false);
  const trust = TRUST_CONFIG[contact.trustState];
  const TrustIcon = trust.icon;

  useEffect(() => {
    saltedHash(contact.phoneNumber).then(setHashedPhone);
  }, [contact.phoneNumber]);

  function copy(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 30 }}
      className="absolute inset-0 bg-[#050B18] z-20 px-4 pt-4 pb-6 overflow-y-auto"
    >
      {/* Back */}
      <button
        onClick={onClose}
        className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 mb-4 transition-colors"
      >
        ← Back to contacts
      </button>

      {/* Contact Header */}
      <div className={cn(
        "glass-card p-4 mb-4 flex items-center gap-4",
        contact.trustState === "verified" && "trust-verified",
        contact.trustState === "pending" && "trust-pending"
      )}>
        <div className={cn(
          "w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold",
          trust.bg, "border", trust.border
        )}>
          <span className={trust.color}>{contact.avatar}</span>
        </div>
        <div>
          <h2 className="text-lg font-black text-white mb-0.5" style={{ fontFamily: 'Syne, sans-serif' }}>
            {contact.name}
          </h2>
          <div className="flex items-center gap-1.5">
            <TrustIcon className={cn("w-3.5 h-3.5", trust.color)} />
            <span className={cn("text-xs font-semibold", trust.color)}>{trust.label}</span>
          </div>
        </div>
      </div>

      {/* Phone */}
      <div className="glass-card p-3.5 mb-3 flex items-center gap-3">
        <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
        <div className="flex-1">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Phone Number</p>
          <p className="text-sm font-mono text-slate-200">{contact.phoneNumber}</p>
        </div>
        <button onClick={() => copy(contact.phoneNumber, "Phone number")} className="p-1.5 hover:bg-slate-700/50 rounded-lg">
          <Copy className="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      {/* Privacy-Preserving Hash */}
      <div className="glass-card p-3.5 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-violet-400" />
            <p className="text-xs font-semibold text-slate-300">Privacy-Preserving Hash</p>
          </div>
          <button
            onClick={() => setShowHash(!showHash)}
            className={cn(
              "text-[10px] font-mono px-2 py-0.5 rounded-full border transition-colors",
              showHash
                ? "bg-violet-400/10 border-violet-400/30 text-violet-400"
                : "border-slate-700 text-slate-500"
            )}
          >
            {showHash ? "HIDE" : "REVEAL"}
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mb-2">
          SHA-256(salt + phone) — this is what gets stored in the CVT Directory. Your address book never leaves your device.
        </p>
        <AnimatePresence>
          {showHash && hashedPhone && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-start gap-2 bg-violet-900/20 rounded-xl p-2.5 border border-violet-500/20">
                <p className="key-display text-violet-400/80 text-[10px] flex-1 break-all">{hashedPhone}</p>
                <button onClick={() => copy(hashedPhone, "Hash")} className="shrink-0 mt-0.5">
                  <Copy className="w-3 h-3 text-slate-500" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Public Key */}
      <div className="glass-card p-3.5 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <p className="text-xs font-semibold text-slate-300">Public Key (Ed25519)</p>
          </div>
          <button onClick={() => copy(contact.publicKey, "Public key")} className="p-1 hover:bg-slate-700/50 rounded-lg">
            <Copy className="w-3.5 h-3.5 text-slate-500" />
          </button>
        </div>
        <p className="key-display text-[10px]">{formatKeyDisplay(contact.publicKey)}</p>
      </div>

      {/* Fingerprint */}
      <div className="glass-card p-3.5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          <p className="text-xs font-semibold text-slate-300">Key Fingerprint</p>
        </div>
        <p className="font-mono text-sm text-cyan-400 tracking-wider">
          {contact.keyFingerprint.toUpperCase()}
        </p>
        <p className="text-[10px] text-slate-500 mt-1.5">
          Compare this fingerprint out-of-band to verify identity
        </p>
      </div>

      {/* E2EE info */}
      <div className="glass-card p-3.5 flex items-center gap-3 border border-emerald-400/10">
        <Lock className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <p className="text-xs font-semibold text-emerald-400 mb-0.5">End-to-End Encrypted</p>
          <p className="text-xs text-slate-500">
            Messages are encrypted with their public key using XSalsa20. Only they can decrypt.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function DiscoveryDemo() {
  const [phoneInput, setPhoneInput] = useState("");
  const [hash, setHash] = useState<string | null>(null);
  const [computing, setComputing] = useState(false);

  async function computeHash() {
    if (!phoneInput.trim()) return;
    setComputing(true);
    setHash(null);
    await new Promise(r => setTimeout(r, 600));
    const result = await saltedHash(phoneInput);
    setHash(result);
    setComputing(false);
  }

  return (
    <div className="glass-card p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Hash className="w-4 h-4 text-violet-400" />
        <h3 className="text-sm font-bold text-slate-200" style={{ fontFamily: 'Syne, sans-serif' }}>
          Privacy Discovery Demo
        </h3>
      </div>
      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
        Enter any phone number to see how CVT hashes it for directory lookup. Your contacts are never sent to the server.
      </p>
      <div className="flex gap-2 mb-3">
        <input
          type="tel"
          value={phoneInput}
          onChange={e => setPhoneInput(e.target.value)}
          placeholder="+1 (555) 000-0000"
          className="flex-1 bg-transparent border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-violet-400/50 transition-colors"
        />
        <button
          onClick={computeHash}
          disabled={!phoneInput.trim() || computing}
          className="px-3 py-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400 text-xs font-semibold hover:bg-violet-500/30 disabled:opacity-50 transition-colors"
        >
          {computing ? "..." : "Hash"}
        </button>
      </div>
      <AnimatePresence>
        {hash && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-violet-900/20 rounded-xl p-3 border border-violet-500/20"
          >
            <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-1">SHA-256(cvt-v1-salt + phone)</p>
            <p className="key-display text-violet-400/80 text-[10px] break-all">{hash}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ContactsPage() {
  const { contacts } = useCVTStore();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CVTContact | null>(null);

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phoneNumber.includes(search)
  );

  const verifiedCount = contacts.filter(c => c.trustState === "verified").length;
  const pendingCount = contacts.filter(c => c.trustState === "pending").length;

  return (
    <div className="px-4 pt-4 pb-6 relative">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
            Contacts
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Privacy-preserving discovery via salted SHA-256 hashing
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="glass-card p-2.5 text-center">
          <p className="text-lg font-black text-emerald-400">{verifiedCount}</p>
          <p className="text-[10px] text-slate-500">Verified</p>
        </div>
        <div className="glass-card p-2.5 text-center">
          <p className="text-lg font-black text-amber-400">{pendingCount}</p>
          <p className="text-[10px] text-slate-500">Pending</p>
        </div>
        <div className="glass-card p-2.5 text-center">
          <p className="text-lg font-black text-cyan-400">{contacts.length}</p>
          <p className="text-[10px] text-slate-500">Total</p>
        </div>
      </div>

      {/* Search */}
      <div className="glass-card flex items-center gap-2 px-3 py-2.5 mb-4">
        <Search className="w-4 h-4 text-slate-500 shrink-0" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search contacts..."
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none"
        />
      </div>

      {/* Discovery Demo */}
      <DiscoveryDemo />

      {/* Contact List */}
      <div className="space-y-2">
        {filtered.map((contact, i) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <ContactCard contact={contact} onSelect={() => setSelected(contact)} />
          </motion.div>
        ))}
      </div>

      {/* Add Contact placeholder */}
      <button
        onClick={() => toast.info("Add Contact", { description: "In production, this scans the CVT Directory for the contact's public key." })}
        className="w-full mt-3 py-3 rounded-xl glass-card border border-dashed border-slate-700 text-slate-500 text-sm hover:text-slate-300 hover:border-slate-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add CVT Contact
      </button>

      {/* Contact Detail Overlay */}
      <AnimatePresence>
        {selected && (
          <ContactDetail contact={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}