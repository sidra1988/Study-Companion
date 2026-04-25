/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Search, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  Zap, 
  BrainCircuit, 
  Lightbulb, 
  ChevronRight,
  Loader2,
  Sparkles,
  Book,
  Save,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from "motion/react";
import Markdown from 'react-markdown';

// Initialize Gemini API
const ai = new GoogleGenAI({ 
  apiKey: import.meta.env.VITE_GEMINI_API_KEY || (process.env.GEMINI_API_KEY as string) 
});

const SYSTEM_INSTRUCTION = `You are an intelligent AI Study Companion designed to help students learn efficiently, stay focused, and avoid procrastination.
Your task is to analyze the user's input and generate a structured learning response.

Your response MUST include the following 7 sections, using these EXACT headings (Markdown H2):
## 1. 📘 Simple Explanation
- Explain the concept in very simple terms (like teaching a beginner)

## 2. 📗 Detailed Explanation
- Provide a deeper explanation with examples

## 3. 📝 Key Points Summary
- Give 5–8 bullet points of the most important ideas

## 4. 🧠 Quiz Questions
- Create 5 questions (mix of MCQs and short questions)

## 5. ⏱️ Smart Study Plan
- Suggest a short study plan (e.g., 30–60 minutes breakdown)

## 6. 💡 Real-Life Analogy
- Relate the concept to something from everyday life

## 7. 🚀 Motivation Boost
- If the user's tone suggests confusion, stress, or procrastination:
  - Add a short encouraging message
- Otherwise:
  - Add a productivity tip

Guidelines:
- Keep language clear and student-friendly.
- Avoid unnecessary jargon.
- Be engaging and slightly conversational.
- Format neatly with Markdown.`;

