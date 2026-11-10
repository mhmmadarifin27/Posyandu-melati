'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  backHref?: string;
  backLabel?: string;
}

export default function Breadcrumbs({
  items,
  backHref,
  backLabel = 'Kembali',
}: BreadcrumbsProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 py-1.5 px-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
      {/* Breadcrumb Path */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 flex-wrap text-xs">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <React.Fragment key={index}>
              {index > 0 && (
                <span className="text-slate-300 font-bold mx-1">/</span>
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-slate-500 hover:text-[#80000f] font-semibold hover:underline transition-colors flex items-center gap-1.5 py-0.5"
                >
                  {index === 0 && <Home className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={
                    isLast
                      ? 'text-[#80000f] font-bold bg-[#fff0f2] px-2.5 py-0.5 rounded-lg border border-[#fce1e4]'
                      : 'text-slate-600 font-medium'
                  }
                >
                  {item.label}
                </span>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Back Button */}
      {backLabel && (
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-[#fff0f2] hover:text-[#80000f] hover:border-[#fce1e4] text-slate-700 font-bold text-xs transition-all cursor-pointer group shadow-2xs active:scale-98"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#80000f] group-hover:-translate-x-0.5 transition-transform" />
          <span>{backLabel}</span>
        </button>
      )}
    </div>
  );
}

