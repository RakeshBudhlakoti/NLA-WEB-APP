"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      });

      // res is { success: true, message: "...", data: { user, accessToken, ... } }
      const { user, accessToken } = res.data;

      if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
        Swal.fire({
          title: 'Access Denied',
          text: 'You do not have administrative privileges to access this area.',
          icon: 'warning',
          confirmButtonColor: '#2271b1'
        });
      } else {
        login(accessToken, user);
        Swal.fire({
          toast: true,
          position: 'top-end',
          title: 'Welcome back!',
          text: `Signed in as ${user.profile?.fullName || user.username}`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      Swal.fire({
        title: 'Authentication Failed',
        text: error.message || "We couldn't sign you in. Please check your credentials and try again.",
        icon: 'error',
        confirmButtonColor: '#d33'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-admin-sidebar p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-admin-text tracking-tight">NLA Admin</h1>
          <p className="text-admin-muted mt-2 text-sm">Sign in to manage the platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-admin-text mb-1">Email or Username</label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-admin-teal transition-all"
              placeholder="admin@nlasports.com or handle"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-admin-text mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-admin-teal transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-admin-text hover:bg-black text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-70 flex justify-center items-center"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
