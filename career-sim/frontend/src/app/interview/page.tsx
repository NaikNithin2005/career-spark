'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, MessageSquare, Mic, StopCircle, User, Bot, Lightbulb, CheckCircle, ArrowRight, Video, Zap, Sparkles, Brain, Gavel, HeartHandshake } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';


interface Message {
    role: 'user' | 'ai';
    content: string;
}

interface StyleFeedback {
    clarity: 'High' | 'Medium' | 'Low' | 'N/A';
    confidence: 'High' | 'Medium' | 'Low' | 'N/A';
    tips: string[];
}

interface InterviewFeedback {
    score: number;
    communication_rating: string;
    confidence_rating: string;
    improvement_suggestions: string[];
    ideal_answers: string[];
}




export default function InterviewPage() {
    
    const [step, setStep] = useState<'setup' | 'chat' | 'feedback'>('setup');
    const [loading, setLoading] = useState(false);

    // Setup State
    const [role, setRole] = useState('');
    const [focus, setFocus] = useState('Technical');
    const [persona, setPersona] = useState('Friendly'); // Friendly, Ruthless, Socratic

    // Chat State
    const [messages, setMessages] = useState<Message[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [lastQuestion, setLastQuestion] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Voice State
    const [isListening, setIsListening] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    // Feedback State
    const [currentStyleFeedback, setCurrentStyleFeedback] = useState<StyleFeedback | null>(null);
    const [feedback, setFeedback] = useState<InterviewFeedback | null>(null);

    // --- Helpers ---
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in (window as any)) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const SpeechRecognition = (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onresult = (event: any) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    transcript += event.results[i][0].transcript;
                }
                setCurrentInput(transcript);
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
                if (event.error === 'not-allowed') {
                    alert("Microphone access denied. Please allow microphone permission.");
                }
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            }
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            setCurrentInput('');
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    // --- Handlers ---

    const handleStartInterview = async () => {
        if (!role) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/start-interview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, focus, persona })
            });
            if (!res.ok) throw new Error("Failed to start interview");
            const data = await res.json();

            setMessages([{ role: 'ai', content: data.message }, { role: 'ai', content: data.question }]);
            setLastQuestion(data.question);
            setStep('chat');
        } catch (e) {
            alert("Error: " + e);
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!currentInput.trim()) return;

        const userMsg = currentInput;
        setCurrentInput('');
        if (isListening) recognitionRef.current?.stop();

        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const res = await fetch('http://localhost:8000/api/interview-interaction', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role,
                    history: [],
                    last_question: lastQuestion,
                    user_answer: userMsg,
                    persona
                })
            });

            if (!res.ok) throw new Error("Failed to send message");
            const data = await res.json();

            if (data.style_feedback) {
                setCurrentStyleFeedback(data.style_feedback);
            }

            if (data.message) {
                setMessages((prev: Message[]) => [...prev, { role: 'ai', content: data.message }]);
            }
            setMessages((prev: Message[]) => [...prev, { role: 'ai', content: data.next_question }]);
            setLastQuestion(data.next_question);

        } catch (e) {
            alert("Error: " + e);
        } finally {
            setLoading(false);
        }
    };

    const handleEndInterview = async () => {
        setLoading(true);
        try {
            const historyPairs = [];
            for (let i = 0; i < messages.length - 1; i++) {
                if (messages[i].role === 'ai' && messages[i + 1].role === 'user') {
                    historyPairs.push({
                        question: messages[i].content,
                        answer: messages[i + 1].content
                    });
                }
            }

            const res = await fetch('http://localhost:8000/api/interview-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role,
                    history: historyPairs
                })
            });

            if (!res.ok) throw new Error("Failed to get feedback");
            const data = await res.json();
            setFeedback(data);
            setStep('feedback');

        } catch (e) {
            alert("Error: " + e);
        } finally {
            setLoading(false);
        }
    };

    const personas = [
        { id: 'Friendly', icon: HeartHandshake, color: 'text-green-400', desc: 'Supportive HR style. Hints allowed.' },
        { id: 'Ruthless', icon: Gavel, color: 'text-red-400', desc: 'Strict Tech Lead. Interrupts errors.' },
        { id: 'Socratic', icon: Brain, color: 'text-blue-400', desc: 'Mentor style. Asks "Why?" repeatedly.' },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-purple-500/30">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-900/20">
                            <MessageSquare className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            AI Interviewer
                        </span>
                    </div>
                    <Link href="/">
                        <Button variant="ghost" className="text-slate-400 hover:text-white">Back to Dashboard</Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">

                    {/* STEP 1: SETUP */}
                    {step === 'setup' && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-2xl mx-auto space-y-8 mt-8"
                        >
                            <div className="text-center space-y-4">
                                <h1 className="text-4xl font-bold text-white">Mock Interview Simulator</h1>
                                <p className="text-slate-400">
                                    Configure your session. Choose a role and your interviewer's personality.
                                </p>
                            </div>

                            <Card className="bg-slate-900 border-slate-800 shadow-2xl">
                                <CardContent className="pt-8 space-y-8">
                                    <div className="space-y-4">
                                        <Label className="text-lg font-medium text-white">Target Role</Label>
                                        <Input
                                            placeholder="e.g. Senior Frontend Dev, Product Manager..."
                                            value={role}
                                            onChange={(e) => setRole(e.target.value)}
                                            className="bg-slate-950 border-slate-700 h-12 text-lg text-white"
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-lg font-medium text-white">Select Interviewer Persona</Label>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {personas.map((p) => (
                                                <div
                                                    key={p.id}
                                                    onClick={() => setPersona(p.id)}
                                                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:bg-slate-800 relative ${persona === p.id ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-900/20' : 'border-slate-700 bg-slate-950/50'}`}
                                                >
                                                    {persona === p.id && (
                                                        <div className="absolute top-2 right-2 text-purple-500"><CheckCircle className="w-4 h-4" /></div>
                                                    )}
                                                    <div className={`mb-3 ${p.color}`}>
                                                        <p.icon className="w-8 h-8" />
                                                    </div>
                                                    <h3 className="font-bold text-white mb-1">{p.id}</h3>
                                                    <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-medium text-white uppercase tracking-wider">Interview Focus</Label>
                                        <RadioGroup defaultValue="Technical" onValueChange={setFocus} className="grid grid-cols-2 gap-4">
                                            {['Technical', 'Behavioral'].map((type) => (
                                                <div key={type}>
                                                    <RadioGroupItem value={type} id={type} className="peer sr-only" />
                                                    <Label
                                                        htmlFor={type}
                                                        className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 p-4 text-white hover:bg-slate-800 hover:border-slate-600 peer-data-[state=checked]:border-purple-500 peer-data-[state=checked]:bg-purple-500/10 peer-data-[state=checked]:text-purple-400 cursor-pointer transition-all font-medium"
                                                    >
                                                        {type}
                                                    </Label>
                                                </div>
                                            ))}
                                        </RadioGroup>
                                    </div>

                                    <Button
                                        onClick={handleStartInterview}
                                        disabled={!role || loading}
                                        className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-xl shadow-purple-900/20"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Mic className="w-5 h-5 mr-2" />}
                                        Start Interview
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 2: CHAT (SPLIT VIEW) */}
                    {step === 'chat' && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="h-[85vh] grid grid-cols-1 lg:grid-cols-12 gap-6"
                        >
                            {/* LEFT PANEL: CHAT */}
                            <div className="lg:col-span-8 flex flex-col h-full bg-slate-900/50 rounded-2xl border border-slate-800 overflow-hidden relative">
                                {/* Header */}
                                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse absolute top-0 right-0"></div>
                                            <Video className="w-6 h-6 text-slate-400" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-white leading-tight">{role}</h2>
                                            <div className="flex items-center gap-2 text-xs font-medium tracking-wide">
                                                <span className="text-slate-400">LIVE SESSION</span>
                                                <span className="text-slate-600">•</span>
                                                <span className={personas.find(p => p.id === persona)?.color}>{persona} Mode</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button variant="destructive" size="sm" onClick={handleEndInterview} disabled={loading} className="gap-2">
                                        <StopCircle className="w-4 h-4" /> End
                                    </Button>
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar scroll-smooth">
                                    {messages.map((msg, i) => (
                                        <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'ai' ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                                {msg.role === 'ai' ? <Bot className="w-6 h-6 text-white" /> : <User className="w-6 h-6 text-slate-300" />}
                                            </div>
                                            <div className={`max-w-[80%] space-y-1 ${msg.role === 'user' ? 'items-end flex flex-col' : ''}`}>
                                                <div className="text-xs text-slate-400 px-1 font-medium">{msg.role === 'ai' ? 'Interviewer' : 'You'}</div>
                                                <div className={`p-4 rounded-2xl text-base leading-relaxed shadow-md ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {loading && (
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                                <Bot className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="bg-slate-800 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 border border-slate-700">
                                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></span>
                                                <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></span>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                {/* Input Area */}
                                <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-4">


                                    <div className="flex gap-4 items-center">
                                        <Button
                                            onClick={toggleListening}
                                            variant={isListening ? "destructive" : "secondary"}
                                            className={`rounded-full w-12 h-12 flex items-center justify-center shrink-0 transition-all ${isListening ? 'animate-pulse ring-4 ring-red-500/20' : 'bg-slate-800 hover:bg-slate-700'}`}
                                            title={isListening ? "Stop Listening" : "Start Speaking"}
                                        >
                                            {isListening ? <StopCircle className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                                        </Button>

                                        <div className="flex-1 relative">
                                            <Input
                                                value={currentInput}
                                                onChange={(e) => setCurrentInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                                                placeholder={isListening ? "Listening... start speaking..." : "Type your answer or use microphone..."}
                                                className={`bg-slate-900 border-slate-700 text-white h-12 pr-12 ${isListening ? 'border-red-500/50' : ''}`}
                                                disabled={loading}
                                                autoFocus
                                            />
                                        </div>

                                        <Button onClick={handleSendMessage} disabled={!currentInput.trim() || loading} className="w-12 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center shrink-0">
                                            <ArrowRight className="w-6 h-6" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT PANEL: STYLE ENHANCEMENTS */}
                            <div className="lg:col-span-4 flex flex-col gap-6">
                                <Card className="bg-slate-900 border-slate-800 shadow-xl h-full flex flex-col overflow-hidden">
                                    <CardHeader className="bg-slate-950/50 border-b border-slate-800 pb-4">
                                        <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                                            <Sparkles className="w-5 h-5 text-purple-400" />
                                            Style Enhancements
                                        </CardTitle>
                                        <CardDescription className="text-xs">
                                            Real-time analysis of your speech patterns
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-6 flex-1 bg-gradient-to-b from-slate-900 to-slate-950">
                                        {currentStyleFeedback ? (
                                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                                {/* Confidence Meter */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm font-medium text-slate-300">
                                                        <span>Confidence</span>
                                                        <span className={currentStyleFeedback.confidence === 'High' ? 'text-green-400' : currentStyleFeedback.confidence === 'Medium' ? 'text-yellow-400' : 'text-red-400'}>{currentStyleFeedback.confidence}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-700 ${currentStyleFeedback.confidence === 'High' ? 'bg-green-500 w-full' : currentStyleFeedback.confidence === 'Medium' ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-1/3'}`}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Clarity Meter */}
                                                <div className="space-y-2">
                                                    <div className="flex justify-between text-sm font-medium text-slate-300">
                                                        <span>Clarity</span>
                                                        <span className={currentStyleFeedback.clarity === 'High' ? 'text-green-400' : currentStyleFeedback.clarity === 'Medium' ? 'text-yellow-400' : 'text-red-400'}>{currentStyleFeedback.clarity}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-800 rounded-full h-2">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-700 ${currentStyleFeedback.clarity === 'High' ? 'bg-green-500 w-full' : currentStyleFeedback.clarity === 'Medium' ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-1/3'}`}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="h-[1px] bg-slate-800 w-full my-4"></div>

                                                {/* Tips */}
                                                <div className="space-y-3">
                                                    <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                                        <Zap className="w-4 h-4" /> Live Tips
                                                    </h4>
                                                    <div className="grid gap-3">
                                                        {currentStyleFeedback.tips?.map((tip: string, i: number) => (
                                                            <div key={i} className="flex gap-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                                                <Lightbulb className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
                                                                <span className="text-sm text-slate-300">{tip}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                                                    <Sparkles className="w-8 h-8 text-slate-600" />
                                                </div>
                                                <p className="text-sm text-slate-500 max-w-[200px]">
                                                    Start speaking to receive real-time style analysis...
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: FEEDBACK (UNCHANGED) */}
                    {step === 'feedback' && feedback && (
                        <motion.div
                            key="feedback"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-8 mt-12 mb-12"
                        >
                            {/* Score Card */}
                            <Card className="bg-slate-900/80 border-slate-800 overflow-hidden relative">
                                <div className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
                                <CardContent className="pt-12 pb-10 flex flex-col items-center justify-center text-center">
                                    <div className="relative w-48 h-48 mb-6">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle className="text-slate-800 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                                            <circle
                                                className={`stroke-current transition-all duration-1000 ease-out ${feedback.score >= 80 ? "text-green-500" : feedback.score >= 50 ? "text-yellow-500" : "text-red-500"}`}
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                strokeDasharray={`${2 * Math.PI * 40}`}
                                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - feedback.score / 100)}`}
                                            ></circle>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-5xl font-bold text-white">{feedback.score}</span>
                                            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Score</span>
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-4">Interview Analysis</h2>
                                    <div className="flex gap-4">
                                        <Badge variant="outline" className="text-purple-400 border-purple-500/50 p-2">Communication: {feedback.communication_rating || 'N/A'}</Badge>
                                        <Badge variant="outline" className="text-blue-400 border-blue-500/50 p-2">Confidence: {feedback.confidence_rating || 'N/A'}</Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <Lightbulb className="w-5 h-5 text-yellow-500" /> Improvement Plan
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-3">
                                            {feedback.improvement_suggestions?.map((item: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-slate-300">
                                                    <ArrowRight className="w-4 h-4 text-yellow-500 mt-1 shrink-0" />
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>

                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-500" /> Ideal Answers
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {feedback.ideal_answers?.map((item: any, i: number) => (
                                                <div key={i} className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                                                    <p className="font-semibold text-purple-400 text-sm mb-1">Concept</p>
                                                    <p className="text-slate-300 text-sm">{item}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-center">
                                <Button onClick={() => setStep('setup')} variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                                    Start New Interview
                                </Button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>
        </div>
    );
}
