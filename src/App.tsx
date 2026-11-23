import { useState } from 'react';
import { AboutView } from './components/AboutView';
import { CountryTimelinePanel } from './components/CountryTimelinePanel';
import { ErasView } from './components/ErasView';
import { IndexView } from './components/IndexView';
import { AppView, TopBar } from './components/TopBar';
import { WorldMap } from './components/WorldMap';
import { ALL_COUNTRIES, COUNTRY_BY_ID } from './data';
import { CountryHistory } from './types/history';

export default function App() {
  const [activeView, setActiveView] = useState<AppView>('map');
  const [selectedCountry, setSelectedCountry] = useState<CountryHistory>(
    () => COUNTRY_BY_ID['france'] || ALL_COUNTRIES[0]
  );

  const handleRandomCountry = () => {
    const pool = ALL_COUNTRIES.filter((c) => c.id !== selectedCountry.id);
    const next = pool[Math.floor(Math.random() * pool.length)] || ALL_COUNTRIES[0];
    setSelectedCountry(next);
    setActiveView('map');
  };

  const handleSelectCountryAndOpenMap = (country: CountryHistory) => {
    setSelectedCountry(country);
    setActiveView('map');
  };

  return (
    <div
      className={`min-h-screen bg-[#F7F4EC] text-[#1C1917] flex flex-col ${
        activeView === 'map' ? 'lg:h-screen lg:overflow-hidden' : ''
      }`}
    >
      <TopBar
        activeView={activeView}
        onChangeView={setActiveView}
        onRandomCountry={handleRandomCountry}
      />

      {activeView === 'map' && (
        <main className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_460px] xl:grid-cols-[minmax(0,1fr)_510px]">
          <div className="min-h-0">
            <WorldMap
              selectedCountry={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
          </div>
          <div className="min-h-0">
            <CountryTimelinePanel
              country={selectedCountry}
              onSelectCountry={setSelectedCountry}
            />
          </div>
        </main>
      )}

      {activeView === 'directory' && (
        <IndexView
          selectedCountryId={selectedCountry.id}
          onSelectCountryAndOpenMap={handleSelectCountryAndOpenMap}
        />
      )}

      {activeView === 'eras' && (
        <ErasView onSelectCountryAndOpenMap={handleSelectCountryAndOpenMap} />
      )}

      {activeView === 'about' && (
        <AboutView onReturnToMap={() => setActiveView('map')} />
      )}
    </div>
  );
}
