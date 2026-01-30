'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppDispatch, useAppSelector } from '@/features/hooks';
import { showToast } from '@/features/ui/uiSlice';
import { logout, login } from '@/features/auth/authSlice';
import { selectUser } from '@/features/auth/authSlice';
import { Avatar } from '@/components/ui/Avatar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toast } from '@/components/domain/Toast';
import { Input } from '@/components/ui/Input';
import { isValidPhone, isValidEmail } from '@/lib/utils';
import { ROUTES } from '@/config/constants';
import { LocationIcon, FileIcon, LogoutIcon } from '@/components/ui/Icons';

// ============================================================
// PROFILE PAGE - From Figma Design (37412:5482)
// ============================================================

// Assets from Figma
const ASSETS = {
  avatar: '/figma-assets/orders/213b6c0bebc6088bbc6f58bd4058dc1ef294842d.png',
  markerPin: '/figma-assets/orders/1fdda62ffdc718d2107a38c67965b2b66e0ba6ac.svg',
  fileIcon: '/figma-assets/orders/6c0d97c6af8045f9dfadba4db8a82693057fff59.svg',
  logoutIcon: '/figma-assets/orders/eb0830ed04cdfdc6c65b117ef41fe9511a922ce0.svg',
};

// Shadow style from Figma
const cardShadow = { boxShadow: '0px 0px 20px 0px rgba(203, 202, 202, 0.25)' };

