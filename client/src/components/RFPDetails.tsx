import { useState } from 'react';
import { X, ExternalLink, Package, DollarSign, Zap } from 'lucide-react';
import { Search, Filter, Download, RefreshCw } from 'lucide-react';

interface RFP {
  id: number;
  title: string;
  source: string;
  website: string;
  submissionDate: string;
  match: number;
  status: 'pending' | 'processed' | 'submitted';
  specs: string[];
  products: Array<{
    sku: string;
    name: string;
    compatibility: number;
  }>;
  pricing: {
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    leadTime: string;
  };
}

export function RFPDetails() {
  const [selectedRFP, setSelectedRFP] = useState<RFP | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const rfps: RFP[] = [
    {
      id: 1,
      title: 'Industrial Pump System RFP',
      source: 'ThomasNet',
      website: 'thomasnet.com/rfq/12847',
      submissionDate: '2025-12-15',
      match: 94,
      status: 'submitted',
      specs: [
        'Flow Rate: 500 GPM minimum',
        'Maximum Pressure: 150 PSI',
        'Material: Stainless Steel 316',
        'Motor: 25 HP, 3-phase, 480V',
        'Certifications: API 610, ISO 9001',
      ],
      products: [
        { sku: 'SKU-P2847', name: 'Industrial Centrifugal Pump - Heavy Duty', compatibility: 94 },
        { sku: 'SKU-P2901', name: 'High-Flow Pump System with Controller', compatibility: 88 },
      ],
      pricing: {
        unitPrice: 2847,
        quantity: 500,
        totalPrice: 1423500,
        leadTime: '12-14 weeks',
      },
    },
    {
      id: 2,
      title: 'Hydraulic Valve Assembly',
      source: 'Alibaba',
      website: 'alibaba.com/inquiry/HVA-2025-001',
      submissionDate: '2025-12-12',
      match: 88,
      status: 'processed',
      specs: [
        'Valve Type: Directional Control',
        'Port Size: 3/4 inch NPT',
        'Operating Pressure: 3000 PSI',
        'Temperature Range: -20°F to 200°F',
        'Seal Material: Viton',
      ],
      products: [
        { sku: 'SKU-V1842', name: 'Hydraulic Directional Valve - 4-Way', compatibility: 88 },
        { sku: 'SKU-V1956', name: 'Heavy Duty Valve Assembly Kit', compatibility: 82 },
      ],
      pricing: {
        unitPrice: 485,
        quantity: 1000,
        totalPrice: 485000,
        leadTime: '8-10 weeks',
      },
    },
    {
      id: 3,
      title: 'Custom Bearing Manufacturing',
      source: 'Made-in-China',
      website: 'made-in-china.com/rfq/bearing-2025',
      submissionDate: '2025-12-18',
      match: 76,
      status: 'processed',
      specs: [
        'Bearing Type: Tapered Roller',
        'Bore Diameter: 100mm',
        'Outer Diameter: 180mm',
        'Width: 46mm',
        'Load Rating: 250kN radial',
      ],
      products: [
        { sku: 'SKU-B4521', name: 'Precision Tapered Roller Bearing', compatibility: 76 },
        { sku: 'SKU-B4638', name: 'Industrial Heavy-Load Bearing', compatibility: 71 },
      ],
      pricing: {
        unitPrice: 124,
        quantity: 2500,
        totalPrice: 310000,
        leadTime: '6-8 weeks',
      },
    },
    {
      id: 4,
      title: 'Precision Gearbox Components',
      source: 'ThomasNet',
      website: 'thomasnet.com/rfq/15293',
      submissionDate: '2025-12-20',
      match: 82,
      status: 'pending',
      specs: [
        'Gear Ratio: 10:1',
        'Input Speed: 1800 RPM',
        'Torque Capacity: 500 lb-ft',
        'Housing Material: Cast Iron',
        'Lubrication: Oil Bath',
      ],
      products: [
        { sku: 'SKU-G7821', name: 'Industrial Gearbox Assembly', compatibility: 82 },
        { sku: 'SKU-G7945', name: 'Precision Gear Reducer Unit', compatibility: 79 },
      ],
      pricing: {
        unitPrice: 1650,
        quantity: 300,
        totalPrice: 495000,
        leadTime: '10-12 weeks',
      },
    },
    {
      id: 5,
      title: 'Industrial Motor Housing',
      source: 'GlobalSpec',
      website: 'globalspec.com/rfq/motor-housing',
      submissionDate: '2025-12-10',
      match: 91,
      status: 'submitted',
      specs: [
        'Frame Size: NEMA 256T',
        'Material: Aluminum Alloy',
        'Finish: Powder Coated',
        'Mounting: Foot Mounted',
        'IP Rating: IP65',
      ],
      products: [
        { sku: 'SKU-M3472', name: 'NEMA Standard Motor Housing', compatibility: 91 },
        { sku: 'SKU-M3589', name: 'Heavy Duty Motor Enclosure', compatibility: 85 },
      ],
      pricing: {
        unitPrice: 385,
        quantity: 750,
        totalPrice: 288750,
        leadTime: '7-9 weeks',
      },
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-700';
      case 'processed':
        return 'bg-blue-100 text-blue-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredRfps = rfps
    .filter((rfp) => rfp.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((rfp) => (statusFilter === 'all' ? true : rfp.status === statusFilter));

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">RFP Details</h1>
        <p className="text-gray-600">
          Browse and manage all detected RFPs with AI-matched products and pricing
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search RFPs..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 border rounded-lg flex items-center gap-2 transition-all ${
                showFilters || statusFilter !== 'all'
                  ? 'border-teal-500 bg-teal-50 text-teal-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {statusFilter !== 'all' && (
                <span className="w-2 h-2 bg-teal-600 rounded-full"></span>
              )}
            </button>

            {showFilters && (
              <div className="absolute right-0 top-14 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10 animate-in slide-in-from-top-2 duration-200">
                <div className="p-4">
                  <h4 className="text-sm text-gray-900 mb-3">Status</h4>
                  <div className="space-y-2">
                    {['all', 'pending', 'processed', 'submitted'].map((status) => (
                      <label key={status} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          checked={statusFilter === status}
                          onChange={() => setStatusFilter(status)}
                          className="text-teal-600 focus:ring-teal-500"
                        />
                        <span className="text-sm text-gray-700 capitalize">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Reset</span>
          </button>

          <button className="px-4 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
            <Download className="w-5 h-5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Showing {filteredRfps.length} of {rfps.length} RFPs
        </p>
      </div>

      {/* RFP Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-600">RFP Title</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Source / Website</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Submission Date</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Match %</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRfps.map((rfp) => (
                <tr
                  key={rfp.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedRFP(rfp)}
                >
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{rfp.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-gray-900">{rfp.source}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                      {rfp.website}
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{rfp.submissionDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[100px] h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-blue-600"
                          style={{ width: `${rfp.match}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{rfp.match}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(rfp.status)}`}>
                      {rfp.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRFP(rfp);
                      }}
                      className="text-teal-600 hover:text-teal-700 text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RFP Detail Modal */}
      {selectedRFP && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-white">{selectedRFP.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(selectedRFP.status)} bg-opacity-90`}>
                      {selectedRFP.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white text-opacity-90">
                    <span>Source: {selectedRFP.source}</span>
                    <span>•</span>
                    <span>Match: {selectedRFP.match}%</span>
                    <span>•</span>
                    <span>Due: {selectedRFP.submissionDate}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRFP(null)}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
              {/* Extracted Specs */}
              <div className="mb-6">
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-teal-600" />
                  Extracted Specifications
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <ul className="space-y-2">
                    {selectedRFP.specs.map((spec, index) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-teal-600 mt-1">•</span>
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggested Products */}
              <div className="mb-6">
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Suggested Product SKUs
                </h3>
                <div className="space-y-3">
                  {selectedRFP.products.map((product, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:border-teal-200 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="text-sm text-gray-600 mb-1 block">{product.sku}</span>
                          <p className="text-gray-900">{product.name}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-600 block mb-1">Compatibility</span>
                          <span className="text-teal-600">{product.compatibility}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-blue-600"
                          style={{ width: `${product.compatibility}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6">
                <h3 className="text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Estimated Pricing
                </h3>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border border-green-100">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Unit Price</p>
                      <p className="text-gray-900 text-2xl">${selectedRFP.pricing.unitPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Quantity</p>
                      <p className="text-gray-900 text-2xl">{selectedRFP.pricing.quantity.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Price</p>
                      <p className="text-green-700 text-2xl">${selectedRFP.pricing.totalPrice.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Lead Time</p>
                      <p className="text-gray-900 text-2xl">{selectedRFP.pricing.leadTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <a
                href={`https://${selectedRFP.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 flex items-center gap-2 text-sm"
              >
                View Original RFP
                <ExternalLink className="w-4 h-4" />
              </a>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedRFP(null)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Generate Response
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}