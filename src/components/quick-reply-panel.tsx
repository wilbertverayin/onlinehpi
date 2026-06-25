'use client';

import { useState, useEffect, type Dispatch, SetStateAction, useRef } from 'react';
import type { Question, QuestionKey } from '@/lib/questions';
import { bodyParts } from '@/lib/questions';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Check, CalendarIcon, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn, removeEmojis } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const painScaleDescriptions: { [key: number]: { title: string; description: string } } = {
  1: { title: 'Very mild', description: 'Almost unnoticeable, like a slight discomfort' },
  2: { title: 'Mild pain', description: 'You notice it, but it doesn’t interfere with daily activities' },
  3: { title: 'Nagging pain', description: 'Slightly distracting, but manageable' },
  4: { title: 'Uncomfortable', description: 'Starting to affect focus or mood' },
  5: { title: 'Moderate pain', description: 'Hard to ignore; may interfere with normal tasks' },
  6: { title: 'Distressing pain', description: 'Clearly affecting function, concentration, or rest' },
  7: { title: 'Severe pain', description: 'Limits physical activity and requires effort to cope' },
  8: { title: 'Intense pain', description: 'Very hard to function; may cause crying or restlessness' },
  9: { title: 'Excruciating pain', description: 'Nearly unbearable, urgent need for relief' },
  10: { title: 'Worst pain imaginable', description: 'Pinakamatinding sakit na naranasan mo (e.g., labor, broken bone, major injury)' },
};

const getPainScaleColorClass = (level: number) => {
    if (level <= 3) return 'bg-green-100 text-green-800 hover:bg-green-200 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900 dark:border-green-800';
    if (level <= 6) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-900 dark:border-yellow-800';
    return 'bg-red-100 text-red-800 hover:bg-red-200 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900 dark:border-red-800';
};

interface QuickReplyPanelProps {
    questions: Question[];
    questionForInteractive: Question | undefined;
    answers: Record<string, string>;
    editingState: { key: QuestionKey; id: string | number } | null;
    specialFlow: { type: 'radiation'; step: 'location' | 'start' | 'end'; } | null;
    isLoading: boolean;
    isComplete: boolean;
    isSpeaking: boolean;
    isCalendarOpen: boolean;
    setIsCalendarOpen: Dispatch<SetStateAction<boolean>>;
    selectedReplies: string[];
    autoShowReplies: boolean;
    setAutoShowReplies: Dispatch<SetStateAction<boolean>>;
    handleQuickReply: (reply: string) => void;
    handleDateSelect: (date: Date | undefined) => void;
    handleMultiSelectReply: (option: string) => void;
    handleMultiSelectSubmit: () => void;
    handleBodyPartSubmit: () => void;
    handleCopy: () => void;
    handleDownload: () => void;
}

