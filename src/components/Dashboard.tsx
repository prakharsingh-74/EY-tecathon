import { Activity, TrendingUp, Target, Award, Sparkles, Zap, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const metrics = [
    {
      label: 'Total RFPs Detected',
      value: '47',
      change: '+12%',
      icon: Activity,
      color: 'from-teal-500 to-teal-600',
    },
    {
      label: 'RFPs in Progress',
      value: '8',
      change: '3 active',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Responses Generated',
      value: '32',
      change: '+8 this week',
      icon: Award,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Avg Response Time',
      value: '2.4h',
      change: '45% faster',
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      title: 'Industrial Pump System RFP',
      source: 'ThomasNet',
      date: '2025-12-08',
      status: 'submitted',
      match: 94,
    },
    {
      id: 2,
      title: 'Hydraulic Valve Assembly',
      source: 'Alibaba',
      date: '2025-12-07',
      status: 'priced',
      match: 88,
    },
    {
      id: 3,
      title: 'Custom Bearing Manufacturing',
      source: 'Made-in-China',
      date: '2025-12-07',
      status: 'matched',
      match: 76,
    },
    {
      id: 4,
      title: 'Precision Gearbox Components',
      source: 'ThomasNet',
      date: '2025-12-06',
      status: 'detected',
      match: 82,
    },
    {
      id: 5,
      title: 'Industrial Motor Housing',
      source: 'GlobalSpec',
      date: '2025-12-06',
      status: 'submitted',
      match: 91,
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-700';
      case 'priced':
        return 'bg-blue-100 text-blue-700';
      case 'matched':
        return 'bg-purple-100 text-purple-700';
      case 'detected':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">AI-Powered RFP Automation System</h1>
        <p className="text-gray-600">
          Real-time monitoring and management of your automated RFP response workflow
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-teal-200 hover:shadow-lg transition-all duration-300 cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${metric.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{metric.label}</p>
              <div className="flex items-end justify-between">
                <span className="text-gray-900 text-3xl">{metric.value}</span>
                <span className="text-sm text-teal-600">{metric.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => onNavigate('agents')}
          className="bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Manage</p>
              <p className="text-xl">AI Agents</p>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('rfps')}
          className="bg-white border-2 border-teal-500 text-teal-700 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-75 mb-1">View</p>
              <p className="text-xl">RFP Details</p>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        <button
          onClick={() => onNavigate('reports')}
          className="bg-white border-2 border-blue-500 text-blue-700 rounded-xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-75 mb-1">Download</p>
              <p className="text-xl">Reports</p>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-gray-900">Recent RFP Activity</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm text-gray-600">RFP Title</th>
                <th className="px-6 py-3 text-left text-sm text-gray-600">Source</th>
                <th className="px-6 py-3 text-left text-sm text-gray-600">Date</th>
                <th className="px-6 py-3 text-left text-sm text-gray-600">Match %</th>
                <th className="px-6 py-3 text-left text-sm text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentActivity.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => onNavigate('rfps')}
                >
                  <td className="px-6 py-4 text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 text-gray-600">{item.source}</td>
                  <td className="px-6 py-4 text-gray-600">{item.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 max-w-[100px] h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-blue-600"
                          style={{ width: `${item.match}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900">{item.match}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}