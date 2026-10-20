import React from 'react';
import { SearchX, BookmarkX, FolderOpen, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  type: 'search' | 'favorites' | 'my-posts' | 'empty';
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  onAction
}) => {
  return (
    <div className="py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-sky-200/80 max-w-lg mx-auto shadow-xs my-6">
      <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-100">
        {type === 'search' && <SearchX className="w-8 h-8 stroke-[1.8]" />}
        {type === 'favorites' && <BookmarkX className="w-8 h-8 stroke-[1.8]" />}
        {type === 'my-posts' && <FolderOpen className="w-8 h-8 stroke-[1.8]" />}
        {type === 'empty' && <FolderOpen className="w-8 h-8 stroke-[1.8]" />}
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-1">
        {title ||
          (type === 'search'
            ? 'ไม่พบข้อมูลที่ตรงกับคำค้นหา'
            : type === 'favorites'
            ? 'ยังไม่มีรายการโปรดที่คุณบันทึกไว้'
            : type === 'my-posts'
            ? 'คุณยังไม่ได้แบ่งปันสื่อการเรียนรู้'
            : 'ยังไม่มีข้อมูลในส่วนนี้')}
      </h3>

      <p className="text-xs sm:text-sm text-slate-500 max-w-xs mx-auto leading-relaxed mb-6">
        {description ||
          (type === 'search'
            ? 'ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองระดับชั้นและประเภทสื่อ'
            : type === 'favorites'
            ? 'กดไอคอนบุ๊กมาร์กที่การ์ดสื่อการเรียนรู้เพื่อบันทึกไว้อ่านภายหลัง'
            : type === 'my-posts'
            ? 'เริ่มต้นแบ่งปันใบงาน สรุปวิชา หรือคลิปสอนของคุณให้กับทุกคนเลย!'
            : 'เริ่มสร้างเนื้อหาใหม่ได้ทันที')}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-blue-700/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
