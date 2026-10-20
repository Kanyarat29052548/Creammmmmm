import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { SiteSettings } from '../types';

const DEFAULT_CATEGORIES = [
  'คอมพิวเตอร์และเทคโนโลยี',
  'คณิตศาสตร์',
  'วิทยาศาสตร์และฟิสิกส์',
  'ภาษาต่างประเทศ',
  'ภาษาไทยและวรรณคดี',
  'สังคมศึกษาและประวัติศาสตร์',
  'ศิลปะและการออกแบบ',
  'การพัฒนาตนเองและอาชีพ',
  'คอร์สและแนวข้อสอบ'
];

const DEFAULT_SETTINGS: SiteSettings = {
  siteName: 'EduShare Thailand',
  siteDescription: 'คลังปัญญาและแหล่งแบ่งปันสื่อการเรียนรู้สำหรับนักเรียน นิสิต นักศึกษา และคุณครูอาจารย์',
  announcement: 'ยินดีต้อนรับสู่ EduShare Thailand แพลตฟอร์มแบ่งปันความรู้เพื่อการศึกษาไทย ร่วมโพสต์สื่อการสอนได้แล้ววันนี้!',
  isAnnouncementActive: true,
  categories: DEFAULT_CATEGORIES,
  updatedAt: new Date().toISOString(),
  updatedBy: 'system'
};

interface SiteContextType {
  settings: SiteSettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<SiteSettings>, updatedBy: string) => Promise<void>;
  addCategory: (categoryName: string, updatedBy: string) => Promise<void>;
  removeCategory: (categoryName: string, updatedBy: string) => Promise<void>;
}

const SiteContext = createContext<SiteContextType>({
  settings: DEFAULT_SETTINGS,
  loading: true,
  updateSettings: async () => {},
  addCategory: async () => {},
  removeCategory: async () => {}
});

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, 'settings', 'general');
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteSettings;
          setSettings({
            ...DEFAULT_SETTINGS,
            ...data,
            categories: data.categories && data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES
          });
        } else {
          // Document doesn't exist yet, keep default in memory (or let admin seed it on first save)
          setSettings(DEFAULT_SETTINGS);
        }
        setLoading(false);
      },
      (error) => {
        console.warn('Error reading settings from Firestore, using default:', error);
        setSettings(DEFAULT_SETTINGS);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>, updatedBy: string) => {
    const docRef = doc(db, 'settings', 'general');
    const updatedData = {
      ...settings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
      updatedBy
    };
    try {
      await setDoc(docRef, updatedData, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/general');
    }
  };

  const addCategory = async (categoryName: string, updatedBy: string) => {
    const trimmed = categoryName.trim();
    if (!trimmed || settings.categories.includes(trimmed)) return;
    const newCategories = [...settings.categories, trimmed];
    await updateSettings({ categories: newCategories }, updatedBy);
  };

  const removeCategory = async (categoryName: string, updatedBy: string) => {
    const newCategories = settings.categories.filter((c) => c !== categoryName);
    await updateSettings({ categories: newCategories }, updatedBy);
  };

  return (
    <SiteContext.Provider value={{ settings, loading, updateSettings, addCategory, removeCategory }}>
      {children}
    </SiteContext.Provider>
  );
};

export const useSite = () => useContext(SiteContext);
