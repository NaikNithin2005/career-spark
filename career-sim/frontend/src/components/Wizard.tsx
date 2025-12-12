'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

interface WizardProps {
    onComplete: (data: any) => void;
}

export function Wizard({ onComplete }: WizardProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState<any>(null);
    const [errors, setErrors] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        // Academics
        education_level: '',
        stream: '',
        branch: '',
        institution_type: 'Private',
        marks_10th: '',
        marks_12th: '',
        cgpa: '',

        // Profile
        name: '',
        age: '',
        skills: '', // comma separated strings
        interests: '', // comma separated strings
        traits: '', // comma separated strings

        // Goals
        long_term_goal: '',
        preferred_industry: '',
        preferred_location: '',
        constraints: ''
    });

    const validateStep = (currentStep: number) => {
        const newErrors: string[] = [];

        if (currentStep === 1) {
            if (!formData.age) newErrors.push("Age is required");
        }
        else if (currentStep === 2) {
            if (!formData.education_level) newErrors.push("Education Level is required");
            if (!formData.stream) newErrors.push("Stream/Major is required");
            if (!formData.branch) newErrors.push("Branch is required");
            if (!formData.marks_10th) newErrors.push("10th Marks are required");
            if (!formData.marks_12th) newErrors.push("12th Marks are required");
            // CGPA can be optional or required, usually required
            if (!formData.cgpa) newErrors.push("CGPA is required");
        }
        else if (currentStep === 3) {
            if (!formData.skills) newErrors.push("Skills are required");
            if (!formData.interests) newErrors.push("Interests are required");
        }
        else if (currentStep === 4) {
            if (!formData.long_term_goal) newErrors.push("Long Term Goal is required");
            if (!formData.preferred_industry) newErrors.push("Preferred Industry is required");
            if (!formData.preferred_location) newErrors.push("Preferred Location is required");
        }

        setErrors(newErrors);
        return newErrors.length === 0;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
        }
    };

    // Auto-clear errors when user types
    const updateField = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors.length > 0) setErrors([]);
    };

    const handleBack = () => {
        setErrors([]);
        setStep(prev => prev - 1);
    }

    const fetchInsights = async () => {
        if (!validateStep(4)) return; // Validate Step 4 before api call

        setLoading(true);
        setErrors([]);
        try {
            const payload = transformDataForApi();
            const res = await fetch('http://localhost:8000/api/generate-insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error("Failed to fetch insights");
            const data = await res.json();
            setInsights(data);
            setStep(prev => prev + 1); // Move manually as we override handleNext logic for this button
        } catch (e: any) {
            setErrors([e.message || "Something went wrong"]);
        } finally {
            setLoading(false);
        }
    };

    const transformDataForApi = () => {
        return {
            academics: {
                education_level: formData.education_level,
                stream: formData.stream,
                branch: formData.branch,
                institution_type: formData.institution_type,
                marks_10th: parseFloat(formData.marks_10th) || 0,
                marks_12th: parseFloat(formData.marks_12th) || 0,
                cgpa: parseFloat(formData.cgpa) || 0
            },
            profile: {
                name: formData.name || "User",
                age: parseInt(formData.age) || 18,
                skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
                interests: formData.interests.split(',').map(s => s.trim()).filter(s => s),
                traits: formData.traits.split(',').map(s => s.trim()).filter(s => s)
            },
            goals: {
                long_term_goal: formData.long_term_goal,
                preferred_industry: formData.preferred_industry,
                preferred_location: formData.preferred_location,
                constraints: formData.constraints
            }
        };
    };

    const handleFinalSubmit = () => {
        onComplete(transformDataForApi());
    };

    return (
        <div className="max-w-3xl mx-auto py-8 text-slate-200">

            {/* Progress Bar */}
            <div className="mb-8 flex items-center justify-between relative">
                {[1, 2, 3, 4, 5].map((s) => (
                    <div key={s} className="flex flex-col items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${step >= s ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/50' : 'bg-slate-800 text-slate-500'
                            }`}>
                            {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                        </div>
                        <span className="text-[10px] mt-2 text-slate-400 font-medium uppercase tracking-wider">
                            {['Start', 'Academics', 'Profile', 'Goals', 'Review'][s - 1]}
                        </span>
                    </div>
                ))}
                <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-800 -z-0">
                    <div className="h-full bg-purple-600 transition-all duration-300" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
                </div>
            </div>

            <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">

                <div className="mb-4">
                    {errors.length > 0 && (
                        <div className="bg-red-900/20 border border-red-900 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <ul className="list-disc list-inside">
                                {errors.map((e, i) => <li key={i}>{e}</li>)}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Step 1: Personal */}
                {step === 1 && (
                    <CardContent className="space-y-6 pt-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">Let's get to know you</h2>
                            <p className="text-slate-400">Basic details to personalize your experience.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Name (Optional)</Label>
                                <Input value={formData.name} onChange={e => updateField('name', e.target.value)} placeholder="e.g. Alex" className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Age <span className="text-red-500">*</span></Label>
                                <Input type="number" value={formData.age} onChange={e => updateField('age', e.target.value)} placeholder="18" className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500" />
                            </div>
                        </div>
                    </CardContent>
                )}

                {/* Step 2: Academics */}
                {step === 2 && (
                    <CardContent className="space-y-6 pt-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">Academic Background</h2>
                            <p className="text-slate-400">Tell us about your educational foundation.</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Current Education Level <span className="text-red-500">*</span></Label>
                            <Select onValueChange={(v) => updateField('education_level', v)} value={formData.education_level}>
                                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                                    <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="High School">High School (11th/12th)</SelectItem>
                                    <SelectItem value="Undergraduate">Undergraduate (B.Tech/B.Sc/etc)</SelectItem>
                                    <SelectItem value="Postgraduate">Postgraduate (M.Tech/MBA/etc)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Stream / Major <span className="text-red-500">*</span></Label>
                                <Input value={formData.stream} onChange={e => updateField('stream', e.target.value)} placeholder="e.g. Science / Engg" className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Branch / Specialization <span className="text-red-500">*</span></Label>
                                <Input value={formData.branch} onChange={e => updateField('branch', e.target.value)} placeholder="e.g. CS / Mechanical" className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">10th % <span className="text-red-500">*</span></Label>
                                <Input value={formData.marks_10th} onChange={e => updateField('marks_10th', e.target.value)} placeholder="90" className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">12th % <span className="text-red-500">*</span></Label>
                                <Input value={formData.marks_12th} onChange={e => updateField('marks_12th', e.target.value)} placeholder="85" className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Current CGPA <span className="text-red-500">*</span></Label>
                                <Input value={formData.cgpa} onChange={e => updateField('cgpa', e.target.value)} placeholder="8.5" className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500" />
                            </div>
                        </div>
                    </CardContent>
                )}

                {/* Step 3: Profile (Skills/Interests) */}
                {step === 3 && (
                    <CardContent className="space-y-6 pt-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400">Skills & Interests</h2>
                            <p className="text-slate-400">What are you good at? What do you love?</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Key Skills (Comma separated) <span className="text-red-500">*</span></Label>
                            <Textarea
                                value={formData.skills}
                                onChange={e => updateField('skills', e.target.value)}
                                placeholder="Python, Java, Public Speaking, Leadership..."
                                className="bg-slate-950 border-slate-800 h-24 text-slate-200 placeholder:text-slate-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-300">Interests / Hobbies <span className="text-red-500">*</span></Label>
                            <Textarea
                                value={formData.interests}
                                onChange={e => updateField('interests', e.target.value)}
                                placeholder="Robotics, Reading, Cricket, Finance..."
                                className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500"
                            />
                        </div>
                    </CardContent>
                )}

                {/* Step 4: Goals */}
                {step === 4 && (
                    <CardContent className="space-y-6 pt-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-amber-400">Future Goals</h2>
                            <p className="text-slate-400">Where do you see yourself?</p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Long Term Goal <span className="text-red-500">*</span></Label>
                            <Input value={formData.long_term_goal} onChange={e => updateField('long_term_goal', e.target.value)} placeholder="e.g. CTO of a Tech Company, Research Scientist" className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-300">Preferred Industry <span className="text-red-500">*</span></Label>
                                <Input value={formData.preferred_industry} onChange={e => updateField('preferred_industry', e.target.value)} placeholder="e.g. Fintech, Healthcare" className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-300">Preferred Location <span className="text-red-500">*</span></Label>
                                <Input value={formData.preferred_location} onChange={e => updateField('preferred_location', e.target.value)} placeholder="e.g. Remote, Bangalore, USA" className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Any Constraints? (Financial, Time, Location)</Label>
                            <Input value={formData.constraints} onChange={e => updateField('constraints', e.target.value)} placeholder="e.g. Need a job within 6 months" className="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-500" />
                        </div>
                    </CardContent>
                )}

                {/* Step 5: Insights & Review */}
                {step === 5 && (
                    <CardContent className="space-y-6 pt-6">
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">AI Profile Analysis</h2>
                            <p className="text-slate-400">Here is what our AI thinks before generating your path.</p>
                        </div>

                        {insights && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-950 p-4 rounded-xl border border-green-900/50">
                                    <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Strengths
                                    </h4>
                                    <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
                                        {insights.strengths?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className="bg-slate-950 p-4 rounded-xl border border-red-900/50">
                                    <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4" /> Gaps / Weaknesses
                                    </h4>
                                    <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
                                        {insights.weaknesses?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className="col-span-1 md:col-span-2 bg-slate-950 p-4 rounded-xl border border-blue-900/50">
                                    <h4 className="font-semibold text-blue-400 mb-2">💡 Suggestions for Improvement</h4>
                                    <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
                                        {insights.suggestions?.map((s: string, i: number) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className="col-span-1 md:col-span-2 text-center p-2 bg-slate-800/50 rounded-lg">
                                    <span className="text-slate-400 text-sm">Market Readiness: </span>
                                    <span className="font-bold text-white">{insights.market_readiness}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                )}

                <CardFooter className="flex justify-between border-t border-slate-800 p-6">
                    <Button variant="ghost" onClick={handleBack} disabled={step === 1 || loading} className="text-slate-400 hover:text-white">
                        <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </Button>

                    {step < 4 && (
                        <Button onClick={handleNext} className="bg-purple-600 hover:bg-purple-700 text-white">
                            Next <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    )}

                    {step === 4 && (
                        <Button onClick={fetchInsights} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px]">
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : 'Analyze Profile'}
                        </Button>
                    )}

                    {step === 5 && (
                        <Button onClick={handleFinalSubmit} className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold shadow-lg shadow-green-900/20">
                            Generate Career Future <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
