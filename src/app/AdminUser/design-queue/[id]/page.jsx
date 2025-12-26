import Sidebar from '@/components/Sidebar';

const MOCK_ORDERS = [
  {
    id: 'SF1005',
    status: 'Inquiry',
    createdAt: 'Nov 22, 7:36 AM',
    customer: 'Tyrell Corporation',
    address: 'Nexus Building, Los Angeles',
    products: 'Voight-Kampff machine empathy sensors',
    customDetails: 'Voight-Kampff machine empathy sensors',
    units: 20,
    material: 'Bi-metallic film',
  },
  {
    id: 'SF1004',
    status: 'Design',
    createdAt: 'Nov 20, 3:12 PM',
    customer: 'Cyberdyne Systems',
    address: 'Silicon Valley, CA',
    products: 'T-800 endoskeleton fingers (prototype)',
    customDetails: 'High-tolerance endoskeleton components for prototype line.',
    units: 50,
    material: 'Titanium alloy',
  },
  {
    id: 'SF1003',
    status: 'Machining',
    createdAt: 'Nov 16, 10:10 AM',
    customer: 'Wayne Enterprises',
    address: 'Gotham City',
    products: 'Graphene-composite body armor plates',
    customDetails: 'High-strength lightweight armor panels for tactical suits.',
    units: 30,
    material: 'Graphene composite',
  },
  {
    id: 'SF1002',
    status: 'Inspection',
    createdAt: 'Nov 14, 4:45 PM',
    customer: 'Stark Industries',
    address: 'Malibu, CA',
    products: 'Custom arc reactor casings',
    customDetails: 'Precision casings for next-gen arc reactor prototypes.',
    units: 12,
    material: 'Gold-titanium alloy',
  },
];

const STATUS_STEPS = ['Inquiry', 'Design', 'Production', 'Machining', 'Inspection', 'Completed'];

export default function DesignQueueDetailsPage({ params }) {
  const { id } = React.use(params);

  // For now, use mock data if available; otherwise fall back to a generic object
  const found = MOCK_ORDERS.find(o => o.id === id);
  const order =
    found || {
      id,
      status: 'Inquiry',
      createdAt: '',
      customer: 'Unknown Customer',
      address: '—',
      products: '—',
      customDetails: 'No details available yet. This will be populated from the API.',
      units: '-',
      material: '-',
    };

  const currentIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-6 space-y-6">
        {/* Top progress header */}
        <section className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Order #{order.id}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track the progress of the order from inquiry to completion.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4 overflow-x-auto">
            {STATUS_STEPS.map((step, index) => {
              const isActive = index === currentIndex;
              const isCompleted = index < currentIndex;
              return (
                <div key={step} className="flex items-center gap-2">
                  <div
                    className={`flex items-center justify-center h-8 w-8 rounded-full border-2 text-xs font-medium
                      ${isActive ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                      ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-gray-100 border-gray-300 text-gray-500' : ''}
                    `}
                  >
                    {index + 1}
                  </div>
                  <div className="text-xs font-medium text-gray-700 whitespace-nowrap">{step}</div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div className="w-10 h-px bg-gray-300 mx-1" />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Main two-column content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: project details and status sections */}
          <div className="space-y-6 lg:col-span-2">
            {/* Project Details */}
            <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>
                  <p className="text-sm text-gray-500">View and edit the project specifications.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Products</h3>
                  <div className="mt-1 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                    {order.products}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Custom Product Details</h3>
                  <p className="mt-1 text-sm text-gray-800">
                    {order.customDetails}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Units</h3>
                    <p className="mt-1 text-sm text-gray-800">{order.units}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Material</h3>
                    <p className="mt-1 text-sm text-gray-800">{order.material}</p>
                  </div>
                </div>

                {/* Customer */}
                <div className="pt-4 border-t border-gray-100 space-y-2">
                  <div>
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</h3>
                    <p className="mt-1 text-sm text-gray-800">{order.customer}</p>
                  </div>

                  {/* Address */}
                  <div className="mt-2">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide flex items-center gap-1">
                      <span>Address</span>
                    </h3>
                    <p className="mt-1 text-sm text-gray-800">{order.address}</p>
                    <div className="mt-2 flex gap-2">
                      <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-700 bg-gray-50">
                        Billing
                      </span>
                      <span className="inline-flex items-center rounded-full border border-gray-300 px-2.5 py-0.5 text-xs font-medium text-gray-700 bg-gray-50">
                        Shipping
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Update Order Status */}
            <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Update Order Status</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Status</label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    defaultValue=""
                  >
                    <option value="" disabled>Select next status...</option>
                    {STATUS_STEPS.map(step => (
                      <option key={step} value={step}>{step}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Update Notes</label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                    placeholder="Add comments about the status change..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attach Documents / Designs</label>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between border border-dashed border-gray-300 rounded-md px-3 py-2 text-sm text-gray-600 hover:border-indigo-400 hover:text-indigo-600"
                  >
                    <span>Add Files</span>
                    <span className="text-xs text-gray-400">PDF, DOCX, JPG, DXF, etc. Max 25MB per file.</span>
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </section>

            {/* Status History */}
            <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">Status History</h2>
              <p className="text-sm text-gray-500">No status updates have been recorded for this order yet.</p>
            </section>
          </div>

          {/* Right: Reports column */}
          <aside className="space-y-6">
            <section className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">Reports</h2>
              <p className="text-sm text-gray-500">Generate and download reports.</p>

              <div className="mt-2 space-y-2">
                {['Notes Summary', 'Design Report', 'Production Report', 'Machinists Report', 'Inspection Report'].map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm
                      ${index === 0 ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span>{label}</span>
                    <span className="text-xs">⭳</span>
                  </button>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
