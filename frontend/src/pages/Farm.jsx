import { useState, useEffect } from 'react';
import { UserRound, LogOut, Save, History, Sprout, Mic, ScanLine, LoaderCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PageHeading, ErrorState, Loading } from '../components/Shared';
import { Telemetry } from '../components/Telemetry';
import { api, errorText } from '../lib/api';
import { toast } from '../components/ui/sonner';
import { FarmerSnapshot } from '../components/ecosystem/FarmerSnapshot';

export default function Farm() {
  const { user, setUser, setLoginOpen, t } = useApp();
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState('all');
  const userId = user?.id;
  const load = () => { if (userId) { setError(false); api.get('/history').then(r => setHistory(r.data)).catch(() => setError(true)); } };
  useEffect(() => {
    if (userId) { setError(false); api.get('/history').then(r => setHistory(r.data)).catch(() => setError(true)); }
  }, [userId]);
  const save = async e => {
    e.preventDefault(); setBusy(true);
    const values = Object.fromEntries(new FormData(e.currentTarget)); values.area = Number(values.area);
    try { const { data } = await api.put('/profile', values); setUser(data); toast.success(t('खेत की जानकारी सहेज ली गई', 'Farm profile saved')); } catch (err) { toast.error(errorText(err)); } finally { setBusy(false); }
  };
  const logout = async () => {
    try { await api.post('/auth/logout'); localStorage.removeItem('kg-token'); setUser(null); setHistory(null); toast.success(t('लॉगआउट हो गया', 'Signed out')); } catch (e) { toast.error(errorText(e)); }
  };
  return <div className="container page-content"><PageHeading eyebrow="YOUR FARM, CONNECTED" title={t('आपके खेत की अपनी कहानी।', 'Your farm has its own story.')} description={t('मिट्टी, मौसम और आपकी मेहनत — एक नज़र में।', 'Your soil, your seasons and everything you grow.')} />
    <FarmerSnapshot />
    {user ? <div className="profile-layout"><section className="farm-form-section"><div className="profile-title"><span className="profile-avatar"><UserRound size={26} /></span><div><h2 data-testid="profile-name">{user.name}</h2><span className="sample-badge" data-testid="profile-demo-badge">{t('डेमो प्रोफ़ाइल', 'Demo profile')}</span></div><button onClick={logout} className="icon-button" title="Sign out" aria-label="Sign out" data-testid="logout-button"><LogOut size={18} /></button></div>
    <form className="form-stack" onSubmit={save} key={user.id}><div className="form-row"><label>{t('गाँव', 'Village')}<input name="village" defaultValue={user.farm.village} maxLength={100} data-testid="farm-village" /></label><label>{t('ज़िला', 'District')}<input name="district" defaultValue={user.farm.district} maxLength={100} required data-testid="farm-district" /></label></div><div className="form-row"><label>{t('मुख्य फसल', 'Main crop')}<select name="crop" defaultValue={user.farm.crop} data-testid="farm-crop"><option>Wheat</option><option>Rice</option><option>Tomato</option><option>Maize</option><option>Mustard</option><option>Potato</option></select></label><label>{t('क्षेत्रफल (एकड़)', 'Area (acres)')}<input name="area" type="number" min="0.01" max="100000" step="0.01" defaultValue={user.farm.area} required data-testid="farm-area" /></label></div><button className="btn btn-primary" disabled={busy} data-testid="save-farm-button">{busy ? <LoaderCircle size={17} className="animate-spin" /> : <Save size={17} />}{t('खेत की जानकारी सहेजें', 'Save farm profile')}</button></form></section>
    <section className="history-section"><div className="section-heading"><h2 data-testid="history-heading"><History size={19} />{t('आपके पिछले सवाल और रिपोर्ट', 'Your questions & crop reports')}</h2></div><div className="history-filters">{[['all', 'सभी', 'All'], ['voice', 'सवाल', 'Conversations'], ['scan', 'रिपोर्ट', 'Reports']].map(([value, hi, en]) => <button className={filter === value ? 'active' : ''} onClick={() => setFilter(value)} key={value} data-testid={`history-filter-${value}`}>{t(hi, en)}</button>)}</div>
    {error ? <ErrorState retry={load} /> : history === null ? <Loading /> : history.filter(h => filter === 'all' || h.type === filter).length ? <div className="history-list">{history.filter(h => filter === 'all' || h.type === filter).map(item => <article className="history-item" key={item.id} data-testid={`history-${item.id}`}><span>{item.type === 'voice' ? <Mic size={18} /> : <ScanLine size={18} />}</span><div><h3 data-testid={`history-question-${item.id}`}>{item.question}</h3><p data-testid={`history-answer-${item.id}`}>{item.answer}</p><time data-testid={`history-time-${item.id}`}>{new Date(item.created_at).toLocaleString()}</time></div></article>)}</div> : <div className="empty-history" data-testid="empty-history"><Sprout size={32} /><p>{t('अभी कोई सवाल या रिपोर्ट नहीं।', 'No conversations or reports yet.')}</p></div>}</section></div>
    : <div className="guest-profile"><span className="tool-icon green"><Sprout size={29} /></span><div><h2 data-testid="guest-farm-title">{t('अपनी खेती की जानकारी सहेजें', 'Make room for your farm')}</h2><p data-testid="guest-farm-description">{t('सहेजे गए सवाल, फसल रिपोर्ट और आपकी खेत प्रोफ़ाइल।', 'Saved conversations, crop reports and your personal farm profile.')}</p></div><button className="btn btn-primary" onClick={() => setLoginOpen(true)} data-testid="farm-login-button"><UserRound size={17} />{t('प्रोफ़ाइल खोलें', 'Open a profile')}</button></div>}
    <section className="farm-telemetry"><div className="section-heading"><div><h2 data-testid="fusion-heading">{t('मल्टी-सोर्स फसल जानकारी', 'Multi-source farm insights')}</h2><p data-testid="fusion-description">{t('मौसम, मिट्टी और हरियाली का उदाहरण डैशबोर्ड', 'An illustrative view of weather, soil and vegetation health')}</p></div></div><Telemetry /></section></div>;
}