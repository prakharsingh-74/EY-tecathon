import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface OnboardingTourProps {
  onComplete: () => void;
}

const tourSteps = [
  {
    title: 'Welcome to RFP Automation',
    description: 'Your AI-powered platform for automating B2B RFP responses. Let us show you around!',
    icon: Sparkles,
  },
  {
    title: '5 Specialized AI Agents',
    description: 'Our AI agents work 24/7 to detect RFPs, analyze requirements, calculate pricing, write responses, and coordinate the entire process.',
    icon: Sparkles,
  },
  {
    title: 'Real-Time Monitoring',
    description: 'Track agent progress, view detailed metrics, and monitor all RFP activities from your dashboard in real-time.',
    icon: Sparkles,
  },
  {
    title: 'Automated Workflows',
    description: 'From detection to submission, our agents handle everything automatically while keeping you informed every step of the way.',
    icon: Sparkles,
  },
  {
    title: 'Ready to Get Started?',
    description: 'Explore the dashboard to see active RFPs, check agent performance, and manage your automation settings.',
    icon: Sparkles,
  },
];

export function OnboardingTour({ onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const step = tourSteps[currentStep];
  const Icon = step.icon;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        {/* Header */}
        <div className="bg-gradient-to-br from-teal-500 to-blue-600 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full -ml-12 -mb-12"></div>
          
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all backdrop-blur-sm"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="relative">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h2 className="mb-2">{step.title}</h2>
            <p className="text-white text-opacity-90">{step.description}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="px-8 pt-6">
          <div className="flex items-center gap-2 mb-6">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep
                    ? 'bg-gradient-to-r from-teal-500 to-blue-600'
                    : 'bg-gray-200'
                }`}
              ></div>
            ))}
          </div>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-600">
              Step {currentStep + 1} of {tourSteps.length}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 flex items-center gap-3">
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          )}
          
          <button
            onClick={handleNext}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            {currentStep === tourSteps.length - 1 ? (
              <>
                <Check className="w-5 h-5" />
                <span>Get Started</span>
              </>
            ) : (
              <>
                <span>Next</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Skip Button */}
        {currentStep < tourSteps.length - 1 && (
          <div className="px-8 pb-6 text-center">
            <button
              onClick={handleSkip}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Skip tour
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
