import { ArrowUpRight, LoaderCircle, TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const PageHeading = ({ eyebrow, title, description, children }) => <div className="page-heading"><div><div className="eyebrow" data-testid="page-eyebrow">{eyebrow}</div><h1 data-testid="page-title">{title}</h1><p data-testid="page-description">{description}</p></div>{children}</div>;
export const SectionHeading = ({ title, subtitle, to, link }) => <div className="section-heading"><div><h2 data-testid={`section-${to?.replace('/', '') || 'heading'}`}>{title}</h2>{subtitle && <p data-testid={`section-subtitle-${to?.replace('/', '') || 'heading'}`}>{subtitle}</p>}</div>{to && <Link className="text-link" to={to} data-testid={`view-${to.replace('/', '')}`}>{link}<ArrowUpRight size={16} /></Link>}</div>;
export const Loading = () => <div className="loading-state" data-testid="loading-state"><LoaderCircle className="animate-spin" size={25} /> Loading / लोड हो रहा है…</div>;
export const ErrorState = ({ retry }) => <div className="empty-state" data-testid="error-state"><TriangleAlert size={28} /><p>Unable to load. / जानकारी लोड नहीं हुई।</p><button className="btn btn-primary" onClick={retry} data-testid="retry-button">Try again / फिर प्रयास करें</button></div>;
export const SampleBadge = ({ id = 'sample-data-badge' }) => { const { t } = useApp(); return <span className="sample-badge" data-testid={id}><span />{t('नमूना डेटा', 'Sample data')}</span>; };