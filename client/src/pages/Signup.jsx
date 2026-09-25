import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Megaphone, Layers, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
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

  const nextStep = () => {
    if (step === 2) {
      if (!validateStep2()) return;
    }
    setStep(s => s + 1);
  };
  const prevStep = () => setStep(s => s - 1);

  const validateStep2 = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!emailRegex.test(formData.email)) newErrors.email = 'Valid email is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) {
      setErrors({ ...errors, [e.target.id]: null });
    }
  };

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
                  className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-slate-200">Personal Information</h3>
                <p className="text-sm text-slate-400 mt-1">We need some basic details to set up your account.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 transition-colors ${
                    errors.name ? 'border-status-red focus:border-status-red focus:ring-status-red' : 'border-slate-700 focus:border-accent focus:ring-accent'
                  }`}
                  placeholder="Jane Doe"
                />
                {errors.name && <p className="mt-1 text-sm text-status-red flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 transition-colors ${
                    errors.email ? 'border-status-red focus:border-status-red focus:ring-status-red' : 'border-slate-700 focus:border-accent focus:ring-accent'
                  }`}
                  placeholder="jane@company.com"
                />
                {errors.email && <p className="mt-1 text-sm text-status-red flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 transition-colors ${
                    errors.password ? 'border-status-red focus:border-status-red focus:ring-status-red' : 'border-slate-700 focus:border-accent focus:ring-accent'
                  }`}
                  placeholder="At least 8 characters"
                />
                {errors.password && <p className="mt-1 text-sm text-status-red flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 transition-colors ${
                    errors.confirmPassword ? 'border-status-red focus:border-status-red focus:ring-status-red' : 'border-slate-700 focus:border-accent focus:ring-accent'
                  }`}
                  placeholder="Repeat your password"
                />
                {errors.confirmPassword && <p className="mt-1 text-sm text-status-red flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.confirmPassword}</p>}
              </div>

              <div className="pt-6 flex justify-between">
                <button
                  onClick={prevStep}
                  className="bg-transparent hover:bg-slate-800 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={nextStep}
                  className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-12 text-slate-400">
              Step 3 placeholder
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