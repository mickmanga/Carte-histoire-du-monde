import React, { useMemo, useRef, useState } from 'react';
import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import worldAtlas from 'world-atlas/countries-50m.json';
import { LocateFixed, Minus, Plus, RotateCcw, Search, X } from 'lucide-react';
import { ALL_COUNTRIES, CONTINENTS, COUNTRY_BY_ISO, normalizeText } from '../data';
import { Continent, CountryHistory } from '../types/history';

interface WorldMapProps {
  selectedCountry: CountryHistory;
  onSelectCountry: (country: CountryHistory) => void;
}

interface ViewTransform {
  k: number;
  x: number;
  y: number;
}

const SVG_WIDTH = 980;
const SVG_HEIGHT = 510;

// Correspondance pour les territoires rattachés sur la carte 50m
const TERRITORY_TO_SOVEREIGN_ISO: Record<string, string> = {
  '304': '208', // Groenland -> Danemark
  '234': '208', // Îles Féroé -> Danemark
  '248': '246', // Åland -> Finlande
  '630': '840', // Porto Rico -> États-Unis
  '316': '840', // Guam -> États-Unis
  '016': '840', // Samoa américaines -> États-Unis
  '580': '840', // Mariannes du Nord -> États-Unis
  '850': '840', // Îles Vierges américaines -> États-Unis
  '258': '250', // Polynésie française -> France
  '540': '250', // Nouvelle-Calédonie -> France
  '652': '250', // Saint-Barthélemy -> France
  '663': '250', // Saint-Martin -> France
  '666': '250', // Saint-Pierre-et-Miquelon -> France
  '876': '250', // Wallis-et-Futuna -> France
  '260': '250', // Terres australes et antarctiques françaises -> France
  '344': '156', // Hong Kong -> Chine
  '446': '156', // Macao -> Chine
  '531': '528', // Curaçao -> Pays-Bas
  '533': '528', // Aruba -> Pays-Bas
  '534': '528', // Saint-Martin (NL) -> Pays-Bas
  '060': '826', // Bermudes -> Royaume-Uni
  '092': '826', // Îles Vierges britanniques -> Royaume-Uni
  '136': '826', // Îles Caïmans -> Royaume-Uni
  '238': '826', // Malouines -> Royaume-Uni
  '239': '826', // Géorgie du Sud -> Royaume-Uni
  '500': '826', // Montserrat -> Royaume-Uni
  '612': '826', // Pitcairn -> Royaume-Uni
  '654': '826', // Sainte-Hélène -> Royaume-Uni
  '660': '826', // Anguilla -> Royaume-Uni
  '796': '826', // Îles Turques-et-Caïques -> Royaume-Uni
  '831': '826', // Guernesey -> Royaume-Uni
  '832': '826', // Jersey -> Royaume-Uni
  '833': '826', // Île de Man -> Royaume-Uni
  '086': '826', // Territoire britannique de l'océan Indien -> Royaume-Uni
  '184': '554', // Îles Cook -> Nouvelle-Zélande
  '570': '554', // Niue -> Nouvelle-Zélande
  '036': '036', // Australie & îles Ashmore
  '334': '036', // Îles Heard-et-MacDonald -> Australie
  '574': '036', // Île Norfolk -> Australie
};

const CONTINENT_VIEWS: Record<'Monde' | Continent, { lon: number; lat: number; k: number }> = {
  Monde: { lon: 10, lat: 14, k: 1 },
  Europe: { lon: 15, lat: 51, k: 3.3 },
  Afrique: { lon: 20, lat: 2, k: 2.1 },
  Asie: { lon: 92, lat: 32, k: 2.0 },
  Amériques: { lon: -78, lat: 12, k: 1.75 },
  Océanie: { lon: 150, lat: -22, k: 2.6 },
};

