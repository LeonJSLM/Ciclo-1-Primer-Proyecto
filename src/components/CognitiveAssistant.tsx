import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Bot, Sparkles, AlertCircle, CheckCircle2, XCircle, BrainCircuit, Star, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, FileDocument, Task } from '../types';

interface CognitiveAssistantProps {
  courses: Course[];
  tasks: Task[];
  isElite: boolean;
  onUpgrade: () => void;
  onAddExp: (points: number) => void;
  lang: 'es' | 'en';
}

interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export default function CognitiveAssistant({
  courses,
  tasks,
  isElite,
  onUpgrade,
  onAddExp,
  lang,
}: CognitiveAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'quiz'>('chat');
  
  // Chat state
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([
    { role: 'model', text: lang === 'es' 
      ? '¡Hola! Soy tu Asistente de IA Cognitivo. Puedo darte consejos personalizados de estudio basándome en tus PDFs y tus tareas cargadas. ¿En qué te puedo asesorar hoy?' 
      : 'Hello! I am your Cognitive AI Assistant. I can offer personalized study advice based on your PDFs and tasks. How can I help you today?' 
    }
  ]);
  const [isSending, setIsSending] = useState(false);

  // Quiz evaluation state
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, isOpen]);

  // Extract all files from courses to feed as context
  const getUploadedFilesContext = () => {
    const files: FileDocument[] = [];
    courses.forEach(c => {
      c.items.forEach(i => {
        i.files.forEach(f => {
          files.push(f);
        });
      });
    });
    return files;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = query;
    setChatHistory(prev => [...prev, { role: 'user', text: userMessage }]);
    setQuery('');
    setIsSending(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          filesContext: getUploadedFilesContext(),
          tasksContext: tasks,
          history: chatHistory
        }),
      });
      const data = await response.json();
      setChatHistory(prev => [...prev, { role: 'model', text: data.text || 'Sin respuesta' }]);
    } catch (error) {
      console.error(error);
      setChatHistory(prev => [...prev, { role: 'model', text: lang === 'es' ? 'Ocurrió un error al contactar al motor de IA.' : 'An error occurred contacting the AI model.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const startEvaluationQuiz = async () => {
    const course = courses.find(c => c.id === selectedCourseId);
    const files = getUploadedFilesContext();
    setIsGeneratingQuiz(true);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizFinished(false);
    setIsAnswerSubmitted(false);
    setSelectedOptionIndex(null);

    try {
      const response = await fetch('/api/gemini/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicName: course ? course.title : "Apuntes Académicos",
          filesContext: files.filter(f => course?.items.some(i => i.files.some(cf => cf.id === f.id)))
        })
      });
      const data = await response.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIndex(optionIdx);
  };

  const submitAnswer = () => {
    if (selectedOptionIndex === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const correct = selectedOptionIndex === questions[currentQuestionIndex].correctAnswer;
    if (correct) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz completed! Award points
      const expEarned = score * 10;
      onAddExp(expEarned);
      setQuizFinished(true);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="cognitive-ai-fab"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-40 p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center border border-indigo-400/40"
      >
        <Bot className="w-6 h-6 animate-pulse" />
        <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider text-white">
          IA
        </span>
      </button>

      {/* Main Panel Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            id="cognitive-ai-drawer"
            className="fixed bottom-24 right-6 z-40 w-full max-w-md h-[550px] glass-card rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                  <BrainCircuit className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                    {lang === 'es' ? 'Asistente IA Cognitivo' : 'Cognitive AI Assistant'}
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {lang === 'es' ? 'Tutor Personalizado de Estudio' : 'Personalized Study Tutor'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white text-xs bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="grid grid-cols-2 bg-slate-950 border-b border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('chat')}
                className={`py-3 text-center font-semibold transition-all border-b-2 ${
                  activeTab === 'chat' 
                    ? 'text-indigo-400 border-indigo-500 bg-slate-900/30' 
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {lang === 'es' ? '💬 Consulta y Tutoría' : '💬 Query & Tutoring'}
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`py-3 text-center font-semibold transition-all border-b-2 flex items-center justify-center gap-1.5 ${
                  activeTab === 'quiz' 
                    ? 'text-amber-400 border-amber-500 bg-slate-900/30' 
                    : 'text-slate-400 border-transparent hover:text-white'
                }`}
              >
                {lang === 'es' ? '📝 Motor de Evaluación' : '📝 Evaluation Engine'}
                <span className="bg-amber-500/20 text-amber-300 text-[8px] font-bold px-1.5 py-0.5 rounded uppercase">
                  Elite
                </span>
              </button>
            </div>

            {/* Tab: Cognitive Chat */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatHistory.map((h, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                        h.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
                      }`}>
                        <div className="font-bold mb-1 text-[10px] uppercase opacity-60">
                          {h.role === 'user' ? (lang === 'es' ? 'Tú' : 'You') : 'Cognitive IA'}
                        </div>
                        <div className="whitespace-pre-line">{h.text}</div>
                      </div>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start">
                      <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-3 text-xs text-slate-400 rounded-tl-none flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        <span>{lang === 'es' ? 'IA analizando tus apuntes...' : 'AI scanning notes...'}</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex gap-2">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={lang === 'es' ? 'Pregúntame sobre tus apuntes...' : 'Ask me about your courses...'}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={isSending || !query.trim()}
                    className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white rounded-xl transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Evaluation Engine */}
            {activeTab === 'quiz' && (
              <div className="flex-1 overflow-y-auto p-4 flex flex-col">
                {!isElite ? (
                  /* Blocked for non-Elite */
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <Star className="w-12 h-12 text-amber-400 animate-bounce mb-3" />
                    <h5 className="text-sm font-bold text-white uppercase tracking-wider">
                      {lang === 'es' ? 'Función Exclusiva Élite' : 'Exclusive Elite Feature'}
                    </h5>
                    <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                      {lang === 'es' 
                        ? 'El Motor de Evaluación IA analiza tus PDFs reales para autogenerar cuestionarios de 10 preguntas y sumar valiosos puntos de experiencia en el Podio.' 
                        : 'The AI Evaluation Engine scans your real PDFs to generate interactive 10-question quizzes and award EXP on the ranking.'
                      }
                    </p>
                    <button
                      onClick={onUpgrade}
                      className="mt-4 px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-xs rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
                    >
                      {lang === 'es' ? 'Activar Membresía Élite ($4.99)' : 'Activate Elite Membership ($4.99)'}
                    </button>
                  </div>
                ) : questions.length === 0 ? (
                  /* Selection screen */
                  <div className="flex-1 flex flex-col justify-center space-y-4">
                    <div className="text-center">
                      <BrainCircuit className="w-10 h-10 text-amber-400 mx-auto mb-2 animate-pulse" />
                      <h5 className="text-sm font-bold text-white">
                        {lang === 'es' ? 'Evaluación Autogenerada' : 'Autogenerated Assessment'}
                      </h5>
                      <p className="text-xs text-slate-400 mt-1">
                        {lang === 'es' ? 'Selecciona una materia para iniciar el cuestionario de 10 preguntas.' : 'Select a course to start your 10-question quiz.'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        {lang === 'es' ? 'Materia Académica' : 'Academic Course'}
                      </label>
                      <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="">{lang === 'es' ? '-- Selecciona un curso --' : '-- Select Course --'}</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={startEvaluationQuiz}
                      disabled={isGeneratingQuiz || courses.length === 0}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 disabled:from-slate-800 text-slate-950 disabled:text-slate-500 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isGeneratingQuiz ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{lang === 'es' ? 'IA procesando apuntes...' : 'AI scanning contents...'}</span>
                        </>
                      ) : (
                        <span>{lang === 'es' ? '🚀 Generar Cuestionario' : '🚀 Generate AI Quiz'}</span>
                      )}
                    </button>
                  </div>
                ) : quizFinished ? (
                  /* Quiz Result summary */
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3 animate-pulse" />
                    <h5 className="text-base font-bold text-white">
                      {lang === 'es' ? '¡Cuestionario Completado!' : 'Quiz Completed!'}
                    </h5>
                    <p className="text-xs text-slate-400 mt-1">
                      {lang === 'es' 
                        ? `Has respondido correctamente ${score} de 10 preguntas.` 
                        : `You correctly answered ${score} out of 10 questions.`
                      }
                    </p>

                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-xl my-4 text-xs font-semibold">
                      🎁 +{score * 10} EXP {lang === 'es' ? 'sumados al Podio de Honor' : 'added to your Ranking'}
                    </div>

                    <button
                      onClick={() => setQuestions([])}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs transition-all font-semibold"
                    >
                      {lang === 'es' ? 'Realizar otra evaluación' : 'Take another test'}
                    </button>
                  </div>
                ) : (
                  /* Quiz gameplay */
                  <div className="flex-1 flex flex-col justify-between min-h-0">
                    <div className="space-y-4">
                      {/* Progress bar */}
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{lang === 'es' ? `Pregunta ${currentQuestionIndex + 1} de 10` : `Question ${currentQuestionIndex + 1} of 10`}</span>
                        <span className="text-amber-400 font-bold">{score} Aciertos</span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 transition-all duration-300"
                          style={{ width: `${((currentQuestionIndex + 1) / 10) * 100}%` }}
                        />
                      </div>

                      {/* Question Text */}
                      <h6 className="text-xs font-bold text-white leading-relaxed bg-slate-950/40 p-3 border border-slate-800 rounded-xl">
                        {questions[currentQuestionIndex].question}
                      </h6>

                      {/* Options */}
                      <div className="space-y-2">
                        {questions[currentQuestionIndex].options.map((opt, oIdx) => {
                          let optionClass = "w-full text-left p-3 text-xs rounded-xl border transition-all flex items-center justify-between ";
                          
                          if (isAnswerSubmitted) {
                            if (oIdx === questions[currentQuestionIndex].correctAnswer) {
                              optionClass += "bg-emerald-500/10 border-emerald-500/50 text-emerald-300";
                            } else if (selectedOptionIndex === oIdx) {
                              optionClass += "bg-rose-500/10 border-rose-500/50 text-rose-300";
                            } else {
                              optionClass += "bg-slate-950/40 border-slate-800 text-slate-500";
                            }
                          } else {
                            if (selectedOptionIndex === oIdx) {
                              optionClass += "bg-amber-500/10 border-amber-500 text-amber-300 font-semibold";
                            } else {
                              optionClass += "bg-slate-950/40 border-slate-800 text-slate-300 hover:bg-slate-900";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleOptionSelect(oIdx)}
                              className={optionClass}
                            >
                              <span>{opt}</span>
                              {isAnswerSubmitted && oIdx === questions[currentQuestionIndex].correctAnswer && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              )}
                              {isAnswerSubmitted && selectedOptionIndex === oIdx && oIdx !== questions[currentQuestionIndex].correctAnswer && (
                                <XCircle className="w-4 h-4 text-rose-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {isAnswerSubmitted && (
                        <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-[11px] text-indigo-300 leading-normal flex gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{questions[currentQuestionIndex].explanation}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                      {!isAnswerSubmitted ? (
                        <button
                          onClick={submitAnswer}
                          disabled={selectedOptionIndex === null}
                          className="w-full py-2.5 bg-amber-500 disabled:bg-slate-800 text-slate-950 disabled:text-slate-500 text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                        >
                          {lang === 'es' ? 'Validar Respuesta' : 'Verify Answer'}
                        </button>
                      ) : (
                        <button
                          onClick={handleNextQuestion}
                          className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
                        >
                          {currentQuestionIndex === 9 
                            ? (lang === 'es' ? 'Ver Resultados' : 'See Results') 
                            : (lang === 'es' ? 'Siguiente Pregunta' : 'Next Question')
                          }
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
