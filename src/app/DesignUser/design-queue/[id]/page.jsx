'use client';

import React, { useMemo, useRef, useState, use } from 'react';
import Sidebar from '@/components/Sidebar';

const STEPS = ['Inquiry', 'Design', 'Production', 'Machining', 'Inspection', 'Completed'];

const MOCK_ORDERS = {
  SF1005: {
    id: 'SF1005',
    customer: 'Tyrell Corporation',
    products: 'Voight-Kampff machine empathy sensors',
    status: 'Inquiry',
    date: 'Nov 20, 2025',
  },
};

const OrderDetailsPanel = ({ isOpen, onClose, orderId }) => {
  const base = MOCK_ORDERS[orderId] || {
    id: orderId || 'SF1005',
    customer: 'Unknown Customer',
    products: '—',
    status: 'Inquiry',
    date: '—',
  };

  const [currentStatus, setCurrentStatus] = useState(base.status);
  const [notes, setNotes] = useState('');
  const [fileName, setFileName] = useState('');
  const [history, setHistory] = useState([]);
  const fileRef = useRef();

  const order = useMemo(() => ({ ...base, status: currentStatus }), [base, currentStatus]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    setFileName(f ? f.name : '');
  };

  const handleUpdate = () => {
    if (!currentStatus) return;
    const prev = history.length ? history[history.length - 1].to : base.status;
    const entry = {
      id: `${Date.now()}`,
      user: 'Design User',
      from: prev,
      to: currentStatus,
      notes: notes?.trim(),
      attachment: fileName,
      at: new Date(),
    };
    setHistory((h) => [...h, entry]);
    setNotes('');
    setFileName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Fixed panel on right side */}
      <div className="fixed right-0 top-0 h-full w-full md:w-96 lg:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Panel header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Order #{order.id}</h2>
            <p className="text-sm text-gray-500 mt-1">{order.customer}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Panel content */}
        <div className="p-6 space-y-6">
          {/* Progress indicator */}
          <section className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Progress</h3>
            <div className="flex items-center justify-between overflow-x-auto">
              {STEPS.map((step, i) => {
                const activeIndex = STEPS.indexOf(currentStatus);
                const completed = i < activeIndex;
                const active = i === activeIndex;
                return (
                  <div key={step} className="flex-1 min-w-[60px] flex flex-col items-center">
                    <div className={`flex items-center justify-center h-6 w-6 rounded-full border-2 text-xs ${completed ? 'bg-blue-600 border-blue-600 text-white' : active ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}`}>
                      {completed ? '✓' : i + 1}
                    </div>
                    <div className={`text-xs mt-1 text-center ${active ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>{step}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Customer Information */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Customer</span>
                <span className="text-sm font-medium text-gray-900">{order.customer}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Products</span>
                <span className="text-sm font-medium text-gray-900">{order.products}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Units</span>
                <span className="text-sm font-medium text-gray-900">20</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Material</span>
                <span className="text-sm font-medium text-gray-900">Bi-metallic film</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-500">Address</span>
                <span className="text-sm font-medium text-gray-900">Nexus Building, Los Angeles</span>
              </div>
            </div>
          </section>

          {/* Status Update */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Status</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">New Status</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={currentStatus}
                  onChange={(e) => setCurrentStatus(e.target.value)}
                >
                  <option value="">Select status...</option>
                  {STEPS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Attachment</label>
                <div className="relative">
                  <input 
                    ref={fileRef}
                    onChange={onFileChange} 
                    type="file" 
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Comments</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add comments about the status change..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  rows={3}
                />
              </div>
              
              <button 
                onClick={handleUpdate} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Update Status
              </button>
            </div>
          </section>

          {/* Reports */}
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Reports</h3>
            <div className="space-y-2">
              {['Notes Summary', 'Design Report', 'Production Report', 'Machining Report', 'Inspection Report'].map((report, i) => (
                <div key={report} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                  <span className="text-sm text-gray-700">{report}</span>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Status History */}
          {history.length > 0 && (
            <section>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Updates</h3>
              <div className="space-y-3">
                {history.slice(-3).map((h) => (
                  <div key={h.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-900">{h.user}</span>
                      <span className="text-xs text-gray-500">{h.at.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{h.from}</span>
                      <span className="text-gray-400">→</span>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">{h.to}</span>
                    </div>
                    {h.notes && (
                      <p className="text-xs text-gray-600">{h.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default function OrderDetailsPage({ params }) {
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const { id } = React.use(params);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Design Queue</h1>
            <p className="text-gray-600 mt-1">Manage design tasks and approvals</p>
          </div>
          
          {/* Main content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Design Orders</h2>
                <div className="text-center py-12 text-gray-500">
                  <p>Select a design order to view details</p>
                  <button 
                    onClick={() => setIsPanelOpen(true)}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    View Order Details
                  </button>
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-gray-900">Upload Design</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-gray-900">View Templates</span>
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                    <span className="text-sm font-medium text-gray-900">Design Guidelines</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <OrderDetailsPanel 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
        orderId={id}
      />
    </div>
  );
}

 
