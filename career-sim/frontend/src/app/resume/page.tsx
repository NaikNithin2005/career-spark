'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, UploadCloud, FileText, CheckCircle, AlertTriangle, X, Download, Wand2, User, Briefcase, GraduationCap, Printer } from 'lucide-react';
import Link from 'next/link';
import { useReactToPrint } from 'react-to-print';

export default function ResumePage() {
    // --- Validator State ---
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<any>(null);
    const [error, setError] = useState('');

    // --- Builder State ---
    const [builderLoading, setBuilderLoading] = useState(false);
    const [resumeContent, setResumeContent] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        experience: '',
        education: '',
        skills: ''
    });

    // --- PDF Print Ref ---
    const resumePreviewRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: resumePreviewRef,
        documentTitle: `${formData.name || 'Resume'}_CV`,
    });

    // --- Validator Handlers ---
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
            setAnalysis(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a PDF file first.");
            return;
        }

        setLoading(true);
        setError('');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('career_goal', "Software Engineer"); // Defaulting for now

        try {
            const res = await fetch('http://localhost:8000/api/analyze-resume', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Analysis failed");
            }

            const json = await res.json();
            setAnalysis(json);
        } catch (e: any) {
            setError(e.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    // --- Builder Handlers ---
    const handleBuilderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBuildResume = async () => {
        if (!formData.name || !formData.experience || !formData.skills) {
            alert("Please fill in at least Name, Experience, and Skills.");
            return;
        }
        setBuilderLoading(true);
        setResumeContent(null);
        try {
            const res = await fetch('http://localhost:8000/api/build-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!res.ok) throw new Error("Build failed");
            const json = await res.json();
            setResumeContent(json);
        } catch (e: any) {
            alert("Error generating resume: " + e.message);
        } finally {
            setBuilderLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 print:hidden">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
                            <FileText className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Resume Studio
                        </span>
                    </div>
                    <Link href="/">
                        <Button variant="ghost" className="text-slate-400 hover:text-white">Back to Dashboard</Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 print:p-0">
                <div className="text-center mb-10 print:hidden">
                    <h1 className="text-4xl font-bold text-white mb-3">Optimize Your Profile</h1>
                    <p className="text-slate-400 max-w-xl mx-auto">
                        Validate existing resumes for ATS compatibility or build a new high-impact resume from scratch using AI.
                    </p>
                </div>

                <Tabs defaultValue="validator" className="w-full print:hidden">
                    <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-slate-900 border border-slate-800 rounded-xl mb-8 p-1">
                        <TabsTrigger value="validator" className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white rounded-lg">Resume Validator</TabsTrigger>
                        <TabsTrigger value="builder" className="text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg">AI Resume Builder</TabsTrigger>
                    </TabsList>

                    {/* --- VALIDATOR TAB --- */}
                    <TabsContent value="validator" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto">
                        <Card className="bg-slate-900/50 border-slate-800 border-dashed border-2">
                            <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                                {!file ? (
                                    <>
                                        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <UploadCloud className="w-8 h-8 text-purple-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-2">Upload your Resume</h3>
                                        <p className="text-slate-400 mb-6 text-sm">PDF files only (Max 5MB)</p>
                                        <div className="relative">
                                            <Input
                                                type="file"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <Button className="bg-purple-600 hover:bg-purple-700 text-white">Choose File</Button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                        <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-full mb-6">
                                            <FileText className="w-4 h-4 text-purple-400" />
                                            <span className="text-slate-200 font-medium">{file.name}</span>
                                            <button onClick={() => { setFile(null); setAnalysis(null); }} className="ml-2 text-slate-500 hover:text-white">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <Button
                                            onClick={handleUpload}
                                            disabled={loading}
                                            className="bg-purple-600 hover:bg-purple-700 text-white w-40"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                            {loading ? 'Analyzing...' : 'Scan Resume'}
                                        </Button>
                                    </div>
                                )}
                                {error && <p className="text-red-400 mt-4 text-sm bg-red-950/30 px-3 py-1 rounded border border-red-900/50">{error}</p>}
                            </CardContent>
                        </Card>

                        {/* Analysis Dashboard */}
                        {analysis && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {/* Top Grid: Score & Missing Keywords */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Score Card */}
                                    <Card className="bg-slate-900/50 border-slate-800 md:col-span-1 overflow-hidden relative group">
                                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                                        <CardHeader>
                                            <CardTitle className="text-white text-center">ATS Compatibility</CardTitle>
                                        </CardHeader>
                                        <CardContent className="flex flex-col items-center justify-center pb-8">
                                            <div className="relative w-40 h-40 flex items-center justify-center">
                                                {/* SVG Gauge */}
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                    {/* Background Circle */}
                                                    <circle className="text-slate-800 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                                                    {/* Progress Circle */}
                                                    <circle
                                                        className={`stroke-current transition-all duration-1000 ease-out ${analysis.ats_score >= 75 ? "text-green-500" : analysis.ats_score >= 50 ? "text-yellow-500" : "text-red-500"}`}
                                                        strokeWidth="8"
                                                        strokeLinecap="round"
                                                        cx="50"
                                                        cy="50"
                                                        r="40"
                                                        fill="transparent"
                                                        strokeDasharray={`${2 * Math.PI * 40}`}
                                                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - analysis.ats_score / 100)}`}
                                                    ></circle>
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                                    <span className="text-4xl font-bold text-white">{analysis.ats_score}</span>
                                                    <span className="text-xs text-slate-400 font-medium">OUT OF 100</span>
                                                </div>
                                            </div>
                                            <p className={`mt-2 text-center text-sm font-medium ${analysis.ats_score >= 75 ? "text-green-400" : "text-yellow-400"}`}>
                                                {analysis.ats_score >= 75 ? "Excellent Match" : analysis.ats_score >= 50 ? "Needs Optimization" : "Low Compatibility"}
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Missing Keywords (Critical) */}
                                    <Card className="bg-slate-900/50 border-slate-800 md:col-span-2 overflow-hidden relative">
                                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-white">
                                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                                Critical Missing Keywords
                                            </CardTitle>
                                            <CardDescription className="text-slate-400">
                                                ATS systems scan for these exact terms. Add them to your resume contextually.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {analysis.missing_keywords && analysis.missing_keywords.length > 0 ? (
                                                <div className="flex flex-wrap gap-3">
                                                    {analysis.missing_keywords.map((kw: string, i: number) => (
                                                        <Badge key={i} variant="outline" className="px-3 py-1.5 border-red-900/50 bg-red-950/20 text-red-300 hover:bg-red-900/40 cursor-copy active:scale-95 transition-transform" title="Click to copy (implied)">
                                                            + {kw}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-green-400 bg-green-950/30 p-4 rounded-lg border border-green-900">
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span>Great job! No critical keywords seem to be missing for this role.</span>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Bottom Grid: Detailed Advice */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Improvements */}
                                    <Card className="bg-slate-900/50 border-slate-800">
                                        <CardHeader><CardTitle className="text-white flex items-center gap-2"><Wand2 className="w-4 h-4 text-purple-400" /> Actionable Feedback</CardTitle></CardHeader>
                                        <CardContent className="space-y-4">
                                            {(analysis.improvements || []).map((item: string, i: number) => (
                                                <div key={i} className="flex gap-3 text-slate-300 text-sm p-4 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-slate-700 transition-colors">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                                                    {item}
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>

                                    {/* Detected Skills */}
                                    <Card className="bg-slate-900/50 border-slate-800">
                                        <CardHeader><CardTitle className="text-white flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" /> Verified Skills</CardTitle></CardHeader>
                                        <CardContent>
                                            <div className="flex flex-wrap gap-2">
                                                {(analysis.skills_found || []).map((skill: string, i: number) => (
                                                    <Badge key={i} className="bg-slate-800 text-slate-200 border-none px-3 py-1.5 hover:bg-slate-700 hover:text-white transition-colors">{skill}</Badge>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </TabsContent>

                    {/* --- BUILDER TAB --- */}
                    <TabsContent value="builder" className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* INPUT FORM */}
                        <div className="lg:col-span-5 space-y-6">
                            <Card className="bg-slate-900 border-slate-800 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <User className="w-5 h-5 text-blue-400" /> Personal Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Full Name</Label>
                                            <Input name="name" placeholder="John Doe" className="bg-slate-950 border-slate-700 text-slate-200 focus:border-blue-500" onChange={handleBuilderChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-slate-300">Phone</Label>
                                            <Input name="phone" placeholder="+1 234..." className="bg-slate-950 border-slate-700 text-slate-200 focus:border-blue-500" onChange={handleBuilderChange} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Email</Label>
                                        <Input name="email" placeholder="john@example.com" className="bg-slate-950 border-slate-700 text-slate-200 focus:border-blue-500" onChange={handleBuilderChange} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900 border-slate-800 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <Briefcase className="w-5 h-5 text-blue-400" /> Professional History
                                    </CardTitle>
                                    <CardDescription className="text-slate-400">Paste your raw experience points here.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Textarea
                                        name="experience"
                                        className="min-h-[150px] bg-slate-950 border-slate-700 text-slate-200 focus:border-blue-500"
                                        placeholder="Software Engineer at Google (2020-2023). Built backend APIs..."
                                        onChange={handleBuilderChange}
                                    />
                                </CardContent>
                            </Card>

                            <Card className="bg-slate-900 border-slate-800 shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-white">
                                        <GraduationCap className="w-5 h-5 text-blue-400" /> Education & Skills
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Education Details</Label>
                                        <Input name="education" placeholder="BS CS, MIT, 2020" className="bg-slate-950 border-slate-700 text-slate-200 focus:border-blue-500" onChange={handleBuilderChange} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-slate-300">Key Skills (Comma separated)</Label>
                                        <Input name="skills" placeholder="Python, React, AWS..." className="bg-slate-950 border-slate-700 text-slate-200 focus:border-blue-500" onChange={handleBuilderChange} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Button onClick={handleBuildResume} disabled={builderLoading} className="w-full bg-blue-600 hover:bg-blue-700 py-6 text-lg font-bold shadow-lg shadow-blue-900/20">
                                {builderLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2" />}
                                Generate Resume Magic
                            </Button>
                        </div>

                        {/* PREVIEW AREA */}
                        <div className="lg:col-span-7 flex flex-col gap-4">
                            <div className="flex justify-end gap-2">
                                <Button onClick={() => handlePrint && handlePrint()} disabled={!resumeContent} size="sm" variant="outline" className="text-slate-400 border-slate-700 hover:bg-slate-800">
                                    <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
                                </Button>
                            </div>

                            <div className="bg-white text-slate-900 rounded-sm shadow-2xl min-h-[800px] w-full max-w-[210mm] mx-auto p-[15mm]" ref={resumePreviewRef}>
                                {!resumeContent ? (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50 text-center py-20">
                                        <FileText className="w-24 h-24 mb-4" />
                                        <p className="text-xl font-semibold">Ready to draft</p>
                                        <p>Fill out the form and hit Generate to see your AI-polished resume here.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="text-center border-b pb-4 border-slate-800">
                                            <h2 className="text-4xl font-bold uppercase tracking-wide text-slate-900">{formData.name}</h2>
                                            <div className="flex justify-center gap-4 text-sm text-slate-700 mt-2 font-medium">
                                                <span>{formData.email}</span>
                                                <span>•</span>
                                                <span>{formData.phone}</span>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-md font-bold uppercase text-slate-900 border-b-2 border-slate-900 mb-2">Professional Summary</h3>
                                            <p className="text-sm leading-relaxed text-slate-800">{resumeContent.summary}</p>
                                        </div>

                                        <div>
                                            <h3 className="text-md font-bold uppercase text-slate-900 border-b-2 border-slate-900 mb-3">Experience</h3>
                                            {resumeContent.experience.map((exp: any, i: number) => (
                                                <div key={i} className="mb-4">
                                                    <div className="flex justify-between font-bold text-slate-900">
                                                        <span>{exp.role}</span>
                                                        <span className="text-slate-600 text-sm whitespace-nowrap">{exp.dates}</span>
                                                    </div>
                                                    <div className="text-slate-700 text-sm italic mb-1 font-semibold">{exp.company}</div>
                                                    <ul className="list-disc list-outside ml-4 space-y-1">
                                                        {exp.points.map((pt: string, j: number) => (
                                                            <li key={j} className="text-sm text-slate-800">{pt}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            <div>
                                                <h3 className="text-md font-bold uppercase text-slate-900 border-b-2 border-slate-900 mb-3">Education</h3>
                                                {resumeContent.education.map((edu: any, i: number) => (
                                                    <div key={i} className="flex justify-between mb-2">
                                                        <div>
                                                            <span className="font-bold text-slate-900 block">{edu.degree}</span>
                                                            <span className="text-slate-700 text-sm">{edu.school}</span>
                                                        </div>
                                                        <span className="text-slate-600 text-sm font-medium">{edu.year}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div>
                                                <h3 className="text-md font-bold uppercase text-slate-900 border-b-2 border-slate-900 mb-3">Skills</h3>
                                                <div className="text-sm flex flex-wrap gap-x-2 gap-y-2">
                                                    {resumeContent.skills.map((sk: string, i: number) => (
                                                        <span key={i} className="text-slate-800 font-medium border-b border-slate-300 px-1">
                                                            {sk}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
