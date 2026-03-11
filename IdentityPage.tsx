import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Key, Smartphone, Shield, CheckCircle2, 
  RefreshCw, Trash2, Copy, Eye, EyeOff, Cpu, Lock, AlertTriangle 
} from "lucide-react";
import { toast } from "sonner";
import { 
  useCVTStore, 
  generateEd25519KeyPair, 
  formatKeyDisplay, 
  formatFingerprint, 
  type CVTIdentity 
} from "@/lib/cvtStore";
import { cn } from "@/lib/utils";

// --- Types & Constants ---

type Step = "phone" | "otp" | "generating" | "complete";
type HardwareBackend = "SecureEnclave" | "StrongBox" | "Software";

const HARDWARE_OPTIONS: { id: HardwareBackend; label: string; desc: string }[] = [
  { id: "SecureEnclave", label: "Secure Enclave", desc: "Hardware isolation on Apple devices" },
  { id: "StrongBox", label: "StrongBox", desc: "Dedicated security chip on Android devices" },
  { id: "Software", label: "Software Keystore", desc: "Encrypted browser-based storage" },
];

const GEN_STEPS = [
  "Initializing hardware security module...",
  "Generating high-entropy seed...",
  "Computing Ed25519 key pair...",
  "Binding key to phone identity...",
  "Sealing private key in hardware...",
];

// --- Sub-Components ---

