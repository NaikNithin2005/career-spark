'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquarePlus, CheckCircle2, Loader2, Star, Bug, Lightbulb, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FeedbackModal() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 1500));

        setLoading(false);
        setSuccess(true);

        // Reset after showing success
        setTimeout(() => {
            setSuccess(false);
            setOpen(false);
            setRating(0);
        }, 2000);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className="gap-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors">
                    <MessageSquarePlus className="w-4 h-4" />
                    Feedback
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-slate-950 border-slate-800 text-slate-100 p-0 overflow-hidden shadow-2xl shadow-purple-900/20">
                <AnimatePresence mode="wait">
                    {success ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center justify-center p-12 space-y-4 text-center h-[400px]"
                        >
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-2">
                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Thank You!</h3>
                            <p className="text-slate-400 max-w-xs">
                                Your feedback helps us build a better future. We appreciate your input.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <DialogHeader className="px-6 pt-6 pb-4 border-b border-slate-800 bg-slate-900/50">
                                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                                    <MessageSquarePlus className="w-5 h-5 text-purple-400" />
                                    Send Feedback
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Create a ticket. Help us improve your experience.
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Type Selection */}
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { id: 'bug', icon: Bug, label: 'Bug', color: 'text-red-400' },
                                        { id: 'feature', icon: Lightbulb, label: 'Feature', color: 'text-yellow-400' },
                                        { id: 'general', icon: MessageCircle, label: 'General', color: 'text-blue-400' }
                                    ].map((type) => (
                                        <div key={type.id} className="relative group">
                                            <input type="radio" name="type" id={type.id} className="peer sr-only" required defaultChecked={type.id === 'general'} />
                                            <label
                                                htmlFor={type.id}
                                                className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 hover:border-slate-700 cursor-pointer transition-all peer-checked:border-purple-500 peer-checked:bg-purple-500/10"
                                            >
                                                <type.icon className={`w-5 h-5 ${type.color}`} />
                                                <span className="text-xs font-medium text-slate-300">{type.label}</span>
                                            </label>
                                        </div>
                                    ))}
                                </div>

                                {/* Rating */}
                                <div className="space-y-2 text-center">
                                    <Label className="text-xs font-medium uppercase tracking-wider text-slate-500">How would you rate your experience?</Label>
                                    <div className="flex justify-center gap-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(star)}
                                            >
                                                <Star
                                                    className={`w-8 h-8 ${(hoverRating || rating) >= star
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-slate-700'
                                                        } transition-colors duration-200`}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Message */}
                                <div className="space-y-2">
                                    <Label htmlFor="message">Details</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Tell us what you think..."
                                        className="bg-slate-900 border-slate-800 focus:border-purple-500 min-h-[100px] resize-none"
                                        required
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setOpen(false)} disabled={loading}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white min-w-[100px]">
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
