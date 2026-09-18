import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, ArrowRight, CheckCircle2, Hammer, ShoppingBag, ShieldAlert } from 'lucide-react';
import { SmartInput } from './common/SmartInput';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogin: (user: User) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'buyer' | 'artisan'>('buyer');
  const [craftSpecialty, setCraftSpecialty] = useState('');
  const [studioName, setStudioName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDemoLogin = async (roleChoice: 'buyer' | 'artisan' | 'potter' | 'admin') => {
    setIsLoading(true);
    setError(null);
    let username = 'arjun_mehta';
    let password = 'Demo@1234';
    let fallbackUser: User = {
      id: 'usr-buyer-seeded',
      name: 'Arjun Mehta',
      email: 'arjun.mehta@example.com',
      role: 'buyer',
      avatarInitials: 'AM',
      memberSince: 'March 2025',
      shippingAddress: {
        street: '742 Heritage Terrace, Bandra West',
        city: 'Mumbai',
        state: 'Maharashtra',
        zip: '400050',
        country: 'India',
      },
    };

    if (roleChoice === 'admin') {
      username = 'admin';
      fallbackUser = {
        id: 'usr-admin-seeded',
        name: 'Platform Administrator',
        email: 'admin@craftify.gov.in',
        role: 'admin',
        avatarInitials: 'PA',
        memberSince: 'January 2025',
        shippingAddress: {
          street: '1 Curation Plaza, MG Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          zip: '560001',
          country: 'India',
        },
      };
    } else if (roleChoice === 'potter') {
      username = 'ramesh_potter';
      fallbackUser = {
        id: 'usr-artisan-ramesh',
        name: 'Rameshwar Prajapati',
        legalName: 'Rameshwar Prajapati',
        businessName: 'Prajapati Blue Pottery Studio',
        email: 'ramesh.clay@craftify.in',
        phone: '+91 98290 12345',
        role: 'artisan',
        avatarInitials: 'RP',
        craftType: 'Jaipur Blue Pottery',
        city: 'Jaipur',
        state: 'Rajasthan',
        yearsOfExperience: 32,
        bio: 'Master artisan from Kot Jewar preserving the authentic lead-free quartz paste Egyptian technique for Jaipur Blue Pottery.',
        profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
        profileCompleted: true,
        payoutDetails: {
          accountHolderName: 'Rameshwar Prajapati',
          accountNumber: '50100293847561',
          ifscCode: 'HDFC0000184',
        },
        gstNumber: '08AAAAA0000A1Z2',
        memberSince: 'January 2025',
        shippingAddress: {
          street: '4 Pottery Lane, Kot Jewar',
          city: 'Jaipur',
          state: 'Rajasthan',
          zip: '302001',
          country: 'India',
        },
      };
    } else if (roleChoice === 'artisan') {
      username = 'ansari_weaver';
      fallbackUser = {
        id: 'usr-artisan-ansari',
        name: 'Master Shahid Ansari',
        legalName: 'Master Shahid Ansari',
        businessName: 'Ansari Heritage Loom Guild',
        email: 'shahid.ansari@craftify.in',
        phone: '+91 94150 98765',
        role: 'artisan',
        avatarInitials: 'SA',
        craftType: 'Handloom Weaving & Banarasi Brocades',
        city: 'Varanasi',
        state: 'Uttar Pradesh',
        yearsOfExperience: 28,
        bio: 'Generational master weaver from Madanpura, Varanasi. Specializing in pure zari kadwa weave Banarasi brocades and hand-drawn pen Kalamkari.',
        profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
        profileCompleted: true,
        payoutDetails: {
          accountHolderName: 'Master Shahid Ansari',
          accountNumber: '203948571029',
          ifscCode: 'SBIN0000210',
        },
        gstNumber: '09BBBBB1111B1Z3',
        memberSince: 'March 2025',
        shippingAddress: {
          street: '12 Weaver Colony, Madanpura',
          city: 'Varanasi',
          state: 'Uttar Pradesh',
          zip: '221001',
          country: 'India',
        },
      };
    }

    try {
      const res = await fetch('/api/auth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const tokenData = await res.json();
        const token = tokenData.access;
        localStorage.setItem('access_token', token);
        localStorage.setItem('kaarigar_access_token', token);

        const meRes = await fetch('/api/auth/me/', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (meRes.ok) {
          const me = await meRes.json();
          const user: User = {
            id: String(me.id || fallbackUser.id),
            name: me.full_name || me.username || fallbackUser.name,
            email: me.email || fallbackUser.email,
            role: me.role || roleChoice,
            token,
            avatarInitials: (me.first_name || me.username || 'U').slice(0, 2).toUpperCase(),
            memberSince: 'September 2026',
            craftType: me.craft_type,
            bio: me.bio,
            shippingAddress: fallbackUser.shippingAddress,
          };
          onLogin(user);
          setIsLoading(false);
          onClose();
          return;
        }
      }
    } catch {
      // Backend request failed, use fallback
    }

    setIsLoading(false);
    onLogin(fallbackUser);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please provide both username/email and password.');
      return;
    }

    if (mode === 'signup' && !name) {
      setError('Please provide your full name.');
      return;
    }

    if (mode === 'signup' && role === 'artisan' && (!craftSpecialty.trim() || !studioName.trim())) {
      setError('Artisans must provide both a Craft Specialty and Workshop/Studio Name.');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        const rawInput = email.trim();
        const usernameAttempt = rawInput.includes('@') ? rawInput.split('@')[0] : rawInput;

        // Attempt backend JWT login
        const res = await fetch('/api/auth/token/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: usernameAttempt,
            email: rawInput.includes('@') ? rawInput : '',
            password,
          }),
        }).catch(() => null);

        let userRole: UserRole = 'buyer';
        let token = '';

        if (res && res.ok) {
          const data = await res.json();
          token = data.access;
          localStorage.setItem('access_token', token);
          localStorage.setItem('kaarigar_access_token', token);

          // Fetch current user profile
          const meRes = await fetch('/api/auth/me/', {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => null);

          if (meRes && meRes.ok) {
            const meData = await meRes.json();
            userRole = meData.role || (rawInput.includes('admin') ? 'admin' : rawInput.includes('artisan') ? 'artisan' : 'buyer');
            const initials = (meData.first_name || meData.username || rawInput).slice(0, 2).toUpperCase();
            const loggedUser: User = {
              id: String(meData.id || `usr-${Date.now().toString().slice(-6)}`),
              name: meData.full_name || meData.username || rawInput,
              email: meData.email || rawInput,
              role: userRole,
              token,
              avatarInitials: initials,
              memberSince: 'September 2026',
              craftType: meData.craft_type,
              bio: meData.bio,
            };
            onLogin(loggedUser);
            setIsLoading(false);
            onClose();
            return;
          }
        } else {
          // Client fallback for development / offline credentials
          if (rawInput.toLowerCase().includes('admin')) {
            userRole = 'admin';
          } else if (rawInput.toLowerCase().includes('artisan') || rawInput.toLowerCase().includes('ansari')) {
            userRole = 'artisan';
          } else {
            userRole = 'buyer';
          }
        }

        const initials = rawInput.slice(0, 2).toUpperCase();
        const loggedUser: User = {
          id: `usr-${Date.now().toString().slice(-6)}`,
          name: rawInput.split('@')[0] || 'Craft Patron',
          email: rawInput,
          role: userRole,
          token,
          avatarInitials: initials,
          memberSince: 'September 2026',
        };

        onLogin(loggedUser);
        setIsLoading(false);
        onClose();
      } else {
        // Signup
        const res = await fetch('/api/auth/register/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: email.split('@')[0],
            email,
            password,
            name,
            role,
            craft_type: craftSpecialty,
            bio: studioName ? `Studio: ${studioName}` : '',
          }),
        }).catch(() => null);

        let token = '';
        if (res && res.ok) {
          const data = await res.json();
          token = data.access_token || data.token || '';
          if (token) localStorage.setItem('access_token', token);
        }

        const initials = name
          ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
          : email.slice(0, 2).toUpperCase();

        const isArtisan = role === 'artisan';
        const registeredUser: User = {
          id: `usr-${Date.now().toString().slice(-6)}`,
          name: name || (email.split('@')[0] ?? 'Patron'),
          legalName: isArtisan ? name : undefined,
          businessName: isArtisan ? studioName : undefined,
          email,
          role,
          craftType: craftSpecialty,
          avatarInitials: initials || 'CP',
          memberSince: 'September 2026',
          profileCompleted: isArtisan ? false : true,
          token,
          shippingAddress: {
            street: '120 Market Street, Suite 300',
            city: 'Pune',
            state: 'Maharashtra',
            zip: '411001',
            country: 'India',
          },
        };

        onLogin(registeredUser);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 bg-[#000000]/60 backdrop-blur-2xs flex items-center justify-center p-3 sm:p-4"
    >
      <div
        id="auth-modal-dialog"
        className="bg-[#FFFFFF] border border-[#EAEAEA] rounded-[4px] w-full max-w-md shadow-2xl overflow-hidden relative text-[#212121]"
      >
        {/* Blue Header Strip */}
        <div className="bg-[#2874F0] px-5 py-4 text-white relative">
          <button
            id="btn-close-auth-modal"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#FFE500]">
            Craftify Authentication & RBAC
          </div>
          <h2 className="text-xl font-bold text-white mt-0.5">
            {currentUser
              ? 'My Profile'
              : mode === 'login'
              ? 'Login to Your Account'
              : 'Sign Up with Craftify'}
          </h2>
          <p className="text-xs text-white/90 mt-0.5">
            {mode === 'login'
              ? 'Access your orders, backed campaigns, and saved wishlist.'
              : 'Register as a Craft Patron to back campaigns or an Artisan to launch projects.'}
          </p>
        </div>

        <div className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
          {/* If already logged in */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-[#F1F3F6] rounded-[4px] border border-[#EAEAEA] flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2874F0] text-[#FFFFFF] flex items-center justify-center font-bold text-sm shadow-xs">
                  {currentUser.avatarInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-[#212121] truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-xs text-[#878787] truncate">
                    {currentUser.email}
                  </div>
                  <div className="text-[11px] text-[#388E3C] uppercase tracking-wider mt-0.5 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>
                      {currentUser.role === 'admin'
                        ? 'Platform Administrator'
                        : currentUser.role === 'artisan'
                        ? 'Verified Master Artisan'
                        : 'Verified Craft Patron'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] text-[#FFFFFF] text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Continue to App
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="px-4 py-2.5 rounded-[2px] border border-[#D5D5D5] hover:bg-[#F1F3F6] text-[#212121] text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Mode Switcher Tabs */}
              <div className="flex p-0.5 rounded-[2px] border border-[#EAEAEA] mb-4 bg-[#F1F3F6]">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-[2px] text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                    mode === 'login'
                      ? 'bg-[#FFFFFF] text-[#2874F0] shadow-xs'
                      : 'text-[#878787] hover:text-[#212121]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className={`flex-1 py-1.5 rounded-[2px] text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer ${
                    mode === 'signup'
                      ? 'bg-[#FFFFFF] text-[#2874F0] shadow-xs'
                      : 'text-[#878787] hover:text-[#212121]'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {error && (
                <div className="p-2.5 rounded-[2px] bg-[#FFF3EC] border border-[#FB641B]/30 text-[#FB641B] text-xs mb-3 font-semibold">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'signup' && (
                  <>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-[#878787] absolute left-3 top-2.5 z-10" />
                        <SmartInput
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onValueChange={(val) => setName(val)}
                          placeholder="e.g., Priya Sharma"
                          className="w-full pl-9 pr-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                        />
                      </div>
                    </div>

                    {/* Role Picker: Strictly Buyer or Artisan ONLY */}
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                        Select Account Type <span className="text-[#878787] font-normal lowercase">(Admin accounts are restricted)</span>
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole('buyer')}
                          className={`p-2.5 rounded-[2px] border text-left text-xs transition-colors cursor-pointer ${
                            role === 'buyer'
                              ? 'border-[#2874F0] bg-[#EBF2FE]'
                              : 'border-[#D5D5D5] bg-[#FFFFFF] text-[#878787]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <ShoppingBag className={`w-3.5 h-3.5 ${role === 'buyer' ? 'text-[#2874F0]' : 'text-[#878787]'}`} />
                            <span className={`block font-bold ${role === 'buyer' ? 'text-[#2874F0]' : 'text-[#212121]'}`}>Buyer / Patron</span>
                          </div>
                          <span className="text-[10px] text-[#878787] block">Pledge, buy & track deliveries</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setRole('artisan')}
                          className={`p-2.5 rounded-[2px] border text-left text-xs transition-colors cursor-pointer ${
                            role === 'artisan'
                              ? 'border-[#FB641B] bg-[#FFF3EC]'
                              : 'border-[#D5D5D5] bg-[#FFFFFF] text-[#878787]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <Hammer className={`w-3.5 h-3.5 ${role === 'artisan' ? 'text-[#FB641B]' : 'text-[#878787]'}`} />
                            <span className={`block font-bold ${role === 'artisan' ? 'text-[#FB641B]' : 'text-[#212121]'}`}>Artisan / Maker</span>
                          </div>
                          <span className="text-[10px] text-[#878787] block">Launch campaigns & sell crafts</span>
                        </button>
                      </div>
                    </div>

                    {/* Extra Fields for Artisan */}
                    {role === 'artisan' && (
                      <div className="p-3 bg-[#FFFBF7] rounded-[2px] border border-[#FB641B]/20 space-y-2.5">
                        <div className="text-[11px] font-bold text-[#FB641B] uppercase tracking-wider flex items-center gap-1">
                          <Hammer className="w-3 h-3" />
                          <span>Artisan Profile Details</span>
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#555] mb-0.5">
                            Craft Specialty *
                          </label>
                          <SmartInput
                            type="text"
                            required={role === 'artisan'}
                            value={craftSpecialty}
                            onChange={(e) => setCraftSpecialty(e.target.value)}
                            onValueChange={(val) => setCraftSpecialty(val)}
                            placeholder='e.g., "Woodworking", "Pottery", "Textiles"'
                            className="w-full px-2.5 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#FB641B]"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-[#555] mb-0.5">
                            Workshop / Studio Name *
                          </label>
                          <SmartInput
                            type="text"
                            required={role === 'artisan'}
                            value={studioName}
                            onChange={(e) => setStudioName(e.target.value)}
                            onValueChange={(val) => setStudioName(val)}
                            placeholder='e.g., "Atelier Monolith" or "Channapatna Craft Collective"'
                            className="w-full px-2.5 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#FB641B]"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#878787] absolute left-3 top-2.5 z-10" />
                    <SmartInput
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onValueChange={(val) => setEmail(val)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-[#212121] font-bold mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#878787] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-1.5 rounded-[2px] border border-[#D5D5D5] bg-[#FFFFFF] text-xs text-[#212121] focus:outline-none focus:border-[#2874F0]"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 rounded-[2px] bg-[#FB641B] hover:bg-[#E85D19] disabled:opacity-50 text-[#FFFFFF] text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <span>{isLoading ? 'Processing...' : mode === 'login' ? 'Continue' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Quick Demo Identities for role-based testing */}
              <div className="mt-4 pt-3 border-t border-[#F0F0F0]">
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#878787] mb-1 flex items-center justify-between">
                  <span>Quick Demo Login (Password: Demo@1234):</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-1.5">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('buyer')}
                    className="py-1.5 px-2 rounded-[2px] border border-[#D5D5D5] bg-[#F1F3F6] hover:bg-[#E8ECF2] text-left text-[11px] text-[#212121] truncate cursor-pointer transition-colors"
                  >
                    <span className="font-bold block text-[#2874F0]">Buyer</span>
                    <span className="text-[9px] text-[#878787] truncate block">arjun_mehta</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('potter')}
                    className="py-1.5 px-2 rounded-[2px] border border-[#D5D5D5] bg-[#F1F3F6] hover:bg-[#E8ECF2] text-left text-[11px] text-[#212121] truncate cursor-pointer transition-colors"
                  >
                    <span className="font-bold block text-[#FB641B]">Artisan (Potter)</span>
                    <span className="text-[9px] text-[#878787] truncate block">ramesh_potter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('artisan')}
                    className="py-1.5 px-2 rounded-[2px] border border-[#D5D5D5] bg-[#F1F3F6] hover:bg-[#E8ECF2] text-left text-[11px] text-[#212121] truncate cursor-pointer transition-colors"
                  >
                    <span className="font-bold block text-[#FB641B]">Artisan (Weaver)</span>
                    <span className="text-[9px] text-[#878787] truncate block">ansari_weaver</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('admin')}
                    className="py-1.5 px-2 rounded-[2px] border border-[#D5D5D5] bg-[#F1F3F6] hover:bg-[#EAE8FE] text-left text-[11px] text-[#212121] truncate cursor-pointer transition-colors"
                  >
                    <span className="font-bold block text-[#5E35B1]">Admin</span>
                    <span className="text-[9px] text-[#878787] truncate block">admin</span>
                  </button>
                </div>
                <p className="text-[9px] text-[#878787] text-center">
                  Or enter any seeded username (e.g. <code>admin</code>, <code>ansari_weaver</code>, <code>ramesh_chitrakar</code>) with <code>Demo@1234</code>.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
