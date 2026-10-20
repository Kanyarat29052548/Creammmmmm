import React, { useState, useEffect } from 'react';
import { X, Upload, Link as LinkIcon, AlertCircle, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { Resource, MediaType } from '../types';
import { useAuth } from '../context/AuthContext';
import { useSite } from '../context/SiteContext';
import { EDUCATION_LEVELS, MEDIA_TYPES } from './SearchFilterBar';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface PostResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  resourceToEdit?: Resource | null;
  onSuccess: (message: string) => void;
  onError: (errorMsg: string) => void;
}

export const PostResourceModal: React.FC<PostResourceModalProps> = ({
  isOpen,
  onClose,
  resourceToEdit,
  onSuccess,
  onError
}) => {
  const { currentUser, userProfile, isSuspended } = useAuth();
  const { settings } = useSite();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [educationLevel, setEducationLevel] = useState('all');
  const [mediaType, setMediaType] = useState<MediaType>('website');
  const [link, setLink] = useState('');
  const [rawTags, setRawTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Populate data if editing
  useEffect(() => {
    if (resourceToEdit) {
      setTitle(resourceToEdit.title || '');
      setDescription(resourceToEdit.description || '');
      setCategory(resourceToEdit.category || (settings.categories[0] || ''));
      setEducationLevel(resourceToEdit.educationLevel || 'all');
      setMediaType(resourceToEdit.mediaType || 'website');
      setLink(resourceToEdit.link || '');
      setRawTags(resourceToEdit.tags ? resourceToEdit.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setCategory(settings.categories[0] || 'คอมพิวเตอร์และเทคโนโลยี');
      setEducationLevel('all');
      setMediaType('website');
      setLink('');
      setRawTags('');
    }
    setValidationError('');
  }, [resourceToEdit, isOpen, settings.categories]);

  if (!isOpen) return null;

  if (isSuspended) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900">บัญชีของคุณถูกระงับสิทธิ์</h3>
          <p className="text-sm text-slate-600">
            ขออภัย คุณไม่สามารถแบ่งปันหรือแก้ไขสื่อความรู้ได้เนื่องจากบัญชีถูกระงับโดยผู้ดูแลระบบ
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl"
          >
            ปิด
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // Validation checks
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setValidationError('กรุณากรอกชื่อเรื่องหรือชื่อสื่อความรู้');
      return;
    }
    if (trimmedTitle.length < 3) {
      setValidationError('ชื่อสื่อต้องมีความยาวอย่างน้อย 3 ตัวอักษร');
      return;
    }

    const trimmedLink = link.trim();
    if (!trimmedLink) {
      setValidationError('กรุณาระบุลิงก์สื่อ เช่น เว็บไซต์, Google Drive, YouTube หรือเอกสาร PDF');
      return;
    }

    // Process tags
    const tagsArray = rawTags
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0)
      .slice(0, 8); // bounded list

    setLoading(true);

    try {
      if (resourceToEdit) {
        // Update existing resource
        const docRef = doc(db, 'resources', resourceToEdit.id);
        const updatePayload = {
          title: trimmedTitle,
          description: description.trim(),
          category,
          educationLevel,
          mediaType,
          link: trimmedLink,
          tags: tagsArray,
          updatedAt: new Date().toISOString()
        };
        await updateDoc(docRef, updatePayload);
        onSuccess('อัปเดตข้อมูลสื่อการเรียนรู้เรียบร้อยแล้ว!');
      } else {
        // Create new resource in Firestore
        const newResource = {
          title: trimmedTitle,
          description: description.trim(),
          category: category || (settings.categories[0] || 'ทั่วไป'),
          educationLevel,
          mediaType,
          link: trimmedLink,
          tags: tagsArray,
          authorId: currentUser?.uid || 'guest',
          authorName: userProfile?.displayName || currentUser?.displayName || 'ครูผู้แบ่งปัน',
          authorEmail: currentUser?.email || '',
          isPublished: true,
          isHiddenByAdmin: false,
          viewsCount: 0,
          favoritesCount: 0,
          reportCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await addDoc(collection(db, 'resources'), newResource);
        onSuccess('เผยแพร่สื่อความรู้สู่คลังเรียบร้อยแล้ว ขอบคุณที่ร่วมแบ่งปัน!');
      }
      onClose();
    } catch (err) {
      console.error('Error saving resource to Firestore:', err);
      try {
        handleFirestoreError(
          err,
          resourceToEdit ? OperationType.UPDATE : OperationType.CREATE,
          resourceToEdit ? `resources/${resourceToEdit.id}` : 'resources'
        );
      } catch (e: any) {
        onError('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาตรวจสอบสิทธิ์การใช้งานหรือลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white rounded-3xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-sky-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {resourceToEdit ? 'แก้ไขสื่อความรู้' : 'แบ่งปันสื่อการเรียนรู้ใหม่'}
              </h2>
              <p className="text-xs text-slate-500">
                ร่วมสร้างคลังความรู้เปิดสำหรับครูและนักเรียนไทย
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {validationError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              ชื่อสื่อ / หัวข้อความรู้ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น สรุปสูตรตรีโกณมิติ ม.5, คู่มือเขียนโปรแกรม Python สำหรับผู้เริ่มต้น"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium"
            />
          </div>

          {/* Category & Education Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                หมวดหมู่วิชา <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
              >
                {settings.categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ระดับชั้นเป้าหมาย
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
              >
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Media Type & Link */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ประเภทสื่อ <span className="text-rose-500">*</span>
              </label>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as MediaType)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-slate-700"
              >
                {MEDIA_TYPES.filter((m) => m.id !== 'all').map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ลิงก์สื่อการเรียนรู้ / ลิงก์ไฟล์ (URL) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  required
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://drive.google.com/..., https://youtu.be/... หรือ https://..."
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              คำอธิบายรายละเอียด / แนะนำสื่อ
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="อธิบายสรุปสาระสำคัญของสื่อ เช่น มีเนื้อหาเกี่ยวกับอะไร เหมาะสำหรับอ่านสอบบทไหน มีเฉลยหรือไม่..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              คำค้นหา (Tags) <span className="text-slate-400 font-normal">(คั่นด้วยเครื่องหมายจุลภาค ,)</span>
            </label>
            <input
              type="text"
              value={rawTags}
              onChange={(e) => setRawTags(e.target.value)}
              placeholder="คณิตศาสตร์, ม.5, สรุปสอบ, ตรีโกณมิติ"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังบันทึกข้อมูล...</span>
              </>
            ) : (
              <span>{resourceToEdit ? 'บันทึกการแก้ไข' : 'เผยแพร่สู่คลังความรู้'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
