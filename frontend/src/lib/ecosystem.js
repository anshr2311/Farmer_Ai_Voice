export const practices = [
  ['water-saving', 'जल संरक्षण', 'Water-saving irrigation'], ['compost', 'जैविक खाद', 'Compost application'],
  ['cover-crop', 'कवर क्रॉप', 'Cover cropping'], ['residue-retention', 'फसल अवशेष संरक्षण', 'Residue retention'],
  ['no-till', 'कम जुताई', 'Reduced tillage'], ['agroforestry', 'कृषि वानिकी', 'Agroforestry'],
];
export const practiceName = (code, language = 'en') => { const item = practices.find(p => p[0] === code); return item ? item[language === 'hi' ? 1 : 2] : code; };
export const statusName = (status, t) => ({ recorded: t('दर्ज', 'Recorded'), demo_verified: t('डेमो सत्यापित', 'Demo verified'), listed: t('रुचि दर्ज', 'Interest recorded'), queued: t('सिंक बाकी', 'Pending sync') }[status] || status);
export const downloadFile = (content, name, type = 'application/json') => { const url = URL.createObjectURL(new Blob([content], { type })); const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); };
export const speakText = (text, language = 'hi', done = () => {}) => {
  if (!window.speechSynthesis) return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = { hi: 'hi-IN', en: 'en-IN', mr: 'mr-IN', pa: 'pa-IN' }[language] || 'en-IN';
  utterance.rate = 0.9; utterance.onend = done; utterance.onerror = done;
  window.speechSynthesis.speak(utterance); return true;
};