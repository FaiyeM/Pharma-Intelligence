import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  MapPin, 
  Clock, 
  FileText, 
  CheckCircle, 
  Sparkles, 
  X, 
  User, 
  Trash2, 
  Eraser, 
  ShieldCheck,
  BriefcaseMedical
} from 'lucide-react';
import { HCP, Product, CallLog, SampleInventory } from '../types';

interface CallPlannerProps {
  hcps: HCP[];
  products: Product[];
  calls: CallLog[];
  inventory: SampleInventory[];
  onAddCallLog: (newLog: CallLog) => void;
}

interface PlannedCall {
  id: string;
  hcpId: string;
  hcpName: string;
  specialty: string;
  date: string;
  time: string;
  notes: string;
}

export default function CallPlanner({ hcps, products, calls, inventory, onAddCallLog }: CallPlannerProps) {
  // Navigation tabs within Call Planner
  const [plannerTab, setPlannerTab] = useState<'schedule' | 'history'>('schedule');

  // List of upcoming scheduled visits (stored locally in memory for demo)
  const [scheduledCalls, setScheduledCalls] = useState<PlannedCall[]>([
    {
      id: 'plan-1',
      hcpId: 'hcp-1',
      hcpName: 'Dr. Evelyn Chen',
      specialty: 'Cardiology',
      date: '2026-06-28',
      time: '10:00 AM',
      notes: 'Deliver EPIC-4 Safety Supplement. Invite to Roundtable event.'
    },
    {
      id: 'plan-2',
      hcpId: 'hcp-2',
      hcpName: 'Dr. Marcus Vance',
      specialty: 'Oncology',
      date: '2026-06-29',
      time: '04:15 PM',
      notes: 'Detailing OncoShield PFS margins. Expect tough head-to-head objections.'
    }
  ]);

  // Form states for creating a scheduled appointment
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedHcpId, setSchedHcpId] = useState('');
  const [schedDate, setSchedDate] = useState('');
  const [schedTime, setSchedTime] = useState('');
  const [schedNotes, setSchedNotes] = useState('');

  // Form states for Logging a Past Visit (The CORE Call Log)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [logHcpId, setLogHcpId] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logDuration, setLogDuration] = useState(15);
  const [logNotes, setLogNotes] = useState('');
  const [logFollowUp, setLogFollowUp] = useState(false);
  const [logFollowUpNotes, setLogFollowUpNotes] = useState('');
  const [logType, setLogType] = useState<'Face-to-Face' | 'Remote Video' | 'Phone'>('Face-to-Face');

  // Detailing product checklist
  const [detailedProds, setDetailedProds] = useState<{ productId: string; score: number; feedback: string; selected: boolean }[]>(
    products.map(p => ({ productId: p.id, score: 7, feedback: 'Neutral', selected: false }))
  );

  // Sample drop checklist
  const [droppedSamples, setDroppedSamples] = useState<{ productId: string; quantity: number; selected: boolean }[]>(
    products.map(p => ({ productId: p.id, quantity: 1, selected: false }))
  );

  // Signature Canvas state
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSigned, setIsSigned] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  // Canvas Drawing Logic
  useEffect(() => {
    if (isLogModalOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#0f172a'; // slate-900
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isLogModalOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    e.preventDefault(); // prevent scrolling on touch devices
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }

    ctx.lineTo(x, y);
    ctx.stroke();
    setIsSigned(true);
  };

  const endDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsSigned(false);
  };

  // Submission handles
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedHcpId || !schedDate || !schedTime) {
      alert('All fields are required.');
      return;
    }

    const selectedDoc = hcps.find(h => h.id === schedHcpId);
    if (!selectedDoc) return;

    const newAppointment: PlannedCall = {
      id: `plan-${Date.now()}`,
      hcpId: schedHcpId,
      hcpName: selectedDoc.name,
      specialty: selectedDoc.specialty,
      date: schedDate,
      time: schedTime,
      notes: schedNotes
    };

    setScheduledCalls([newAppointment, ...scheduledCalls]);
    setIsScheduleModalOpen(false);

    // Reset Form
    setSchedHcpId('');
    setSchedDate('');
    setSchedTime('');
    setSchedNotes('');
  };

  const handleLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logHcpId) {
      alert('Please select a physician to log.');
      return;
    }

    // Capture Signature URL (or mock it if canvas is blank)
    let signatureUrl = '';
    if (canvasRef.current && isSigned) {
      signatureUrl = canvasRef.current.toDataURL();
    }

    const targetHcp = hcps.find(h => h.id === logHcpId);
    if (!targetHcp) return;

    // Build lists
    const detailedList = detailedProds
      .filter(p => p.selected)
      .map(p => {
        const item = products.find(prod => prod.id === p.productId);
        return {
          productId: p.productId,
          productName: item ? item.name : 'Unknown Product',
          engagementScore: p.score,
          doctorFeedback: p.feedback as any
        };
      });

    const samplesList = droppedSamples
      .filter(s => s.selected)
      .map(s => {
        const item = products.find(prod => prod.id === s.productId);
        return {
          productId: s.productId,
          productName: item ? `${item.name} Starter Pack` : 'Starter Pack',
          quantity: s.quantity
        };
      });

    // Integrity Check: Warn if samples drops exceed available inventory
    let inventoryExceeded = false;
    samplesList.forEach(item => {
      const invItem = inventory.find(i => i.productId === item.productId);
      if (invItem && invItem.availableQty < item.quantity) {
        inventoryExceeded = true;
      }
    });

    if (inventoryExceeded) {
      const confirmProceed = window.confirm("Compliance Warning: Sample drop quantity exceeds your current inventory stock level. Do you still wish to submit this log with a negative stock adjustment?");
      if (!confirmProceed) return;
    }

    const log: CallLog = {
      id: `call-${Date.now()}`,
      hcpId: logHcpId,
      hcpName: targetHcp.name,
      date: logDate,
      type: logType as any,
      durationMinutes: logDuration,
      productsDetailed: detailedList,
      samplesDropped: samplesList,
      signatureData: signatureUrl || undefined,
      discussionNotes: logNotes,
      followUpRequired: logFollowUp,
      followUpNotes: logFollowUpNotes || undefined
    };

    onAddCallLog(log);
    setIsLogModalOpen(false);

    // Remove matching scheduled appointment if logging is done for an upcoming one
    setScheduledCalls(prev => prev.filter(p => p.hcpId !== logHcpId));

    // Reset Checklist
    setDetailedProds(products.map(p => ({ productId: p.id, score: 7, feedback: 'Neutral', selected: false })));
    setDroppedSamples(products.map(p => ({ productId: p.id, quantity: 1, selected: false })));
    setLogHcpId('');
    setLogNotes('');
    setLogFollowUp(false);
    setLogFollowUpNotes('');
    setIsSigned(false);
  };

  const handleDeleteSchedule = (id: string) => {
    setScheduledCalls(scheduledCalls.filter(s => s.id !== id));
  };

  return (
    <div id="call-planner-container" className="space-y-6 animate-fade-in">
      
      {/* Title section with action buttons */}
      <div id="planner-header" className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Call Planner & Logger</h2>
          <p className="text-slate-500 text-sm mt-1">Schedule territory appointments or record completed detailing visits</p>
        </div>
        
        <div className="flex gap-2.5 w-full sm:w-auto shrink-0">
          <button
            id="btn-schedule-visit"
            onClick={() => setIsScheduleModalOpen(true)}
            className="flex-1 sm:flex-none border border-slate-200 text-slate-700 bg-white font-semibold text-xs px-4 py-2.5 rounded-xl hover:bg-slate-50 transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus size={14} />
            <span>Schedule Visit</span>
          </button>
          
          <button
            id="btn-log-visit"
            onClick={() => setIsLogModalOpen(true)}
            className="flex-1 sm:flex-none bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <CheckCircle size={14} />
            <span>Log Completed Visit</span>
          </button>
        </div>
      </div>

      {/* Sub tabs: Upcoming Scheduler / Completed Interaction Logs */}
      <div id="planner-tabs-container" className="flex border-b border-slate-200">
        <button
          onClick={() => setPlannerTab('schedule')}
          className={`px-5 py-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all font-mono cursor-pointer ${
            plannerTab === 'schedule' 
              ? 'border-indigo-600 text-indigo-600 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Scheduled Appointments ({scheduledCalls.length})
        </button>
        <button
          onClick={() => setPlannerTab('history')}
          className={`px-5 py-3 text-xs font-semibold tracking-wider uppercase border-b-2 transition-all font-mono cursor-pointer ${
            plannerTab === 'history' 
              ? 'border-indigo-600 text-indigo-600 font-bold' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Interaction Logs ({calls.length})
        </button>
      </div>

      {/* Tab 1 Content: Appointments */}
      {plannerTab === 'schedule' && (
        <div id="upcoming-schedule-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scheduledCalls.map((plan) => (
            <div 
              key={plan.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col hover:border-slate-200 hover:shadow-sm transition group"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{plan.hcpName}</h4>
                  <p className="text-[11px] text-teal-600 font-semibold font-mono">{plan.specialty}</p>
                </div>
                <button
                  onClick={() => handleDeleteSchedule(plan.id)}
                  className="text-slate-300 hover:text-rose-500 p-1.5 rounded hover:bg-rose-50 transition cursor-pointer"
                  title="Remove Appointment"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-600 font-mono mb-4 flex-1">
                <div className="flex gap-2 items-center">
                  <Calendar size={13} className="text-slate-400" />
                  <span>{plan.date}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Clock size={13} className="text-slate-400" />
                  <span>{plan.time}</span>
                </div>
                {plan.notes && (
                  <div className="flex gap-2 items-start mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <FileText size={13} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="font-sans italic text-slate-500 leading-normal text-[11px] font-medium">"{plan.notes}"</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => {
                  setLogHcpId(plan.hcpId);
                  setIsLogModalOpen(true);
                }}
                className="w-full bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 text-xs font-semibold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle size={13} />
                <span>Begin Visit & Log</span>
              </button>
            </div>
          ))}

          {scheduledCalls.length === 0 && (
            <div className="col-span-full bg-white border border-slate-100 p-12 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Calendar size={20} />
              </div>
              <h4 className="text-slate-800 font-bold text-sm">No scheduled visits planned</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Use the "Schedule Visit" form above to queue healthcare practitioners in your Boston territory route.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2 Content: Past Interaction History */}
      {plannerTab === 'history' && (
        <div id="logged-visits-list" className="space-y-4">
          {calls.map((log) => (
            <div 
              key={log.id}
              className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col md:flex-row justify-between gap-6 hover:shadow-xs transition"
            >
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h4 className="font-bold text-slate-800 text-sm">{log.hcpName}</h4>
                  <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono font-bold">
                    {log.type}
                  </span>
                  <span className="text-slate-400 font-mono text-[10px]">{log.date} • {log.durationMinutes} minutes duration</span>
                </div>

                <p className="text-slate-600 text-xs leading-relaxed italic font-medium">"{log.discussionNotes}"</p>

                {/* Sub-tags detailing which products detailed and sample count */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {log.productsDetailed.map((p, pIdx) => (
                    <span key={pIdx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] px-2.5 py-0.5 rounded font-mono font-medium">
                      Detailed: {p.productName} (Score: {p.engagementScore}/10 • {p.doctorFeedback})
                    </span>
                  ))}
                  {log.samplesDropped.map((s, sIdx) => (
                    <span key={sIdx} className="bg-amber-50 border border-amber-100 text-amber-700 text-[10px] px-2.5 py-0.5 rounded font-mono font-medium">
                      Samples Dropped: {s.quantity}x {s.productName}
                    </span>
                  ))}
                  {log.followUpRequired && (
                    <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[10px] px-2.5 py-0.5 rounded font-mono font-medium">
                      Follow-up Required: "{log.followUpNotes}"
                    </span>
                  )}
                </div>
              </div>

              {/* Compliance signature graphic block */}
              {log.signatureData && (
                <div className="flex flex-col items-center justify-center shrink-0 border border-slate-100 bg-slate-50/60 p-3 rounded-xl w-36 text-center">
                  <div className="h-12 w-28 bg-white border border-slate-100/60 rounded flex items-center justify-center overflow-hidden">
                    <img src={log.signatureData} alt="Doctor Signoff" className="max-h-full max-w-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <span className="text-[9px] text-emerald-600 font-mono font-bold mt-1.5 flex items-center gap-1">
                    <ShieldCheck size={11} />
                    <span>PDMA COMPLIANT</span>
                  </span>
                </div>
              )}
            </div>
          ))}

          {calls.length === 0 && (
            <p className="text-xs text-slate-400 text-center py-12 bg-white border border-slate-100 rounded-2xl font-mono">
              No historical interactions registered in this workspace yet.
            </p>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* SCHEDULE APPOINTMENT MODAL                                */}
      {/* ========================================================= */}
      {isScheduleModalOpen && (
        <div id="schedule-appointment-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden animate-scale-up">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Schedule Field Visit</h3>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-lg border border-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-mono">Select Target Doctor *</label>
                <select
                  required
                  value={schedHcpId}
                  onChange={(e) => setSchedHcpId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                >
                  <option value="">-- Choose Physician --</option>
                  {hcps.map(h => (
                    <option key={h.id} value={h.id}>{h.name} ({h.specialty} - {h.hospital})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Visit Date *</label>
                  <input
                    type="date"
                    required
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Visit Time *</label>
                  <input
                    type="time"
                    required
                    value={schedTime}
                    onChange={(e) => setSchedTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-mono">Rep Objectives / Reminders</label>
                <textarea
                  rows={3}
                  placeholder="e.g., Deliver phase 3 hematologic trial tables or follow up on sample feedback."
                  value={schedNotes}
                  onChange={(e) => setSchedNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Schedule Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VISIT LOGGER / RECOM LOG past VISIT MODAL (VEEVA IR)       */}
      {/* ========================================================= */}
      {isLogModalOpen && (
        <div id="log-completed-visit-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-xl border border-slate-100 overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
              <h3 className="text-base font-bold text-slate-800">Record Completed Field Call</h3>
              <button
                onClick={() => {
                  setIsLogModalOpen(false);
                  clearSignature();
                }}
                className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-lg border border-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleLogSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Doctor, Date and Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Select Doctor *</label>
                  <select
                    required
                    value={logHcpId}
                    onChange={(e) => setLogHcpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
                  >
                    <option value="">-- Choose doctor --</option>
                    {hcps.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Call Date</label>
                  <input
                    type="date"
                    required
                    value={logDate}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    min={5}
                    max={120}
                    value={logDuration}
                    onChange={(e) => setLogDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Call Channel */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-mono">Call Channel Type</label>
                <div className="flex gap-4">
                  {['Face-to-Face', 'Remote Video', 'Phone'].map(type => (
                    <label key={type} className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="radio"
                        name="channel"
                        checked={logType === type}
                        onChange={() => setLogType(type as any)}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Products Detailed (VEEVA CLM style check) */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-1.5">Product detailing slides presented</h4>
                
                <div className="space-y-3.5">
                  {detailedProds.map((p, idx) => {
                    const item = products.find(prod => prod.id === p.productId);
                    if (!item) return null;
                    return (
                      <div key={p.productId} className="flex flex-col md:flex-row md:items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        <label className="flex items-center gap-2 font-bold text-slate-700 md:w-44 shrink-0 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={p.selected}
                            onChange={(e) => {
                              const updated = [...detailedProds];
                              updated[idx].selected = e.target.checked;
                              setDetailedProds(updated);
                            }}
                            className="rounded text-indigo-600 focus:ring-indigo-500"
                          />
                          <span>{item.name}</span>
                        </label>

                        {p.selected && (
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-[10px] uppercase font-mono">Engagement (1-10)</span>
                              <input
                                type="range"
                                min={1}
                                max={10}
                                value={p.score}
                                onChange={(e) => {
                                  const updated = [...detailedProds];
                                  updated[idx].score = parseInt(e.target.value);
                                  setDetailedProds(updated);
                                }}
                                className="w-24 accent-indigo-600 h-1.5 rounded-lg bg-slate-200 appearance-none"
                              />
                              <span className="font-bold text-indigo-600 font-mono w-4">{p.score}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 text-[10px] uppercase font-mono">Feedback Stance</span>
                              <select
                                value={p.feedback}
                                onChange={(e) => {
                                  const updated = [...detailedProds];
                                  updated[idx].feedback = e.target.value;
                                  setDetailedProds(updated);
                                }}
                                className="px-2 py-1 rounded border border-slate-200 text-[11px] bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                              >
                                <option value="Highly Interested">Highly Interested</option>
                                <option value="Neutral">Neutral</option>
                                <option value="Skeptical">Skeptical</option>
                                <option value="Needs clinical data">Needs clinical data</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sample drops & quantities */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-1.5">Samples Dropped (Starter Packs)</h4>
                
                <div className="space-y-3">
                  {droppedSamples.map((s, idx) => {
                    const item = products.find(prod => prod.id === s.productId);
                    const invItem = inventory.find(i => i.productId === s.productId);
                    if (!item) return null;
                    return (
                      <div key={s.productId} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        <label className="flex items-center gap-2 font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={s.selected}
                            onChange={(e) => {
                              const updated = [...droppedSamples];
                              updated[idx].selected = e.target.checked;
                              setDroppedSamples(updated);
                            }}
                            className="rounded text-amber-600 focus:ring-amber-500"
                          />
                          <span>{item.name} 10mg Starter Pack</span>
                        </label>

                        {s.selected && (
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-[10px] font-mono">Stock available: {invItem ? invItem.availableQty : 0}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-500">Qty:</span>
                              <input
                                type="number"
                                min={1}
                                max={50}
                                value={s.quantity}
                                onChange={(e) => {
                                  const updated = [...droppedSamples];
                                  updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                                  setDroppedSamples(updated);
                                }}
                                className="w-12 text-center px-1 py-0.5 rounded border border-slate-200 text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Physician Signature compliance canvas */}
              {droppedSamples.some(s => s.selected) && (
                <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-amber-100/40 relative">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-800 font-mono flex items-center gap-1.5">
                      <BriefcaseMedical size={14} className="text-amber-500 animate-pulse" />
                      <span>Physician Sample Acknowledgement & Sign-off *</span>
                    </label>
                    {isSigned && (
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="text-rose-500 text-[10px] font-semibold hover:text-rose-600 flex items-center gap-1 cursor-pointer bg-white px-2 py-1 rounded border border-slate-100"
                      >
                        <Eraser size={11} />
                        <span>Clear Pad</span>
                      </button>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal font-sans mb-2">
                    Pursuant to Section 503 of the FDCA (PDMA Act), the recipient doctor must sign to verify they have requested and received these drug sample quantities.
                  </p>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden relative h-32 flex items-center justify-center">
                    <canvas
                      ref={canvasRef}
                      width={520}
                      height={120}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={endDrawing}
                      onMouseLeave={endDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={endDrawing}
                      className="w-full h-full cursor-crosshair bg-white"
                    />
                    {!isSigned && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs font-mono tracking-wide">
                        DRAW DOCTOR SIGNATURE HERE
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Visit Discussion Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-mono">Detailed Discussion Notes *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Walked physician through clinical PFS curves. Handled objections regarding tolerability levels, dropped starter kits..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              {/* Follow up Required */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={logFollowUp}
                    onChange={(e) => setLogFollowUp(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Requires Clinical Follow-up Actions</span>
                </label>

                {logFollowUp && (
                  <div className="space-y-1.5 pl-5 animate-slide-down">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Query MSL regarding renal titration profiles or draft follow-up brochure."
                      value={logFollowUpNotes}
                      onChange={(e) => setLogFollowUpNotes(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Submission buttons */}
              <div className="pt-4 flex gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogModalOpen(false);
                    clearSignature();
                  }}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  File Certified CRM Call Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
