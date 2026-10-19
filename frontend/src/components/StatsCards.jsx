import React from "react";

export default function StatsCards({ profile }) {
  const cards = [
    { label: "Seguidores", value: profile?.followers || "0", color: "text-white" },
    { label: "Likes Totales", value: profile?.likes || "0", color: "text-rose-400" },
    { label: "Videos Totales", value: profile?.videosCount || "0", color: "text-white" },
    { label: "Tasa Engagement", value: profile?.engagement || "N/A", color: "text-emerald-400" },
    { label: "Vistas Promedio", value: profile?.avgViews || "N/A", color: "text-amber-400" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-[#0e1422] border border-slate-800 rounded-xl p-4 shadow-lg">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{c.label}</p>
          <p className={`text-xl font-black mt-1 ${c.color}`}>{c.value}</p>
        </div>
      ))}
    </div>
  );
}