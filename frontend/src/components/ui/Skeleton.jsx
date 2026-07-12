import React from 'react';

const Skeleton = ({ className = '', variant = 'rectangular', width, height }) => {
  const baseClasses = 'bg-slate-200 animate-pulse';
  
  const variants = {
    rectangular: 'rounded-md',
    circular: 'rounded-full',
    text: 'rounded-md h-4 w-full',
  };

  const style = {
    width: width,
    height: height,
  };

  return (
    <div 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      style={style}
    />
  );
};

export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-200 p-4 flex gap-4">
        {Array(columns).fill(0).map((_, i) => (
          <Skeleton key={`th-${i}`} className="flex-1 h-5" />
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {Array(rows).fill(0).map((_, rIdx) => (
          <div key={`tr-${rIdx}`} className="p-4 flex gap-4">
            {Array(columns).fill(0).map((_, cIdx) => (
              <Skeleton key={`td-${rIdx}-${cIdx}`} className="flex-1 h-4" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-slate-200 p-6">
    <div className="flex justify-between items-start mb-4">
      <Skeleton variant="circular" width={40} height={40} />
      <Skeleton width={80} height={20} />
    </div>
    <Skeleton className="mb-2 w-3/4" />
    <Skeleton className="w-1/2" />
  </div>
);

export default Skeleton;
