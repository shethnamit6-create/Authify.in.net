'use client';

import { Shield, ExternalLink, Code2, Terminal, Cpu, Lock, Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DocumentationPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="px-8 h-20 flex items-center justify-between border-b bg-white sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1 rounded-lg">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-primary">Authify Docs</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign Up</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-4">
        {/* Sticky Sidebar Nav */}
        <aside className="hidden md:block border-r p-8 space-y-6 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto">
          <div>
            <h4 className="font-bold text-xs uppercase text-muted-foreground mb-4">Getting Started</h4>
            <ul className="space-y-3 text-sm">
              <li className="font-medium text-primary cursor-pointer">Introduction</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer">Quickstart</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer">Architecture</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase text-muted-foreground mb-4">Core APIs</h4>
            <ul className="space-y-3 text-sm">
              <li className="text-muted-foreground hover:text-primary cursor-pointer">/auth/start</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer">/auth/verify</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer">/session/manage</li>
            </ul>
          </div>
          <div>
             <h4 className="font-bold text-xs uppercase text-muted-foreground mb-4">SDKS</h4>
            <ul className="space-y-3 text-sm">
              <li className="text-muted-foreground hover:text-primary cursor-pointer">React / Next.js</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer">Node.js</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer">iOS / Swift</li>
              <li className="text-muted-foreground hover:text-primary cursor-pointer">Android / Kotlin</li>
            </ul>
          </div>
        </aside>

        {/* Content Area */}
        <div className="md:col-span-3 p-8 md:p-12 space-y-16 animate-fade-in">
          <section className="max-w-3xl space-y-6">
            <h1 className="text-4xl font-extrabold text-primary tracking-tight">Enterprise Identity Infrastructure</h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Authify provides the building blocks for phishing-resistant authentication. Built on FIDO2 WebAuthn standards, our API enables device-bound cryptographic security for any application.
            </p>
            <div className="flex gap-4">
              <Link href="/register">
                <Button size="lg" className="rounded-xl">Get API Key</Button>
              </Link>
              <Link href="/developers#sdks">
                <Button size="lg" variant="outline" className="rounded-xl">Explore SDKs</Button>
              </Link>
            </div>
          </section>

          <section id="quickstart" className="space-y-8">
            <h2 className="text-2xl font-bold text-primary">Quickstart Guidance</h2>
            <Card className="border-none shadow-sm bg-accent/10">
              <CardContent className="p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">1</div>
                  <div className="space-y-2">
                    <h3 className="font-bold">Install the SDK</h3>
                    <p className="text-sm text-muted-foreground">Add Authify to your project using your preferred package manager.</p>
                    <div className="bg-[#1a1a1a] rounded-xl p-4 font-mono text-xs text-blue-300">
                      <code>npm install @authify/react</code>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm">2</div>
                  <div className="space-y-2">
                    <h3 className="font-bold">Initialize Client</h3>
                    <p className="text-sm text-muted-foreground">Configure the provider with your application ID.</p>
                    <div className="bg-[#1a1a1a] rounded-xl p-4 font-mono text-xs text-green-300">
                      <code>{`<AuthifyProvider appId="your_app_id">...</AuthifyProvider>`}</code>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section id="architecture" className="space-y-8">
            <div className="flex items-center gap-3">
              <Cpu className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-primary">Modern Architecture</h2>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Authify leverages **Passkeys** and **WebAuthn** to eliminate shared secrets. Private keys never leave the secure hardware enclave of the user's device.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Device-Bound", desc: "Private keys are locked to the physical hardware.", icon: <Lock className="w-4 h-4" /> },
                { title: "Phishing-Proof", desc: "Origin-bound signatures prevent credential replay.", icon: <Shield className="w-4 h-4" /> },
                { title: "Biometric Verified", desc: "Local-only biometric unlock via Secure Enclave.", icon: <Cpu className="w-4 h-4" /> }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl border bg-white space-y-3">
                  <div className="text-primary">{item.icon}</div>
                  <h4 className="font-bold text-sm">{item.title}</h4>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="api-flow" className="space-y-8">
            <h2 className="text-2xl font-bold text-primary">The Authentication Flow</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-none shadow-sm bg-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Terminal className="w-4 h-4" />
                    1. Start Challenge
                  </CardTitle>
                  <CardDescription>Request a cryptographic challenge for the user's device.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-[#1a1a1a] rounded-xl p-4 font-mono text-xs text-blue-300 overflow-x-auto">
                    <code>{`POST /api/v1/auth/start\n{\n  "username": "alice",\n  "app_id": "authify_live_123"\n}`}</code>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    2. Verify Response
                  </CardTitle>
                  <CardDescription>Send the signed cryptographic response back to us.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="bg-[#1a1a1a] rounded-xl p-4 font-mono text-xs text-green-300 overflow-x-auto">
                    <code>{`POST /api/v1/auth/verify\n{\n  "id": "credential_id_abc",\n  "signature": "base64_sig..."\n}`}</code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white py-12 px-8 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground">© 2026 Authify. Technical Documentation.</p>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <Link href="/developers" className="hover:text-primary">Platform</Link>
            <Link href="/login" className="hover:text-primary">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}