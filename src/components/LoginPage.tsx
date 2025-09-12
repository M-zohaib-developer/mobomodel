import React, { useState, useEffect } from "react";
import { Smartphone, Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useApp } from "../context/AppContext";

interface LoginPageProps {
  onNavigate: (page: string) => void;
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { state, dispatch } = useApp();
  useEffect(() => {
    // mark body so theme CSS can opt-out the login page
    document.body.classList.add("login-page");
    return () => {
      document.body.classList.remove("login-page");
    };
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check predefined users
      const user = state.users.find((u) => u.email === formData.email);

      if (user) {
        dispatch({ type: "LOGIN", payload: user });
        onNavigate("dashboard");
      } else {
        setErrors({ email: "Invalid email or password" });
      }
    } catch {
      setErrors({ general: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const handleQuickLogin = (email: string) => {
    setFormData({ email, password: "password" });
  };

  return (
    <div className="min-h-screen bg-green flex items-center justify-center p-4 bg-gradient-to-b from-teal-700 via-teal-600 to-teal-500 ">
      <div className="w-full max-w-md">
        <div
          className="bg-gradient-to-r from-green-900 via-green-700 to-green-500
 rounded-2xl p-8 shadow-2xl text-white"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Smartphone className="h-12 w-12 text-green-400" />
            </div>
            <img
              src="https://mobocheck.com/images/mobocheck-logo.png"
              alt="Hello Logo"
              className="mx-auto mb-4 w-100 h-12 object-contain"
              style={{
                filter:
                  "brightness(0) saturate(100%) invert(15%) sepia(95%) saturate(600%) hue-rotate(90deg) contrast(90%)",
              }}
            />

            <p className="text-green-200">
              Device Refurbishment Management System
            </p>
          </div>

          {/* Quick Login Buttons */}
          <div className="mb-6 space-y-2">
            <p className="text-green-200 text-sm text-center mb-3">
              Quick Login:
            </p>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handleQuickLogin("client@gmail.com")}
                className="w-full px-3 py-2 bg-green-600/20 border border-green-500/30 rounded-lg text-green-200 text-sm hover:bg-green-600/30 transition-colors duration-200"
              >
                Client Login
              </button>
              <button
                onClick={() => handleQuickLogin("enterprise@gmail.com")}
                className="w-full px-3 py-2 bg-green-600/20 border border-green-500/30 rounded-lg text-green-200 text-sm hover:bg-green-600/30 transition-colors duration-200"
              >
                Enterprise Login
              </button>
              <button
                onClick={() => handleQuickLogin("admin@gmail.com")}
                className="w-full px-3 py-2 bg-green-600/20 border border-green-500/30 rounded-lg text-green-200 text-sm hover:bg-green-600/30 transition-colors duration-200"
              >
                Admin Login
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.general && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{errors.general}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-green-200 mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-black/40 border border-green-500/30 rounded-lg text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-red-400 text-sm">{errors.email}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-green-200 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-black/40 border border-green-500/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-green-400 transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-400 text-sm">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-3 px-4 rounded-lg font-medium hover:from-green-700 hover:to-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="ml-2">Signing In...</span>
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
