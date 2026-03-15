
'use client';

import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8 animate-fade-in">
        <div className="flex justify-center">
          <div className="bg-primary/5 p-6 rounded-[2.5rem] border border-primary/10 relative">
            <ShieldAlert className="w-16 h-16 text-primary" />
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
              ERROR 404
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Resource Not Found</h1>
          <p className="text-muted-foreground leading-relaxed">
            The cryptographic identity route you are looking for does not exist or has been moved within our secure infrastructure.
          </p>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Link href="/dashboard">
            <Button className="w-full h-12 rounded-xl text-lg shadow-lg">
              Return to Console
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full h-12 rounded-xl text-muted-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <p className="text-xs text-muted-foreground opacity-50">
          Trace ID: {Math.random().toString(36).substring(7).toUpperCase()}
        </p>
      </div>
    </div>
  );
}
