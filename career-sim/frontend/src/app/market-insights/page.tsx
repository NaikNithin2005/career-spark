'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2, TrendingUp, MapPin, Briefcase, AlertTriangle, CheckCircle, Search, ArrowRight, BarChart3, Target, BookOpen, FileText, Code } from 'lucide-react';
import Link from 'next/link';

export default function MarketInsightsPage() {
    const [targetRole, setTargetRole] = useState('');
    const [skills, setSkills] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');

    // Prep Modal State
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [prepData, setPrepData] = useState<any>(null);
    const [prepLoading, setPrepLoading] = useState(false);

    // Project Guide State
    const [projectGuide, setProjectGuide] = useState<any>(null);
    const [projectLoading, setProjectLoading] = useState(false);

    const handleAnalyze = async () => {
        if (!targetRole || !skills || !location) {
            setError("All fields are required.");
            return;
        }

        setLoading(true);
        setError('');
        setData(null);

        try {
            const res = await fetch('http://localhost:8000/api/market-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target_role: targetRole,
                    skills: skills.split(',').map(s => s.trim()).filter(s => s),
                    location: location
                })
            });

            if (!res.ok) throw new Error("Failed to fetch insights");
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setData(json);
        } catch (e: any) {
            setError(e.message || "Something went wrong within the AI analysis.");
        } finally {
            setLoading(false);
        }
    };

    const handleJobClick = async (job: any) => {
        setSelectedJob(job);
        setPrepLoading(true);
        setPrepData(null);
        setProjectGuide(null); // Reset project guide

        try {
            const res = await fetch('http://localhost:8000/api/job-prep', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    job_title: job.title,
                    company: job.company,
                    skills: skills.split(',').map(s => s.trim()).filter(s => s)
                })
            });

            if (!res.ok) throw new Error("Failed to load prep data");
            const json = await res.json();
            setPrepData(json);
        } catch (e) {
            console.error(e);
        } finally {
            setPrepLoading(false);
        }
    };

    const handleStartProject = async () => {
        if (!prepData || !prepData.project_challenge) return;
        setProjectLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/project-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: prepData.project_challenge.title,
                    description: prepData.project_challenge.description
                })
            });
            const json = await res.json();
            setProjectGuide(json);
        } catch (e) {
            console.error(e);
        } finally {
            setProjectLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-green-500/30">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-900/20">
                            <TrendingUp className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Market Insights
                        </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <Link href="/">
                            <Button variant="ghost" className="text-slate-400 hover:text-white">
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Input */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="bg-slate-900/50 border-slate-800 sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-xl text-white">Define Your Target</CardTitle>
                                <CardDescription className="text-slate-400">Where do you want to see yourself?</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Target Job Role</Label>
                                    <Input
                                        placeholder="e.g. Full Stack Developer"
                                        value={targetRole}
                                        onChange={(e) => setTargetRole(e.target.value)}
                                        className="bg-slate-950 border-slate-700 text-slate-200 focus:border-green-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Your Key Skills</Label>
                                    <Input
                                        placeholder="e.g. React, Node.js, Python"
                                        value={skills}
                                        onChange={(e) => setSkills(e.target.value)}
                                        className="bg-slate-950 border-slate-700 text-slate-200 focus:border-green-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Preferred Location</Label>
                                    <Input
                                        placeholder="e.g. Remote, San Francisco"
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="bg-slate-950 border-slate-700 text-slate-200 focus:border-green-500"
                                    />
                                </div>

                                <Button
                                    onClick={handleAnalyze}
                                    className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
                                    Analyze Market Fit
                                </Button>
                                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Results Area */}
                    <div className="lg:col-span-8">
                        {!data && !loading && (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
                                <BarChart3 className="w-16 h-16 mb-4 opacity-20" />
                                <p className="text-lg">Enter your details to generate a real-time market analysis.</p>
                            </div>
                        )}

                        {loading && (
                            <div className="h-full flex flex-col items-center justify-center p-12 space-y-4">
                                <Loader2 className="w-12 h-12 animate-spin text-green-500" />
                                <p className="text-slate-400 animate-pulse">Running market simulation...</p>
                            </div>
                        )}

                        {data && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-700">
                                {/* Top Stats Row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card className="bg-slate-900/60 border-slate-800">
                                        <CardContent className="pt-6 flex items-center justify-between">
                                            <div>
                                                <p className="text-slate-400 text-sm font-medium mb-1">Hiring Probability</p>
                                                <h3 className={`text-3xl font-bold ${data.hiring_probability === 'High' ? 'text-green-400' : 'text-yellow-400'}`}>
                                                    {data.hiring_probability}
                                                </h3>
                                            </div>
                                            <div className={`p-3 rounded-full ${data.hiring_probability === 'High' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                <Target className="w-8 h-8" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-slate-900/60 border-slate-800">
                                        <CardContent className="pt-6 flex items-center justify-between">
                                            <div>
                                                <p className="text-slate-400 text-sm font-medium mb-1">Skill Readiness</p>
                                                <h3 className="text-3xl font-bold text-blue-400">
                                                    {data.readiness_score}/100
                                                </h3>
                                            </div>
                                            <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                                                <CheckCircle className="w-8 h-8" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Summary & Gaps */}
                                <Card className="bg-slate-900/60 border-slate-800">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-white">AI Analysis Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-slate-300 leading-relaxed">{data.analysis_summary}</p>

                                        {data.critical_missing_skills.length > 0 && (
                                            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2 text-red-400 font-semibold text-sm">
                                                    <AlertTriangle className="w-4 h-4" /> Critical Skills to Improve
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {data.critical_missing_skills.map((skill: string, i: number) => (
                                                        <Badge key={i} variant="outline" className="border-red-900 text-red-300 bg-red-950/30">
                                                            {skill}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Job Recommendations */}
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        <Briefcase className="w-5 h-5 text-green-400" /> Curated Job Opportunities
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-4">Click on a job to generate a preparation plan.</p>
                                    <div className="space-y-4">
                                        {data.recommended_jobs.map((job: any, idx: number) => (
                                            <Card key={idx} onClick={() => handleJobClick(job)} className="bg-slate-900/40 border-slate-800 hover:border-green-500/30 transition-all hover:bg-slate-900 group cursor-pointer">
                                                <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div>
                                                        <h4 className="text-lg font-bold text-slate-100 group-hover:text-green-400 transition-colors">{job.title}</h4>
                                                        <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                                                            <span>{job.company}</span>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                                                            <span>•</span>
                                                            <span className="bg-slate-800 px-2 py-0.5 rounded text-xs text-slate-300">{job.type}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-right hidden md:block">
                                                            <div className="text-2xl font-bold text-green-400">{job.match_score}%</div>
                                                            <div className="text-xs text-slate-500 uppercase">Match</div>
                                                        </div>
                                                        <Button size="icon" variant="ghost" className="text-slate-400 hover:text-white">
                                                            <ArrowRight className="w-5 h-5" />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Job Prep Dialog */}
                <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
                    <DialogContent className="bg-slate-950 border-slate-800 text-slate-200 max-w-3xl max-h-[85vh] overflow-y-auto custom-scrollbar">
                        <DialogHeader>
                            <DialogTitle className="text-2xl text-white">Application Prep Suite</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Customized strategy for {selectedJob?.title} at {selectedJob?.company}
                            </DialogDescription>
                        </DialogHeader>

                        {prepLoading ? (
                            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                                <p>Generating interview questions and projects...</p>
                            </div>
                        ) : prepData ? (
                            <div className="space-y-8 py-4">
                                {/* Match Summary */}
                                <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-800">
                                    <p className="text-slate-300 italic">"{prepData.match_summary}"</p>
                                </div>

                                {/* Interview Questions */}
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <BookOpen className="w-5 h-5 text-purple-400" /> Few Interview Questions
                                    </h4>
                                    <div className="space-y-3">
                                        {prepData.interview_questions.map((q: any, i: number) => (
                                            <div key={i} className="bg-slate-900 p-4 rounded-lg border border-slate-800">
                                                <div className="flex gap-3">
                                                    <span className="bg-slate-800 text-slate-400 text-xs font-bold px-2 py-1 rounded h-fit shrink-0">{q.type}</span>
                                                    <div>
                                                        <p className="font-semibold text-slate-200 mb-2">{q.question}</p>
                                                        <p className="text-sm text-slate-400"><span className="text-green-500 font-medium">Tip:</span> {q.answer_tip}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Project Challenge */}
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <Code className="w-5 h-5 text-blue-400" /> Portfolio Project Idea
                                    </h4>
                                    <div className="bg-gradient-to-br from-slate-900 to-slate-900 border border-blue-900/30 p-6 rounded-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-5">
                                            <Code className="w-24 h-24 text-blue-400" />
                                        </div>
                                        <h5 className="font-bold text-blue-300 text-lg mb-2">{prepData.project_challenge.title}</h5>
                                        <p className="text-slate-400 leading-relaxed">{prepData.project_challenge.description}</p>

                                        {!projectGuide && (
                                            <Button
                                                onClick={handleStartProject}
                                                disabled={projectLoading}
                                                size="sm"
                                                variant="outline"
                                                className="mt-4 border-blue-500/30 text-blue-400 hover:text-blue-300"
                                            >
                                                {projectLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                                Start Project
                                            </Button>
                                        )}

                                        {projectGuide && (
                                            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-4">
                                                <div className="h-px bg-slate-800 w-full" />
                                                <p className="text-sm text-green-400 font-bold">Recommended Tech Stack</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {projectGuide.tech_stack.map((t: string, i: number) => (
                                                        <Badge key={i} variant="outline" className="border-slate-700 bg-slate-800 text-slate-300">{t}</Badge>
                                                    ))}
                                                </div>
                                                <div className="space-y-3">
                                                    {projectGuide.steps.map((step: any, i: number) => (
                                                        <div key={i} className="flex gap-3">
                                                            <div className="w-6 h-6 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
                                                                {step.step}
                                                            </div>
                                                            <div>
                                                                <p className="text-slate-200 font-medium text-sm">{step.title}</p>
                                                                <p className="text-slate-400 text-xs">{step.details}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="bg-yellow-900/10 border border-yellow-900/30 p-3 rounded-lg">
                                                    <p className="text-xs text-yellow-400"><strong>Bonus:</strong> {projectGuide.bonus_challenge}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Resume Keywords */}
                                <div>
                                    <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-yellow-400" /> Resume Keywords
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {prepData.resume_keywords.map((kw: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="bg-yellow-900/20 text-yellow-200 border border-yellow-900/50 hover:bg-yellow-900/30">
                                                + {kw}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    );
}
