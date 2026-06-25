import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeEmojis(text: string): string {
    if (!text) return '';
    // Use Unicode property escapes to match emojis. This requires ES2018/ES2020 features.
    return text.replace(/(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu, '').trim();
}