interface ProfileFormData {
  name: string;
  email: string;
  phone: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectUser);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          if (response.status === 401) {
            localStorage.removeItem('authToken');
            dispatch(logout());
            router.push('/login');
            return;
          }
          throw new Error(data.message);
        }

        setUserData(data.data);
        setFormData({
          name: data.data.name || '',
          email: data.data.email || '',
          phone: data.data.phone || '',
        });

        // Update Redux store with latest user data
        dispatch(login({
          name: data.data.name,
          email: data.data.email,
          avatarSrc: data.data.avatar || '/images/avatars/john-doe.png',
        }));
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        dispatch(showToast({ message: 'Failed to load profile', type: 'error' }));
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [dispatch, router]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMessage = data.errors 
          ? data.errors.map((err: any) => err.msg).join(', ')
          : data.message || 'Failed to update profile';
        
        dispatch(showToast({ message: errorMessage, type: 'error' }));
        return;
      }

      setUserData(data.data);
      setIsEditing(false);
      
      // Update Redux store
      dispatch(login({
        name: data.data.name,
        email: data.data.email,
        avatarSrc: data.data.avatar || '/images/avatars/john-doe.png',
      }));
      
      dispatch(showToast({ message: 'Profile updated successfully!', type: 'success' }));
    } catch (error) {
      console.error('Update profile error:', error);
      dispatch(showToast({ message: 'Failed to update profile', type: 'error' }));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem('authToken');
    
    // Dispatch logout action to clear Redux state
    dispatch(logout());
    
    dispatch(showToast({ message: 'Logged out successfully', type: 'success' }));
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <Toast />
      <Header
        variant="default"
        className="shadow-shadow-card border-b-0"
        containerClassName="px-4 lg:px-[120px]"
      />

      {/* Loading State */}
      {isFetching && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-error"></div>
        </div>
      )}

      {/* Main Content - Only show when data is loaded */}
      {!isFetching && userData && (
        <>
          {/* Main Content Container - matches Figma exactly */}
          <div
        className="flex justify-center px-4 lg:px-[120px] py-6 lg:py-[48px] pb-12 lg:pb-[80px]"
      >
        <div
          className="flex flex-col lg:flex-row items-start w-full max-w-[1200px] gap-4 lg:gap-[32px]"
        >
        {/* Sidebar Profile - Hidden on mobile, shown on desktop */}
        <aside
          className="hidden lg:flex bg-white rounded-[16px] flex-col shrink-0"
          style={{ width: '240px', padding: '20px', gap: '24px', ...cardShadow }}
        >
          {/* Profile Header */}
          <div className="flex items-center w-full" style={{ gap: '8px' }}>
            <Avatar
              src={userData.avatar}
              name={userData.name}
              size={48}
            />
            <span className="font-bold text-[18px] leading-[32px] tracking-[-0.54px] text-[#0a0d12]">
              {userData.name}
            </span>
          </div>

          {/* Divider */}
          <div style={{ width: '201px', height: '0px', borderTop: '1px solid #e9eaeb' }} />

          {/* Navigation Menu */}
          <Link
            href={ROUTES.PROFILE}
            className="flex items-center"
            style={{ gap: '8px' }}
          >
            <LocationIcon size={24} className="shrink-0 text-[#c12116]" />
            <span className="font-medium text-[16px] leading-[30px] tracking-[-0.48px] text-[#c12116]">
              Delivery Address
            </span>
          </Link>

          <Link
            href={ROUTES.ORDERS}
            className="flex items-center transition-opacity hover:opacity-80"
            style={{ gap: '8px' }}
          >
            <FileIcon size={24} className="shrink-0 text-[#0a0d12]" />
            <span className="font-medium text-[16px] leading-[30px] tracking-[-0.48px] text-[#0a0d12]">
              My Orders
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center transition-opacity hover:opacity-80"
            style={{ gap: '8px' }}
          >
            <LogoutIcon size={24} className="shrink-0 text-[#0a0d12]" />
            <span className="font-medium text-[16px] leading-[30px] tracking-[-0.48px] text-[#0a0d12]">
              Logout
            </span>
          </button>
        </aside>

        {/* Profile Content */}
        <section className="flex flex-col w-full lg:w-[524px] gap-4 lg:gap-[24px]">
          <h1 className="font-extrabold text-[24px] lg:text-[32px] leading-[36px] lg:leading-[42px] text-[#0a0d12] w-full">
            Profile
          </h1>

          {/* Profile Card */}
          <div
            className="bg-white rounded-[16px] flex flex-col w-full p-4 lg:p-[20px] gap-6 lg:gap-[24px]"
            style={cardShadow}
          >
            {isEditing ? (
              /* Edit Form */
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:gap-[24px]">
                {/* Avatar */}
                <div className="flex items-center gap-3 lg:gap-[16px]">
                  <Avatar
                    src={userData.avatar}
                    name={formData.name}
                    size={64}
                  />
                  <button
                    type="button"
                    className="font-medium text-xs lg:text-[14px] text-[#6941C6] hover:underline"
                  >
                    Change Photo
                  </button>
                </div>

                <div className="flex flex-col gap-3 lg:gap-[16px]">
                  <Input
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    error={errors.name}
                  />

                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: undefined });
                    }}
                    error={errors.email}
                  />

                  <Input
                    label="Nomor Handphone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: undefined });
                    }}
                    error={errors.phone}
                  />
                </div>

                <div className="flex gap-2 lg:gap-[12px]">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: userData?.name || '',
                        email: userData?.email || '',
                        phone: userData?.phone || '',
                      });
                      setErrors({});
                    }}
                    className="flex items-center justify-center border border-[#d5d7da] rounded-[100px] font-bold text-sm lg:text-[16px] leading-tight lg:leading-[30px] tracking-[-0.32px] text-[#0a0d12] hover:bg-neutral-50 transition-colors h-10 lg:h-[44px] px-4 lg:px-5"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 flex items-center justify-center bg-[#c12116] rounded-[100px] font-bold text-sm lg:text-[16px] leading-tight lg:leading-[30px] tracking-[-0.32px] text-[#fdfdfd] hover:bg-[#a91c13] transition-colors disabled:opacity-50 h-10 lg:h-[44px] px-2 lg:px-[8px]"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="flex flex-col gap-6 lg:gap-[24px]">
                <div className="flex flex-col w-full gap-2 lg:gap-[12px]">
                  {/* Avatar */}
                  <Avatar
                    src={userData.avatar}
                    name={formData.name}
                    size={64}
                  />

                  {/* Name Row */}
                  <div className="flex items-center justify-between w-full text-[#0a0d12] text-[14px] lg:text-[16px] leading-[28px] lg:leading-[30px]">
                    <span className="font-medium tracking-[-0.48px]">Name</span>
                    <span className="font-bold tracking-[-0.32px]">{formData.name}</span>
                  </div>

                  {/* Email Row */}
                  <div className="flex items-center justify-between w-full text-[#0a0d12] text-[14px] lg:text-[16px] leading-[28px] lg:leading-[30px]">
                    <span className="font-medium tracking-[-0.48px]">Email</span>
                    <span className="font-bold tracking-[-0.32px]">{formData.email}</span>
                  </div>

                  {/* Phone Row */}
                  <div className="flex items-center justify-between w-full text-[#0a0d12] text-[14px] lg:text-[16px] leading-[28px] lg:leading-[30px]">
                    <span className="font-medium tracking-[-0.48px]">Nomor Handphone</span>
                    <span className="font-bold tracking-[-0.32px]">{formData.phone}</span>
                  </div>
                </div>

                {/* Update Profile Button */}
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center w-full bg-[#c12116] rounded-[100px] font-bold text-sm lg:text-[16px] leading-tight lg:leading-[30px] tracking-[-0.32px] text-[#fdfdfd] hover:bg-[#a91c13] transition-colors h-10 lg:h-[44px] p-2 lg:p-[8px]"
                >
                  Update Profile
                </button>
              </div>
            )}
          </div>
        </section>
          </div>
        </div>
        </>
      )}

      <Footer />
    </main>
  );
}
