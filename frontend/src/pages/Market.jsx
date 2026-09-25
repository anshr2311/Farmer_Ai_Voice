import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Store, ChartNoAxesCombined, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { PageHeading, Loading, ErrorState, SampleBadge } from '../components/Shared';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';
import { ProductCard } from '../components/ProductCard';
import { MandiTable } from '../components/MandiTable';

export default function Market() {
  const { t, location } = useApp();
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'prices' ? 'prices' : 'products';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [mandi, setMandi] = useState('');
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const load = () => { setError(false); Promise.all([api.get('/products'), api.get('/prices')]).then(([p, m]) => setData({ products: p.data, prices: m.data })).catch(() => setError(true)); };
  useEffect(load, []);
  const categories = [['All', 'सभी उत्पाद'], ['Pesticides', 'कीटनाशक'], ['Bio-Insecticides', 'जैव कीटनाशक'], ['Fungicides', 'फफूंदनाशक'], ['Organic Fertilizers', 'जैविक खाद'], ['High-Yield Seeds', 'उन्नत बीज']];
  const products = data?.products.filter(p => (category === 'All' || p.category === category) && (p.name + p.name_hi + p.category).toLowerCase().includes(search.toLowerCase())) || [];
  const prices = data?.prices.filter(p => (!mandi || p.mandi === mandi) && (p.crop + p.crop_hi + p.mandi).toLowerCase().includes(search.toLowerCase())) || [];
  return <div className="container page-content"><PageHeading eyebrow="KRISHI MARKET" title={t('अच्छी फसल की अच्छी शुरुआत।', 'Good things start with your farm.')} description={t('ज़रूरी उत्पाद, उपयोग की जानकारी और मंडी के भाव।', 'Crop essentials, application guides and mandi price insights.')}><SampleBadge id="market-sample" /></PageHeading><div className="market-tabs" role="tablist"><button role="tab" aria-selected={tab === 'products'} className={tab === 'products' ? 'active' : ''} onClick={() => { setParams({}); setSearch(''); }} data-testid="products-tab"><Store size={18} />{t('कृषि उत्पाद', 'Farm essentials')}</button><button role="tab" aria-selected={tab === 'prices'} className={tab === 'prices' ? 'active' : ''} onClick={() => { setParams({ tab: 'prices' }); setSearch(''); }} data-testid="prices-tab"><ChartNoAxesCombined size={18} />{t('मंडी भाव', 'Mandi price tracker')}</button></div><div className="market-toolbar"><div className="search-field"><Search size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={tab === 'products' ? t('उत्पाद खोजें…', 'Search farm essentials…') : t('फसल या मंडी खोजें…', 'Search a crop or mandi…')} data-testid="market-search" aria-label="Search market" /></div>{tab === 'prices' && <select value={mandi} onChange={e => setMandi(e.target.value)} data-testid="mandi-filter" aria-label="Filter mandi"><option value="">{t('सभी मंडियाँ', 'All mandis')}</option><option>Bareilly</option><option>Lucknow</option><option>Agra</option></select>}<span className="result-count" data-testid="market-results-count">{tab === 'products' ? products.length : prices.length} {t('परिणाम', 'results')}</span></div>{tab === 'products' && <div className="category-filters">{categories.map(([en, hi]) => <button key={en} className={category === en ? 'active' : ''} onClick={() => setCategory(en)} data-testid={`filter-${en.toLowerCase().replaceAll(' ', '-')}`}>{t(hi, en)}</button>)}</div>}
    {error ? <ErrorState retry={load} /> : !data ? <Loading /> : tab === 'products' ? products.length ? <div className="product-grid">{products.map(p => <ProductCard key={p.id} product={p} />)}</div> : <div className="empty-state" data-testid="products-empty"><Search size={35} /><h2>{t('कोई उत्पाद नहीं मिला', 'No products found')}</h2><button className="btn btn-outline" onClick={() => { setSearch(''); setCategory('All'); }} data-testid="clear-market-filters">{t('फ़िल्टर हटाएँ', 'Clear filters')}</button></div> : <><MandiTable prices={prices} /><div className="price-source"><span data-testid="prices-disclaimer">{t('कीमतें नमूना डेटा हैं; वास्तविक दैनिक भाव नहीं। खरीद या बिक्री से पहले पुष्टि करें।', 'Prices are illustrative, not live daily rates. Verify before buying or selling.')}</span><a href="https://agmarknet.gov.in/" target="_blank" rel="noreferrer" className="text-link" data-testid="market-live-source">AGMARKNET<ArrowUpRight size={15} /></a></div></>}
    <div className="market-notice"><ShieldCheck size={23} /><p data-testid="market-notice">{t('सुरक्षित खेती सबसे पहले। उत्पाद, पैकेजिंग और दरें प्रदर्शन हेतु हैं। किसी भी दवा की मात्रा के लिए पंजीकृत लेबल और कृषि विशेषज्ञ की सलाह मानें।', 'Safer farming comes first. Products, packaging and prices are illustrative. Follow registered labels and expert advice for all crop protection doses.')}</p></div></div>;
}