export default function App() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string>('');
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (e?: React.FormEvent, overrideTopic?: string) => {
    if (e) e.preventDefault();
    const topic = overrideTopic || input;
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResponse(null);
    setCurrentTopic(topic);

    try {
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: topic,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      });

      const text = result.text;
      if (text) {
        setResponse(text);
      } else {
        setError("I couldn't generate a response. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong connecting to the AI. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const parseSections = (text: string) => {
    const sections: Record<string, string> = {};
    const splitText = text.split(/##\s\d\.\s/);
    
    // The first element is usually empty or intro text before the first ##
    const labels = [
      '',
      'simple',
      'detailed',
      'keyPoints',
      'quiz',
      'studyPlan',
      'analogy',
      'motivation'
    ];

    splitText.forEach((content, index) => {
      if (index > 0 && index < labels.length) {
        // Remove the heading title (e.g. "📘 Simple Explanation") from the content
        const cleanContent = content.replace(/^.*?\n/, '');
        sections[labels[index]] = cleanContent.trim();
      }
    });

    return sections;
  };

  useEffect(() => {
    if (response && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [response]);

  const parsedData = response ? parseSections(response) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col gap-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md">
              <Book size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Scholar Companion</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
                {currentTopic ? `Topic: ${currentTopic}` : 'AI Study Assistant'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600 uppercase">
                AI
              </div>
            </div>
            <div className="hidden md:block h-8 w-[1px] bg-slate-200"></div>
            <button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors">
              Save Session
            </button>
            <button 
              onClick={() => { setResponse(null); setInput(''); setCurrentTopic(''); }}
              className="px-4 py-2 bg-indigo-600 rounded-xl text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <Plus size={14} />
              New Concept
            </button>
          </div>
        </header>

        {/* Input Section - Only show when no response or when specifically at top */}
        <AnimatePresence>
          {!response && !loading && (
            <motion.section 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center py-20 text-center"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12"
              >
                <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-4">What should we learn?</h2>
                <p className="text-slate-500 text-lg">Enter any topic and I'll break it down for you.</p>
              </motion.div>

              <form onSubmit={handleSearch} className="w-full max-w-2xl relative group">
                <div className="absolute inset-0 bg-indigo-600/5 blur-3xl group-focus-within:bg-indigo-600/10 transition-all rounded-full" />
                <div className="relative flex items-center p-2 bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Quantum Superposition, History of Rome, Photosynthesis..."
                    className="flex-1 px-4 py-4 md:py-5 bg-transparent outline-none text-lg placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="px-6 py-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate
                  </button>
                </div>
              </form>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                {['General Relativity', 'Stoicism', 'Cell Mitosis', 'Game Theory'].map((tag) => (
                  <button 
                    key={tag}
                    onClick={() => handleSearch(undefined, tag)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-all cursor-pointer shadow-sm"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Global Loading State */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BrainCircuit className="text-indigo-600" size={24} />
              </div>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-slate-900 animate-pulse">Analyzing Concept...</p>
              <p className="text-slate-400 text-xs uppercase tracking-widest mt-1">Building your smart guide</p>
            </div>
          </div>
        )}

        {/* Results Grid */}
        {response && parsedData && (
          <motion.div 
            ref={resultsRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-12 gap-6 mb-12"
          >
            {/* Left Column: Explanations */}
            <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
              
              {/* Simple Explanation */}
              <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-5 text-indigo-600 font-bold text-xs uppercase tracking-widest">
                  <span className="text-xl">📘</span>
                  <h2>Simple Explanation</h2>
                </div>
                <div className="prose prose-slate prose-lg max-w-none italic text-slate-600 leading-relaxed font-serif">
                  <Markdown>{parsedData.simple}</Markdown>
                </div>
              </section>

              {/* Detailed Explanation */}
              <section className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex-1 flex flex-col transition-all hover:shadow-md">
                <div className="flex items-center gap-3 mb-5 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                  <span className="text-xl">📗</span>
                  <h2 className="text-slate-900">Detailed Explanation</h2>
                </div>
                <div className="prose prose-slate max-w-none text-slate-600">
                  <Markdown>{parsedData.detailed}</Markdown>
                </div>
              </section>
            </div>

            {/* Right Column: Summaries & Interactions */}
            <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
              
              {/* Key Points Summary */}
              <section className="bg-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/20 blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-600/30 transition-all" />
                <div className="flex items-center gap-3 mb-6 relative">
                  <span className="text-xl">📝</span>
                  <h2 className="font-bold text-xs uppercase tracking-widest opacity-80">Key Points Summary</h2>
                </div>
                <div className="prose prose-invert prose-sm max-w-none relative">
                  <Markdown>{parsedData.keyPoints}</Markdown>
                </div>
              </section>

              {/* Grid: Quiz & Analogy */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-base">🧠</span>
                    <h2 className="font-bold text-[10px] uppercase tracking-widest text-slate-900">Quick Quiz</h2>
                  </div>
                  <div className="prose prose-slate prose-xs max-w-none">
                    <Markdown>{parsedData.quiz}</Markdown>
                  </div>
                </section>

                <section className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm transition-all hover:shadow-md">
                   <div className="flex items-center gap-2 mb-4">
                    <span className="text-base">💡</span>
                    <h2 className="font-bold text-[10px] uppercase tracking-widest text-slate-900">Real-Life Analogy</h2>
                  </div>
                  <div className="prose prose-slate prose-xs italic leading-normal text-slate-600">
                    <Markdown>{parsedData.analogy}</Markdown>
                  </div>
                </section>
              </div>

              {/* Study Plan */}
              <section className="bg-indigo-50 border border-indigo-100 rounded-3xl p-8 transition-all hover:bg-indigo-100/50">
                <div className="flex items-center gap-3 mb-6 text-indigo-700 font-bold text-xs uppercase tracking-widest">
                  <span className="text-xl">⏱️</span>
                  <h2>Smart Study Plan</h2>
                </div>
                <div className="prose prose-slate prose-sm max-w-none text-slate-700">
                  <Markdown>{parsedData.studyPlan}</Markdown>
                </div>
              </section>
            </div>
          </motion.div>
        )}

        {/* Footer / Motivation Section (Always at bottom if results exist) */}
        {response && parsedData && (
          <footer className="flex flex-col md:flex-row items-center justify-between bg-white border border-slate-200 p-6 rounded-3xl shadow-sm mb-12">
            <div className="flex items-center gap-4 mb-6 md:mb-0">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl shadow-inner">
                🚀
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Motivation Boost</p>
                <div className="prose prose-slate prose-xs max-w-md text-slate-500 leading-relaxed">
                  <Markdown>{parsedData.motivation}</Markdown>
                </div>
              </div>
            </div>
            <div className="flex gap-4 items-center">
               <div className="h-10 w-[1px] bg-slate-100 hidden md:block"></div>
               <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">AI Status</span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Optimized for Learning
                  </span>
               </div>
            </div>
          </footer>
        )}
      </div>

      {!response && !loading && (
        <footer className="mt-auto py-8 text-slate-400 text-xs font-medium uppercase tracking-widest text-center">
          Scholar AI &copy; {new Date().getFullYear()} — Structured Learning Simplified
        </footer>
      )}
    </div>
  );
}
