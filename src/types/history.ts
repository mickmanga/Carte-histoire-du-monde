export type Continent = 'Afrique' | 'Amériques' | 'Asie' | 'Europe' | 'Océanie';

export type Era =
  | 'Origines & Antiquité'
  | 'Moyen Âge'
  | 'Époque moderne'
  | 'XIXe – XXe siècles'
  | 'XXIe siècle';

export interface HistoricalFact {
  /** Année numérique (négative pour av. J.-C., pour le tri chronologique strict) */
  year: number;
  /** Libellé lisible de la date ou période (ex: "52 av. J.-C.", "14 juillet 1789") */
  dateLabel: string;
  era: Era;
  title: string;
  summary: string;
}

export interface CountryHistory {
  id: string;
  /** Code ISO 3166-1 numérique (aligné sur world-atlas/countries-50m.json) */
  isoNumeric: string;
  nameFr: string;
  officialNameFr: string;
  capital: string;
  continent: Continent;
  region: string;
  /** [longitude, latitude] pour le centrage et les marqueurs de micro-États */
  coordinates: [number, number];
  /** Indique si un marqueur cliquable dédié est affiché en permanence sur le planisphère */
  isMicrostate?: boolean;
  summary: string;
  facts: HistoricalFact[];
}
