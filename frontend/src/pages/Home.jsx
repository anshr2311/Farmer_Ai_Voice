import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowRight, AudioLines, ScanLine, Store, Headset, ShieldCheck, Sprout, CloudSun, BellRing, ChevronRight, Leaf, Check, Phone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LocationPicker } from '../components/Layout';
import { VoiceCompanion } from '../components/VoiceCompanion';
import { ProductCard } from '../components/ProductCard';
import { MandiTable } from '../components/MandiTable';
import { SectionHeading, SampleBadge, Loading, ErrorState } from '../components/Shared';
import { Telemetry } from '../components/Telemetry';
import { api } from '../lib/api';

export default function Home() {
  const { t, location } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState(false);
  const load = () => { setError(false); Promise.all([api.get('/products'), api.get('/prices')]).then(([products, prices]) => setData({ products: products.data, prices: prices.data })).catch(() => setError(true)); };
  useEffect(load, []);
  const tools = [
    { icon: AudioLines, title: t('अपनी भाषा में पूछें', 'Just ask, in your language'), sub: t('किसान वॉइस AI', 'Kisan Voice AI'), to: '/voice', color: 'green' },
    { icon: Store, title: t('सही भाव, सही फैसला', 'Right prices. Better decisions.'), sub: t('बाज़ार और मंडी भाव', 'Market & mandi prices'), to: '/market', color: 'amber' },
    { icon: ScanLine, title: t('फसल की सेहत जानें', 'A closer look at crop health'), sub: t('AI फसल रोग जाँच', 'AI crop disease scanner'), to: '/scanner', color: 'teal' },
    { icon: Headset, title: t('विशेषज्ञ हैं आपके साथ', 'An expert by your side'), sub: t('किसान सहायता केंद्र', 'Kisan advisory helpline'), to: '/helpline', color: 'blue' },
  ];
  return <>
    <div className="container welcome-row"><div><span className="welcome-label" data-testid="welcome-label">{t('नमस्ते, किसान साथी', 'Namaste, Kisan Saathi')} <span className="sun-glyph">☀</span></span><span className="welcome-sub" data-testid="welcome-subtitle">{t('आपकी मेहनत को मिले सही मार्गदर्शन।', 'A little guidance for all the hard work you do.')}</span></div><LocationPicker /></div>
    <section className="home-hero"><img className="hero-photo" src="/assets/farmer.jpg" alt="An Indian farmer walking through lush green fields" fetchPriority="high" /><div className="hero-shade" /><div className="container hero-content"><motion.div className="hero-copy" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}><div className="hero-eyebrow" data-testid="hero-eyebrow"><span />{t('हर किसान का डिजिटल साथी', 'YOUR EVERYDAY FARMING COMPANION')}</div><h1 data-testid="hero-title">{t('खेती की हर राह में,', 'Rooted in your land.')}<br /><span>{t('आपका अपना साथी।', 'Growing by your side.')}</span></h1><p data-testid="hero-description">{t('आपकी आवाज़ से, आपकी भाषा में।', 'Your voice. Your language. Your KisanGyan.')}<br />{t('फसल की सलाह से मंडी के भाव तक — सब एक जगह।', 'From healthier crops to better prices — all in one place.')}</p><div className="hero-ctas"><Link className="btn btn-mint" to="/voice" data-testid="hero-ask-button"><AudioLines size={19} />{t('किसान मित्र से पूछें', 'Ask Kisan Mitra')}<ArrowUpRight size={17} /></Link><Link className="hero-secondary" to="/scanner" data-testid="hero-scan-link"><ScanLine size={18} />{t('फसल की जाँच करें', 'Check your crop')}<ChevronRight size={15} /></Link></div><div className="hero-assurances" data-testid="hero-assurances"><span><ShieldCheck size={14} />{t('बिना लॉगिन', 'No login needed')}</span><i /><span><Check size={14} />{t('सरल और निःशुल्क', 'Simple & free')}</span><i /><span><Sprout size={14} />{t('किसान सबसे पहले', 'Farmer first')}</span></div></motion.div><motion.div className="hero-voice-wrap" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}><VoiceCompanion compact /></motion.div></div></section>
    <AdvisoryTicker />
    <div className="container home-main"><section className="quick-tools" aria-label="Farming tools">{tools.map((tool, i) => <motion.div key={tool.to} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}><Link to={tool.to} className="quick-tool" data-testid={`quick-${tool.to.slice(1)}`}><span className={`tool-icon ${tool.color}`}><tool.icon size={23} strokeWidth={1.7} /></span><div><h2>{tool.title}</h2><span>{tool.sub}</span></div><ArrowUpRight className="quick-arrow" size={17} /></Link></motion.div>)}</section>
    <div className="home-market-grid"><section><SectionHeading title={t('फसल की सुरक्षा, बेहतर पैदावार', 'Care for your crops. Grow more.')} subtitle={t('आपकी खेती के लिए ज़रूरी उत्पाद', 'Essentials for a thriving farm')} to="/market" link={t('सभी उत्पाद', 'Explore market')} />{error ? <ErrorState retry={load} /> : !data ? <Loading /> : <div className="home-products">{data.products.slice(0, 3).map(p => <ProductCard key={p.id} product={p} compact />)}</div>}<p className="section-footnote" data-testid="home-product-sample">{t('प्रदर्शन हेतु उत्पाद और कीमतें • उपयोग से पहले विशेषज्ञ की सलाह लें', 'Illustrative products & prices • Always seek expert advice before application')}</p></section>
    <section className="home-mandi"><SectionHeading title={t('मंडी भाव पर एक नज़र', 'A pulse on mandi prices')} to="/market?tab=prices" link={t('सभी भाव', 'All prices')} /><div className="mandi-context"><span><MapPinIcon />{location}, UP</span><SampleBadge id="home-mandi-sample" /></div>{data && <MandiTable prices={data.prices.filter(p => p.mandi === location).slice(0, 4)} compact />}<a href="https://agmarknet.gov.in/" target="_blank" rel="noreferrer" className="mandi-footer" data-testid="verify-live-prices">{t('वास्तविक भाव AGMARKNET पर देखें', 'Verify live prices on AGMARKNET')}<ArrowUpRight size={14} /></a></section></div>
    <section className="home-telemetry"><SectionHeading title={t('आपके खेत की नब्ज़', 'The pulse of your farm')} subtitle={t('मौसम, मिट्टी और फसल — एक साथ', 'Weather, soil and crop health, connected')} to="/farm" link={t('खेत की जानकारी', 'Farm insights')} /><Telemetry compact /></section>
    <section className="help-band"><div className="help-band-icon"><Headset size={32} strokeWidth={1.5} /></div><div><span className="eyebrow" data-testid="help-band-eyebrow">{t('कभी भी अकेले नहीं', 'YOU’RE NEVER FARMING ALONE')}</span><h2 data-testid="help-band-title">{t('सवाल छोटा हो या बड़ा, हम हैं ना।', 'Big question or small, there’s someone to call.')}</h2><p data-testid="help-band-description">{t('किसान कॉल सेंटर पर अपनी भाषा में सलाह पाएँ।', 'Get advice in your own language from the Kisan Call Centre.')}</p></div><a className="btn btn-primary" href="tel:18001801551" data-testid="home-call-helpline"><Phone size={18} />1800-180-1551<ArrowUpRight size={17} /></a></section>
    </div>
  </>;
}
const MapPinIcon = () => <span aria-hidden="true">⌖</span>;

