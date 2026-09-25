import { useEffect, useState } from 'react';
import { UserRound, MapPin, Sprout, Droplets, ClipboardCheck, Leaf } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import { Metric } from './Primitives';

export const FarmerSnapshot = ({ compact = false }) => {
  const { t, user } = useApp(); const [data, setData] = useState(null);
  useEffect(() => { let active = true; const load = () => api.get('/ecosystem/overview').then(r => { if (active) setData(r.data); }).catch(() => {}); load(); window.addEventListener('kg-offline-change', load); return () => { active = false; window.removeEventListener('kg-offline-change', load); }; }, [user?.id]);
  if (!data) return null;
  return <section className={`farmer-snapshot ${compact ? 'snapshot-compact' : ''}`} data-testid="farmer-snapshot"><div className="snapshot-person"><span className="snapshot-avatar"><UserRound size={26} /></span><div><h2 data-testid="snapshot-farmer-name">{user?.name || t('रमेश कुमार', 'Ramesh Kumar')}</h2><p data-testid="snapshot-farm-details"><MapPin size={12} />{data.location} · {data.area_acres} acres · {data.crop}</p></div><span className="sample-badge" data-testid="snapshot-sample-label">{user ? t('नमूना स्वास्थ्य', 'Sample health') : t('नमूना किसान', 'Sample farmer')}</span></div><div className="snapshot-stats"><div><Sprout size={17} /><strong data-testid="snapshot-soil-health">{data.soil_health}%</strong><span>{t('मिट्टी स्वास्थ्य', 'Soil health')}</span></div><div><Droplets size={17} /><strong data-testid="snapshot-water-efficiency">{data.water_efficiency}%</strong><span>{t('जल दक्षता', 'Water efficiency')}</span></div><div><Leaf size={17} /><strong data-testid="snapshot-practices">{data.recorded_practices}</strong><span>{t('दर्ज गतिविधियाँ', 'Practices recorded')}</span></div><div><ClipboardCheck size={17} /><strong data-testid="snapshot-verified">{data.demo_verified_records}</strong><span>{t('डेमो सत्यापित', 'Demo verified')}</span></div></div></section>;
};