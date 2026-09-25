import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export const DemoNote = ({ children, id = 'ecosystem-demo-note' }) => <div className="eco-demo-note" data-testid={id}><span className="demo-dot" /><span>{children}</span></div>;
export const EcoTitle = ({ eyebrow, title, subtitle, children }) => <div className="eco-page-title"><div><span className="eyebrow" data-testid="eco-eyebrow">{eyebrow}</span><h1 data-testid="eco-page-title">{title}</h1><p data-testid="eco-page-subtitle">{subtitle}</p></div>{children}</div>;
export const Metric = ({ label, value, hint, icon: Icon, color = 'green', id }) => <article className={`eco-metric ${color}`} data-testid={`metric-${id}`}><div><span data-testid={`metric-label-${id}`}>{label}</span>{Icon && <Icon size={19} />}</div><strong data-testid={`metric-value-${id}`}>{value}</strong>{hint && <small data-testid={`metric-hint-${id}`}>{hint}</small>}</article>;
export const EcoSection = ({ title, to, children, id }) => <section className="eco-section"><div className="eco-section-title"><h2 data-testid={`${id}-title`}>{title}</h2>{to && <Link to={to} data-testid={`${id}-link`} aria-label={title}><ArrowUpRight size={19} /></Link>}</div>{children}</section>;
export const Journey = ({ active = 0 }) => {
  const { t } = useApp();
  const stages = [['/voice', 'बोलें', 'Speak'], ['/monitoring', 'समझें', 'Understand'], ['/advisory', 'सही कदम', 'Act'], ['/ledger', 'दर्ज करें', 'Record'], ['/credits', 'मूल्य पाएँ', 'Explore value'], ['/network', 'जुड़ें', 'Connect']];
  return <div className="eco-journey" aria-label="Farmer journey">{stages.map(([to, hi, en], i) => <Link to={to} key={to} className={i === active ? 'active' : ''} data-testid={`journey-${en.toLowerCase().replaceAll(' ', '-')}`}><span>{String(i + 1).padStart(2, '0')}</span>{t(hi, en)}{i !== 5 && <ArrowRight size={12} />}</Link>)}</div>;
};