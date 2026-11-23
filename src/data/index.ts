import { AFRICA_COUNTRIES } from './africa';
import { AMERICAS_COUNTRIES } from './americas';
import { ASIA_COUNTRIES } from './asia';
import { EUROPE_COUNTRIES } from './europe';
import { OCEANIA_COUNTRIES } from './oceania';
import { Continent, CountryHistory, Era } from '../types/history';

export const ALL_COUNTRIES: CountryHistory[] = [
  ...EUROPE_COUNTRIES,
  ...AFRICA_COUNTRIES,
  ...ASIA_COUNTRIES,
  ...AMERICAS_COUNTRIES,
  ...OCEANIA_COUNTRIES,
].map((country) => ({
  ...country,
  facts: [...country.facts].sort((a, b) => a.year - b.year),
}));

export const CONTINENTS: Continent[] = ['Europe', 'Afrique', 'Asie', 'Amériques', 'Océanie'];

export const ERAS: Era[] = [
  'Origines & Antiquité',
  'Moyen Âge',
  'Époque moderne',
  'XIXe – XXe siècles',
  'XXIe siècle',
];

export const COUNTRY_BY_ISO: Record<string, CountryHistory> = {};
export const COUNTRY_BY_ID: Record<string, CountryHistory> = {};

for (const c of ALL_COUNTRIES) {
  COUNTRY_BY_ISO[c.isoNumeric] = c;
  COUNTRY_BY_ID[c.id] = c;
}

/**
 * Normalise une chaîne pour la recherche (insensible aux accents et à la casse)
 */
export function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function getCountryNeighbors(country: CountryHistory, limit = 5): CountryHistory[] {
  const [lon, lat] = country.coordinates;
  return ALL_COUNTRIES.filter((c) => c.id !== country.id && c.continent === country.continent)
    .map((c) => {
      const dx = c.coordinates[0] - lon;
      const dy = c.coordinates[1] - lat;
      return { country: c, dist: dx * dx + dy * dy };
    })
    .sort((a, b) => a.dist - b.dist)
    .slice(0, limit)
    .map((item) => item.country);
}
