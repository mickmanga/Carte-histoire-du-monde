import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownUp, ChevronRight } from 'lucide-react';
import { ERAS, getCountryNeighbors } from '../data';
import { CountryHistory, Era } from '../types/history';

interface CountryTimelinePanelProps {
  country: CountryHistory;
  onSelectCountry: (country: CountryHistory) => void;
}

export const CountryTimelinePanel: React.FC<CountryTimelinePanelProps> = ({
  country,
  onSelectCountry,
}) => {
  const [selectedEra, setSelectedEra] = useState<'Toutes' | Era>('Toutes');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSelectedEra('Toutes');
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [country.id]);

  const availableEras = useMemo(() => {
    const present = new Set(country.facts.map((f) => f.era));
    return ERAS.filter((era) => present.has(era));
  }, [country.facts]);

  const displayedFacts = useMemo(() => {
    const base =
      selectedEra === 'Toutes'
        ? country.facts
        : country.facts.filter((f) => f.era === selectedEra);
    return [...base].sort((a, b) => (sortOrder === 'asc' ? a.year - b.year : b.year - a.year));
  }, [country.facts, selectedEra, sortOrder]);

  const neighbors = useMemo(() => getCountryNeighbors(country, 5), [country]);

  const coordLabel = useMemo(() => {
    const [lon, lat] = country.coordinates;
    const latDir = lat >= 0 ? 'N' : 'S';
    const lonDir = lon >= 0 ? 'E' : 'O';
    return `${Math.abs(lat).toFixed(1)}° ${latDir}, ${Math.abs(lon).toFixed(1)}° ${lonDir}`;
  }, [country.coordinates]);

  return (
    <aside
      aria-label={`Chronologie historique : ${country.nameFr}`}
      ref={scrollRef}
      className="flex flex-col h-full bg-[#FDFCF9] overflow-y-auto editorial-scroll"
    >
      {/* En-tête éditorial du pays */}
      <div className="px-6 pt-6 pb-5 border-b border-[#E8E2D5]">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#78716C] tracking-wide">
          <span className="font-medium text-[#9A3412]">{country.continent}</span>
          <span aria-hidden="true">·</span>
          <span>{country.region}</span>
          <span aria-hidden="true">·</span>
          <span>Capitale : {country.capital}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono tabular-nums">{coordLabel}</span>
        </div>

        <h1 className="mt-2.5 font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] leading-tight text-balance">
          {country.nameFr}
        </h1>
        <p className="mt-0.5 text-sm italic text-[#6E675F]">
          {country.officialNameFr}
        </p>

        <p className="mt-4 text-[15px] text-[#3F3A36] leading-relaxed max-w-prose">
          {country.summary}
        </p>

        {/* Barre d'outils chronologique */}
        <div className="mt-5 pt-4 border-t border-[#EFEAE0] flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#57534E] font-mono tabular-nums">
            {displayedFacts.length}{' '}
            {displayedFacts.length > 1 ? 'repères chronologiques' : 'repère chronologique'}
          </div>

          <button
            type="button"
            onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#57534E] hover:text-[#1C1917] px-2.5 py-1.5 rounded-md border border-[#DDD6C8] bg-[#F7F4EC] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <ArrowDownUp className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {sortOrder === 'asc' ? 'Chronologique (ancien → récent)' : 'Inversé (récent → ancien)'}
            </span>
          </button>
        </div>

        {/* Filtre par grande ère */}
        {availableEras.length > 1 && (
          <div
            role="tablist"
            aria-label="Filtrer par période historique"
            className="mt-3 flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedEra === 'Toutes'}
              onClick={() => setSelectedEra('Toutes')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                selectedEra === 'Toutes'
                  ? 'bg-[#1C1917] text-[#FDFCF9]'
                  : 'bg-[#F3EFE6] text-[#57534E] hover:text-[#1C1917]'
              }`}
            >
              Toutes les époques
            </button>
            {availableEras.map((era) => {
              const active = selectedEra === era;
              return (
                <button
                  key={era}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedEra(era)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#1C1917] text-[#FDFCF9]'
                      : 'bg-[#F3EFE6] text-[#57534E] hover:text-[#1C1917]'
                  }`}
                >
                  {era}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Frise chronologique des faits historiques */}
      <div className="px-6 py-6 flex-1">
        <ol className="relative space-y-0">
          {displayedFacts.map((fact, idx) => {
            const isLast = idx === displayedFacts.length - 1;
            return (
              <li
                key={`${country.id}-${fact.year}-${fact.title}`}
                className={`relative grid grid-cols-[88px_1fr] sm:grid-cols-[106px_1fr] gap-4 ${
                  isLast ? 'pb-2' : 'pb-7'
                }`}
              >
                {/* Colonne date tabulaire */}
                <div className="pt-0.5 text-right pr-3">
                  <span className="font-mono tabular-nums text-xs sm:text-[13px] font-semibold text-[#9A3412] leading-snug block">
                    {fact.dateLabel}
                  </span>
                </div>

                {/* Axe vertical + contenu */}
                <div className="relative pl-5 border-l border-[#DDD6C8]">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[5px] top-[7px] w-[9px] h-[9px] rounded-full bg-[#FDFCF9] border-2 border-[#9A3412]"
                  />

                  <div className="text-[11px] text-[#78716C] tracking-wide mb-1">
                    {fact.era}
                  </div>
                  <h2 className="text-[15px] sm:text-base font-semibold text-[#1C1917] leading-snug">
                    {fact.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-[#44403C] leading-relaxed max-w-prose">
                    {fact.summary}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      {/* Pays voisins / même continent */}
      {neighbors.length > 0 && (
        <div className="px-6 py-5 bg-[#F7F4EC] border-t border-[#E8E2D5]">
          <div className="text-xs font-medium text-[#78716C] mb-3">
            À explorer à proximité ({country.continent})
          </div>
          <div className="divide-y divide-[#E5DEC9] border-y border-[#E5DEC9]">
            {neighbors.map((neighbor) => (
              <button
                key={neighbor.id}
                type="button"
                onClick={() => onSelectCountry(neighbor)}
                className="w-full py-2.5 flex items-center justify-between gap-3 text-left hover:bg-[#EFEAE0]/70 px-1.5 -mx-1.5 rounded transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium text-[#1C1917]">
                    {neighbor.nameFr}
                  </span>
                  <span className="text-xs text-[#78716C] ml-2">
                    {neighbor.capital}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-mono tabular-nums text-[#9A3412] shrink-0">
                  {neighbor.facts.length} faits
                  <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};
