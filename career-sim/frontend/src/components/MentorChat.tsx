'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
    role: 'user' | 'model';
    parts: string[];
}

export function MentorChat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', parts: ['Hello! I am your AI Career Mentor. I can help you with career advice, learning resources, and more. What\'s on your mind?'] }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input.trim();
        setInput('');

        // Add user message
        const newHistory: Message[] = [...messages, { role: 'user', parts: [userMsg] }];
        setMessages(newHistory);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    history: newHistory.map(m => ({ role: m.role, parts: m.parts })),
                    message: userMsg
                })
            });

            if (!res.ok) throw new Error('Failed');
            const data = await res.json();

            // Add model response
            // data.parts is list of strings
            setMessages(prev => [...prev, { role: 'model', parts: data.parts }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', parts: ["I'm sorry, I'm having trouble connecting to the server. Please check your connection."] }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-900/30">
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 min-h-0">
                <div className="space-y-4 pr-3">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                            <Avatar className="w-8 h-8 border border-white/10 shrink-0">
                                {msg.role === 'user' ? (
                                    <AvatarFallback className="bg-purple-600 text-white"><User className="w-4 h-4" /></AvatarFallback>
                                ) : (
                                    <AvatarFallback className="bg-green-600 text-white"><Bot className="w-4 h-4" /></AvatarFallback>
                                )}
                            </Avatar>
                            <div className={`rounded-xl p-3 text-sm max-w-[85%] leading-relaxed shadow-md ${msg.role === 'user'
                                ? 'bg-purple-600 text-white rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
                                }`}>
                                {msg.parts.map((part, j) => (
                                    <p key={j} className="whitespace-pre-wrap">{part}</p>
                                ))}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex gap-3">
                            <Avatar className="w-8 h-8 border border-white/10 shrink-0">
                                <AvatarFallback className="bg-green-600 text-white"><Bot className="w-4 h-4" /></AvatarFallback>
                            </Avatar>
                            <div className="bg-slate-800 rounded-xl rounded-tl-none p-3 border border-slate-700 flex items-center">
                                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                            </div>
                        </div>
                    )}
                    <div ref={scrollRef} className="h-2" />
                </div>
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask guidance..."
                        className="bg-slate-950 border-slate-800 text-slate-200 focus-visible:ring-purple-500 rounded-full pl-5"
                    />
                    <Button type="submit" size="icon" disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-10 h-10 shrink-0">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
