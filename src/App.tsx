import { useState, useEffect } from 'react';
import { 
  Shield, 
  Crown,
  Phone, 
  MapPin, 
  Bell, 
  AlertTriangle, 
  Settings, 
  RefreshCw, 
  Info,
  Globe,
  Lock,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
interface Config {
  serverUrl: string;
  mockMode: boolean;
  language: 'en' | 'ar';
  keywords: string[];
  blacklistNumbers: string[];
  privacySettings: {
    collectApps: boolean;
    collectLocation: boolean;
    collectComms: boolean;
  };
}

interface RiskData {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  score: number;
  recommendations: string[];
}

// --- Translations ---
const translations = {
  en: {
    title: "Leader Guard",
    riskLevel: "Overall Risk Level",
    low: "LOW",
    medium: "MEDIUM",
    high: "HIGH",
    critical: "CRITICAL",
    deviceAnalysis: "Device Analysis",
    commsSecurity: "Comms Security",
    movementTracking: "Movement Tracking",
    digitalFootprint: "Digital Footprint",
    panicButton: "PANIC BUTTON",
    update: "Update",
    settings: "Settings",
    mockMode: "Mock Mode Active",
    consentTitle: "Privacy Consent",
    consentText: "This application collects security-related data for threat assessment. No private message content is stored.",
    agree: "I Agree",
    appsFound: "Apps Analyzed",
    unknownCalls: "Unknown Calls",
    locationStatus: "Location Tracking",
    active: "Active",
    inactive: "Inactive",
    notifications: "Alerts Detected",
    emergencySent: "Emergency Alert Sent!",
    dynamicRoaming: "Dynamic Roaming",
    roamingStatus: "IP Rotation",
    currentIp: "Current IP",
    rotations: "Rotations",
    nodes: "Nodes",
    tor: "Tor",
    encryption: "Encryption",
    decoy: "Decoy Traffic",
    hopping: "Hopping",
    enabled: "Enabled",
    adversarialAi: "Adversarial AI",
    threatDetection: "Threat Detection",
    jamming: "Jamming",
    cameraDetected: "Camera Detected",
    droneDetected: "Drone Detected",
    micDetected: "Mic Detected",
    adversarialSettings: "Adversarial Configuration",
    visualJamming: "Visual Jamming",
    audioJamming: "Audio Jamming",
    hapticJamming: "Haptic Jamming",
    adversarialPatch: "Adversarial Patch",
    roamingSettings: "Roaming Configuration",
    roamingFreq: "Rotation Frequency",
    med: "Medium",
    auto: "Auto (Risk-based)",
    torEnabled: "Tor Network",
    proxyChain: "Multi-layer Proxy"
  },
  ar: {
    title: "Leader Guard",
    riskLevel: "مستوى الخطر الإجمالي",
    low: "منخفض",
    medium: "متوسط",
    high: "عالي",
    critical: "حرج",
    deviceAnalysis: "تحليل الجهاز",
    commsSecurity: "أمن الاتصالات",
    movementTracking: "مراقبة التنقلات",
    digitalFootprint: "الفضاء الرقمي",
    panicButton: "زر الطوارئ",
    update: "تحديث",
    settings: "الإعدادات",
    mockMode: "وضع المحاكاة نشط",
    consentTitle: "موافقة الخصوصية",
    consentText: "يقوم هذا التطبيق بجمع بيانات أمنية لتقييم التهديدات. لا يتم تخزين محتوى الرسائل الخاصة.",
    agree: "أوافق",
    appsFound: "تطبيقات تم تحليلها",
    unknownCalls: "مكالمات مجهولة",
    locationStatus: "تتبع الموقع",
    active: "نشط",
    inactive: "غير نشط",
    notifications: "تنبيهات مكتشفة",
    emergencySent: "تم إرسال تنبيه طوارئ!",
    earlyWarning: "تحذير مبكر",
    evacuationTime: "وقت الإخلاء",
    minutes: "دقائق",
    confirmSafety: "تأكيد الوصول للأمان",
    warningMessage: "تحذير! تم اكتشاف خطر عالي. يرجى الانتقال إلى مكان آمن فوراً.",
    testAlert: "اختبار التحذير الصوتي",
    dynamicRoaming: "التنقل الرقمي الديناميكي",
    roamingStatus: "تدوير IP",
    currentIp: "عنوان IP الحالي",
    rotations: "عمليات التدوير",
    nodes: "العقد",
    tor: "شبكة Tor",
    encryption: "التشفير",
    decoy: "حركة مرور وهمية",
    hopping: "متنقل",
    enabled: "مفعل",
    adversarialAi: "الذكاء الاصطناعي المضاد",
    threatDetection: "اكتشاف التهديدات",
    jamming: "التشويش",
    cameraDetected: "تم اكتشاف كاميرا",
    droneDetected: "تم اكتشاف درون",
    micDetected: "تم اكتشاف ميكروفون",
    adversarialSettings: "إعدادات المضاد",
    visualJamming: "تشويش بصري",
    audioJamming: "تشويش صوتي",
    hapticJamming: "تشويش حركي",
    adversarialPatch: "رقعة مضادة",
    roamingSettings: "إعدادات التنقل",
    roamingFreq: "وتيرة التدوير",
    med: "متوسط",
    auto: "تلقائي (حسب الخطر)",
    torEnabled: "شبكة Tor",
    proxyChain: "وكيل متعدد الطبقات"
  }
};

interface AlertState {
  active: boolean;
  level: string;
  message: string;
  timeLeft: number;
}

export default function App() {
  const [config, setConfig] = useState<Config | null>(null);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [hasConsent, setHasConsent] = useState(false);
  const [risk, setRisk] = useState<RiskData>({ overallRisk: 'LOW', score: 10, recommendations: [] });
  const [loading, setLoading] = useState(false);
  const [panicActive, setPanicActive] = useState(false);
  const [alert, setAlert] = useState<AlertState>({ active: false, level: '', message: '', timeLeft: 0 });
  const [showDev, setShowDev] = useState(false);
  const [roaming, setRoaming] = useState({
    active: false,
    currentIp: '192.168.1.1',
    rotations: 0,
    frequency: 'auto',
    useTor: true,
    useProxyChain: true
  });
  const [adversarial, setAdversarial] = useState({
    active: false,
    visualJamming: true,
    audioJamming: true,
    hapticJamming: true,
    usePatch: true,
    lastThreat: null as string | null
  });

  const t = translations[lang];

  useEffect(() => {
    let timer: any;
    if (alert.active && alert.timeLeft > 0) {
      timer = setInterval(() => {
        setAlert(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
    } else if (alert.timeLeft === 0 && alert.active) {
      setAlert(prev => ({ ...prev, active: false }));
    }
    return () => clearInterval(timer);
  }, [alert.active, alert.timeLeft]);

  const triggerEarlyWarning = (level: string, message: string, minutes: number) => {
    setAlert({ active: true, level, message, timeLeft: minutes * 60 });
    
    // Auto-IP rotation on warning
    if (roaming.active) {
      rotateIp();
    }

    // Auto-Adversarial Jamming on warning
    if (adversarial.active) {
      setAdversarial(prev => ({ ...prev, lastThreat: 'CRITICAL_ALERT' }));
    }

    // Voice Warning (TTS)
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }

    // Vibration (if supported)
    if ('vibrate' in navigator) {
      navigator.vibrate([500, 200, 500, 200, 500]);
    }
  };

  const rotateIp = () => {
    const newIp = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    setRoaming(prev => ({
      ...prev,
      currentIp: newIp,
      rotations: prev.rotations + 1
    }));
  };

  useEffect(() => {
    let interval: any;
    if (roaming.active) {
      const freqMs = roaming.frequency === 'high' ? 30000 : roaming.frequency === 'med' ? 60000 : 120000;
      interval = setInterval(rotateIp, freqMs);
    }
    return () => clearInterval(interval);
  }, [roaming.active, roaming.frequency]);

  useEffect(() => {
    fetch('/config.json')
      .then(res => res.json())
      .then(data => {
        setConfig(data);
        setLang(data.language);
      });
  }, []);

  const runAssessment = async () => {
    setLoading(true);
    // Simulate data collection
    const mockData = {
      deviceData: { appsCount: Math.floor(Math.random() * 150) },
      commsData: { unknownCalls: Math.floor(Math.random() * 10) },
      locationData: { isAnomaly: Math.random() > 0.7 }
    };

    try {
      const res = await fetch('/api/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mockData)
      });
      const result = await res.json();
      setRisk(result);
    } catch (e) {
      console.error("Assessment failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handlePanic = () => {
    setPanicActive(true);
    setTimeout(() => setPanicActive(false), 3000);
  };

  if (!config) return <div className="flex items-center justify-center h-screen bg-slate-900 text-white">Loading...</div>;

  if (!hasConsent) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800 p-8 rounded-2xl border border-slate-700 max-w-md w-full shadow-2xl"
        >
          <div className="flex justify-center mb-6">
            <Lock className="w-16 h-16 text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4 text-center">{t.consentTitle}</h1>
          <p className="text-slate-400 mb-8 text-center leading-relaxed">
            {t.consentText}
          </p>
          <button 
            onClick={() => setHasConsent(true)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-5 h-5" />
            {t.agree}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen mesh-gradient text-slate-100 font-sans selection:bg-amber-500/30 ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-slate-950/40 backdrop-blur-2xl sticky top-0 z-50 border-b border-white/5">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.4)] border border-amber-400/50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <Shield className="w-7 h-7 text-slate-950" />
            <Crown className="w-3.5 h-3.5 text-amber-100 absolute -top-1 -right-1 drop-shadow-md animate-bounce" />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-amber-400 via-amber-200 to-white leading-none">
              LEADER
            </h1>
            <span className="text-[11px] font-bold tracking-[0.3em] text-slate-500 uppercase leading-none mt-1.5">
              GUARD <span className="text-amber-500/50 ml-1">SYSTEM</span>
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowDev(!showDev)}
            className="p-2.5 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10"
            title="Developer Settings"
          >
            <Settings className={`w-5 h-5 ${showDev ? 'text-amber-500' : 'text-slate-400'}`} />
          </button>
          <button 
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="p-2.5 hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-white/10"
          >
            <Globe className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-8 pb-32">
        {/* Developer Settings */}
        <AnimatePresence>
          {showDev && (
            <motion.div 
              initial={{ height: 0, opacity: 0, y: -20 }}
              animate={{ height: 'auto', opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -20 }}
              className="overflow-hidden"
            >
              <div className="p-6 glass-card rounded-[2rem] border-amber-500/20 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <h3 className="text-xs font-bold text-amber-500 uppercase tracking-[0.2em]">System Overrides</h3>
                </div>
                <button 
                  onClick={() => triggerEarlyWarning('CRITICAL', t.warningMessage, 15)}
                  className="w-full py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  <AlertTriangle className="w-5 h-5" />
                  {t.testAlert} (15m)
                </button>

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.roamingSettings}</span>
                    <button 
                      onClick={() => setRoaming(prev => ({ ...prev, active: !prev.active }))}
                      className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                        roaming.active ? 'bg-emerald-500 text-white' : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {roaming.active ? t.active : t.inactive}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t.roamingFreq}</label>
                      <select 
                        value={roaming.frequency}
                        onChange={(e) => setRoaming(prev => ({ ...prev, frequency: e.target.value }))}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white outline-none"
                      >
                        <option value="low">{t.low}</option>
                        <option value="med">{t.med}</option>
                        <option value="high">{t.high}</option>
                        <option value="auto">{t.auto}</option>
                      </select>
                    </div>
                    <div className="flex flex-col justify-end gap-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={roaming.useTor} 
                          onChange={() => setRoaming(prev => ({ ...prev, useTor: !prev.useTor }))}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded border transition-all ${roaming.useTor ? 'bg-amber-500 border-amber-500' : 'border-white/20'}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{t.torEnabled}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={roaming.useProxyChain} 
                          onChange={() => setRoaming(prev => ({ ...prev, useProxyChain: !prev.useProxyChain }))}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded border transition-all ${roaming.useProxyChain ? 'bg-amber-500 border-amber-500' : 'border-white/20'}`} />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{t.proxyChain}</span>
                      </label>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.adversarialSettings}</span>
                      <button 
                        onClick={() => setAdversarial(prev => ({ ...prev, active: !prev.active }))}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                          adversarial.active ? 'bg-amber-500 text-white' : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        {adversarial.active ? t.active : t.inactive}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={adversarial.visualJamming} onChange={() => setAdversarial(prev => ({ ...prev, visualJamming: !prev.visualJamming }))} className="hidden" />
                        <div className={`w-3 h-3 rounded border transition-all ${adversarial.visualJamming ? 'bg-amber-500 border-amber-500' : 'border-white/20'}`} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{t.visualJamming}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={adversarial.audioJamming} onChange={() => setAdversarial(prev => ({ ...prev, audioJamming: !prev.audioJamming }))} className="hidden" />
                        <div className={`w-3 h-3 rounded border transition-all ${adversarial.audioJamming ? 'bg-amber-500 border-amber-500' : 'border-white/20'}`} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{t.audioJamming}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={adversarial.hapticJamming} onChange={() => setAdversarial(prev => ({ ...prev, hapticJamming: !prev.hapticJamming }))} className="hidden" />
                        <div className={`w-3 h-3 rounded border transition-all ${adversarial.hapticJamming ? 'bg-amber-500 border-amber-500' : 'border-white/20'}`} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{t.hapticJamming}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={adversarial.usePatch} onChange={() => setAdversarial(prev => ({ ...prev, usePatch: !prev.usePatch }))} className="hidden" />
                        <div className={`w-3 h-3 rounded border transition-all ${adversarial.usePatch ? 'bg-amber-500 border-amber-500' : 'border-white/20'}`} />
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">{t.adversarialPatch}</span>
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => { setAdversarial(prev => ({ ...prev, lastThreat: 'CAMERA' })); rotateIp(); }} className="py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400">Sim Cam</button>
                      <button onClick={() => { setAdversarial(prev => ({ ...prev, lastThreat: 'DRONE' })); rotateIp(); }} className="py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400">Sim Drone</button>
                      <button onClick={() => { setAdversarial(prev => ({ ...prev, lastThreat: 'MIC' })); }} className="py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-slate-400">Sim Mic</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Risk Card - Bento Large */}
        <motion.div 
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`relative p-10 rounded-[2.5rem] border-2 shadow-2xl overflow-hidden group transition-all duration-700 ${
            risk.overallRisk === 'CRITICAL' ? 'bg-red-950/20 border-red-500/30' :
            risk.overallRisk === 'HIGH' ? 'bg-amber-950/20 border-amber-500/30' :
            'bg-slate-900/40 border-white/10'
          }`}
        >
          {/* Holographic Scan Line */}
          <motion.div 
            animate={{ top: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent blur-sm z-20"
          />
          <motion.div 
            animate={{ top: ['-100%', '200%'] }}
            transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
            className="absolute left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/5 to-transparent pointer-events-none"
          />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-3">{t.riskLevel}</p>
              <h2 className={`text-6xl font-black tracking-tighter ${
                risk.overallRisk === 'CRITICAL' ? 'text-red-500' :
                risk.overallRisk === 'HIGH' ? 'text-amber-500' :
                'text-emerald-400'
              }`}>
                {t[risk.overallRisk.toLowerCase() as keyof typeof t]}
              </h2>
              <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm font-medium">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
                {loading ? 'Analyzing...' : 'System Secure'}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full animate-pulse" />
              <svg className="w-32 h-32 transform -rotate-90 relative z-10">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <motion.circle 
                  cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="10" fill="transparent" 
                  strokeDasharray="364.4"
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 364.4 }}
                  animate={{ strokeDashoffset: 364.4 - (364.4 * risk.score / 100) }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className={`${
                    risk.overallRisk === 'CRITICAL' ? 'text-red-500' :
                    risk.overallRisk === 'HIGH' ? 'text-amber-500' :
                    'text-emerald-400'
                  } drop-shadow-[0_0_10px_currentColor]`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <span className="text-3xl font-black tracking-tighter">{risk.score}%</span>
              </div>
            </div>
          </div>

          <button 
            onClick={runAssessment}
            disabled={loading}
            className="absolute bottom-6 right-6 p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-90"
          >
            <RefreshCw className={`w-6 h-6 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </motion.div>

        {/* Bento Grid Modules */}
        <div className="grid grid-cols-2 gap-4">
          <ModuleCard 
            icon={<Shield className="text-blue-400 w-6 h-6" />} 
            title={t.deviceAnalysis} 
            value="124" 
            sub={t.appsFound} 
          />
          <ModuleCard 
            icon={<Phone className="text-purple-400 w-6 h-6" />} 
            title={t.commsSecurity} 
            value="3" 
            sub={t.unknownCalls} 
          />
          <ModuleCard 
            icon={<MapPin className="text-emerald-400 w-6 h-6" />} 
            title={t.movementTracking} 
            value={t.active} 
            sub={t.locationStatus} 
          />
          <ModuleCard 
            icon={<Globe className="text-amber-400 w-6 h-6" />} 
            title={t.dynamicRoaming} 
            value={roaming.active ? roaming.currentIp : t.inactive} 
            sub={`${t.rotations}: ${roaming.rotations}`} 
            className={roaming.active ? 'border-amber-500/30 bg-amber-500/5' : ''}
            details={roaming.active ? [
              { label: t.nodes, value: "3" },
              { label: t.tor, value: roaming.useTor ? t.active : t.inactive },
              { label: t.encryption, value: t.hopping },
              { label: t.decoy, value: t.enabled }
            ] : []}
          />
          <ModuleCard 
            icon={<AlertTriangle className="text-red-400 w-6 h-6" />} 
            title={t.adversarialAi} 
            value={adversarial.active ? t.active : t.inactive} 
            sub={t.threatDetection} 
            className={adversarial.active ? 'border-red-500/30 bg-red-500/5' : ''}
            details={adversarial.active ? [
              { label: t.jamming, value: adversarial.lastThreat ? t.active : t.inactive },
              { label: "Status", value: adversarial.lastThreat ? (adversarial.lastThreat === 'CAMERA' ? t.cameraDetected : adversarial.lastThreat === 'DRONE' ? t.droneDetected : t.micDetected) : "Secure" }
            ] : []}
          />
        </div>

        {/* Panic Button - High Impact */}
        <div className="relative group">
          <div className="absolute inset-0 bg-red-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
          <button 
            onClick={handlePanic}
            className={`relative w-full py-10 rounded-[2.5rem] font-black text-3xl transition-all overflow-hidden flex flex-col items-center gap-4 ${
              panicActive ? 'bg-white text-red-600' : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <motion.div
              animate={panicActive ? { scale: [1, 1.5, 1] } : {}}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <AlertTriangle className="w-12 h-12" />
            </motion.div>
            <span className="tracking-tighter uppercase">{panicActive ? t.emergencySent : t.panicButton}</span>
            
            {/* Button Shine */}
            <motion.div 
              animate={{ left: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
            />
          </button>
        </div>

        {/* Mock Indicator */}
        {config.mockMode && (
          <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-slate-600 uppercase tracking-[0.4em] py-8">
            <div className="w-1 h-1 rounded-full bg-slate-700" />
            {t.mockMode}
            <div className="w-1 h-1 rounded-full bg-slate-700" />
          </div>
        )}
      </main>

      {/* Recommendations - Floating Drawer Style */}
      <AnimatePresence>
        {risk.recommendations.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-40 p-8 glass-card rounded-t-[3rem] border-t border-white/10"
          >
            <div className="max-w-lg mx-auto">
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                <Info className="w-4 h-4 text-amber-500" />
                Strategic Directives
              </h3>
              <div className="grid gap-3">
                {risk.recommendations.map((rec, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 text-sm text-slate-300 bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                    {rec}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Emergency Overlay - Immersive */}
      <AnimatePresence>
        {alert.active && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-12 text-center text-white overflow-hidden"
          >
            {/* Atmospheric Red Pulse */}
            <motion.div 
              animate={{ 
                opacity: [0.4, 0.8, 0.4],
                scale: [1, 1.2, 1]
              }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 bg-red-950"
            />
            
            <div className="absolute inset-0 overflow-hidden opacity-20">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.2),transparent_70%)]" />
              <motion.div 
                animate={{ y: ['-100%', '100%'] }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-b from-transparent via-red-500 to-transparent h-1/2 w-full"
              />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <motion.div 
                animate={{ 
                  scale: [1, 1.1, 1],
                  filter: ["drop-shadow(0 0 20px rgba(255,0,0,0.5))", "drop-shadow(0 0 40px rgba(255,0,0,0.8))", "drop-shadow(0 0 20px rgba(255,0,0,0.5))"]
                }}
                transition={{ repeat: Infinity, duration: 1 }}
                className="mb-12"
              >
                <AlertTriangle className="w-40 h-40 text-red-500" />
              </motion.div>
              
              <h2 className="text-8xl font-black mb-4 tracking-tighter uppercase italic text-red-500 drop-shadow-2xl">{alert.level}</h2>
              <p className="text-2xl font-black mb-16 text-white max-w-md leading-tight tracking-tight uppercase">{alert.message}</p>
              
              <div className="relative mb-20 group">
                <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse" />
                <div className="relative bg-black/60 backdrop-blur-3xl p-12 rounded-[3rem] border-4 border-red-500/30 w-72 h-72 flex flex-col items-center justify-center shadow-[0_0_100px_rgba(255,0,0,0.2)]">
                  <span className="text-xs font-black uppercase tracking-[0.5em] text-red-500 mb-2">{t.evacuationTime}</span>
                  <span className="text-8xl font-black font-mono tracking-tighter text-white">
                    {Math.floor(alert.timeLeft / 60)}:{(alert.timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setAlert(prev => ({ ...prev, active: false }));
                  window.speechSynthesis.cancel();
                }}
                className="px-20 py-8 bg-red-600 text-white font-black text-3xl rounded-[3rem] shadow-[0_30px_60px_rgba(220,38,38,0.4)] hover:bg-red-500 transition-all uppercase tracking-tighter border-t-4 border-white/20"
              >
                {t.confirmSafety}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModuleCard({ icon, title, value, sub, className, details }: { icon: any, title: string, value: string, sub: string, className?: string, details?: { label: string, value: string }[] }) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className={`p-6 glass-card rounded-[2.5rem] hover:bg-white/5 transition-all group holographic-scan ${className}`}
    >
      <div className="mb-6 p-4 bg-white/5 w-fit rounded-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner">
        {icon}
      </div>
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">{title}</h3>
      <p className="text-4xl font-black text-white tracking-tighter truncate">{value}</p>
      <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest opacity-60">{sub}</p>
      
      {details && details.length > 0 && (
        <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
          {details.map((d, i) => (
            <div key={i} className="flex flex-col">
              <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">{d.label}</span>
              <span className="text-[10px] font-black text-amber-500/80 uppercase">{d.value}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

