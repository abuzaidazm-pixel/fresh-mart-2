'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Globe2, Leaf, Search } from 'lucide-react';
import {
  ChoroplethWorldMap,
  CountryFeature,
  WorldCollection,
} from '@/components/map/ChoroplethWorldMap';
import { CountryDetailPanel } from '@/components/map/CountryDetailPanel';
import {
  CountryRecord,
  METRICS,
  MetricId,
  buildCountryRecord,
} from '@/lib/choroplethMetrics';

export default function InsightsMapPage() {
  const [world, setWorld] = useState<WorldCollection | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [metricId, setMetricId] = useState<MetricId>('partnerFarms');
  const [selected, setSelected] = useState<CountryFeature | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetch('/data/world-countries.json')
      .then(res => {
        if (!res.ok) throw new Error('Could not load country boundaries');
        return res.json();
      })
      .then((json: WorldCollection) => {
        if (!cancelled) setWorld(json);
      })
      .catch(err => {
        if (!cancelled) setLoadError(err instanceof Error ? err.message : 'Failed to load map');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const recordsByIso = useMemo(() => {
    const map = new Map<string, CountryRecord>();
    world?.features.forEach(feature => {
      const record = buildCountryRecord(feature.properties.iso, feature.properties.continent);
      if (record) map.set(feature.properties.iso, record);
    });
    return map;
  }, [world]);

  const records = useMemo(() => Array.from(recordsByIso.values()), [recordsByIso]);

  const searchHits = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !world) return [];
    return world.features
      .filter(f => {
        const { name, iso, continent, region } = f.properties;
        return [name, iso, continent, region].some(v => v?.toLowerCase().includes(q));
      })
      .slice(0, 8);
  }, [query, world]);

  const selectedRecord = selected ? recordsByIso.get(selected.properties.iso) ?? null : null;

  return (
    <div className="bg-slate-50">
      <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-10 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/70 border border-emerald-500/30 text-emerald-100 text-[11px] font-bold uppercase tracking-wider">
              <Globe2 className="w-3.5 h-3.5" />
              Sample sourcing intelligence
            </div>
            <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Where FreshMart&apos;s food comes from
            </h1>
            <p className="mt-2 text-sm sm:text-base text-emerald-100/85 leading-relaxed">
              A choropleth of partner countries colored by the metric you choose. Hover for a tooltip,
              click for a full origin dossier, and pan or zoom to inspect a region.
            </p>
          </div>
          <div className="flex items-center gap-3 text-emerald-100">
            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-center">
              <div className="text-2xl font-black">{records.length}</div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-200">Origins with data</div>
            </div>
            <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-center">
              <div className="text-2xl font-black">{METRICS.length}</div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-200">Switchable metrics</div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
        <div className="flex flex-col xl:flex-row gap-3 xl:items-center justify-between">
          <div
            role="tablist"
            aria-label="Sourcing metric"
            className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-white border border-slate-200 shadow-sm"
          >
            {METRICS.map(metric => {
              const active = metric.id === metricId;
              return (
                <button
                  key={metric.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setMetricId(metric.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {metric.shortLabel}
                </button>
              );
            })}
          </div>

          <div className="relative w-full xl:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Find a country…"
              className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {query.trim() && (
              <div className="absolute z-20 mt-1 w-full rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
                {searchHits.length === 0 ? (
                  <p className="px-3 py-3 text-xs text-slate-500">No matching countries.</p>
                ) : (
                  searchHits.map(feature => (
                    <button
                      key={feature.properties.iso}
                      type="button"
                      onClick={() => {
                        setSelected(feature);
                        setQuery('');
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm hover:bg-emerald-50 flex items-center justify-between"
                    >
                      <span className="font-semibold text-slate-800">{feature.properties.name}</span>
                      <span className="text-[11px] font-mono text-slate-400">{feature.properties.iso}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-500 flex items-start gap-1.5">
          <Leaf className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
          <span>
            {METRICS.find(m => m.id === metricId)?.description} Values are sample data for this demo.
          </span>
        </p>

        {loadError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            {loadError}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-4 items-stretch">
          <div className="min-h-[560px] h-[min(70vh,720px)]">
            <ChoroplethWorldMap
              world={world}
              metricId={metricId}
              selectedIso={selected?.properties.iso ?? null}
              onSelect={setSelected}
              recordsByIso={recordsByIso}
            />
          </div>
          <div className="min-h-[420px] lg:min-h-0 lg:h-[min(70vh,720px)]">
            <CountryDetailPanel
              meta={
                selected
                  ? {
                      name: selected.properties.name,
                      continent: selected.properties.continent,
                      region: selected.properties.region,
                    }
                  : null
              }
              record={selectedRecord}
              records={records}
              metricId={metricId}
              onClose={() => setSelected(null)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
