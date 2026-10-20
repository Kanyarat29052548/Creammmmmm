import React, { useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  Bookmark,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  LogIn,
  Menu,
  X,
  FileText,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';

interface NavbarProps {
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onOpenPostModal: () => void;
  onOpenFavorites: () => void;
  onOpenAdmin: () => void;
  onOpenMyContributions: () => void;
  onOpenSetupGuide: () => void;
  favoritesCount: number;
  currentView: string;
  onNavigateHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenAuth,
  onOpenPostModal,
  onOpenFavorites,
  onOpenAdmin,
  onOpenMyContributions,
  onOpenSetupGuide,
  favoritesCount,
  currentView,
  onNavigateHome
}) => {
  const { currentUser, userProfile, isAdmin, isModerator, logout, isSuspended } = useAuth();
  const { settings } = useSite();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={onNavigateHome}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                  {settings.siteName}
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                  เพื่อการศึกษาไทย
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block truncate max-w-xs">
                {settings.siteDescription}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-3">
            <button
              onClick={onNavigateHome}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === 'home'
                  ? 'bg-sky-50 text-sky-700 font-semibold'
                  : 'text-slate-600 hover:text-sky-700 hover:bg-slate-50'
              }`}
            >
              หน้าแรก & คลังความรู้
            </button>

            {currentUser && (
              <>
                <button
                  onClick={onOpenFavorites}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentView === 'favorites'
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-600 hover:text-sky-700 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className="w-4 h-4 text-sky-600" />
                  <span>รายการโปรด</span>
                  {favoritesCount > 0 && (
                    <span className="ml-1 text-xs px-2 py-0.5 bg-sky-600 text-white rounded-full font-bold shadow-xs">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                <button
                  onClick={onOpenMyContributions}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    currentView === 'my-posts'
                      ? 'bg-sky-50 text-sky-700 font-semibold'
                      : 'text-slate-600 hover:text-sky-700 hover:bg-slate-50'
                  }`}
                >
                  <FileText className="w-4 h-4 text-sky-600" />
                  <span>สื่อของฉัน</span>
                </button>
              </>
            )}

            {/* Setup & Firebase Guide */}
            <button
              onClick={onOpenSetupGuide}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-sky-800 bg-sky-50/80 hover:bg-sky-100 border border-sky-200/70 transition-all"
              title="คู่มือการตั้งค่า Firebase Console และการทดสอบระบบ"
            >
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>คู่มือ & วิธีทดสอบ</span>
            </button>

            {/* Admin Dashboard button */}
            {isModerator && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>{isAdmin ? 'ระบบผู้ดูแล (Admin)' : 'ระบบผู้ตรวจ (Moderator)'}</span>
              </button>
            )}

            {/* Post Resource Button */}
            <button
              onClick={onOpenPostModal}
              disabled={isSuspended}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold shadow-md transition-all ${
                isSuspended
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white shadow-sky-600/20 hover:shadow-sky-600/30 active:scale-[0.98]'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>แบ่งปันสื่อความรู้</span>
            </button>

            {/* User Profile or Login */}
            {currentUser ? (
              <div className="relative ml-2">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 border border-slate-200 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                    {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-sm text-slate-800 truncate">
                        {userProfile?.displayName || currentUser.displayName || 'ผู้ใช้งาน'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            isAdmin
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : isModerator
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {isAdmin ? 'ผู้ดูแลระบบ (Admin)' : isModerator ? 'ผู้ตรวจสอบ (Moderator)' : 'สมาชิก (Member)'}
                        </span>
                        {isSuspended && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                            ถูกระงับสิทธิ์
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onOpenMyContributions();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 flex items-center gap-2.5 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-slate-500" />
                      <span>สื่อความรู้ของฉัน</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        onOpenFavorites();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-sky-50 flex items-center gap-2.5 transition-colors"
                    >
                      <Bookmark className="w-4 h-4 text-slate-500" />
                      <span>รายการโปรดที่บันทึกไว้</span>
                    </button>

                    {isModerator && (
                      <button
                        onClick={() => {
                          setIsProfileDropdownOpen(false);
                          onOpenAdmin();
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-indigo-700 hover:bg-indigo-50 flex items-center gap-2.5 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-indigo-600" />
                        <span>ระบบจัดการแอดมิน</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={async () => {
                        setIsProfileDropdownOpen(false);
                        await logout();
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-sky-700 hover:bg-sky-50 border border-sky-200 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ</span>
                </button>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="px-3.5 py-2 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-xs"
                >
                  <span>สมัครสมาชิก</span>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-sky-100 bg-white px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => {
              onNavigateHome();
              setIsMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-sky-50"
          >
            หน้าแรก & คลังความรู้
          </button>

          {currentUser ? (
            <>
              <button
                onClick={() => {
                  onOpenFavorites();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-sky-50"
              >
                <span className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-sky-600" />
                  รายการโปรด
                </span>
                {favoritesCount > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-sky-600 text-white rounded-full">
                    {favoritesCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onOpenMyContributions();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-sky-50"
              >
                <FileText className="w-4 h-4 text-sky-600" />
                สื่อของฉัน
              </button>

              {isModerator && (
                <button
                  onClick={() => {
                    onOpenAdmin();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold text-indigo-700 bg-indigo-50"
                >
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  ระบบผู้ดูแล (Admin Dashboard)
                </button>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{userProfile?.displayName}</p>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
                <button
                  onClick={async () => {
                    await logout();
                    setIsMenuOpen(false);
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200"
                >
                  ออกจากระบบ
                </button>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setIsMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-sky-700 bg-sky-50 rounded-xl border border-sky-200"
              >
                เข้าสู่ระบบ
              </button>
              <button
                onClick={() => {
                  onOpenAuth('register');
                  setIsMenuOpen(false);
                }}
                className="w-full py-2.5 text-center text-sm font-semibold text-white bg-blue-700 rounded-xl shadow-xs"
              >
                สมัครสมาชิก
              </button>
            </div>
          )}

          <button
            onClick={() => {
              onOpenSetupGuide();
              setIsMenuOpen(false);
            }}
            className="w-full py-2 text-center text-xs text-sky-800 bg-sky-50 rounded-lg border border-sky-200 flex items-center justify-center gap-1.5"
          >
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>คู่มือการตั้งค่า Firebase & วิธีทดสอบระบบ</span>
          </button>

          <button
            onClick={() => {
              onOpenPostModal();
              setIsMenuOpen(false);
            }}
            className="w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-700 to-sky-600 rounded-xl shadow-md"
          >
            <PlusCircle className="w-4 h-4" />
            <span>แบ่งปันสื่อความรู้</span>
          </button>
        </div>
      )}
    </header>
  );
};
