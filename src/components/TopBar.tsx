import React from 'react';
import { Shuffle } from 'lucide-react';

export type AppView = 'map' | 'directory' | 'eras' | 'about';

interface TopBarProps {
  activeView: AppView;
  onChangeView: (view: AppView) => void;
  onRandomCountry: () => void;
}

const NAV_ITEMS: { id: AppView; label: string }[] = [
  { id: 'map', label: 'Planisphère' },
  { id: 'directory', label: 'Index des pays' },
  { id: 'eras', label: 'Grandes ères' },
  { id: 'about', label: 'Méthodologie' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onChangeView,
  onRandomCountry,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#F7F4EC]/95 backdrop-blur-sm border-b border-[#DDD6C8]">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1 : Wordmark unique */}
        <button
          type="button"
          onClick={() => onChangeView('map')}
          className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-[#1C1917] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A3412] rounded-sm"
        >
          Atlas Chronologique
        </button>

        {/* Zone 2 : Liens de navigation texte */}
        <nav
          aria-label="Navigation principale"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeView(item.id)}
                className={`relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9A3412] rounded-sm ${
                  isActive
                    ? 'text-[#1C1917] font-semibold'
                    : 'hover:text-[#1C1917]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 -bottom-[21px] h-[2px] bg-[#9A3412]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3 : Action primaire unique */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onRandomCountry}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-medium text-[#FDFCF9] bg-[#9A3412] hover:bg-[#7C2D12] rounded-md transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#9A3412]"
          >
            <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Pays aléatoire</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation strip (compact, single-line) */}
      <nav
        aria-label="Navigation mobile"
        className="md:hidden flex items-center gap-4 px-4 pb-2.5 overflow-x-auto text-xs font-medium text-[#57534E] border-t border-[#E8E2D5]/70 pt-2"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChangeView(item.id)}
              className={`whitespace-nowrap shrink-0 pb-0.5 cursor-pointer ${
                isActive
                  ? 'text-[#9A3412] font-semibold border-b border-[#9A3412]'
                  : 'hover:text-[#1C1917]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