export const WorldMap: React.FC<WorldMapProps> = ({
  selectedCountry,
  onSelectCountry,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [transform, setTransform] = useState<ViewTransform>({ k: 1, x: 0, y: 0 });
  const [activeContinentPreset, setActiveContinentPreset] = useState<'Monde' | Continent>('Monde');
  const [hoveredCountry, setHoveredCountry] = useState<{
    country: CountryHistory;
    x: number;
    y: number;
    territoryNote?: string;
  } | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const dragState = useRef<{
    isDragging: boolean;
    didMove: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({
    isDragging: false,
    didMove: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  const projection = useMemo(() => {
    return geoNaturalEarth1()
      .scale(178)
      .translate([SVG_WIDTH / 2, SVG_HEIGHT / 2 + 18]);
  }, []);

  const pathGenerator = useMemo(() => geoPath(projection), [projection]);
  const graticulePath = useMemo(() => pathGenerator(geoGraticule10()) || '', [pathGenerator]);
  const spherePath = useMemo(
    () => pathGenerator({ type: 'Sphere' }) || '',
    [pathGenerator]
  );

  const countriesGeo = useMemo(() => {
    const topo = worldAtlas as unknown as {
      type: 'Topology';
      objects: { countries: any };
    };
    const geojson = feature(topo as any, topo.objects.countries) as unknown as {
      features: Array<{
        id?: string;
        properties?: { name?: string };
        geometry: any;
      }>;
    };
    return geojson.features.map((f, idx) => {
      const rawId = f.id ? String(f.id).padStart(3, '0') : '';
      const propName = f.properties?.name || '';

      let matchedCountry: CountryHistory | undefined;
      let territoryNote: string | undefined;

      if (propName === 'Kosovo') {
        matchedCountry = COUNTRY_BY_ISO['XKX'];
      } else if (propName === 'Somaliland') {
        matchedCountry = COUNTRY_BY_ISO['706'];
        territoryNote = 'Somaliland (rattaché à la Somalie sur la carte)';
      } else if (propName === 'N. Cyprus') {
        matchedCountry = COUNTRY_BY_ISO['196'];
        territoryNote = 'Chypre du Nord (Chypre)';
      } else if (rawId && COUNTRY_BY_ISO[rawId]) {
        matchedCountry = COUNTRY_BY_ISO[rawId];
      } else if (rawId && TERRITORY_TO_SOVEREIGN_ISO[rawId]) {
        matchedCountry = COUNTRY_BY_ISO[TERRITORY_TO_SOVEREIGN_ISO[rawId]];
        if (propName) {
          territoryNote = `${propName} (${matchedCountry?.nameFr})`;
        }
      }

      return {
        key: `${rawId || propName || 'geo'}-${idx}`,
        rawId,
        propName,
        d: pathGenerator(f as any) || '',
        matchedCountry,
        territoryNote,
        isAntarctica: rawId === '010',
      };
    });
  }, [pathGenerator]);

  const microstates = useMemo(
    () =>
      ALL_COUNTRIES.filter((c) => c.isMicrostate).map((c) => {
        const pt = projection(c.coordinates);
        return {
          country: c,
          cx: pt ? pt[0] : 0,
          cy: pt ? pt[1] : 0,
        };
      }),
    [projection]
  );

  const selectedPoint = useMemo(() => {
    const pt = projection(selectedCountry.coordinates);
    return pt ? { x: pt[0], y: pt[1] } : null;
  }, [projection, selectedCountry]);

  const clampTransform = (k: number, x: number, y: number): ViewTransform => {
    const clampedK = Math.max(1, Math.min(9, k));
    const maxOffsetX = (SVG_WIDTH * (clampedK - 1)) / 2 + 120;
    const maxOffsetY = (SVG_HEIGHT * (clampedK - 1)) / 2 + 80;
    const centerX = SVG_WIDTH / 2;
    const centerY = SVG_HEIGHT / 2;
    const dx = x - centerX * (1 - clampedK);
    const dy = y - centerY * (1 - clampedK);
    const clampedDx = Math.max(-maxOffsetX, Math.min(maxOffsetX, dx));
    const clampedDy = Math.max(-maxOffsetY, Math.min(maxOffsetY, dy));
    return {
      k: clampedK,
      x: centerX * (1 - clampedK) + clampedDx,
      y: centerY * (1 - clampedK) + clampedDy,
    };
  };

  const centerOnCoordinates = (lon: number, lat: number, targetZoom: number) => {
    const pt = projection([lon, lat]);
    if (!pt) return;
    const k = Math.max(1, Math.min(9, targetZoom));
    const x = SVG_WIDTH / 2 - pt[0] * k;
    const y = SVG_HEIGHT / 2 - pt[1] * k;
    setTransform(clampTransform(k, x, y));
  };

  const handleContinentFocus = (preset: 'Monde' | Continent) => {
    setActiveContinentPreset(preset);
    if (preset === 'Monde') {
      setTransform({ k: 1, x: 0, y: 0 });
      return;
    }
    const cfg = CONTINENT_VIEWS[preset];
    centerOnCoordinates(cfg.lon, cfg.lat, cfg.k);
  };

  const handleZoomBy = (factor: number) => {
    setTransform((prev) => {
      const nextK = Math.max(1, Math.min(9, prev.k * factor));
      const ratio = nextK / prev.k;
      const cx = SVG_WIDTH / 2;
      const cy = SVG_HEIGHT / 2;
      const nextX = cx - (cx - prev.x) * ratio;
      const nextY = cy - (cy - prev.y) * ratio;
      return clampTransform(nextK, nextX, nextY);
    });
  };

  const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mx = ((e.clientX - rect.left) / rect.width) * SVG_WIDTH;
    const my = ((e.clientY - rect.top) / rect.height) * SVG_HEIGHT;
    const factor = e.deltaY < 0 ? 1.22 : 0.82;

    setTransform((prev) => {
      const nextK = Math.max(1, Math.min(9, prev.k * factor));
      const ratio = nextK / prev.k;
      const nextX = mx - (mx - prev.x) * ratio;
      const nextY = my - (my - prev.y) * ratio;
      return clampTransform(nextK, nextX, nextY);
    });
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    dragState.current = {
      isDragging: true,
      didMove: false,
      startX: e.clientX,
      startY: e.clientY,
      originX: transform.x,
      originY: transform.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragState.current.isDragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = SVG_WIDTH / rect.width;
    const scaleY = SVG_HEIGHT / rect.height;
    const dx = (e.clientX - dragState.current.startX) * scaleX;
    const dy = (e.clientY - dragState.current.startY) * scaleY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragState.current.didMove = true;
    }
    setTransform((prev) =>
      clampTransform(prev.k, dragState.current.originX + dx, dragState.current.originY + dy)
    );
  };

  const handlePointerUp = () => {
    dragState.current.isDragging = false;
  };

  const searchResults = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return [];
    return ALL_COUNTRIES.filter(
      (c) =>
        normalizeText(c.nameFr).includes(q) ||
        normalizeText(c.officialNameFr).includes(q) ||
        normalizeText(c.capital).includes(q) ||
        normalizeText(c.region).includes(q)
    ).slice(0, 10);
  }, [searchQuery]);

  const handlePickFromSearch = (country: CountryHistory) => {
    onSelectCountry(country);
    centerOnCoordinates(country.coordinates[0], country.coordinates[1], country.isMicrostate ? 4.5 : 2.6);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <section
      aria-label="Planisphère historique interactif"
      className="flex flex-col h-full bg-[#EFEAE0] border-b lg:border-b-0 lg:border-r border-[#DDD6C8]"
    >
      {/* Barre d'outils cartographique */}
      <div className="px-4 sm:px-6 py-3 bg-[#F7F4EC] border-b border-[#DDD6C8] flex flex-wrap items-center justify-between gap-3">
        {/* Recherche instantanée de pays */}
        <div className="relative w-full sm:w-72">
          <Search
            className="w-4 h-4 text-[#78716C] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            placeholder="Rechercher un pays ou une capitale..."
            aria-label="Rechercher un pays ou une capitale"
            className="w-full pl-9 pr-8 py-1.5 text-sm bg-[#FDFCF9] border border-[#D6CEBE] rounded-md text-[#1C1917] placeholder:text-[#78716C] focus:outline-none focus:border-[#9A3412] focus:ring-1 focus:ring-[#9A3412]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              aria-label="Effacer la recherche"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#78716C] hover:text-[#1C1917] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {isSearchOpen && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-1.5 bg-[#FDFCF9] border border-[#D6CEBE] rounded-md shadow-lg z-40 max-h-80 overflow-y-auto editorial-scroll">
              {searchResults.length === 0 ? (
                <div className="px-3.5 py-3 text-xs text-[#78716C]">
                  Aucun pays trouvé pour « {searchQuery} ».
                </div>
              ) : (
                <ul role="listbox" aria-label="Résultats de recherche">
                  {searchResults.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => handlePickFromSearch(c)}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-[#F3EFE6] border-b border-[#EFEAE0] last:border-b-0 flex items-center justify-between gap-3 cursor-pointer"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-[#1C1917] truncate">
                            {c.nameFr}
                          </div>
                          <div className="text-xs text-[#78716C] truncate">
                            {c.continent} · {c.capital}
                          </div>
                        </div>
                        <span className="text-xs font-mono tabular-nums text-[#78716C] shrink-0">
                          {c.facts.length} faits
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Sélecteur rapide de région / continent */}
        <div
          role="group"
          aria-label="Cadrage géographique"
          className="flex items-center gap-1 p-0.5 bg-[#EAE4D7] rounded-md overflow-x-auto max-w-full"
        >
          {(['Monde', ...CONTINENTS] as const).map((region) => {
            const active = activeContinentPreset === region;
            return (
              <button
                key={region}
                type="button"
                onClick={() => handleContinentFocus(region)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#FDFCF9] text-[#1C1917] shadow-xs'
                    : 'text-[#57534E] hover:text-[#1C1917]'
                }`}
              >
                {region}
              </button>
            );
          })}
        </div>
      </div>

      {/* Canevas SVG cartographique */}
      <div className="relative flex-1 min-h-[340px] lg:min-h-[540px] overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full touch-none cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={() => {
            handlePointerUp();
            setHoveredCountry(null);
          }}
        >
          <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
            {/* Sphère océanique */}
            <path d={spherePath} fill="#E6E0D3" stroke="#C8BFA9" strokeWidth={0.9 / transform.k} />

            {/* Grille méridiens / parallèles */}
            <path
              d={graticulePath}
              fill="none"
              stroke="#D5CEBE"
              strokeWidth={0.45 / transform.k}
              strokeDasharray={`${2 / transform.k} ${2 / transform.k}`}
            />

            {/* Polygones de tous les pays */}
            {countriesGeo.map((item) => {
              if (!item.d) return null;
              if (item.isAntarctica) {
                return (
                  <path
                    key={item.key}
                    d={item.d}
                    fill="#EFEAE0"
                    stroke="#D6CEBE"
                    strokeWidth={0.5 / transform.k}
                  />
                );
              }

              const isSelected = item.matchedCountry?.id === selectedCountry.id;
              const isHovered =
                hoveredCountry &&
                item.matchedCountry &&
                hoveredCountry.country.id === item.matchedCountry.id;

              let fillColor = '#FCF9F2';
              if (isSelected) fillColor = '#9A3412';
              else if (isHovered) fillColor = '#E7D8C3';

              return (
                <path
                  key={item.key}
                  d={item.d}
                  fill={fillColor}
                  stroke={isSelected ? '#6C220A' : '#BFB5A0'}
                  strokeWidth={(isSelected ? 0.95 : 0.55) / transform.k}
                  className={item.matchedCountry ? 'cursor-pointer transition-colors duration-100' : ''}
                  onMouseMove={(e) => {
                    if (!item.matchedCountry) return;
                    const rect = svgRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    setHoveredCountry({
                      country: item.matchedCountry,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      territoryNote: item.territoryNote,
                    });
                  }}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => {
                    if (dragState.current.didMove) return;
                    if (item.matchedCountry) {
                      onSelectCountry(item.matchedCountry);
                    }
                  }}
                />
              );
            })}

            {/* Marqueurs dédiés pour les micro-États et États insulaires */}
            {microstates.map(({ country, cx, cy }) => {
              const isSelected = country.id === selectedCountry.id;
              const isHovered = hoveredCountry?.country.id === country.id;
              const radius = (isSelected ? 4.4 : 2.9) / Math.sqrt(transform.k);

              return (
                <g
                  key={country.id}
                  transform={`translate(${cx}, ${cy})`}
                  className="cursor-pointer"
                  onMouseMove={(e) => {
                    const rect = svgRef.current?.getBoundingClientRect();
                    if (!rect) return;
                    setHoveredCountry({
                      country,
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                    });
                  }}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (dragState.current.didMove) return;
                    onSelectCountry(country);
                  }}
                >
                  <circle
                    r={radius * 2.1}
                    fill="transparent"
                  />
                  <circle
                    r={radius}
                    fill={isSelected ? '#9A3412' : isHovered ? '#B45309' : '#1E3A5F'}
                    stroke="#FCF9F2"
                    strokeWidth={0.9 / Math.sqrt(transform.k)}
                  />
                </g>
              );
            })}

            {/* Repère cartographique statique sur le pays sélectionné */}
            {selectedPoint && (
              <g
                transform={`translate(${selectedPoint.x}, ${selectedPoint.y})`}
                pointerEvents="none"
              >
                <circle
                  r={7 / Math.sqrt(transform.k)}
                  fill="none"
                  stroke="#9A3412"
                  strokeWidth={1.1 / Math.sqrt(transform.k)}
                  strokeOpacity={0.75}
                />
                <circle
                  r={2.2 / Math.sqrt(transform.k)}
                  fill="#FDFCF9"
                  stroke="#9A3412"
                  strokeWidth={1 / Math.sqrt(transform.k)}
                />
              </g>
            )}
          </g>
        </svg>

        {/* Infobulle au survol (unboxed) */}
        {hoveredCountry && (
          <div
            style={{
              left: Math.min(hoveredCountry.x + 14, 620),
              top: Math.max(hoveredCountry.y - 46, 12),
            }}
            className="pointer-events-none absolute z-20 bg-[#1C1917] text-[#FDFCF9] px-3 py-2 rounded-md shadow-md text-xs max-w-[240px]"
          >
            <div className="font-semibold text-sm leading-tight">
              {hoveredCountry.country.nameFr}
            </div>
            <div className="text-[#D6CEBE] mt-0.5 flex items-center gap-1.5">
              <span>{hoveredCountry.country.continent}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">
                {hoveredCountry.country.facts.length} repères
              </span>
            </div>
            {hoveredCountry.territoryNote && (
              <div className="text-[11px] text-[#A8A29E] mt-0.5 truncate">
                {hoveredCountry.territoryNote}
              </div>
            )}
          </div>
        )}

        {/* Contrôles flottants de zoom et centrage */}
        <div className="absolute right-4 bottom-4 flex flex-col gap-1.5 z-10">
          <button
            type="button"
            onClick={() =>
              centerOnCoordinates(
                selectedCountry.coordinates[0],
                selectedCountry.coordinates[1],
                selectedCountry.isMicrostate ? 4.5 : 2.8
              )
            }
            title="Centrer sur le pays sélectionné"
            aria-label="Centrer sur le pays sélectionné"
            className="w-9 h-9 bg-[#FDFCF9] border border-[#D6CEBE] rounded-md flex items-center justify-center text-[#1C1917] hover:bg-[#F3EFE6] shadow-xs cursor-pointer"
          >
            <LocateFixed className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoomBy(1.4)}
            title="Zoomer"
            aria-label="Zoomer sur la carte"
            className="w-9 h-9 bg-[#FDFCF9] border border-[#D6CEBE] rounded-md flex items-center justify-center text-[#1C1917] hover:bg-[#F3EFE6] shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoomBy(0.72)}
            title="Dézoomer"
            aria-label="Dézoomer sur la carte"
            className="w-9 h-9 bg-[#FDFCF9] border border-[#D6CEBE] rounded-md flex items-center justify-center text-[#1C1917] hover:bg-[#F3EFE6] shadow-xs cursor-pointer"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleContinentFocus('Monde')}
            title="Réinitialiser la vue mondiale"
            aria-label="Réinitialiser la vue mondiale"
            className="w-9 h-9 bg-[#FDFCF9] border border-[#D6CEBE] rounded-md flex items-center justify-center text-[#1C1917] hover:bg-[#F3EFE6] shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Légende discrète bas gauche */}
        <div className="absolute left-4 bottom-4 bg-[#FDFCF9]/92 border border-[#D6CEBE] rounded-md px-3 py-2 text-[11px] text-[#57534E] flex flex-wrap items-center gap-x-4 gap-y-1 pointer-events-none">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#9A3412] inline-block" />
            Pays actif
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1E3A5F] inline-block" />
            Micro-États &amp; îles
          </span>
          <span className="hidden sm:inline text-[#78716C]">
            197 pays couverts · Glisser pour déplacer, molette pour zoomer
          </span>
        </div>
      </div>
    </section>
  );
};
