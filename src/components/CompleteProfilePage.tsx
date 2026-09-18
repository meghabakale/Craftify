import React, { useState } from 'react';
import { User, ArtisanPayoutDetails } from '../types';
import { ImageUploadDropzone } from './common/ImageUploadDropzone';
import {
  User as UserIcon,
  Briefcase,
  Camera,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  MapPin,
  Phone,
  HelpCircle,
  FileText,
  Clock,
} from 'lucide-react';

interface CompleteProfilePageProps {
  currentUser: User | null;
  onSaveProfile: (updatedUser: User) => void;
  onNavigate: (view: any) => void;
  showToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi NCR',
  'Jammu & Kashmir',
  'Ladakh',
];

const POPULAR_CRAFTS = [
  'Chanderi Handloom Weaving',
  'Jaipur Blue Pottery',
  'Banarasi Brocade & Silk Weaving',
  'Kalamkari Hand-block Painting',
  'Kutch Rogan Art',
  'Assam Cane & Bamboo Craft',
  'Moradabad Brass & Metal Inlay',
  'Saharanpur Wood Carving',
  'Terracotta & Studio Ceramics',
  'Bidriware Silver Inlay',
  'Pashmina & Kashmiri Carpet Weaving',
  'Tanjore Painting & Gold Foil Art',
  'Dhokra Lost-Wax Metal Casting',
];

