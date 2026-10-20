import React, { useEffect } from 'react';
import {
  X,
  ExternalLink,
  Bookmark,
  Share2,
  Flag,
  Calendar,
  User as UserIcon,
  Eye,
  Tag,
  Check,
  Download,
  AlertTriangle
} from 'lucide-react';
import { Resource } from '../types';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';

interface ResourceDetailModalProps {
  resource: Resource | null;
  onClose: () => void;
  isFavorited: boolean;
  onToggleFavorite: (resource: Resource) => void;
  onReport: (resource: Resource) => void;
}

export const ResourceDetailModal: React.FC<ResourceDetailModalProps> = ({
  resource,
  onClose,
  isFavorited,
  onToggleFavorite,
  onReport
}) => {
  const [copied, setCopied] = React.useState(false);

  // Increment view count in Firestore once per modal view
  useEffect(() => {
    if (!resource?.id) return;
    const docRef = doc(db, 'resources', resource.id);
    updateDoc(docRef, {
      viewsCount: increment(1)
    }).catch((err) => {
      // Non-critical, ignore if read-only
      console.debug('View count increment note:', err);
    });
  }, [resource?.id]);

  if (!resource) return null;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // Check if link is a YouTube URL to render an embedded player
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  const ytEmbedUrl = getYouTubeEmbedUrl(resource.link);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-3xl shadow-2xl border border-sky-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-100 text-blue-800">
              {resource.category}
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs font-medium text-slate-500">
              ประเภท: {resource.mediaType.toUpperCase()}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Info */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
              {resource.title}
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-sky-600" />
                <span>ผู้แบ่งปัน: <strong>{resource.authorName}</strong></span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-sky-600" />
                <span>วันที่ลง: {new Date(resource.createdAt).toLocaleDateString('th-TH')}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-sky-600" />
                <span>เข้าชมแล้ว: {resource.viewsCount || 0} ครั้ง</span>
              </span>
            </div>
          </div>

          {/* YouTube Video Player if applicable */}
          {ytEmbedUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-md bg-black">
              <iframe
                src={ytEmbedUrl}
                title={resource.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              รายละเอียดเนื้อหา
            </h4>
            <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 text-sm sm:text-base text-slate-700 whitespace-pre-line leading-relaxed border border-slate-100">
              {resource.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
            </div>
          </div>

          {/* Direct Link Action Card */}
          {resource.link && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-sky-900 uppercase">ลิงก์สื่อการเรียนรู้ต้นทาง</p>
                <p className="text-xs text-sky-700 truncate max-w-md">{resource.link}</p>
              </div>

              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-700/20 transition-all flex items-center justify-center gap-2"
              >
                <span>เปิดดูสื่อ / ดาวน์โหลด</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          )}

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-sky-600" />
                คำค้นหาที่เกี่ยวข้อง (Tags)
              </h4>
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium bg-sky-50 text-sky-700 px-3 py-1 rounded-lg border border-sky-100"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(resource)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                isFavorited
                  ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
              <span>{isFavorited ? 'บันทึกแล้ว' : 'บันทึกลงรายการโปรด'}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-500" />}
              <span>{copied ? 'คัดลอกลิงก์แล้ว!' : 'แชร์'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onReport(resource)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>รายงานสื่อนี้</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200/50 transition-colors"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
