import { Bot } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center mx-auto shadow-2xl animate-pulse">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 mx-auto animate-ping opacity-20"></div>
        </div>
        <h2 className="text-gray-900 mb-2">Initializing AI Agents</h2>
        <p className="text-gray-600">Setting up your RFP automation dashboard...</p>
        <div className="mt-6 flex justify-center gap-2">
          <div className="w-2 h-2 bg-teal-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
