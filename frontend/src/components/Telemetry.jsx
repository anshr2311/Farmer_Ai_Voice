import { useEffect, useState } from 'react';
import { CloudSun, Droplets, Wind, Sprout, Satellite, ArrowUpRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { Loading, ErrorState, SampleBadge } from './Shared';

export const Telemetry = ({ compact = false }) => {
  const { t } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const load = () => { setError(false); api.get('/telemetry').then(r => setData(r.data)).catch(() => setError(true)); };
  useEffect(load, []);
  if (error) return <ErrorState retry={load} />;
  if (!data) return <Loading />;
  return <><div className={`telemetry-grid ${compact ? 'telemetry-compact' : ''}`}>
    <article className="telemetry-item weather-item" data-testid="weather-telemetry"><div className="telemetry-header"><span><CloudSun size={18} />{t('मौसम का हाल', 'Weather outlook')}</span><span>{t('बरेली', 'Bareilly')}</span></div><div className="weather-main"><div><strong data-testid="temperature">{data.temperature}°<span>C</span></strong><p>{t('हल्के बादल, सुहाना मौसम', 'Partly cloudy skies')}</p></div><CloudSun className="weather-large" size={70} strokeWidth={1.1} /></div><div className="weather-stats"><span><Droplets size={14} />{t('नमी', 'Humidity')} <b data-testid="humidity">{data.humidity}%</b></span><span><Wind size={14} />{t('बारिश', 'Rainfall')} <b data-testid="rainfall">{data.rainfall} mm</b></span></div></article>
    <article className="telemetry-item soil-item" data-testid="soil-telemetry"><div className="telemetry-header"><span><Sprout size={18} />{t('मिट्टी की सेहत', 'Soil health')}</span><span className="healthy-label">{t('संतुलित', 'Balanced')}</span></div><div className="soil-main"><div><strong data-testid="soil-ph">{data.ph}</strong><span>{t('pH स्तर', 'pH level')}</span></div><div className="soil-bars">{[['N', data.nitrogen, 73], ['P', data.phosphorus, 48], ['K', data.potassium, 64]].map(([n, value, width]) => <div className="soil-bar-row" key={n}><span>{n}</span><div><i style={{ width: `${width}%` }} /></div><b data-testid={`soil-${n.toLowerCase()}`}>{value}<small> kg/ha</small></b></div>)}</div></div><div className="soil-footer"><Droplets size={14} />{t('मिट्टी की नमी', 'Soil moisture')}<strong data-testid="soil-moisture">{data.moisture}%</strong></div></article>
    <article className="telemetry-item satellite-item" data-testid="satellite-telemetry"><div className="telemetry-header"><span><Satellite size={18} />{t('सैटेलाइट फसल स्वास्थ्य', 'Satellite crop health')}</span><span className="healthy-label">NDVI</span></div><div className="satellite-main"><div className="field-map" role="img" aria-label="Illustrative field health map, not actual satellite data"><i /><i /><i /><i /><span className="map-pin">●</span></div><div><strong data-testid="ndvi-value">{data.ndvi}</strong><p>{t('स्वस्थ हरियाली', 'Healthy vegetation')}</p><span className="ndvi-legend"><i />{t('अच्छी स्थिति', 'Good condition')}</span></div></div><span className="satellite-footer" data-testid="satellite-mode">{t('उदाहरण मानचित्र • वास्तविक सैटेलाइट फ़ीड नहीं', 'Illustrative map · Not a live satellite feed')}</span></article>
    </div><div className="telemetry-note"><SampleBadge id="telemetry-sample-badge" /><span data-testid="telemetry-disclaimer">{t('नमूना खेत: बरेली • सेंसर या मौसम सेवा से जुड़ा नहीं', 'Sample farm: Bareilly · No live sensor or weather connection')}</span></div></>;
};