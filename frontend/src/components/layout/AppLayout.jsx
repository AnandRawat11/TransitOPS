import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AppLayout = () => {
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar Navigation */}
      {!isPresentationMode && <Sidebar />}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all ${isPresentationMode ? 'pl-0' : 'pl-64'}`}>
        {/* Header Topbar */}
        <Topbar isPresentationMode={isPresentationMode} togglePresentationMode={() => setIsPresentationMode(!isPresentationMode)} />

        {/* Dynamic Route Content */}
        <main className="flex-1 p-8 bg-slate-950">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
