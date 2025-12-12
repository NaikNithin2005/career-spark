'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowRight } from 'lucide-react';

export function InputForm({ onSubmit }: { onSubmit: (data: any) => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        education: '',
        stream: '',
        interests: '',
        target_role: '',
        experience_level: 'Student',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API delay or validation logic if needed
        // In a real flow, the parent handles the API call
        setTimeout(() => {
            onSubmit(formData);
            setLoading(false);
        }, 500);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto py-8 text-slate-200">
            <div className="space-y-2 text-center mb-8">
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    Tell us about yourself
                </h3>
                <p className="text-slate-400">
                    We'll analyze your profile to build a personalized career roadmap.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="education">Current Education Level</Label>
                    <Select onValueChange={(v) => setFormData({ ...formData, education: v })}>
                        <SelectTrigger className="bg-slate-950 border-slate-800">
                            <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="High School">High School (11th/12th)</SelectItem>
                            <SelectItem value="Undergraduate">Undergraduate (B.Tech/B.Sc/etc)</SelectItem>
                            <SelectItem value="Postgraduate">Postgraduate (M.Tech/MBA/etc)</SelectItem>
                            <SelectItem value="Professional">Early Professional</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="stream">Stream / Major</Label>
                    <Input
                        id="stream"
                        placeholder="e.g. Computer Science, Commerce"
                        value={formData.stream}
                        onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                        className="bg-slate-900 border-slate-800"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="interests">Key Interests & Skills</Label>
                <Textarea
                    id="interests"
                    placeholder="e.g. Coding, Design, AI, solving math problems..."
                    className="min-h-[100px] bg-slate-900 border-slate-800"
                    value={formData.interests}
                    onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="role">Target Role (Optional)</Label>
                <Input
                    id="role"
                    placeholder="e.g. Data Scientist, Product Manager"
                    value={formData.target_role}
                    onChange={(e) => setFormData({ ...formData, target_role: e.target.value })}
                    className="bg-slate-900 border-slate-800"
                />
            </div>

            <Button type="submit" size="lg" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold" disabled={loading}>
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Profile...
                    </>
                ) : (
                    <>
                        Generate Career Path <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                )}
            </Button>
        </form>
    );
}
