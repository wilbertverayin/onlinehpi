'use client';

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ReactNode } from "react";
import { User } from "lucide-react";
import { AppIcon } from "./app-icon";

interface ChatBubbleProps {
  role: 'user' | 'bot';
  children: ReactNode;
}

export function ChatBubble({ role, children }: ChatBubbleProps) {
  const isUser = role === 'user';
  return (
    <div className={cn("flex items-start gap-3 w-full", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="w-8 h-8 border bg-background shrink-0 flex items-center justify-center">
           <AppIcon className="w-5 h-5 text-primary" />
        </Avatar>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-lg p-3 text-sm shadow-sm animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-300",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        {children}
      </div>
      {isUser && (
        <Avatar className="w-8 h-8 border bg-background shrink-0">
          <AvatarFallback>
            <User className="w-5 h-5 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
