import React, { useState } from 'react';
import { 
  Search, 
  UserPlus, 
  Hospital, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  History, 
  Sparkles, 
  X, 
  CheckCircle, 
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  Activity
} from 'lucide-react';
import { HCP, Product, CallLog } from '../types';

interface HCPDirectoryProps {
  hcps: HCP[];
  products: Product[];
  calls: CallLog[];
  onAddHcp: (newHcp: HCP) => void;
  onNavigateToTab: (tabId: string) => void;
}

export default function HCPDirectory({ hcps, products, calls, onAddHcp, onNavigateToTab }: HCPDirectoryProps) {
  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal and Form States
  const [selectedHcp, setSelectedHcp] = useState<HCP | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const [aiBriefing, setAiBriefing] = useState<string | null>(null);

  // New HCP Form State
  const [newHcpName, setNewHcpName] = useState('');
  const [newHcpTitle, setNewHcpTitle] = useState('M.D.');
  const [newHcpSpecialty, setNewHcpSpecialty] = useState('Cardiology');
  const [newHcpHospital, setNewHcpHospital] = useState('');
  const [newHcpAddress, setNewHcpAddress] = useState('');
  const [newHcpPhone, setNewHcpPhone] = useState('');
  const [newHcpEmail, setNewHcpEmail] = useState('');
  const [newHcpSegment, setNewHcpSegment] = useState<'A' | 'B' | 'C'>('B');
  const [newHcpStatus, setNewHcpStatus] = useState<'Target' | 'Active'>('Target');
  const [newHcpTerritory, setNewHcpTerritory] = useState('Northeast-1');
  const [newHcpBestContact, setNewHcpBestContact] = useState('');
  const [newHcpNotes, setNewHcpNotes] = useState('');

  // Filtering Logic
  const filteredHcps = hcps.filter(hcp => {
    const matchesSearch = hcp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          hcp.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || hcp.specialty === selectedSpecialty;
    const matchesSegment = selectedSegment === 'All' || hcp.segment === selectedSegment;
    const matchesStatus = selectedStatus === 'All' || hcp.status === selectedStatus;
    
    return matchesSearch && matchesSpecialty && matchesSegment && matchesStatus;
  });

  // Extract unique specialties for filtering
  const specialties = ['All', ...Array.from(new Set(hcps.map(h => h.specialty)))];

  // Get calls specifically for the selected HCP
  const getHcpCalls = (hcpId: string) => {
    return calls.filter(c => c.hcpId === hcpId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  // Trigger Gemini Clinical Briefing
  const fetchClinicalBriefing = async (hcp: HCP) => {
    setIsBriefingLoading(true);
    setAiBriefing(null);
    try {
      const hcpCalls = getHcpCalls(hcp.id);
      const response = await fetch('/api/clinical-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hcp,
          products,
          logs: hcpCalls
        })
      });
      const data = await response.json();
      if (response.ok) {
        setAiBriefing(data.text);
      } else {
        setAiBriefing(`Error: ${data.error || 'Failed to generate briefing. Please check your console.'}`);
      }
    } catch (err: any) {
      setAiBriefing(`Failed to connect to AI briefing service: ${err.message}`);
    } finally {
      setIsBriefingLoading(false);
    }
  };

  const handleAddHcpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHcpName || !newHcpHospital) {
      alert('HCP Name and Hospital are required.');
      return;
    }

    const createdHcp: HCP = {
      id: `hcp-${Date.now()}`,
      name: newHcpName,
      title: newHcpTitle,
      specialty: newHcpSpecialty,
      hospital: newHcpHospital,
      address: newHcpAddress || 'TBD',
      phone: newHcpPhone || '(555) 000-0000',
      email: newHcpEmail || `${newHcpName.toLowerCase().replace(/\s+/g, '')}@hospital.org`,
      segment: newHcpSegment,
      status: newHcpStatus,
      territory: newHcpTerritory,
      bestContactTime: newHcpBestContact || 'TBD',
      notes: newHcpNotes,
      totalCalls: 0
    };

    onAddHcp(createdHcp);
    setIsAddModalOpen(false);
    
    // Reset Form
    setNewHcpName('');
    setNewHcpHospital('');
    setNewHcpAddress('');
    setNewHcpPhone('');
    setNewHcpEmail('');
    setNewHcpNotes('');
    setNewHcpBestContact('');
  };

  // Helper to safely display AI Briefing in a clean way (parsing simple markdown bullet formats)
  const formatBriefingText = (text: string) => {
    return text.split('\n').map((line, idx) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return <h4 key={idx} className="text-sm font-bold text-teal-400 mt-4 mb-2 uppercase tracking-wider font-mono">{line.replace('### ', '')}</h4>;
      }
      // Heading 2 / 1
      if (line.startsWith('## ') || line.startsWith('# ')) {
        const cleaned = line.replace('## ', '').replace('# ', '');
        return <h3 key={idx} className="text-base font-bold text-white border-b border-slate-700/60 pb-1 mt-5 mb-3">{cleaned}</h3>;
      }
      // Bold items
      let content = line;
      if (line.startsWith('* ') || line.startsWith('- ')) {
        content = line.substring(2);
        // Basic replacement of **bold** to safe span
        const parts = content.split('**');
        return (
          <li key={idx} className="list-disc ml-5 text-xs text-slate-300 leading-relaxed mb-1.5">
            {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part)}
          </li>
        );
      }
      // Standard line formatting
      const parts = line.split('**');
      return (
        <p key={idx} className="text-xs text-slate-300 leading-relaxed mb-2">
          {parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="text-white font-semibold">{part}</strong> : part)}
        </p>
      );
    });
  };

  return (
    <div id="hcp-directory-container" className="space-y-6 animate-fade-in">
      
      {/* Header section with add prospect */}
      <div id="hcp-directory-header" className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Physician Directory</h2>
          <p className="text-slate-500 text-sm mt-1">Manage target Healthcare Professionals (HCPs) and therapeutic profiles</p>
        </div>
        <button
          id="btn-add-prospect"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-teal-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-teal-700 transition flex items-center gap-2 shadow-md shadow-teal-600/10 cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Add Prospect</span>
        </button>
      </div>

      {/* Directory Control & Search Filters */}
      <div id="hcp-directory-filters" className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
          <input
            id="search-hcp-input"
            type="text"
            placeholder="Search by Doctor or Hospital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
        </div>

        {/* Specialty Select */}
        <div>
          <select
            id="filter-specialty"
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
          >
            <option disabled>Filter by Specialty</option>
            <option value="All">All Specialties</option>
            {specialties.filter(s => s !== 'All').map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>

        {/* Segment Select */}
        <div>
          <select
            id="filter-segment"
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
          >
            <option value="All">All Segments (A/B/C)</option>
            <option value="A">Segment A (High Value)</option>
            <option value="B">Segment B (Medium Value)</option>
            <option value="C">Segment C (Core Target)</option>
          </select>
        </div>

        {/* Status Select */}
        <div>
          <select
            id="filter-status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
          >
            <option value="All">All Stances</option>
            <option value="Active">Active Prescribers</option>
            <option value="Target">Target Outreach</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Grid of Physicians */}
      <div id="hcp-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHcps.map((hcp) => {
          const hcpCalls = getHcpCalls(hcp.id);
          const lastCall = hcpCalls[0];
          
          return (
            <div 
              key={hcp.id}
              id={`hcp-card-${hcp.id}`}
              className="bg-white rounded-2xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group"
            >
              {/* Card Header Banner */}
              <div className="p-5 border-b border-slate-50 flex items-start justify-between relative bg-slate-50/40">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-800 text-base truncate group-hover:text-teal-600 transition-colors">
                      {hcp.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium shrink-0 font-mono">{hcp.title}</span>
                  </div>
                  <p className="text-xs text-teal-600 font-semibold mt-0.5">{hcp.specialty}</p>
                </div>

                {/* VEEVA Segmentation Tag */}
                <div className="flex flex-col items-end gap-1 shrink-0 font-mono">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold border ${
                    hcp.segment === 'A' 
                      ? 'bg-rose-50 text-rose-600 border-rose-100' 
                      : hcp.segment === 'B' 
                      ? 'bg-amber-50 text-amber-600 border-amber-100' 
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    SEG {hcp.segment}
                  </span>
                  <span className={`text-[8px] uppercase tracking-wider font-bold ${
                    hcp.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'
                  }`}>
                    ● {hcp.status}
                  </span>
                </div>
              </div>

              {/* Card Body Info */}
              <div className="p-5 flex-1 space-y-3 text-xs text-slate-600">
                <div className="flex gap-2">
                  <Hospital size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="truncate" title={hcp.hospital}>{hcp.hospital}</span>
                </div>
                <div className="flex gap-2">
                  <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2" title={hcp.address}>{hcp.address}</span>
                </div>
                <div className="flex gap-2">
                  <Clock size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-teal-700 font-medium font-mono truncate" title={hcp.bestContactTime}>{hcp.bestContactTime}</span>
                </div>

                <div className="border-t border-slate-100 pt-3 flex justify-between text-[11px] font-mono text-slate-500">
                  <span>Completed visits: <strong className="text-slate-800">{hcp.totalCalls}</strong></span>
                  {lastCall ? (
                    <span className="text-right">Last Visit: <strong className="text-slate-700">{lastCall.date}</strong></span>
                  ) : (
                    <span className="text-right text-rose-400">No calls registered</span>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex gap-2">
                <button
                  id={`btn-view-profile-${hcp.id}`}
                  onClick={() => {
                    setSelectedHcp(hcp);
                    setAiBriefing(null);
                  }}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>View Profile</span>
                </button>
                <button
                  id={`btn-quick-detail-${hcp.id}`}
                  onClick={() => onNavigateToTab('detailing')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl transition flex items-center justify-center cursor-pointer"
                  title="Launch Interactive Detailing Presentation"
                >
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {filteredHcps.length === 0 && (
          <div className="col-span-full bg-white border border-slate-100 p-12 rounded-2xl text-center space-y-3">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-400">
              <Search size={20} />
            </div>
            <h4 className="text-slate-800 font-bold text-sm">No physicians matching search parameters</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">Try adjusting your filters, searching for a different therapeutic specialty, or registers a new physician prospect.</p>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* HCP PROFILE VIEW DRAWER/MODAL                            */}
      {/* ========================================================= */}
      {selectedHcp && (
        <div id="hcp-profile-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-xl border border-slate-100 overflow-hidden flex flex-col md:flex-row h-[90vh] max-h-[750px] animate-scale-up">
            
            {/* Modal Left Column: Doctor Profile details & Logs */}
            <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-6 border-b md:border-b-0 md:border-r border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-slate-800">{selectedHcp.name}</h3>
                    <span className="text-xs text-slate-400 font-mono font-bold mt-1">{selectedHcp.title}</span>
                  </div>
                  <p className="text-sm text-teal-600 font-semibold">{selectedHcp.specialty}</p>
                </div>
                
                {/* Segment identifier */}
                <div className="text-right font-mono text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold border ${
                    selectedHcp.segment === 'A' 
                      ? 'bg-rose-50 text-rose-600 border-rose-100' 
                      : selectedHcp.segment === 'B' 
                      ? 'bg-amber-50 text-amber-600 border-amber-100' 
                      : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                  }`}>
                    Segment {selectedHcp.segment}
                  </span>
                </div>
              </div>

              {/* Core Directory Stats */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="space-y-1">
                  <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider font-mono">Therapeutic Stance</p>
                  <p className="text-slate-800 font-semibold">{selectedHcp.status} Target</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider font-mono">Contact Preference</p>
                  <p className="text-teal-700 font-semibold font-mono">{selectedHcp.bestContactTime.split('(')[0]}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider font-mono">Territory Mapping</p>
                  <p className="text-slate-800 font-semibold">{selectedHcp.territory}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-400 uppercase font-bold text-[10px] tracking-wider font-mono">Total Completed Calls</p>
                  <p className="text-slate-800 font-semibold">{selectedHcp.totalCalls} calls</p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-1.5">Direct Contact Channels</h4>
                <div className="space-y-2.5 text-xs text-slate-600 font-mono">
                  <div className="flex gap-2.5 items-center">
                    <Hospital size={14} className="text-slate-400" />
                    <span>{selectedHcp.hospital}</span>
                  </div>
                  <div className="flex gap-2.5 items-start">
                    <MapPin size={14} className="text-slate-400 mt-0.5" />
                    <span className="font-sans">{selectedHcp.address}</span>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <Phone size={14} className="text-slate-400" />
                    <span>{selectedHcp.phone}</span>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <Mail size={14} className="text-slate-400" />
                    <span className="hover:text-teal-600 transition-colors cursor-pointer">{selectedHcp.email}</span>
                  </div>
                </div>
              </div>

              {/* CRM Interaction Logs */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-1.5">Call Completion History</h4>
                
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {getHcpCalls(selectedHcp.id).map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-2">
                      <div className="flex justify-between font-mono text-[10px] text-slate-500">
                        <span className="font-bold text-slate-700">{log.date} • {log.type}</span>
                        <span>{log.durationMinutes} mins</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-sans italic">"{log.discussionNotes}"</p>
                      
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {log.productsDetailed.map((p, pIdx) => (
                          <span key={pIdx} className="bg-indigo-50 text-indigo-700 text-[9px] px-2 py-0.5 rounded font-mono font-semibold">
                            {p.productName} ({p.doctorFeedback})
                          </span>
                        ))}
                        {log.samplesDropped.map((s, sIdx) => (
                          <span key={sIdx} className="bg-amber-50 text-amber-700 text-[9px] px-2 py-0.5 rounded font-mono font-semibold">
                            Dropped {s.quantity}x {s.productName.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}

                  {getHcpCalls(selectedHcp.id).length === 0 && (
                    <p className="text-xs text-slate-400 text-center py-4 font-mono">No interactions logged in this territory yet.</p>
                  )}
                </div>
              </div>

              {/* Sales Rep Administrative Notes */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono border-b border-slate-100 pb-1.5">Territory Intelligence</h4>
                <p className="text-xs text-slate-600 bg-teal-50/50 p-3.5 rounded-xl border border-teal-100/40 leading-relaxed">
                  {selectedHcp.notes}
                </p>
              </div>

            </div>

            {/* Modal Right Column: Dynamic Gemini Pre-Visit Clinical Briefing */}
            <div className="w-full md:w-[380px] bg-slate-900 text-white p-6 md:p-8 flex flex-col h-full overflow-hidden relative">
              <button
                onClick={() => setSelectedHcp(null)}
                className="absolute right-4 top-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-xl transition cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="mb-4">
                <div className="flex items-center gap-2 text-teal-400 font-mono text-[10px] font-bold mb-1">
                  <Activity size={12} className="animate-pulse" />
                  <span>VEEVA-AI BRIEFING SERVICE</span>
                </div>
                <h3 className="text-lg font-bold tracking-tight">AI Tactical Brief</h3>
                <p className="text-xs text-slate-400 mt-1">Deploy generative intelligence to build custom medical pitching outlines.</p>
              </div>

              {/* Briefing output or trigger screen */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                {aiBriefing ? (
                  <div className="space-y-2 pb-6 border-slate-800">
                    {formatBriefingText(aiBriefing)}
                  </div>
                ) : isBriefingLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 font-mono">
                    <div className="w-10 h-10 border-2 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <p className="text-xs text-teal-400 font-bold">Consolidating CRM logs...</p>
                      <p className="text-[10px] text-slate-500 mt-1 max-w-[200px] leading-relaxed mx-auto">Evaluating physician segment, past objections, and clinical targets with Gemini...</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-2xl">
                    <Sparkles size={32} className="text-teal-400 mb-3" />
                    <h4 className="text-xs font-bold text-white mb-1.5">No briefing generated</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed mb-4">Click below to query Gemini for a personalized, clinically compliant pitch outline for {selectedHcp.name}.</p>
                    <button
                      onClick={() => fetchClinicalBriefing(selectedHcp)}
                      className="bg-teal-500 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl hover:bg-teal-400 transition cursor-pointer flex items-center gap-1.5 shadow-lg shadow-teal-500/20"
                    >
                      <Sparkles size={14} />
                      <span>Assemble AI Briefing</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Quick recalculate button when briefing exists */}
              {aiBriefing && !isBriefingLoading && (
                <button
                  onClick={() => fetchClinicalBriefing(selectedHcp)}
                  className="mt-4 bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs font-bold py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-2 border border-slate-800"
                >
                  <Sparkles size={12} />
                  <span>Refresh Briefing</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ADD PROSPECT MODAL                                        */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div id="add-prospect-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden animate-scale-up">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Add Physician Prospect</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-lg border border-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddHcpSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Doctor Name and Credentials */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Physician Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Liam Fitzpatrick"
                    value={newHcpName}
                    onChange={(e) => setNewHcpName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Title</label>
                  <select
                    value={newHcpTitle}
                    onChange={(e) => setNewHcpTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  >
                    <option value="M.D.">M.D.</option>
                    <option value="M.D., Ph.D.">M.D., Ph.D.</option>
                    <option value="D.O.">D.O.</option>
                    <option value="F.A.C.C.">F.A.C.C.</option>
                    <option value="F.A.C.P.">F.A.C.P.</option>
                  </select>
                </div>
              </div>

              {/* Specialty & Hospital */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Therapeutic Specialty</label>
                  <select
                    value={newHcpSpecialty}
                    onChange={(e) => setNewHcpSpecialty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Hospital / HCO *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Boston General Hospital"
                    value={newHcpHospital}
                    onChange={(e) => setNewHcpHospital(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Location Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-mono">Clinic Office Address</label>
                <input
                  type="text"
                  placeholder="e.g. 100 Medical Center Dr, Boston, MA"
                  value={newHcpAddress}
                  onChange={(e) => setNewHcpAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                />
              </div>

              {/* Contact Information & Best Contact Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Office Phone</label>
                  <input
                    type="text"
                    placeholder="e.g. (617) 555-0100"
                    value={newHcpPhone}
                    onChange={(e) => setNewHcpPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Secure Email</label>
                  <input
                    type="email"
                    placeholder="e.g. doctor@hospital.org"
                    value={newHcpEmail}
                    onChange={(e) => setNewHcpEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
              </div>

              {/* Best contact & Segmentation */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Best Contact Time</label>
                  <input
                    type="text"
                    placeholder="e.g. Mondays 8AM - 10AM"
                    value={newHcpBestContact}
                    onChange={(e) => setNewHcpBestContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Segment</label>
                  <select
                    value={newHcpSegment}
                    onChange={(e) => setNewHcpSegment(e.target.value as 'A' | 'B' | 'C')}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 bg-white"
                  >
                    <option value="A">A (KOL)</option>
                    <option value="B">B (Medium)</option>
                    <option value="C">C (Core)</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-mono">Tactical Field Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Stated openness to renal safety trials. Prefers head-to-head clinical briefs."
                  value={newHcpNotes}
                  onChange={(e) => setNewHcpNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="pt-4 flex gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2.5 rounded-xl transition shadow-md shadow-teal-600/10 cursor-pointer"
                >
                  Register Prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
