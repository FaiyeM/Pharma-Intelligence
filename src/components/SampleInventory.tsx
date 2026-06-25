import React, { useState } from 'react';
import { 
  PackageOpen, 
  ShieldAlert, 
  Plus, 
  Search, 
  TrendingUp, 
  Activity, 
  Archive, 
  RefreshCw, 
  FileCheck2,
  CalendarDays
} from 'lucide-react';
import { SampleInventory } from '../types';

interface SampleInventoryProps {
  inventory: SampleInventory[];
  onReplenishStock: (productId: string, quantity: number) => void;
}

export default function SampleInventoryComponent({ inventory, onReplenishStock }: SampleInventoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [isReplenishOpen, setIsReplenishOpen] = useState(false);
  const [replenishQty, setReplenishQty] = useState(50);

  // Filter Inventory
  const filteredInventory = inventory.filter(item => 
    item.productName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReplenishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    onReplenishStock(selectedProduct, replenishQty);
    setIsReplenishOpen(false);
    alert('Stock replenishment request filed with distribution depot.');
  };

  return (
    <div id="sample-inventory-container" className="space-y-6 animate-fade-in">
      
      {/* Title block with replenish request action */}
      <div id="inventory-header" className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Drug Samples & Compliance</h2>
          <p className="text-slate-500 text-sm mt-1">Monitor Starter Pack allocations, batch expirations, and regulatory audit states</p>
        </div>
        <button
          id="btn-replenish"
          onClick={() => {
            setSelectedProduct(inventory[0]?.productId || null);
            setIsReplenishOpen(true);
          }}
          className="bg-teal-600 text-white font-medium px-4 py-2.5 rounded-xl hover:bg-teal-700 transition flex items-center gap-2 shadow-md shadow-teal-600/10 cursor-pointer"
        >
          <Plus size={16} />
          <span>Request Replenishment</span>
        </button>
      </div>

      {/* Stats Summary Panel */}
      <div id="inventory-stats" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Archive size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Total Active Batches</p>
            <h4 className="text-lg font-bold text-slate-800 mt-0.5">{inventory.length} Batches</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <FileCheck2 size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">PDMA Safe Level Status</p>
            <h4 className="text-lg font-bold text-emerald-600 mt-0.5">100% Compliant</h4>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-wider">Allocated Since Launch</p>
            <h4 className="text-lg font-bold text-slate-800 mt-0.5">
              {inventory.reduce((acc, i) => acc + i.allocatedQty, 0)} Units
            </h4>
          </div>
        </div>
      </div>

      {/* Main Inventory Table List */}
      <div id="inventory-table-card" className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/40">
          <h3 className="font-bold text-slate-800 text-sm">Depot Allocation Status</h3>
          <div className="relative w-64 text-xs">
            <Search className="absolute left-3 top-3 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Filter by product name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-mono uppercase tracking-wider bg-slate-50/20 text-[10px]">
                <th className="p-5">Product Starter Kit</th>
                <th className="p-5">Available Depot Stock</th>
                <th className="p-5">Batch Number</th>
                <th className="p-5">Expiration Date</th>
                <th className="p-5">Audit Safety State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {filteredInventory.map((item) => {
                const isLow = item.availableQty < 15;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/40">
                    <td className="p-5 font-sans font-bold text-slate-800 text-sm">
                      {item.productName}
                    </td>
                    <td className="p-5 text-sm">
                      <span className={`font-bold ${isLow ? 'text-rose-500 font-extrabold' : 'text-slate-800'}`}>
                        {item.availableQty} units
                      </span>
                    </td>
                    <td className="p-5 text-slate-500">
                      {item.batchNumber}
                    </td>
                    <td className="p-5 text-slate-600 flex items-center gap-1.5 mt-1 border-0">
                      <CalendarDays size={14} className="text-slate-400" />
                      <span>{item.expiryDate}</span>
                    </td>
                    <td className="p-5 font-sans">
                      {isLow ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 font-bold px-2 py-0.5 rounded text-[10px] border border-rose-100">
                          <ShieldAlert size={12} />
                          <span>LOW STOCK ALERT</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded text-[10px] border border-emerald-100">
                          <span>COMPLIANT SAFE</span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Replenish Stock Request modal */}
      {isReplenishOpen && (
        <div id="replenish-stock-modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-xl border border-slate-100 overflow-hidden animate-scale-up">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-slate-800">Submit Stock Requisition</h3>
              <button
                onClick={() => setIsReplenishOpen(false)}
                className="text-slate-400 hover:text-slate-600 bg-white p-1.5 rounded-lg border border-slate-100 cursor-pointer"
              >
                <Plus size={16} className="rotate-45" />
              </button>
            </div>

            <form onSubmit={handleReplenishSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-mono">Select Product Starter Pack *</label>
                <select
                  required
                  value={selectedProduct || ''}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none"
                >
                  {inventory.map(i => (
                    <option key={i.productId} value={i.productId}>{i.productName}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 font-mono">Requisition Quantity *</label>
                <input
                  type="number"
                  required
                  min={10}
                  max={500}
                  value={replenishQty}
                  onChange={(e) => setReplenishQty(parseInt(e.target.value) || 50)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none"
                />
              </div>

              <p className="text-[10px] text-slate-400 leading-normal font-sans bg-slate-50 p-3 rounded-lg border border-slate-100">
                Replenishment orders are processed instantly through Region depot channels, adhering to regional samples drop audit requirements.
              </p>

              <div className="pt-4 flex gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReplenishOpen(false)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold text-xs py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2.5 rounded-xl transition cursor-pointer"
                >
                  File Depot Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
