'use client';

import { useState, useRef, useEffect, type FormEvent, Fragment, useMemo } from 'react';
import { questions, type Question, type QuestionKey } from '@/lib/questions';
import { verifyAnswerAction, textToSpeechAction } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { ChatBubble } from './chat-bubble';
import { Sidebar } from './sidebar';
import { QuickReplyPanel } from './quick-reply-panel';
import { Send, Loader2, Volume2, VolumeX, Mic, MicOff, X, PanelRightOpen, Menu } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { cn, removeEmojis } from '@/lib/utils';
import { TypingEffect } from './typing-effect';
import { AppIcon } from './app-icon';


// For browser compatibility
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type Message = {
  id: string | number;
  role: 'user' | 'bot';
  content: React.ReactNode;
  audioDataUri?: string;
  questionKey?: QuestionKey;
  isAnswer?: boolean;
  isTyping?: boolean;
  rawContent?: string;
};

type SpecialFlowState = {
  type: 'radiation';
  step: 'location' | 'start' | 'end';
} | null;

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({} as Record<QuestionKey, string>);
  const [currentQuestionKey, setCurrentQuestionKey] = useState<QuestionKey>(questions[0].key);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [editingState, setEditingState] = useState<{ key: QuestionKey; id: string | number } | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedReplies, setSelectedReplies] = useState<string[]>([]);
  const [specialFlow, setSpecialFlow] = useState<SpecialFlowState>(null);
  const [radiationStart, setRadiationStart] = useState<string[]>([]);
  const [isTtsAvailable, setIsTtsAvailable] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(false);
  const [baseInputValue, setBaseInputValue] = useState('');
  const [isQuickReplyOpen, setIsQuickReplyOpen] = useState(false);
  const [autoShowReplies, setAutoShowReplies] = useState(false);
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(true);
  const [isDesktop, setIsDesktop] = useState(true);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messageIdCounter = useRef(0);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const handleResize = () => {
        const isDesktopQuery = mediaQuery.matches;
        setIsDesktop(isDesktopQuery);
        // Start expanded on desktop, minimized (hidden) on mobile
        setIsSidebarMinimized(!isDesktopQuery);
    };

    handleResize(); // Initial check
    const mql = window.matchMedia('(min-width: 768px)');
    mql.addEventListener('change', handleResize);

    return () => mql.removeEventListener('change', handleResize);
  }, []);

  const isQuestionRelevant = (question: Question, currentAnswers: Record<QuestionKey, string>): boolean => {
    const key = question.key;
    const chiefComplaint = currentAnswers.chiefComplaint?.toLowerCase() || '';

    if (key === 'secondhandSmoke') {
        const lungRelatedComplaints = ['cough', 'colds', 'ubo', 'sipon', 'breath', 'hinga', 'chest', 'dibdib'];
        return lungRelatedComplaints.some(term => chiefComplaint.includes(term));
    }

    if (key === 'sexualHistory') {
        const sexualHealthTriggers = ['abdominal', 'tiyan', 'puson', 'urinary', 'ihi', 'menstrual'];
        return sexualHealthTriggers.some(term => chiefComplaint.includes(term));
    }
    
    return true; // All other questions are relevant by default
  };

  const visibleQuestions = useMemo(() => {
    const coreQuestions = questions.slice(0, 8); // Up to 'timing'
    if (!answers.chiefComplaint) {
        return coreQuestions;
    }

    const lifestyleQuestions = questions.slice(8);
    const relevantLifestyleQuestions = lifestyleQuestions.filter(q => isQuestionRelevant(q, answers));
    
    return [...coreQuestions, ...relevantLifestyleQuestions];
  }, [answers.chiefComplaint]);


  const getNewMessageId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}-${random}-${messageIdCounter.current++}`;
  };

  const stopListening = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.lang = 'fil-PH';
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => {
      setIsRecording(false);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = null;
      }
    };
    recognition.onresult = (event: any) => {
        if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);

        const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');
        
        setInputValue(baseInputValue ? `${baseInputValue} ${transcript}` : transcript);

        inactivityTimeoutRef.current = setTimeout(() => {
          stopListening();
        }, 5000);
    };
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      toast({
        variant: 'destructive',
        title: 'Speech Recognition Error',
        description: event.error === 'not-allowed' ? 'Microphone access denied.' : 'An error occurred during speech recognition.'
      });
      setIsRecording(false);
    };
    recognitionRef.current = recognition;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseInputValue]);
  
  useEffect(() => {
    const checkTtsAvailability = async () => {
        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const result = await textToSpeechAction(' '); 
                if (result?.audioDataUri) {
                    setIsTtsAvailable(true);
                    return;
                }
            } catch (error) {
                console.error(`TTS check attempt ${attempt} failed`, error);
            }
            if (attempt < 3) {
                await new Promise(res => setTimeout(res, 1000 * attempt));
            }
        }
        console.warn("Text-to-speech service is not available after multiple attempts.");
        setIsTtsAvailable(false);
    };
    checkTtsAvailability();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const interruptSpeech = () => {
    if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current = null;
        setIsSpeaking(false);
    }
  };

  const playAudio = (audioDataUri: string) => {
    interruptSpeech();
    const audio = new Audio(audioDataUri);
    audioRef.current = audio;
    setIsSpeaking(true);
    audio.play().catch(e => {
      console.error("Audio playback failed:", e);
      setIsSpeaking(false);
    });
    audio.onended = () => {
      setIsSpeaking(false);
      audioRef.current = null;
    };
    audio.onerror = () => {
      console.error("Error playing audio.");
      setIsSpeaking(false);
      audioRef.current = null;
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const addBotMessageAndSpeak = async (content: React.ReactNode, textForTts?: string, questionKey?: QuestionKey) => {
    setIsQuickReplyOpen(false); // Hide replies when bot starts talking
    const messageId = getNewMessageId();
    const contentString = textForTts ?? (typeof content === 'string' ? content : '');
    
    const handleTts = async () => {
        if (!isTtsEnabled || !contentString) return;
        interruptSpeech();
        try {
            const ttsResult = await textToSpeechAction(contentString);
            if (ttsResult?.audioDataUri) {
              setMessages(prev => prev.map(m => m.id === messageId ? { ...m, audioDataUri: ttsResult.audioDataUri } : m));
              playAudio(ttsResult.audioDataUri);
            }
          } catch (e) {
            console.error("TTS failed, proceeding without audio.", e);
          }
    };
    
    const onTypingComplete = () => {
        const currentQuestion = visibleQuestions.find(q => q.key === questionKey);
        if (currentQuestion?.interactive && autoShowReplies) {
            setIsQuickReplyOpen(true); // Show replies when typing is done if user has opted in
        }
        handleTts();
    };
    
    const animatedContent = typeof content === 'string' 
      ? <TypingEffect text={content} onComplete={onTypingComplete} onUpdate={scrollToBottom} speed={15} /> 
      : content;
      
    const newMessage: Message = {
      id: messageId,
      role: 'bot',
      content: animatedContent,
      questionKey,
      isTyping: typeof content === 'string',
      rawContent: contentString,
    };

    setMessages(prev => {
        const updatedMessages = prev.map(m => {
            if (m.isTyping && m.rawContent) {
                return { ...m, content: m.rawContent, isTyping: false };
            }
            return m;
        });
        return [...updatedMessages, newMessage];
    });

    if (typeof content !== 'string') {
        await handleTts();
    }
  };
  
  const startConversation = async () => {
    await addBotMessageAndSpeak(questions[0].text, undefined, questions[0].key);
  };
  
  useEffect(() => {
    if (messages.length === 0 && !isComplete) {
      startConversation();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isComplete]);

  useEffect(() => {
    if (editingState) {
        const element = document.getElementById(`msg-${editingState.id}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else {
      scrollToBottom();
    }
  }, [editingState, messages, isLoading, specialFlow]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const scrollHeight = textarea.scrollHeight;
      const newHeight = scrollHeight + 2;
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  const addUserMessage = (content: React.ReactNode, options: { questionKey?: QuestionKey; isAnswer?: boolean } = {}) => {
    const { questionKey, isAnswer } = options;
    setMessages(prev => [...prev, { id: getNewMessageId(), role: 'user', content, questionKey, isAnswer }]);
  };

  const advanceToNextQuestion = async () => {
    const currentAnswers = { ...answers };
    const currentIndexInVisibleList = visibleQuestions.findIndex(q => q.key === currentQuestionKey);
    let nextQuestion: Question | undefined = undefined;

    for (let i = currentIndexInVisibleList + 1; i < visibleQuestions.length; i++) {
        const question = visibleQuestions[i];
        if (!currentAnswers[question.key]) {
            nextQuestion = question;
            break;
        }
    }
    
    if (nextQuestion) {
        setCurrentQuestionKey(nextQuestion.key);
        await addBotMessageAndSpeak(nextQuestion.text, undefined, nextQuestion.key);
    } else {
        const firstUnanswered = visibleQuestions.find(q => !currentAnswers[q.key]);
        if (firstUnanswered) {
            setCurrentQuestionKey(firstUnanswered.key);
            await addBotMessageAndSpeak(firstUnanswered.text, undefined, firstUnanswered.key);
        } else {
            setIsComplete(true);
            await addBotMessageAndSpeak("Maraming salamat! Eto ang summary ng iyong mga sagot. Pwede mo itong i-copy o i-download.", "Maraming salamat! Narito ang buod ng iyong mga sagot. Maaari mo itong kopyahin o i-download.");
        }
    }
  };

  const processNextQuestion = async (answer: string, question: Question) => {
    setAnswers(prev => ({ ...prev, [question.key]: answer }));
    await advanceToNextQuestion();
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (isSpeaking) interruptSpeech();
    if (isLoading || specialFlow) return;
    
    if (editingState) {
        const newAnswer = inputValue.trim();
        if (!newAnswer) {
            setEditingState(null);
            setInputValue('');
            return;
        }
        setMessages(prev => prev.map(msg => 
            msg.id === editingState.id ? { ...msg, content: newAnswer } : msg
        ));
        setAnswers(prev => ({ ...prev, [editingState.key]: newAnswer }));
        setEditingState(null);
        setInputValue('');
        toast({ title: "Answer updated successfully!" });
        return;
    }
    
    if (!inputValue.trim()) return;

    const currentAnswer = inputValue.trim();
    setInputValue('');
    const currentQuestion = visibleQuestions.find(q => q.key === currentQuestionKey)!;
    addUserMessage(currentAnswer, { questionKey: currentQuestion.key, isAnswer: true });

    setIsLoading(true);

    const verificationResult = await verifyAnswerAction({ question: currentQuestion.label, answer: currentAnswer });
    if (verificationResult.isValid) {
      await processNextQuestion(verificationResult.correctedAnswer, currentQuestion);
    } else {
      const botMessage = "Paumanhin, hindi ko masyadong naintindihan ang iyong sagot. Maaari mo bang subukang ipaliwanag muli sa ibang paraan?";
      await addBotMessageAndSpeak(botMessage, botMessage);
    }
    setIsLoading(false);
  };

  const handleQuickReply = async (answer: string) => {
    if (isRecording) stopListening();
    if (isSpeaking) interruptSpeech();
    if (isLoading) return;

    setIsQuickReplyOpen(false);

    if (editingState) {
        const question = visibleQuestions.find(q => q.key === editingState.key);
        if (question?.interactive?.type !== 'multi-select') {
          setMessages(prev => prev.map(msg => 
              msg.id === editingState.id ? { ...msg, content: answer } : msg
          ));
          setAnswers(prev => ({ ...prev, [editingState.key]: answer }));
          setEditingState(null);
          setInputValue('');
          toast({ title: "Answer updated successfully!" });
        }
        return;
    }

    if (specialFlow) return;
    
    const currentQuestion = visibleQuestions.find(q => q.key === currentQuestionKey)!;

    if (currentQuestion.key === 'radiation') {
      addUserMessage(answer);
      setIsLoading(true);
      if (answer.toLowerCase().includes('nananatili')) {
        setSpecialFlow({ type: 'radiation', step: 'location' });
        await addBotMessageAndSpeak('Salamat. Pakipili kung saang parte ng katawan ang masakit.');
      } else {
        setSpecialFlow({ type: 'radiation', step: 'start' });
        await addBotMessageAndSpeak('Naiintindihan ko. Saan po nagsisimula ang sakit?');
      }
      setIsLoading(false);
      return; 
    }

    addUserMessage(answer, { questionKey: currentQuestion.key, isAnswer: true });
    
    setIsLoading(true);
    await processNextQuestion(answer, currentQuestion);
    setIsLoading(false);
  };
  
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const formattedDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(selectedDate);
      handleQuickReply(`It started on ${formattedDate}.`);
      setIsCalendarOpen(false);
    }
  };
  
  const handleEdit = (questionKey: QuestionKey, messageId: string | number) => {
      if (isRecording) stopListening();
      if (isSpeaking) {
        toast({ variant: "destructive", title: "Cannot edit now", description: "Please wait for the bot to finish speaking." });
        return;
      }
      
      if (specialFlow) {
        toast({ variant: "destructive", title: "Cannot edit now", description: "Please complete the current question first." });
        return;
      }

      if (questionKey === 'radiation') {
        handleJumpToQuestion('radiation');
        return;
      }
      
      const question = visibleQuestions.find(q => q.key === questionKey);
      const existingAnswer = answers[questionKey] || '';
      
      setEditingState({ key: questionKey, id: messageId });
      
      if (question?.interactive?.type === 'multi-select') {
          setSelectedReplies(existingAnswer ? existingAnswer.split(', ') : []);
          setInputValue('');
      } else {
          setSelectedReplies([]);
          setInputValue(existingAnswer);
      }
  };
  
  const handleJumpToQuestion = (key: QuestionKey) => {
    if (isRecording) stopListening();
    if (!isDesktop) {
        setIsSidebarMinimized(true);
    }
    const isCurrentQuestion = key === currentQuestionKey && !isComplete;
    if (isCurrentQuestion) return;

    if (isSpeaking) interruptSpeech();
    if (isLoading) {
      toast({ variant: 'destructive', title: "Cannot jump to question", description: "Please complete the current interaction first." });
      return;
    }
    if (editingState) {
        setEditingState(null);
        setInputValue('');
    }

    const targetQuestion = visibleQuestions.find(q => q.key === key);
    if (!targetQuestion) {
        toast({ title: "Question not available", description: "This question is not relevant based on your chief complaint." });
        return;
    }

    if (key === 'radiation') {
      const radiationIndex = visibleQuestions.findIndex(q => q.key === 'radiation');
      if (radiationIndex === -1) return;

      const newAnswers = { ...answers };
      delete newAnswers.radiation;
      
      const subsequentAnsweredKeys = Object.keys(answers).filter(k => {
          const key = k as QuestionKey;
          const answeredIndex = visibleQuestions.findIndex(q => q.key === key);
          return answeredIndex > radiationIndex;
      });
      subsequentAnsweredKeys.forEach(key => {
        delete newAnswers[key as QuestionKey];
      });

      setAnswers(newAnswers);
      
      setCurrentQuestionKey('radiation');
      setIsComplete(false); 
      setSpecialFlow(null);
      setSelectedReplies([]);
      setRadiationStart([]);
      
      const radiationMessageIndex = messages.findLastIndex(m => m.questionKey === 'radiation' && m.isAnswer);
      if (radiationMessageIndex !== -1) {
          setMessages(prev => {
            const nextBotQuestionIndex = prev.findIndex((msg, index) => index > radiationMessageIndex && msg.role === 'bot');
            return nextBotQuestionIndex !== -1 ? prev.slice(0, nextBotQuestionIndex) : prev;
          });
      }
      addBotMessageAndSpeak(targetQuestion.text, undefined, targetQuestion.key);
      return;
    }

    const messageToEdit = messages.findLast(m => m.isAnswer && m.questionKey === key);
    if (messageToEdit) {
      handleEdit(key, messageToEdit.id);
    } else {
      toast({ title: "Cannot jump to question", description: "Please answer the preceding questions first." });
    }
  };

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
        toast({ variant: 'destructive', title: 'Speech Recognition Not Supported', description: 'Your browser does not support speech recognition.' });
        return;
    }

    if (isRecording) {
        stopListening();
    } else {
        setBaseInputValue(inputValue);
        recognitionRef.current.start();
        if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
        inactivityTimeoutRef.current = setTimeout(() => {
          stopListening();
        }, 5000);
    }
  };

  const handleToggleVoice = () => {
    if (isRecording) stopListening();
    if (isTtsEnabled) {
      interruptSpeech();
    }
    setIsTtsEnabled(prev => !prev);
  };


  const handleMultiSelectReply = (option: string) => {
    if (isRecording) stopListening();
    const isNoneOption = option.toLowerCase().includes('nothing') || option.toLowerCase().includes('wala po');
    
    setSelectedReplies(prev => {
      if (isNoneOption) {
        return prev.includes(option) ? [] : [option];
      }
      
      const newReplies = prev.filter(r => !(r.toLowerCase().includes('nothing') || r.toLowerCase().includes('wala po')));

      if (newReplies.includes(option)) {
        return newReplies.filter(r => r !== option);
      } else {
        return [...newReplies, option];
      }
    });
  };

  const handleMultiSelectSubmit = async () => {
    if (isRecording) stopListening();
    if (isSpeaking) interruptSpeech();
    if (isLoading || selectedReplies.length === 0) return;

    setIsQuickReplyOpen(false);

    const combinedAnswer = selectedReplies.join(', ');
    const currentKey = editingState ? editingState.key : currentQuestionKey;
    const question = visibleQuestions.find(q => q.key === currentKey)!;

    if (editingState) {
        setMessages(prev => prev.map(msg => 
            msg.id === editingState.id ? { ...msg, content: combinedAnswer } : msg
        ));
        setAnswers(prev => ({ ...prev, [editingState.key]: combinedAnswer }));
        setEditingState(null);
        setSelectedReplies([]);
        toast({ title: "Answer updated successfully!" });
    } else {
        addUserMessage(combinedAnswer, { questionKey: question.key, isAnswer: true });
        setSelectedReplies([]);
        setIsLoading(true);
        await processNextQuestion(combinedAnswer, question);
        setIsLoading(false);
    }
  };

  const handleBodyPartSubmit = async () => {
    if (isRecording) stopListening();
    if (isSpeaking) interruptSpeech();
    if (isLoading || selectedReplies.length === 0 || !specialFlow) return;

    setIsQuickReplyOpen(false);

    const combinedAnswer = selectedReplies.join(', ');
    addUserMessage(combinedAnswer);
    setIsLoading(true);
    
    if (specialFlow.step === 'location') {
      const finalAnswer = `Stays in: ${combinedAnswer}`;
      setAnswers(prev => ({ ...prev, radiation: finalAnswer }));
      setSpecialFlow(null);
      await advanceToNextQuestion();

    } else if (specialFlow.step === 'start') {
      setRadiationStart(selectedReplies);
      setSpecialFlow({ type: 'radiation', step: 'end' });
      await addBotMessageAndSpeak('Salamat po. Ngayon, saan naman po ito kumakalat?');
      
    } else if (specialFlow.step === 'end') {
      const startLocation = radiationStart.join(', ');
      const finalAnswer = `Starts at ${startLocation} and spreads to ${combinedAnswer}`;
      setAnswers(prev => ({ ...prev, radiation: finalAnswer }));
      setSpecialFlow(null);
      setRadiationStart([]);
      await advanceToNextQuestion();
    }
    
    setSelectedReplies([]);
    setIsLoading(false);
  };

  const formatAnswersForExport = () => {
    return `HPITool Pain Assessment Summary:\n\n${visibleQuestions
      .map(q => {
        const answer = answers[q.key];
        if (!answer || answer === 'N/A') return null;
        return `${q.label}:\n- ${removeEmojis(answer)}`;
      })
      .filter(Boolean)
      .join('\n\n')}`;
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(formatAnswersForExport());
    toast({ title: "Copied to clipboard!", description: "Your assessment summary is ready to be pasted." });
  };

  const handleDownload = () => {
    const text = formatAnswersForExport();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'HPITool-Summary.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Download started!", description: "Check your downloads for the summary file." });
  };

  const restartInterview = () => {
    if (isRecording) stopListening();
    interruptSpeech();
    setMessages([]);
    setAnswers({} as Record<QuestionKey, string>);
    setCurrentQuestionKey(questions[0].key);
    setInputValue('');
    setIsLoading(false);
    setIsComplete(false);
    setEditingState(null);
    setSelectedReplies([]);
    setIsSpeaking(false);
    setSpecialFlow(null);
    setRadiationStart([]);
  };

  const questionForInteractive = editingState ? visibleQuestions.find(q => q.key === editingState.key) : visibleQuestions.find(q => q.key === currentQuestionKey);

  const quickReplyProps = {
    questions: visibleQuestions,
    questionForInteractive,
    answers,
    editingState,
    specialFlow,
    isLoading,
    isComplete,
    isSpeaking,
    isCalendarOpen,
    setIsCalendarOpen,
    selectedReplies,
    autoShowReplies,
    setAutoShowReplies,
    handleQuickReply,
    handleDateSelect,
    handleMultiSelectReply,
    handleMultiSelectSubmit,
    handleBodyPartSubmit,
    handleCopy,
    handleDownload,
  };

  const sheetTitle = isComplete && !editingState
    ? "Assessment Summary"
    : questionForInteractive?.label || "Quick Replies";

  const sheetDescription = isComplete && !editingState
    ? "Here is a summary of your answers."
    : questionForInteractive?.text;


  return (
    <div className="flex flex-col h-dvh bg-card text-card-foreground">
       <header className="flex-shrink-0 border-b flex items-center justify-between w-full px-4 h-16">
          <div className="flex items-center gap-2">
              {!isDesktop && (
                  <Button variant="ghost" size="icon" className="-ml-2" onClick={() => setIsSidebarMinimized(false)}>
                      <Menu className="h-6 w-6" />
                  </Button>
              )}
              <AppIcon className="w-10 h-10 text-primary" />
              <div className="flex items-baseline gap-2">
                  <h1 className="text-xl font-bold text-primary">OnlineHPI</h1>
                  <Badge variant="outline" className="text-xs font-semibold border-primary/50 text-primary">Beta</Badge>
              </div>
          </div>
      </header>
      <div className="flex flex-grow overflow-hidden">
        <Sidebar 
          questions={visibleQuestions}
          answers={answers}
          currentQuestionKey={currentQuestionKey}
          onSectionSelect={handleJumpToQuestion}
          isComplete={isComplete}
          editingState={editingState}
          onRestart={restartInterview}
          isMinimized={isSidebarMinimized}
          setIsMinimized={setIsSidebarMinimized}
          isDesktop={isDesktop}
        />
        <main className="flex flex-col h-full flex-grow border-l">
          <ScrollArea className="flex-grow">
            <div className="p-4 space-y-4">
              {messages.map((msg, idx) => {
                  const isUserAnswer = msg.role === 'user' && msg.isAnswer;
                  const showEditButton = isUserAnswer && !editingState && !isSpeaking;
                  const isBeingEdited = editingState?.id === msg.id;
                  
                  const isBotQuestion = msg.role === 'bot' && visibleQuestions.some(q => q.key === msg.questionKey);
                  const isFirstMessage = idx === 0 && isBotQuestion;
                  const showSeparator = isBotQuestion && !isFirstMessage && (idx > 0 && messages[idx - 1]?.isAnswer);
                  const questionLabelForSeparator = (showSeparator || isFirstMessage) ? visibleQuestions.find(q => q.key === msg.questionKey)?.label : null;
                  
                  return (
                    <Fragment key={msg.id}>
                        {questionLabelForSeparator && (
                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-border/30" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-background px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{questionLabelForSeparator}</span>
                                </div>
                            </div>
                        )}

                        <div className="group relative">
                          <div id={`msg-${msg.id}`} className={cn("flex w-full items-start gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}>
                            {showEditButton && (
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="order-1 mt-1 h-7 w-7 shrink-0 rounded-full bg-background/80 opacity-100 shadow-sm"
                                  onClick={() => handleEdit(msg.questionKey!, msg.id)}
                                  disabled={isLoading}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-muted-foreground"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                                </Button>
                            )}
                            <div className={cn(
                              "flex items-start gap-1",
                              msg.role === 'user' ? "order-2" : "order-1",
                              isBeingEdited ? "w-full" : "max-w-[85%]"
                            )}>
                              {isBeingEdited && msg.role === 'user' && (
                                <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => { setEditingState(null); setInputValue(''); setSelectedReplies([]); }}>
                                    <X className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              )}
                              <div className={cn(
                                "w-full rounded-lg transition-all",
                                isBeingEdited && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                              )}>
                                <ChatBubble role={msg.role}>
                                  <div className="whitespace-pre-wrap">{msg.content}</div>
                                  {msg.role === 'bot' && msg.audioDataUri && (
                                    <div className="mt-2">
                                      <Button variant="outline" size="sm" onClick={() => playAudio(msg.audioDataUri!)} disabled={isSpeaking} className="text-muted-foreground">
                                        <Volume2 className="mr-2 h-4 w-4" />
                                        Repeat Speaking
                                      </Button>
                                    </div>
                                  )}
                                </ChatBubble>
                              </div>
                            </div>
                          </div>
                        </div>
                    </Fragment>
                  );
              })}


              {isLoading && !isComplete && (<ChatBubble role="bot"><Loader2 className="h-5 w-5 animate-spin" /></ChatBubble>)}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
          
          <div className="flex-shrink-0 border-t bg-background">
            {editingState && (
                <div className="p-2 text-center text-sm bg-accent/50 border-b flex justify-center items-center gap-4">
                    <span>Editing answer for: <strong>{visibleQuestions.find(q => q.key === editingState.key)?.label}</strong></span>
                    <Button variant="ghost" size="sm" onClick={() => { setEditingState(null); setInputValue(''); setSelectedReplies([]); }}>Cancel</Button>
                </div>
            )}
            <div className="p-4">
                {isComplete && !editingState ? (
                <div className="w-full flex flex-col gap-2">
                    <Button onClick={() => setIsQuickReplyOpen(true)} className="w-full">
                      Preview Summary
                    </Button>
                </div>
                ) : (
                <>
                    <p className="text-xs text-muted-foreground mb-1 px-1">
                        {editingState ? "Enter your new answer..." : "Isulat ang sagot o pindutin ang speak button para magsalita."}
                    </p>
                    <form onSubmit={handleSendMessage} className="w-full">
                      <div className="flex w-full items-start gap-2">
                        <Textarea
                            ref={textareaRef}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder=""
                            className="max-h-40 resize-none min-h-[42px]"
                            rows={1}
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}}
                            disabled={isLoading || isRecording || !!specialFlow}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim() || isRecording}>
                            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send />}
                        </Button>
                      </div>
                    </form>
                    <div className="mt-2 flex justify-center items-center gap-2">
                        {isTtsAvailable && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button variant="outline" size="icon" onClick={handleToggleVoice}>
                                            {isTtsEnabled ? <Volume2 /> : <VolumeX />}
                                            <span className="sr-only">{isTtsEnabled ? 'Turn Voice Off' : 'Turn Voice On'}</span>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{isTtsEnabled ? 'Turn Voice Off' : 'Turn Voice On'}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleToggleRecording}
                            disabled={!isRecording && (isLoading || !!editingState || !!specialFlow)} 
                            className="w-full max-w-xs"
                        >
                          {isRecording ? <MicOff className="mr-2 text-red-500" /> : <Mic className="mr-2" />}
                          {isRecording ? 'Stop Listening' : 'Speak'}
                        </Button>
                         <Button variant="outline" size="sm" onClick={() => setIsQuickReplyOpen(v => !v)}>
                            <PanelRightOpen />
                            <span className="ml-1">Quick Replies</span>
                        </Button>
                    </div>
                </>
                )}
            </div>
          </div>
        </main>
        
      </div>

      <div>
        <Sheet open={isQuickReplyOpen} onOpenChange={setIsQuickReplyOpen}>
          <SheetContent side="right" className="p-0 flex flex-col w-full max-w-sm" onOpenAutoFocus={(e) => e.preventDefault()}>
            <SheetHeader className="p-4 border-b text-left">
              <SheetTitle className="text-base">{sheetTitle}</SheetTitle>
              {sheetDescription && (
                <SheetDescription className="pt-1">
                    {sheetDescription}
                </SheetDescription>
              )}
            </SheetHeader>
            <div className="flex-grow overflow-hidden">
            <QuickReplyPanel {...quickReplyProps} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
