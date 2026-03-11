import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, MessageSquare, User, Users, Network, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCVTStore } from "@/lib/cvtStore";

const navItems = [
  { path: "/", icon: Shield, label: "Overview" },
  { path: "/messages", icon: MessageSquare, label: "Messages" },
  { path: "/identity", icon: User, label: "Identity" },
  { path: "/contacts", icon: Users, label: "Contacts" },
  { path: "/architecture", icon: Network, label: "Protocol" },
];

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [location, navigate] = useLocation();
  const { identity } = useCVTStore();

  return (
    <div className="w-full h-[100dvh] mesh-bg flex items-center justify-center">
      {/* Desktop background decoration */}
      <div className="hidden md:block fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-400/3 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-emerald-400/3 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-400/2 blur-3xl" />
      </div>

      {/* Desktop: phone frame wrapper */}
      <div className="md:relative md:w-[390px] md:h-[844px] md:rounded-[44px] md:overflow-hidden md:shadow-2xl md:border md:border-white/10 w-full h-[100dvh]">
        {/* Phone notch (desktop only) */}
        <div className="hidden md:flex absolute top-0 left-1/2 -translate-x-1/2 z-50 items-center justify-center w-32 h-7 bg-[#050B18] rounded-b-2xl">
          <div className="w-16 h-1.5 rounded-full bg-slate-800" />
        </div>

        {/* App container */}
        <div
          className="relative flex flex-col w-full h-full"
          style={{
            background: 'linear-gradient(160deg, #050B18 0%, #0A1628 60%, #050B18 100%)',
          }}
        >
          {/* Status Bar */}
          <div className="status-bar px-5 pt-3 md:pt-8 pb-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <div className={cn(
                "w-2 h-2 rounded-full shrink-0",
                identity ? "signal-dot" : "bg-amber-500"
              )} style={identity ? {} : { background: '#F59E0B' }} />
              <span className="text-[11px] font-mono text-slate-400 tracking-wide">
                {identity ? "CVT SECURED" : "NOT VERIFIED"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-cyan-400/60" />
              <span className="text-[11px] font-mono text-slate-500">Ed25519</span>
            </div>
          </div>

          {/* Page Content — scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto" style={{ paddingBottom: '80px' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom Navigation */}
          <nav
            className="shrink-0 border-t border-white/6 md:relative fixed bottom-0 left-0 right-0 md:static w-full md:w-auto"
            style={{
              background: 'rgba(5, 11, 24, 0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
            }}
          >
            <div className="flex items-center justify-around px-2 py-2 pb-safe">
              {navItems.map(({ path, icon: Icon, label }) => {
                const isActive = location === path;
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={cn(
                      "flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all duration-200 min-w-[52px]",
                      isActive ? "text-cyan-400" : "text-slate-600 hover:text-slate-400"
                    )}
                  >
                    <div className={cn(
                      "relative p-1.5 rounded-xl transition-all duration-200",
                      isActive && "bg-cyan-400/10"
                    )}>
                      <Icon className="w-[18px] h-[18px]" />
                      {isActive && (
                        <motion.div
                          layoutId="navIndicator"
                          className="absolute inset-0 rounded-xl bg-cyan-400/10 border border-cyan-400/20"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                    </div>
                    <span className={cn(
                      "text-[9px] font-medium transition-all duration-200 leading-none",
                      isActive ? "text-cyan-400" : "text-slate-700"
                    )}>
                      {label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      {/* Desktop side info panel */}
      <div className="hidden lg:flex flex-col gap-4 ml-8 max-w-xs h-[100dvh] overflow-y-auto pb-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
              CVT Protocol
            </h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            A zero-trust communication protocol that binds phone numbers to hardware-backed Ed25519 key pairs.
          </p>
        </div>
        <div className="glass-card p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Security Stack</p>
          <div className="space-y-1.5">
            {[
              { label: "Signatures", value: "Ed25519" },
              { label: "Encryption", value: "XSalsa20" },
              { label: "Discovery", value: "SHA-256" },
              { label: "Transport", value: "WSS / TLS 1.3" },
              { label: "Hardware", value: "Secure Enclave" },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center">
                <span className="text-xs text-slate-500">{item.label}</span>
                <span className="text-xs font-mono text-cyan-400">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card p-4 pb-6">
          <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Repository</p>
          <a
            href="https://github.com/Jimmyu2foru18/SSL-TLS-E2EE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
          >
            github.com/Jimmyu2foru18/<br />SSL-TLS-E2EE
          </a>
        </div>
      </div>
    </div>
  );