import React from 'react';
import { Bookmark, ArrowLeft } from 'lucide-react';
import { Resource } from '../types';
import { ResourceCard } from './ResourceCard';
import { EmptyState } from './EmptyState';

interface FavoritesViewProps {
  favoriteResources: Resource[];
  loading: boolean;
  onBack: () => void;
  onToggleFavorite: (resource: Resource) => void;
  onViewDetail: (resource: Resource) => void;
  onReport: (resource: Resource) => void;
  onExplore: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteResources,
  loading,
  onBack,
  onToggleFavorite,
  onViewDetail,
  onReport,
  onExplore
}) => {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-700 via-blue-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs text-sky-200 hover:text-white transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่คลังความรู้</span>
          </button>
          <div className="flex items-center gap-2.5">
            <Bookmark className="w-6 h-6 fill-current text-sky-300" />
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              รายการโปรดของคุณ ({favoriteResources.length})
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-sky-100">
            สื่อการเรียนรู้ที่คุณบันทึกไว้ ซิงค์ข้อมูลตรงกันทุกอุปกรณ์ผ่านบัญชีของคุณ
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400">กำลังโหลดรายการโปรดของคุณ...</div>
      ) : favoriteResources.length === 0 ? (
        <EmptyState
          type="favorites"
          title="ยังไม่มีสื่อที่คุณบันทึกเป็นรายการโปรด"
          description="เมื่อพบสื่อที่น่าสนใจ ให้กดไอคอนบุ๊กมาร์กเพื่อบันทึกและกลับมาอ่านได้สะดวกรวดเร็ว"
          actionText="สำรวจคลังความรู้"
          onAction={onExplore}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoriteResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              isFavorited={true}
              onToggleFavorite={onToggleFavorite}
              onViewDetail={onViewDetail}
              onReport={onReport}
            />
          ))}
        </div>
      )}
    </div>
  );
};
