import React from 'react';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  Calendar, 
  CheckCircle, 
  TrendingUp, 
  Package, 
  Clock, 
  ShieldAlert, 
  ChevronRight, 
  Presentation,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { HCP, CallLog, SampleInventory, MedicalEvent } from '../types';

interface DashboardProps {
  hcps: HCP[];
  calls: CallLog[];
  inventory: SampleInventory[];
  events: MedicalEvent[];
  onStartDetailing: (productId: string, hcpId: string) => void;
  onNavigateToTab: (tabId: string) => void;
}

export default function Dashboard({ 
  hcps, 
  calls, 
  inventory, 
  events, 
  onStartDetailing,
  onNavigateToTab 
}: DashboardProps) {
  
  // 1. Calculate KPI Metrics
  const totalCallsCount = calls.length;
  const highSegmentCount = hcps.filter(h => h.segment === 'A').length;
  const reachedHighSegmentCount = hcps.filter(h => h.segment === 'A' && h.totalCalls > 0).length;
  const targetReachPercent = highSegmentCount > 0 
    ? Math.round((reachedHighSegmentCount / highSegmentCount) * 100) 
    : 0;

  // Average Engagement Score
  let totalEngagement = 0;
  let engagementCount = 0;
  calls.forEach(c => {
    c.productsDetailed.forEach(p => {
      totalEngagement += p.engagementScore;
      engagementCount++;
    });
  });
  const avgEngagement = engagementCount > 0 
    ? (totalEngagement / engagementCount).toFixed(1) 
    : 'N/A';

  // Total samples dropped count
  const totalSamplesDropped = calls.reduce((acc, c) => {
    const qty = c.samplesDropped.reduce((sAcc, s) => sAcc + s.quantity, 0);
    return acc + qty;
  }, 0);

  // 2. Prepare Data for Call Performance Chart (Calls by Specialty)
  const specialtyCallsMap: { [key: string]: number } = {};
  hcps.forEach(h => {
    specialtyCallsMap[h.specialty] = 0;
  });
  calls.forEach(c => {
    const hcp = hcps.find(h => h.id === c.hcpId);
    if (hcp) {
      specialtyCallsMap[hcp.specialty] = (specialtyCallsMap[hcp.specialty] || 0) + 1;
    }
  });
  const specialtyChartData = Object.keys(specialtyCallsMap).map(spec => ({
    name: spec,
    Calls: specialtyCallsMap[spec],
    Goal: spec === 'Cardiology' ? 8 : spec === 'Oncology' ? 5 : 4
  }));

  // 3. Prepare Data for Feedback Distribution
  const feedbackCounts: { [key: string]: number } = {
    'Highly Interested': 0,
    'Neutral': 0,
    'Skeptical': 0,
    'Needs clinical data': 0
  };
  calls.forEach(c => {
    c.productsDetailed.forEach(p => {
      if (feedbackCounts[p.doctorFeedback] !== undefined) {
        feedbackCounts[p.doctorFeedback]++;
      }
    });
  });
  const feedbackColors = ['#14b8a6', '#64748b', '#ef4444', '#f59e0b'];
  const feedbackChartData = Object.keys(feedbackCounts).map(key => ({
    name: key,
    value: feedbackCounts[key]
  })).filter(d => d.value > 0);

  // 4. Identify Actionable Territory Alerts (Smart VEEVA Insights)
  const alerts: { type: 'warning' | 'info' | 'success'; message: string; actionText?: string; targetTab?: string }[] = [];
  
  // Neglected high value doctor alert
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const neglectedKOL = hcps.find(h => {
    if (h.segment !== 'A') return false;
    if (!h.lastVisitDate) return true;
    const lastVisit = new Date(h.lastVisitDate);
    return lastVisit < thirtyDaysAgo;
  });
  if (neglectedKOL) {
    alerts.push({
      type: 'warning',
      message: `KOL ${neglectedKOL.name} (Segment A) has not been visited in over 30 days. Plan a call immediately.`,
      actionText: 'Schedule Visit',
      targetTab: 'planner'
    });
  }

  // Low sample stock alert
  const lowSample = inventory.find(i => i.availableQty < 15);
  if (lowSample) {
    alerts.push({
      type: 'warning',
      message: `Sample stock low: ${lowSample.productName} (${lowSample.availableQty} available). Submit replacement requisition.`,
      actionText: 'Manage Inventory',
      targetTab: 'inventory'
    });
  }

  // Event coordination alert
  const plannedEvents = events.filter(e => e.status === 'Planned');
  if (plannedEvents.length > 0) {
    alerts.push({
      type: 'info',
      message: `You have ${plannedEvents.length} planned medical roundtable events. Ensure HCP RSVP counts are up to date.`,
      actionText: 'Review Events',
      targetTab: 'events'
    });
  }

  // Base case standard alert
  if (alerts.length === 0) {
    alerts.push({
      type: 'success',
      message: 'Territory active and fully compliant. Daily sample drops are within approved compliance safe levels.',
    });
  }

  return (
    <div id="dashboard-view-wrapper" className="space-y-8 animate-fade-in">
      
      {/* Header Info */}
      <div id="dashboard-header" className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Territory Execution Dashboard</h2>
          <p className="text-slate-500 text-sm mt-1">Field operations metrics for Region <span className="font-semibold text-teal-600">Northeast-1 (Boston)</span></p>
        </div>
        <div className="flex gap-3 font-mono text-xs text-slate-500 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
          <Clock size={16} className="text-teal-500" />
          <span>Last Sync: Just now</span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div id="kpi-stats-grid" className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Metric 1 */}
        <div id="metric-card-calls" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Calls Completed</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalCallsCount}</h3>
            <p className="text-xs text-indigo-600 font-medium mt-1 flex items-center gap-1">
              <span>Goal: 20 calls/mo</span>
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div id="metric-card-reach" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-teal-50 text-teal-600 rounded-xl">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Segment A Reach</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{targetReachPercent}%</h3>
            <p className="text-xs text-teal-600 font-medium mt-1">
              {reachedHighSegmentCount} of {highSegmentCount} reached
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div id="metric-card-engagement" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <Presentation size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Avg Detailing Score</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{avgEngagement} <span className="text-xs text-slate-400 font-normal">/10</span></h3>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Across all product pitches
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div id="metric-card-samples" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-amber-50 text-amber-600 rounded-xl">
            <Package size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">Samples Dropped</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalSamplesDropped}</h3>
            <p className="text-xs text-amber-600 font-medium mt-1">
              Physician starter packs
            </p>
          </div>
        </div>

      </div>

      {/* Main Core Layout: Charts on left, Alerts & Actionable List on right */}
      <div id="dashboard-charts-layout" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts Container - span 2 */}
        <div id="charts-panel" className="lg:col-span-2 space-y-6">
          
          {/* Chart 1: Specialty Target vs Actual */}
          <div id="chart-specialty-activity" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Territory Activity by Specialty</h3>
                <p className="text-slate-400 text-xs mt-0.5">Visits completed vs therapeutic target goals</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-teal-500 rounded-sm"></span>
                  <span className="text-slate-600">Completed Calls</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 bg-slate-200 rounded-sm"></span>
                  <span className="text-slate-500">Monthly Target</span>
                </div>
              </div>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={specialtyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    labelStyle={{ fontWeight: 'bold', color: '#2dd4bf' }}
                  />
                  <Bar dataKey="Calls" fill="#0d9488" radius={[4, 4, 0, 0]} barSize={25} />
                  <Bar dataKey="Goal" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={25} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Feedback & CLM analytics */}
          <div id="chart-clm-feedback" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-800">Detailing Reaction Profile</h3>
                <p className="text-slate-400 text-xs mt-0.5">Primary physician responses during product detailing slides</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-48">
                {feedbackChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={feedbackChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {feedbackChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={feedbackColors[index % feedbackColors.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs font-mono">
                    No logs logged yet
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {feedbackChartData.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: feedbackColors[index % feedbackColors.length] }}></span>
                      <span>{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-800">{item.value} call{item.value > 1 ? 's' : ''}</span>
                  </div>
                ))}
                {feedbackChartData.length === 0 && (
                  <p className="text-xs text-slate-400">Pitches detailed will automatically populate feedback distributions here.</p>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Sidebar Alerts / Priority List on right - span 1 */}
        <div id="alerts-and-agenda-panel" className="space-y-6">
          
          {/* Smart AI Territory Insights */}
          <div id="insights-card" className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-2.5 text-teal-400 font-mono text-xs font-bold mb-4">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span>VEEVA-AI SMART ADVISOR</span>
            </div>

            <h4 className="text-base font-bold tracking-tight">Active Rep Insights</h4>
            
            <div className="mt-4 space-y-4">
              {alerts.map((alert, idx) => (
                <div key={idx} className="flex gap-3 text-xs bg-slate-800/60 p-3.5 rounded-xl border border-slate-800">
                  {alert.type === 'warning' ? (
                    <AlertTriangle size={18} className="text-amber-400 shrink-0" />
                  ) : alert.type === 'info' ? (
                    <ShieldAlert size={18} className="text-teal-400 shrink-0" />
                  ) : (
                    <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
                  )}
                  <div className="space-y-2">
                    <p className="text-slate-300 leading-relaxed font-sans">{alert.message}</p>
                    {alert.actionText && alert.targetTab && (
                      <button
                        onClick={() => onNavigateToTab(alert.targetTab!)}
                        className="text-teal-400 font-semibold hover:text-teal-300 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <span>{alert.actionText}</span>
                        <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Priority Target List */}
          <div id="priority-targets" className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Priority Targets Today</h3>
            
            <div className="space-y-4">
              {hcps.filter(h => h.segment === 'A' || h.status === 'Target').slice(0, 3).map((h) => (
                <div key={h.id} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-800">{h.name}</h4>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        h.segment === 'A' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                      }`}>
                        SEG {h.segment}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{h.hospital}</p>
                    <p className="text-[10px] text-teal-600 font-mono font-medium mt-0.5">Best time: {h.bestContactTime.split('(')[0]}</p>
                  </div>
                  <button
                    onClick={() => onStartDetailing('prod-1', h.id)}
                    className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition shadow-sm hover:shadow cursor-pointer flex items-center justify-center"
                    title="Launch CLM eDetailing"
                  >
                    <Presentation size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
