/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  doc,
  deleteDoc,
  setDoc,
  where,
  getDocs,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { db, testConnection, handleFirestoreError, OperationType } from './firebase';
import { Resource, FavoriteItem, ToastMessage } from './types';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SiteProvider, useSite } from './context/SiteContext';

// Components
import { Navbar } from './components/Navbar';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { Breadcrumbs } from './components/Breadcrumbs';
import { SearchFilterBar, FilterState } from './components/SearchFilterBar';
import { ResourceCard } from './components/ResourceCard';
import { ResourceDetailModal } from './components/ResourceDetailModal';
import { PostResourceModal } from './components/PostResourceModal';
import { AuthModal } from './components/AuthModal';
import { ReportModal } from './components/ReportModal';
import { AdminDashboard } from './components/AdminDashboard';
import { FavoritesView } from './components/FavoritesView';
import { MyContributionsView } from './components/MyContributionsView';
import { EmptyState } from './components/EmptyState';
import { SetupGuideModal } from './components/SetupGuideModal';
import { ToastContainer } from './components/Toast';

import {
  BookOpen,
  Sparkles,
  HelpCircle,
  GraduationCap,
  Layers,
  HeartHandshake,
  CheckCircle,
  ExternalLink,
  ChevronUp
} from 'lucide-react';

