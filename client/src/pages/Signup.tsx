import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Megaphone, Layers, ChevronRight, ChevronLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<any>({});
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<any>({
    role: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: 'e-commerce',
    websiteName: '',
    websiteUrl: '',
    category: 'news'
  });

  const nextStep = () => {
    if (step === 2 && !validateStep2()) return;
    setStep(s => s + 1);
  };
  
  const prevStep = () => setStep(s => s - 1);

  const validateStep2 = () => {
    const newErrors: any = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!emailRegex.test(formData.email)) newErrors.email = 'Valid email is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const newErrors: any = {};
    if (formData.role === 'advertiser') {
      if (!formData.companyName.trim()) newErrors.companyName = 'Company Name is required';
    } else {
      if (!formData.websiteName.trim()) newErrors.websiteName = 'Website Name is required';
      if (!formData.websiteUrl.trim()) newErrors.websiteUrl = 'Website URL is required';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const user = await signup(formData);
      if (user.role === 'advertiser') navigate('/advertiser/dashboard');
      else if (user.role === 'publisher') navigate('/publisher/dashboard');
    } catch (err) {
      setErrors({ submit: err.message || 'Signup failed' });
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    if (errors[e.target.id]) setErrors({ ...errors, [e.target.id]: null });
  };

  return (
    <div className="min-h-screen bg-base-darker flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-100">
          Create your account
        </h2>
        <div className="mt-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                step >= i ? 'border-accent bg-accent text-white' : 'border-slate-700 text-slate-500'
              }`}>{i}</div>
              {i < 3 && <div className={`w-12 h-0.5 mx-2 ${step > i ? 'bg-accent' : 'bg-slate-700'}`} />}
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
                    formData.role === 'advertiser' ? 'border-accent bg-accent/10 ring-1 ring-accent' : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                  }`}
                >
                  <span className="flex flex-col text-left">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                      <Megaphone className="w-5 h-5 text-accent" /> Advertiser
                    </span>
                    <span className="mt-2 text-xs text-slate-400">Run campaigns, manage budgets, and bid on inventory.</span>
                  </span>
                </button>
                <button
                  onClick={() => setFormData({ ...formData, role: 'publisher' })}
                  className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none transition-colors ${
                    formData.role === 'publisher' ? 'border-accent bg-accent/10 ring-1 ring-accent' : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                  }`}
                >
                  <span className="flex flex-col text-left">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                      <Layers className="w-5 h-5 text-accent" /> Publisher
                    </span>
                    <span className="mt-2 text-xs text-slate-400">Monetize your website, manage ad slots, maximize revenue.</span>
                  </span>
                </button>
              </div>
              <div className="pt-6 flex justify-end">
                <button onClick={nextStep} disabled={!formData.role} className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
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
              {['name', 'email', 'password', 'confirmPassword'].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-400 mb-1.5 capitalize" htmlFor={field}>
                    {field.replace('confirm', 'Confirm ')}
                  </label>
                  <input
                    id={field}
                    type={field.toLowerCase().includes('password') ? 'password' : field === 'email' ? 'email' : 'text'}
                    value={formData[field]}
                    onChange={handleInputChange}
                    className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 transition-colors ${
                      errors[field] ? 'border-status-red focus:border-status-red focus:ring-status-red' : 'border-slate-700 focus:border-accent focus:ring-accent'
                    }`}
                  />
                  {errors[field] && <p className="mt-1 text-sm text-status-red flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors[field]}</p>}
                </div>
              ))}
              <div className="pt-6 flex justify-between">
                <button onClick={prevStep} className="bg-transparent hover:bg-slate-800 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={nextStep} className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h3 className="text-lg font-medium text-slate-200">
                  {formData.role === 'advertiser' ? 'Advertiser Details' : 'Publisher Details'}
                </h3>
                <p className="text-sm text-slate-400 mt-1">Almost there! Tell us a bit about your business.</p>
              </div>

              {errors.submit && (
                <div className="p-4 bg-status-red/10 border border-status-red/20 rounded-lg flex items-start gap-3 text-status-red">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm">{errors.submit}</p>
                </div>
              )}

              {formData.role === 'advertiser' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="companyName">Company Name</label>
                    <input
                      id="companyName" type="text" value={formData.companyName} onChange={handleInputChange}
                      className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 ${errors.companyName ? 'border-status-red focus:border-status-red focus:ring-status-red' : 'border-slate-700 focus:border-accent focus:ring-accent'}`}
                    />
                    {errors.companyName && <p className="mt-1 text-sm text-status-red flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.companyName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="industry">Industry</label>
                    <select
                      id="industry" value={formData.industry} onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    >
                      <option value="e-commerce">E-commerce</option>
                      <option value="technology">Technology</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="websiteName">Website Name</label>
                    <input
                      id="websiteName" type="text" value={formData.websiteName} onChange={handleInputChange}
                      className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 ${errors.websiteName ? 'border-status-red focus:border-status-red focus:ring-status-red' : 'border-slate-700 focus:border-accent focus:ring-accent'}`}
                    />
                    {errors.websiteName && <p className="mt-1 text-sm text-status-red flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.websiteName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="websiteUrl">Website URL</label>
                    <input
                      id="websiteUrl" type="text" value={formData.websiteUrl} onChange={handleInputChange} placeholder="example.com"
                      className={`w-full bg-slate-900 border rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:ring-1 ${errors.websiteUrl ? 'border-status-red focus:border-status-red focus:ring-status-red' : 'border-slate-700 focus:border-accent focus:ring-accent'}`}
                    />
                    {errors.websiteUrl && <p className="mt-1 text-sm text-status-red flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.websiteUrl}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1.5" htmlFor="category">Content Category</label>
                    <select
                      id="category" value={formData.category} onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    >
                      <option value="news">News & Media</option>
                      <option value="entertainment">Entertainment</option>
                      <option value="technology">Technology</option>
                      <option value="lifestyle">Lifestyle</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-6 flex justify-between">
                <button onClick={prevStep} disabled={isLoading} className="bg-transparent hover:bg-slate-800 text-slate-300 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button onClick={handleSubmit} disabled={isLoading} className="bg-accent hover:bg-accent-hover text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center min-w-[140px]">
                  {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Complete</>}
                </button>
              </div>
            </div>
          )}
          
        </div>
        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-accent hover:text-accent-hover font-medium">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
