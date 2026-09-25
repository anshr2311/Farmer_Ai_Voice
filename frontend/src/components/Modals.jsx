import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ArrowRight, Smartphone, ShieldCheck, CheckCircle2, LoaderCircle } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { useApp } from '../context/AppContext';
import { api, errorText, money } from '../lib/api';
import { toast } from './ui/sonner';

export const LoginModal = () => {
  const { loginOpen, setLoginOpen, setUser, t } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = async provider => {
    setBusy(true); setError('');
    try { const { data } = await api.post('/auth/demo', { provider, name: name.trim() || 'Kisan Saathi', ...(provider === 'mobile' ? { phone, otp } : {}) }); localStorage.setItem('kg-token', data.token); setUser(data.user); setLoginOpen(false); setStep(0); toast.success(t('आपका डेमो प्रोफ़ाइल तैयार है', 'Your demo profile is ready')); navigate('/farm'); }
    catch (e) { setError(errorText(e)); } finally { setBusy(false); }
  };
  return <Sheet open={loginOpen} onOpenChange={open => { setLoginOpen(open); setError(''); if (!open) setStep(0); }}><SheetContent className="login-sheet" data-testid="login-modal"><div className="login-illustration"><Sprout size={54} strokeWidth={1.3} /><span>KisanGyan</span><small>आपका अपना किसान मित्र</small></div><SheetTitle data-testid="login-title">{t('अपना खेत, अपना प्रोफ़ाइल', 'Your farm. Your own space.')}</SheetTitle><SheetDescription data-testid="login-description">{t('आपकी फसल, सवाल और रिपोर्ट — एक साथ।', 'Your crops, conversations and reports, together.')}</SheetDescription><div className="notice" data-testid="auth-demo-notice"><ShieldCheck size={19} /><span>{t('डेमो लॉगिन • SMS नहीं भेजा जाता। OTP: 123456। हर लॉगिन एक नया डेमो प्रोफ़ाइल बनाता है।', 'Demo login • No SMS is sent. OTP: 123456. Each login creates a new demo profile.')}</span></div><form onSubmit={e => { e.preventDefault(); step === 0 ? setStep(1) : login('mobile'); }} className="form-stack"><label>{t('आपका नाम', 'Your name')}<input data-testid="login-name" required minLength={2} maxLength={80} value={name} onChange={e => setName(e.target.value)} placeholder={t('अपना नाम लिखें', 'Enter your name')} /></label><label>{t('मोबाइल नंबर', 'Mobile number')}<div className="phone-input"><span>+91</span><input data-testid="login-phone" required inputMode="tel" pattern="[6-9][0-9]{9}" maxLength={10} value={phone} onChange={e => setPhone(e.target.value)} placeholder="98765 43210" disabled={step === 1} /></div></label>{step === 1 && <label>{t('डेमो OTP', 'Demo OTP')}<input data-testid="login-otp" required inputMode="numeric" maxLength={6} minLength={6} value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" autoFocus /></label>}{error && <p className="form-error" role="alert" data-testid="login-error">{error}</p>}<button className="btn btn-primary full" disabled={busy} data-testid="login-submit">{busy ? <LoaderCircle size={18} className="animate-spin" /> : <Smartphone size={18} />}{step === 0 ? t('डेमो OTP जारी रखें', 'Continue with demo OTP') : t('प्रोफ़ाइल खोलें', 'Open my profile')}<ArrowRight size={17} /></button></form><div className="or-divider"><span>{t('या', 'or')}</span></div><button className="btn btn-outline full" onClick={() => login('google')} disabled={busy} data-testid="google-demo-login"><span className="google-g">G</span>{t('Google के साथ जारी रखें (डेमो)', 'Continue with Google (demo)')}</button><button className="text-link guest-link" onClick={() => setLoginOpen(false)} data-testid="continue-as-guest">{t('अभी बिना लॉगिन जारी रखें', 'Continue as a guest')}<ArrowRight size={15} /></button></SheetContent></Sheet>;
};

export const RequestModal = () => {
  const { request, setRequest, t } = useApp();
  return <Dialog open={!!request} onOpenChange={open => !open && setRequest(null)}>{request && <DialogContent className="request-modal" data-testid="request-modal"><RequestForm key={request.product?.id || request.type} request={request} close={() => setRequest(null)} t={t} /></DialogContent>}</Dialog>;
};

const RequestForm = ({ request, close, t }) => {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const isOrder = !!request.product;
  const submit = async e => {
    e.preventDefault(); setBusy(true); setError('');
    const values = Object.fromEntries(new FormData(e.currentTarget));
    values.consent = values.consent === 'on';
    if (isOrder) { values.product_id = request.product.id; values.quantity = request.quantity; }
    try { const { data } = await api.post(isOrder ? '/orders' : '/callbacks', values); setResult(data); }
    catch (err) { setError(errorText(err)); } finally { setBusy(false); }
  };
  if (result) return <div className="success-content"><CheckCircle2 size={52} /><DialogTitle data-testid="request-success-title">{t('आपका अनुरोध सहेज लिया गया', 'Your request has been saved')}</DialogTitle><DialogDescription data-testid="request-confirmation">{t('प्रदर्शन संस्करण में कॉल या डिलीवरी शुरू नहीं होती। तत्काल सलाह के लिए हेल्पलाइन पर कॉल करें।', 'This demonstration does not dispatch calls or deliveries. Call the helpline for immediate advice.')}</DialogDescription><div className="reference" data-testid="request-reference">{result.id}</div>{result.total != null && <p data-testid="order-total">{t('नमूना कुल', 'Sample total')}: {money(result.total)}</p>}<a className="btn btn-primary full" href="tel:18001801551" data-testid="request-call-helpline">1800-180-1551</a><button className="btn btn-outline full" onClick={close} data-testid="request-done">{t('हो गया', 'Done')}</button></div>;
  return <><div className="modal-icon"><Smartphone size={25} /></div><DialogTitle data-testid="request-title">{isOrder ? t('उत्पाद के लिए पूछताछ', 'Product enquiry') : t('कृषि विशेषज्ञ से बात करें', 'Request an expert callback')}</DialogTitle><DialogDescription data-testid="request-description">{isOrder ? `${request.product.name} · ${request.quantity} × ${money(request.product.price)}` : t('आपकी खेती से जुड़ी समस्या, आपकी भाषा में।', 'Advice for your farm, in your own language.')}</DialogDescription><form className="form-stack" onSubmit={submit}><div className="form-row"><label>{t('नाम', 'Name')}<input name="name" required minLength={2} maxLength={80} data-testid="request-name" placeholder={t('आपका नाम', 'Your name')} /></label><label>{t('मोबाइल नंबर', 'Mobile number')}<input name="phone" required inputMode="tel" pattern="[6-9][0-9]{9}" maxLength={10} data-testid="request-phone" placeholder="9876543210" /></label></div><label>{t('विषय', 'Topic')}<select name="topic" data-testid="request-topic" defaultValue={isOrder ? 'Product enquiry' : 'Crop advice'}><option value="Crop advice">{t('फसल सलाह', 'Crop advice')}</option><option value="Disease diagnosis">{t('फसल रोग', 'Disease diagnosis')}</option><option value="Product enquiry">{t('उत्पाद पूछताछ', 'Product enquiry')}</option><option value="Government schemes">{t('सरकारी योजनाएँ', 'Government schemes')}</option></select></label><label>{t('सुविधाजनक समय', 'Preferred time')}<select name="preferred_time" data-testid="request-time"><option>Morning (9 AM – 12 PM)</option><option>Afternoon (12 PM – 4 PM)</option><option>Evening (4 PM – 6 PM)</option></select></label><label>{t('अपनी समस्या बताएँ (वैकल्पिक)', 'Your question (optional)')}<textarea name="message" rows={2} maxLength={1000} data-testid="request-message" /></label><label className="checkbox-label"><input type="checkbox" name="consent" required data-testid="request-consent" /><span>{t('मैं इस अनुरोध के लिए अपना नाम और नंबर सहेजने की सहमति देता/देती हूँ। डेमो में कॉल नहीं भेजी जाती।', 'I consent to saving my name and number for this request. Calls are not dispatched in this demo.')}</span></label>{error && <p className="form-error" role="alert" data-testid="request-error">{error}</p>}<button className="btn btn-primary full" disabled={busy} data-testid="request-submit">{busy && <LoaderCircle size={17} className="animate-spin" />}{t('अनुरोध सहेजें', 'Save request')}<ArrowRight size={17} /></button></form></>;
};