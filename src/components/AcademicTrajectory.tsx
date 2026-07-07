import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  Plus, 
  Upload, 
  FileText, 
  CheckCircle, 
  GraduationCap, 
  Sparkles, 
  FolderPlus, 
  Trash2, 
  ArrowLeft, 
  Edit2, 
  FileSpreadsheet, 
  Image as ImageIcon,
  Check,
  X,
  Users,
  Paperclip,
  UserPlus,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Course, FileDocument, StudyItem, Friend } from '../types';

interface AcademicTrajectoryProps {
  courses: Course[];
  user?: any;
  friends?: Friend[];
  onAddExp?: (points: number) => void;
  onAddCourse: (course: Omit<Course, 'id'>) => void;
  onUploadFile: (courseId: string, itemId: string, file: FileDocument) => void;
  onDeleteCourse: (courseId: string) => void;
  onAddWeek?: (courseId: string, item: StudyItem) => void;
  onUpdateWeek?: (courseId: string, item: StudyItem) => void;
  onDeleteWeek?: (courseId: string, itemId: string) => void;
  lang: 'es' | 'en';
}

export default function AcademicTrajectory({
  courses,
  user,
  friends = [],
  onAddExp,
  onAddCourse,
  onUploadFile,
  onDeleteCourse,
  onAddWeek,
  onUpdateWeek,
  onDeleteWeek,
  lang,
}: AcademicTrajectoryProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [structureType, setStructureType] = useState<'weeks' | 'modules'>('weeks');
  const [customItemsCount, setCustomItemsCount] = useState<string>('4'); // e.g., 4 weeks default

  // Active expanded course ID (the "entered" course workspace view)
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  
  // Active expanded week/module item ID (entered deep detail view)
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Cuestionario interactivo de estudio (Quiz) state
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Week/Module configuration form state
  const [isItemFormOpen, setIsItemFormOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [itemTitle, setItemTitle] = useState('');
  const [itemFiles, setItemFiles] = useState<FileDocument[]>([]);
  const [itemTaskDescription, setItemTaskDescription] = useState('');
  const [itemTaskFile, setItemTaskFile] = useState<FileDocument | null>(null);

  // Collaborative Homework builder states
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskSpecs, setNewTaskSpecs] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState('');
  const [newTaskFile, setNewTaskFile] = useState<FileDocument | null>(null);
  const [selectedTeammates, setSelectedTeammates] = useState<any[]>([]); // array of friend objects/names
  const [isDividingTaskWithAI, setIsDividingTaskWithAI] = useState(false);
  const [aiDivisionResult, setAiDivisionResult] = useState<any[] | null>(null);

  // Drag over states for the course dashboard drops
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Build the dynamic weeks/modules items
    const items: StudyItem[] = [];
    const count = Math.max(1, parseInt(customItemsCount, 10) || 4);
    for (let i = 1; i <= count; i++) {
      const prefix = structureType === 'weeks'
        ? (lang === 'es' ? `Semana ${i}:` : `Week ${i}:`)
        : (lang === 'es' ? `Módulo ${String.fromCharCode(65 + i - 1)}:` : `Module ${String.fromCharCode(65 + i - 1)}:`);
      
      items.push({
        id: `item-${Date.now()}-${i}`,
        name: `${prefix} ${lang === 'es' ? 'Introducción y Conceptos Básicos' : 'Introduction & Fundamentals'}`,
        files: []
      });
    }

    onAddCourse({
      title,
      description,
      structureType,
      items
    });

    // Reset
    setTitle('');
    setDescription('');
    setCustomItemsCount('4');
    setIsFormOpen(false);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, courseId: string, itemId: string) => {
    e.preventDefault();
    setDragOverItemId(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processUploadedFiles(files, courseId, itemId);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, courseId: string, itemId: string) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processUploadedFiles(files, courseId, itemId);
    }
  };

  const processUploadedFiles = (files: FileList, courseId: string, itemId: string) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mockDoc: FileDocument = {
        id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: file.name,
        type: file.type || 'application/pdf',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: URL.createObjectURL(file),
        content: `Contenido escaneado de ${file.name}. Apuntes y resúmenes de estudio.`
      };
      onUploadFile(courseId, itemId, mockDoc);
    }
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') {
      return <FileText className="w-4 h-4 text-rose-400 flex-shrink-0" />;
    } else if (['xlsx', 'xls', 'csv'].includes(ext || '')) {
      return <FileSpreadsheet className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
    } else if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '')) {
      return <ImageIcon className="w-4 h-4 text-cyan-400 flex-shrink-0" />;
    } else if (['doc', 'docx'].includes(ext || '')) {
      return <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />;
    }
    return <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />;
  };

  const motivationalMessages = [
    { es: "💡 El éxito académico no se trata de suerte, se trata de constancia y sinergia.", en: "💡 Academic success is not about luck, it is about consistency and synergy." },
    { es: "🚀 Cada PDF que cargas es un peldaño más hacia el Podio de Honor.", en: "🚀 Every PDF you upload is another step closer to the Honor Podium." },
    { es: "🌟 El Asistente de IA Cognitivo se vuelve más inteligente a medida que organizas tus temas.", en: "🌟 The Cognitive AI Assistant grows smarter as you organize your topics." }
  ];

  const currentMsg = motivationalMessages[Math.floor(Date.now() / 86400000) % motivationalMessages.length];

  const activeCourse = courses.find(c => c.id === expandedCourseId);

  // Calculate default prefix for the current item form (either adding or editing)
  const getItemPrefix = (index: number, type: 'weeks' | 'modules') => {
    if (type === 'weeks') {
      return lang === 'es' ? `Semana ${index + 1}:` : `Week ${index + 1}:`;
    } else {
      return lang === 'es' ? `Módulo ${String.fromCharCode(65 + index)}:` : `Module ${String.fromCharCode(65 + index)}:`;
    }
  };

  const openAddItemForm = () => {
    if (!activeCourse) return;
    setEditingItemId(null);
    setItemTitle('');
    setItemFiles([]);
    setItemTaskDescription('');
    setItemTaskFile(null);
    setIsItemFormOpen(true);
  };

  const openEditItemForm = (item: StudyItem, index: number) => {
    if (!activeCourse) return;
    setEditingItemId(item.id);
    
    // Extract title (everything after the first colon)
    const colonIndex = item.name.indexOf(':');
    if (colonIndex !== -1) {
      setItemTitle(item.name.substring(colonIndex + 1).trim());
    } else {
      setItemTitle(item.name);
    }
    
    setItemFiles(item.files || []);
    setItemTaskDescription(item.taskDescription || '');
    setItemTaskFile(item.taskFile || null);
    setIsItemFormOpen(true);
  };

  const resetItemForm = () => {
    setIsItemFormOpen(false);
    setEditingItemId(null);
    setItemTitle('');
    setItemFiles([]);
    setItemTaskDescription('');
    setItemTaskFile(null);
  };

  const handleFormFileChange = (e: React.ChangeEvent<HTMLInputElement>, isTaskFile: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const docs: FileDocument[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mockDoc: FileDocument = {
        id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: `${(file.size / 1024).toFixed(1)} KB`,
        url: URL.createObjectURL(file),
        content: `Apuntes escaneados de ${file.name}.`
      };
      docs.push(mockDoc);
    }

    if (isTaskFile) {
      setItemTaskFile(docs[0]);
    } else {
      setItemFiles(prev => [...prev, ...docs]);
    }
  };

  const handleItemFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCourse) return;

    let targetIndex = activeCourse.items.length;
    if (editingItemId) {
      targetIndex = activeCourse.items.findIndex(it => it.id === editingItemId);
      if (targetIndex === -1) targetIndex = activeCourse.items.length;
    }

    const prefix = getItemPrefix(targetIndex, activeCourse.structureType);
    const finalName = itemTitle.trim() ? `${prefix} ${itemTitle.trim()}` : prefix.slice(0, -1);

    const targetItem: StudyItem = {
      id: editingItemId || `item-${Date.now()}`,
      name: finalName,
      files: itemFiles,
      taskDescription: itemTaskDescription.trim() || undefined,
      taskFile: itemTaskFile || undefined
    };

    if (editingItemId) {
      if (onUpdateWeek) {
        onUpdateWeek(activeCourse.id, targetItem);
      }
    } else {
      if (onAddWeek) {
        onAddWeek(activeCourse.id, targetItem);
      }
    }

    resetItemForm();
  };

  const startQuiz = async (item: StudyItem) => {
    setCurrentQuestionIndex(0);
    setSelectedAnswerIndex(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
    setIsQuizFinished(false);
    setErrorMessage(null);
    setIsLoadingQuestions(true);
    setIsQuizActive(true);

    try {
      const response = await fetch('/api/gemini/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filesContext: item.files.map(f => ({ name: f.name, content: f.content || "Material de clase" })),
          topicName: item.name
        })
      });
      if (!response.ok) throw new Error("Server error " + response.status);
      const data = await response.json();
      if (data && data.questions && Array.isArray(data.questions)) {
        setQuizQuestions(data.questions);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Quiz generation failed:", err);
      const topic = item.name || (lang === 'es' ? "Temas Académicos" : "Academic Topics");
      const fallback = [
        { question: `¿Cuál es el enfoque principal de estudio en ${topic}?`, options: [lang === 'es' ? "Análisis conceptual y práctico" : "Conceptual & practical analysis", lang === 'es' ? "Memorización pasiva y repetitiva" : "Passive & repetitive memory", lang === 'es' ? "Evadir las evaluaciones oficiales" : "Avoiding official exams", lang === 'es' ? "Copiar de forma textual apuntes ajenos" : "Textually copying others' notes"], correctAnswer: 0, explanation: lang === 'es' ? "El estudio activo se basa en el análisis conceptual y práctico de los materiales oficiales." : "Active study is based on conceptual and practical analysis of official materials." },
        { question: lang === 'es' ? "¿Qué técnica propone un temporizador de 25 minutos con 5 de descanso?" : "What technique proposes a 25-minute timer with a 5-minute break?", options: [lang === 'es' ? "Técnica Pomodoro" : "Pomodoro Technique", lang === 'es' ? "Método Feynman" : "Feynman Method", lang === 'es' ? "Sinergia Escolar" : "School Synergy", lang === 'es' ? "Ley de Parkinson" : "Parkinson's Law"], correctAnswer: 0, explanation: lang === 'es' ? "La técnica Pomodoro divide el trabajo en bloques de alta concentración de 25 minutos." : "The Pomodoro technique splits work into high-concentration blocks of 25 minutes." },
        { question: lang === 'es' ? "¿Cuál de las siguientes es una práctica de estudio altamente recomendada?" : "Which of the following is a highly recommended study practice?", options: [lang === 'es' ? "La autoevaluación activa" : "Active self-testing", lang === 'es' ? "Estudiar cansado antes del examen" : "Cramming while tired", lang === 'es' ? "Releer pasivamente las diapositivas" : "Passively re-reading slides", lang === 'es' ? "No tomar descansos entre sesiones" : "Not taking breaks between sessions"], correctAnswer: 0, explanation: lang === 'es' ? "La autoevaluación (testing) fuerza la recuperación activa de la memoria, fortaleciendo el aprendizaje." : "Self-testing forces active memory retrieval, strengthening long-term learning." },
        { question: lang === 'es' ? "¿Qué representa la Sinergia Académica?" : "What does Academic Synergy represent?", options: [lang === 'es' ? "Colaboración conjunta multiplicando resultados" : "Joint collaboration multiplying results", lang === 'es' ? "Trabajar de manera aislada y secreta" : "Working in isolation and secretly", lang === 'es' ? "Competir agresivamente por calificaciones" : "Competing aggressively for grades", lang === 'es' ? "Dejar que otros hagan todo el trabajo" : "Letting others do all the work"], correctAnswer: 0, explanation: lang === 'es' ? "La sinergia es el efecto multiplicador donde el total del grupo es mayor que la suma de sus partes." : "Synergy is the multiplying effect where the group total is greater than the sum of its individual parts." },
        { question: lang === 'es' ? "¿Qué ventaja te brinda el Motor de Evaluación de IA?" : "What advantage does the AI Evaluation Engine provide you?", options: [lang === 'es' ? "Generar cuestionarios tipo examen basados en tus PDFs" : "Generate exam-like quizzes based on your PDFs", lang === 'es' ? "Hacer trampa en las asignaturas reales" : "Cheat on real subjects", lang === 'es' ? "Omitir el estudio de los temas obligatorios" : "Skip studying mandatory topics", lang === 'es' ? "Descargar respuestas precargadas del internet" : "Download pre-loaded internet answers"], correctAnswer: 0, explanation: lang === 'es' ? "La IA analiza tus archivos PDF de clase para formular preguntas personalizadas a tu temario escolar." : "The AI analyzes your class PDFs to formulate personalized questions tailored to your syllabus." },
        { question: lang === 'es' ? "¿Cuál es el beneficio de asociar apuntes a una trayectoria?" : "What is the benefit of associating notes with a trajectory?", options: [lang === 'es' ? "Centraliza tu material y permite evaluaciones personalizadas" : "It centralizes your material and enables custom testing", lang === 'es' ? "Sube la velocidad de tu internet" : "It speeds up your internet", lang === 'es' ? "Elimina la necesidad de ir a clases" : "It eliminates the need to go to classes", lang === 'es' ? "Te da puntos de experiencia infinitos" : "It gives you infinite experience points"], correctAnswer: 0, explanation: lang === 'es' ? "Centralizar tus apuntes permite que la IA actúe de tutor cognitivo específico a tus documentos reales." : "Centralizing your notes allows the AI to act as a cognitive tutor specific to your actual documents." },
        { question: lang === 'es' ? "¿Qué indica una alta puntuación en tu cuestionario?" : "What does a high score on your quiz indicate?", options: [lang === 'es' ? "Buen dominio conceptual del material de la semana" : "Good conceptual mastery of the week's material", lang === 'es' ? "Que tuviste suerte adivinando las respuestas" : "That you were lucky guessing answers", lang === 'es' ? "Que la IA es demasiado sencilla de resolver" : "That the AI is too simple to solve", lang === 'es' ? "Que no necesitas volver a repasar nunca más" : "That you never need to review again"], correctAnswer: 0, explanation: lang === 'es' ? "Una calificación perfecta valida tu retención y te otorga el máximo de EXP para el Podio." : "A perfect score validates your retention and grants you the maximum EXP for the Podium." },
        { question: lang === 'es' ? "¿Cómo se optimiza el repaso de un tema difícil?" : "How is the review of a difficult topic optimized?", options: [lang === 'es' ? "Identificando brechas de conocimiento mediante quizzes" : "Identifying knowledge gaps through quizzes", lang === 'es' ? "Borrando el curso para evitar el estrés" : "Deleting the course to avoid stress", lang === 'es' ? "Estudiando únicamente lo que ya dominas" : "Studying only what you already master", lang === 'es' ? "Esperar que la IA resuelva todo el trabajo" : "Expecting the AI to solve all the work"], correctAnswer: 0, explanation: lang === 'es' ? "Hacer quizzes revela las brechas de conocimiento exactas en las que debes enfocar tu lectura." : "Taking quizzes reveals the exact knowledge gaps you need to focus your reading on." },
        { question: lang === 'es' ? "Al finalizar una evaluación, ¿cómo reclamas tu XP?" : "When finishing an evaluation, how do you claim your XP?", options: [lang === 'es' ? "La plataforma los sincroniza y los suma automáticamente" : "The platform syncs and adds them automatically", lang === 'es' ? "Enviando un correo de soporte técnico" : "By sending a technical support email", lang === 'es' ? "Reiniciando el navegador web" : "By restarting the web browser", lang === 'es' ? "Iniciando sesión con otra cuenta de estudiante" : "By logging in with another student account"], correctAnswer: 0, explanation: lang === 'es' ? "La finalización del cuestionario transmite tu progreso para acumular EXP e impulsar tu posición." : "Finishing the quiz transmits your progress to accumulate EXP and boost your position." },
        { question: lang === 'es' ? "¿Cuál es la mejor actitud ante un error en el cuestionario?" : "What is the best attitude towards an error on the quiz?", options: [lang === 'es' ? "Analizar la explicación de la IA para aprender del fallo" : "Analyze the AI explanation to learn from the mistake", lang === 'es' ? "Frustrarse y no volver a intentar el test" : "Get frustrated and never try the test again", lang === 'es' ? "Ignorar el error pensando que la IA falló" : "Ignore the error thinking the AI failed", lang === 'es' ? "Eliminar la semana de estudio inmediatamente" : "Delete the study week immediately"], correctAnswer: 0, explanation: lang === 'es' ? "El error es la oportunidad dorada para consolidar el concepto correcto gracias a la retroalimentación." : "The error is the golden opportunity to consolidate the correct concept thanks to the feedback." }
      ];
      setQuizQuestions(fallback);
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleSelectAnswer = (optionIndex: number) => {
    if (isAnswerSubmitted) return;
    setSelectedAnswerIndex(optionIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswerIndex === null || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    if (selectedAnswerIndex === quizQuestions[currentQuestionIndex].correctAnswer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    setSelectedAnswerIndex(null);
    setIsAnswerSubmitted(false);
    if (currentQuestionIndex + 1 < quizQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsQuizFinished(true);
    }
  };

  const handleFinishQuiz = (item: StudyItem, courseId: string) => {
    const currentBest = item.bestScore || 0;
    const finalScore = quizScore;
    const pointsAwarded = finalScore * 25;
    
    const updatedItem: StudyItem = {
      ...item,
      bestScore: Math.max(currentBest, finalScore)
    };

    if (onUpdateWeek) {
      onUpdateWeek(courseId, updatedItem);
    }

    if (pointsAwarded > 0 && onAddExp) {
      onAddExp(pointsAwarded);
    }

    setIsQuizActive(false);
    setIsQuizFinished(false);
  };

  // VIEW 1: ENTERED COURSE DETAIL WORKSPACE
  if (activeCourse) {
    const activeItem = activeCourse.items.find(item => item.id === expandedItemId);

    if (activeItem) {
      if (isQuizActive) {
        return (
          <div id="quiz-workspace" className="space-y-6 text-left max-w-4xl mx-auto p-4 md:p-8 bg-[#0c1224] rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Quiz Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  {lang === 'es' ? 'Motor de Evaluación de IA' : 'AI Evaluation Engine'}
                </span>
                <h2 className="text-lg md:text-xl font-black text-white">{activeItem.name}</h2>
              </div>
              
              {!isLoadingQuestions && !isQuizFinished && (
                <button
                  onClick={() => {
                    setIsQuizActive(false);
                    setQuizQuestions([]);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* LOADING STATE */}
            {isLoadingQuestions && (
              <div className="py-16 flex flex-col items-center justify-center text-center space-y-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin" />
                  <Sparkles className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-base font-bold text-white animate-pulse">
                    {lang === 'es' ? 'Generando Cuestionario Cognitivo...' : 'Generating Cognitive Quiz...'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'es' 
                      ? 'Nuestro Asistente de IA está analizando los apuntes escolares y materiales de esta semana para formular un cuestionario personalizado de 10 preguntas.' 
                      : 'Our AI Assistant is analyzing class notes and study documents to formulate a customized 10-question evaluation.'}
                  </p>
                </div>
              </div>
            )}

            {/* ERROR STATE */}
            {errorMessage && !isLoadingQuestions && (
              <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-center space-y-4">
                <p className="text-xs text-rose-400 font-semibold">{errorMessage}</p>
                <button
                  onClick={() => startQuiz(activeItem)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  {lang === 'es' ? 'Reintentar Generar' : 'Retry Generating'}
                </button>
              </div>
            )}

            {/* ACTIVE QUIZ QUESTIONS */}
            {!isLoadingQuestions && !isQuizFinished && quizQuestions.length > 0 && (() => {
              const currentQuestion = quizQuestions[currentQuestionIndex];
              return (
                <div className="space-y-6">
                  {/* Progress Indicators */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{lang === 'es' ? `Pregunta ${currentQuestionIndex + 1} de ${quizQuestions.length}` : `Question ${currentQuestionIndex + 1} of ${quizQuestions.length}`}</span>
                      <span className="font-mono text-indigo-400 font-bold">{lang === 'es' ? `${quizScore} Correctas` : `${quizScore} Correct`}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" 
                        style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Question Box */}
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/5">
                    <h3 className="text-sm md:text-base font-bold text-white leading-relaxed">{currentQuestion.question}</h3>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQuestion.options.map((option: string, idx: number) => {
                      let btnStyles = "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10";
                      if (isAnswerSubmitted) {
                        if (idx === currentQuestion.correctAnswer) {
                          btnStyles = "bg-emerald-500/15 border-emerald-500 text-emerald-400 font-bold";
                        } else if (idx === selectedAnswerIndex) {
                          btnStyles = "bg-rose-500/15 border-rose-500 text-rose-400 font-bold";
                        } else {
                          btnStyles = "bg-white/5 border-white/5 text-slate-500 opacity-60";
                        }
                      } else if (idx === selectedAnswerIndex) {
                        btnStyles = "bg-indigo-600/25 border-indigo-500 text-indigo-300 font-semibold";
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isAnswerSubmitted}
                          onClick={() => handleSelectAnswer(idx)}
                          className={`p-4 rounded-xl border text-left text-xs transition-all duration-200 flex items-start gap-3 ${btnStyles}`}
                        >
                          <span className="w-5 h-5 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center font-mono text-[10px] font-bold flex-shrink-0">
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="leading-relaxed">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation feedback */}
                  <div className="flex flex-col gap-4">
                    {isAnswerSubmitted && (
                      <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-1.5 animate-fadeIn">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                          {lang === 'es' ? 'Retroalimentación de la IA' : 'AI Explanation feedback'}
                        </span>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {currentQuestion.explanation || (lang === 'es' ? "Excelente repaso analítico para consolidar tus conceptos." : "Excellent analytical review to solidify concepts.")}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      {!isAnswerSubmitted ? (
                        <button
                          type="button"
                          disabled={selectedAnswerIndex === null}
                          onClick={handleSubmitAnswer}
                          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                        >
                          {lang === 'es' ? 'Confirmar Respuesta' : 'Confirm Answer'}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleNextQuestion}
                          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs transition-all shadow-md"
                        >
                          {currentQuestionIndex + 1 < quizQuestions.length 
                            ? (lang === 'es' ? 'Siguiente Pregunta' : 'Next Question')
                            : (lang === 'es' ? 'Ver Resultados de la Evaluación' : 'See Evaluation Results')
                          }
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* QUIZ FINISHED RESULTS SCREEN */}
            {isQuizFinished && (
              <div className="py-8 text-center space-y-6 max-w-md mx-auto">
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full bg-indigo-600/10 border-2 border-indigo-500/20 absolute animate-ping" />
                  <div className="w-20 h-20 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                    <GraduationCap className="w-10 h-10 text-indigo-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-black text-white">{lang === 'es' ? '¡Evaluación Completada!' : 'Evaluation Completed!'}</h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'es' 
                      ? 'Has completado exitosamente las 10 preguntas formuladas por el Motor Cognitivo de IA.' 
                      : 'You have successfully completed the 10-question quiz formulated by our Cognitive AI Engine.'}
                  </p>
                </div>

                {/* Score badge card */}
                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                  <div className="text-4xl font-black text-indigo-400 font-mono">
                    {quizScore} <span className="text-slate-500 text-lg">/ 10</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-400">
                    {quizScore >= 8 
                      ? (lang === 'es' ? '¡Increíble dominio académico! 🏆' : 'Outstanding academic mastery! 🏆')
                      : quizScore >= 5 
                        ? (lang === 'es' ? '¡Buen trabajo! Sigue repasando para perfeccionarte.' : 'Good job! Keep reviewing to reach perfection.')
                        : (lang === 'es' ? 'Un repaso rápido te vendrá excelente para dominar la materia.' : 'A quick review will be excellent to master the topic.')
                    }
                  </div>
                  
                  {quizScore > 0 && (
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-white/5 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'es' ? `¡Ganaste +${quizScore * 25} EXP base!` : `You gained +${quizScore * 25} base EXP!`}</span>
                    </div>
                  )}
                </div>

                {/* Finished actions */}
                <div className="flex items-center gap-3 justify-center">
                  <button
                    onClick={() => startQuiz(activeItem)}
                    className="px-5 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl text-xs transition-colors border border-white/10"
                  >
                    {lang === 'es' ? 'Reintentar' : 'Retry'}
                  </button>
                  <button
                    onClick={() => handleFinishQuiz(activeItem, activeCourse.id)}
                    className="px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg"
                  >
                    {lang === 'es' ? 'Guardar y Regresar' : 'Save and Return'}
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }

      // WEEK DETAIL WORKSPACE VIEW (matches user's requested layout screenshot aesthetic with pristine styling)
      return (
        <div id="week-workspace-detail" className="space-y-6 text-left">
          {/* Breadcrumbs & Back */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <button
              onClick={() => setExpandedItemId(null)}
              className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/15 w-fit"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{lang === 'es' ? `Volver a ${activeCourse.title}` : `Back to ${activeCourse.title}`}</span>
            </button>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>{activeCourse.title}</span>
              <span>&gt;</span>
              <span className="text-indigo-300 font-semibold">{activeItem.name.split(':')[0]}</span>
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">{activeItem.name}</h1>
            <p className="text-xs text-slate-400">
              {lang === 'es' ? 'Asigna tus lecturas, sube PDFs de estudio de clase y pon a prueba tu rendimiento con evaluaciones IA.' : 'Assign your readings, upload class PDFs, and challenge yourself with AI-generated examinations.'}
            </p>
          </div>

          {/* Dual Polished Cards Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            
            {/* CARD 1: MATERIAL DE LECTURA TEÓRICA (PDF) */}
            <div className="bg-[#0c1224] rounded-3xl p-6 border border-white/10 flex flex-col justify-between min-h-[340px] relative overflow-hidden space-y-6 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-4">
                {/* Badge tags Row */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                    {lang === 'es' ? 'Material Oficial de Clase' : 'Official Class Material'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] text-slate-400 font-mono font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                      {activeItem.files.length} {lang === 'es' ? 'Documentos' : 'Documents'}
                    </span>
                    {activeItem.isRead && (
                      <span className="text-[9px] bg-emerald-500 text-white font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
                        <Check className="w-3 h-3 text-white stroke-[3px]" />
                        {lang === 'es' ? 'Leído' : 'Read'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Title & Icon */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/20 flex-shrink-0 mt-1">
                    <FileText className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white tracking-tight">{lang === 'es' ? 'Material de Lectura Teórica (PDF)' : 'Theoretical Reading Material (PDF)'}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lang === 'es' 
                        ? 'Estudia las diapositivas y el marco conceptual oficial del curso para esta semana antes de realizar el cuestionario interactivo de evaluación.' 
                        : 'Study slides and official course conceptual framework for this week before taking the interactive self-testing.'}
                    </p>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="pt-2">
                  {activeItem.isRead ? (
                    <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/10 px-3 py-2 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'es' ? '✔ Lectura completada • +50 XP reclamados' : '✔ Reading completed • +50 XP claimed'}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 bg-white/5 border border-white/5 px-3 py-2 rounded-xl">
                      {lang === 'es' ? 'Lectura pendiente • Reclama +50 XP al completarla.' : 'Reading pending • Claim +50 XP upon completion.'}
                    </p>
                  )}
                </div>

                {/* Uploaded class files list */}
                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                    {lang === 'es' ? 'Materiales y PDFs de la Semana' : 'Materials & Week PDFs'}
                  </span>
                  
                  {activeItem.files.map((file) => (
                    <div 
                      key={file.id}
                      className="p-3 bg-slate-950/50 border border-white/5 rounded-xl flex items-center justify-between text-xs hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {getFileIcon(file.name)}
                        <span className="text-slate-300 truncate font-semibold" title={file.name}>
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">({file.size})</span>
                      </div>
                      
                      <button
                        onClick={() => {
                          const updatedFiles = activeItem.files.filter(f => f.id !== file.id);
                          if (onUpdateWeek) {
                            onUpdateWeek(activeCourse.id, { ...activeItem, files: updatedFiles });
                          }
                        }}
                        className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                        title={lang === 'es' ? 'Eliminar PDF' : 'Delete PDF'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  {activeItem.files.length === 0 && (
                    <p className="text-xs text-slate-500 italic">
                      {lang === 'es' ? 'Aún no has cargado archivos de estudio para esta semana.' : 'No class files or study documents uploaded for this week.'}
                    </p>
                  )}

                  {/* Drag drop zone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    className="border border-dashed border-white/10 hover:border-indigo-500/30 rounded-2xl p-4 text-center transition-all bg-white/5 relative group cursor-pointer"
                  >
                    <input
                      type="file"
                      multiple
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          for (let i = 0; i < files.length; i++) {
                            const file = files[i];
                            const doc: FileDocument = {
                              id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                              name: file.name,
                              type: file.type || 'application/pdf',
                              size: `${(file.size / 1024).toFixed(1)} KB`,
                              url: URL.createObjectURL(file),
                              content: `Apuntes escaneados de ${file.name}.`
                            };
                            if (onUpdateWeek) {
                              onUpdateWeek(activeCourse.id, { ...activeItem, files: [...activeItem.files, doc] });
                            }
                          }
                        }
                      }}
                    />
                    <Upload className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 mx-auto mb-1" />
                    <span className="text-[11px] text-slate-400 group-hover:text-slate-300">
                      {lang === 'es' ? 'Sube o arrastra archivos aquí' : 'Upload or drag files here'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {activeItem.files.length > 0 ? (
                  <button
                    onClick={() => {
                      const firstFile = activeItem.files[0];
                      if (firstFile) {
                        window.open(firstFile.url, '_blank');
                      }
                      if (!activeItem.isRead) {
                        if (onUpdateWeek) {
                          onUpdateWeek(activeCourse.id, { ...activeItem, isRead: true });
                        }
                        if (onAddExp) {
                          onAddExp(50);
                        }
                      }
                    }}
                    className="flex-1 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs transition-colors shadow-lg flex items-center justify-center gap-2 border border-emerald-500/20"
                  >
                    <BookOpen className="w-4 h-4 text-white" />
                    <span>{lang === 'es' ? 'Abrir PDF de la Clase' : 'Open Class PDF'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files && files.length > 0) {
                          for (let i = 0; i < files.length; i++) {
                            const file = files[i];
                            const doc: FileDocument = {
                              id: 'file-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
                              name: file.name,
                              type: file.type || 'application/pdf',
                              size: `${(file.size / 1024).toFixed(1)} KB`,
                              url: URL.createObjectURL(file),
                              content: `Apuntes escaneados de ${file.name}.`
                            };
                            if (onUpdateWeek) {
                              onUpdateWeek(activeCourse.id, { ...activeItem, files: [...activeItem.files, doc] });
                            }
                          }
                        }
                      };
                      input.click();
                    }}
                    className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-slate-300 font-semibold rounded-2xl text-xs transition-colors border border-white/10 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4 text-slate-400" />
                    <span>{lang === 'es' ? 'Subir Material Teórico' : 'Upload Theoretical Material'}</span>
                  </button>
                )}

                {!activeItem.isRead && activeItem.files.length > 0 && (
                  <button
                    onClick={() => {
                      if (onUpdateWeek) {
                        onUpdateWeek(activeCourse.id, { ...activeItem, isRead: true });
                      }
                      if (onAddExp) {
                        onAddExp(50);
                      }
                    }}
                    className="px-5 py-3.5 bg-white/5 hover:bg-white/10 text-emerald-400 font-bold rounded-2xl text-xs transition-colors border border-white/10"
                  >
                    {lang === 'es' ? 'Marcar Leído (+50 XP)' : 'Mark Read (+50 XP)'}
                  </button>
                )}
              </div>
            </div>

            {/* CARD 2: CUESTIONARIO PRÁCTICO DE ESTUDIO */}
            <div className="bg-[#0c1224] rounded-3xl p-6 border border-white/10 flex flex-col justify-between min-h-[340px] relative overflow-hidden space-y-6 shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="space-y-4">
                {/* Badge tags Row */}
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full font-mono font-bold uppercase tracking-wider">
                    {lang === 'es' ? 'Cuestionario Teórico' : 'Theoretical Quiz'}
                  </span>
                  
                  <span className="text-[9px] text-slate-400 font-mono font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                    10 {lang === 'es' ? 'Preguntas' : 'Questions'}
                  </span>
                </div>

                {/* Card Title & Icon */}
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-purple-500/15 text-purple-400 rounded-xl border border-purple-500/20 flex-shrink-0 mt-1">
                    <GraduationCap className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white tracking-tight">{lang === 'es' ? 'Cuestionario Práctico de Estudio' : 'Practical Study Quiz'}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {lang === 'es' 
                        ? 'Valida los conocimientos teóricos estudiados en clase de esta semana. Gana hasta 250 XP base y bonos especiales por responder correctamente.' 
                        : 'Validate the theoretical knowledge studied in class this week. Gain up to 250 base EXP and special bonuses for correct answers.'}
                    </p>
                  </div>
                </div>

                {/* Status / Best Score Indicator */}
                <div className="pt-2">
                  {activeItem.bestScore !== undefined ? (
                    <p className="text-xs font-bold text-indigo-400 flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/10 px-3 py-2 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-indigo-400" />
                      <span>{lang === 'es' ? ` Mejor Calificación: ${activeItem.bestScore}/10 correctas` : ` Best Score: ${activeItem.bestScore}/10 correct`}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 bg-white/5 border border-white/5 px-3 py-2 rounded-xl">
                      {lang === 'es' ? 'Sin intentos todavía • Prepárate bien antes de comenzar.' : 'No attempts yet • Prepare well before starting.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Quiz start trigger */}
              <div className="pt-2">
                <button
                  onClick={() => startQuiz(activeItem)}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black rounded-2xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 border border-indigo-500/20 group"
                >
                  <Sparkles className="w-4 h-4 text-amber-400 group-hover:animate-spin" />
                  <span>
                    {activeItem.bestScore !== undefined 
                      ? (lang === 'es' ? 'Reintentar Cuestionario' : 'Retry Quiz') 
                      : (lang === 'es' ? 'Realizar Cuestionario' : 'Take Quiz')
                    }
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* INTERACTIVE COLLABORATIVE HOMEWORK WORKSPACE */}
          <div className="bg-[#0c1224]/80 rounded-3xl p-6 border border-white/10 space-y-6 shadow-2xl relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  {lang === 'es' ? 'Sinergia Colectiva: Gestión de Tareas' : 'Collective Synergy: Task Management'}
                </span>
                <h3 className="text-base font-black text-white">
                  {lang === 'es' ? 'Deber y Trabajo Cooperativo de la Semana' : 'Weekly Homework & Cooperative Work'}
                </h3>
              </div>
              
              {!isAddingTask && (activeItem.taskTitle || activeItem.taskDescription) && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Load values into state
                      setNewTaskTitle(activeItem.taskTitle || '');
                      setNewTaskDescription(activeItem.taskDescription || '');
                      setNewTaskSpecs(activeItem.taskSpecs || '');
                      setNewTaskDeadline(activeItem.taskDeadline || '');
                      setNewTaskFile(activeItem.taskFile || null);
                      setSelectedTeammates(activeItem.taskAssignedFriends || []);
                      setAiDivisionResult(activeItem.taskAIDivision || null);
                      setIsAddingTask(true);
                    }}
                    className="p-2 bg-white/5 hover:bg-white/10 text-indigo-400 rounded-xl border border-indigo-500/15 transition-all text-xs flex items-center gap-1.5 font-semibold animate-fade-in"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{lang === 'es' ? 'Modificar' : 'Edit'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (onUpdateWeek) {
                        onUpdateWeek(activeCourse.id, {
                          ...activeItem,
                          taskTitle: undefined,
                          taskDescription: undefined,
                          taskSpecs: undefined,
                          taskDeadline: undefined,
                          taskFile: undefined,
                          taskAssignedFriends: undefined,
                          taskAIDivision: undefined
                        });
                      }
                      setIsAddingTask(false);
                      setAiDivisionResult(null);
                    }}
                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/10 transition-all text-xs flex items-center gap-1.5 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{lang === 'es' ? 'Eliminar' : 'Delete'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* CASE 1: Form is open (creating or editing task) */}
            {isAddingTask || (!activeItem.taskTitle && !activeItem.taskDescription && !isAddingTask) ? (
              // If form is not open but no task is set, show a prompt to create it
              !isAddingTask && !activeItem.taskTitle && !activeItem.taskDescription ? (
                <div className="py-8 text-center space-y-4">
                  <div className="p-4 bg-amber-500/5 rounded-full w-14 h-14 mx-auto flex items-center justify-center border border-amber-500/10 text-amber-400">
                    <UserPlus className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-200">
                      {lang === 'es' ? '¿Tienes un deber asignado esta semana?' : 'Do you have homework assigned this week?'}
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      {lang === 'es'
                        ? 'Crea una tarea colectiva, adjunta la guía (PDF/imagen) y deja que la IA organice la división de trabajo óptima para ti y tus compañeros.'
                        : 'Create a collaborative task, attach the guide (PDF/image), and let the AI organize the perfect division of labor.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      // Init with fresh state
                      setNewTaskTitle('');
                      setNewTaskDescription('');
                      setNewTaskSpecs('');
                      setNewTaskDeadline('');
                      setNewTaskFile(null);
                      setSelectedTeammates([]);
                      setAiDivisionResult(null);
                      setIsAddingTask(true);
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{lang === 'es' ? 'Añadir Tarea Colectiva' : 'Add Collaborative Homework'}</span>
                  </button>
                </div>
              ) : (
                // Actually displaying the custom Form inside the card
                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Task Title */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase font-bold text-slate-400">
                        {lang === 'es' ? 'Título de la Tarea o Deber' : 'Homework Title'} <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder={lang === 'es' ? 'ej. Proyecto de Investigación: Genética molecular' : 'e.g. Research Project: Molecular Genetics'}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Deadline */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] uppercase font-bold text-slate-400">
                        {lang === 'es' ? 'Fecha de Entrega Límite' : 'Due Deadline'}
                      </label>
                      <input
                        type="date"
                        value={newTaskDeadline}
                        onChange={(e) => setNewTaskDeadline(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>

                    {/* Short Description */}
                    <div className="space-y-1.5 text-left md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400">
                        {lang === 'es' ? 'Descripción del Deber' : 'Homework Description'} <span className="text-rose-400">*</span>
                      </label>
                      <textarea
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder={lang === 'es' ? 'Describe de forma clara de qué trata este deber escolar...' : 'Briefly describe this homework task...'}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Technical Specifications */}
                    <div className="space-y-1.5 text-left md:col-span-2">
                      <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                        <span>{lang === 'es' ? 'Especificaciones Técnicas o Rúbrica' : 'Specifications or Rubric'}</span>
                        <span className="text-[9px] text-slate-500 normal-case font-normal">{lang === 'es' ? '(Opcional pero recomendado para la IA)' : '(Optional but recommended for AI)'}</span>
                      </label>
                      <textarea
                        value={newTaskSpecs}
                        onChange={(e) => setNewTaskSpecs(e.target.value)}
                        placeholder={lang === 'es' ? 'Detalla requerimientos, secciones del informe, o puntos específicos de la rúbrica...' : 'Specify details, report sections, or key rubric items...'}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* File Upload (PDF/Image) */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400">
                      {lang === 'es' ? 'Subir PDF o Imagen de la Tarea' : 'Upload Homework PDF or Image'}
                    </label>
                    <div className="flex gap-4 items-center">
                      <div className="flex-1 border border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl p-3 bg-slate-950/60 relative text-center transition-all cursor-pointer">
                        <input
                          type="file"
                          accept="application/pdf,image/*"
                          onChange={(e) => {
                            const files = e.target.files;
                            if (files && files.length > 0) {
                              const file = files[0];
                              setNewTaskFile({
                                id: 'taskfile-' + Date.now(),
                                name: file.name,
                                type: file.type || 'application/pdf',
                                size: `${(file.size / 1024).toFixed(1)} KB`,
                                url: URL.createObjectURL(file),
                                content: `Material guía para la tarea: ${file.name}.`
                              });
                            }
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <Paperclip className="w-4 h-4 text-slate-400 mx-auto mb-1" />
                        <span className="text-[10px] text-slate-300 block">
                          {newTaskFile ? newTaskFile.name : (lang === 'es' ? 'Arrastrar o seleccionar archivo guía' : 'Drag or click to choose homework file')}
                        </span>
                      </div>
                      {newTaskFile && (
                        <button
                          type="button"
                          onClick={() => setNewTaskFile(null)}
                          className="p-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/10 rounded-xl transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Classmates / Companions Selection */}
                  <div className="space-y-3 p-4 bg-slate-950/40 rounded-2xl border border-white/5 text-left">
                    <div className="space-y-1 text-left">
                      <label className="text-[10px] uppercase font-bold text-indigo-300 flex items-center gap-1 justify-start">
                        <Users className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{lang === 'es' ? 'Compañeros de Equipo' : 'Team Companions'}</span>
                      </label>
                      <p className="text-[10.5px] text-slate-400 leading-snug">
                        {lang === 'es'
                          ? 'Selecciona los compañeros con los que harás esta tarea. La IA dividirá el trabajo en función de los seleccionados.'
                          : 'Select the teammates with whom you will do this homework. The AI will distribute tasks among selected people.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 justify-start">
                      {/* Self Option (Always included as a team member) */}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-full text-xs font-semibold shadow-md">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        {lang === 'es' ? 'Tú (Líder)' : 'You (Leader)'}
                      </span>

                      {/* Fallback virtual team members to test if friends is empty */}
                      {((friends && friends.length > 0) ? friends : [
                        { id: 'v-1', name: 'Sofía Rodríguez', email: 'sofia.academico@gmail.com' },
                        { id: 'v-2', name: 'Mateo González', email: 'mateo.estudiante@gmail.com' },
                        { id: 'v-3', name: 'Valeria Sinergia', email: 'valeria.estudios@gmail.com' }
                      ]).map((friend: any) => {
                        const isSelected = selectedTeammates.some(t => t.email === friend.email || t.name === friend.name);
                        return (
                          <button
                            type="button"
                            key={friend.id || friend.email}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedTeammates(prev => prev.filter(t => t.email !== friend.email && t.name !== friend.name));
                              } else {
                                setSelectedTeammates(prev => [...prev, friend]);
                              }
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                              isSelected
                                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-200 shadow-sm'
                                : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                          >
                            <span className="text-[10px] font-mono opacity-60">👥</span>
                            <span>{friend.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* AI Divider Flow */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                      <button
                        type="button"
                        disabled={isDividingTaskWithAI || !newTaskTitle.trim() || !newTaskDescription.trim()}
                        onClick={async () => {
                          setIsDividingTaskWithAI(true);
                          setAiDivisionResult(null);
                          try {
                            const listNames = ["Tú", ...selectedTeammates.map(t => t.name)];
                            const res = await fetch('/api/gemini/divide-task', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                taskTitle: newTaskTitle,
                                taskDescription: newTaskDescription,
                                taskSpecs: newTaskSpecs,
                                members: listNames,
                                fileContent: newTaskFile ? `${newTaskFile.name} (${newTaskFile.size})` : ""
                              })
                            });
                            const data = await res.json();
                            if (data && data.divisions) {
                              setAiDivisionResult(data.divisions);
                            }
                          } catch (err) {
                            console.error("AI Task division error:", err);
                          } finally {
                            setIsDividingTaskWithAI(false);
                          }
                        }}
                        className="px-5 py-3 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 disabled:opacity-50 text-white font-black rounded-2xl text-xs transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95 disabled:pointer-events-none"
                      >
                        {isDividingTaskWithAI ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                            <span>{lang === 'es' ? 'IA Dividiendo Trabajo...' : 'AI Splitting Work...'}</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 text-amber-300 animate-bounce" />
                            <span>{lang === 'es' ? 'Repartir Tarea con Inteligencia Artificial' : 'Delegate & Split Task with AI'}</span>
                          </>
                        )}
                      </button>

                      {/* Simple cancel / save task buttons */}
                      <div className="flex gap-2 self-end sm:self-auto">
                        {(isAddingTask && activeItem.taskTitle) && (
                          <button
                            type="button"
                            onClick={() => setIsAddingTask(false)}
                            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-bold"
                          >
                            {lang === 'es' ? 'Cancelar' : 'Cancel'}
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={!newTaskTitle.trim() || !newTaskDescription.trim()}
                          onClick={() => {
                            if (onUpdateWeek) {
                              onUpdateWeek(activeCourse.id, {
                                ...activeItem,
                                taskTitle: newTaskTitle.trim(),
                                taskDescription: newTaskDescription.trim(),
                                taskSpecs: newTaskSpecs.trim() || undefined,
                                taskDeadline: newTaskDeadline || undefined,
                                taskFile: newTaskFile || undefined,
                                taskAssignedFriends: selectedTeammates,
                                taskAIDivision: aiDivisionResult || undefined
                              });
                            }
                            setIsAddingTask(false);
                          }}
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs transition-colors shadow-lg disabled:opacity-40"
                        >
                          {lang === 'es' ? 'Guardar y Publicar' : 'Save & Publish'}
                        </button>
                      </div>
                    </div>

                    {/* Loader steps visualization when AI is active */}
                    {isDividingTaskWithAI && (
                      <div className="p-4 bg-slate-950/60 rounded-2xl border border-indigo-500/10 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-indigo-300 animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                          <span>{lang === 'es' ? 'Extrayendo rúbrica y contexto de apuntes...' : 'Extracting rubric and study context...'}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">
                          {lang === 'es'
                            ? 'Analizando la complejidad del tema para proponer divisiones equitativas y coordinadas.'
                            : 'Analyzing complexity to divide and conquer with team members.'}
                        </p>
                      </div>
                    )}

                    {/* Live AI output previews inside the editor */}
                    {aiDivisionResult && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-3 p-4 bg-indigo-950/20 rounded-2xl border border-indigo-500/20 text-left"
                      >
                        <h4 className="text-xs font-bold text-amber-300 flex items-center gap-1.5 justify-start">
                          <Sparkles className="w-4 h-4 text-amber-400" />
                          <span>{lang === 'es' ? 'Propuesta de Distribución Equitativa (Gemini AI)' : 'Fair Split Proposal (Gemini AI)'}</span>
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {aiDivisionResult.map((div, idx) => (
                            <div key={idx} className="p-3 bg-slate-950/80 rounded-xl border border-white/5 space-y-1.5 text-xs text-left">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-200">{div.assigneeName}</span>
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                                  {lang === 'es' ? `Sub-tarea ${idx + 1}` : `Sub-task ${idx + 1}`}
                                </span>
                              </div>
                              <h5 className="font-semibold text-indigo-300 leading-tight text-[11.5px]">{div.title}</h5>
                              <p className="text-[10.5px] text-slate-400 leading-snug">{div.description}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              )
            ) : (
              // CASE 2: Display mode when task already exists and form is closed
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left part: Task main info */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="space-y-1.5 text-left">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                        🎯 {lang === 'es' ? 'Entregable Activo' : 'Active Deliverable'}
                      </span>
                      <h4 className="text-lg font-black text-white leading-tight">{activeItem.taskTitle}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-sans">{activeItem.taskDescription}</p>
                    </div>

                    {activeItem.taskSpecs && (
                      <div className="p-4 bg-slate-950/40 rounded-2xl border border-white/5 space-y-1.5 text-left">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                          📋 {lang === 'es' ? 'Especificaciones y Rúbrica' : 'Specifications & Rubric'}
                        </span>
                        <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{activeItem.taskSpecs}</p>
                      </div>
                    )}
                  </div>

                  {/* Right part: Deadline, file, team list */}
                  <div className="space-y-4 text-left">
                    {/* Deadline card */}
                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-2 flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/10">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">
                          {lang === 'es' ? 'Fecha Límite' : 'Due Deadline'}
                        </span>
                        <span className="text-xs text-slate-200 font-mono font-bold">
                          {activeItem.taskDeadline || (lang === 'es' ? 'No especificada' : 'Not specified')}
                        </span>
                      </div>
                    </div>

                    {/* Task File if present */}
                    {activeItem.taskFile && (
                      <div className="p-3 bg-slate-950/60 rounded-2xl border border-white/5 flex items-center justify-between text-xs gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          {getFileIcon(activeItem.taskFile.name)}
                          <span className="text-slate-300 truncate font-semibold text-[11px]" title={activeItem.taskFile.name}>
                            {activeItem.taskFile.name}
                          </span>
                        </div>
                        <button
                          onClick={() => window.open(activeItem.taskFile?.url, '_blank')}
                          className="px-2.5 py-1.5 bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all rounded-lg text-[10px] font-bold"
                        >
                          {lang === 'es' ? 'Ver' : 'Open'}
                        </button>
                      </div>
                    )}

                    {/* Teammates assigned */}
                    <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-3">
                      <span className="text-[9px] uppercase font-bold text-slate-500 block">
                        👥 {lang === 'es' ? 'Integrantes del Equipo' : 'Team Members'}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        <span className="px-2.5 py-1 bg-indigo-600 text-white text-[10.5px] font-semibold rounded-full shadow-sm">
                          {lang === 'es' ? 'Tú (Líder)' : 'You (Leader)'}
                        </span>
                        {activeItem.taskAssignedFriends && activeItem.taskAssignedFriends.map((f: any, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 bg-slate-900 border border-white/5 text-slate-300 text-[10.5px] font-semibold rounded-full">
                            {f.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Division roadmap if present */}
                {activeItem.taskAIDivision && (
                  <div className="pt-4 border-t border-white/5 space-y-4 text-left">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                        {lang === 'es' ? 'Distribución Sinergizada por IA' : 'AI Sinergy Task Distribution'}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {activeItem.taskAIDivision.map((div, idx) => {
                        const isSelf = div.assigneeName === "Tú" || div.assigneeName.toLowerCase().includes("tú");
                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-2xl border transition-all space-y-2 text-left relative overflow-hidden ${
                              isSelf
                                ? 'bg-indigo-600/10 border-indigo-500/30 shadow-indigo-500/5 shadow-md'
                                : 'bg-slate-950 border-white/5 hover:border-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between border-b border-white/5 pb-2">
                              <span className={`text-[11px] font-bold ${isSelf ? 'text-indigo-300' : 'text-slate-300'}`}>
                                {div.assigneeName} {isSelf && (lang === 'es' ? '(Tu parte)' : '(Your part)')}
                              </span>
                              <span className="text-[9px] font-mono font-bold text-slate-500">
                                #{idx + 1}
                              </span>
                            </div>
                            <h5 className="font-bold text-white text-xs leading-tight">{div.title}</h5>
                            <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">{div.description}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Modifier buttons */}
          <div className="flex items-center gap-3 justify-end pt-4">
            <button
              onClick={() => openEditItemForm(activeItem, activeCourse.items.indexOf(activeItem))}
              className="px-5 py-3 bg-white/5 hover:bg-white/10 text-indigo-400 font-bold rounded-2xl text-xs transition-colors border border-indigo-500/20 flex items-center gap-2"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>{lang === 'es' ? 'Modificar Título / Tarea de Semana' : 'Modify Week Title / Task'}</span>
            </button>
          </div>
        </div>
      );
    }

    // LIST VIEW OF WEEKS (When course is entered but no week is active yet)
    return (
      <div id="course-workspace-section" className="space-y-6 text-left">
        {/* Header with Back button and Delete option */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <button
            onClick={() => {
              setExpandedCourseId(null);
              setExpandedItemId(null);
            }}
            className="flex items-center gap-2 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/15 w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{lang === 'es' ? 'Volver a Cursos' : 'Back to Courses'}</span>
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-full font-mono uppercase tracking-wider font-semibold">
              {activeCourse.structureType === 'weeks' 
                ? (lang === 'es' ? `${activeCourse.items.length} Semanas` : `${activeCourse.items.length} Weeks`)
                : (lang === 'es' ? `${activeCourse.items.length} Módulos` : `${activeCourse.items.length} Modules`)
              }
            </span>
            <button
              onClick={() => {
                onDeleteCourse(activeCourse.id);
                setExpandedCourseId(null);
                setExpandedItemId(null);
              }}
              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold"
              title={lang === 'es' ? 'Eliminar Curso' : 'Delete Course'}
            >
              <Trash2 className="w-4 h-4" />
              <span>{lang === 'es' ? 'Eliminar Asignatura' : 'Delete Subject'}</span>
            </button>
          </div>
        </div>

        {/* Course Core Display: Large and prominent */}
        <div className="p-6 md:p-8 rounded-3xl bg-[#0c1224] border border-white/10 relative overflow-hidden space-y-6 shadow-xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex items-start gap-4 text-left">
            <div className="p-4 bg-indigo-600/10 text-indigo-400 rounded-2xl border border-indigo-500/20 flex-shrink-0">
              <BookOpen className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">{activeCourse.title}</h1>
              <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-3xl">
                {activeCourse.description || (lang === 'es' ? 'Sin descripción añadida. Organiza tus apuntes y potencia tu aprendizaje con resúmenes automatizados.' : 'No description provided. Organize your files and level up your study.')}
              </p>
            </div>
          </div>

          {/* Statistics Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {lang === 'es' ? 'Preparación de Material' : 'Material Readiness'}
              </span>
              <div className="text-base font-black text-emerald-400 flex items-center gap-1.5 mt-1">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>
                  {activeCourse.items.some(item => item.files.length > 0) 
                    ? (lang === 'es' ? 'Activo' : 'Active') 
                    : (lang === 'es' ? 'Sin Documentos' : 'Empty')}
                </span>
              </div>
              <p className="text-[9px] text-slate-500">
                {lang === 'es' ? 'Estado del temario escolar' : 'School syllabus state'}
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {lang === 'es' ? 'Recursos Cargados' : 'Uploaded Resources'}
              </span>
              <div className="text-base font-black text-indigo-400 mt-1">
                {activeCourse.items.reduce((sum, item) => sum + item.files.length, 0)} {lang === 'es' ? 'Documentos' : 'Files'}
              </div>
              <p className="text-[9px] text-slate-500">
                {lang === 'es' ? 'Apuntes de clase escaneados' : 'Scanned class notes'}
              </p>
            </div>

            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-left space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                {lang === 'es' ? 'Tácticas de Estudio IA' : 'AI Study Tactics'}
              </span>
              <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mt-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'es' ? 'Flashcards y Repaso' : 'Flashcards & Recall'}</span>
              </div>
              <p className="text-[9px] text-slate-500">
                {lang === 'es' ? 'Listo para el asistente cognitivo' : 'Ready for cognitive assistant'}
              </p>
            </div>
          </div>
        </div>

        {/* Weekly/Modular breakdown title */}
        <div className="flex items-center justify-between pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left font-mono">
            {activeCourse.structureType === 'weeks' 
              ? (lang === 'es' ? 'Plan de Estudio Semanal (Presiona para entrar)' : 'Weekly Study Plan (Click to enter)')
              : (lang === 'es' ? 'Tópicos de Aprendizaje (Presiona para entrar)' : 'Learning Topics & Modules (Click to enter)')
            }
          </h3>
        </div>

        {/* Weeks/Modules Grid (each week enters its detailed view when clicked!) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCourse.items.map((item, index) => {
            const isDragOver = dragOverItemId === `${activeCourse.id}-${item.id}`;

            return (
              <div
                key={item.id}
                onClick={() => setExpandedItemId(item.id)}
                className={`p-5 bg-[#0a0f1d] hover:bg-[#0c1224] rounded-3xl border cursor-pointer transition-all flex flex-col justify-between group h-48 relative overflow-hidden ${
                  isDragOver 
                    ? 'bg-indigo-500/15 border-indigo-500 border-dashed scale-[1.01]' 
                    : 'border-white/10 hover:border-indigo-500/30 shadow-md transform hover:-translate-y-1'
                }`}
              >
                <div className="space-y-3 text-left">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                      <Calendar className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                      {item.name}
                    </h4>
                    
                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openEditItemForm(item, index)}
                        className="p-1 text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title={lang === 'es' ? 'Modificar' : 'Modify'}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteWeek && (
                        <button
                          onClick={() => onDeleteWeek(activeCourse.id, item.id)}
                          className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title={lang === 'es' ? 'Eliminar' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Indicators and tags list */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.isRead && (
                      <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                        {lang === 'es' ? 'Leído ✔' : 'Read ✔'}
                      </span>
                    )}
                    {item.bestScore !== undefined && (
                      <span className="text-[9px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                        {lang === 'es' ? `Nota: ${item.bestScore}/10` : `Score: ${item.bestScore}/10`}
                      </span>
                    )}
                    {item.files.length > 0 ? (
                      <span className="text-[9px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold">
                        {item.files.length} {lang === 'es' ? 'Archivos' : 'Files'}
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded-full">
                        {lang === 'es' ? 'Sin archivos' : 'Empty'}
                      </span>
                    )}
                    {item.taskDescription && (
                      <span className="text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-semibold">
                        {lang === 'es' ? 'Tarea' : 'HW'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                  <span className="text-slate-500 group-hover:text-indigo-400 font-medium transition-colors">
                    {lang === 'es' ? 'Entrar a la Aula de Clase' : 'Enter Class Room'}
                  </span>
                  <span className="text-slate-400 group-hover:text-indigo-300 transition-all font-bold transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Option to add a week / module below */}
        <div className="flex items-center justify-center pt-4">
          <button
            onClick={openAddItemForm}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-2 border border-indigo-500/30"
          >
            <Plus className="w-4 h-4" />
            <span>
              {activeCourse.structureType === 'weeks' 
                ? (lang === 'es' ? 'Agregar Nueva Semana' : 'Add New Week')
                : (lang === 'es' ? 'Agregar Nuevo Módulo' : 'Add New Module')
              }
            </span>
          </button>
        </div>

        {/* DIALOG FOR ADDING / MODIFYING WEEK OR MODULE */}
        <AnimatePresence>
          {isItemFormOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg p-6 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" />
                    {editingItemId 
                      ? (lang === 'es' ? 'Modificar Especificaciones' : 'Modify Specifications')
                      : (lang === 'es' ? 'Agregar Nueva Sección' : 'Add New Section')
                    }
                  </h3>
                  <button
                    onClick={resetItemForm}
                    className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleItemFormSubmit} className="space-y-4 text-left">
                  {/* Dynamic Week/Module prefix indicator and User input */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">
                      {activeCourse.structureType === 'weeks' 
                        ? (lang === 'es' ? 'Identificador de la Semana' : 'Week Identifier')
                        : (lang === 'es' ? 'Identificador del Módulo' : 'Module Identifier')
                      }
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="px-3.5 py-2.5 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 font-black rounded-xl text-xs font-mono whitespace-nowrap">
                        {getItemPrefix(
                          editingItemId 
                            ? activeCourse.items.findIndex(it => it.id === editingItemId)
                            : activeCourse.items.length, 
                          activeCourse.structureType
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        value={itemTitle}
                        onChange={(e) => setItemTitle(e.target.value)}
                        placeholder={lang === 'es' ? 'ej. Conceptos Claves y Límites' : 'e.g. Core Concepts & Limits'}
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Files list / Upload area inside the form */}
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-between">
                      <span>{lang === 'es' ? 'Documentos de Estudio' : 'Study Documents'}</span>
                      <span className="text-slate-500 text-[9px] lowercase font-normal">
                        (PDF, Word, Excel, images)
                      </span>
                    </label>

                    <div className="border border-dashed border-white/10 hover:border-indigo-500/40 rounded-xl p-3 bg-white/5 text-center transition-all cursor-pointer relative">
                      <input
                        type="file"
                        multiple
                        onChange={(e) => handleFormFileChange(e, false)}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-300 block">
                        {lang === 'es' ? 'Subir Archivos Académicos' : 'Upload Academic Files'}
                      </span>
                    </div>

                    {/* Show files currently queued in state */}
                    {itemFiles.length > 0 && (
                      <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                        {itemFiles.map((file) => (
                          <div
                            key={file.id}
                            className="p-2 bg-slate-950 border border-white/5 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {getFileIcon(file.name)}
                              <span className="text-slate-300 truncate font-medium text-[11px]" title={file.name}>
                                {file.name}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setItemFiles(prev => prev.filter(f => f.id !== file.id))}
                              className="text-rose-400 hover:text-rose-300 p-1 rounded-md hover:bg-rose-500/10"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* TASK / DEBERES AREA */}
                  <div className="p-4 bg-slate-950/60 rounded-2xl border border-white/5 space-y-3">
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider font-mono">
                      {lang === 'es' ? '⚡️ Configurar Deber o Tarea' : '⚡️ Configure HW / Task'}
                    </span>
                    
                    <div className="space-y-1">
                      <textarea
                        value={itemTaskDescription}
                        onChange={(e) => setItemTaskDescription(e.target.value)}
                        placeholder={lang === 'es' ? 'Descripción corta de la tarea o asignación...' : 'Short description of the assigned homework...'}
                        rows={2}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase font-bold text-slate-500">
                        {lang === 'es' ? 'Subir Material de la Tarea (PDF o Imagen)' : 'Upload HW Material (PDF or Image)'}
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 border border-dashed border-white/5 rounded-xl p-2 bg-slate-900 relative text-center">
                          <input
                            type="file"
                            onChange={(e) => handleFormFileChange(e, true)}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <span className="text-[10px] text-slate-400 block">
                            {itemTaskFile ? itemTaskFile.name : (lang === 'es' ? 'Subir Archivo Tarea' : 'Upload Task File')}
                          </span>
                        </div>
                        {itemTaskFile && (
                          <button
                            type="button"
                            onClick={() => setItemTaskFile(null)}
                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/10"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/5">
                    <button
                      type="button"
                      onClick={resetItemForm}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-xs font-semibold"
                    >
                      {lang === 'es' ? 'Cancelar' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg"
                    >
                      {editingItemId 
                        ? (lang === 'es' ? 'Guardar Cambios' : 'Save Changes')
                        : (lang === 'es' ? 'Agregar' : 'Add')
                      }
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // VIEW 2: COURSE LIST VIEW
  return (
    <div id="trajectory-academic-section" className="space-y-6 text-left">
      {/* Dynamic Motivational Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-900/40 via-indigo-950/40 to-slate-900 border border-indigo-500/10 rounded-2xl flex items-center justify-between text-xs text-indigo-200">
        <div className="flex items-center gap-2 text-left">
          <GraduationCap className="w-5 h-5 text-indigo-400 animate-pulse flex-shrink-0" />
          <span className="font-semibold">{lang === 'es' ? currentMsg.es : currentMsg.en}</span>
        </div>
        <Sparkles className="w-4 h-4 text-amber-400 hidden sm:block" />
      </div>

      {/* Main Header & Configure Course Trigger */}
      <div className="flex items-center justify-between">
        <div className="text-left">
          <h2 className="text-xl font-bold text-white tracking-tight">
            {lang === 'es' ? 'Trayectoria Académica' : 'Academic Trajectory'}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'es' ? 'Administra tus asignaturas escolares por semanas o módulos con documentos.' : 'Manage your school subjects by weeks or modules with custom files.'}
          </p>
        </div>

        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
        >
          <FolderPlus className="w-4 h-4" />
          <span>{lang === 'es' ? 'Configurar Curso' : 'Setup Course'}</span>
        </button>
      </div>

      {/* Form: New Course configuration */}
      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 glass-card rounded-3xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-left font-mono">
              {lang === 'es' ? 'Configurar Nuevo Curso Académico' : 'Configure New Academic Course'}
            </h3>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'es' ? 'Título de Asignatura' : 'Subject Title'}
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={lang === 'es' ? 'ej. Álgebra Lineal, Biología Molecular' : 'e.g. Linear Algebra'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'es' ? 'Estructuración Flexible' : 'Flexible Structure'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStructureType('weeks')}
                    className={`p-2.5 text-xs font-bold rounded-xl border transition-all ${
                      structureType === 'weeks' 
                        ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300' 
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {lang === 'es' ? 'Semanas Académicas' : 'Academic Weeks'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStructureType('modules')}
                    className={`p-2.5 text-xs font-bold rounded-xl border transition-all ${
                      structureType === 'modules' 
                        ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300' 
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-900'
                    }`}
                  >
                    {lang === 'es' ? 'Módulos Personalizados' : 'Custom Modules'}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-left md:col-span-2">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'es' ? 'Descripción u Objetivos' : 'Description or Objectives'}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={lang === 'es' ? 'Describe los tópicos claves del plan de estudios' : 'Describe the key topics of the syllabus'}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-bold text-slate-400">
                  {lang === 'es' ? `Número de ${structureType === 'weeks' ? 'Semanas' : 'Módulos'}` : `Number of ${structureType === 'weeks' ? 'Weeks' : 'Modules'}`}
                </label>
                 <input
                  type="text"
                  value={customItemsCount}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) {
                      setCustomItemsCount(val);
                    }
                  }}
                  placeholder="4"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex items-end gap-2 md:col-span-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  {lang === 'es' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors shadow-lg"
                >
                  {lang === 'es' ? 'Crear Asignatura' : 'Create Subject'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course List Display */}
      <div className="grid grid-cols-1 gap-4">
        {courses.map((course) => (
          <div
            key={course.id}
            onClick={() => setExpandedCourseId(course.id)}
            className="p-5 bg-[#0c1224] hover:bg-[#111a33] border border-white/5 hover:border-indigo-500/30 rounded-3xl cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 group shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
          >
            <div className="flex gap-4">
              <div className="p-3 bg-indigo-600/10 text-indigo-400 rounded-2xl border border-indigo-500/10 group-hover:bg-indigo-600/25 group-hover:border-indigo-500/30 transition-all flex-shrink-0 self-start sm:self-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">{course.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 max-w-xl">
                  {course.description || (lang === 'es' ? 'Sin descripción añadida. Pulsa para entrar y configurar tus apuntes de estudio.' : 'No description provided. Click to enter and configure your study notes.')}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span className="text-[10px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-semibold">
                    {course.structureType === 'weeks' 
                      ? (lang === 'es' ? `${course.items.length} Semanas` : `${course.items.length} Weeks`)
                      : (lang === 'es' ? `${course.items.length} Módulos` : `${course.items.length} Modules`)
                    }
                  </span>
                  {course.items.some(it => it.files && it.files.length > 0) && (
                    <span className="text-[10px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      {lang === 'es' ? 'Con material' : 'Has materials'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card onClick trigger
                  setExpandedCourseId(course.id);
                }}
                className="px-4 py-2 bg-[#121c38] hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/20 rounded-xl text-xs font-bold transition-all shadow-md"
              >
                {lang === 'es' ? 'Entrar' : 'Enter'}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevent card onClick trigger
                  onDeleteCourse(course.id);
                }}
                className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-all"
                title={lang === 'es' ? 'Eliminar Curso' : 'Delete Course'}
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="p-8 rounded-3xl glass-card text-center space-y-3">
            <GraduationCap className="w-12 h-12 text-slate-700 mx-auto animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">
                {lang === 'es' ? 'Configura tu primer curso' : 'Setup your first course'}
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {lang === 'es' 
                  ? 'Crea asignaturas, asocia semanas de trayectoria académica y sube tus apuntes para activar el motor cognitivo de estudio.' 
                  : 'Create subjects, associate study weeks, and upload academic notes to empower the cognitive AI engine.'}
              </p>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
            >
              {lang === 'es' ? 'Comenzar Configuración' : 'Get Started'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
