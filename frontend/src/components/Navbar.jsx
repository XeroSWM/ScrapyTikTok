import React from "react";
import { Wifi, Smartphone } from "lucide-react";

export default function Navbar({ lanIp, lanPort, onOpenMobile }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-rose-950/40">
          TT
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">TikTok Scraper</h1>
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
              LAN & QR Suite
            </span>
          </div>
          <p className="text-xs text-slate-400">Extracción sin API • FastAPI + Playwright Stealth • Acceso Wi-Fi Local</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-cyan-400 font-mono">
          <Wifi className="w-3.5 h-3.5" />
          <span>LAN: {lanIp}:{lanPort}</span>
        </div>
        <button
          onClick={onOpenMobile}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition border border-slate-700"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Simulador Celular</span>
        </button>
      </div>
    </header>
  );
}