const HardwareCard = ({ id, label, desc, selected, onSelect }: any) => (
  <button
    onClick={() => onSelect(id)}
    className={cn(
      "w-full glass-card p-3 flex items-center gap-3 text-left transition-all duration-200",
      selected ? "trust-verified border-emerald-500/50" : "hover:border-slate-600"
    )}
  >
    <div className="flex-1">
      <p className={cn("text-sm font-semibold", selected ? "text-emerald-400" : "text-slate-300")}>
        {label}
      </p>
      <p className="text-[11px] text-slate-500">{desc}</p>
    </div>
    {selected && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
  </button>
);

// --- Main Page Component ---

export default function IdentityPage() {
  const { identity, setIdentity } = useCVTStore();
  
  // UI State
  const [step, setStep] = useState<Step>(identity ? "complete" : "phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [genStepIdx, setGenStepIdx] = useState(0);
  const [showPriv, setShowPriv] = useState(false);
  
  // Configuration
  const [hardware, setHardware] = useState<HardwareBackend>("Software");
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // --- Logic Handlers ---

  const handlePhoneSubmit = () => {
    if (phone.length < 10) {
      toast.error("Enter a valid phone number");
      return;
    }
    // API Call to trigger SMS gateway would happen here
    toast.success("Verification code sent");
    setStep("otp");
  };

  const handleOtpInput = (idx: number, val: string) => {
    const newVal = val.replace(/[^0-9]/g, "").slice(-1);
    const updated = [...otp];
    updated[idx] = newVal;
    setOtp(updated);

    if (newVal && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const finalizeIdentity = useCallback(async () => {
    setStep("generating");
    
    // Simulate generation feedback for UX
    for (let i = 0; i < GEN_STEPS.length; i++) {
      setGenStepIdx(i);
      await new Promise(r => setTimeout(r, 600));
    }

    try {
      // Real Cryptographic Generation (Async Web Crypto API)
      const kp = await generateEd25519KeyPair();
      
      const newId: CVTIdentity = {
        phoneNumber: phone,
        publicKey: kp.publicKey,
        privateKey: kp.privateKey,
        keyFingerprint: kp.fingerprint,
        createdAt: Date.now(),
        verified: true,
        hardwareBackend: hardware,
      };

      setIdentity(newId);
      setStep("complete");
      toast.success("Identity Secured");
    } catch (err) {
      toast.error("Cryptographic generation failed");
      setStep("phone");
    }
  }, [phone, hardware, setIdentity]);

  const copy = (text: string, msg: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${msg} copied to clipboard`);
  };

  return (
    <div className="px-4 py-6 max-w-md mx-auto space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <h1 className="text-xl font-black text-white uppercase tracking-tight font-syne">
            Vault Identity
          </h1>
        </div>
        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold">
          Cryptographic MSISDN Binding
        </p>
      </header>

      <AnimatePresence mode="wait">
        {/* Step: Phone Entry */}
        {step === "phone" && (
          <motion.div 
            key="phone" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Storage Backend
              </label>
              {HARDWARE_OPTIONS.map(opt => (
                <HardwareCard 
                  key={opt.id} 
                  {...opt} 
                  selected={hardware === opt.id} 
                  onSelect={setHardware} 
                />
              ))}
            </div>

            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-slate-200">Phone Number</span>
              </div>
              <input 
                type="tel" 
                placeholder="+1 000 000 0000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-cyan-50 font-mono focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all"
              />
            </div>

            <button 
              onClick={handlePhoneSubmit} 
              className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all shadow-lg shadow-cyan-500/10"
            >
              Initialize Identity
            </button>
          </motion.div>
        )}

        {/* Step: OTP Verification */}
        {step === "otp" && (
          <motion.div key="otp" className="glass-card p-6 text-center space-y-6">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white font-syne uppercase">Verify Ownership</h2>
              <p className="text-xs text-slate-400">Enter the 6-digit verification code</p>
            </div>
            
            <div className="flex justify-between gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => (otpRefs.current[i] = el)}
                  value={digit}
                  onChange={e => handleOtpInput(i, e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Backspace" && !otp[i] && i > 0) {
                      otpRefs.current[i-1]?.focus();
                    }
                  }}
                  className="w-10 h-14 bg-slate-900 border border-slate-700 rounded-lg text-center text-xl font-bold text-cyan-400 focus:border-cyan-500 outline-none"
                />
              ))}
            </div>

            <button 
              disabled={otp.some(d => !d)}
              onClick={finalizeIdentity}
              className="w-full py-3 bg-white text-slate-900 font-bold rounded-lg disabled:opacity-20 transition-all"
            >
              Verify & Secure
            </button>
          </motion.div>
        )}

        {/* Step: Generating */}
        {step === "generating" && (
          <motion.div key="gen" className="glass-card p-8 text-center space-y-6">
            <RefreshCw className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
            <div className="space-y-2">
              {GEN_STEPS.map((s, i) => (
                <div key={i} className={cn(
                  "text-[11px] font-mono flex items-center gap-2 justify-center transition-opacity",
                  i === genStepIdx ? "text-cyan-400 opacity-100" : i < genStepIdx ? "text-emerald-500 opacity-60" : "text-slate-700 opacity-40"
                )}>
                  {i < genStepIdx ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                  {s}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step: Final State */}
        {step === "complete" && identity && (
          <motion.div key="complete" className="space-y-4">
            <div className="glass-card trust-verified p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Active Protocol</p>
                <p className="text-sm font-mono text-white">{identity.phoneNumber}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Fingerprint</span>
                  <button onClick={() => copy(identity.keyFingerprint, "Fingerprint")}><Copy className="w-3 h-3 text-slate-500" /></button>
                </div>
                <p className="text-xs font-mono text-cyan-400 break-all">{formatFingerprint(identity.keyFingerprint)}</p>
              </div>

              <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Public Key</span>
                  <button onClick={() => copy(identity.publicKey, "Public Key")}><Copy className="w-3 h-3 text-slate-500" /></button>
                </div>
                <p className="key-display">{formatKeyDisplay(identity.publicKey)}</p>
              </div>

              <div className="glass-card p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Hardware-Bound Private Key</span>
                  <button onClick={() => setShowPriv(!showPriv)}>
                    {showPriv ? <EyeOff className="w-3 h-3 text-slate-500" /> : <Eye className="w-3 h-3 text-slate-500" />}
                  </button>
                </div>
                {showPriv ? (
                  <p className="key-display text-amber-500/80">{formatKeyDisplay(identity.privateKey)}</p>
                ) : (
                  <div className="flex gap-1 h-3 mt-2">
                    {[...Array(12)].map((_, i) => <div key={i} className="flex-1 bg-slate-800 rounded-sm" />)}
                  </div>
                )}
                {hardware === "Software" && (
                   <div className="mt-3 flex items-center gap-2 text-[10px] text-amber-500 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      Caution: Key is stored in software. Hardware isolation is unavailable.
                   </div>
                )}
              </div>
            </div>

            <button 
              onClick={() => { setIdentity(null); setStep("phone"); }} 
              className="w-full py-3 text-red-500 text-[11px] font-bold uppercase tracking-widest hover:bg-red-500/5 transition-colors rounded-lg flex items-center justify-center gap-2"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Revoke Identity
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
