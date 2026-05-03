"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReCAPTCHA from "react-google-recaptcha";
import { useAuth } from "@/context/AuthContext";
import { fetchApi, uploadFileToS3 } from "@/lib/api";
import { RECAPTCHA_SITE_KEY, UPLOAD_FOLDERS } from "@/lib/constants";
import { getImageUrl } from "@/lib/constants";
import { Camera, Check, ChevronRight, ChevronLeft, Upload, X, ShieldCheck, User, Mail, Lock, UserCircle } from "lucide-react";
import Swal from "sweetalert2";

export default function Register() {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isEmailAvailable, setIsEmailAvailable] = useState<boolean | null>(null);
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  
  const [password, setPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const captchaRef = useRef<ReCAPTCHA>(null);
  const { login } = useAuth();
  const router = useRouter();

  // Email Logic
  const checkEmail = async (val: string) => {
    if (!val || !val.includes('@')) {
      setIsEmailAvailable(null);
      return;
    }
    setIsCheckingEmail(true);
    try {
      const res = await fetchApi(`/auth/check-email?email=${encodeURIComponent(val)}`);
      setIsEmailAvailable(res.data.available);
    } catch (err) {
      console.error("Email check failed", err);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase();
    setEmail(val);
    const timeoutId = setTimeout(() => checkEmail(val), 600);
    return () => clearTimeout(timeoutId);
  };

  // Username Logic
  const checkUsername = async (val: string) => {
    if (val.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }
    setIsCheckingUsername(true);
    try {
      const res = await fetchApi(`/auth/check-username/${encodeURIComponent(val)}`);
      setIsUsernameAvailable(res.data.available);
    } catch (err) {
      console.error("Username check failed", err);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setUsername(val);
    const timeoutId = setTimeout(() => checkUsername(val), 500);
    return () => clearTimeout(timeoutId);
  };

  const generateSuggestions = () => {
    if (!firstName || !lastName) return;
    const base = `${firstName}${lastName}`.toLowerCase();
    const sugs = [
      `${base}${Math.floor(100 + Math.random() * 899)}`,
      `${firstName.toLowerCase()}_${lastName.toLowerCase()}`,
      `${lastName.toLowerCase()}${firstName.charAt(0).toLowerCase()}${Math.floor(10 + Math.random() * 89)}`
    ];
    setUsernameSuggestions(sugs);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFileToS3(file, UPLOAD_FOLDERS.AVATARS);
      setAvatarUrl(url);
    } catch (err: any) {
      Swal.fire({ title: 'Upload Failed', text: err.message, icon: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  // Password Logic
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass)) score += 25;
    if (/[^A-Za-z0-9]/.test(pass)) score += 25;
    setPasswordStrength(score);
  };

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (!/[A-Z]/.test(pass)) pass += "A";
    if (!/[0-9]/.test(pass)) pass += "1";
    if (!/[^A-Za-z0-9]/.test(pass)) pass += "!";
    setPassword(pass);
    calculateStrength(pass);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Please accept the Terms & Conditions");
      return;
    }

    if (!captchaToken) {
      setError("Please complete the security check");
      return;
    }

    setIsLoading(true);
    setFieldErrors({});
    try {
      const fullName = `${firstName} ${lastName}`.trim();
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, username, password, fullName, avatarUrl, captchaToken })
      });

      login(res.data.accessToken, res.data.user);
      Swal.fire({ title: 'Welcome to NLA! 🎉', text: 'Account created successfully.', icon: 'success', timer: 1800, showConfirmButton: false });
      router.push('/dashboard');
    } catch (err: any) {
      if (err.data?.error && Array.isArray(err.data.error)) {
        const errors: Record<string, string> = {};
        let hasStep1Error = false;
        
        err.data.error.forEach((e: any) => {
          const field = e.field.replace('body.', '');
          errors[field] = e.message;
          
          // Check if this error belongs to Step 1
          if (['fullName', 'email', 'username'].includes(field)) {
            hasStep1Error = true;
          }
        });
        
        setFieldErrors(errors);
        setError("Please correct the highlighted fields.");
        
        // Auto-switch back to Step 1 if that's where the problem is
        if (hasStep1Error) {
          setStep(1);
        }
      } else {
        setError(err.message || 'Registration failed');
        Swal.fire({ title: 'Registration Failed', text: err.message || 'Please try again.', icon: 'error' });
      }
      captchaRef.current?.reset();
      setCaptchaToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 bg-background overflow-hidden">
      
      {/* Progress Header */}
      <div className="w-full max-w-lg mb-8 px-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
          <div className={`absolute top-1/2 left-0 h-0.5 bg-brand-yellow -translate-y-1/2 z-0 transition-all duration-500`} style={{ width: step === 1 ? '50%' : '100%' }}></div>
          
          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500 ${step >= 1 ? 'bg-brand-yellow text-black scale-110 shadow-lg shadow-brand-yellow/30' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>1</div>
          <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-black transition-all duration-500 ${step >= 2 ? 'bg-brand-yellow text-black scale-110 shadow-lg shadow-brand-yellow/30' : 'bg-white border-2 border-gray-100 text-gray-300'}`}>2</div>
        </div>
        <div className="flex justify-between mt-3 text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">
          <span className={step >= 1 ? 'text-gray-900' : ''}>Identity</span>
          <span className={step >= 2 ? 'text-gray-900' : ''}>Security</span>
        </div>
      </div>

      <div className="w-full max-w-lg bg-white border border-gray-100 p-10 space-y-8 rounded-[3rem] shadow-2xl shadow-gray-100/50 relative overflow-hidden">
        
        {/* Step 1: Identity */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center">
              <h1 className="text-3xl font-black text-gray-900 mb-2">Initialize Profile</h1>
              <p className="text-gray-500 font-medium">Let's start with your basic athlete identity.</p>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input 
                      type="text" 
                      value={firstName} 
                      onChange={(e) => { 
                        setFirstName(e.target.value); 
                        setFieldErrors(prev => ({ ...prev, fullName: "" }));
                        if (e.target.value && lastName) generateSuggestions(); 
                      }} 
                      className={`w-full pl-11 pr-4 py-4 bg-gray-50 border ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:ring-2 ring-brand-yellow/20 outline-none transition-all font-bold`} 
                      placeholder="Marcus" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => { 
                      setLastName(e.target.value); 
                      setFieldErrors(prev => ({ ...prev, fullName: "" }));
                      if (firstName && e.target.value) generateSuggestions(); 
                    }} 
                    className={`w-full px-4 py-4 bg-gray-50 border ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:ring-2 ring-brand-yellow/20 outline-none transition-all font-bold`} 
                    placeholder="Stone" 
                  />
                </div>
                {fieldErrors.fullName && <p className="col-span-2 text-[10px] text-red-500 font-bold ml-1 -mt-2">{fieldErrors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Email Address</label>
                  {isCheckingEmail && <span className="text-[9px] text-brand-blue animate-pulse">Checking...</span>}
                  {isEmailAvailable === true && <span className="text-[9px] text-green-500 font-bold">✓ Available</span>}
                  {isEmailAvailable === false && <span className="text-[9px] text-red-500 font-bold">✗ Already Registered</span>}
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => { 
                      handleEmailChange(e);
                      setFieldErrors(prev => ({ ...prev, email: "" }));
                    }} 
                    className={`w-full pl-11 pr-4 py-4 bg-gray-50 border ${fieldErrors.email ? 'border-red-500' : (isEmailAvailable === false ? 'border-red-200' : 'border-gray-100')} rounded-2xl focus:ring-2 ring-brand-yellow/20 outline-none transition-all font-bold`} 
                    placeholder="athlete@nlasports.com" 
                  />
                </div>
                {fieldErrors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.email}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Username</label>
                  {isCheckingUsername && <span className="text-[9px] text-brand-blue animate-pulse">Checking...</span>}
                  {isUsernameAvailable === true && <span className="text-[9px] text-green-500 font-bold">✓ Available</span>}
                  {isUsernameAvailable === false && <span className="text-[9px] text-red-500 font-bold">✗ Taken</span>}
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 font-black">@</span>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={(e) => { 
                      handleUsernameChange(e);
                      setFieldErrors(prev => ({ ...prev, username: "" }));
                    }} 
                    className={`w-full pl-10 pr-4 py-4 bg-gray-50 border ${fieldErrors.username ? 'border-red-500' : (isUsernameAvailable === false ? 'border-red-200' : 'border-gray-100')} rounded-2xl focus:ring-2 ring-brand-yellow/20 outline-none transition-all font-bold`} 
                    placeholder="athlete_handle" 
                  />
                </div>
                {fieldErrors.username && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.username}</p>}
                {usernameSuggestions.length > 0 && !username && (
                  <div className="mt-3 flex flex-wrap gap-2 px-1">
                    {usernameSuggestions.map(sug => (
                      <button key={sug} onClick={() => { setUsername(sug); checkUsername(sug); setFieldErrors(prev => ({ ...prev, username: "" })); }} className="text-[9px] bg-brand-yellow/10 text-brand-yellow px-3 py-1.5 rounded-full font-black hover:bg-brand-yellow hover:text-black transition-all">
                        {sug}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                onClick={() => setStep(2)}
                disabled={!firstName || !lastName || !email || !username || isUsernameAvailable === false || isEmailAvailable === false}
                className="w-full py-5 bg-gray-900 text-white font-black rounded-3xl hover:bg-black transition-all shadow-xl shadow-gray-200 flex items-center justify-center gap-3 uppercase tracking-widest text-xs disabled:opacity-30"
              >
                Continue to Security <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Security & Profile */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="text-center">
              <h1 className="text-3xl font-black text-gray-900 mb-2">Final Security</h1>
              <p className="text-gray-500 font-medium">Protect your athlete profile and customize.</p>
            </div>

            <div className="space-y-8">
              {/* Profile Picture Upload */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-yellow/50">
                    {avatarUrl ? (
                      <img src={getImageUrl(avatarUrl, UPLOAD_FOLDERS.AVATARS) || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center text-gray-400">
                        <Camera className="w-8 h-8 mb-1" />
                        <span className="text-[8px] font-black uppercase tracking-tighter">Avatar</span>
                      </div>
                    )}
                    {isUploading && <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-6 h-6 border-2 border-brand-yellow border-t-transparent rounded-full animate-spin"></div></div>}
                  </div>
                  <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-brand-yellow rounded-2xl flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                    <Upload className="w-4 h-4 text-black" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                  </label>
                </div>
                <p className="mt-4 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Upload Profile Picture (Optional)</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Set Password</label>
                  <button type="button" onClick={generatePassword} className="text-[10px] text-brand-blue font-black uppercase tracking-widest hover:underline">Generate Strong</button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password} 
                    onChange={(e) => { 
                      setPassword(e.target.value); 
                      calculateStrength(e.target.value); 
                      setFieldErrors(prev => ({ ...prev, password: "" }));
                    }} 
                    className={`w-full pl-11 pr-16 py-4 bg-gray-50 border ${fieldErrors.password ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:ring-2 ring-brand-yellow/20 outline-none transition-all font-bold`} 
                    placeholder="••••••••" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase tracking-widest">{showPassword ? "Hide" : "Show"}</button>
                </div>
                {fieldErrors.password && <p className="text-[10px] text-red-500 font-bold ml-1">{fieldErrors.password}</p>}
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                  <div className={`h-full transition-all duration-500 ${passwordStrength >= 25 ? 'bg-red-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                  <div className={`h-full transition-all duration-500 ${passwordStrength >= 50 ? 'bg-yellow-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                  <div className={`h-full transition-all duration-500 ${passwordStrength >= 75 ? 'bg-blue-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                  <div className={`h-full transition-all duration-500 ${passwordStrength === 100 ? 'bg-green-500' : 'bg-transparent'}`} style={{ width: '25%' }} />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" checked={acceptedTerms} onChange={() => setAcceptedTerms(!acceptedTerms)} className="sr-only" />
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${acceptedTerms ? 'bg-brand-yellow border-brand-yellow' : 'border-gray-200 group-hover:border-brand-yellow/50'}`}>
                      {acceptedTerms && <Check className="w-4 h-4 text-black" />}
                    </div>
                  </div>
                  <span className="text-xs font-bold text-gray-600">I accept the <button type="button" onClick={() => setShowTermsModal(true)} className="text-brand-blue hover:underline">Terms & Conditions</button></span>
                </label>

                <div className="flex justify-center bg-gray-50 rounded-3xl p-4 border border-gray-100">
                  <ReCAPTCHA ref={captchaRef} sitekey={RECAPTCHA_SITE_KEY} onChange={(token: string | null) => setCaptchaToken(token)} />
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(1)} className="w-20 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"><ChevronLeft className="w-6 h-6" /></button>
                <button 
                  onClick={handleRegister} 
                  disabled={isLoading || !captchaToken || !acceptedTerms || passwordStrength < 50}
                  className="flex-1 py-5 bg-brand-yellow text-black font-black rounded-3xl hover:bg-yellow-400 transition-all shadow-xl shadow-brand-yellow/20 uppercase tracking-widest text-xs disabled:opacity-30"
                >
                  {isLoading ? 'Creating...' : 'Initialize Athlete Profile'}
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
          Already a member? <Link href="/login" className="text-brand-yellow hover:underline">Sign In Here</Link>
        </p>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-yellow/10 rounded-2xl flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-brand-yellow" /></div>
                <h2 className="text-2xl font-black tracking-tight">Terms of Service</h2>
              </div>
              <button onClick={() => setShowTermsModal(false)} className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-all"><X className="w-6 h-6 text-gray-400" /></button>
            </div>
            <div className="p-10 max-h-[50vh] overflow-y-auto text-sm text-gray-600 leading-relaxed space-y-6">
              <p>Welcome to NLA Sports. By creating an account, you agree to abide by our community standards and editorial guidelines. We are committed to protecting your athlete data and providing a safe platform for sports storytelling.</p>
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">1. Athlete Integrity</h4>
              <p>All stories and media uploaded must be authentic and relate to your sports journey. Plagiarism or impersonation will lead to immediate account termination.</p>
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">2. Media Rights</h4>
              <p>By uploading content, you grant NLA Sports a non-exclusive license to display your story on our platform for editorial and promotional purposes.</p>
              <h4 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">3. Community Standards</h4>
              <p>Respect other athletes and fans. Harassment, hate speech, or inappropriate content is strictly prohibited.</p>
            </div>
            <div className="p-10 bg-gray-50 flex justify-end">
              <button onClick={() => { setAcceptedTerms(true); setShowTermsModal(false); }} className="px-10 py-4 bg-brand-yellow text-black font-black rounded-[2rem] hover:bg-yellow-400 transition-all shadow-xl shadow-brand-yellow/10 uppercase tracking-widest text-xs">Accept & Continue</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
