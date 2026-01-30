'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAppDispatch } from '@/features/hooks';
import { showToast } from '@/features/ui/uiSlice';
import { login } from '@/features/auth/authSlice';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LogoIcon, EyeIcon, EyeOffIcon } from '@/components/ui/Icons';
import { cn, isValidEmail, isValidPhone } from '@/lib/utils';
import { ROUTES } from '@/config/constants';

// ============================================================
// LOGIN/REGISTER PAGE - From Figma Design
// ============================================================

type AuthTab = 'signin' | 'signup';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

interface RegisterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

function LoginPageContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();

  // Tab state
  const [activeTab, setActiveTab] = useState<AuthTab>('signin');

  // Check URL query parameter for tab
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'signup') {
      setActiveTab('signup');
    }
  }, [searchParams]);

  // Login form state
  const [loginForm, setLoginForm] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  // Register form state
  const [registerForm, setRegisterForm] = useState<RegisterFormData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Errors
  const [errors, setErrors] = useState<FormErrors>({});
  const [loginError, setLoginError] = useState<string>('');
  const [registerError, setRegisterError] = useState<string>('');

  // Loading
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const validateLogin = (): boolean => {
    const newErrors: FormErrors = {};

    if (!loginForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(loginForm.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!loginForm.password) {
      newErrors.password = 'Password is required';
    } else if (loginForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateRegister = (): boolean => {
    const newErrors: FormErrors = {};

    if (!registerForm.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (registerForm.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!registerForm.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(registerForm.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!registerForm.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(registerForm.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!registerForm.password) {
      newErrors.password = 'Password is required';
    } else if (registerForm.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (registerForm.password !== registerForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;

    setIsLoading(true);
    setLoginError(''); // Clear previous errors

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginForm.email,
          password: loginForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setLoginError(data.message || 'Login failed. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      // Store token in localStorage
      if (data.data.token) {
        localStorage.setItem('authToken', data.data.token);
      }

      // Dispatch login action with user data
      dispatch(login({
        name: data.data.user.name,
        email: data.data.user.email,
        avatarSrc: data.data.user.avatar || '/images/avatars/john-doe.png',
      }));
      
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setIsLoading(true);
    setRegisterError(''); // Clear previous errors

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.errors 
          ? data.errors.map((err: any) => err.msg).join(', ')
          : data.message || 'Registration failed';
        
        setRegisterError(errorMessage);
        setIsLoading(false);
        return;
      }

      // Store token in localStorage
      if (data.data.token) {
        localStorage.setItem('authToken', data.data.token);
      }

      // Dispatch login action with user data
      dispatch(login({
        name: data.data.user.name,
        email: data.data.user.email,
        avatarSrc: data.data.user.avatar || '/images/avatars/john-doe.png',
      }));
      
      router.push(ROUTES.HOME);
    } catch (error) {
      console.error('Registration error:', error);
      setRegisterError('Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Clear errors when switching tabs
  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    setErrors({});
    setLoginError('');
    setRegisterError('');
  };

  return (
    <main className="min-h-screen bg-white flex">
      {/* Left Side - Image (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-neutral-100 items-center justify-center overflow-hidden">
        <Image
          src="/login.png"
          alt="Login illustration"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-[374px]">
          {/* Logo */}
          <div className="flex items-center gap-[15px] mb-[48px]">
            <LogoIcon className="w-[42px] h-[42px]" />
            <span className="font-sans font-extrabold text-[32px] leading-[42px] text-neutral-950">
              Foody
            </span>
          </div>

          {/* Welcome Text */}
          <div className="mb-[24px]">
            <h1 className="font-sans font-extrabold text-[28px] leading-[38px] text-neutral-950">
              Welcome Back
            </h1>
            <p className="font-sans font-medium text-[16px] leading-[30px] tracking-[-0.48px] text-neutral-950">
              Good to see you again! Let&apos;s eat
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="bg-neutral-100 rounded-2xl p-[8px] flex gap-[8px] mb-[20px]">
            <button
              type="button"
              onClick={() => handleTabChange('signin')}
              className={cn(
                'flex-1 h-[40px] rounded-xl px-3 py-2',
                'font-sans text-[16px] leading-[30px]',
                'transition-all duration-200',
                activeTab === 'signin'
                  ? 'bg-white shadow-shadow-card font-bold tracking-[-0.32px] text-neutral-950'
                  : 'font-medium tracking-[-0.48px] text-neutral-600 hover:text-neutral-950'
              )}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('signup')}
              className={cn(
                'flex-1 h-[40px] rounded-xl px-3 py-2',
                'font-sans text-[16px] leading-[30px]',
                'transition-all duration-200',
                activeTab === 'signup'
                  ? 'bg-white shadow-shadow-card font-bold tracking-[-0.32px] text-neutral-950'
                  : 'font-medium tracking-[-0.48px] text-neutral-600 hover:text-neutral-950'
              )}
            >
              Sign up
            </button>
          </div>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-[20px]">
              {/* Email */}
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => {
                  setLoginForm({ ...loginForm, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                error={errors.email}
                inputSize="md"
              />

              {/* Password */}
              <div className="relative">
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => {
                    setLoginForm({ ...loginForm, password: e.target.value });
                    if (errors.password) setErrors({ ...errors, password: undefined });
                  }}
                  error={errors.password}
                  inputSize="md"
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-neutral-950 hover:text-neutral-700"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                    </button>
                  }
                />
              </div>

              {/* Remember Me */}
              <div 
                role="button"
                tabIndex={0}
                className="flex items-center gap-[8px] cursor-pointer select-none"
                onClick={(e) => {
                  console.log('Remember me clicked, current:', loginForm.rememberMe);
                  setLoginForm({ ...loginForm, rememberMe: !loginForm.rememberMe });
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setLoginForm({ ...loginForm, rememberMe: !loginForm.rememberMe });
                  }
                }}
              >
                <div 
                  className="w-[20px] h-[20px] rounded-md border flex items-center justify-center flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: loginForm.rememberMe ? '#c12116' : 'transparent',
                    borderColor: loginForm.rememberMe ? '#c12116' : '#d5d7da'
                  }}
                >
                  {loginForm.rememberMe && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M10 3L4.5 8.5L2 6"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="font-sans font-medium text-[16px] leading-[30px] tracking-[-0.48px] text-neutral-950">
                  Remember Me
                </span>
              </div>

              {/* Login Error Message */}
              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                  {loginError}
                </div>
              )}

              {/* Login Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="!bg-[#c12116] !text-white hover:!bg-opacity-90 cursor-pointer"
              >
                Login
              </Button>
            </form>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleRegister} className="flex flex-col gap-[20px]">
              {/* Name */}
              <Input
                name="name"
                type="text"
                placeholder="Name"
                value={registerForm.name}
                onChange={(e) => {
                  setRegisterForm({ ...registerForm, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: undefined });
                }}
                error={errors.name}
                inputSize="md"
              />

              {/* Email */}
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) => {
                  setRegisterForm({ ...registerForm, email: e.target.value });
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                error={errors.email}
                inputSize="md"
              />

              {/* Phone */}
              <Input
                name="phone"
                type="tel"
                placeholder="Number Phone"
                value={registerForm.phone}
                onChange={(e) => {
                  setRegisterForm({ ...registerForm, phone: e.target.value });
                  if (errors.phone) setErrors({ ...errors, phone: undefined });
                }}
                error={errors.phone}
                inputSize="md"
              />

              {/* Password */}
              <Input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={registerForm.password}
                onChange={(e) => {
                  setRegisterForm({ ...registerForm, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: undefined });
                }}
                error={errors.password}
                inputSize="md"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-950 hover:text-neutral-700"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                }
              />

              {/* Confirm Password */}
              <Input
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={registerForm.confirmPassword}
                onChange={(e) => {
                  setRegisterForm({ ...registerForm, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                }}
                error={errors.confirmPassword}
                inputSize="md"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-neutral-950 hover:text-neutral-700"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </button>
                }
              />

              {/* Register Error Message */}
              {registerError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                  {registerError}
                </div>
              )}

              {/* Register Button */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                isLoading={isLoading}
                className="!bg-[#c12116] !text-white hover:!bg-opacity-90"
              >
                Register
              </Button>
            </form>
          )}


        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
