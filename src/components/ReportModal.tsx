import React, { useState } from 'react';
import { X, Flag, AlertTriangle, Loader2 } from 'lucide-react';
import { Resource } from '../types';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

interface ReportModalProps {
  resource: Resource | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (errorMsg: string) => void;
}

const REPORT_REASONS = [
  { id: 'broken_link', label: '🔗 ลิงก์เสีย / ไม่สามารถเข้าถึงไฟล์หรือเว็บไซต์ได้' },
  { id: 'copyright', label: '©️ ละเมิดลิขสิทธิ์ / นำผลงานผู้อื่นมาลงโดยไม่ได้รับอนุญาต' },
  { id: 'inappropriate', label: '⚠️ เนื้อหาไม่เหมาะสม / หยาบคาย / สื่อลามกอนาจาร' },
  { id: 'misinformation', label: '❌ ข้อมูลบิดเบือน / เนื้อหาการเรียนรู้ไม่ถูกต้องอย่างร้ายแรง' },
  { id: 'other', label: '💬 เหตุผลอื่นๆ' }
];

export const ReportModal: React.FC<ReportModalProps> = ({
  resource,
  onClose,
  onSuccess,
  onError
}) => {
  const { currentUser } = useAuth();
  const [reason, setReason] = useState<string>('broken_link');
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  if (!resource) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onError('กรุณาเข้าสู่ระบบก่อนทำการรายงานเนื้อหา');
      return;
    }

    setLoading(true);

    try {
      const reportData = {
        resourceId: resource.id,
        resourceTitle: resource.title,
        reporterId: currentUser.uid,
        reporterEmail: currentUser.email || 'anonymous',
        reason,
        details: details.trim(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'reports'), reportData);

      // Increment report count on the resource
      try {
        const resourceRef = doc(db, 'resources', resource.id);
        await updateDoc(resourceRef, {
          reportCount: increment(1)
        });
      } catch (err) {
        console.warn('Could not update reportCount on resource:', err);
      }

      onSuccess('ส่งรายงานเรียบร้อยแล้ว ขอบคุณที่ช่วยดูแลความปลอดภัยของชุมชนการศึกษา');
      onClose();
    } catch (err) {
      console.error('Error reporting resource:', err);
      try {
        handleFirestoreError(err, OperationType.CREATE, 'reports');
      } catch (e) {
        onError('เกิดข้อผิดพลาดในการส่งรายงาน กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-2 text-rose-700">
            <Flag className="w-5 h-5" />
            <h3 className="font-bold text-base">รายงานเนื้อหาที่ไม่เหมาะสม</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-xs text-slate-500 font-medium">เรื่องที่รายงาน:</p>
            <p className="text-sm font-bold text-slate-800 line-clamp-1 mt-0.5">{resource.title}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              โปรดระบุสาเหตุที่รายงาน <span className="text-rose-500">*</span>
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                    reason === item.id
                      ? 'bg-rose-50 border-rose-300 text-rose-900 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={item.id}
                    checked={reason === item.id}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-rose-600 focus:ring-rose-500"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              รายละเอียดเพิ่มเติม
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="ระบุข้อเท็จจริง เช่น ลิงก์เสียตรงไหน หรือเหตุผลที่ทำให้ไม่ถูกต้อง..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-rose-600/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังส่งข้อมูล...</span>
                </>
              ) : (
                <span>ยืนยันการรายงาน</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
