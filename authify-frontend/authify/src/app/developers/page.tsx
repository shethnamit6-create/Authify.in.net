'use client';

import { Shield, Code2, Cpu, Globe, ArrowRight, CheckCircle2, Terminal, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Reveal } from "@/components/ui/reveal"
import { cn } from "@/lib/utils"

export default function DevelopersLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="px-8 h-20 flex items-center justify-between border-b bg-white sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">Authify</span>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">Platform</Link>
          <Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link>
          <Link href="#sdks" className="hover:text-primary transition-colors">SDKs</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 px-8 bg-accent/5">
          <div className="max-w-5xl mx-auto space-y-8 text-center">
            <Reveal>
              <Badge variant="outline" className="px-4 py-1 text-xs font-semibold border-primary/20 text-primary bg-primary/5 rounded-full mb-6">
                For Engineers, By Engineers
              </Badge>
              <h1 className="text-5xl md:text-6xl font-extrabold text-primary tracking-tight leading-tight">
                Authentication Infrastructure Built for Scale.
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed pt-4">
                Deploy phishing-resistant, device-bound authentication in minutes. Lightweight SDKs, robust APIs, and zero biometric storage architecture.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                <Link href="/docs">
                  <Button size="lg" className="h-14 px-10 text-lg rounded-xl">Read Documentation</Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="h-14 px-10 text-lg rounded-xl">Get API Key</Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
             {[
               { icon: <Terminal className="w-8 h-8" />, title: "RESTful APIs", desc: "Clean, consistent endpoints for session management and credential verification." },
               { icon: <Zap className="w-8 h-8" />, title: "Real-time Verification", desc: "Low-latency cryptographic signatures verified at the edge." },
               { icon: <Globe className="w-8 h-8" />, title: "Cross-Platform", desc: "Native support for WebAuthn/FIDO2 across Web, iOS, and Android." }
             ].map((item, i) => (
               <Reveal key={i} delay={i * 100} className="space-y-4">
                 <div className="text-primary">{item.icon}</div>
                 <h3 className="text-xl font-bold text-primary">{item.title}</h3>
                 <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
               </Reveal>
             ))}
          </div>
        </section>

        <section id="sdks" className="py-24 px-8 border-y bg-accent/10">
          <div className="max-w-7xl mx-auto space-y-12">
            <Reveal className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-primary">Native SDK Support</h2>
              <p className="text-muted-foreground">Drop-in security for every stack.</p>
            </Reveal>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {['Node.js', 'React / Next.js', 'iOS Swift', 'Android Kotlin', 'Go', 'Python', 'Flutter', 'Ruby'].map((sdk, i) => (
                <div key={sdk} className="flex items-center justify-between p-6 rounded-2xl border bg-white hover:border-primary transition-all cursor-pointer group shadow-sm hover:shadow-md">
                  <span className="font-bold text-sm text-primary">{sdk}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-12 px-8 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">© 2026 Authify. Developer Platform.</p>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/docs" className="hover:text-primary">Docs</Link>
            <Link href="/login" className="hover:text-primary">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant?: any, className?: string }) {
  return <div className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variant === 'outline' ? 'border' : 'bg-primary text-white', className)}>{children}</div>
}