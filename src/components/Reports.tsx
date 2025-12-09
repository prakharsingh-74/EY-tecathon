import { useState } from 'react';
import { Download, FileText, X, CheckCircle2, TrendingUp } from 'lucide-react';

interface Report {
  id: number;
  rfpName: string;
  submissionDate: string;
  match: number;
  status: 'completed' | 'pending';
  summary: {
    clientName: string;
    totalValue: number;
    products: string[];
    deliveryTimeline: string;
    keyHighlights: string[];
  };
}

export function Reports() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const reports: Report[] = [
    {
      id: 1,
      rfpName: 'Industrial Pump System RFP Response',
      submissionDate: '2025-12-08',
      match: 94,
      status: 'completed',
      summary: {
        clientName: 'ThomasNet Buyer #12847',
        totalValue: 1423500,
        products: ['SKU-P2847: Industrial Centrifugal Pump', 'SKU-P2901: High-Flow Controller'],
        deliveryTimeline: '12-14 weeks from PO receipt',
        keyHighlights: [
          '94% specification match with existing product line',
          'Full API 610 and ISO 9001 compliance included',
          'Volume discount applied: 15% off for 500+ units',
          'In-house manufacturing eliminates supply chain delays',
          'Technical support and warranty coverage included',
        ],
      },
    },
    {
      id: 2,
      rfpName: 'Hydraulic Valve Assembly RFP Response',
      submissionDate: '2025-12-07',
      match: 88,
      status: 'completed',
      summary: {
        clientName: 'Alibaba Enterprise Buyer',
        totalValue: 485000,
        products: ['SKU-V1842: 4-Way Directional Valve', 'SKU-V1956: Valve Assembly Kit'],
        deliveryTimeline: '8-10 weeks from PO receipt',
        keyHighlights: [
          '88% compatibility with requested specifications',
          'Viton seals included for high-temperature applications',
          'Certified for 3000 PSI operating pressure',
          'Bulk pricing available for 1000+ unit orders',
          'Quality inspection reports provided with shipment',
        ],
      },
    },
    {
      id: 3,
      rfpName: 'Custom Bearing Manufacturing Response',
      submissionDate: '2025-12-07',
      match: 76,
      status: 'completed',
      summary: {
        clientName: 'Made-in-China Platform Request',
        totalValue: 310000,
        products: ['SKU-B4521: Precision Tapered Roller Bearing', 'SKU-B4638: Heavy-Load Bearing'],
        deliveryTimeline: '6-8 weeks from PO receipt',
        keyHighlights: [
          'Custom bearing dimensions available upon request',
          'Load rating exceeds 250kN radial capacity',
          'Precision manufacturing tolerances: ±0.001mm',
          'Extended warranty program for industrial applications',
          'Fast-track production available for urgent orders',
        ],
      },
    },
    {
      id: 4,
      rfpName: 'Industrial Motor Housing Response',
      submissionDate: '2025-12-06',
      match: 91,
      status: 'completed',
      summary: {
        clientName: 'GlobalSpec Enterprise Client',
        totalValue: 288750,
        products: ['SKU-M3472: NEMA Standard Housing', 'SKU-M3589: Heavy Duty Enclosure'],
        deliveryTimeline: '7-9 weeks from PO receipt',
        keyHighlights: [
          '91% match with NEMA 256T specifications',
          'IP65 rated for outdoor industrial use',
          'Powder-coated finish in custom colors available',
          'Aluminum alloy construction for weight reduction',
          'Foot mounted configuration with standard bolt pattern',
        ],
      },
    },
    {
      id: 5,
      rfpName: 'Precision Gearbox Components Response',
      submissionDate: '2025-12-05',
      match: 82,
      status: 'pending',
      summary: {
        clientName: 'ThomasNet Buyer #15293',
        totalValue: 495000,
        products: ['SKU-G7821: Industrial Gearbox Assembly', 'SKU-G7945: Precision Gear Reducer'],
        deliveryTimeline: '10-12 weeks from PO receipt',
        keyHighlights: [
          '10:1 gear ratio with precision machining',
          'Torque capacity: 500 lb-ft continuous operation',
          'Cast iron housing for durability',
          'Oil bath lubrication system included',
          'Performance testing certificates provided',
        ],
      },
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">
          Download and review AI-generated RFP response documents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-600">Total Reports</span>
          </div>
          <p className="text-gray-900 text-3xl">{reports.length}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-600">Avg Match Rate</span>
          </div>
          <p className="text-gray-900 text-3xl">
            {Math.round(reports.reduce((acc, r) => acc + r.match, 0) / reports.length)}%
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-gray-600">Total Value</span>
          </div>
          <p className="text-gray-900 text-3xl">
            ${Math.round(reports.reduce((acc, r) => acc + r.summary.totalValue, 0) / 1000000)}M
          </p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm text-gray-600">RFP Name</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Submission Date</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Match %</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Status</th>
                <th className="px-6 py-4 text-left text-sm text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.map((report) => (
                <tr
                  key={report.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-100 to-blue-100 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-teal-600" />
                      </div>
                      <span className="text-gray-900">{report.rfpName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{report.submissionDate}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[100px] h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-blue-600"
                          style={{ width: `${report.match}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{report.match}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-teal-600 hover:text-teal-700 text-sm"
                      >
                        View Summary
                      </button>
                      <button className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Summary Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className="w-6 h-6 text-white" />
                    <h2 className="text-white">{selectedReport.rfpName}</h2>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-white text-opacity-90">
                    <span>Client: {selectedReport.summary.clientName}</span>
                    <span>•</span>
                    <span>Date: {selectedReport.submissionDate}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-200px)]">
              {/* Overview */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-gray-600 mb-1">Total Contract Value</p>
                  <p className="text-green-700 text-2xl">${selectedReport.summary.totalValue.toLocaleString()}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-sm text-gray-600 mb-1">Delivery Timeline</p>
                  <p className="text-blue-700 text-2xl">{selectedReport.summary.deliveryTimeline.split(' ')[0]}</p>
                </div>
              </div>

              {/* Matched Products */}
              <div className="mb-6">
                <h3 className="text-gray-900 mb-3">Matched Products</h3>
                <div className="space-y-2">
                  {selectedReport.summary.products.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-gray-900">{product}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Highlights */}
              <div className="mb-6">
                <h3 className="text-gray-900 mb-3">Key Highlights</h3>
                <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-lg p-4 border border-teal-100">
                  <ul className="space-y-2">
                    {selectedReport.summary.keyHighlights.map((highlight, index) => (
                      <li key={index} className="flex items-start gap-3 text-gray-700">
                        <span className="text-teal-600 mt-1">✓</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Match Score */}
              <div>
                <h3 className="text-gray-900 mb-3">Specification Match Score</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Overall Compatibility</span>
                    <span className="text-gray-900">{selectedReport.match}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-blue-600"
                      style={{ width: `${selectedReport.match}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
