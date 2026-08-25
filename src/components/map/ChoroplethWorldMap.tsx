'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { geoMercator, geoPath } from 'd3-geo';
import { Minus, Plus, RotateCcw } from 'lucide-react';
import {
  CountryRecord,
  METRICS,
  MetricId,
  colorForValue,
  getMetricValue,
  legendStops,
} from '@/lib/choroplethMetrics';

export interface CountryProperties {
  name: string;
  iso: string;
  continent?: string;
  region?: string;
}

export interface CountryFeature {
  type: 'Feature';
  id?: string | number;
  properties: CountryProperties;
  geometry: object;
}

export interface WorldCollection {
  type: 'FeatureCollection';
  features: CountryFeature[];
}

interface ChoroplethWorldMapProps {
  world: WorldCollection | null;
  metricId: MetricId;
  selectedIso: string | null;
  onSelect: (feature: CountryFeature | null) => void;
  recordsByIso: Map<string, CountryRecord>;
}

const MIN_K = 1;
const MAX_K = 10;

export function ChoroplethWorldMap({
  world,
  metricId,
  selectedIso,
  onSelect,
  recordsByIso,
}: ChoroplethWorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const transformRef = useRef({ x: 0, y: 0, k: 1 });
  const [size, setSize] = useState({ width: 960, height: 560 });
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [hover, setHover] = useState<{
    iso: string;
    name: string;
    clientX: number;
    clientY: number;
  } | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    moved: boolean;
  } | null>(null);

  const metric = METRICS.find(m => m.id === metricId)!;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({
        width: Math.max(320, Math.floor(width)),
        height: Math.max(360, Math.floor(height)),
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const drawable = useMemo(() => {
    if (!world) return null;
    return {
      type: 'FeatureCollection' as const,
      features: world.features.filter(f => f.properties.iso !== 'ATA'),
    };
  }, [world]);

  const projection = useMemo(() => {
    const proj = geoMercator();
    if (drawable) {
      proj.fitExtent(
        [
          [24, 16],
          [size.width - 24, size.height - 28],
        ],
        drawable as Parameters<typeof proj.fitExtent>[1]
      );
    }
    return proj;
  }, [drawable, size.width, size.height]);

  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const paths = useMemo(() => {
    if (!drawable) return [];
    return drawable.features.map(feature => ({
      feature,
      d: pathGen(feature as Parameters<typeof pathGen>[0]) || '',
    }));
  }, [drawable, pathGen]);

  const sortedValues = useMemo(() => {
    const values: number[] = [];
    recordsByIso.forEach(record => values.push(getMetricValue(record, metricId)));
    return values.sort((a, b) => a - b);
  }, [recordsByIso, metricId]);

  const stops = useMemo(
    () => legendStops(sortedValues, metric.colors, metric.invert, metric.format),
    [sortedValues, metric]
  );

  const applyZoom = useCallback((nextK: number, originX: number, originY: number) => {
    setTransform(prev => {
      const k = Math.min(MAX_K, Math.max(MIN_K, nextK));
      const scale = k / prev.k;
      let x = originX - (originX - prev.x) * scale;
      let y = originY - (originY - prev.y) * scale;
      if (k === MIN_K) {
        x = 0;
        y = 0;
      }
      const next = { x, y, k };
      transformRef.current = next;
      return next;
    });
  }, []);

  const resetView = useCallback(() => {
    const next = { x: 0, y: 0, k: 1 };
    transformRef.current = next;
    setTransform(next);
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheelNative = (event: WheelEvent) => {
      event.preventDefault();
      const rect = svg.getBoundingClientRect();
      const ox = event.clientX - rect.left;
      const oy = event.clientY - rect.top;
      const factor = event.deltaY > 0 ? 0.9 : 1.12;
      applyZoom(transformRef.current.k * factor, ox, oy);
    };
    svg.addEventListener('wheel', onWheelNative, { passive: false });
    return () => svg.removeEventListener('wheel', onWheelNative);
  }, [applyZoom, world, size.width, size.height]);

  const onPointerDown = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      origX: transformRef.current.x,
      origY: transformRef.current.y,
      moved: false,
    };
  }, []);

  const onPointerMove = useCallback((event: React.PointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) <= 3) return;
    drag.moved = true;
    const next = { x: drag.origX + dx, y: drag.origY + dy, k: transformRef.current.k };
    transformRef.current = next;
    setTransform(next);
  }, []);

  const endDrag = useCallback(
    (event: React.PointerEvent<SVGSVGElement>) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== event.pointerId) return;
      dragRef.current = null;

      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      // Pointer capture on the SVG swallows path click targets; hit-test instead.
      if (drag.moved) return;
      const hit = document
        .elementsFromPoint(event.clientX, event.clientY)
        .find(el => el instanceof SVGPathElement && el.dataset.iso);
      if (!(hit instanceof SVGPathElement) || !hit.dataset.iso) {
        onSelect(null);
        return;
      }
      const iso = hit.dataset.iso;
      const feature = paths.find(p => p.feature.properties.iso === iso)?.feature;
      if (!feature) return;
      if (selectedIso === iso) onSelect(null);
      else onSelect(feature);
    },
    [onSelect, paths, selectedIso]
  );

  const tooltipRecord = hover ? recordsByIso.get(hover.iso) ?? null : null;

  return (
    <div
      ref={containerRef}
      className="relative h-full min-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-[#d7ebe7] shadow-inner"
    >
      {!world && (
        <div className="absolute inset-0 grid place-items-center text-sm text-slate-500 z-10">
          Loading world boundaries…
        </div>
      )}

      <svg
        ref={svgRef}
        width={size.width}
        height={size.height}
        viewBox={`0 0 ${size.width} ${size.height}`}
        className="block w-full h-full cursor-grab active:cursor-grabbing touch-none"
        role="img"
        aria-label="Choropleth world map of FreshMart sourcing metrics"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <rect width={size.width} height={size.height} fill="#d7ebe7" />
        <g transform={`translate(${transform.x} ${transform.y}) scale(${transform.k})`}>
          {paths.map(({ feature, d }) => {
            const iso = feature.properties.iso;
            const record = recordsByIso.get(iso) ?? null;
            const value = record ? getMetricValue(record, metricId) : null;
            const fill = colorForValue(value, sortedValues, metric.colors, metric.invert);
            const isSelected = selectedIso === iso;
            const isHovered = hover?.iso === iso;
            return (
              <path
                key={iso}
                data-iso={iso}
                d={d}
                fill={fill}
                stroke={isSelected ? '#064e3b' : isHovered ? '#047857' : '#f8fafc'}
                strokeWidth={(isSelected ? 1.6 : isHovered ? 1.1 : 0.4) / transform.k}
                className="transition-[fill,stroke] duration-300 ease-out"
                style={{ cursor: 'pointer' }}
                onMouseEnter={event => {
                  setHover({
                    iso,
                    name: feature.properties.name,
                    clientX: event.clientX,
                    clientY: event.clientY,
                  });
                }}
                onMouseMove={event => {
                  setHover(prev =>
                    prev
                      ? { ...prev, clientX: event.clientX, clientY: event.clientY }
                      : {
                          iso,
                          name: feature.properties.name,
                          clientX: event.clientX,
                          clientY: event.clientY,
                        }
                  );
                }}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </g>
      </svg>

      {hover && (
        <div
          className="pointer-events-none fixed z-50 min-w-[180px] rounded-xl border border-slate-200 bg-slate-900/95 px-3 py-2 text-white shadow-xl"
          style={{
            left: Math.min(hover.clientX + 14, typeof window !== 'undefined' ? window.innerWidth - 220 : hover.clientX),
            top: Math.min(hover.clientY + 14, typeof window !== 'undefined' ? window.innerHeight - 90 : hover.clientY),
          }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">{hover.iso}</div>
          <div className="text-sm font-black leading-tight">{hover.name}</div>
          <div className="mt-1 text-xs text-slate-200">
            {tooltipRecord ? metric.format(getMetricValue(tooltipRecord, metricId)) : 'No sample data'}
          </div>
        </div>
      )}

      <div className="absolute left-3 top-3 z-10 max-w-[min(100%-5.5rem,20rem)] pointer-events-none">
        <div className="rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-md px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">{metric.label}</p>
            <p className="text-[10px] text-slate-400 shrink-0">
              {metric.invert ? 'Lower is better' : 'Higher is richer'}
            </p>
          </div>
          <div className="mt-2 flex h-3 overflow-hidden rounded-full ring-1 ring-slate-200">
            {stops.map(stop => (
              <span key={stop.color} className="flex-1" style={{ background: stop.color }} title={stop.label} />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between gap-2 text-[10px] font-semibold text-slate-600">
            <span className="truncate">{stops[0]?.label}</span>
            <span className="truncate text-right">{stops[stops.length - 1]?.label}</span>
          </div>
          <p className="mt-1.5 text-[10px] text-slate-500 flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-slate-200 border border-slate-300 shrink-0" />
            No partnership data
          </p>
        </div>
      </div>

      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        <ZoomButton
          label="Zoom in"
          onClick={() => applyZoom(transform.k * 1.35, size.width / 2, size.height / 2)}
        >
          <Plus className="w-4 h-4" />
        </ZoomButton>
        <ZoomButton
          label="Zoom out"
          onClick={() => applyZoom(transform.k * 0.75, size.width / 2, size.height / 2)}
        >
          <Minus className="w-4 h-4" />
        </ZoomButton>
        <ZoomButton label="Reset view" onClick={resetView}>
          <RotateCcw className="w-4 h-4" />
        </ZoomButton>
      </div>
    </div>
  );
}

function ZoomButton({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-9 h-9 grid place-items-center rounded-xl bg-white/95 border border-slate-200 shadow-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
    >
      {children}
    </button>
  );
}
