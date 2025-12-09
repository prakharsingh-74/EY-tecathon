import { useState } from 'react';
import { Link2, Settings as SettingsIcon, Bell, Plus, X, Globe, Mail, Slack, Webhook } from 'lucide-react';

type Tab = 'sources' | 'autoscan' | 'webhooks';

export function RFPSourceConfig() {
  const [activeTab, setActiveTab] = useState<Tab>('sources');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceUrls, setSourceUrls] = useState<Array<{ id: string; url: string; status: string; lastChecked?: string }>>([
    { id: '1', url: 'https://thomasnet.com/rfps', status: 'Active', lastChecked: '2 hours ago' },
    { id: '2', url: 'https://globalspec.com/opportunities', status: 'Active', lastChecked: '5 hours ago' },
    { id: '3', url: 'https://made-in-china.com/procurement', status: 'Active', lastChecked: '1 hour ago' },
  ]);

  const [webhooks, setWebhooks] = useState<Array<{ id: string; name: string; url: string; events: string[]; status: string }>>([
    { id: '1', name: 'Slack Notifications', url: 'https://hooks.slack.com/services/XXX', events: ['New RFP', 'Match Found'], status: 'Active' },
    { id: '2', name: 'Email Alerts', url: 'https://api.sendgrid.com/v3/mail', events: ['New RFP', 'Response Ready'], status: 'Active' },
  ]);

  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  const [scanInterval, setScanInterval] = useState('6');

  const handleAddSource = () => {
    if (sourceUrl.trim()) {
      setSourceUrls([...sourceUrls, { 
        id: Date.now().toString(), 
        url: sourceUrl.trim(), 
        status: 'Pending',
        lastChecked: 'Never'
      }]);
      setSourceUrl('');
    }
  };

  const handleRemoveSource = (id: string) => {
    setSourceUrls(sourceUrls.filter(s => s.id !== id));
  };

  const handleRemoveWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex items-center gap-2 p-2 border-b border-gray-200 bg-gray-50">
        <button
          onClick={() => setActiveTab('sources')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
            activeTab === 'sources'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Link2 className="w-4 h-4" />
          RFP Sources
        </button>
        <button
          onClick={() => setActiveTab('autoscan')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
            activeTab === 'autoscan'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          Auto-Scan
        </button>
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
            activeTab === 'webhooks'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
          }`}
        >
          <Bell className="w-4 h-4" />
          Webhooks
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* RFP Sources Tab */}
        {activeTab === 'sources' && (
          <div>
            <h3 className="text-gray-900 mb-2">RFP Source URLs</h3>
            <p className="text-gray-600 mb-6">
              Add URLs where RFPs are typically published for automatic detection
            </p>

            {/* Add URL Input */}
            <div className="flex gap-3 mb-6">
              <input
                type="text"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSource()}
                placeholder="https://example.com/rfps"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              <button
                onClick={handleAddSource}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-lg text-white rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                Add
              </button>
            </div>

            {/* URL List */}
            {sourceUrls.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No source URLs configured yet
              </div>
            ) : (
              <div className="space-y-3">
                {sourceUrls.map((source) => (
                  <div
                    key={source.id}
                    className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-gray-900">{source.url}</p>
                        <p className="text-sm text-gray-500">
                          Last checked: {source.lastChecked}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs ${
                        source.status === 'Active' 
                          ? 'bg-green-50 text-green-700 border border-green-200'
                          : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                      }`}>
                        {source.status}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveSource(source.id)}
                      className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Auto-Scan Tab */}
        {activeTab === 'autoscan' && (
          <div>
            <h3 className="text-gray-900 mb-2">Auto-Scan Configuration</h3>
            <p className="text-gray-600 mb-6">
              Configure automatic scanning intervals and preferences
            </p>

            <div className="space-y-4">
              {/* Enable Auto-Scan */}
              <div className="p-5 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-gray-900">Enable Auto-Scan</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Automatically monitor configured sources for new RFPs
                    </p>
                  </div>
                  <button
                    onClick={() => setAutoScanEnabled(!autoScanEnabled)}
                    className={`relative w-14 h-8 rounded-full transition-all ${
                      autoScanEnabled ? 'bg-gradient-to-r from-teal-500 to-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                        autoScanEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    ></div>
                  </button>
                </div>
              </div>

              {/* Scan Interval */}
              <div className="p-5 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-gray-900 mb-3">Scan Interval</h4>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={scanInterval}
                    onChange={(e) => setScanInterval(e.target.value)}
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    min="1"
                    max="24"
                  />
                  <span className="text-gray-600">hours</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  System will check all sources every {scanInterval} hours
                </p>
              </div>

              {/* Notification Preferences */}
              <div className="p-5 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="text-gray-900 mb-3">Notification Preferences</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Notify on new RFP found</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Notify on high-match opportunities</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500" />
                    <span className="text-gray-700 group-hover:text-gray-900 transition-colors">Daily summary emails</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Webhooks Tab */}
        {activeTab === 'webhooks' && (
          <div>
            <h3 className="text-gray-900 mb-2">Webhook Configuration</h3>
            <p className="text-gray-600 mb-6">
              Configure webhooks to receive real-time notifications about RFP events
            </p>

            {/* Add Webhook Button */}
            <button className="mb-6 flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-500 to-blue-600 hover:shadow-lg text-white rounded-lg transition-all">
              <Plus className="w-4 h-4" />
              Add Webhook
            </button>

            {/* Webhook List */}
            {webhooks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No webhooks configured yet
              </div>
            ) : (
              <div className="space-y-3">
                {webhooks.map((webhook) => (
                  <div
                    key={webhook.id}
                    className="p-5 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
                          {webhook.name.includes('Slack') ? (
                            <Slack className="w-5 h-5 text-white" />
                          ) : webhook.name.includes('Email') ? (
                            <Mail className="w-5 h-5 text-white" />
                          ) : (
                            <Webhook className="w-5 h-5 text-white" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-gray-900">{webhook.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{webhook.url}</p>
                          <div className="flex gap-2 mt-2">
                            {webhook.events.map((event, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200"
                              >
                                {event}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
                          {webhook.status}
                        </span>
                        <button
                          onClick={() => handleRemoveWebhook(webhook.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}