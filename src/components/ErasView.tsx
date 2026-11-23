import React, { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ALL_COUNTRIES, CONTINENTS, ERAS } from '../data';
import { Continent, CountryHistory, Era } from '../types/history';

interface ErasViewProps {
  onSelectCountryAndOpenMap: (country: CountryHistory) => void;
}

export const ErasView: React.FC<ErasViewProps> = ({ onSelectCountryAndOpenMap }) => {
  const [selectedEra, setSelectedEra] = useState<Era>('Origines & Antiquité');
  const [continentFilter, setContinentFilter] = useState<'Tous' | Continent>('Tous');

  const eraFacts = useMemo(() => {
    const items: Array<{
      country: CountryHistory;
      year: number;
      dateLabel: string;
      title: string;
      summary: string;
    }> = [];

    for (const country of ALL_COUNTRIES) {
      if (continentFilter !== 'Tous' && country.continent !== continentFilter) continue;
      for (const fact of country.facts) {
        if (fact.era === selectedEra) {
          items.push({
            country,
            year: fact.year,
            dateLabel: fact.dateLabel,
            title: fact.title,
            summary: fact.summary,
          });
        }
      }
    }

    return items.sort((a, b) => a.year - b.year);
  }, [selectedEra, continentFilter]);

  return (
    <main className="max-w-[1160px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="border-b border-[#DDD6C8] pb-6">
        <div className="text-xs text-[#78716C] tracking-wide">
          Chronologie comparée mondiale · {eraFacts.length} repères recensés pour cette période
        </div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] text-balance">
          Grandes ères de l’histoire mondiale
        </h1>
        <p className="mt-2 text-[15px] text-[#57534E] max-w-2xl leading-relaxed">
          Comparez chronologiquement les événements majeurs survenus à travers les cinq continents au cours d’une même période historique.
        </p>

        {/* Sélecteur de période */}
        <div
          role="tablist"
          aria-label="Choisir une ère historique"
          className="mt-6 flex flex-wrap items-center gap-1.5"
        >
          {ERAS.map((era) => {
            const active = selectedEra === era;
            return (
              <button
                key={era}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedEra(era)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-[#9A3412] text-[#FDFCF9]'
                    : 'bg-[#EAE4D7] text-[#44403C] hover:text-[#1C1917]'
                }`}
              >
                {era}
              </button>
            );
          })}
        </div>

        {/* Filtre continent */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#57534E]">
          <span>Continent :</span>
          {(['Tous', ...CONTINENTS] as const).map((cont) => (
            <button
              key={cont}
              type="button"
              onClick={() => setContinentFilter(cont)}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                continentFilter === cont
                  ? 'bg-[#1C1917] text-[#FDFCF9]'
                  : 'bg-[#F3EFE6] hover:text-[#1C1917]'
              }`}
            >
              {cont}
            </button>
          ))}
        </div>
      </div>

      {/* Liste chronologique transversale */}
      <div className="mt-6 divide-y divide-[#E5DEC9]">
        {eraFacts.map((item, idx) => (
          <div
            key={`${item.country.id}-${item.year}-${idx}`}
            className="py-5 grid grid-cols-1 sm:grid-cols-[130px_1fr_auto] gap-3 sm:gap-6 items-start"
          >
            <div className="font-mono tabular-nums text-xs sm:text-sm font-semibold text-[#9A3412] pt-0.5">
              {item.dateLabel}
            </div>
            <div>
              <div className="text-xs text-[#78716C]">
                <span className="font-medium text-[#1C1917]">{item.country.nameFr}</span>
                <span aria-hidden="true"> · </span>
                <span>{item.country.continent}</span>
              </div>
              <h2 className="mt-1 text-base font-semibold text-[#1C1917]">
                {item.title}
              </h2>
              <p className="mt-1 text-sm text-[#44403C] leading-relaxed max-w-prose">
                {item.summary}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectCountryAndOpenMap(item.country)}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#9A3412] hover:underline whitespace-nowrap shrink-0 cursor-pointer pt-1"
            >
              <span>Voir sur la carte</span>
              <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </main>
  );
};
