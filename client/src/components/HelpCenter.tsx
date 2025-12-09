import { useState } from 'react';
import { HelpCircle, Search, Book, Video, MessageCircle, FileText, ChevronRight } from 'lucide-react';

const helpArticles = [
  {
    category: 'Getting Started',
    icon: Book,
    articles: [
      'Quick Start Guide',
      'Understanding AI Agents',
      'Setting Up Your First RFP',
      'Dashboard Overview',
    ],
  },
  {
    category: 'AI Agents',
    icon: Video,
    articles: [
      'How Agents Work Together',
      'Customizing Agent Behavior',
      'Agent Performance Metrics',
      'Troubleshooting Agents',
    ],
  },
  {
    category: 'RFP Management',
    icon: FileText,
    articles: [
      'Creating RFP Templates',
      'Managing Multiple RFPs',
      'Collaboration Features',
      'Export & Reporting',
    ],
  },
  {
    category: 'Support',
    icon: MessageCircle,
    articles: [
      'Contact Support Team',
      'Feature Requests',
      'Report a Bug',
      'Community Forum',
    ],
  },
];

export function HelpCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="relative">
      {/* Help Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
        title="Help Center"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {/* Help Panel */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 animate-in slide-in-from-top-4 duration-200">
            {/* Header */}
            <div className="p-4 bg-gradient-to-br from-teal-500 to-blue-600 text-white rounded-t-xl">
              <h3 className="mb-2">Help Center</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white text-opacity-70" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for help..."
                  className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:bg-opacity-30"
                />
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto p-4">
              <div className="space-y-4">
                {helpArticles.map((section, index) => {
                  const Icon = section.icon;
                  return (
                    <div key={index}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-4 h-4 text-teal-600" />
                        <h4 className="text-sm text-gray-900">{section.category}</h4>
                      </div>
                      <div className="space-y-1">
                        {section.articles.map((article, articleIndex) => (
                          <button
                            key={articleIndex}
                            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-all group"
                          >
                            <span>{article}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 space-y-2">
              <button className="w-full py-2 px-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all text-sm">
                Contact Support
              </button>
              <button className="w-full py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                View Documentation
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
