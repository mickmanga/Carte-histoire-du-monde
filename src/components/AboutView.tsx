import React from 'react';
import { ALL_COUNTRIES, CONTINENTS } from '../data';

interface AboutViewProps {
  onReturnToMap: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onReturnToMap }) => {
  const totalFacts = ALL_COUNTRIES.reduce((sum, c) => sum + c.facts.length, 0);

  return (
    <main className="max-w-[820px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
      <div className="text-xs text-[#78716C] tracking-wide">
        Colophon &amp; Architecture documentaire
      </div>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl font-semibold text-[#1C1917] text-balance">
        Méthodologie de l’Atlas Chronologique
      </h1>

      <div className="mt-6 pt-6 border-t border-[#DDD6C8] space-y-6 text-[15px] text-[#3F3A36] leading-relaxed">
        <p className="first-letter:text-5xl first-letter:font-display first-letter:font-semibold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-[#9A3412]">
          L’Atlas Chronologique rassemble sur un planisphère vectoriel interactif une synthèse historique datée pour chacun des {ALL_COUNTRIES.length} pays du monde : les 193 États membres des Nations unies, les deux États observateurs permanents (Vatican et Palestine) ainsi que Taïwan et le Kosovo.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-5 border-y border-[#E5DEC9]">
          <div>
            <div className="font-mono tabular-nums text-2xl font-semibold text-[#1C1917]">
              {ALL_COUNTRIES.length}
            </div>
            <div className="text-xs text-[#78716C] mt-0.5">Pays documentés</div>
          </div>
          <div>
            <div className="font-mono tabular-nums text-2xl font-semibold text-[#1C1917]">
              {totalFacts}
            </div>
            <div className="text-xs text-[#78716C] mt-0.5">Repères chronologiques</div>
          </div>
          <div>
            <div className="font-mono tabular-nums text-2xl font-semibold text-[#1C1917]">
              {CONTINENTS.length}
            </div>
            <div className="text-xs text-[#78716C] mt-0.5">Continents couverts</div>
          </div>
          <div>
            <div className="font-mono tabular-nums text-2xl font-semibold text-[#1C1917]">
              5
            </div>
            <div className="text-xs text-[#78716C] mt-0.5">Grandes ères historiques</div>
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-[#1C1917]">
            Projection cartographique et micro-États
          </h2>
          <p className="mt-2">
            La carte repose sur la projection de Natural Earth (Natural Earth 50m), choisie pour son équilibre visuel entre respect des surfaces et lisibilité des latitudes. Afin qu’aucun État ne soit inaccessible à l’échelle planétaire, des repères circulaires dédiés matérialisent l’emplacement exact des micro-États et des archipels insulaires (Andorre, Monaco, Vatican, Saint-Marin, Singapour, Malte, Maldives, États des Caraïbes et d’Océanie).
          </p>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-[#1C1917]">
            Classement chronologique strict
          </h2>
          <p className="mt-2">
            Chaque fiche nationale classe les événements de la plus haute Antiquité (notée par valeur négative pour les dates avant notre ère) jusqu’au XXIe siècle, répartis en cinq grandes périodes : Origines &amp; Antiquité, Moyen Âge, Époque moderne, XIXe – XXe siècles et XXIe siècle.
          </p>
        </div>

        <div className="pt-4">
          <button
            type="button"
            onClick={onReturnToMap}
            className="px-5 py-2.5 text-sm font-medium bg-[#1C1917] text-[#FDFCF9] hover:bg-[#9A3412] rounded-md transition-colors cursor-pointer"
          >
            Revenir au planisphère
          </button>
        </div>
      </div>
    </main>
  );
};
