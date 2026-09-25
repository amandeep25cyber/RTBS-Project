import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Layers, ChevronRight } from 'lucide-react';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Advertiser fields
    companyName: '',
    industry: '',
    // Publisher fields
    websiteName: '',
    websiteUrl: '',
    category: ''
  });

  const nextStep = () => setStep(s => s + 1);

  return (
    <div className="min-h-screen bg-base-darker flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-100">
          Create your account
        </h2>
        
        {/* Progress Indicator */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                step >= i 
                  ? 'border-accent bg-accent text-white' 
                  : 'border-slate-700 text-slate-500'
              }`}>
                {i}
              </div>
              {i < 3 && (
                <div className={`w-12 h-0.5 mx-2 ${
                  step > i ? 'bg-accent' : 'bg-slate-700'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-base-panel py-8 px-4 shadow-xl border border-slate-700 sm:rounded-lg sm:px-10">
          
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-slate-200">How do you want to use the platform?</h3>
                <p className="text-sm text-slate-400 mt-1">Choose your primary role to get started.</p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  onClick={() => setFormData({ ...formData, role: 'advertiser' })}
                  className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-colors ${
                    formData.role === 'advertiser' 
                      ? 'border-accent bg-accent/10 ring-1 ring-accent' 
                      : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                  }`}
                >
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                        <Megaphone className="w-5 h-5 text-accent" />
                        Advertiser
                      </span>
                      <span className="mt-2 text-xs text-slate-400 text-left">
                        Run campaigns, manage budgets, and bid on premium ad inventory.
                      </span>
                    </span>
                  </span>
                </button>

                <button
                  onClick={() => setFormData({ ...formData, role: 'publisher' })}
                  className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-colors ${
                    formData.role === 'publisher' 
                      ? 'border-accent bg-accent/10 ring-1 ring-accent' 
                      : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                  }`}
                >
                  <span className="flex flex-1">
                    <span className="flex flex-col">
                      <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                        <Layers className="w-5 h-5 text-accent" />
                        Publisher
                      </span>
                      <span className="mt-2 text-xs text-slate-400 text-left">
                        Monetize your website, manage ad slots, and maximize revenue.
                      </span>
                    </span>
                  </span>
                </button>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  onClick={nextStep}
                  disabled={!formData.role}
                  className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step > 1 && (
            <div className="text-center py-12 text-slate-400">
              Step {step} placeholder
            </div>
          )}
          
        </div>
        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}