export function QuickReplyPanel({
    questions,
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
}: QuickReplyPanelProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const prevStepRef = useRef<string | undefined>();

    // Reset body part category when the flow step changes or ends
    useEffect(() => {
        const currentStep = specialFlow?.step;
        if (
            !specialFlow ||
            specialFlow.type !== 'radiation' ||
            currentStep !== prevStepRef.current
        ) {
            setSelectedCategory(null);
        }
        prevStepRef.current = currentStep;
    }, [specialFlow]);

    const AutoShowSwitch = () => (
        <div className="mt-auto border-t p-4 flex-shrink-0">
           <div className="flex items-center justify-between">
               <Label htmlFor="auto-show-replies" className="font-medium text-sm">
                   Auto-show on new question
               </Label>
               <Switch
                   id="auto-show-replies"
                   checked={autoShowReplies}
                   onCheckedChange={setAutoShowReplies}
               />
           </div>
        </div>
    );

    if (isComplete && !editingState) {
        return (
            <div className="flex flex-col h-full">
                <ScrollArea className="flex-grow">
                    <div className="p-4 space-y-4 text-sm">
                        {questions.map((q) => {
                            const answer = answers[q.key];
                            if (!answer || answer === 'N/A') return null;
                            return (
                                <div key={q.key}>
                                    <p className="font-medium text-foreground">{q.label}</p>
                                    <p className="text-muted-foreground pl-2">- {removeEmojis(answer)}</p>
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
                <div className="mt-auto border-t p-4 flex-shrink-0 flex flex-col gap-2">
                    <Button onClick={handleCopy} className="w-full">Copy Summary</Button>
                    <Button onClick={handleDownload} className="w-full">Download Summary</Button>
                </div>
            </div>
        );
    }

    const showInteractive = !isLoading && (!isComplete || !!editingState) && !specialFlow && !!questionForInteractive?.interactive;
    const showBodyPartSelector = !isLoading && specialFlow?.type === 'radiation';

    const panelContent = () => {
        if (!showInteractive && !showBodyPartSelector) {
            return (
                <div className="p-4 flex-grow flex flex-col justify-center items-center text-center">
                     <div className="text-sm text-muted-foreground">
                        <p className="font-semibold">Quick Replies</p>
                        <p>Options will appear here when available.</p>
                     </div>
                </div>
            );
        }

        if (showBodyPartSelector) {
            return (
                <div className="p-4 flex flex-col h-full space-y-4">
                    {selectedCategory ? (
                        <>
                            <div className="flex items-center relative justify-center">
                                <Button variant="ghost" size="sm" onClick={() => setSelectedCategory(null)} className="absolute left-0 pl-0">
                                    <ChevronLeft className="mr-1 h-4 w-4"/> Back
                                </Button>
                                <p className="font-medium text-sm text-center">{selectedCategory}</p>
                            </div>
                            <ScrollArea className="flex-grow">
                                <div className="grid grid-cols-2 gap-2 pr-2">
                                     {(bodyParts[selectedCategory as keyof typeof bodyParts] || []).map((part) => (
                                        <Button
                                            key={part}
                                            variant={selectedReplies.includes(part) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleMultiSelectReply(part)}
                                            disabled={isLoading}
                                            className="h-auto py-2 whitespace-normal justify-start text-left"
                                        >
                                            <div className="flex items-start">
                                                <Check className={`mr-2 h-4 w-4 mt-1 shrink-0 ${selectedReplies.includes(part) ? 'opacity-100' : 'opacity-0'}`} />
                                                <span>{part}</span>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </>
                    ) : (
                        <>
                            <p className="font-medium text-sm text-center">Select Body Category</p>
                            <ScrollArea className="flex-grow">
                                <div className="grid grid-cols-1 gap-2 pr-2">
                                    {Object.keys(bodyParts).map((category) => (
                                        <Button 
                                            key={category} 
                                            variant="outline"
                                            className="w-full justify-between"
                                            onClick={() => setSelectedCategory(category)}
                                            disabled={isLoading}
                                        >
                                            {category}
                                            <ChevronRight className="h-4 w-4"/>
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </>
                    )}
                    
                    <Button
                        onClick={handleBodyPartSubmit}
                        disabled={selectedReplies.length === 0 || isLoading}
                        className="w-full flex-shrink-0"
                    >
                        Confirm Selection
                    </Button>
                    <AutoShowSwitch />
                </div>
            );
        }

        if (showInteractive) {
            const { type, options } = questionForInteractive!.interactive!;
            const currentAnswer = editingState ? answers[editingState.key] : undefined;
            return (
                <div className="p-4 flex flex-col h-full space-y-4">
                     {type === 'scale' && (
                        <ScrollArea className="flex-grow">
                            <div className="space-y-2 pr-2">
                                {options?.map(option => {
                                    const scaleLevel = parseInt(option, 10);
                                    const isSelected = editingState && currentAnswer === option;
                                    const description = painScaleDescriptions[scaleLevel];
    
                                    return (
                                        <button
                                            key={option}
                                            onClick={() => handleQuickReply(option)}
                                            disabled={isLoading}
                                            className={cn(
                                                "w-full flex items-center gap-3 p-2 rounded-md border text-left transition-colors disabled:opacity-50",
                                                isSelected
                                                    ? 'bg-primary text-primary-foreground border-primary-foreground/50'
                                                    : getPainScaleColorClass(scaleLevel)
                                            )}
                                        >
                                            <div className={cn(
                                                "h-8 w-8 flex-shrink-0 flex items-center justify-center rounded-md font-bold text-sm",
                                                isSelected ? 'bg-primary-foreground text-primary' : 'bg-white/80 dark:bg-black/20 text-inherit'
                                            )}>
                                                {option}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="font-semibold">{description.title}</div>
                                                <div className="text-xs opacity-90">{description.description}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </ScrollArea>
                     )}
    
                     {type === 'multi-select' && (
                         <>
                            <ScrollArea className="flex-grow">
                                <div className="grid grid-cols-1 gap-2 pr-2">
                                    {options?.map((option) => (
                                        <Button
                                            key={option}
                                            variant={selectedReplies.includes(option) ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handleMultiSelectReply(option)}
                                            disabled={isLoading}
                                            className="h-auto py-2 whitespace-normal justify-start text-left"
                                        >
                                            <div className="flex items-start gap-2">
                                              <Check className={`h-4 w-4 mt-1 shrink-0 ${selectedReplies.includes(option) ? 'opacity-100' : 'opacity-0'}`} />
                                              <span className="flex-grow">{option}</span>
                                            </div>
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                            <Button
                                onClick={handleMultiSelectSubmit}
                                disabled={selectedReplies.length === 0 || isLoading}
                                className="mt-3 w-full flex-shrink-0"
                            >
                                Continue
                            </Button>
                         </>
                     )}
    
                     {(type === 'buttons' || type === 'calendar_and_buttons') && (
                        <ScrollArea className="flex-grow">
                            <div className="grid grid-cols-1 gap-2 pr-2">
                                {type === 'calendar_and_buttons' && (
                                    <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", currentAnswer?.startsWith('It started on') && 'bg-secondary')}>
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {currentAnswer?.startsWith('It started on') ? currentAnswer.substring(13) : 'Pick a date'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar mode="single" onSelect={handleDateSelect} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} initialFocus />
                                        </PopoverContent>
                                    </Popover>
                                )}
                                {options?.map((option) => {
                                    const isSelected = editingState && currentAnswer === option;
                                    return (
                                        <Button
                                            key={option}
                                            variant={isSelected ? "default" : "outline"}
                                            size={"sm"}
                                            onClick={() => handleQuickReply(option)}
                                            disabled={isLoading}
                                            className='h-auto min-h-[36px] whitespace-normal justify-start text-left'
                                        >
                                            {option}
                                        </Button>
                                    )
                                })}
                            </div>
                        </ScrollArea>
                     )}
                    <AutoShowSwitch />
                </div>
            )
        }
        return null;
    }


    return (
        <div className="bg-background flex flex-col h-full">
            {panelContent()}
        </div>
    );
}
