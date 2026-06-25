import React, { useState } from 'react';
import { 
  Award, 
  MapPin, 
  Clock, 
  Plus, 
  Search, 
  X, 
  Sparkles, 
  CheckCircle, 
  FileCheck2,
  DollarSign,
  UserCheck2,
  AlertCircle
} from 'lucide-react';
import { MedicalEvent, HCP } from '../types';

interface EventsManagerProps {
  events: MedicalEvent[];
  hcps: HCP[];
  onAddEvent: (newEvent: MedicalEvent) => void;
  onUpdateEventStatus: (eventId: string, attendeeId: string, status: 'Invited' | 'Confirmed' | 'Attended' | 'No Show') => void;
}

export default function EventsManager({ events, hcps, onAddEvent, onUpdateEventStatus }: EventsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);

  // Form states for creating a new Medical Event
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newVenue, setNewVenue] = useState('');
  const [newSpeakerName, setNewSpeakerName] = useState('');
  const [newSpeakerSpecialty, setNewSpeakerSpecialty] = useState('Cardiology');
  const [newBudget, setNewBudget] = useState(5000);
  const [newDesc, setNewDesc] = useState('');

  // Filtered Events
  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.venue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newVenue || !newSpeakerName) {
      alert('Event Title, Venue, and Speaker Name are required.');
      return;
    }

    // Default select 2 random HCPs as invited initially
    const targetAttendees = hcps.slice(0, 3).map(h => ({
      hcpId: h.id,
      hcpName: h.name,
      specialty: h.specialty,
      status: 'Invited' as const
    }));

    const event: MedicalEvent = {
      id: `event-${Date.now()}`,
      title: newTitle,
      date: newDate,
      time: newTime,
      venue: newVenue,
      speakerName: newSpeakerName,
      speakerSpecialty: newSpeakerSpecialty,
      status: 'Planned',
      budget: newBudget,
      attendees: targetAttendees,
      description: newDesc
    };

    onAddEvent(event);
    setIsAddModalOpen(false);

    // Reset Form
    setNewTitle('');
    setNewDate('');
    setNewTime('');
    setNewVenue('');
    setNewSpeakerName('');
    setNewBudget(5000);
    setNewDesc('');
  };

  const toggleAttendeeStatus = (eventId: string, attendeeId: string, currentStatus: string) => {
    // Cycle status: Invited -> Confirmed -> Attended -> No Show -> Invited
    let nextStatus: 'Invited' | 'Confirmed' | 'Attended' | 'No Show' = 'Invited';
    if (currentStatus === 'Invited') nextStatus = 'Confirmed';
    else if (currentStatus === 'Confirmed') nextStatus = 'Attended';
    else if (currentStatus === 'Attended') nextStatus = 'No Show';

    onUpdateEventStatus(eventId, attendeeId, nextStatus);

    // Sync active local modal detail view
    if (selectedEvent && selectedEvent.id === eventId) {
      const updatedAttendees = selectedEvent.attendees.map(a => 
        a.hcpId === attendeeId ? { ...a, status: nextStatus } : a
      );
      setSelectedEvent({ ...selectedEvent, attendees: updatedAttendees });
    }
  };

  return (
    <div id="events-manager-container" className="space-y-6 animate-fade-in">
      
      {/* Title block with action */}
      <div id="events-header" className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Medical Events Coordination</h2>
          <p className="text-slate-500 text-sm mt-1">Organize roundtables, symposia, and clinical speaker programs for KOLs</p>
        </div>
        <button
          id="btn-add-event"
          onClick={() => setIsAddModalOpen(true)}
          className="bg-teal-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-teal-700 transition flex items-center gap-2 shadow-md shadow-teal-600/10 cursor-pointer"
        >
          <Plus size={16} />
          <span>Plan New Program</span>
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div id="events-summary" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Scheduled Programs</p>
            <h4 className="text-lg font-bold text-slate-800 mt-0.5">{events.length} Programs</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Committed Speaker Budgets</p>
            <h4 className="text-lg font-bold text-slate-800 mt-0.5">
              ${events.reduce((acc, e) => acc + e.budget, 0).toLocaleString()} USD
            </h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <UserCheck2 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">KOL Speaker Network</p>
            <h4 className="text-lg font-bold text-indigo-600 mt-0.5">Active & Compliant</h4>
          </div>
        </div>
      </div>

      {/* Directory Search & List */}
      <div id="events-search-bar" className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs flex items-center">
        <div className="relative flex-1 max-w-md text-xs">
          <Search className="absolute left-3 top-3.5 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search medical programs or venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid of Programs */}
      <div id="events-grid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredEvents.map((event) => (
          <div 
            key={event.id}
            id={`event-card-${event.id}`}
            className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between hover:border-slate-200 hover:shadow-xs transition space-y-4"
          >
            <div className="space-y-2">
              <div className="flex justify-between items-start gap-3">
                <h4 className="font-bold text-slate-800 text-sm leading-snug">{event.title}</h4>
                <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold shrink-0 ${
                  event.status === 'Planned' ? 'bg-teal-50 text-teal-600 border border-teal-100' : 'bg-slate-100 text-slate-500'
                }`}>
                  {event.status}
                </span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{event.description}</p>
            </div>

            <div className="space-y-2 text-xs text-slate-600 font-mono bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <div className="flex gap-2 items-center">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <span className="truncate">{event.venue}</span>
              </div>
              <div className="flex gap-2 items-center">
                <Clock size={13} className="text-slate-400 shrink-0" />
                <span>{event.date} • {event.time}</span>
              </div>
              <div className="flex gap-2 items-center border-t border-slate-200/60 pt-2 mt-2">
                <UserCheck2 size={13} className="text-teal-600 shrink-0" />
                <span>Speaker: <strong className="text-slate-700 font-semibold">{event.speakerName}</strong> ({event.speakerSpecialty})</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
              <span className="font-mono text-slate-400">Budget: <strong className="text-slate-800 font-semibold">${event.budget.toLocaleString()}</strong></span>
              
              <button
                id={`btn-manage-rsvp-${event.id}`}
                onClick={() => setSelectedEvent(event)}
                className="bg-slate-100 border border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-200 hover:text-teal-700 text-[11px] font-bold py-1.5 px-3 rounded-lg transition cursor-pointer"
              >
                Manage RSVP List ({event.attendees.length})
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* RSVP / ATTENDEE MANAGER DRAWER MODAL */}
      {selectedEvent && (
        <div id="rsvp-manager-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-xl border border-slate-100 overflow-hidden animate-scale-up">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[9px] font-bold text-teal-600 font-mono uppercase bg-teal-50 px-2 py-0.5 rounded border border-teal-100">RSVP Registrar</span>
                <h3 className="text-sm font-bold text-slate-800 mt-1">{selectedEvent.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-lg border border-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono mb-2">Physician Attendance List</h4>
                <p className="text-[11px] text-slate-400 leading-normal mb-4 font-sans">
                  Click on any target physician's status chip below to cycle through invitation stages: <strong className="text-slate-600">Invited → Confirmed → Attended → No Show</strong>.
                </p>

                <div className="space-y-2">
                  {selectedEvent.attendees.map((a) => (
                    <div key={a.hcpId} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800">{a.hcpName}</h5>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{a.specialty}</p>
                      </div>

                      <button
                        onClick={() => toggleAttendeeStatus(selectedEvent.id, a.hcpId, a.status)}
                        className={`text-[10px] font-bold font-mono px-3 py-1 rounded-full border transition-all cursor-pointer ${
                          a.status === 'Attended' 
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                            : a.status === 'Confirmed' 
                            ? 'bg-teal-50 text-teal-600 border-teal-200' 
                            : a.status === 'No Show' 
                            ? 'bg-rose-50 text-rose-500 border-rose-200' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {a.status}
                      </button>
                    </div>
                  ))}

                  {selectedEvent.attendees.length === 0 && (
                    <p className="text-xs text-slate-400 text-center font-mono py-4">No doctors registered for this medical program invitation lists.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end border-t border-slate-100">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-5 rounded-xl transition cursor-pointer"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE PROGRAM MODAL */}
      {isAddModalOpen && (
        <div id="add-program-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden animate-scale-up">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Plan Medical Program</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-lg border border-slate-100 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-mono">Program Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PARP Inhibitors Dinner Symposium"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Time *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6:30 PM - 9:00 PM"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-mono">Venue Location Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. L'Espalier Private Dining Room, Boston"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Speaker Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Marcus Vance"
                    value={newSpeakerName}
                    onChange={(e) => setNewSpeakerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Therapeutic Field</label>
                  <select
                    value={newSpeakerSpecialty}
                    onChange={(e) => setNewSpeakerSpecialty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-800"
                  >
                    <option value="Cardiology">Cardiology</option>
                    <option value="Oncology">Oncology</option>
                    <option value="Neurology">Neurology</option>
                    <option value="General Medicine">General Medicine</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600 font-mono">Allocated Budget ($ USD) *</label>
                  <input
                    type="number"
                    required
                    min={500}
                    max={50000}
                    value={newBudget}
                    onChange={(e) => setNewBudget(parseInt(e.target.value) || 5000)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-mono">Program Description & Objectives</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Host roundtables on clinical survival outcomes data with oncology practitioners..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs resize-none focus:outline-none"
                />
              </div>

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
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  Plan Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
