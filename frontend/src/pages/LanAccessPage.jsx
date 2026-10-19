import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { 
  Wifi, Copy, Check, Smartphone, Monitor, ArrowRightLeft, 
  HelpCircle, Terminal, CheckCircle2, AlertCircle 
} from "lucide-react";

export default function LanAccessPage({ lanIp, lanPort, setLanIp, setLanPort }) {
  const [copied, setCopied] = useState(false);
  const [activeOsTab, setActiveOsTab] = useState("windows"); // "windows" | "mac" | "linux"

  const targetUrl = `http://${lanIp}:${lanPort}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(targetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presetIps = ["192.168.1.15", "192.168.0.24", "10.0.0.12"];
  const presetPorts = ["8000", "5173", "3000"];

  return (
    <div className="space-y-6">
      {/* Banner Informativo LAN */}
      <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Wifi className="w-3.5 h-3.5" />
              <span>Módulo de Acceso Móvil Local (LAN)</span>
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              ¿Cómo acceder desde el móvil sin compilar una App nativa?
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tus compañeros no necesitaron subir nada a la Play Store o App Store. Simplemente vincularon el servidor a todas las interfaces de red (<code className="text-cyan-400 font-mono bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">0.0.0.0</code>), obtuvieron la IP local asignada por el Wi-Fi (<code className="text-cyan-400 font-mono bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">{lanIp}</code>) y generaron este código QR para abrir el navegador móvil en 1 segundo.
            </p>
          </div>

          {/* Diagrama Conceptual de Conexión */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl flex items-center justify-around gap-4 shrink-0 min-w-[280px]">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-400">
                <Monitor className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-300">Servidor PC</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <span className="text-[10px] text-cyan-400 font-mono font-semibold">Mismo Wi-Fi</span>
              <ArrowRightLeft className="w-4 h-4 text-slate-500" />
            </div>

            <div className="flex flex-col items-center gap-1.5 text-center">
              <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-rose-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-slate-300">Celular (Web)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Código QR y Configuración de Red */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* Contenedor del Código QR */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between text-center shadow-xl">
          <div className="w-full flex items-center justify-between border-b border-slate-800/80 pb-3">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Código QR Activo</span>
            <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> LAN Ready
            </span>
          </div>

          <div className="my-6 p-4 bg-white rounded-2xl shadow-2xl border-4 border-slate-800">
            <QRCodeSVG value={targetUrl} size={220} level="M" />
          </div>

          <div className="w-full space-y-3">
            <div className="flex items-center justify-between gap-2 bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800">
              <span className="text-xs font-mono text-cyan-400 truncate">{targetUrl}</span>
              <button
                type="button"
                onClick={copyUrl}
                className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-900 rounded"
                title="Copiar URL"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Apunta la cámara de tu smartphone hacia el código para abrir la app web móvil.
            </p>
          </div>
        </div>

        {/* Panel de Configuración de IP & Puerto */}
        <div className="bg-[#0e1422] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl space-y-5">
          <div className="space-y-4">
            <div className="border-b border-slate-800/80 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wifi className="w-4 h-4 text-cyan-400" />
                <span>Configurador de Dirección IP & Puerto</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Personaliza la IP de tu tarjeta de red para generar el QR exacto de tu entorno:
              </p>
            </div>

            {/* Inputs de IP y Puerto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                  Dirección IP Local (Wi-Fi)
                </label>
                <input
                  type="text"
                  value={lanIp}
                  onChange={(e) => setLanIp(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-white font-mono text-sm focus:outline-none transition shadow-inner"
                />
                {/* Presets de IPs habituales */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {presetIps.map((ip) => (
                    <button
                      key={ip}
                      type="button"
                      onClick={() => setLanIp(ip)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition"
                    >
                      {ip}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 font-semibold block mb-1.5">
                  Puerto Servidor
                </label>
                <input
                  type="text"
                  value={lanPort}
                  onChange={(e) => setLanPort(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl text-white font-mono text-sm focus:outline-none transition shadow-inner"
                />
                {/* Presets de Puertos */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {presetPorts.map((port) => (
                    <button
                      key={port}
                      type="button"
                      onClick={() => setLanPort(port)}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300 transition"
                    >
                      :{port}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Guía Multi-Plataforma en terminal */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>¿Cómo averiguar tu IP en tu computadora?</span>
              </span>

              <div className="flex items-center gap-1 text-[11px]">
                {["windows", "mac", "linux"].map((os) => (
                  <button
                    key={os}
                    type="button"
                    onClick={() => setActiveOsTab(os)}
                    className={`px-2 py-0.5 rounded uppercase font-semibold transition ${
                      activeOsTab === os 
                        ? "bg-cyan-500 text-slate-950" 
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {os}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-400 space-y-2">
              {activeOsTab === "windows" && (
                <>
                  <p className="text-slate-500"># 1. Ejecuta en PowerShell o CMD:</p>
                  <p className="text-cyan-400">$ ipconfig</p>
                  <p className="text-slate-500">↳ Busca la línea: "Dirección IPv4 . . . : 192.168.X.X"</p>
                </>
              )}
              {activeOsTab === "mac" && (
                <>
                  <p className="text-slate-500"># 1. Ejecuta en Terminal de macOS:</p>
                  <p className="text-cyan-400">$ ipconfig getifaddr en0</p>
                  <p className="text-slate-500">↳ Imprimirá directamente tu IP privada asignada.</p>
                </>
              )}
              {activeOsTab === "linux" && (
                <>
                  <p className="text-slate-500"># 1. Ejecuta en Terminal Bash:</p>
                  <p className="text-cyan-400">$ hostname -I | awk '&#123;print $1&#125;'</p>
                  <p className="text-slate-500">↳ Muestra la primera IP asignada a tu tarjeta.</p>
                </>
              )}
              <div className="border-t border-slate-800/80 pt-2 text-[11px]">
                <p className="text-slate-500"># 2. Inicia tu backend escuchando en 0.0.0.0 (NO 127.0.0.1):</p>
                <p className="text-emerald-400">$ uvicorn main:app --host 0.0.0.0 --port 8000</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}