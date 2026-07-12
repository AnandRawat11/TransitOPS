import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Activity, Shield, ArrowRight, BarChart3, BrainCircuit } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Truck className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">TransitOps</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/login" className="text-slate-600 font-medium hover:text-slate-900 transition-colors">
              Sign In
            </Link>
            <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium text-sm mb-6 border border-blue-100">
                <SparkleIcon />
                <span>Phase 9 Final Release is Live</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                The Intelligent OS for Modern Fleets
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed mt-6 max-w-2xl">
                TransitOps unifies vehicle tracking, maintenance prediction, and expense management with enterprise-grade AI. Stop guessing and start optimizing.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex gap-4"
            >
              <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 group">
                Enter Dashboard
                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex gap-8 pt-8 border-t border-slate-200"
            >
              <div>
                <h4 className="text-3xl font-bold text-slate-900">99.9%</h4>
                <p className="text-slate-500 font-medium">Uptime SLA</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-slate-900">2.5M+</h4>
                <p className="text-slate-500 font-medium">Trips Managed</p>
              </div>
              <div>
                <h4 className="text-3xl font-bold text-slate-900">-30%</h4>
                <p className="text-slate-500 font-medium">Maintenance Costs</p>
              </div>
            </motion.div>
          </div>

          <div className="flex-1 w-full relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 bg-white"
            >
              <div className="absolute top-0 left-0 right-0 h-10 bg-slate-100 flex items-center px-4 gap-2 border-b border-slate-200">
                <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              </div>
              <div className="pt-10 p-1">
                {/* Mockup Dashboard Image - Replace with real screenshot */}
                <div className="aspect-[4/3] bg-slate-50 rounded flex items-center justify-center border border-slate-100">
                  <BarChart3 size={64} className="text-slate-300" />
                  <span className="ml-4 font-bold text-slate-400 text-xl">Enterprise Dashboard</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="bg-white py-24 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Everything you need to run your fleet</h2>
            <p className="text-lg text-slate-600">Built from the ground up for massive scale, deep analytics, and AI-driven insights.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BrainCircuit className="text-blue-600" size={24} />}
              title="Predictive AI"
              desc="Foresee maintenance failures and optimize routes using our advanced neural copilot."
            />
            <FeatureCard 
              icon={<Activity className="text-emerald-600" size={24} />}
              title="Real-time Telemetry"
              desc="Track vehicle statuses, driver assignments, and trip progress down to the minute."
            />
            <FeatureCard 
              icon={<Shield className="text-rose-600" size={24} />}
              title="Enterprise RBAC"
              desc="Secure every module with strict, role-based access control and detailed audit logs."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-slate-400">
          <div className="flex items-center gap-2">
            <Truck size={20} className="text-slate-500" />
            <span className="font-bold text-slate-300">TransitOps</span>
          </div>
          <p className="text-sm">© 2026 TransitOps Enterprise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
  </svg>
);

const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all">
    <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
