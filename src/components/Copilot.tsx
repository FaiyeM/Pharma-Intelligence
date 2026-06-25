import React, { useState, useEffect, useRef } from 'react';
import { 
  BotMessageSquare, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Activity, 
  BriefcaseMedical, 
  BookOpen, 
  Mail, 
  GraduationCap, 
  ShieldQuestion, 
  Mic, 
  UserSquare2,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { HCP, Product, CallLog, Message } from '../types';

interface CopilotProps {
  hcps: HCP[];
  products: Product[];
  calls: CallLog[];
  inventory: any[];
  events: any[];
}

export default function Copilot({ hcps, products, calls, inventory, events }: CopilotProps) {
  // General Chat States
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      role: 'model',
      text: "Hello! I am **VEEVA-AI**, your pharmaceutical execution intelligence assistant and field sales coach. I have full context of your territory roster, starter packs inventory, and call logs.\n\nHow can I help you today? I can:\n* **Draft clinical follow-up emails** for doctors highlighting head-to-head trial safety margins.\n* **Synthesize doctor profile binders** and suggest the best detailing slides.\n* **Audit your territory schedules** to highlight critical Segment A doctors neglected over 30 days.\n* **Coach you in our clinical Pitch Gym** (choose 'Pitch Gym' mode in the sidebar to roleplay pitches against skeptical doctors!).",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Mode Selection: General Chat vs Roleplay Pitch Practice Gym
  const [copilotMode, setCopilotMode] = useState<'chat' | 'roleplay'>('chat');

  // Roleplay Specific States
  const [selectedHcpId, setSelectedHcpId] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [roleplayActive, setRoleplayActive] = useState(false);
  const [roleplayHistory, setRoleplayHistory] = useState<{ role: 'user' | 'model'; parts: { text: string }[] }[]>([]);
  const [roleplayMessages, setRoleplayMessages] = useState<Message[]>([]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, roleplayMessages, isGenerating]);

  // Pre-set Prompt triggers
  const promptSuggestions = [
    {
      label: 'Draft Email to Dr. Chen',
      prompt: 'Draft a professional clinical follow-up email to Dr. Evelyn Chen after a visit. Highlight CardioGard\'s 24% MACE reduction from the EPIC-4 trial, address her safety concerns regarding bleeding events, and offer to coordinate a speaker invitation for the upcoming Roundtable.',
      icon: Mail
    },
    {
      label: 'Territory Health Check',
      prompt: 'Identify my Segment A doctors in Boston. Check who has not been visited recently and suggest an action list including which product slides are recommended.',
      icon: Activity
    },
    {
      label: 'Summarize OncoShield PFS',
      prompt: 'Give me a structured summary of OncoShield\'s SIRIUS-3 study PFS (Progression-Free Survival) clinical endpoints. List the median PFS numbers and hazard ratio so I can easily recite them.',
      icon: BookOpen
    },
    {
      label: 'Dosing and Safety',
      prompt: 'What are the titration, food compatibility, and dosing rules for NeuroMed? Explain safety side-effects.',
      icon: BriefcaseMedical
    }
  ];

  // Send message to server '/api/copilot'
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || userInput;
    if (!text.trim() || isGenerating) return;

    // Add user message
    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsGenerating(true);

    try {
      // Assemble full CRM context for the LLM to search/query
      const crmContext = {
        hcps,
        products,
        calls: calls.map(c => ({
          hcpName: c.hcpName,
          date: c.date,
          discussionNotes: c.discussionNotes,
          productsDetailed: c.productsDetailed,
          samplesDropped: c.samplesDropped
        })),
        inventory,
        events
      };

      // Map chat messages format for model history
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          crmContext
        })
      });

      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}-ai`,
          role: 'model',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: `msg-${Date.now()}-ai-err`,
          role: 'model',
          text: `**VEEVA-AI Service Interruption**\n\n${data.error || 'Failed to retrieve response.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: `msg-${Date.now()}-ai-fail`,
        role: 'model',
        text: `**Failed to connect to full-stack backend**\n\nError details: ${err.message}. Please verify the Express dev server is running on Port 3000.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Start Roleplay Gym Session
  const handleStartRoleplay = async () => {
    if (!selectedHcpId || !selectedProductId) {
      alert('Please select a physician persona and a product to coach you on.');
      return;
    }

    const hcp = hcps.find(h => h.id === selectedHcpId);
    const prod = products.find(p => p.id === selectedProductId);
    if (!hcp || !prod) return;

    setIsGenerating(true);
    setRoleplayActive(true);
    setRoleplayHistory([]);
    setRoleplayMessages([
      {
        id: 'rp-init',
        role: 'system',
        text: `🚀 **Pitch Gym Session Activated**\n\n**Clinician Persona:** ${hcp.name} (${hcp.specialty} KOL - Segment ${hcp.segment})\n**Product Focus:** ${prod.name}\n\n*Pitch rules: Introduce yourself, detail the clinical trial curves, and handle her objections using actual data. Pitch when you're ready!*`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    try {
      // Trigger initial greeting from the doctor persona!
      const response = await fetch('/api/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hcpName: hcp.name,
          specialty: hcp.specialty,
          segment: hcp.segment,
          product: prod,
          latestMessage: "Hello, Doctor. Thanks for giving me 2 minutes of your time today.",
          history: []
        })
      });

      const data = await response.json();
      if (response.ok) {
        setRoleplayMessages(prev => [...prev, {
          id: `rp-doc-init`,
          role: 'model',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setRoleplayHistory([
          { role: 'user', parts: [{ text: "Hello, Doctor. Thanks for giving me 2 minutes of your time today." }] },
          { role: 'model', parts: [{ text: data.text }] }
        ]);
      }
    } catch (err: any) {
      setRoleplayMessages(prev => [...prev, {
        id: `rp-err`,
        role: 'model',
        text: `Failed to initialize clinician response. Error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Send message during Roleplay Gym Session
  const handleSendRoleplayMessage = async () => {
    if (!userInput.trim() || isGenerating || !roleplayActive) return;

    const text = userInput;
    const userMsg: Message = {
      id: `rp-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setRoleplayMessages(prev => [...prev, userMsg]);
    setUserInput('');
    setIsGenerating(true);

    const hcp = hcps.find(h => h.id === selectedHcpId);
    const prod = products.find(p => p.id === selectedProductId);
    if (!hcp || !prod) return;

    try {
      const response = await fetch('/api/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hcpName: hcp.name,
          specialty: hcp.specialty,
          segment: hcp.segment,
          product: prod,
          latestMessage: text,
          history: roleplayHistory
        })
      });

      const data = await response.json();
      if (response.ok) {
        setRoleplayMessages(prev => [...prev, {
          id: `rp-${Date.now()}-ai`,
          role: 'model',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
        setRoleplayHistory(prev => [
          ...prev,
          { role: 'user', parts: [{ text }] },
          { role: 'model', parts: [{ text: data.text }] }
        ]);
      } else {
        setRoleplayMessages(prev => [...prev, {
          id: `rp-${Date.now()}-ai-err`,
          role: 'model',
          text: `Roleplay coach error: ${data.error || 'Server error.'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }
    } catch (err: any) {
      setRoleplayMessages(prev => [...prev, {
        id: `rp-${Date.now()}-ai-fail`,
        role: 'model',
        text: `Clinician persona is unavailable. Details: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to safely format chat texts
  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      // Bullet items
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const content = line.substring(2);
        const parts = content.split('**');
        return (
          <li key={lineIdx} className="list-disc ml-5 text-xs text-slate-100 leading-relaxed mb-1 font-sans">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-teal-400 font-bold">{part}</strong> : part)}
          </li>
        );
      }
      
      const parts = line.split('**');
      return (
        <p key={lineIdx} className="text-xs text-slate-100 leading-relaxed mb-2 font-sans">
          {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-teal-400 font-bold">{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div id="copilot-container" className="bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl flex h-[85vh] max-h-[750px] overflow-hidden animate-scale-up">
      
      {/* 1. Left Sidebar within Copilot: Modes and presets */}
      <div id="copilot-side-panel" className="w-64 bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          
          {/* Mode switch */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-teal-400 font-mono uppercase tracking-widest block">ASSISTANT MODE</span>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => {
                  setCopilotMode('chat');
                  setRoleplayActive(false);
                }}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-left flex items-center gap-2.5 transition cursor-pointer ${
                  copilotMode === 'chat' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BotMessageSquare size={16} />
                <span>Territory Advisor</span>
              </button>
              <button
                onClick={() => setCopilotMode('roleplay')}
                className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-left flex items-center gap-2.5 transition cursor-pointer ${
                  copilotMode === 'roleplay' ? 'bg-teal-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <GraduationCap size={16} />
                <span>Objection Pitch Gym</span>
              </button>
            </div>
          </div>

          {/* Quick Prompts - only show in Chat mode */}
          {copilotMode === 'chat' && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider block">CRM QUICK INQUIRIES</span>
              <div className="space-y-2">
                {promptSuggestions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(item.prompt)}
                      className="w-full bg-slate-900 hover:bg-slate-800/80 p-2.5 rounded-xl border border-slate-800 text-left text-[11px] text-slate-300 leading-normal hover:text-white transition flex gap-2 cursor-pointer"
                    >
                      <Icon size={14} className="text-teal-400 shrink-0 mt-0.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Roleplay Settings - show only in Roleplay mode */}
          {copilotMode === 'roleplay' && !roleplayActive && (
            <div className="space-y-4">
              <span className="text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider block">COACHING SETUP</span>
              
              {/* Doctor select */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono font-bold block">Clinician Persona</span>
                <select
                  value={selectedHcpId}
                  onChange={(e) => setSelectedHcpId(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="">-- Choose Doctor --</option>
                  {hcps.map(h => (
                    <option key={h.id} value={h.id}>{h.name} ({h.specialty})</option>
                  ))}
                </select>
              </div>

              {/* Product select */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-mono font-bold block">Product Pitch Focus</span>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-2 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleStartRoleplay}
                className="w-full bg-teal-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl hover:bg-teal-400 transition cursor-pointer flex items-center justify-center gap-1.5 shadow"
              >
                <GraduationCap size={14} />
                <span>Enter Pitch Gym</span>
              </button>
            </div>
          )}

          {copilotMode === 'roleplay' && roleplayActive && (
            <div className="space-y-3.5 bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-teal-400 font-mono font-bold text-[10px]">
                <Clock size={12} />
                <span>ROLEPLAY GYM STATUS</span>
              </div>
              <p className="leading-relaxed">You are actively roleplaying. Practice handling scientific objections regarding hazard ratios, side effects, or drug titration schedules.</p>
              
              <button
                onClick={() => {
                  setRoleplayActive(false);
                  setRoleplayMessages([]);
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-bold py-2 rounded-lg transition cursor-pointer"
              >
                Reset Gym Session
              </button>
            </div>
          )}

        </div>

        <div className="text-[10px] text-slate-600 font-mono text-center">
          VEEVA-AI v3.5 • COMPLIANT
        </div>
      </div>

      {/* 2. Right Chat Screen: Messages list & text input */}
      <div id="copilot-chat-screen" className="flex-1 flex flex-col justify-between overflow-hidden relative">
        
        {/* Chat top header */}
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></div>
            <h3 className="font-bold text-sm tracking-tight">
              {copilotMode === 'chat' ? 'VEEVA-AI Advisor Chat' : 'Clinician Objection Pitch Gym'}
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Model Context: gemini-3.5-flash
          </span>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          
          {/* Loop messages depending on active mode */}
          {copilotMode === 'chat' ? (
            messages.map((m) => (
              <div 
                key={m.id}
                className={`flex gap-3.5 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === 'user' 
                    ? 'bg-teal-600 text-white' 
                    : m.role === 'system' 
                    ? 'bg-slate-800 text-slate-400' 
                    : 'bg-indigo-950 text-indigo-400 border border-indigo-900'
                }`}>
                  {m.role === 'user' ? <UserSquare2 size={16} /> : <BotMessageSquare size={16} />}
                </div>

                {/* Message Body */}
                <div className={`p-4 rounded-2xl ${
                  m.role === 'user' 
                    ? 'bg-teal-600 text-white rounded-tr-none' 
                    : 'bg-slate-850 border border-slate-800/80 rounded-tl-none'
                }`}>
                  <div className="space-y-1">
                    {formatMessageText(m.text)}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block text-right mt-1.5">{m.timestamp}</span>
                </div>
              </div>
            ))
          ) : (
            roleplayMessages.map((m) => (
              <div 
                key={m.id}
                className={`flex gap-3.5 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  m.role === 'user' 
                    ? 'bg-teal-600 text-white' 
                    : m.role === 'system' 
                    ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' 
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {m.role === 'user' ? <UserSquare2 size={16} /> : m.role === 'system' ? <GraduationCap size={16} /> : <UserSquare2 size={16} />}
                </div>

                {/* Message Body */}
                <div className={`p-4 rounded-2xl ${
                  m.role === 'system'
                    ? 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/20 text-xs leading-relaxed rounded-xl w-full'
                    : m.role === 'user' 
                    ? 'bg-teal-600 text-white rounded-tr-none' 
                    : 'bg-slate-850 border border-slate-800/80 rounded-tl-none'
                }`}>
                  <div className="space-y-1">
                    {formatMessageText(m.text)}
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono block text-right mt-1.5">{m.timestamp}</span>
                </div>
              </div>
            ))
          )}

          {/* Clinician Pitch Setup prompt screen if roleplay is inactive in Gym mode */}
          {copilotMode === 'roleplay' && !roleplayActive && (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-3xl max-w-md mx-auto my-12">
              <GraduationCap size={44} className="text-teal-400 mb-4 animate-bounce" />
              <h4 className="text-sm font-bold text-white mb-2">Welcome to the Clinician Pitch Gym!</h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                This is a real-time sales simulation environment. Select a target physician's profile and your drug slide focus on the left, then enter the gym to practice addressing direct safety and clinical safety objections.
              </p>
              <div className="text-[10px] font-mono text-slate-500 bg-slate-950 p-2.5 rounded border border-slate-800 flex items-center gap-1.5 leading-snug">
                <CheckCircle size={12} className="text-teal-400" />
                <span>Simulates real-world VEEVA sales coaching scripts.</span>
              </div>
            </div>
          )}

          {/* Generating Loading State */}
          {isGenerating && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                <BotMessageSquare size={16} className="text-teal-400" />
              </div>
              <div className="bg-slate-850 border border-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">Formulating clinician response</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Text Box Area */}
        <div id="chat-input-bar" className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
          <div className="flex gap-2.5">
            <input
              id="copilot-input-text"
              type="text"
              disabled={copilotMode === 'roleplay' && !roleplayActive}
              placeholder={
                copilotMode === 'roleplay' && !roleplayActive 
                  ? 'Please enter the Pitch Gym first...' 
                  : 'Type CRM query, email request, or pitches...'
              }
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (copilotMode === 'chat') handleSendMessage();
                  else handleSendRoleplayMessage();
                }
              }}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-500/80 transition-colors disabled:opacity-50"
            />
            <button
              id="btn-copilot-send"
              disabled={(copilotMode === 'roleplay' && !roleplayActive) || isGenerating}
              onClick={() => {
                if (copilotMode === 'chat') handleSendMessage();
                else handleSendRoleplayMessage();
              }}
              className="bg-teal-500 text-slate-950 hover:bg-teal-400 p-3.5 rounded-xl transition flex items-center justify-center shrink-0 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={15} />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
