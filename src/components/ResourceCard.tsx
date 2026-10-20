import React from 'react';
import {
  FileText,
  Video,
  Globe,
  Presentation,
  GraduationCap,
  Folder,
  Eye,
  Bookmark,
  Share2,
  Flag,
  Calendar,
  User as UserIcon,
  ExternalLink,
  Edit,
  Trash2,
  EyeOff
} from 'lucide-react';
import { Resource, MediaType } from '../types';
import { useAuth } from '../context/AuthContext';

interface ResourceCardProps {
  resource: Resource;
  isFavorited: boolean;
  onToggleFavorite: (resource: Resource) => void;
  onViewDetail: (resource: Resource) => void;
  onReport: (resource: Resource) => void;
  onEdit?: (resource: Resource) => void;
  onDelete?: (resource: Resource) => void;
}

const getMediaIcon = (type: MediaType) => {
  switch (type) {
    case 'pdf':
      return <FileText className="w-4 h-4 text-rose-500" />;
    case 'video':
      return <Video className="w-4 h-4 text-red-500" />;
    case 'website':
      return <Globe className="w-4 h-4 text-emerald-500" />;
    case 'slides':
      return <Presentation className="w-4 h-4 text-amber-500" />;
    case 'course':
      return <GraduationCap className="w-4 h-4 text-blue-500" />;
    default:
      return <Folder className="w-4 h-4 text-sky-500" />;
  }
};

const getMediaLabel = (type: MediaType) => {
  switch (type) {
    case 'pdf':
      return 'PDF / เอกสาร';
    case 'video':
      return 'วิดีโอ / คลิปสอน';
    case 'website':
      return 'เว็บไซต์ / บทความ';
    case 'slides':
      return 'สไลด์นำเสนอ';
    case 'course':
      return 'คอร์ส / ข้อสอบ';
    default:
      return 'สื่อการสอน';
  }
};

const getEducationLevelLabel = (level: string) => {
  switch (level) {
    case 'primary':
      return 'ประถมศึกษา';
    case 'secondary_low':
      return 'ม.ต้น';
    case 'secondary_high':
      return 'ม.ปลาย';
    case 'university':
      return 'มหาวิทยาลัย';
    case 'general':
      return 'ทั่วไป / ครูอาจารย์';
    default:
      return 'ทุกระดับชั้น';
  }
};

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  isFavorited,
  onToggleFavorite,
  onViewDetail,
  onReport,
  onEdit,
  onDelete
}) => {
  const { currentUser, isModerator } = useAuth();
  const isAuthor = currentUser?.uid === resource.authorId;
  const canManage = isAuthor || isModerator;

  // Format date in Thai
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'เร็วๆ นี้';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('th-TH', {
        day: 'numeric',
        month: 'short',
        year: '2-digit'
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      className={`group bg-white rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-1 ${
        resource.isHiddenByAdmin
          ? 'border-rose-300 bg-rose-50/20'
          : 'border-slate-100 hover:border-sky-300'
      }`}
    >
      {/* Top Banner & Tags */}
      <div className="p-5 pb-3">
        {resource.isHiddenByAdmin && (
          <div className="mb-3 px-3 py-1 bg-rose-100 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-1.5">
            <EyeOff className="w-3.5 h-3.5" />
            <span>สื่อนี้ถูกซ่อนโดยผู้ดูแลระบบ</span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Media Type pill */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            {getMediaIcon(resource.mediaType)}
            <span>{getMediaLabel(resource.mediaType)}</span>
          </div>

          {/* Education Level pill */}
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-100">
            {getEducationLevelLabel(resource.educationLevel)}
          </span>
        </div>

        {/* Title */}
        <h3
          onClick={() => onViewDetail(resource)}
          className="font-bold text-base sm:text-lg text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 cursor-pointer leading-snug mb-2"
        >
          {resource.title}
        </h3>

        {/* Category */}
        <div className="mb-2.5">
          <span className="inline-block text-xs font-semibold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-md">
            #{resource.category}
          </span>
        </div>

        {/* Description snippet */}
        <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed mb-3">
          {resource.description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับสื่อนี้'}
        </p>

        {/* Tags */}
        {resource.tags && resource.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {resource.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                #{tag}
              </span>
            ))}
            {resource.tags.length > 3 && (
              <span className="text-[11px] text-slate-400">+{resource.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer with Meta & Actions */}
      <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 mt-auto">
        {/* Author & Date */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <div className="flex items-center gap-1.5 truncate max-w-[150px]">
            <div className="w-5 h-5 rounded-full bg-sky-200 text-sky-800 flex items-center justify-center font-bold text-[10px]">
              {resource.authorName ? resource.authorName.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="truncate font-medium">{resource.authorName}</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formatDate(resource.createdAt)}</span>
          </div>
        </div>

        {/* Action Buttons & Counters */}
        <div className="flex items-center justify-between pt-1">
          {/* Counters */}
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1" title="ยอดเข้าชม">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{resource.viewsCount || 0}</span>
            </span>

            <span className="flex items-center gap-1" title="บันทึกรายการโปรด">
              <Bookmark className={`w-3.5 h-3.5 ${isFavorited ? 'fill-sky-600 text-sky-600' : 'text-slate-400'}`} />
              <span>{resource.favoritesCount || 0}</span>
            </span>
          </div>

          {/* Quick buttons */}
          <div className="flex items-center gap-1">
            {/* Favorite button */}
            <button
              onClick={() => onToggleFavorite(resource)}
              className={`p-1.5 rounded-lg border transition-all ${
                isFavorited
                  ? 'bg-sky-50 border-sky-300 text-sky-600'
                  : 'bg-white border-slate-200 text-slate-500 hover:text-sky-600 hover:border-sky-200'
              }`}
              title={isFavorited ? 'นำออกจากรายการโปรด' : 'บันทึกเป็นรายการโปรด'}
            >
              <Bookmark className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
            </button>

            {/* Report button */}
            <button
              onClick={() => onReport(resource)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors"
              title="รายงานเนื้อหาที่ไม่เหมาะสม"
            >
              <Flag className="w-4 h-4" />
            </button>

            {/* Manage edit/delete if owner or moderator */}
            {canManage && onEdit && (
              <button
                onClick={() => onEdit(resource)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors"
                title="แก้ไขข้อมูลสื่อ"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}

            {canManage && onDelete && (
              <button
                onClick={() => onDelete(resource)}
                className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors"
                title="ลบสื่อนี้"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* View Detail button */}
            <button
              onClick={() => onViewDetail(resource)}
              className="ml-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1"
            >
              <span>เปิดดู</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
