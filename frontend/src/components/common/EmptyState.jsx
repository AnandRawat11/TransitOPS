import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({
  title = 'No data found',
  description = 'There are no records matching your request.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700 bg-slate-800/40 p-8 text-center backdrop-blur-sm">
      <div className="rounded-full bg-slate-800 p-3 text-slate-400">
        <Inbox className="h-8 w-8" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-200">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-400">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-6 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-500 hover:shadow-lg hover:shadow-brand-500/25 active:scale-95"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
