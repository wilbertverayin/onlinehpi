'use client';

import { useState } from 'react';
import ChatInterface from '@/components/chat-interface';
import { AppIcon } from '@/components/app-icon';
import { Button } from '@/components/ui/button';

export default function ConsentGate() {
  const [accepted, setAccepted] = useState(false);

  if (accepted) return <ChatInterface />;

  return (
    <div className="flex h-dvh items-center justify-center p-4">
      <section aria-labelledby="privacy-title" className="w-full max-w-md space-y-4">
        <AppIcon className="h-12 w-12 text-primary" />
        <h1 id="privacy-title" className="text-2xl font-bold text-primary">Before you start</h1>
        <ul className="list-disc space-y-2 pl-5 text-sm">
          <li>OnlineHPI asks about your symptoms to prepare a summary for your clinic visit. It does not give a diagnosis or medical advice.</li>
          <li>Nothing is stored. Your answers stay on this device and are lost when you close or refresh the page.</li>
          <li>If you use the Speak button, your browser's speech service may process your voice.</li>
          <li>In an emergency, go to the nearest emergency room instead of using this tool.</li>
        </ul>
        <Button autoFocus onClick={() => setAccepted(true)} className="w-full">
          I understand, continue
        </Button>
      </section>
    </div>
  );
}
