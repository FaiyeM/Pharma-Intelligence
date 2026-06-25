import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { 
  Presentation, 
  Play, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Users, 
  Volume2, 
  Activity, 
  BookOpen, 
  Heart, 
  MessageSquarePlus, 
  CheckCircle2, 
  MousePointerClick
} from 'lucide-react';
import { HCP, Product, DetailingSlide, CallLog } from '../types';

interface EDetailingProps {
  hcps: HCP[];
  products: Product[];
  onAddCallLog: (newLog: CallLog) => void;
  onNavigateToTab: (tabId: string) => void;
}

export default function EDetailing({ hcps, products, onAddCallLog, onNavigateToTab }: EDetailingProps) {
  // Session Configuration State
  const [sessionActive, setSessionActive] = useState(false);
  const [selectedHcpId, setSelectedHcpId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  // Player Navigation State
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  // CLM Real-time Detailing Logs
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [hcpEngagementRating, setHcpEngagementRating] = useState(7);
  const [currentSentiment, setCurrentSentiment] = useState<'Highly Interested' | 'Neutral' | 'Skeptical' | 'Needs clinical data'>('Neutral');
  const [slideSentiments, setSlideSentiments] = useState<{ [slideId: string]: string }>({});
  
  // Custom interactive slide toggles (allows interactive sandbox on eDetailing)
  const [cardioGardDose, setCardioGardDose] = useState<'10mg' | '5mg'>('10mg');
  const [oncoShieldMutations, setOncoShieldMutations] = useState<'all' | 'brca_positive'>('brca_positive');
  const [neuroMedWeek, setNeuroMedWeek] = useState<4 | 8 | 12>(12);

  // Timer Effect
  useEffect(() => {
    let timer: any;
    if (sessionActive) {
      timer = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [sessionActive]);

  const handleStartSession = () => {
    if (!selectedHcpId || !selectedProductId) {
      alert('Please select both a physician and a product to begin detailing.');
      return;
    }
    const prod = products.find(p => p.id === selectedProductId);
    if (prod) {
      setActiveProduct(prod);
      setSessionActive(true);
      setCurrentSlideIdx(0);
      setSlideSentiments({});
      setCurrentSentiment('Neutral');
    }
  };

  const handleNextSlide = () => {
    if (!activeProduct) return;
    // Save current sentiment for this slide before navigating
    const currentSlide = activeProduct.slides[currentSlideIdx];
    setSlideSentiments(prev => ({ ...prev, [currentSlide.id]: currentSentiment }));

    if (currentSlideIdx < activeProduct.slides.length - 1) {
      setCurrentSlideIdx(prev => prev + 1);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx(prev => prev - 1);
    }
  };

  const handleFinishSession = () => {
    if (!activeProduct || !selectedHcpId) return;

    const targetHcp = hcps.find(h => h.id === selectedHcpId);
    if (!targetHcp) return;

    // Save final slide sentiment
    const currentSlide = activeProduct.slides[currentSlideIdx];
    const finalSentiments = { ...slideSentiments, [currentSlide.id]: currentSentiment };

    // Compile average sentiment
    const sentimentValues = Object.values(finalSentiments);
    const hasHighlyInterested = sentimentValues.includes('Highly Interested');
    const hasNeedsData = sentimentValues.includes('Needs clinical data');
    const hasSkeptical = sentimentValues.includes('Skeptical');

    let overallFeedback: 'Highly Interested' | 'Neutral' | 'Skeptical' | 'Needs clinical data' = 'Neutral';
    if (hasHighlyInterested) overallFeedback = 'Highly Interested';
    else if (hasNeedsData) overallFeedback = 'Needs clinical data';
    else if (hasSkeptical) overallFeedback = 'Skeptical';

    const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    // Construct Call Log automatically from the CLM interactive detailing session!
    const log: CallLog = {
      id: `call-${Date.now()}`,
      hcpId: selectedHcpId,
      hcpName: targetHcp.name,
      date: new Date().toISOString().split('T')[0],
      type: 'Face-to-Face',
      durationMinutes,
      productsDetailed: [
        {
          productId: activeProduct.id,
          productName: activeProduct.name,
          engagementScore: hcpEngagementRating,
          doctorFeedback: overallFeedback
        }
      ],
      samplesDropped: [
        {
          productId: activeProduct.id,
          productName: `${activeProduct.name} Starter Pack`,
          quantity: overallFeedback === 'Highly Interested' ? 5 : 2
        }
      ],
      discussionNotes: `CLM Interactive eDetailing completed on product ${activeProduct.name} for ${targetHcp.name}. Went through ${activeProduct.slides.length} slides detailing clinical trial data. Session duration: ${elapsedSeconds} seconds. Doctor showed primary interest in: "${activeProduct.slides[0].title}". Overall interaction feedback was logged as "${overallFeedback}". Dropped starter packs for evaluations.`,
      followUpRequired: overallFeedback === 'Needs clinical data',
      followUpNotes: overallFeedback === 'Needs clinical data' ? `Send peer-reviewed papers for ${activeProduct.name}` : undefined
    };

    onAddCallLog(log);
    setSessionActive(false);
    setActiveProduct(null);
    alert(`eDetailing Session Complete! A certified VEEVA-CLM Call Log has been added automatically for ${targetHcp.name}.`);
    onNavigateToTab('planner');
  };

  // Helper to format session timer (MM:SS)
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Custom data modifiers based on interactive sliders / settings
  const getModifiedChartData = (slideId: string) => {
    const slide = activeProduct?.slides.find(s => s.id === slideId);
    if (!slide) return [];

    if (slideId === 'slide-1-1') {
      // CardioGard EPIC-4 MACE graph
      const modifier = cardioGardDose === '10mg' ? 1.0 : 1.15; // 5mg is slightly higher MACE (less effective)
      return slide.graphicData.map((d: any) => ({
        ...d,
        cardioGard: parseFloat((d.cardioGard * modifier).toFixed(1))
      }));
    }

    if (slideId === 'slide-2-1') {
      // OncoShield SIRIUS-3 PFS graph
      if (oncoShieldMutations === 'all') {
        // all mutations yields slightly lower PFS for active treatment
        return slide.graphicData.map((d: any) => ({
          ...d,
          oncoShield: Math.max(d.placebo, Math.round(d.oncoShield * 0.8))
        }));
      }
      return slide.graphicData;
    }

    if (slideId === 'slide-3-1') {
      // NeuroMed Seizure reduction bar graph
      // Filter bars based on selected week
      const targetData = slide.graphicData.find((d: any) => {
        if (neuroMedWeek === 4) return d.week === 4;
        if (neuroMedWeek === 8) return d.week === 8;
        return d.week === 12;
      });
      return targetData ? [
        { name: 'Placebo', Reduction: targetData.placebo, fill: '#64748b' },
        { name: '100mg Dose', Reduction: targetData.dose100mg, fill: '#a5b4fc' },
        { name: '200mg Dose', Reduction: targetData.dose200mg, fill: '#6366f1' },
        { name: '400mg Dose', Reduction: targetData.dose400mg, fill: '#4f46e5' }
      ] : [];
    }

    return slide.graphicData || [];
  };

  return (
    <div id="edetailing-module-container" className="space-y-6 animate-fade-in">
      
      {/* Configuration Setup Screen (When no active session) */}
      {!sessionActive && (
        <div id="edetailing-setup-panel" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <Presentation size={28} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">VEEVA CLM Media Player</h2>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">Select a doctor to personalize your pitch, select a clinical drug portfolio deck, and launch the presentation screen.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* HCP Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 font-mono flex items-center gap-1.5">
                <Users size={14} className="text-slate-400" />
                <span>Presenting to (HCP Target) *</span>
              </label>
              <select
                value={selectedHcpId}
                onChange={(e) => setSelectedHcpId(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-800"
              >
                <option value="">-- Choose Target Doctor --</option>
                {hcps.map(h => (
                  <option key={h.id} value={h.id}>{h.name} ({h.specialty} - {h.hospital})</option>
                ))}
              </select>
            </div>

            {/* Product Portfolio Select */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-600 font-mono flex items-center gap-1.5">
                <Volume2 size={14} className="text-slate-400" />
                <span>Detailing Drug Portfolio *</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white text-slate-800"
              >
                <option value="">-- Choose Detailing Deck --</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.therapeuticArea})</option>
                ))}
              </select>
            </div>
          </div>

          <button
            id="btn-launch-clm"
            onClick={handleStartSession}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            <Play size={14} />
            <span>Launch CLM Interactive Player</span>
          </button>
        </div>
      )}

      {/* ACTIVE IMERSSIVE eDETAILING SCREEN (SIMULATED TABLET/CLM MODE) */}
      {sessionActive && activeProduct && (
        <div id="edetailing-active-deck" className="bg-slate-950 text-slate-100 rounded-3xl border border-slate-900 overflow-hidden shadow-2xl flex flex-col h-[85vh] max-h-[750px] animate-scale-up">
          
          {/* Deck Top Header: Stats / Timer / Info */}
          <div id="deck-header" className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-teal-400 font-mono uppercase tracking-widest bg-teal-500/10 px-2 py-0.5 rounded">VEEVA CLM Active</span>
                <span className="text-slate-500 text-xs font-mono">•</span>
                <p className="text-slate-400 text-xs font-mono">Presenting to: <span className="text-slate-100 font-bold font-sans">{hcps.find(h => h.id === selectedHcpId)?.name}</span></p>
              </div>
              <h3 className="text-sm font-bold text-slate-200 mt-1">{activeProduct.name} Detailing Deck</h3>
            </div>

            <div className="flex items-center gap-4">
              {/* Dynamic Rep Timer */}
              <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-slate-400">Duration:</span>
                <span className="text-white font-bold">{formatTimer(elapsedSeconds)}</span>
              </div>

              {/* Action completion button */}
              <button
                id="btn-finish-clm-session"
                onClick={handleFinishSession}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Complete Detailing
              </button>
            </div>
          </div>

          {/* Player Core Screen: Detailing Slide Layout */}
          <div id="deck-body" className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Slide Left Core Screen Area (Graphic & Clinical explanation) */}
            <div id="slide-main-content" className="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
              
              {/* Title & markdown explanation */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                    {activeProduct.slides[currentSlideIdx].title}
                  </h2>
                  <span className="text-xs text-slate-500 font-mono font-bold">
                    Slide {currentSlideIdx + 1} of {activeProduct.slides.length}
                  </span>
                </div>
                {activeProduct.slides[currentSlideIdx].subtitle && (
                  <p className="text-xs text-slate-400 font-mono">
                    {activeProduct.slides[currentSlideIdx].subtitle}
                  </p>
                )}
                
                {/* Bold/markdown styled explanation parsing */}
                <div className="text-xs text-slate-300 leading-relaxed font-sans max-w-3xl">
                  {activeProduct.slides[currentSlideIdx].content.split('**').map((part, i) => 
                    i % 2 === 1 ? <strong key={i} className="text-teal-400 font-bold">{part}</strong> : part
                  )}
                </div>
              </div>

              {/* Dynamic Interactive Sandboxed Charts / Graphics */}
              <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 h-[280px] flex flex-col justify-center relative group">
                
                {/* Chart Graphic Render */}
                {activeProduct.slides[currentSlideIdx].graphicType === 'chart' && (
                  <div className="h-full w-full">
                    
                    {/* Render different charts based on slide ID */}
                    {activeProduct.id === 'prod-1' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getModifiedChartData('slide-1-1')} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                          <XAxis dataKey="month" label={{ value: 'Months of Treatment', position: 'insideBottom', fill: '#94a3b8', fontSize: 10, offset: -2 }} tick={{ fill: '#64748b', fontSize: 10 }} />
                          <YAxis label={{ value: 'MACE Percentage (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10, offset: 10 }} tick={{ fill: '#64748b', fontSize: 10 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} />
                          <Line type="monotone" dataKey="standardCare" stroke="#94a3b8" strokeWidth={2} name="Standard Care" dot={false} />
                          <Line type="monotone" dataKey="cardioGard" stroke="#14b8a6" strokeWidth={3} name={`CardioGard (${cardioGardDose})`} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    )}

                    {activeProduct.id === 'prod-2' && (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={getModifiedChartData('slide-2-1')} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorShield" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                          <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} />
                          <YAxis label={{ value: 'Progression-Free (%)', angle: -90, position: 'insideLeft', fill: '#94a3b8', fontSize: 10, offset: 10 }} tick={{ fill: '#64748b', fontSize: 10 }} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                          <Area type="monotone" dataKey="placebo" stroke="#ef4444" name="Placebo Control" fill="none" strokeWidth={1.5} />
                          <Area type="monotone" dataKey="oncoShield" stroke="#14b8a6" name="OncoShield Maintenance" fillOpacity={1} fill="url(#colorShield)" strokeWidth={3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}

                  </div>
                )}

                {/* Safety / TIMI tables graphic */}
                {activeProduct.slides[currentSlideIdx].graphicType === 'table' && (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 font-mono">
                          <th className="py-2.5">Adverse Clinical Endpoints</th>
                          <th className="py-2.5">Standard Control</th>
                          <th className="py-2.5 text-teal-400">Therapeutic Profile</th>
                          <th className="py-2.5 text-right">Statistical Significance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/40 text-slate-300 font-mono">
                        {activeProduct.slides[currentSlideIdx].graphicData.map((row: any, rIdx: number) => (
                          <tr key={rIdx} className="hover:bg-slate-800/20">
                            <td className="py-2.5 font-sans font-semibold text-slate-200">{row.event}</td>
                            <td className="py-2.5">{row.standardCare || row.placebo}</td>
                            <td className="py-2.5 text-teal-400 font-bold">{row.cardioGard || row.oncoShield}</td>
                            <td className="py-2.5 text-right text-slate-400">{row.pValue || row.management}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Patient compliance bullet grids */}
                {activeProduct.slides[currentSlideIdx].graphicType === 'bullet_points' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {activeProduct.slides[currentSlideIdx].graphicData.map((bullet: any, bIdx: number) => (
                      <div key={bIdx} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-1">
                        <div className="flex items-center gap-1.5 text-teal-400">
                          <CheckCircle2 size={14} />
                          <h5 className="font-bold text-xs">{bullet.label}</h5>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-relaxed">{bullet.text}</p>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Slide Key Takeaway Banner */}
              <div className="bg-indigo-950/40 border border-indigo-500/20 p-4 rounded-xl flex items-start gap-3">
                <Sparkles size={18} className="text-teal-400 shrink-0 mt-0.5 animate-pulse" />
                <div>
                  <h4 className="text-xs font-bold text-teal-300 font-mono uppercase tracking-wider">CLM Key Detailing Takeaway</h4>
                  <p className="text-slate-300 text-xs mt-1 leading-normal font-sans">
                    {activeProduct.slides[currentSlideIdx].keyTakeaway}
                  </p>
                </div>
              </div>

            </div>

            {/* Slide Right Sidebar: Rep detailing control console */}
            <div id="slide-side-panel" className="w-full md:w-[320px] bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-6 flex flex-col justify-between shrink-0 space-y-6">
              
              {/* Interactive Slide Sandbox (Interactive values!) */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-teal-400 font-mono text-[10px] font-bold uppercase tracking-wider">
                  <MousePointerClick size={12} />
                  <span>Clinical trial Sandbox</span>
                </div>
                
                <h4 className="text-xs font-bold text-slate-200">Interactive Clinical Adjusters</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Adjust active parameters during conversations to address physician-specific cohorts.</p>

                {/* CardioGard Sandboxed Sliders */}
                {activeProduct.id === 'prod-1' && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Dosage Concentration</span>
                    <div className="flex gap-2">
                      {['10mg', '5mg'].map(dose => (
                        <button
                          key={dose}
                          onClick={() => setCardioGardDose(dose as any)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition font-mono cursor-pointer ${
                            cardioGardDose === dose ? 'bg-teal-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          {dose} OD
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* OncoShield Sandboxed Sliders */}
                {activeProduct.id === 'prod-2' && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Mutational Cohort</span>
                    <div className="flex flex-col gap-1.5">
                      <button
                        onClick={() => setOncoShieldMutations('brca_positive')}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition font-mono text-left px-3 cursor-pointer ${
                          oncoShieldMutations === 'brca_positive' ? 'bg-teal-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        BRCAm Patients Only
                      </button>
                      <button
                        onClick={() => setOncoShieldMutations('all')}
                        className={`w-full py-1.5 rounded-lg text-xs font-bold transition font-mono text-left px-3 cursor-pointer ${
                          oncoShieldMutations === 'all' ? 'bg-teal-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                        }`}
                      >
                        Intent-To-Treat Cohort (All)
                      </button>
                    </div>
                  </div>
                )}

                {/* NeuroMed Sandboxed Sliders */}
                {activeProduct.id === 'prod-3' && (
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Trial Observation Period</span>
                    <div className="flex gap-1.5">
                      {([4, 8, 12] as const).map(wk => (
                        <button
                          key={wk}
                          onClick={() => setNeuroMedWeek(wk)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition font-mono cursor-pointer ${
                            neuroMedWeek === wk ? 'bg-teal-500 text-slate-950' : 'bg-slate-900 text-slate-400'
                          }`}
                        >
                          Week {wk}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rep Detailing Sentiment tracker (CLM Analytics) */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider border-b border-slate-800 pb-1.5">Real-time Physician Response</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed">Document doctor feedback on this slide in real-time to generate structured CLM follow-ups.</p>

                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                  {[
                    { label: 'Highly Interested', color: 'bg-teal-500 text-slate-950 border-teal-400' },
                    { label: 'Neutral', color: 'bg-slate-800 text-slate-200 border-slate-700' },
                    { label: 'Skeptical', color: 'bg-rose-950 text-rose-300 border-rose-900' },
                    { label: 'Needs clinical data', color: 'bg-amber-950 text-amber-300 border-amber-900' }
                  ].map(option => (
                    <button
                      key={option.label}
                      onClick={() => setCurrentSentiment(option.label as any)}
                      className={`py-2 px-1.5 rounded-lg border text-center transition cursor-pointer leading-tight ${
                        currentSentiment === option.label 
                          ? `${option.color} font-bold shadow` 
                          : 'bg-slate-950 text-slate-500 border-slate-900 hover:text-slate-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-3">
                  <span className="text-[10px] uppercase font-mono text-slate-400 block font-semibold">Rep Engagement Slider</span>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={hcpEngagementRating}
                    onChange={(e) => setHcpEngagementRating(parseInt(e.target.value))}
                    className="w-full accent-teal-400 h-1 rounded bg-slate-950 appearance-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>1 (Poor)</span>
                    <span className="font-bold text-teal-400">{hcpEngagementRating}/10</span>
                    <span>10 (Excellent)</span>
                  </div>
                </div>
              </div>

              {/* Player Navigation Buttons */}
              <div className="flex gap-2.5 shrink-0 pt-4 border-t border-slate-800">
                <button
                  onClick={handlePrevSlide}
                  disabled={currentSlideIdx === 0}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold font-mono border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer flex items-center justify-center gap-1"
                >
                  <ChevronLeft size={14} />
                  <span>PREV</span>
                </button>
                
                {currentSlideIdx === activeProduct.slides.length - 1 ? (
                  <button
                    onClick={handleFinishSession}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold font-mono bg-indigo-600 hover:bg-indigo-700 text-white transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>FINISH</span>
                    <CheckCircle2 size={14} />
                  </button>
                ) : (
                  <button
                    onClick={handleNextSlide}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold font-mono bg-slate-800 hover:bg-slate-700 text-teal-400 transition cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>NEXT</span>
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
