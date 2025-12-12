'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Circle } from 'lucide-react';

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
                <p className="animate-pulse">Consulting with AI Career Agents...</p>
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

    if (!data || !data.phases) return null;

    return (
        <div className="space-y-8 pb-12">
            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800">
                <h3 className="text-xl font-semibold mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                    Career Outlook
                </h3>
                <p className="text-slate-300 leading-relaxed">{data.summary}</p>
            </div>

            <div className="relative space-y-8 px-4 sm:px-0">
                {/* Timeline Line (Mobile: Left, Desktop: Center) */}
                <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-700 via-slate-800 to-transparent -translate-x-1/2 hidden sm:block"></div>

                {data.phases.map((phase: any, index: number) => (
                    <div key={index} className="relative z-10">
                        <div className={`sm:flex items-center justify-between ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>

                            {/* Empty side for layout balance */}
                            <div className="hidden sm:block w-[45%]"></div>

                            {/* Center Marker */}
                            <div className="absolute left-0 sm:left-1/2 top-6 sm:-translate-x-1/2 w-8 h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center font-bold text-xs text-slate-400 shadow-xl z-20">
                                {index + 1}
                            </div>

                            {/* Content Card */}
                            <div className={`w-full sm:w-[45%] pl-10 sm:pl-0`}>
                                <Card className="bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-900">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle className="text-base font-bold text-blue-400">{phase.title}</CardTitle>
                                                <CardDescription className="text-slate-500 text-xs mt-1 font-medium bg-slate-950/50 w-fit px-2 py-0.5 rounded-full border border-slate-800">
                                                    {phase.duration}
                                                </CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <p className="text-sm text-slate-300 leading-relaxed">{phase.description}</p>

                                        {/* Skills */}
                                        {phase.skills && phase.skills.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {phase.skills.map((skill: string, i: number) => (
                                                    <Badge key={i} variant="outline" className="bg-slate-950/50 text-slate-400 border-slate-800 hover:text-white hover:border-slate-600 transition-colors">
                                                        {skill}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {phase.actions && phase.actions.length > 0 && (
                                            <div className="pt-2 border-t border-slate-800/50">
                                                <ul className="space-y-2">
                                                    {phase.actions.map((action: string, i: number) => (
                                                        <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                                                            <Circle className="w-1.5 h-1.5 mt-1 fill-current text-purple-500 shrink-0" />
                                                            <span>{action}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
