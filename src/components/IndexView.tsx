import React, { useMemo, useState } from 'react';
import { ChevronRight, Search, X } from 'lucide-react';
import { ALL_COUNTRIES, CONTINENTS, normalizeText } from '../data';
import { Continent, CountryHistory } from '../types/history';

interface IndexViewProps {
  selectedCountryId: string;
  onSelectCountryAndOpenMap: (country: CountryHistory) => void;
}

export const IndexView: React.FC<IndexViewProps> = ({
  selectedCountryId,
  onSelectCountryAndOpenMap,
}) => {
  const [query, setQuery] = useState('');
  const [continentFilter, setContinentFilter] = useState<'Tous' | Continent>('Tous');

  const filteredCountries = useMemo(() => {
    const q = normalizeText(query);
    return ALL_COUNTRIES.filter((c) => {
      const matchesContinent = continentFilter === 'Tous' || c.continent === continentFilter;
      if (!matchesContinent) return false;
      if (!q) return true;
      return (
        normalizeText(c.nameFr).includes(q) ||
        normalizeText(c.officialNameFr).includes(q) ||
        normalizeText(c.capital).includes(q) ||
        normalizeText(c.region).includes(q)
      );
    }).sort((a, b) => a.nameFr.localeCompare(b.nameFr, 'fr'));
  }, [query, continentFilter]);

  const countsByContinent = useMemo(() => {
    const counts: Record<string, number> = { Tous: ALL_COUNTRIES.length };
    for (const c of ALL_COUNTRIES) {
      counts[c.continent] = (counts[c.continent] || 0) + 1;
    }
    return counts;
  }, []);

  return (
    <main className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
      <div className="border-b border-[#DDD6C8] pb-6">
        <div className="text-xs text-[#78716C] tracking-wide">
          Répertoire encyclopédique · {ALL_COUNTRIES.length} pays souverains et territoires reconnus
        </div>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] text-balance">
          Index mondial des chronologies nationales
        </h1>
        <p className="mt-2 text-[15px] text-[#57534E] max-w-2xl leading-relaxed">
          Consultez l’intégralité des pays du monde par ordre alphabétique ou par continent, puis sélectionnez un État pour ouvrir sa frise historique complète sur le planisphère.
        </p>

        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <Search
              className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filtrer par pays, capitale ou région..."
              aria-label="Filtrer les pays"
              className="w-full pl-9 pr-8 py-2 text-sm bg-[#FDFCF9] border border-[#D6CEBE] rounded-md text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#9A3412]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Effacer le filtre"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Filtrer par continent"
            className="flex flex-wrap items-center gap-1 p-1 bg-[#EAE4D7] rounded-md"
          >
            {(['Tous', ...CONTINENTS] as const).map((cont) => {
              const active = continentFilter === cont;
              return (
                <button
                  key={cont}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setContinentFilter(cont)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-[#FDFCF9] text-[#1C1917] shadow-xs'
                      : 'text-[#57534E] hover:text-[#1C1917]'
                  }`}
                >
                  {cont}{' '}
                  <span className="font-mono tabular-nums text-[#78716C] ml-1">
                    {countsByContinent[cont] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tableau éditorial / liste structurée */}
      {filteredCountries.length === 0 ? (
        <div className="py-16 text-center text-sm text-[#78716C]">
          Aucun pays ne correspond à votre recherche « {query} ».
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 divide-y md:divide-y-0 border-b border-[#DDD6C8]">
          {filteredCountries.map((country) => {
            const isSelected = country.id === selectedCountryId;
            const firstFact = country.facts[0];
            const lastFact = country.facts[country.facts.length - 1];

            return (
              <button
                key={country.id}
                type="button"
                onClick={() => onSelectCountryAndOpenMap(country)}
                className={`group text-left py-4 border-b border-[#E5DEC9] flex items-start justify-between gap-4 transition-colors hover:bg-[#EFEAE0]/60 px-2 -mx-2 rounded cursor-pointer ${
                  isSelected ? 'bg-[#9A3412]/5' : ''
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[11px] text-[#78716C]">
                    <span className="text-[#9A3412] font-medium">{country.continent}</span>
                    <span aria-hidden="true">·</span>
                    <span className="truncate">{country.capital}</span>
                  </div>
                  <div className="mt-0.5 text-base font-semibold text-[#1C1917] group-hover:text-[#9A3412] transition-colors truncate">
                    {country.nameFr}
                  </div>
                  {firstFact && lastFact && (
                    <div className="mt-1 text-xs font-mono tabular-nums text-[#6E675F]">
                      {firstFact.dateLabel} — {lastFact.dateLabel} · {country.facts.length} faits
                    </div>
                  )}
                </div>
                <ChevronRight
                  className="w-4 h-4 text-[#A8A29E] group-hover:text-[#9A3412] mt-3 shrink-0 transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      )}
    </main>
  );
};
