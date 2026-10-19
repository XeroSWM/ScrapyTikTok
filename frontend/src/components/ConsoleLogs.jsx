import React, { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

export default function ConsoleLogs({ logs }) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <div className="bg-[#0e1422] border border-slate-800 rounded-2xl flex flex-col h-80 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-xs font-mono text-slate-400 ml-2 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5" /> Playwright DevTools Protocol & Anti-Bot Stepper
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">playwright.async_api</span>
      </div>

      <div className="p-4 font-mono text-xs overflow-y-auto space-y-2 flex-1 bg-black/40 text-slate-300">
        {logs.length === 0 ? (
          <p className="text-slate-600 italic">No hay tareas de extracción en curso...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="leading-relaxed">
              <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span> {log}
            </div>
          ))
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}