'use client';

import { Fragment } from 'react';
import { cn } from '@/lib/utils';
import type { Question, QuestionKey } from '@/lib/questions';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Calendar,
  TrendingDown,
  TrendingUp,
  Sparkles,
  MoveRight,
  Gauge,
  Clock,
  Circle,
  Pencil,
  RefreshCw,
  Beer,
  Cigarette,
  Users,
  Cloudy,
  Heart,
} from 'lucide-react';

interface SidebarProps {
  questions: Question[];
  answers: Record<string, string>;
  currentQuestionKey: QuestionKey;
  onSectionSelect: (key: QuestionKey) => void;
  isComplete: boolean;
  editingState: { key: QuestionKey; id: string | number } | null;
  onRestart: () => void;
  isMinimized: boolean;
  setIsMinimized: (isMinimized: boolean) => void;
  isDesktop: boolean;
}

const questionIcons: Record<string, React.ElementType> = {
  chiefComplaint: ClipboardList,
  onset: Calendar,
  provocationWorsens: TrendingDown,
  provocationImproves: TrendingUp,
  quality: Sparkles,
  radiation: MoveRight,
  severity: Gauge,
  timing: Clock,
  alcoholIntake: Beer,
  smokingHistory: Cigarette,
  familyHistory: Users,
  secondhandSmoke: Cloudy,
  sexualHistory: Heart,
};

const questionIconColors: Record<string, string> = {
  chiefComplaint: 'text-sky-500',
  onset: 'text-amber-500',
  provocationWorsens: 'text-red-500',
  provocationImproves: 'text-green-500',
  quality: 'text-purple-500',
  radiation: 'text-orange-500',
  severity: 'text-rose-500',
  timing: 'text-indigo-500',
  alcoholIntake: 'text-yellow-600',
  smokingHistory: 'text-slate-500',
  familyHistory: 'text-cyan-500',
  secondhandSmoke: 'text-gray-500',
  sexualHistory: 'text-pink-500',
};

export function Sidebar({ questions, answers, currentQuestionKey, onSectionSelect, isComplete, editingState, onRestart, isMinimized, setIsMinimized, isDesktop }: SidebarProps) {
  const firstUnansweredIndex = isComplete ? -1 : questions.findIndex(q => !answers[q.key]);

  return (
    <>
      {!isDesktop && !isMinimized && (
        <div 
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setIsMinimized(true)}
        />
      )}
      <TooltipProvider delayDuration={0}>
        <nav
          className={cn(
            'h-full bg-background flex flex-col transition-all duration-300 ease-in-out',
            // Desktop: Relative positioning, retains flexbox behavior
            isDesktop && 'relative',
            isDesktop && (isMinimized ? 'w-16' : 'w-64'),
            // Mobile: Fixed overlay, slides in/out
            !isDesktop && 'fixed inset-y-0 left-0 z-50 w-64',
            !isDesktop && (isMinimized ? '-translate-x-full' : 'translate-x-0')
          )}
        >
          <div className="p-2 border-b">
            <Button variant="outline" className="w-full" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <ChevronRight /> : <ChevronLeft className="mr-2"/>}
              {!isMinimized && 'Collapse'}
            </Button>
          </div>
          <div className="flex-grow p-2 space-y-1 overflow-y-auto">
            {questions.map((q, index) => {
              const Icon = questionIcons[q.key] || Circle;
              const colorClass = questionIconColors[q.key] || 'text-muted-foreground';
              const isAnswered = !!answers[q.key];
              const isCurrent = q.key === currentQuestionKey && !isComplete;
              const isBeingEdited = editingState?.key === q.key;
              const isDisabled = !isComplete && firstUnansweredIndex !== -1 && index > firstUnansweredIndex;


              const content = (
                <Button
                  key={q.key}
                  variant={isBeingEdited ? 'default' : isCurrent ? 'secondary' : 'ghost'}
                  className={cn(
                      'w-full flex items-center gap-3 text-sm h-10', 
                      isMinimized ? 'justify-center' : 'justify-start px-3'
                  )}
                  onClick={() => onSectionSelect(q.key)}
                  disabled={isDisabled}
                >
                  <Icon className={cn('h-5 w-5 shrink-0', colorClass)} />
                  {!isMinimized && <span className="truncate flex-grow text-left">{q.label}</span>}
                  {!isMinimized && isAnswered && !isCurrent && !isBeingEdited && <Pencil className="h-4 w-4 text-muted-foreground shrink-0" />}
                  {!isMinimized && isCurrent && <Pencil className="h-4 w-4 text-primary shrink-0 animate-pulse" />}
                  {!isMinimized && isBeingEdited && <Pencil className="h-4 w-4 text-primary-foreground shrink-0 animate-pulse" />}
                </Button>
              );

              if (isMinimized) {
                return (
                  <Tooltip key={q.key}>
                    <TooltipTrigger asChild>{content}</TooltipTrigger>
                    <TooltipContent side="right" className="flex flex-col items-start">
                      <p>{q.label}</p>
                      {isBeingEdited && <p className="text-xs text-primary font-semibold">Editing...</p>}
                      {isAnswered && !isComplete && !isBeingEdited && <p className="text-xs text-muted-foreground">Click to edit</p>}
                      {isComplete && <p className="text-xs text-muted-foreground">Click to edit</p>}
                      {isCurrent && !isBeingEdited && <p className="text-xs text-primary font-semibold">Current Question</p>}
                      {isDisabled && <p className="text-xs text-muted-foreground">Answer previous questions</p>}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              return content;
            })}
          </div>
          <div className="mt-auto p-2 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                 <Button
                  variant="ghost"
                  className={cn(
                    'w-full flex items-center gap-3 text-sm h-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10',
                    isMinimized ? 'justify-center' : 'justify-start px-3'
                  )}
                >
                  <Tooltip>
                      <TooltipTrigger asChild>
                          <RefreshCw className="h-5 w-5 shrink-0" />
                      </TooltipTrigger>
                      {isMinimized && <TooltipContent side="right"><p>Umulit (Start Again)</p></TooltipContent>}
                  </Tooltip>
                  {!isMinimized && <span className="truncate">Umulit (Start Again)</span>}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will restart the interview and clear all your answers. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onRestart} className={cn(buttonVariants({ variant: 'destructive' }))}>
                    Start Over
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </nav>
      </TooltipProvider>
    </>
  );
}
