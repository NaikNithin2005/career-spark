'use client';

import { useState } from 'react';
import { Sparkles, Map, MessageSquare, GraduationCap } from 'lucide-react';
import { Wizard } from '@/components/Wizard';
import { RoadmapView } from '@/components/RoadmapView';
import { MentorChat } from '@/components/MentorChat';

export default function Home() {
  // Application State
  const [roadmapData, setRoadmapData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'wizard' | 'roadmap'>('wizard');

  const handleWizardComplete = async (data: any) => {
    // Data is already structured correctly by Wizard
    setRoadmapData(data);
    setActiveTab('roadmap');
  };

  const handleReset = () => {
    setRoadmapData(null);
    setActiveTab('wizard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-purple-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-purple-500 to-blue-500 p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
              Career Spark
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
            <span className="hidden sm:inline">AI-Powered Career Intelligence</span>
            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>
            <span className="text-slate-200">Prototype v2.0</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">

          {/* Left Panel: Wizard or Roadmap */}
          <div className="lg:col-span-8 flex flex-col gap-6 h-full overflow-hidden">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-1 flex-1 overflow-hidden flex flex-col relative">
              {/* Header inside panel */}
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  {activeTab === 'wizard' ? <GraduationCap className="w-5 h-5 text-purple-400" /> : <Map className="w-5 h-5 text-blue-400" />}
                  {activeTab === 'wizard' ? 'Design Your Future' : 'Your Career Roadmap'}
                </h2>
                {activeTab === 'roadmap' && (
                  <button onClick={handleReset} className="text-xs text-slate-400 hover:text-white transition-colors">
                    Start Over
                  </button>
                )}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {activeTab === 'wizard' ? (
                  <Wizard onComplete={handleWizardComplete} />
                ) : (
                  <RoadmapView inputData={roadmapData} />
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: AI Mentor */}
          <div className="lg:col-span-4 h-full flex flex-col">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b border-slate-800 flex items-center gap-2 bg-slate-900/80">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-100">AI Mentor</h3>
                  <p className="text-xs text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-hidden relative">
                <MentorChat />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
