import React from 'react';
import { FileText, ArrowLeft, PlusCircle, Eye, Bookmark, TrendingUp } from 'lucide-react';
import { Resource } from '../types';
import { ResourceCard } from './ResourceCard';
import { EmptyState } from './EmptyState';

interface MyContributionsViewProps {
  myResources: Resource[];
  loading: boolean;
  onBack: () => void;
  onOpenPostModal: () => void;
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (resource: Resource) => void;
  onViewDetail: (resource: Resource) => void;
  onToggleFavorite: (resource: Resource) => void;
  onReport: (resource: Resource) => void;
  favoritesSet: Set<string>;
}

export const MyContributionsView: React.FC<MyContributionsViewProps> = ({
  myResources,
  loading,
  onBack,
  onOpenPostModal,
  onEditResource,
  onDeleteResource,
  onViewDetail,
  onToggleFavorite,
  onReport,
  favoritesSet
}) => {
  // Aggregate stats
  const totalViews = myResources.reduce((acc, r) => acc + (r.viewsCount || 0), 0);
  const totalFavs = myResources.reduce((acc, r) => acc + (r.favoritesCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header Banner with stats */}
      <div className="bg-gradient-to-r from-blue-800 via-sky-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-sky-200 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>กลับสู่คลังความรู้</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <FileText className="w-6 h-6 text-sky-300" />
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                สื่อการเรียนรู้ที่คุณแบ่งปัน ({myResources.length})
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-sky-100 mt-1">
              จัดการ แก้ไข หรือติดตามยอดผู้เข้าชมสื่อการสอนที่คุณได้ร่วมเผยแพร่
            </p>
          </div>

          <button
            onClick={onOpenPostModal}
            className="self-start sm:self-auto px-4 py-2.5 bg-white text-blue-900 hover:bg-sky-50 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4 text-blue-700" />
            <span>แบ่งปันสื่อเพิ่ม</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-sky-200 block">สื่อที่เผยแพร่</span>
            <span className="text-lg sm:text-xl font-bold">{myResources.length} เรื่อง</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-sky-200 block">ยอดผู้เข้าชมทั้งหมด</span>
            <span className="text-lg sm:text-xl font-bold flex items-center gap-1">
              <Eye className="w-4 h-4" /> {totalViews}
            </span>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] text-sky-200 block">ถูกบันทึกรายการโปรด</span>
            <span className="text-lg sm:text-xl font-bold flex items-center gap-1">
              <Bookmark className="w-4 h-4" /> {totalFavs}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">กำลังโหลดสื่อของคุณ...</div>
      ) : myResources.length === 0 ? (
        <EmptyState
          type="my-posts"
          title="คุณยังไม่เคยแบ่งปันสื่อการเรียนรู้"
          description="มาร่วมเป็นส่วนหนึ่งของการศึกษาไทย โพสต์สรุปวิชา หรือสื่อการสอนของคุณเลย!"
          actionText="เริ่มแบ่งปันสื่อแรกของคุณ"
          onAction={onOpenPostModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {myResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isFavorited={favoritesSet.has(resource.id)}
              onToggleFavorite={onToggleFavorite}
              onViewDetail={onViewDetail}
              onReport={onReport}
              onEdit={onEditResource}
              onDelete={onDeleteResource}
            />
          ))}
        </div>
      )}
    </div>
  );
};
