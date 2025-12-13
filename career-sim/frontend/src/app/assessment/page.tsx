'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, BrainCircuit, CheckCircle, AlertTriangle, ArrowRight, ExternalLink, Trophy, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssessmentPage() {
    // --- State ---
    const [step, setStep] = useState<'setup' | 'quiz' | 'result'>('setup');
    const [loading, setLoading] = useState(false);

    // Setup State
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('Intermediate');
    const [questionCount, setQuestionCount] = useState(5);

    // Quiz State
    const [quizData, setQuizData] = useState<any>(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({}); // q_id -> selected_index

    // Result State
    const [result, setResult] = useState<any>(null);

    // --- Handlers ---

    const handleGenerateQuiz = async () => {
        if (!topic) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/generate-assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic, difficulty, count: questionCount })
            });
            if (!res.ok) throw new Error("Failed to generate quiz");
            const data = await res.json();

            setQuizData(data);
            setStep('quiz');
            setCurrentQIndex(0);
            setAnswers({});
        } catch (e) {
            alert("Error: " + e);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectOption = (qId: number, optionIdx: number) => {
        setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };

    const handleSubmitQuiz = async () => {
        setLoading(true);
        // Transform answers to format backend expects
        const userAnswersList = Object.entries(answers).map(([qId, idx]) => ({
            question_id: parseInt(qId),
            selected_index: idx
        }));

        try {
            const res = await fetch('http://localhost:8000/api/evaluate-assessment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    topic,
                    user_answers: userAnswersList,
                    quiz_context: quizData.questions
                })
            });
            if (!res.ok) throw new Error("Failed to evaluate results");
            const data = await res.json();
            setResult(data);
            setStep('result');
        } catch (e) {
            alert("Error evaluating: " + e);
        } finally {
            setLoading(false);
        }
    };

    const handleRestart = () => {
        setStep('setup');
        setQuizData(null);
        setResult(null);
        setAnswers({});
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <BrainCircuit className="text-white w-5 h-5" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            Skill Assessment
                        </span>
                    </div>
                    <Link href="/">
                        <Button variant="ghost" className="text-slate-400 hover:text-white">Back to Dashboard</Button>
                    </Link>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-6 py-12">

                <AnimatePresence mode="wait">

                    {/* STEP 1: SETUP */}
                    {step === 'setup' && (
                        <motion.div
                            key="setup"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-xl mx-auto space-y-8"
                        >
                            <div className="text-center space-y-4">
                                <h1 className="text-4xl font-bold text-white">Test Your Knowledge</h1>
                                <p className="text-slate-400">
                                    Take a scenario-based AI assessment to pinpoint your strengths and identify gaps.
                                </p>
                            </div>

                            <Card className="bg-slate-900 border-slate-800 shadow-2xl">
                                <CardContent className="pt-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label className="text-lg font-medium text-white">Skill / Topic</Label>
                                        <Input
                                            placeholder="e.g. React, Python Data Science, Project Management..."
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                            className="bg-slate-950 border-slate-700 h-12 text-lg text-white"
                                        />
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-white uppercase tracking-wider">Difficulty Level</Label>
                                            <RadioGroup defaultValue="Intermediate" onValueChange={setDifficulty} className="grid grid-cols-3 gap-4">
                                                {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                                                    <div key={level}>
                                                        <RadioGroupItem value={level} id={level} className="peer sr-only" />
                                                        <Label
                                                            htmlFor={level}
                                                            className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-white hover:bg-slate-800 hover:border-slate-600 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 peer-data-[state=checked]:text-blue-400 cursor-pointer transition-all text-sm font-medium"
                                                        >
                                                            {level}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-sm font-medium text-white uppercase tracking-wider">Question Count</Label>
                                            <RadioGroup defaultValue="5" onValueChange={(v) => setQuestionCount(parseInt(v))} className="grid grid-cols-3 gap-4">
                                                {[5, 10, 15].map((num) => (
                                                    <div key={num}>
                                                        <RadioGroupItem value={num.toString()} id={`q${num}`} className="peer sr-only" />
                                                        <Label
                                                            htmlFor={`q${num}`}
                                                            className="flex flex-col items-center justify-center rounded-lg border border-slate-700 bg-slate-900/50 p-3 text-white hover:bg-slate-800 hover:border-slate-600 peer-data-[state=checked]:border-blue-500 peer-data-[state=checked]:bg-blue-500/10 peer-data-[state=checked]:text-blue-400 cursor-pointer transition-all text-sm font-medium"
                                                        >
                                                            {num} Questions
                                                        </Label>
                                                    </div>
                                                ))}
                                            </RadioGroup>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleGenerateQuiz}
                                        disabled={!topic || loading}
                                        className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                                    >
                                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <BrainCircuit className="w-5 h-5 mr-2" />}
                                        Start Assessment
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 2: QUIZ */}
                    {step === 'quiz' && quizData && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div className="flex justify-between items-center text-slate-400 font-medium">
                                <span>Question {currentQIndex + 1} of {quizData.questions.length}</span>
                                <Badge variant="outline" className="border-blue-500/50 text-blue-400">{difficulty}</Badge>
                            </div>

                            <Card className="bg-slate-900 border-slate-800 border-t-4 border-t-blue-500 shadow-2xl">
                                <CardHeader>
                                    <div className="text-sm text-blue-400 font-bold mb-2 uppercase tracking-wider">Scenario</div>
                                    <CardDescription className="text-slate-300 text-lg leading-relaxed font-medium">
                                        {quizData.questions[currentQIndex].scenario}
                                    </CardDescription>
                                    <div className="mt-4 pt-4 border-t border-slate-800">
                                        <h3 className="text-xl font-bold text-white">
                                            {quizData.questions[currentQIndex].question}
                                        </h3>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-2">
                                    {quizData.questions[currentQIndex].options.map((opt: string, idx: number) => (
                                        <button
                                            key={idx}
                                            onClick={() => handleSelectOption(quizData.questions[currentQIndex].id, idx)}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${answers[quizData.questions[currentQIndex].id] === idx
                                                ? "border-blue-500 bg-blue-500/10 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                                                : "border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-600 hover:bg-slate-900"
                                                }`}
                                        >
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${answers[quizData.questions[currentQIndex].id] === idx ? "border-blue-500" : "border-slate-600"
                                                }`}>
                                                {answers[quizData.questions[currentQIndex].id] === idx && <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />}
                                            </div>
                                            {opt}
                                        </button>
                                    ))}
                                </CardContent>
                                <CardFooter className="flex justify-between pt-6 border-t border-slate-800">
                                    <Button
                                        variant="ghost"
                                        disabled={currentQIndex === 0}
                                        onClick={() => setCurrentQIndex(i => i - 1)}
                                    >
                                        Previous
                                    </Button>

                                    {currentQIndex < quizData.questions.length - 1 ? (
                                        <Button
                                            onClick={() => setCurrentQIndex(i => i + 1)}
                                            disabled={answers[quizData.questions[currentQIndex].id] === undefined}
                                            className="bg-white text-slate-900 hover:bg-slate-200"
                                        >
                                            Next Question <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleSubmitQuiz}
                                            disabled={loading || answers[quizData.questions[currentQIndex].id] === undefined}
                                            className="bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trophy className="w-4 h-4 mr-2" />}
                                            Submit Assessment
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        </motion.div>
                    )}

                    {/* STEP 3: RESULT */}
                    {step === 'result' && result && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-8"
                        >
                            {/* Score Card */}
                            <Card className="bg-slate-900/80 border-slate-800 overflow-hidden relative">
                                <div className="absolute inset-0 bg-blue-500/5 pointer-events-none" />
                                <CardContent className="pt-12 pb-10 flex flex-col items-center justify-center text-center">
                                    <div className="relative w-48 h-48 mb-6">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle className="text-slate-800 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent"></circle>
                                            <circle
                                                className={`stroke-current transition-all duration-1000 ease-out ${result.score >= 80 ? "text-green-500" : result.score >= 50 ? "text-yellow-500" : "text-red-500"}`}
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                cx="50"
                                                cy="50"
                                                r="40"
                                                fill="transparent"
                                                strokeDasharray={`${2 * Math.PI * 40}`}
                                                strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.score / 100)}`}
                                            ></circle>
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-5xl font-bold text-white">{result.score}</span>
                                            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Score</span>
                                        </div>
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {result.score >= 80 ? "Mastery Achieved! 🚀" : result.score >= 50 ? "Solid Foundation 📈" : "Room to Grow 🌱"}
                                    </h2>
                                    <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
                                        {result.summary}
                                    </p>
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Weak Areas */}
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5 text-yellow-500" /> Focus Areas
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            {result.weak_areas?.map((area: string, i: number) => (
                                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-200">
                                                    <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                                                    {area}
                                                </div>
                                            ))}
                                            {(!result.weak_areas || result.weak_areas.length === 0) && (
                                                <div className="text-green-400 flex items-center gap-2">
                                                    <CheckCircle className="w-5 h-5" /> No specific weak areas detected!
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Recommendations */}
                                <Card className="bg-slate-900/50 border-slate-800">
                                    <CardHeader>
                                        <CardTitle className="text-white flex items-center gap-2">
                                            <BrainCircuit className="w-5 h-5 text-green-500" /> Recommended Learning
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {result.recommendations?.map((rec: any, i: number) => (
                                                <div
                                                    key={i}
                                                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(`${rec.title} ${rec.type}`)}`, '_blank')}
                                                    className="flex justify-between items-start gap-4 p-3 rounded-lg bg-slate-950 hover:bg-slate-900 transition-colors border border-slate-800 cursor-pointer group"
                                                >
                                                    <div>
                                                        <h4 className="font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">{rec.title}</h4>
                                                        <Badge variant="secondary" className="mt-1 text-xs">{rec.type}</Badge>
                                                    </div>
                                                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-blue-400" />
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-center pt-8">
                                <Button onClick={handleRestart} variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                                    <RotateCcw className="w-4 h-4 mr-2" /> Take Another Assessment
                                </Button>
                            </div>

                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
