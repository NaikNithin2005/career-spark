'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Loader2, Circle, Trophy, TrendingUp, Lightbulb } from 'lucide-react';

interface RoadmapViewProps {
    inputData: any;
    onReset?: () => void;
}

export function RoadmapView({ inputData }: RoadmapViewProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            if (!inputData) return;
            try {
                setLoading(true);
                setError('');
                // Ensure backend is running at this URL
                const res = await fetch('http://localhost:8000/api/generate-roadmap', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(inputData)
                });

                if (!res.ok) {
                    const errText = await res.text();
                    throw new Error(errText || 'Failed to generate roadmap');
                }

                const json = await res.json();
                if (json.error) throw new Error(json.error);

                setData(json);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Something went wrong. Please check if the backend is running.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [inputData]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400 space-y-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <p className="animate-pulse">Simulating multiple career universes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-400 p-8 rounded-xl border border-red-900/50 bg-red-950/10">
                <p>{error}</p>
            </div>
        );
    }

    if (!data || !data.options) return null;

    return (
        <div className="space-y-6 pb-12 w-full">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 backdrop-blur-md">
                <h3 className="text-xl font-semibold mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Career Simulation Results
                </h3>
                <p className="text-slate-300">We generated {data.options.length} potential futures for you.</p>
            </div>

            <Tabs defaultValue="option-0" className="w-full">
                <TabsList className="flex w-full overflow-x-auto space-x-2 bg-transparent p-1 mb-4 no-scrollbar border-none justify-start h-auto">
                    {data.options.map((opt: any, idx: number) => (
                        <TabsTrigger
                            key={idx}
                            value={`option-${idx}`}
                            className="flex-shrink-0 px-4 py-2 rounded-full border border-slate-700 bg-slate-900/50 data-[state=active]:bg-purple-600 data-[state=active]:border-purple-500 data-[state=active]:text-white text-slate-400 transition-all text-xs sm:text-sm whitespace-nowrap hover:bg-slate-800"
                        >
                            {idx === 0 && <TrendingUp className="w-4 h-4 mr-2 inline-block" />}
                            {idx === 1 && <Trophy className="w-4 h-4 mr-2 inline-block" />}
                            {idx === 2 && <Lightbulb className="w-4 h-4 mr-2 inline-block" />}
                            {opt.option_name}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {data.options.map((opt: any, idx: number) => (
                    <TabsContent key={idx} value={`option-${idx}`} className="space-y-6 mt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Option Summary */}
                        <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
                            <CardContent className="pt-6">
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-white mb-2">{opt.option_name}</h4>
                                        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">{opt.summary}</p>
                                    </div>
                                    <Badge variant="secondary" className={`text-sm px-3 py-1 ${opt.match_score > 80 ? 'bg-green-900/30 text-green-400 border-green-900' : 'bg-yellow-900/30 text-yellow-400 border-yellow-900'} border`}>
                                        {opt.match_score}% Match
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <div className="relative space-y-8 px-4 sm:px-0 py-8">
                            {/* Vertical line logic */}
                            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-800 via-purple-900/50 to-transparent -translate-x-1/2 hidden sm:block"></div>

                            {opt.phases.map((phase: any, pIdx: number) => (
                                <div key={pIdx} className="relative z-10 group">
                                    <div className={`sm:flex items-center justify-between ${pIdx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className="hidden sm:block w-[45%]"></div>

                                        {/* Timeline Node */}
                                        <div className="absolute left-0 sm:left-1/2 top-6 sm:-translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 group-hover:border-purple-500 group-hover:shadow-[0_0_10px_rgba(168,85,247,0.5)] transition-all flex items-center justify-center font-bold text-xs text-slate-400 z-20">
                                            {pIdx + 1}
                                        </div>

                                        <div className={`w-full sm:w-[45%] pl-10 sm:pl-0 transform transition-all duration-300 hover:scale-[1.02]`}>
                                            <Card className="bg-slate-900/80 border-slate-800 hover:border-purple-500/30 transition-all hover:bg-slate-900 overflow-hidden relative">
                                                {/* Decorative gradient */}
                                                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-600"></div>

                                                <CardHeader className="pb-3 pl-6">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <CardTitle className="text-base font-bold text-slate-100">{phase.title}</CardTitle>
                                                            <CardDescription className="text-purple-400 text-xs mt-1 font-medium bg-purple-950/20 w-fit px-2 py-0.5 rounded-full border border-purple-900/50">
                                                                {phase.duration}
                                                            </CardDescription>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="space-y-4 pl-6">
                                                    <p className="text-sm text-slate-300 leading-relaxed">{phase.description}</p>
                                                    {phase.skills && (
                                                        <div className="flex flex-wrap gap-2">
                                                            {phase.skills.map((skill: string, i: number) => (
                                                                <Badge key={i} variant="outline" className="bg-slate-950/50 text-slate-400 border-slate-800 group-hover:border-slate-600">
                                                                    {skill}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {phase.actions && phase.actions.length > 0 && (
                                                        <ul className="space-y-2 mt-4 pt-4 border-t border-slate-800/50">
                                                            {phase.actions.map((action: string, i: number) => (
                                                                <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                                    <Circle className="w-1.5 h-1.5 mt-1 fill-current text-green-500 shrink-0" />
                                                                    {action}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}
