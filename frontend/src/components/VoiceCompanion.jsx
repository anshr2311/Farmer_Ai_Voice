import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Send, Volume2, Pause, Sparkles, AudioLines, RotateCcw, LoaderCircle, Play } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { errorText } from '../lib/api';
import { toast } from './ui/sonner';
import { sendAdvice } from '../lib/offlineQueue';
import { speakText } from '../lib/ecosystem';

export const VoiceCompanion = ({ compact = false }) => {
  const { language, t } = useApp();
  const [voiceLang, setVoiceLang] = useState(language); const [question, setQuestion] = useState('');
  const [phase, setPhase] = useState('idle'); const [result, setResult] = useState(null); const [playing, setPlaying] = useState(false);
  const recognition = useRef(null); const alive = useRef(true); const speaking = useRef(false);
  useEffect(() => { setVoiceLang(language); setResult(null); window.speechSynthesis?.cancel(); setPlaying(false); }, [language]);
  useEffect(() => { alive.current = true; return () => { alive.current = false; recognition.current?.abort(); window.speechSynthesis?.cancel(); }; }, []);
  const samples = t(['मेरी फसल के पत्ते पीले हो रहे हैं, क्या करूँ?', 'आज टमाटर का मंडी भाव क्या है?', 'बारिश से पहले फसल की देखभाल कैसे करें?'], ['My crop leaves are turning yellow. What should I do?', 'What is the tomato mandi price?', 'How should I prepare my crops for rain?']);
  const replay = (answer = result?.answer) => {
    if (!answer) return;
    if (playing) { window.speechSynthesis?.pause(); setPlaying(false); return; }
    if (window.speechSynthesis?.paused) { window.speechSynthesis.resume(); setPlaying(true); return; }
    if (speakText(answer, voiceLang, () => alive.current && setPlaying(false))) setPlaying(true);
    else toast.info(t('आवाज़ उपलब्ध नहीं है। लिखित उत्तर पढ़ें।', 'Audio is unavailable in this browser. Please read the answer.'));
  };
  const ask = async text => {
    if (text.trim().length < 3 || phase === 'thinking') return;
    window.speechSynthesis?.cancel(); setPlaying(false); setQuestion(text); setPhase('thinking');
    try { const data = await sendAdvice(text, voiceLang); if (!alive.current) return; setResult(data); setPhase('answered'); if (speaking.current && !data.queued) { speakText(data.answer, voiceLang, () => alive.current && setPlaying(false)); setPlaying(true); } speaking.current = false; }
    catch (e) { if (alive.current) { toast.error(errorText(e)); setPhase('idle'); } }
  };
  const microphone = () => {
    if (phase === 'listening') { recognition.current?.stop(); return; }
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { toast.info(t('इस ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं। नमूना सवाल चुनें या लिखें।', 'Voice input is not supported here. Use a sample question or type your question.')); return; }
    if (!navigator.onLine) { toast.info(t('वॉइस पहचान के लिए इंटरनेट लग सकता है। सवाल लिखकर ऑफ़लाइन सहेज सकते हैं।', 'Browser voice recognition may need internet. Type a question to save it offline.')); return; }
    recognition.current?.abort(); window.speechSynthesis?.cancel(); setPlaying(false);
    const instance = new Recognition(); recognition.current = instance;
    instance.lang = { hi: 'hi-IN', en: 'en-IN', mr: 'mr-IN', pa: 'pa-IN' }[voiceLang]; instance.interimResults = false; instance.continuous = false;
    instance.onresult = event => { const transcript = event.results[0]?.[0]?.transcript; if (transcript && alive.current) { speaking.current = true; ask(transcript); } };
    instance.onerror = event => { if (!alive.current || event.error === 'aborted') return; setPhase('idle'); toast.info(event.error === 'not-allowed' ? t('माइक्रोफ़ोन की अनुमति नहीं मिली। नमूना सवाल चुनें या लिखें।', 'Microphone permission was denied. Choose a sample or type instead.') : t('आवाज़ नहीं मिल सकी। फिर कोशिश करें या सवाल लिखें।', 'Could not capture speech. Try again or type your question.')); };
    instance.onend = () => { if (alive.current) setPhase(value => value === 'listening' ? 'idle' : value); };
    try { instance.start(); setPhase('listening'); } catch (_) { setPhase('idle'); toast.info(t('माइक्रोफ़ोन शुरू नहीं हुआ। फिर प्रयास करें।', 'Microphone could not start. Please try again.')); }
  };
  const id = compact ? 'hero' : 'voice';
  const reset = () => { recognition.current?.abort(); window.speechSynthesis?.cancel(); setPlaying(false); setResult(null); setQuestion(''); setPhase('idle'); };
  return <div className={`voice-companion ${compact ? 'compact-voice' : 'expanded-voice'}`} data-testid={`${id}-companion`}><div className="voice-topline"><span><Sparkles size={14} />AgriSathi {t('वॉइस AI', 'Voice AI')}</span><span className="voice-demo" data-testid={`${id}-simulation`}>{t('नमूना सलाह', 'SAMPLE ADVICE')}</span></div>{!compact && <h2 data-testid="voice-greeting">{t('नमस्ते! मैं आपका AgriSathi हूँ।', 'Namaste! I’m your AgriSathi.')}</h2>}
    <div className={`microphone-scene ${phase === 'listening' || playing ? 'is-listening' : ''}`}><div className="mic-ring ring-outer" /><div className="mic-ring ring-inner" /><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.94 }} className="mic-button" onClick={microphone} disabled={phase === 'thinking'} aria-label={phase === 'listening' ? 'Stop listening' : 'Talk to AgriSathi'} data-testid={`${id}-microphone`}>{phase === 'thinking' ? <LoaderCircle size={34} className="animate-spin" /> : <Mic size={compact ? 33 : 40} strokeWidth={1.6} />}</motion.button><div className="wave-bars" aria-hidden="true">{Array.from({ length: 15 }, (_, i) => <motion.span key={i} animate={{ height: phase === 'listening' || playing ? [5, 8 + ((i * 7) % 22), 5] : 4 + ((i * 7) % 13) }} transition={{ repeat: Infinity, duration: 0.7, delay: i * 0.06 }} />)}</div></div>
    <p className="mic-prompt" aria-live="polite" data-testid={`${id}-voice-status`}>{phase === 'listening' ? t('बोलिए, सुन रहा हूँ…', 'Listening to you…') : phase === 'thinking' ? t('सवाल पर काम हो रहा है…', 'Working on your question…') : t('AgriSathi से बात करें', 'Talk to AgriSathi')}</p><p className="mic-subtitle" data-testid={`${id}-voice-subtitle`}>{t('आपकी आवाज़। आपकी भाषा। आपका साथी।', 'Your voice. Your language. Your companion.')}</p>
    {compact ? <button className="hero-sample-button" data-testid="hero-sample-question" disabled={phase === 'thinking'} onClick={() => ask(samples[0])}><Play size={11} />{t('नमूना सवाल', 'Try a sample')}</button> : <><div className="voice-language-select"><label htmlFor="voice-language">{t('आवाज़ की भाषा', 'Voice language')}</label><select id="voice-language" value={voiceLang} data-testid="voice-language" onChange={e => { reset(); setVoiceLang(e.target.value); }}><option value="hi">हिन्दी</option><option value="en">English</option><option value="mr">मराठी</option><option value="pa">ਪੰਜਾਬੀ</option></select></div><form className="voice-input" onSubmit={e => { e.preventDefault(); ask(question); }}><input value={question} onChange={e => setQuestion(e.target.value)} minLength={3} maxLength={1000} required placeholder={t('या अपना सवाल यहाँ लिखें…', 'Or type your farming question…')} aria-label="Farming question" data-testid="voice-question" /><button type="submit" className="send-btn" aria-label="Send question" disabled={phase === 'thinking'} data-testid="voice-send"><Send size={19} /></button></form></>}
    {result && <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="voice-answer" data-testid={`${id}-answer`}><div className="answer-heading"><span><AudioLines size={16} />{result.queued ? t('ऑफ़लाइन • सिंक बाकी', 'Offline · pending sync') : t('AgriSathi की नमूना सलाह', 'AgriSathi sample advice')}</span><button onClick={() => replay()} aria-label={playing ? 'Pause answer' : 'Replay advice'} title={playing ? 'Pause answer' : 'Replay advice'} data-testid={`${id}-play-answer`}>{playing ? <Pause size={18} /> : <Volume2 size={18} />}</button></div><p data-testid={`${id}-answer-text`}>{result.answer}</p>{result.cached && <small data-testid={`${id}-cached-answer`}>{t('पिछला सहेजा गया उत्तर', 'Previously saved answer')}</small>}<button className="text-link" onClick={reset} data-testid={`${id}-reset`}><RotateCcw size={13} />{t('नया सवाल', 'Ask another question')}</button></motion.div>}
    {!compact && <div className="sample-questions"><span data-testid="sample-questions-label">{t('नमूना प्रश्न', 'Try a sample question')}</span>{samples.map((s, i) => <button key={s} onClick={() => ask(s)} disabled={phase === 'thinking'} data-testid={`sample-question-${i}`}>{s}<span aria-hidden="true">↗</span></button>)}</div>}
  </div>;
};