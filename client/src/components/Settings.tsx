import { useState } from 'react';
import { Settings as SettingsIcon, Globe, Power, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { RFPSourceConfig } from './RFPSourceConfig';

export function Settings() {
  const [autoScan, setAutoScan] = useState(true);
  const [rfpSources, setRfpSources] = useState([
    'thomasnet.com',
    'alibaba.com',
    'made-in-china.com',
    'globalspec.com',
  ]);
  const [newSource, setNewSource] = useState('');
  const [scanTriggered, setScanTriggered] = useState(false);

  const handleAddSource = () => {
    if (newSource.trim() && !rfpSources.includes(newSource.trim())) {
      setRfpSources([...rfpSources, newSource.trim()]);
      setNewSource('');
    }
  };

  const handleRemoveSource = (source: string) => {
    setRfpSources(rfpSources.filter((s) => s !== source));
  };

  const handleManualScan = () => {
    setScanTriggered(true);
    setTimeout(() => setScanTriggered(false), 3000);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-gray-900 mb-2">Settings & Configuration</h1>
        <p className="text-gray-600">
          Manage your RFP automation preferences and source configurations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* RFP Source Configuration - New Component */}
          <RFPSourceConfig />

          {/* Auto-Scan Toggle */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center">
                  <Power className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900">Automatic RFP Scanning</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Enable continuous monitoring of configured sources
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAutoScan(!autoScan)}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 ${
                  autoScan ? 'bg-gradient-to-r from-teal-500 to-blue-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                    autoScan ? 'translate-x-7' : 'translate-x-1'
                  }`}
                ></div>
              </button>
            </div>
            {autoScan && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">
                  Auto-scan is active. System will check sources every 6 hours.
                </span>
              </div>
            )}
          </div>

          {/* Manual Scan Trigger */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-gray-900">Manual Scan Trigger</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Immediately scan all configured sources for new RFPs
                </p>
              </div>
            </div>

            {scanTriggered && (
              <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center gap-2 animate-in slide-in-from-top-2 duration-300">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-blue-700">
                  Scanning configured sources... This may take a few moments.
                </span>
              </div>
            )}

            <button
              onClick={handleManualScan}
              disabled={scanTriggered}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5" />
              {scanTriggered ? 'Scanning...' : 'Trigger Manual Scan'}
            </button>
          </div>
        </div>

        {/* System Info Sidebar */}
        <div className="space-y-6">
          {/* System Status */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-gray-900">System Status</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Engine</span>
                <span className="flex items-center gap-2 text-sm text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">n8n Backend</span>
                <span className="flex items-center gap-2 text-sm text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="flex items-center gap-2 text-sm text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Synced
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Gateway</span>
                <span className="flex items-center gap-2 text-sm text-green-700">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Healthy
                </span>
              </div>
            </div>
          </div>

          {/* Configuration Info */}
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-100 p-6">
            <h3 className="text-gray-900 mb-3">Current Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Active Sources</span>
                <span className="text-gray-900">{rfpSources.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Scan Interval</span>
                <span className="text-gray-900">6 hours</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Auto Response</span>
                <span className="text-gray-900">Disabled</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Match Threshold</span>
                <span className="text-gray-900">70%</span>
              </div>
            </div>
          </div>

          {/* Alert */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  Changes to automation settings will take effect on the next scan cycle.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}