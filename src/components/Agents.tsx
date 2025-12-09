import { useState } from 'react';
import { Bot, X, CheckCircle2, Clock } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  status: 'active' | 'idle';
  progress: number;
  description: string;
  color: string;
  actions: string[];
}

export function Agents() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const agents: Agent[] = [
    {
      id: 'sales',
      name: 'Sales Agent',
      status: 'active',
      progress: 75,
      description: 'Monitors B2B platforms and detects new RFP opportunities',
      color: 'from-teal-500 to-teal-600',
      actions: [
        'Scanned ThomasNet for new RFPs (2 found)',
        'Detected Industrial Pump System RFP',
        'Extracted requirements from Hydraulic Valve RFP',
        'Forwarded 3 RFPs to Technical Agent',
        'Updated opportunity database',
      ],
    },
    {
      id: 'technical',
      name: 'Technical Agent',
      status: 'active',
      progress: 60,
      description: 'Analyzes technical specifications and matches them with product catalog',
      color: 'from-blue-500 to-blue-600',
      actions: [
        'Analyzed specs for Pump System RFP',
        'Matched 94% compatibility with SKU-P2847',
        'Generated technical compliance report',
        'Validated material certifications',
        'Sent matched products to Pricing Agent',
      ],
    },
    {
      id: 'pricing',
      name: 'Pricing Agent',
      status: 'active',
      progress: 85,
      description: 'Calculates competitive pricing based on materials, labor, and market data',
      color: 'from-purple-500 to-purple-600',
      actions: [
        'Retrieved material costs from ERP system',
        'Calculated manufacturing time estimate',
        'Applied volume discount (15% for 500+ units)',
        'Generated competitive price: $2,847 per unit',
        'Forwarded pricing to Report Agent',
      ],
    },
    {
      id: 'report',
      name: 'Report Agent',
      status: 'idle',
      progress: 100,
      description: 'Generates professional PDF proposals ready for submission',
      color: 'from-emerald-500 to-emerald-600',
      actions: [
        'Compiled technical specifications',
        'Generated pricing breakdown table',
        'Created delivery timeline chart',
        'Formatted RFP response document',
        'Exported PDF: RFP_IndustrialPump_Response.pdf',
      ],
    },
    {
      id: 'master',
      name: 'Master Agent',
      status: 'active',
      progress: 40,
      description: 'Orchestrates all agents and manages the end-to-end workflow',
      color: 'from-orange-500 to-orange-600',
      actions: [
        'Initiated daily RFP scan workflow',
        'Coordinated 5 concurrent RFP processes',
        'Validated 3 completed responses',
        'Scheduled submission for 2 RFPs',
        'Generated performance metrics report',
      ],
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">AI Agents</h1>
        <p className="text-gray-600">
          Monitor and manage the autonomous agents powering your RFP automation
        </p>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-teal-200 hover:shadow-xl transition-all duration-300 group cursor-pointer"
          >
            {/* Agent Header */}
            <div className={`bg-gradient-to-br ${agent.color} p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <span
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                    agent.status === 'active'
                      ? 'bg-green-500 bg-opacity-20 text-white'
                      : 'bg-gray-500 bg-opacity-20 text-white'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-300 animate-pulse' : 'bg-gray-300'}`}></div>
                  {agent.status}
                </span>
              </div>
              <h3 className="text-white mb-2">{agent.name}</h3>
              <p className="text-sm text-white text-opacity-90">{agent.description}</p>
            </div>

            {/* Progress Section */}
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Task Progress</span>
                  <span className="text-sm text-gray-900">{agent.progress}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${agent.color} transition-all duration-500`}
                    style={{ width: `${agent.progress}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => setSelectedAgent(agent)}
                className="w-full py-2 px-4 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-colors duration-200 group-hover:bg-teal-50 group-hover:text-teal-700"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Modal Header */}
            <div className={`bg-gradient-to-br ${selectedAgent.color} p-6`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white mb-1">{selectedAgent.name}</h2>
                    <p className="text-sm text-white text-opacity-90">{selectedAgent.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-96">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-gray-900">Recent Actions</h3>
                  <span
                    className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                      selectedAgent.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${selectedAgent.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
                    {selectedAgent.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">Last 5 executed actions by this agent</p>
              </div>

              <div className="space-y-3">
                {selectedAgent.actions.map((action, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="mt-0.5">
                      {index === 0 && selectedAgent.status === 'active' ? (
                        <Clock className="w-5 h-5 text-blue-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">{action}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {index === 0 ? 'In progress' : `Completed ${index + 1}h ago`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all">
                View Full Logs
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
