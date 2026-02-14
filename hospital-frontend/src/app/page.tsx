"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, Search, Plus, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const [templates, setTemplates] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.templates) {
          setTemplates(data.templates);
        }
        setLoading(false);
      });
  }, []);

  const filteredTemplates = templates.filter((t) =>
    t.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B]">
      {/* Header */}
      <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-200">
              <FileText size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Hospital<span className="text-blue-600">Sync</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors">
              Documentation
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-[#1E293B] px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-all shadow-md">
              <Plus size={18} />
              New Patient
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto py-10 px-4">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-[#0F172A]">Templates Library</h2>
            <p className="mt-2 text-slate-500">Select a form template to start filling patient details.</p>
          </div>
          <div className="flex w-full max-w-md items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none ring-blue-500 focus:ring-2 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl bg-white shadow-sm border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates.map((template) => (
              <Link
                key={template}
                href={`/editor/${encodeURIComponent(template)}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-blue-100"
              >
                <div className="mb-4 flex aspect-[3/4] items-center justify-center rounded-xl bg-slate-50 group-hover:bg-blue-50 transition-colors">
                  <FileText className="text-slate-300 group-hover:text-blue-300 transition-colors" size={64} />
                </div>
                <div>
                  <h3 className="line-clamp-2 font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                    {template.replace(".html", "").replace(/^\d+\.\s*/, "")}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>HTML Template</span>
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                      Standard
                    </span>
                  </div>
                </div>
              </Link>
            ))}
            
            {filteredTemplates.length === 0 && (
              <div className="col-span-full py-20 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-300">
                  <Search size={40} />
                </div>
                <h3 className="text-lg font-medium">No templates found</h3>
                <p className="text-slate-500">Try adjusting your search to find what you're looking for.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
