import { useLocation } from "wouter";
import { Shield, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [, navigate] = useLocation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mb-4">
        <Shield className="w-8 h-8 text-slate-600" />
      </div>
      <h1 className="text-2xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>404</h1>
      <p className="text-sm text-slate-400 mb-6">Page not found</p>
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400/10 border border-cyan-400/20 text-cyan-400 text-sm font-medium hover:bg-cyan-400/20 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Overview
      </button>
    </div>
  );
}