// Seed starter data for initial rich experience if database is brand new
const INITIAL_STARTER_RESOURCES: Omit<Resource, 'id'>[] = [
  {
    title: 'สรุปสูตรคณิตศาสตร์ ม.ปลาย (ม.4 - ม.6) ฉบับเตรียมสอบเข้ามหาวิทยาลัย',
    description: 'รวบรวมสูตรคณิตศาสตร์ ม.ปลาย ทั้งตรีโกณมิติ แคลคูลัส ความน่าจะเป็น สถิติ และเรขาคณิตวิเคราะห์ พร้อมตัวอย่างโจทย์ประยุกต์และเทคนิคการตัดช้อยส์',
    category: 'คณิตศาสตร์',
    educationLevel: 'secondary_high',
    mediaType: 'pdf',
    link: 'https://www.sc.mahidol.ac.th',
    tags: ['คณิตศาสตร์', 'ม.ปลาย', 'สรุปสูตร', 'สอบเข้ามหาลัย', 'TCAS'],
    authorId: 'system_admin',
    authorName: 'ครูสมปอง คณิตศาสตร์',
    authorEmail: 's6710380102@pkru.ac.th',
    isPublished: true,
    isHiddenByAdmin: false,
    viewsCount: 142,
    favoritesCount: 28,
    reportCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    title: 'หลักการเขียนโปรแกรม Python เบื้องต้น สำหรับนักเรียนและครูผู้สอน',
    description: 'คลิปบรรยายพร้อมเอกสารประกอบการสอนภาษา Python ตั้งแต่พื้นฐานตัวแปร, Loop, Functions จนถึงการเขียนโปรแกรมคำนวณทางวิทยาศาสตร์ เหมาะสำหรับรายวิชาวิทยาการคำนวณ',
    category: 'คอมพิวเตอร์และเทคโนโลยี',
    educationLevel: 'all',
    mediaType: 'video',
    link: 'https://www.youtube.com/watch?v=kqtD5dpn9C8',
    tags: ['Python', 'วิทยาการคำนวณ', 'เขียนโปรแกรม', 'Coding', 'คอมพิวเตอร์'],
    authorId: 'system_admin',
    authorName: 'อ.ดร. ธีรภัทร คอมพิวเตอร์',
    authorEmail: 's6710380102@pkru.ac.th',
    isPublished: true,
    isHiddenByAdmin: false,
    viewsCount: 265,
    favoritesCount: 45,
    reportCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    title: 'สรุปไวยากรณ์ภาษาอังกฤษ Essential English Grammar & Tenses',
    description: 'สรุปการใช้งาน 12 Tenses สำคัญ เทคนิคการจำ กริยา 3 ช่อง และการประยุกต์ใช้ในการทำข้อสอบภาษาอังกฤษและใช้สื่อสารในชีวิตประจำวัน',
    category: 'ภาษาต่างประเทศ',
    educationLevel: 'secondary_low',
    mediaType: 'slides',
    link: 'https://www.chula.ac.th',
    tags: ['ภาษาอังกฤษ', 'Grammar', 'Tenses', 'ภาษาต่างประเทศ', 'ติวอังกฤษ'],
    authorId: 'system_admin',
    authorName: 'ครูแนน ภาษาอังกฤษ',
    authorEmail: 's6710380102@pkru.ac.th',
    isPublished: true,
    isHiddenByAdmin: false,
    viewsCount: 98,
    favoritesCount: 19,
    reportCount: 0,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    title: 'ชีววิทยา: โครงสร้างเซลล์และกลไกการสังเคราะห์ด้วยแสง',
    description: 'ชุดภาพอินโฟกราฟิกและบทความอธิบายการทำงานของเซลล์พืช คลอโรพลาสต์ และปฏิกิริยาแสง พร้อมข้อสอบท้ายบทเรียนพร้อมเฉลยละเอียด',
    category: 'วิทยาศาสตร์และฟิสิกส์',
    educationLevel: 'secondary_high',
    mediaType: 'website',
    link: 'https://www.scimath.org',
    tags: ['ชีววิทยา', 'เซลล์', 'สังเคราะห์แสง', 'วิทยาศาสตร์', 'สสวท'],
    authorId: 'system_admin',
    authorName: 'กลุ่มสาระวิทยาศาสตร์',
    authorEmail: 's6710380102@pkru.ac.th',
    isPublished: true,
    isHiddenByAdmin: false,
    viewsCount: 84,
    favoritesCount: 15,
    reportCount: 0,
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

function MainApp() {
  const { currentUser, isModerator } = useAuth();
  const { settings } = useSite();

  // Navigation views: 'home' | 'favorites' | 'my-posts'
  const [currentView, setCurrentView] = useState<'home' | 'favorites' | 'my-posts'>('home');

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    educationLevel: 'all',
    mediaType: 'all',
    sortBy: 'latest'
  });

  // Resources state
  const [resources, setResources] = useState<Resource[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(true);

  // Favorites state
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  // Modals state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');
  const [postModalOpen, setPostModalOpen] = useState(false);
  const [resourceToEdit, setResourceToEdit] = useState<Resource | null>(null);
  const [detailResource, setDetailResource] = useState<Resource | null>(null);
  const [reportResource, setReportResource] = useState<Resource | null>(null);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [setupGuideOpen, setSetupGuideOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, description?: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts((prev) => [...prev, { id, type, title, description }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Initial Connection test & Resources Real-time Subscription
  useEffect(() => {
    testConnection();

    const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: Resource[] = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as Resource)
        );

        // If collection is completely empty, automatically seed curated starter resources
        if (loaded.length === 0 && !snapshot.metadata.hasPendingWrites) {
          console.log('Seeding initial starter resources into Cloud Firestore...');
          INITIAL_STARTER_RESOURCES.forEach((item) => {
            addDoc(collection(db, 'resources'), item).catch((e) =>
              console.warn('Initial seed note:', e)
            );
          });
        }

        setResources(loaded);
        setResourcesLoading(false);
      },
      (error) => {
        console.error('Error fetching resources:', error);
        setResourcesLoading(false);
        try {
          handleFirestoreError(error, OperationType.LIST, 'resources');
        } catch (e) {
          // Keep resilient
        }
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Favorites Real-time Subscription for logged-in user
  useEffect(() => {
    if (!currentUser) {
      setFavorites([]);
      return;
    }

    setFavoritesLoading(true);
    const favQuery = query(
      collection(db, 'favorites'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(
      favQuery,
      (snapshot) => {
        const items: FavoriteItem[] = snapshot.docs.map(
          (d) => ({ id: d.id, ...d.data() } as FavoriteItem)
        );
        setFavorites(items);
        setFavoritesLoading(false);
      },
      (error) => {
        console.warn('Favorites listener error:', error);
        setFavoritesLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Set of favorited resource IDs for fast lookup
  const favoritesSet = useMemo(() => {
    return new Set(favorites.map((f) => f.resourceId));
  }, [favorites]);

  // Favorite toggle handler with real Firestore sync per UID
  const handleToggleFavorite = async (resource: Resource) => {
    if (!currentUser) {
      setAuthInitialTab('login');
      setAuthModalOpen(true);
      addToast('info', 'กรุณาเข้าสู่ระบบก่อน', 'คุณต้องมีบัญชีก่อนจึงจะสามารถบันทึกรายการโปรดได้');
      return;
    }

    const isFav = favoritesSet.has(resource.id);
    const favDocId = `${currentUser.uid}_${resource.id}`;
    const favDocRef = doc(db, 'favorites', favDocId);
    const resourceRef = doc(db, 'resources', resource.id);

    try {
      if (isFav) {
        // Remove from favorites
        await deleteDoc(favDocRef);
        // decrement count optimistically
        setDoc(
          resourceRef,
          {
            favoritesCount: Math.max(0, (resource.favoritesCount || 1) - 1),
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        ).catch(() => {});
        addToast('info', 'นำออกจากรายการโปรดแล้ว');
      } else {
        // Add to favorites
        const newFav: Omit<FavoriteItem, 'id'> = {
          userId: currentUser.uid,
          resourceId: resource.id,
          resourceTitle: resource.title,
          resourceCategory: resource.category,
          createdAt: new Date().toISOString()
        };
        await setDoc(favDocRef, newFav);
        // increment count
        setDoc(
          resourceRef,
          {
            favoritesCount: (resource.favoritesCount || 0) + 1,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        ).catch(() => {});
        addToast('success', 'บันทึกลงรายการโปรดแล้ว!', 'สามารถเปิดดูย้อนหลังได้ในเมนูรายการโปรด');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      addToast('error', 'เกิดข้อผิดพลาดในการบันทึกรายการโปรด กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Delete Resource handler
  const handleDeleteResource = async (resource: Resource) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสื่อ "${resource.title}"?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'resources', resource.id));
      addToast('success', 'ลบสื่อการเรียนรู้เรียบร้อยแล้ว');
      if (detailResource?.id === resource.id) {
        setDetailResource(null);
      }
    } catch (err) {
      addToast('error', 'ไม่สามารถลบสื่อได้ กรุณาตรวจสอบสิทธิ์ของคุณ');
    }
  };

  // Filter & Sort logic
  const filteredResources = useMemo(() => {
    return resources
      .filter((r) => {
        // Hide hidden resources from public non-moderator users
        if (r.isHiddenByAdmin && !isModerator && r.authorId !== currentUser?.uid) {
          return false;
        }

        // Search query
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = r.title.toLowerCase().includes(q);
          const matchDesc = r.description?.toLowerCase().includes(q);
          const matchCategory = r.category.toLowerCase().includes(q);
          const matchAuthor = r.authorName?.toLowerCase().includes(q);
          const matchTags = r.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCategory && !matchAuthor && !matchTags) {
            return false;
          }
        }

        // Category filter
        if (filters.category !== 'all' && r.category !== filters.category) {
          return false;
        }

        // Education level filter
        if (filters.educationLevel !== 'all' && r.educationLevel !== filters.educationLevel) {
          return false;
        }

        // Media type filter
        if (filters.mediaType !== 'all' && r.mediaType !== filters.mediaType) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'views') {
          return (b.viewsCount || 0) - (a.viewsCount || 0);
        }
        if (filters.sortBy === 'favorites') {
          return (b.favoritesCount || 0) - (a.favoritesCount || 0);
        }
        // latest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [resources, filters, isModerator, currentUser]);

  // User's favorited resource objects
  const userFavoriteResources = useMemo(() => {
    return resources.filter((r) => favoritesSet.has(r.id));
  }, [resources, favoritesSet]);

  // User's contributed resources
  const userContributedResources = useMemo(() => {
    if (!currentUser) return [];
    return resources.filter((r) => r.authorId === currentUser.uid);
  }, [resources, currentUser]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-sky-200 selection:text-sky-900 font-['Prompt',sans-serif]">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Dynamic Announcement Banner */}
      <AnnouncementBanner />

      {/* Main Navbar */}
      <Navbar
        onOpenAuth={(tab) => {
          setAuthInitialTab(tab || 'login');
          setAuthModalOpen(true);
        }}
        onOpenPostModal={() => {
          if (!currentUser) {
            setAuthInitialTab('login');
            setAuthModalOpen(true);
            addToast('info', 'กรุณาเข้าสู่ระบบก่อนแบ่งปันสื่อ');
            return;
          }
          setResourceToEdit(null);
          setPostModalOpen(true);
        }}
        onOpenFavorites={() => setCurrentView('favorites')}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenMyContributions={() => setCurrentView('my-posts')}
        onOpenSetupGuide={() => setSetupGuideOpen(true)}
        favoritesCount={favorites.length}
        currentView={currentView}
        onNavigateHome={() => setCurrentView('home')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Breadcrumb Path */}
        <Breadcrumbs
          items={[
            { label: 'หน้าหลัก', onClick: () => setCurrentView('home'), active: currentView === 'home' },
            ...(currentView === 'favorites'
              ? [{ label: 'รายการโปรดที่บันทึกไว้', active: true }]
              : currentView === 'my-posts'
              ? [{ label: 'สื่อการเรียนรู้ของฉัน', active: true }]
              : filters.category !== 'all'
              ? [{ label: filters.category, active: true }]
              : [])
          ]}
        />

        {/* VIEW 1: HOME (BROWSE & SEARCH) */}
        {currentView === 'home' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <SearchFilterBar
              filters={filters}
              onFilterChange={setFilters}
              totalResults={filteredResources.length}
            />

            {/* Results Grid / Loading / Empty */}
            {resourcesLoading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-semibold text-slate-600">กำลังเชื่อมต่อคลังความรู้...</p>
              </div>
            ) : filteredResources.length === 0 ? (
              <EmptyState
                type="search"
                actionText="เพิ่มสื่อการเรียนรู้เรื่องนี้"
                onAction={() => {
                  if (!currentUser) {
                    setAuthInitialTab('login');
                    setAuthModalOpen(true);
                  } else {
                    setResourceToEdit(null);
                    setPostModalOpen(true);
                  }
                }}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredResources.map((resource) => (
                  <ResourceCard
                    key={resource.id}
                    resource={resource}
                    isFavorited={favoritesSet.has(resource.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onViewDetail={(r) => setDetailResource(r)}
                    onReport={(r) => {
                      if (!currentUser) {
                        setAuthInitialTab('login');
                        setAuthModalOpen(true);
                        addToast('info', 'กรุณาเข้าสู่ระบบก่อนส่งรายงาน');
                        return;
                      }
                      setReportResource(r);
                    }}
                    onEdit={(r) => {
                      setResourceToEdit(r);
                      setPostModalOpen(true);
                    }}
                    onDelete={handleDeleteResource}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: FAVORITES */}
        {currentView === 'favorites' && (
          <FavoritesView
            favoriteResources={userFavoriteResources}
            loading={favoritesLoading}
            onBack={() => setCurrentView('home')}
            onToggleFavorite={handleToggleFavorite}
            onViewDetail={(r) => setDetailResource(r)}
            onReport={(r) => setReportResource(r)}
            onExplore={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 3: MY CONTRIBUTIONS */}
        {currentView === 'my-posts' && (
          <MyContributionsView
            myResources={userContributedResources}
            loading={resourcesLoading}
            onBack={() => setCurrentView('home')}
            onOpenPostModal={() => {
              setResourceToEdit(null);
              setPostModalOpen(true);
            }}
            onEditResource={(r) => {
              setResourceToEdit(r);
              setPostModalOpen(true);
            }}
            onDeleteResource={handleDeleteResource}
            onViewDetail={(r) => setDetailResource(r)}
            onToggleFavorite={handleToggleFavorite}
            onReport={(r) => setReportResource(r)}
            favoritesSet={favoritesSet}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-sky-100 py-10 mt-12 text-slate-600 text-xs sm:text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-700 flex items-center justify-center text-white">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-slate-900 text-base">{settings.siteName}</span>
                <p className="text-xs text-slate-500">
                  แพลตฟอร์มแบ่งปันความรู้และสื่อการศึกษาเพื่อเด็กไทยและสังคมการเรียนรู้
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500">
              <button
                onClick={() => setSetupGuideOpen(true)}
                className="hover:text-blue-700 transition-colors flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>คู่มือ & วิธีทดสอบระบบ</span>
              </button>
              <span>•</span>
              <button
                onClick={() => setCurrentView('home')}
                className="hover:text-blue-700 transition-colors"
              >
                คลังความรู้ทั้งหมด
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
            <p>© 2026 {settings.siteName}. ขับเคลื่อนด้วย Firebase Firestore & Authentication</p>
            <p className="flex items-center gap-1">
              <span>พัฒนาเพื่อการศึกษาไทย สำหรับนักเรียน นักศึกษา และครูอาจารย์</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authInitialTab}
        onSuccess={(msg) => addToast('success', msg)}
      />

      <PostResourceModal
        isOpen={postModalOpen}
        onClose={() => {
          setPostModalOpen(false);
          setResourceToEdit(null);
        }}
        resourceToEdit={resourceToEdit}
        onSuccess={(msg) => addToast('success', msg)}
        onError={(err) => addToast('error', 'ข้อผิดพลาด', err)}
      />

      <ResourceDetailModal
        resource={detailResource}
        onClose={() => setDetailResource(null)}
        isFavorited={detailResource ? favoritesSet.has(detailResource.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onReport={(r) => {
          setDetailResource(null);
          setReportResource(r);
        }}
      />

      <ReportModal
        resource={reportResource}
        onClose={() => setReportResource(null)}
        onSuccess={(msg) => addToast('success', msg)}
        onError={(err) => addToast('error', 'ข้อผิดพลาด', err)}
      />

      <AdminDashboard
        isOpen={adminModalOpen}
        onClose={() => setAdminModalOpen(false)}
        onSuccess={(msg) => addToast('success', msg)}
        onError={(err) => addToast('error', 'ข้อผิดพลาด', err)}
      />

      <SetupGuideModal
        isOpen={setupGuideOpen}
        onClose={() => setSetupGuideOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SiteProvider>
        <MainApp />
      </SiteProvider>
    </AuthProvider>
  );
}
