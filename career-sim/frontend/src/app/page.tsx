'use client';

import { useState } from 'react';
import { Sparkles, Map, MessageSquare, GraduationCap, ArrowRight, FileText, Briefcase, BrainCircuit, Mic } from 'lucide-react';
import { Wizard } from '@/components/Wizard';
import { RoadmapView } from '@/components/RoadmapView';
import { MentorChat } from '@/components/MentorChat';
import Link from 'next/link';
import { FeedbackModal } from '@/components/FeedbackModal';

export default function Home() {
  // Application State
  const [view, setView] = useState<'landing' | 'wizard' | 'roadmap'>('landing');
  const [roadmapData, setRoadmapData] = useState<any>(null);

  const handleWizardComplete = async (data: any) => {
    // Data is already structured correctly by Wizard
    setRoadmapData(data);
    setView('roadmap');
  };

  const handleReset = () => {
    setRoadmapData(null);
    setView('wizard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-rose-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('landing')}>
            <span className="text-xl font-bold text-slate-100 tracking-tight">
              Career Spark
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
            {view !== 'landing' && (
              <button onClick={() => setView('landing')} className="hidden sm:inline hover:text-white transition-colors">
                Home
              </button>
            )}
            <div className="h-4 w-[1px] bg-slate-800 hidden sm:block"></div>
            <FeedbackModal />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar">

        {view === 'landing' ? (
          <div className="min-h-full flex flex-col items-center py-12 animate-in fade-in zoom-in-95 duration-500">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-purple-200 to-blue-200">
                Design Your Future.
              </h1>
              <p className="text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
                AI-powered career simulation, resume optimization, and personalized learning paths. Stop guessing, start planning.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
              {/* Simulator Card */}
              <div
                onClick={() => setView('wizard')}
                className="group relative overflow-hidden p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-blue-900/20"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Map className="w-24 h-24 text-blue-500" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Career Simulator</h3>
                  <p className="text-slate-400">
                    Simulate 3 potential career paths based on your skills, constraints, and ambitions.
                  </p>
                  <div className="flex items-center text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                    Start Simulation <ArrowRight className="w-4 h-4 ml-2" />
                  </div>
                </div>
              </div>

              {/* Resume Card */}
              <Link href="/resume" className="block">
                <div className="group relative overflow-hidden p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-purple-900/20 h-full">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileText className="w-24 h-24 text-purple-500" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Resume Validator</h3>
                    <p className="text-slate-400">
                      Get an instant ATS score and AI-driven tips to optimize your resume for your dream role.
                    </p>
                    <div className="flex items-center text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                      Analyze Resume <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Jobs/Courses Card */}
              <Link href="/market-insights" className="block">
                <div
                  className="group relative overflow-hidden p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-green-500/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-green-900/20 h-full"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Briefcase className="w-24 h-24 text-green-500" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-400 group-hover:bg-green-500 group-hover:text-white transition-colors">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Market Insights</h3>
                    <p className="text-slate-400">
                      Discover real-world job roles and learning courses tailored to your simulation results.
                    </p>
                    <div className="flex items-center text-green-400 font-semibold group-hover:translate-x-1 transition-transform">
                      Explore Opportunities <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Skill Assessment Card */}
              <Link href="/assessment" className="block">
                <div
                  className="group relative overflow-hidden p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-blue-500/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-blue-900/20 h-full"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <BrainCircuit className="w-24 h-24 text-blue-500" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                      <BrainCircuit className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Skill Assessment</h3>
                    <p className="text-slate-400">
                      Evaluated technical quizzes with instant feedback, scoring, and personalized learning path recommendations.
                    </p>
                    <div className="flex items-center text-blue-400 font-semibold group-hover:translate-x-1 transition-transform">
                      Start Test <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* AI Interview Card */}
              <Link href="/interview" className="block">
                <div
                  className="group relative overflow-hidden p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-indigo-900/20 h-full"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Mic className="w-24 h-24 text-indigo-500" />
                  </div>
                  <div className="relative z-10 space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                      <Mic className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Mock Interviewer</h3>
                    <p className="text-slate-400">
                      Practice with an adaptive AI interviewer. Get real-time questions, feedback, and confidence scores.
                    </p>
                    <div className="flex items-center text-indigo-400 font-semibold group-hover:translate-x-1 transition-transform">
                      Start Interview <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>


          </div>
        ) : (
          /* Simulator View */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full">
            {/* Left Panel: Wizard or Roadmap */}
            <div className="lg:col-span-8 flex flex-col gap-6 min-h-[600px] lg:h-full overflow-hidden">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-1 flex-1 overflow-hidden flex flex-col relative">
                {/* Header inside panel */}
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    {view === 'wizard' ? <GraduationCap className="w-5 h-5 text-purple-400" /> : <Map className="w-5 h-5 text-blue-400" />}
                    {view === 'wizard' ? 'Design Your Future' : 'Your Career Roadmap'}
                  </h2>
                  {view === 'roadmap' && (
                    <button onClick={handleReset} className="text-xs text-slate-400 hover:text-white transition-colors">
                      Start Over
                    </button>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {view === 'wizard' ? (
                    <Wizard onComplete={handleWizardComplete} />
                  ) : (
                    <RoadmapView inputData={roadmapData} />
                  )}
                </div>
              </div>
            </div>

            {/* Right Panel: AI Mentor */}
            <div className="lg:col-span-4 h-[600px] lg:h-full flex flex-col">
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
        )}
      </main>
    </div>
  );
}
