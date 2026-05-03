"use client";

import AdminLayout from "@/components/AdminLayout";
import { fetchApi } from "@/lib/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { 
  ChevronLeft, 
  UserPlus, 
  Mail, 
  User as UserIcon, 
  Shield, 
  Info,
  CheckCircle,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Layers,
  Send
} from "lucide-react";
import Link from "next/link";

export default function NewUserPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    username: "",
    email: ""
  });
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    role: "USER",
    password: "",
  });

  const calculateStrength = (pass: string) => {
    let s = 0;
    if (pass.length > 8) s++;
    if (/[A-Z]/.test(pass)) s++;
    if (/[0-9]/.test(pass)) s++;
    if (/[^A-Za-z0-9]/.test(pass)) s++;
    return s;
  };

  const strength = calculateStrength(formData.password);
  const strengthText = ["Weak", "Fair", "Good", "Strong", "Excellent"][strength];
  const strengthColor = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"][strength];

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
    let pass = "";
    for (let i = 0; i < 14; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
    setFormData({ ...formData, password: pass });
    setShowPassword(true);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setFieldErrors({ username: "", email: "" });

    try {
      await fetchApi("/admin/users", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      Swal.fire({
        title: 'User Created! 🎊',
        text: `An invitation email has been sent to ${formData.email}.`,
        icon: 'success',
        confirmButtonColor: '#1ABB9C'
      });
      
      router.push("/users");
    } catch (error: any) {
      const msg = error.message || "";
      if (msg.includes("Username")) {
        setFieldErrors(prev => ({ ...prev, username: msg }));
      } else if (msg.includes("Email")) {
        setFieldErrors(prev => ({ ...prev, email: msg }));
      } else {
        Swal.fire({
          title: 'Error',
          text: msg || 'Failed to create user',
          icon: 'error',
          confirmButtonColor: '#d33'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <Link 
          href="/users" 
          className="flex items-center gap-2 text-admin-teal hover:underline text-sm font-medium mb-4 w-fit"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Users
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Add New User</h1>
            <p className="text-gray-500 mt-1">Onboard a new athlete or administrator to the platform.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <Layers className="w-5 h-5 text-admin-teal" />
              <h2 className="text-lg font-bold text-gray-800">User Information</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-admin-teal transition-colors" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      className="w-full pl-10 pr-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all"
                      value={formData.fullName}
                      onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Email Address <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-admin-teal transition-colors" />
                    <input
                      type="email"
                      required
                      placeholder="john@example.com"
                      className={`w-full pl-10 pr-4 py-2 text-sm rounded border outline-none transition-all ${fieldErrors.email ? 'border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-1 focus:ring-admin-teal'}`}
                      value={formData.email}
                      onChange={e => {
                        setFormData({ ...formData, email: e.target.value });
                        if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: "" });
                      }}
                    />
                  </div>
                  {fieldErrors.email && <p className="mt-1 text-[11px] text-red-500 font-bold">{fieldErrors.email}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Username <span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <span className="absolute left-3 top-2 text-gray-400 text-sm font-bold group-focus-within:text-admin-teal transition-colors">@</span>
                    <input
                      type="text"
                      required
                      placeholder="johndoe"
                      className={`w-full pl-8 pr-4 py-2 text-sm rounded border outline-none transition-all ${fieldErrors.username ? 'border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-1 focus:ring-admin-teal'}`}
                      value={formData.username}
                      onChange={e => {
                        setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, '') });
                        if (fieldErrors.username) setFieldErrors({ ...fieldErrors, username: "" });
                      }}
                    />
                  </div>
                  {fieldErrors.username && <p className="mt-1 text-[11px] text-red-500 font-bold">{fieldErrors.username}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">User Role</label>
                  <div className="relative group">
                    <Shield className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-admin-teal transition-colors" />
                    <select
                      className="w-full pl-10 pr-4 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all bg-white appearance-none"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="USER">Athlete / User</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <div className="flex justify-between items-center mb-3">
                   <label className="block text-sm font-bold text-gray-700">Password (Optional)</label>
                   <button type="button" onClick={generatePassword} className="text-[11px] font-black text-admin-teal uppercase tracking-widest hover:underline">Generate Secure</button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-admin-teal transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave blank to auto-generate"
                    className="w-full pl-10 pr-20 py-2 text-sm rounded border border-gray-300 focus:ring-1 focus:ring-admin-teal outline-none transition-all"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {formData.password && (
                      <button type="button" onClick={() => copyToClipboard(formData.password)} className="p-1.5 text-gray-400 hover:text-admin-teal transition-colors">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1.5 text-gray-400 hover:text-admin-teal transition-colors">
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {formData.password && (
                  <div className="mt-4">
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-1">
                       {[1, 2, 3, 4].map((i) => (
                         <div key={i} className={`h-full flex-1 transition-all duration-300 ${strength >= i ? strengthColor : 'bg-gray-200'}`} />
                       ))}
                    </div>
                    <span className="text-[10px] text-gray-500 font-bold uppercase mt-2 block tracking-widest">Security: {strengthText}</span>
                  </div>
                )}
                <p className="mt-3 text-[11px] text-gray-500 italic leading-relaxed">
                  Note: If left blank, we will generate a secure password and include it in the invitation email.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <h2 className="text-sm font-bold text-gray-800">Finalize Account</h2>
            </div>
            <div className="p-5 space-y-4">
              <button
                type="submit"
                disabled={isLoading || !formData.fullName || !formData.email || !formData.username}
                className="w-full py-3 bg-admin-teal text-white rounded font-black text-xs uppercase tracking-[0.2em] shadow-md hover:shadow-admin-teal/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? "Creating..." : <><Send className="w-4 h-4" /> Create & Send</>}
              </button>
              <Link
                href="/users"
                className="w-full block text-center py-3 bg-gray-50 text-gray-500 rounded font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-all border border-gray-200"
              >
                Cancel
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/50">
              <Info className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-bold text-gray-800">Onboarding Guide</h2>
            </div>
            <div className="p-5">
              <div className="space-y-6">
                {[
                  { step: "01", title: "Fill Details", desc: "Enter the user's primary information and assign a system role." },
                  { step: "02", title: "System Check", desc: "We'll verify the email and username uniqueness automatically." },
                  { step: "03", title: "Invitation", desc: "An official welcome email is sent with secure login credentials." },
                  { step: "04", title: "Profile Set", desc: "User logs in and completes their biography and social links." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 group">
                    <span className="text-xl font-black text-gray-100 group-hover:text-admin-teal/20 transition-colors shrink-0 leading-none">{item.step}</span>
                    <div>
                      <p className="text-[11px] font-black text-gray-800 uppercase tracking-widest mb-1">{item.title}</p>
                      <p className="text-[11px] text-gray-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-5 rounded">
            <div className="flex gap-3">
              <Shield className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-[11px] font-black text-amber-900 uppercase tracking-widest mb-1">Security Notice</p>
                <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                  Invitations contain temporary credentials. For security, these should never be shared or forwarded to third parties.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
