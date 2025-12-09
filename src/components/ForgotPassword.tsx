import { useState } from 'react';
import { X, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';

interface ForgotPasswordProps {
  onClose: () => void;
}

export function ForgotPassword({ onClose }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate sending reset email
    setTimeout(() => {
      setIsLoading(false);
      setIsSent(true);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
        {!isSent ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-white mb-2">Reset Password</h2>
                  <p className="text-sm text-white text-opacity-90">
                    Enter your email to receive a password reset link
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition-all backdrop-blur-sm"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full mt-3 py-3 px-4 text-gray-600 hover:text-gray-900 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Login</span>
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Success State */}
            <div className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-gray-900 mb-2">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <span className="text-gray-900">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                If you don't see the email, check your spam folder.
              </p>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                Back to Login
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