export const CompleteProfilePage: React.FC<CompleteProfilePageProps> = ({
  currentUser,
  onSaveProfile,
  onNavigate,
  showToast,
}) => {
  const isEditing = Boolean(currentUser?.profileCompleted);

  // Form State
  const [legalName, setLegalName] = useState(currentUser?.legalName || currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || currentUser?.shippingAddress?.city || '');
  const [state, setState] = useState(currentUser?.state || currentUser?.shippingAddress?.state || 'Madhya Pradesh');
  const [gstNumber, setGstNumber] = useState(currentUser?.gstNumber || '');
  const [notGstRegistered, setNotGstRegistered] = useState(!currentUser?.gstNumber);

  // Your Craft
  const [businessName, setBusinessName] = useState(currentUser?.businessName || '');
  const [craftType, setCraftType] = useState(currentUser?.craftType || 'Chanderi Handloom Weaving');
  const [yearsOfExperience, setYearsOfExperience] = useState<number | string>(
    currentUser?.yearsOfExperience !== undefined ? currentUser.yearsOfExperience : 12
  );

  // Photo & Story
  const [profilePhoto, setProfilePhoto] = useState(
    currentUser?.profilePhoto ||
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'
  );
  const [bio, setBio] = useState(
    currentUser?.bio ||
      'Generational master artisan carrying forward authentic handloom traditions. Dedicated to chemical-free natural dyes, ethical weaver wages, and hand-crafting museum-grade textiles.'
  );

  // Payout Details
  const [accountHolderName, setAccountHolderName] = useState(
    currentUser?.payoutDetails?.accountHolderName || currentUser?.name || ''
  );
  const [accountNumber, setAccountNumber] = useState(
    currentUser?.payoutDetails?.accountNumber || ''
  );
  const [ifscCode, setIfscCode] = useState(currentUser?.payoutDetails?.ifscCode || '');

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick autofill demo artisan profile
  const handleFillDemo = () => {
    setLegalName('Radha Devi Sharma');
    setPhone('+91 98261 44520');
    setCity('Chanderi');
    setState('Madhya Pradesh');
    setBusinessName('Radha Devi Handloom Collective');
    setCraftType('Chanderi Handloom Weaving');
    setYearsOfExperience(24);
    setProfilePhoto('https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400');
    setBio(
      'Third-generation master weaver from the historic weaving town of Chanderi. Leading an all-women artisan cooperative dedicated to unadulterated cotton-silk pit-looms and organic forest indigo.'
    );
    setNotGstRegistered(true);
    setGstNumber('');
    setAccountHolderName('Radha Devi Sharma');
    setAccountNumber('918273645019');
    setIfscCode('SBIN0001042');
    setErrors({});
    showToast('Demo artisan profile filled with sample data.', 'info');
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!legalName.trim()) {
      errs.legalName = 'Full legal name is required as per government identification.';
    }
    if (!phone.trim()) {
      errs.phone = 'Contact phone number is required for dispatch and verification.';
    } else if (phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Please enter a valid 10-digit phone number.';
    }
    if (!city.trim()) {
      errs.city = 'City or village name is required.';
    }
    if (!state.trim()) {
      errs.state = 'State / region is required.';
    }

    if (!businessName.trim()) {
      errs.businessName = 'Workshop or business entity name is required.';
    }
    if (!craftType.trim()) {
      errs.craftType = 'Primary craft type is required.';
    }
    const expNum = Number(yearsOfExperience);
    if (isNaN(expNum) || expNum < 0) {
      errs.yearsOfExperience = 'Please enter valid years of experience (at least 0).';
    }

    if (!profilePhoto.trim()) {
      errs.profilePhoto = 'Please provide a workshop or artisan profile photo.';
    }
    if (!bio.trim()) {
      errs.bio = 'Artisan bio / workshop story is required (2-4 sentences).';
    } else if (bio.trim().length < 40) {
      errs.bio = 'Please provide at least 2 full sentences describing your craft tradition and workshop story.';
    }

    if (!accountHolderName.trim()) {
      errs.accountHolderName = 'Account holder name is required for simulated escrow payout.';
    }
    if (!accountNumber.trim()) {
      errs.accountNumber = 'Bank account number is required.';
    } else if (accountNumber.trim().length < 8) {
      errs.accountNumber = 'Please enter a valid bank account number.';
    }
    if (!ifscCode.trim()) {
      errs.ifscCode = 'Bank IFSC code is required (e.g. SBIN0001042).';
    } else if (ifscCode.trim().length < 6) {
      errs.ifscCode = 'Invalid IFSC code format.';
    }

    if (!notGstRegistered && gstNumber.trim().length > 0 && gstNumber.trim().length < 15) {
      errs.gstNumber = 'GST number should be 15 characters, or select "Not registered".';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showToast('Please fill all required profile fields before proceeding.', 'error');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    const payoutDetails: ArtisanPayoutDetails = {
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      ifscCode: ifscCode.trim().toUpperCase(),
    };

    const updatedUser: User = {
      ...(currentUser || {
        id: `usr-artisan-${Date.now().toString().slice(-6)}`,
        name: legalName.trim(),
        email: 'artisan@craftify.in',
        role: 'artisan',
        avatarInitials: legalName.slice(0, 2).toUpperCase(),
        memberSince: 'September 2026',
      }),
      name: legalName.trim(),
      legalName: legalName.trim(),
      businessName: businessName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      state: state.trim(),
      craftType: craftType.trim(),
      yearsOfExperience: Number(yearsOfExperience),
      bio: bio.trim(),
      profilePhoto: profilePhoto.trim(),
      payoutDetails,
      gstNumber: notGstRegistered ? 'NOT_REGISTERED' : gstNumber.trim().toUpperCase(),
      profileCompleted: true,
    };

    onSaveProfile(updatedUser);
    setIsSubmitting(false);
    showToast(
      isEditing
        ? 'Artisan profile updated successfully!'
        : 'Profile completed! Your seller onboarding is verified and you can now launch campaigns.',
      'success'
    );
    onNavigate('creator-dashboard');
  };

  return (
    <div id="complete-profile-page" className="min-h-screen bg-[#F1F3F6] py-6 sm:py-10 text-[#212121]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Bar */}
        <div className="bg-[#FFFFFF] rounded-[4px] border border-[#E0E0E0] p-3.5 sm:p-4 mb-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#878787]">Craftify Seller Hub</span>
            <span className="text-[#878787]">/</span>
            <span className="font-semibold text-[#2874F0]">
              {isEditing ? 'Edit Artisan Profile' : 'Artisan Onboarding — Complete Profile'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-3 py-1.5 bg-[#F1F3F6] hover:bg-[#EAEAEA] text-[#2874F0] border border-[#2874F0]/30 rounded-[2px] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fill Demo Profile</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate(isEditing ? 'creator-dashboard' : 'home')}
              className="px-3 py-1.5 text-xs text-[#878787] hover:text-[#212121] transition-colors cursor-pointer"
            >
              {isEditing ? 'Back to Dashboard' : 'Cancel'}
            </button>
          </div>
        </div>

        {/* Onboarding Header Hero Card */}
        <div className="bg-[#FFFFFF] rounded-[4px] border border-[#E0E0E0] p-5 sm:p-6 mb-5 shadow-xs">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[2px] bg-[#EBF3FE] text-[#2874F0] text-[11px] font-bold uppercase tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2874F0]" />
                <span>Craftify Verified Artisan Enrollment</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-[#212121] tracking-tight">
                {isEditing ? 'Manage Your Artisan Profile' : 'Complete Your Artisan Profile'}
              </h1>
              <p className="text-xs sm:text-sm text-[#878787] mt-1.5 max-w-2xl leading-relaxed">
                Before launching a crowdfunding campaign or listing handcrafted pieces, complete your seller profile. Your workshop story, craft lineage, and simulated payout escrow account will be authenticated for backer trust.
              </p>
            </div>

            <div className="hidden sm:flex flex-col items-center justify-center w-24 h-24 bg-[#F8FAFC] border border-[#E0E0E0] rounded-[4px] p-2 text-center shrink-0">
              <Building2 className="w-7 h-7 text-[#2874F0] mb-1" />
              <span className="text-[10px] font-bold text-[#212121] leading-tight">
                {isEditing ? 'Profile Active' : 'Step 1 of 1'}
              </span>
            </div>
          </div>

          {/* Quick Step Indicators */}
          <div className="mt-5 pt-4 border-t border-[#F0F0F0] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="flex items-center gap-2 p-2 rounded-[2px] bg-[#F8FAFC] border border-[#EAEAEA]">
              <UserIcon className="w-4 h-4 text-[#2874F0] shrink-0" />
              <span className="font-semibold text-[#212121] truncate">1. Personal Info</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-[2px] bg-[#F8FAFC] border border-[#EAEAEA]">
              <Briefcase className="w-4 h-4 text-[#2874F0] shrink-0" />
              <span className="font-semibold text-[#212121] truncate">2. Your Craft</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-[2px] bg-[#F8FAFC] border border-[#EAEAEA]">
              <Camera className="w-4 h-4 text-[#2874F0] shrink-0" />
              <span className="font-semibold text-[#212121] truncate">3. Story & Photo</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-[2px] bg-[#F8FAFC] border border-[#EAEAEA]">
              <CreditCard className="w-4 h-4 text-[#2874F0] shrink-0" />
              <span className="font-semibold text-[#212121] truncate">4. Escrow Payout</span>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* SECTION 1: Personal Details */}
          <div className="bg-[#FFFFFF] rounded-[4px] border border-[#E0E0E0] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F0F0F0]">
              <div className="w-7 h-7 rounded-full bg-[#EBF3FE] text-[#2874F0] font-bold text-xs flex items-center justify-center">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-[#212121]">Personal Details</h2>
                <p className="text-xs text-[#878787]">Legal identity and workshop location credentials</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  Full Legal Name <span className="text-[#D32F2F]">*</span>
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="e.g. Radha Devi Sharma"
                  className={`w-full px-3 py-2 text-xs rounded-[2px] border bg-[#FFFFFF] text-[#212121] focus:outline-none focus:ring-1 ${
                    errors.legalName ? 'border-[#D32F2F] focus:ring-[#D32F2F]' : 'border-[#D5D5D5] focus:ring-[#2874F0]'
                  }`}
                />
                {errors.legalName && <p className="text-[11px] text-[#D32F2F] mt-1">{errors.legalName}</p>}
                <p className="text-[10px] text-[#878787] mt-1">Official name as on government ID or artisan passbook</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  Contact Phone Number <span className="text-[#D32F2F]">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-[#878787] font-semibold">+91</span>
                  <input
                    type="tel"
                    value={phone.replace(/^\+91\s*/, '')}
                    onChange={(e) => setPhone('+91 ' + e.target.value.trimStart())}
                    placeholder="98765 43210"
                    className={`w-full pl-11 pr-3 py-2 text-xs rounded-[2px] border bg-[#FFFFFF] text-[#212121] focus:outline-none focus:ring-1 ${
                      errors.phone ? 'border-[#D32F2F] focus:ring-[#D32F2F]' : 'border-[#D5D5D5] focus:ring-[#2874F0]'
                    }`}
                  />
                </div>
                {errors.phone && <p className="text-[11px] text-[#D32F2F] mt-1">{errors.phone}</p>}
                <p className="text-[10px] text-[#878787] mt-1">For order courier dispatch and admin communication</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  City / Artisan Cluster <span className="text-[#D32F2F]">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Chanderi, Ashoknagar District"
                  className={`w-full px-3 py-2 text-xs rounded-[2px] border bg-[#FFFFFF] text-[#212121] focus:outline-none focus:ring-1 ${
                    errors.city ? 'border-[#D32F2F] focus:ring-[#D32F2F]' : 'border-[#D5D5D5] focus:ring-[#2874F0]'
                  }`}
                />
                {errors.city && <p className="text-[11px] text-[#D32F2F] mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  Region / State <span className="text-[#D32F2F]">*</span>
                </label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className={`w-full px-3 py-2 text-xs rounded-[2px] border bg-[#FFFFFF] text-[#212121] focus:outline-none focus:ring-1 ${
                    errors.state ? 'border-[#D32F2F] focus:ring-[#D32F2F]' : 'border-[#D5D5D5] focus:ring-[#2874F0]'
                  }`}
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="text-[11px] text-[#D32F2F] mt-1">{errors.state}</p>}
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-[#F0F0F0]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#212121]">
                    GSTIN Number <span className="text-[#878787] font-normal">(Optional for Artisans)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-[#666666] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={notGstRegistered}
                      onChange={(e) => {
                        setNotGstRegistered(e.target.checked);
                        if (e.target.checked) setGstNumber('');
                      }}
                      className="rounded-[2px] text-[#2874F0] focus:ring-[#2874F0]"
                    />
                    <span>Not registered for GST (Small artisan turnover exemption)</span>
                  </label>
                </div>
                {!notGstRegistered && (
                  <div className="mt-2">
                    <input
                      type="text"
                      value={gstNumber}
                      onChange={(e) => setGstNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. 23AAAAA0000A1Z5"
                      maxLength={15}
                      className="w-full px-3 py-2 text-xs rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-[#212121] uppercase focus:outline-none focus:ring-1 focus:ring-[#2874F0]"
                    />
                    {errors.gstNumber && <p className="text-[11px] text-[#D32F2F] mt-1">{errors.gstNumber}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: Your Craft */}
          <div className="bg-[#FFFFFF] rounded-[4px] border border-[#E0E0E0] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F0F0F0]">
              <div className="w-7 h-7 rounded-full bg-[#EBF3FE] text-[#2874F0] font-bold text-xs flex items-center justify-center">
                2
              </div>
              <div>
                <h2 className="text-base font-bold text-[#212121]">Your Craft & Workshop</h2>
                <p className="text-xs text-[#878787]">Your artisanal enterprise identity and traditional craft lineage</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  Business / Workshop Name <span className="text-[#D32F2F]">*</span>
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Radha Devi Handlooms & Weaver Guild"
                  className={`w-full px-3 py-2 text-xs rounded-[2px] border bg-[#FFFFFF] text-[#212121] focus:outline-none focus:ring-1 ${
                    errors.businessName ? 'border-[#D32F2F] focus:ring-[#D32F2F]' : 'border-[#D5D5D5] focus:ring-[#2874F0]'
                  }`}
                />
                {errors.businessName && <p className="text-[11px] text-[#D32F2F] mt-1">{errors.businessName}</p>}
                <p className="text-[10px] text-[#878787] mt-1">Displayed prominently on your campaign cards and product listings</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  Years of Experience in Craft <span className="text-[#D32F2F]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    max={80}
                    value={yearsOfExperience}
                    onChange={(e) => setYearsOfExperience(e.target.value)}
                    placeholder="e.g. 18"
                    className={`w-full px-3 py-2 text-xs rounded-[2px] border bg-[#FFFFFF] text-[#212121] focus:outline-none focus:ring-1 ${
                      errors.yearsOfExperience ? 'border-[#D32F2F] focus:ring-[#D32F2F]' : 'border-[#D5D5D5] focus:ring-[#2874F0]'
                    }`}
                  />
                  <span className="absolute right-3 top-2 text-xs text-[#878787]">years</span>
                </div>
                {errors.yearsOfExperience && (
                  <p className="text-[11px] text-[#D32F2F] mt-1">{errors.yearsOfExperience}</p>
                )}
                <p className="text-[10px] text-[#878787] mt-1">Demonstrates generational mastery to prospective backers</p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  Primary Craft Heritage / Technique <span className="text-[#D32F2F]">*</span>
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={craftType}
                    onChange={(e) => setCraftType(e.target.value)}
                    placeholder="e.g. Chanderi Handloom Weaving"
                    className={`flex-1 px-3 py-2 text-xs rounded-[2px] border bg-[#FFFFFF] text-[#212121] focus:outline-none focus:ring-1 ${
                      errors.craftType ? 'border-[#D32F2F] focus:ring-[#D32F2F]' : 'border-[#D5D5D5] focus:ring-[#2874F0]'
                    }`}
                  />
                </div>
                {errors.craftType && <p className="text-[11px] text-[#D32F2F] mt-1">{errors.craftType}</p>}

                {/* Popular suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-[#878787] mr-1 self-center">Popular:</span>
                  {POPULAR_CRAFTS.slice(0, 5).map((craft) => (
                    <button
                      type="button"
                      key={craft}
                      onClick={() => setCraftType(craft)}
                      className={`text-[10px] px-2 py-0.5 rounded-[2px] border transition-colors cursor-pointer ${
                        craftType === craft
                          ? 'bg-[#2874F0] text-white border-[#2874F0]'
                          : 'bg-[#F9FAFB] hover:bg-[#F1F3F6] text-[#666666] border-[#E0E0E0]'
                      }`}
                    >
                      {craft}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Photo & Story */}
          <div className="bg-[#FFFFFF] rounded-[4px] border border-[#E0E0E0] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F0F0F0]">
              <div className="w-7 h-7 rounded-full bg-[#EBF3FE] text-[#2874F0] font-bold text-xs flex items-center justify-center">
                3
              </div>
              <div>
                <h2 className="text-base font-bold text-[#212121]">Artisan Photo & Story</h2>
                <p className="text-xs text-[#878787]">
                  Presented directly on your campaign & product pages as "About the Artisan"
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Profile Photo with Cloudinary component */}
              <div>
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  Artisan / Workshop Photo <span className="text-[#D32F2F]">*</span>
                </label>
                <p className="text-xs text-[#878787] mb-2">
                  Upload a clear portrait or workshop photograph of yourself crafting. Supports Cloudinary direct upload, drag-and-drop, or preset sample selection.
                </p>
                <ImageUploadDropzone
                  id="artisan-profile-photo-dropzone"
                  label="Artisan Profile / Workshop Photo"
                  sublabel="Recommended: square or portrait photo (PNG, JPG, WebP up to 5MB)"
                  value={profilePhoto}
                  onChange={(url) => setProfilePhoto(url)}
                />
                {errors.profilePhoto && (
                  <p className="text-[11px] text-[#D32F2F] mt-1">{errors.profilePhoto}</p>
                )}
              </div>

              {/* Bio / Story */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#212121]">
                    Artisan Story / Bio (2–4 Sentences) <span className="text-[#D32F2F]">*</span>
                  </label>
                  <span className="text-[10px] text-[#878787]">
                    {bio.length} characters • {bio.split('.').filter((s) => s.trim().length > 0).length} sentences
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell your story: How did you learn your craft? What makes your traditional techniques unique? Why is community support meaningful for your workshop?"
                  className={`w-full px-3 py-2 text-xs rounded-[2px] border bg-[#FFFFFF] text-[#212121] leading-relaxed focus:outline-none focus:ring-1 ${
                    errors.bio ? 'border-[#D32F2F] focus:ring-[#D32F2F]' : 'border-[#D5D5D5] focus:ring-[#2874F0]'
                  }`}
                />
                {errors.bio && <p className="text-[11px] text-[#D32F2F] mt-1">{errors.bio}</p>}
                <div className="flex items-center justify-between mt-1 text-[10px] text-[#878787]">
                  <span>This bio is shown on backer cards, campaign stories, and marketplace product pages.</span>
                  <button
                    type="button"
                    onClick={() =>
                      setBio(
                        `Generational master artisan carrying forward the sacred heritage of ${craftType}. Committed to uncompromised handmade quality, natural local materials, and training youth apprentices.`
                      )
                    }
                    className="text-[#2874F0] hover:underline font-semibold cursor-pointer"
                  >
                    Use template draft
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Payout Details */}
          <div className="bg-[#FFFFFF] rounded-[4px] border border-[#E0E0E0] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#F0F0F0]">
              <div className="w-7 h-7 rounded-full bg-[#EBF3FE] text-[#2874F0] font-bold text-xs flex items-center justify-center">
                4
              </div>
              <div>
                <h2 className="text-base font-bold text-[#212121]">Escrow Payout Account</h2>
                <p className="text-xs text-[#878787]">Simulated bank settlement credentials for funded campaigns</p>
              </div>
            </div>

            {/* Disclaimer banner */}
            <div className="p-3.5 bg-[#FFF9E6] border border-[#FFE082] rounded-[4px] mb-4 text-xs flex items-start gap-2.5 text-[#795548]">
              <AlertCircle className="w-4 h-4 text-[#FF9800] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#E65100]">Simulation Notice:</div>
                <div className="text-[11px] text-[#6D4C41] mt-0.5 leading-relaxed">
                  For payout simulation only — no real banking integration. When your campaign achieves 100% conditional backer funding, Craftify simulates automated RTGS/NEFT settlement to this registered account.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  Account Holder Name <span className="text-[#D32F2F]">*</span>
                </label>
                <input
                  type="text"
                  value={accountHolderName}
                  onChange={(e) => setAccountHolderName(e.target.value)}
                  placeholder="e.g. Radha Devi Sharma"
                  className={`w-full px-3 py-2 text-xs rounded-[2px] border bg-[#FFFFFF] text-[#212121] focus:outline-none focus:ring-1 ${
                    errors.accountHolderName
                      ? 'border-[#D32F2F] focus:ring-[#D32F2F]'
                      : 'border-[#D5D5D5] focus:ring-[#2874F0]'
                  }`}
                />
                {errors.accountHolderName && (
                  <p className="text-[11px] text-[#D32F2F] mt-1">{errors.accountHolderName}</p>
                )}
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  Bank Account Number <span className="text-[#D32F2F]">*</span>
                </label>
                <input
                  type="password"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Account Number (9-18 digits)"
                  className={`w-full px-3 py-2 text-xs rounded-[2px] border bg-[#FFFFFF] text-[#212121] font-mono focus:outline-none focus:ring-1 ${
                    errors.accountNumber
                      ? 'border-[#D32F2F] focus:ring-[#D32F2F]'
                      : 'border-[#D5D5D5] focus:ring-[#2874F0]'
                  }`}
                />
                {errors.accountNumber && (
                  <p className="text-[11px] text-[#D32F2F] mt-1">{errors.accountNumber}</p>
                )}
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs font-bold text-[#212121] mb-1">
                  IFSC Code <span className="text-[#D32F2F]">*</span>
                </label>
                <input
                  type="text"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SBIN0001042"
                  maxLength={11}
                  className={`w-full px-3 py-2 text-xs rounded-[2px] border bg-[#FFFFFF] text-[#212121] uppercase font-mono focus:outline-none focus:ring-1 ${
                    errors.ifscCode ? 'border-[#D32F2F] focus:ring-[#D32F2F]' : 'border-[#D5D5D5] focus:ring-[#2874F0]'
                  }`}
                />
                {errors.ifscCode && <p className="text-[11px] text-[#D32F2F] mt-1">{errors.ifscCode}</p>}
              </div>
            </div>
          </div>

          {/* Submission Action Bar */}
          <div className="bg-[#FFFFFF] rounded-[4px] border border-[#E0E0E0] p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#878787]">
              By saving your artisan profile, you confirm all craft details and simulated payout details are accurate.
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onNavigate(isEditing ? 'creator-dashboard' : 'home')}
                className="flex-1 sm:flex-initial px-4 py-2.5 rounded-[2px] border border-[#D5D5D5] text-xs font-semibold text-[#212121] hover:bg-[#F1F3F6] transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="btn-submit-artisan-profile"
                disabled={isSubmitting}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-[2px] bg-[#2874F0] hover:bg-[#1259C3] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Saving...'
                    : isEditing
                    ? 'Update Artisan Profile'
                    : 'Complete Profile & Launch Hub'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
