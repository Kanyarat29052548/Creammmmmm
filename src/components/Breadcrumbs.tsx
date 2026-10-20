import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  items: { label: string; onClick?: () => void; active?: boolean }[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center text-xs text-slate-500 py-2.5 overflow-x-auto whitespace-nowrap scrollbar-none" aria-label="Breadcrumb">
      <button
        onClick={items[0]?.onClick}
        className="flex items-center gap-1 hover:text-sky-600 transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        <span>หน้าหลัก</span>
      </button>

      {items.slice(1).map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-3.5 h-3.5 mx-1.5 text-slate-300 shrink-0" />
          {item.active || !item.onClick ? (
            <span className="font-semibold text-sky-800 shrink-0">{item.label}</span>
          ) : (
            <button
              onClick={item.onClick}
              className="hover:text-sky-600 transition-colors shrink-0"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
