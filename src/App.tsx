import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import HCPDirectory from './components/HCPDirectory';
import CallPlanner from './components/CallPlanner';
import EDetailing from './components/EDetailing';
import SampleInventoryComponent from './components/SampleInventory';
import EventsManager from './components/EventsManager';
import Copilot from './components/Copilot';

import { HCP, Product, CallLog, SampleInventory, MedicalEvent } from './types';
import { 
  INITIAL_HCPS, 
  INITIAL_PRODUCTS, 
  INITIAL_CALL_LOGS, 
  INITIAL_SAMPLE_INVENTORY, 
  INITIAL_EVENTS 
} from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Core CRM States
  const [hcps, setHcps] = useState<HCP[]>([]);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [inventory, setInventory] = useState<SampleInventory[]>([]);
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  // Initialize and load from local storage
  useEffect(() => {
    const storedHcps = localStorage.getItem('pharma_crm_hcps');
    const storedCalls = localStorage.getItem('pharma_crm_calls');
    const storedInventory = localStorage.getItem('pharma_crm_inventory');
    const storedEvents = localStorage.getItem('pharma_crm_events');

    if (storedHcps) setHcps(JSON.parse(storedHcps));
    else setHcps(INITIAL_HCPS);

    if (storedCalls) setCalls(JSON.parse(storedCalls));
    else setCalls(INITIAL_CALL_LOGS);

    if (storedInventory) setInventory(JSON.parse(storedInventory));
    else setInventory(INITIAL_SAMPLE_INVENTORY);

    if (storedEvents) setEvents(JSON.parse(storedEvents));
    else setEvents(INITIAL_EVENTS);
  }, []);

  // Save states back to local storage on changes
  const saveState = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  // 1. Add HCP Prospect
  const handleAddHcp = (newHcp: HCP) => {
    const updated = [newHcp, ...hcps];
    setHcps(updated);
    saveState('pharma_crm_hcps', updated);
  };

  // 2. Add Call Log / CRM Detailing Visit Log (Cross-module side effects!)
  const handleAddCallLog = (newLog: CallLog) => {
    // A. Add the Call Log
    const updatedCalls = [newLog, ...calls];
    setCalls(updatedCalls);
    saveState('pharma_crm_calls', updatedCalls);

    // B. Increment HCP Visit counters & dates
    const updatedHcps = hcps.map(h => {
      if (h.id === newLog.hcpId) {
        return {
          ...h,
          totalCalls: h.totalCalls + 1,
          lastVisitDate: newLog.date,
          status: 'Active' as const // Ensure they are active prescribers now
        };
      }
      return h;
    });
    setHcps(updatedHcps);
    saveState('pharma_crm_hcps', updatedHcps);

    // C. Decrement matching Sample Inventories dropped
    let updatedInventory = [...inventory];
    newLog.samplesDropped.forEach(drop => {
      updatedInventory = updatedInventory.map(item => {
        if (item.productId === drop.productId) {
          return {
            ...item,
            availableQty: Math.max(0, item.availableQty - drop.quantity)
          };
        }
        return item;
      });
    });
    setInventory(updatedInventory);
    saveState('pharma_crm_inventory', updatedInventory);
  };

  // 3. Replenish sample stock levels
  const handleReplenishStock = (productId: string, quantity: number) => {
    const updated = inventory.map(item => {
      if (item.productId === productId) {
        return {
          ...item,
          availableQty: item.availableQty + quantity,
          allocatedQty: item.allocatedQty + quantity
        };
      }
      return item;
    });
    setInventory(updated);
    saveState('pharma_crm_inventory', updated);
  };

  // 4. Create Medical Event roundtable
  const handleAddEvent = (newEvent: MedicalEvent) => {
    const updated = [newEvent, ...events];
    setEvents(updated);
    saveState('pharma_crm_events', updated);
  };

  // 5. Update RSVP status of doctors at Roundtable events
  const handleUpdateEventStatus = (
    eventId: string, 
    attendeeId: string, 
    status: 'Invited' | 'Confirmed' | 'Attended' | 'No Show'
  ) => {
    const updated = events.map(evt => {
      if (evt.id === eventId) {
        const updatedAttendees = evt.attendees.map(a => {
          if (a.hcpId === attendeeId) {
            return { ...a, status };
          }
          return a;
        });
        return { ...evt, attendees: updatedAttendees };
      }
      return evt;
    });
    setEvents(updated);
    saveState('pharma_crm_events', updated);
  };

  // Navigation redirect helper
  const handleNavigateToTab = (tabId: string) => {
    setActiveTab(tabId);
  };

  const handleStartDetailing = (productId: string, hcpId: string) => {
    setActiveTab('detailing');
  };

  // Active view renderer
  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            hcps={hcps} 
            calls={calls} 
            inventory={inventory} 
            events={events}
            onStartDetailing={handleStartDetailing}
            onNavigateToTab={handleNavigateToTab}
          />
        );
      case 'hcp':
        return (
          <HCPDirectory 
            hcps={hcps} 
            products={products} 
            calls={calls} 
            onAddHcp={handleAddHcp}
            onNavigateToTab={handleNavigateToTab}
          />
        );
      case 'planner':
        return (
          <CallPlanner 
            hcps={hcps} 
            products={products} 
            calls={calls} 
            inventory={inventory}
            onAddCallLog={handleAddCallLog}
          />
        );
      case 'detailing':
        return (
          <EDetailing 
            hcps={hcps} 
            products={products} 
            onAddCallLog={handleAddCallLog}
            onNavigateToTab={handleNavigateToTab}
          />
        );
      case 'inventory':
        return (
          <SampleInventoryComponent 
            inventory={inventory} 
            onReplenishStock={handleReplenishStock}
          />
        );
      case 'events':
        return (
          <EventsManager 
            events={events} 
            hcps={hcps} 
            onAddEvent={handleAddEvent}
            onUpdateEventStatus={handleUpdateEventStatus}
          />
        );
      case 'copilot':
        return (
          <Copilot 
            hcps={hcps} 
            products={products} 
            calls={calls} 
            inventory={inventory}
            events={events}
          />
        );
      default:
        return <div className="text-center text-slate-500 font-mono py-12">Invalid View Selection.</div>;
    }
  };

  return (
    <div id="pharma-app-root" className="flex bg-slate-50 min-h-screen text-slate-800">
      
      {/* Sidebar navigation */}
      <Sidebar currentTab={activeTab} setTab={setActiveTab} />

      {/* Main Content scrollable Stage */}
      <main id="main-content-stage" className="flex-1 overflow-y-auto p-6 md:p-8 h-screen">
        {renderActiveView()}
      </main>

    </div>
  );
}