const AdvisoryTicker = () => {
  const { t } = useApp();
  const [index, setIndex] = useState(0);
  useEffect(() => { const timer = setInterval(() => setIndex(i => (i + 1) % 2), 7000); return () => clearInterval(timer); }, []);
  const alerts = [t('मौसम सलाह: बारिश से पहले खेत की जल निकासी जाँचें और फसल को सुरक्षित रखें।', 'Weather advisory: Check field drainage and protect harvested crops ahead of rain.'), t('फसल सुरक्षा: मक्का की पत्तियों की नियमित जाँच करें और कीट दिखने पर विशेषज्ञ से संपर्क करें।', 'Crop care: Inspect maize leaves regularly and ask an expert if you spot pests.')];
  return <div className="advisory-ticker"><div className="container ticker-inner"><span className="ticker-label" data-testid="advisory-label"><BellRing size={15} />{t('कृषि सलाह', 'FARM ADVISORY')}</span><motion.p key={index} initial={{ opacity: 0 }} animate={{ opacity: 1 }} data-testid="advisory-message">{alerts[index]}</motion.p><span className="ticker-sample" data-testid="advisory-mode">{t('नमूना सलाह', 'Sample advisory')}</span><Link to="/helpline" aria-label="View advisory helpline" data-testid="advisory-link"><ArrowRight size={17} /></Link></div></div>;
};