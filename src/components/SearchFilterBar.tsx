import React from 'react';
import { Search, Filter, X, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useSite } from '../context/SiteContext';

export interface FilterState {
  searchQuery: string;
  category: string;
  educationLevel: string;
  mediaType: string;
  sortBy: 'latest' | 'views' | 'favorites';
}

interface SearchFilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  totalResults: number;
}

export const EDUCATION_LEVELS = [
  { id: 'all', label: 'ทุกระดับการศึกษา' },
  { id: 'primary', label: 'ประถมศึกษา (ป.1 - ป.6)' },
  { id: 'secondary_low', label: 'มัธยมศึกษาตอนต้น (ม.1 - ม.3)' },
  { id: 'secondary_high', label: 'มัธยมศึกษาตอนปลาย (ม.4 - ม.6)' },
  { id: 'university', label: 'อุดมศึกษา / มหาวิทยาลัย' },
  { id: 'general', label: 'บุคคลทั่วไป / ครูอาจารย์' },
];

export const MEDIA_TYPES = [
  { id: 'all', label: 'ทุกประเภทสื่อ' },
  { id: 'pdf', label: '📄 PDF / เอกสาร' },
  { id: 'video', label: '🎬 วิดีโอ / คลิปสอน' },
  { id: 'website', label: '🌐 เว็บไซต์ / บทความ' },
  { id: 'slides', label: '📊 สไลด์นำเสนอ' },
  { id: 'course', label: '🎓 คอร์สออนไลน์ / แนวข้อสอบ' },
  { id: 'other', label: '📁 สื่อการสอนอื่นๆ' }
];

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onFilterChange,
  totalResults
}) => {
  const { settings } = useSite();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const clearAllFilters = () => {
    onFilterChange({
      searchQuery: '',
      category: 'all',
      educationLevel: 'all',
      mediaType: 'all',
      sortBy: 'latest'
    });
  };

  const isFiltered =
    filters.searchQuery !== '' ||
    filters.category !== 'all' ||
    filters.educationLevel !== 'all' ||
    filters.mediaType !== 'all' ||
    filters.sortBy !== 'latest';

  return (
    <div className="space-y-4">
      {/* Hero / Large Search Container */}
      <div className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-sky-800 rounded-3xl p-6 sm:p-10 shadow-xl overflow-hidden text-white">
        {/* Subtle decorative circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-sky-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-blue-400/10 blur-2xl pointer-events-none" />

        <div className="relative max-w-3xl mx-auto text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-sky-200 text-xs font-medium border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
            <span>คลังรวบรวมสื่อการศึกษาคุณภาพสูงทั่วประเทศไทย</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            ค้นหาความรู้ บทเรียน และสื่อการสอนที่คุณต้องการ
          </h1>
          <p className="text-sm sm:text-base text-sky-100 max-w-xl mx-auto leading-relaxed">
            แหล่งรวมสื่อ เอกสาร PDF คลิปติว และสไลด์การสอนฟรี จากคุณครู นักเรียน และอาจารย์
          </p>

          {/* Large Search Input */}
          <div className="pt-2">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
              </div>
              <input
                type="text"
                value={filters.searchQuery}
                onChange={handleSearch}
                placeholder="พิมพ์ชื่อเรื่อง, หมวดหมู่, วิชา หรือคำค้นหา เช่น แคลคูลัส, ฟิสิกส์, Python..."
                className="w-full pl-12 sm:pl-14 pr-12 py-3.5 sm:py-4 bg-white text-slate-900 placeholder-slate-400 rounded-2xl text-sm sm:text-base shadow-2xl focus:outline-none focus:ring-4 focus:ring-sky-400/40 transition-all font-medium"
              />
              {filters.searchQuery && (
                <button
                  onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Categories Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-sky-100 shadow-xs space-y-4">
        {/* Horizontal Category Chips */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-600" />
              หมวดหมู่วิชาความรู้
            </span>
            <span className="text-xs text-slate-400">
              พบสื่อทั้งหมด <strong className="text-sky-700 font-bold">{totalResults}</strong> รายการ
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-sky-200">
            <button
              onClick={() => onFilterChange({ ...filters, category: 'all' })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                filters.category === 'all'
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
              }`}
            >
              ทั้งหมด
            </button>
            {settings.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onFilterChange({ ...filters, category: cat })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  filters.category === cat
                    ? 'bg-blue-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Multi-Filter Selects */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          {/* Education Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">ระดับชั้นการศึกษา</label>
            <select
              value={filters.educationLevel}
              onChange={(e) => onFilterChange({ ...filters, educationLevel: e.target.value })}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {EDUCATION_LEVELS.map((level) => (
                <option key={level.id} value={level.id}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Media Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">ประเภทสื่อ</label>
            <select
              value={filters.mediaType}
              onChange={(e) => onFilterChange({ ...filters, mediaType: e.target.value })}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {MEDIA_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">เรียงลำดับตาม</label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  onFilterChange({ ...filters, sortBy: e.target.value as 'latest' | 'views' | 'favorites' })
                }
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="latest">⏱️ ล่าสุด (เพิ่งอัปเดต)</option>
                <option value="views">🔥 ยอดเข้าชมมากที่สุด</option>
                <option value="favorites">⭐ บันทึกรายการโปรดสูงสุด</option>
              </select>
            </div>

            {isFiltered && (
              <button
                onClick={clearAllFilters}
                className="px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors shrink-0 flex items-center gap-1"
                title="ล้างตัวกรองทั้งหมด"
              >
                <X className="w-3.5 h-3.5" />
                <span>ล้างกรอง</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
