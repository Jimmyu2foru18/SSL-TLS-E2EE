import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Shield, Lock, ShieldOff, Send, ChevronDown, ChevronUp,
  CheckCircle2, XCircle, Clock, Eye, EyeOff, Zap, AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import {
  useCVTStore, signMessage, encryptMessage, verifySignature,
  type CVTMessage, type RelayPacket
} from "@/lib/cvtStore";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

const SPAM_PHRASES = ["win", "free", "click here", "congratulations", "prize", "urgent", "offer", "limited time", "claim"];

function isSpamContent(text: string): boolean {
  const lower = text.toLowerCase();
  return SPAM_PHRASES.some(p => lower.includes(p));
}

function MessageBubble({ msg, showDetails }: { msg: CVTMessage; showDetails: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  const statusIcon = msg.status === "verified" ? (
    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
  ) : msg.status === "rejected" ? (
    <XCircle className="w-3 h-3 text-red-400" />
  ) : (
    <Clock className="w-3 h-3 text-amber-400" />
  );

  const bubbleClass = cn(
    "max-w-[85%] rounded-2xl p-3 relative",
    msg.isOwn
      ? "ml-auto bg-cyan-500/15 border border-cyan-500/25 text-slate-200"
      : msg.isSpam
        ? "mr-auto bg-red-500/10 border border-red-500/30 text-slate-300 opacity-70"
        : "mr-auto glass-card text-slate-200",
    msg.status === "verified" && !msg.isOwn && !msg.isSpam && "trust-verified",
    msg.status === "rejected" && "trust-rejected"
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex flex-col mb-3", msg.isOwn ? "items-end" : "items-start")}
    >
      {/* Sender label for non-own messages */}
      {!msg.isOwn && (
        <div className="flex items-center gap-1.5 mb-1 px-1">
          {msg.isSpam ? (
            <AlertTriangle className="w-3 h-3 text-red-400" />
          ) : (
            <Shield className="w-3 h-3 text-emerald-400" />
          )}
          <span className={cn(
            "text-[10px] font-mono font-semibold",
            msg.isSpam ? "text-red-400" : "text-emerald-400"
          )}>
            {msg.isSpam ? "UNVERIFIED — SPAM" : msg.from}
          </span>
        </div>
      )}

      <div className={bubbleClass}>
        {/* Spam overlay */}
        {msg.isSpam && (
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center bg-red-900/20 z-10">
            <div className="flex items-center gap-1.5 bg-red-900/80 px-3 py-1.5 rounded-full border border-red-500/40">
              <ShieldOff className="w-3.5 h-3.5 text-red-400" />
              <span className="text-xs text-red-300 font-semibold">RELAY REJECTED</span>
            </div>
          </div>
        )}

        <p className={cn("text-sm leading-relaxed", msg.isSpam && "blur-[2px]")}>
          {msg.content}
        </p>

        <div className="flex items-center gap-1.5 mt-1.5">
          {statusIcon}
          <span className="text-[10px] text-slate-500 font-mono">
            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          {!msg.isSpam && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="ml-auto text-[10px] text-slate-600 hover:text-slate-400 flex items-center gap-0.5 transition-colors"
            >
              {expanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
            </button>
          )}
        </div>

        {/* Expanded crypto details */}
        <AnimatePresence>
          {expanded && !msg.isSpam && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 pt-2 border-t border-slate-700/50 space-y-2">
                {/* Signature */}
                <div>
                  <p className="text-[9px] text-slate-500 uppercase tracking-wider mb-0.5">Signature (Ed25519)</p>
                  <p className="key-display text-[9px] text-emerald-400/70 break-all">
                    {msg.signature.slice(0, 32)}...
                  </p>
                </div>

                {/* Encrypted Payload */}
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">Encrypted Payload (XSalsa20)</p>
                    <button onClick={() => setShowPayload(!showPayload)} className="text-[9px] text-slate-600 hover:text-slate-400">
                      {showPayload ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                    </button>
                  </div>
                  {showPayload ? (
                    <p className="key-display text-[9px] text-amber-400/60 break-all mt-0.5">
                      {msg.encryptedPayload}
                    </p>
                  ) : (
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex-1 h-2 rounded-sm bg-slate-700/60" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Verification status */}
                <div className={cn(
                  "flex items-center gap-1.5 px-2 py-1 rounded-lg",
                  msg.status === "verified" ? "bg-emerald-500/10" : "bg-red-500/10"
                )}>
                  {msg.status === "verified" ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <XCircle className="w-3 h-3 text-red-400" />
                  )}
                  <span className={cn(
                    "text-[9px] font-mono font-semibold",
                    msg.status === "verified" ? "text-emerald-400" : "text-red-400"
                  )}>
                    {msg.status === "verified" ? "SIGNATURE VALID — RELAY ACCEPTED" : "SIGNATURE INVALID — RELAY REJECTED"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function RelayLog({ packets }: { packets: RelayPacket[] }) {
  if (packets.length === 0) return null;
  return (
    <div className="glass-card p-3 mb-3">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-3.5 h-3.5 text-amber-400" />
        <p className="text-xs font-semibold text-slate-300">Relay Log</p>
        <span className="text-[10px] text-slate-600 font-mono ml-auto">{packets.length} packets</span>
      </div>
      <div className="space-y-1 max-h-28 overflow-y-auto">
        {packets.slice(0, 8).map(pkt => (
          <div key={pkt.id} className="flex items-center gap-2 text-[10px] font-mono">
            {pkt.rejected ? (
              <XCircle className="w-3 h-3 text-red-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
            )}
            <span className={pkt.rejected ? "text-red-400" : "text-emerald-400"}>
              {pkt.rejected ? "REJECT" : "ROUTE "}
            </span>
            <span className="text-slate-500 truncate">{pkt.from} → {pkt.to}</span>
            {pkt.reason && <span className="text-red-400/70 ml-auto shrink-0">{pkt.reason}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  const [, navigate] = useLocation();
  const { identity, messages, contacts, relayLog, addMessage, addRelayPacket } = useCVTStore();
  const [input, setInput] = useState("");
  const [selectedContact, setSelectedContact] = useState(contacts[0]?.id ?? "");
  const [showRelay, setShowRelay] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const contact = contacts.find(c => c.id === selectedContact);
  const threadMessages = messages.filter(
    m => !m.isSpam || m.status === "rejected"
  );

  function handleSend() {
    if (!input.trim()) return;
    if (!identity) {
      toast.error("No identity registered", {
        description: "Go to Identity tab to generate your key pair first.",
        action: { label: "Setup", onClick: () => navigate("/identity") },
      });
      return;
    }

    const isSpam = isSpamContent(input);
    const sig = signMessage(input, identity.privateKey);
    const sigValid = verifySignature(input, sig, identity.publicKey);
    const encrypted = encryptMessage(input, contact?.publicKey ?? "");

    const pkt: RelayPacket = {
      id: nanoid(),
      timestamp: Date.now(),
      from: identity.phoneNumber,
      to: contact?.phoneNumber ?? "unknown",
      signatureValid: sigValid && !isSpam,
      rejected: isSpam || !sigValid,
      reason: isSpam ? "SIG_UNBOUND" : !sigValid ? "SIG_INVALID" : undefined,
    };
    addRelayPacket(pkt);

    if (isSpam) {
      toast.error("Message blocked by relay", {
        description: "Spam-like content detected. Valid signature required.",
      });
      return;
    }

    const msg: CVTMessage = {
      id: nanoid(),
      from: identity.phoneNumber,
      to: contact?.phoneNumber ?? "unknown",
      content: input,
      encryptedPayload: encrypted,
      signature: sig,
      timestamp: Date.now(),
      status: "verified",
      isSpam: false,
      isOwn: true,
    };
    addMessage(msg);
    setInput("");
    toast.success("Message sent", {
      description: "Signed with Ed25519, encrypted with XSalsa20.",
    });
  }

  function simulateSpam() {
    const spamMsg: CVTMessage = {
      id: nanoid(),
      from: "+1 (800) 555-SPAM",
      to: identity?.phoneNumber ?? "me",
      content: "FREE PRIZE! You've won $5,000! Click here to claim your reward NOW!",
      encryptedPayload: "",
      signature: "INVALID_NO_KEY_BINDING",
      timestamp: Date.now(),
      status: "rejected",
      isSpam: true,
      isOwn: false,
    };
    const pkt: RelayPacket = {
      id: nanoid(),
      timestamp: Date.now(),
      from: "+1 (800) 555-SPAM",
      to: identity?.phoneNumber ?? "me",
      signatureValid: false,
      rejected: true,
      reason: "NO_KEY_BINDING",
    };
    addMessage(spamMsg);
    addRelayPacket(pkt);
    toast.error("Spam intercepted by relay", {
      description: "Message had no valid key binding. Rejected at protocol layer.",
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-slate-800/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-400" />
            <h1 className="text-lg font-black text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              Secure Messages
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRelay(!showRelay)}
              className={cn(
                "text-[10px] font-mono px-2 py-1 rounded-lg border transition-colors",
                showRelay
                  ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                  : "border-slate-700 text-slate-500 hover:text-slate-300"
              )}
            >
              RELAY LOG
            </button>
          </div>
        </div>

        {/* Contact Selector */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {contacts.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedContact(c.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium shrink-0 transition-all duration-200",
                selectedContact === c.id
                  ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-400"
                  : "glass-card text-slate-400 hover:text-slate-300"
              )}
            >
              <div className={cn(
                "w-2 h-2 rounded-full",
                c.trustState === "verified" ? "bg-emerald-400" :
                c.trustState === "pending" ? "bg-amber-400" : "bg-red-400"
              )} />
              {c.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Relay Log */}
      <AnimatePresence>
        {showRelay && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pt-3 overflow-hidden"
          >
            <RelayLog packets={relayLog} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {/* Contact header */}
        {contact && (
          <div className="flex items-center justify-center mb-4">
            <div className="glass-card px-3 py-1.5 flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                contact.trustState === "verified" ? "bg-emerald-400" : "bg-amber-400"
              )} />
              <span className="text-[10px] font-mono text-slate-400">{contact.name}</span>
              <Lock className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-mono text-cyan-400">E2EE</span>
            </div>
          </div>
        )}

        {threadMessages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} showDetails={false} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4 pt-2 border-t border-slate-800/50">
        {/* Spam demo button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={simulateSpam}
            className="text-[10px] font-mono text-red-400/60 hover:text-red-400 border border-red-400/20 hover:border-red-400/40 px-2 py-1 rounded-lg transition-colors"
          >
            + Simulate Spam Attack
          </button>
        </div>

        <div className="flex gap-2 items-end">
          <div className="flex-1 glass-card flex items-end gap-2 px-3 py-2.5 rounded-2xl">
            <Lock className="w-3.5 h-3.5 text-cyan-400/50 shrink-0 mb-0.5" />
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message... (E2EE)"
              rows={1}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none resize-none"
              style={{ maxHeight: 80 }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className={cn(
              "p-3 rounded-2xl transition-all duration-200 shrink-0",
              input.trim()
                ? "bg-cyan-400 text-slate-900 hover:bg-cyan-300 glow-cyan"
                : "bg-slate-800 text-slate-600"
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {identity && (
          <div className="flex items-center gap-1.5 mt-1.5 px-1">
            <Shield className="w-2.5 h-2.5 text-emerald-400" />
            <span className="text-[9px] text-slate-600 font-mono">
              Signing with {identity.keyFingerprint.slice(0, 9).toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}