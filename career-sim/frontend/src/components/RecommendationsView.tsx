'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Briefcase, BookOpen, ExternalLink, MapPin, DollarSign, Clock } from 'lucide-react';

interface RecommendationsViewProps {
    userData: any;
    careerPath: string;
}

export function RecommendationsView({ userData, careerPath }: RecommendationsViewProps) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchRecs = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_data: userData, career_path: careerPath })
                });

                if (!res.ok) throw new Error('Failed to fetch recommendations');
                const json = await res.json();
                setData(json);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRecs();
    }, [userData, careerPath]);

    if (loading) {
        return (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <p>Scouting job market & learning resources...</p>
            </div>
        );
    }

    if (error) {
        return <div className="text-red-400 p-4 border border-red-900 rounded-lg bg-red-950/20">Error: {error}</div>;
    }

    if (!data) return null;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Jobs Section */}
            <div>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-blue-400" />
                    Recommended Roles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.jobs.map((job: any, idx: number) => (
                        <Card key={idx} className="bg-slate-900/40 border-slate-800 hover:border-blue-500/30 transition-all hover:bg-slate-900 group">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-slate-100 group-hover:text-blue-400 transition-colors">{job.title}</CardTitle>
                                <CardDescription className="text-slate-400 flex items-center gap-2">
                                    {job.company}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <Badge variant="secondary" className="bg-slate-950 text-slate-400 border-slate-800 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> {job.location}
                                    </Badge>
                                    <Badge variant="secondary" className="bg-green-950/30 text-green-400 border-green-900/30 flex items-center gap-1">
                                        <DollarSign className="w-3 h-3" /> {job.salary}
                                    </Badge>
                                </div>

                                <div className="text-sm text-slate-400 border-t border-slate-800 pt-3 mt-2">
                                    <p className="mb-2 font-medium text-slate-300">Requirements:</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        {job.requirements.slice(0, 3).map((req: string, i: number) => (
                                            <li key={i} className="truncate">{req}</li>
                                        ))}
                                    </ul>
                                </div>

                                <Button className="w-full mt-2 bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/50">
                                    Apply Now <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Courses Section */}
            <div>
                <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-purple-400" />
                    Learning Resources
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.courses.map((course: any, idx: number) => (
                        <Card key={idx} className="bg-slate-900/40 border-slate-800 hover:border-purple-500/30 transition-all hover:bg-slate-900 group">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-slate-100 group-hover:text-purple-400 transition-colors">{course.title}</CardTitle>
                                <CardDescription className="text-slate-400">
                                    {course.provider}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <Badge variant="outline" className="border-purple-900/50 text-purple-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {course.duration}
                                    </Badge>
                                    <Badge variant="outline" className="border-slate-800 text-slate-400">
                                        {course.difficulty}
                                    </Badge>
                                </div>

                                <div className="text-sm text-slate-400 border-t border-slate-800 pt-3 mt-2">
                                    <p className="mb-2 font-medium text-slate-300">Skills you'll gain:</p>
                                    <div className="flex flex-wrap gap-1">
                                        {course.skills.map((skill: string, i: number) => (
                                            <span key={i} className="px-2 py-0.5 bg-slate-950 text-slate-500 rounded text-xs">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <Button className="w-full mt-2 bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white border border-purple-600/50">
                                    Start Learning <ExternalLink className="w-3 h-3 ml-2" />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
