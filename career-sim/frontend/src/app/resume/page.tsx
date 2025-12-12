'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ResumePage() {
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setAnalyzing(true);
        setError('');
        setAnalysis(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('career_goal', 'Software Engineer'); // Default for now, can be dynamic later

        try {
            const res = await fetch('http://localhost:8000/api/analyze-resume', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || 'Analysis failed');
            }

            const data = await res.json();
            setAnalysis(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
                            <span className="text-white font-bold text-lg">✦</span>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Resume Validator
                        </span>
                    </div>
                    <Link href="/">
                        <Button variant="ghost" className="text-slate-400 hover:text-white">
                            Back to Simulator
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Optimize Your Resume for AI</h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                        Upload your PDF resume to get an instant ATS score, skill gap analysis, and tailored improvement suggestions.
                    </p>
                </div>

                {/* Upload Section */}
                {!analysis && (
                    <Card className="max-w-xl mx-auto bg-slate-900/50 border-slate-800 border-dashed border-2">
                        <CardContent className="pt-10 pb-10 flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-2">
                                <Upload className="w-8 h-8 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Upload your Resume</h3>
                                <p className="text-slate-400 text-sm mt-1">PDF files only (Max 5MB)</p>
                            </div>

                            <div className="w-full max-w-xs relative mt-4">
                                <Input
                                    type="file"
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                    className="cursor-pointer file:cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 text-slate-300 bg-slate-950 border-slate-700"
                                />
                            </div>

                            {file && (
                                <div className="mt-6 w-full">
                                    <Button
                                        onClick={handleUpload}
                                        disabled={analyzing}
                                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-6 text-lg shadow-lg shadow-purple-900/20"
                                    >
                                        {analyzing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                Analyzing with AI...
                                            </>
                                        ) : (
                                            'Analyze Now'
                                        )}
                                    </Button>
                                </div>
                            )}

                            {error && (
                                <div className="mt-4 p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {error}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Results Section */}
                {analysis && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* Score Header */}
                        <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-12">
                            <div className="relative w-40 h-40 flex items-center justify-center">
                                {/* Simple CSS Ring */}
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-800" />
                                    <circle
                                        cx="80" cy="80" r="70"
                                        stroke="currentColor" strokeWidth="12"
                                        fill="transparent"
                                        strokeDasharray={440}
                                        strokeDashoffset={440 - (440 * analysis.ats_score) / 100}
                                        className={`${analysis.ats_score >= 80 ? 'text-green-500' : analysis.ats_score >= 60 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-white">{analysis.ats_score}</span>
                                    <span className="text-xs text-slate-400 uppercase tracking-wider">ATS Score</span>
                                </div>
                            </div>
                            <div className="text-center md:text-left max-w-md">
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {analysis.ats_score >= 80 ? "Excellent Resume!" : analysis.ats_score >= 60 ? "Good Start, Needs Polish" : "Needs Significant Improvement"}
                                </h2>
                                <p className="text-slate-400">
                                    Your resume is {analysis.ats_score}% optimized for Applicant Tracking Systems.
                                    {analysis.ats_score < 80 && " Follow the suggestions below to boost your ranking."}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Skills Found */}
                            <Card className="bg-slate-900/50 border-green-900/30">
                                <CardHeader>
                                    <CardTitle className="text-green-400 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" /> Detected Skills
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.skills_found.map((skill: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-green-950/30 border border-green-900/50 rounded-full text-green-300 text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Missing Keywords */}
                            <Card className="bg-slate-900/50 border-red-900/30">
                                <CardHeader>
                                    <CardTitle className="text-red-400 flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5" /> Missing Keywords
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.missing_keywords.map((skill: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-red-950/30 border border-red-900/50 rounded-full text-red-300 text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Improvements */}
                        <Card className="bg-slate-900/50 border-blue-900/30">
                            <CardHeader>
                                <CardTitle className="text-blue-400 flex items-center gap-2">
                                    <FileText className="w-5 h-5" /> Actionable Improvements
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {analysis.improvements.map((tip: string, i: number) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-lg bg-slate-950/50 border border-slate-800">
                                        <div className="w-8 h-8 rounded-full bg-blue-900/20 text-blue-400 flex items-center justify-center font-bold shrink-0">
                                            {i + 1}
                                        </div>
                                        <p className="text-slate-300 pt-1">{tip}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        <div className="flex justify-center pt-8">
                            <Button variant="outline" onClick={() => { setAnalysis(null); setFile(null); }} className="text-slate-400 border-slate-700 hover:bg-slate-800">
                                Upload Another Resume
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
