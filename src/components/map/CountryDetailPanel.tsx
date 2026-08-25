'use client';

import React from 'react';
import { Award, Leaf, Timer, TrendingDown, TrendingUp, Warehouse, Wheat, X } from 'lucide-react';
import {
  CountryRecord,
  METRICS,
  MetricId,
  getMetricValue,
  rankForMetric,
} from '@/lib/choroplethMetrics';

interface CountryMeta {
  name: string;
  continent?: string;
  region?: string;
}

interface CountryDetailPanelProps {
  meta: CountryMeta | null;
  record: CountryRecord | null;
  records: CountryRecord[];
  metricId: MetricId;
  onClose: () => void;
}

export function CountryDetailPanel({
  meta,
  record,
  records,
  metricId,
  onClose,
}: CountryDetailPanelProps) {
  if (!meta) {
    return (
      <aside className="h-full rounded-2xl border border-slate-200 bg-white/90 shadow-sm p-6 flex flex-col justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700">
            Country dossier
          </p>
          <h2 className="mt-2 text-xl font-black text-slate-900 tracking-tight">
            Select a country
          </h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Hover for a quick readout, then click a country to pin its sourcing profile here — farms,
            organic share, inbound tonnes, freshness, and lead time.
          </p>
        </div>
        <ul className="space-y-2 text-xs text-slate-500">
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            Scroll or pinch to zoom; drag to pan the globe.
          </li>
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            Use the metric switcher to recolor every country instantly.
          </li>
          <li className="flex gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
            Grey countries have no sample partnership data.
          </li>
        </ul>
      </aside>
    );
  }

  const activeMetric = METRICS.find(m => m.id === metricId)!;
  const rank = record ? rankForMetric(records, record.iso, metricId) : null;
  const yoyUp = (record?.yoyChange ?? 0) >= 0;

  return (
    <aside className="h-full rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-br from-emerald-900 to-teal-800 text-white relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white"
          aria-label="Clear selected country"
        >
          <X className="w-4 h-4" />
        </button>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-200">
          {meta.region || meta.continent || 'Origin'}
        </p>
        <h2 className="mt-1 pr-8 text-2xl font-black tracking-tight leading-tight">{meta.name}</h2>
        <p className="mt-1 text-xs text-emerald-100/80 font-mono">{record?.iso ?? '—'}</p>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {!record ? (
          <p className="text-sm text-slate-500">
            FreshMart has no sample sourcing contract on file for this territory. It stays uncolored
            on the map.
          </p>
        ) : (
          <>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    {activeMetric.label}
                  </p>
                  <p className="text-2xl font-black text-slate-900 mt-0.5">
                    {activeMetric.format(getMetricValue(record, metricId))}
                  </p>
                </div>
                {rank != null && (
                  <div className="text-right">
                    <p className="text-[10px] font-bold uppercase text-slate-400">Rank</p>
                    <p className="text-lg font-black text-emerald-800">
                      #{rank}
                      <span className="text-xs font-semibold text-slate-400"> / {records.length}</span>
                    </p>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">{activeMetric.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Stat
                icon={<Warehouse className="w-3.5 h-3.5" />}
                label="Partner farms"
                value={record.partnerFarms.toLocaleString()}
              />
              <Stat
                icon={<Leaf className="w-3.5 h-3.5" />}
                label="Organic share"
                value={`${record.organicShare}%`}
              />
              <Stat
                icon={<Wheat className="w-3.5 h-3.5" />}
                label="Inbound volume"
                value={`${record.exportVolume.toLocaleString()} t`}
              />
              <Stat
                icon={<Award className="w-3.5 h-3.5" />}
                label="Freshness"
                value={`${record.freshnessScore}/100`}
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Timer className="w-4 h-4 text-slate-400" />
                <span>Avg. lead time</span>
              </div>
              <span className="text-sm font-black text-slate-900">{record.leadTimeDays.toFixed(1)} days</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                {yoyUp ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-500" />
                )}
                <span>Year-over-year volume</span>
              </div>
              <span className={`text-sm font-black ${yoyUp ? 'text-emerald-700' : 'text-rose-600'}`}>
                {yoyUp ? '+' : ''}
                {record.yoyChange.toFixed(1)}%
              </span>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Specialty crops</p>
              <p className="mt-1 text-sm font-semibold text-slate-800">{record.specialty}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sourcing note</p>
              <p className="mt-1 text-sm text-slate-600 leading-relaxed">{record.note}</p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <span className="text-emerald-700">{icon}</span>
        {label}
      </div>
      <div className="mt-1 text-sm font-black text-slate-900">{value}</div>
    </div>
  );
}
