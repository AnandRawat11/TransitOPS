import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Truck, Activity, Tool, DollarSign, User, Shield, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock data for search - In a real app, this would query a global search endpoint
const MOCK_SEARCH_DATA = [
  { id: 'v1', type: 'vehicle', title: 'Volvo VNL - V-1045', link: '/app/vehicles/list', icon: Truck },
  { id: 'v2', type: 'vehicle', title: 'Ford F-150 - V-9932', link: '/app/vehicles/list', icon: Truck },
  { id: 't1', type: 'trip', title: 'Trip TRP-9012 (Seattle -> Portland)', link: '/app/trips/list', icon: Activity },
  { id: 'm1', type: 'maintenance', title: 'Brake Inspection - V-1045', link: '/app/maintenance/list', icon: Tool },
  { id: 'e1', type: 'expense', title: 'Fuel Receipt #8849', link: '/app/expenses', icon: DollarSign },
  { id: 'u1', type: 'user', title: 'John Doe (Driver)', link: '/app/admin/users', icon: User },
  { id: 's1', type: 'setting', title: 'User Management', link: '/app/admin/users', icon: Shield },
];

const CommandPalette = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const results = query 
    ? MOCK_SEARCH_DATA.filter(item => item.title.toLowerCase().includes(query.toLowerCase()))
    : [];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setActiveIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter' && results[activeIndex]) {
      e.preventDefault();
      navigate(results[activeIndex].link);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh]">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" 
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        >
          <div className="flex items-center px-4 border-b border-slate-100">
            <Search className="text-slate-400" size={20} />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 w-full bg-transparent outline-none p-4 text-slate-800 placeholder-slate-400"
              placeholder="Search vehicles, trips, or jump to..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={onClose} className="p-1 rounded-md text-slate-400 hover:bg-slate-100">
              <X size={16} />
            </button>
          </div>

          <div className="max-h-96 overflow-y-auto p-2">
            {!query ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                Type a command or search...
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500 text-sm">
                No results found for "{query}"
              </div>
            ) : (
              <div className="space-y-1">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Suggestions
                </div>
                {results.map((result, idx) => {
                  const Icon = result.icon;
                  return (
                    <div 
                      key={result.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                        idx === activeIndex ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      onClick={() => {
                        navigate(result.link);
                        onClose();
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <div className={`p-1.5 rounded-md ${idx === activeIndex ? 'bg-blue-100' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{result.title}</span>
                        <span className="text-xs opacity-70 capitalize">{result.type}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="bg-slate-50 px-4 py-3 text-xs text-slate-500 border-t border-slate-100 flex items-center justify-between">
            <div className="flex gap-4">
              <span><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm font-mono mr-1">↑↓</kbd> to navigate</span>
              <span><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm font-mono mr-1">↵</kbd> to select</span>
              <span><kbd className="bg-white border border-slate-200 rounded px-1.5 py-0.5 shadow-sm font-mono mr-1">esc</kbd> to close</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CommandPalette;
