'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Shield, 
  ShieldCheck, 
  Fingerprint, 
  Cpu, 
  FileText, 
  ShieldAlert, 
  Key, 
  Smartphone, 
  Zap, 
  History, 
  Code2, 
  MonitorSmartphone,
  CheckCircle2,
  Settings,
  Lock,
  ArrowUpRight,
  ChevronRight,
  Globe,
  Database,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/ui/reveal';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function Home() {
  const [isScrolled, setIsScrolled] = useState(false);
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-security');
  const [heroSrc, setHeroSrc] = useState<string>(
    '/Authify%20display%20img.png'
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pricingPlans = [
    {
      name: "Starter",
      price: "$29",
      description: "For developers exploring passwordless authentication",
      features: [
        "10,000 authentication requests per month",
        "Device-bound authentication",
        "On-device biometric unlock (biometric data never leaves the user’s device)",
        "Basic audit logs (30-day retention)",
        "Single API key",
        "Email support",
        "Full developer documentation"
      ],
      footer: "Ideal for indie developers and early-stage SaaS platforms.",
      popular: false
    },
    {
      name: "Growth",
      price: "$99",
      description: "For scaling applications requiring stronger identity controls",
      features: [
        "100,000 authentication requests per month",
        "Risk-Based Authentication Policies",
        "Session Management Controls",
        "Authentication Analytics",
        "Cross-device verification",
        "Advanced audit logs with export",
        "Multiple API Keys and Rate Limiting",
        "Webhook integrations"
      ],
      footer: "Ideal for growing SaaS and fintech platforms.",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For organizations with advanced security requirements",
      features: [
        "Unlimited authentication requests per month",
        "Hardware Security Module (HSM) Support",
        "Advanced Policy Engine",
        "Multi-Region Deployment Support",
        "Key Lifecycle Management",
        "Enterprise security controls",
        "Compliance-ready logging",
        "Custom SLA"
      ],
      footer: "Designed for banks, healthcare platforms, and large-scale applications.",
      popular: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfcfc]">
      <header className={cn(
        "px-6 h-20 flex items-center justify-between sticky top-0 z-50 transition-all duration-300 border-b",
        isScrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm border-border/50" 
          : "bg-white border-transparent"
      )}>
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary">Authify</span>
        </Link>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
          <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
          <Link href="/developers" className="hover:text-primary transition-colors">Developers</Link>
          <Link href="#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          <Link href="#security" className="hover:text-primary transition-colors">Security</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/admin-login">
            <Button variant="ghost">Admin Portal</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-primary hover:bg-primary/90 px-6">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="animate-fade-in">
                <Badge variant="outline" className="px-3 py-1 text-xs font-semibold border-primary/20 text-primary bg-primary/5 rounded-full">
                  Built on Proven Cryptographic Standards
                </Badge>
              </div>
              <h1 className="animate-fade-in [animation-delay:100ms] text-5xl md:text-6xl font-extrabold text-primary leading-[1.1] tracking-tight">
                Passwordless Authentication Built for a Phishing-Resistant Future.
              </h1>
              <div className="space-y-4">
                <p className="animate-fade-in [animation-delay:200ms] text-xl text-muted-foreground max-w-xl leading-relaxed">
                  Authify enables organizations to authenticate users using device-bound cryptographic credentials — without passwords and without storing biometric data.
                </p>
                <p className="animate-fade-in [animation-delay:250ms] text-sm text-muted-foreground/70 font-medium tracking-tight">
                  Enterprise Authentication — Without Password Risk.
                </p>
              </div>
              <div className="animate-fade-in [animation-delay:300ms] flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-xl shadow-lg w-full sm:w-auto">Start Building Passwordless Today</Button>
                </Link>
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-xl">Book a Demo</Button>
              </div>
              
              <div className="animate-fade-in [animation-delay:400ms] pt-8 border-t border-border/60">
                <div className="flex flex-wrap gap-x-8 gap-y-4 text-sm font-medium text-primary/80">
                  <span className="flex items-center gap-2">Zero Passwords</span>
                  <span className="opacity-30">•</span>
                  <span className="flex items-center gap-2">Zero Shared Secrets</span>
                  <span className="opacity-30">•</span>
                  <span className="flex items-center gap-2">Zero Biometric Storage</span>
                </div>
              </div>
            </div>
            
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border bg-white animate-fade-in [animation-delay:500ms]">
              <Image 
                src={heroSrc}
                alt="Cryptographic Infrastructure"
                fill
                className="object-cover opacity-90"
                data-ai-hint="password"
                onError={() => setHeroSrc('/hero-security-v2.svg')}
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent pointer-events-none" />
            </div>
          </div>
        </section>

        {/* Trusted By Section */}
        <section className="py-16 border-y bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <Reveal>
              <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-12">
                ENGINEERED FOR MODERN ENGINEERING TEAMS
              </p>
              <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-10 md:gap-x-24">
                {['TechCorp', 'FinSecure', 'CloudNova', 'ByteForge', 'Nexa Systems'].map((logo) => (
                  <span 
                    key={logo} 
                    className="text-xl md:text-2xl font-extrabold tracking-tighter text-slate-900 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 cursor-default"
                  >
                    {logo}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Platform Pillars */}
        <section id="platform" className="py-24 bg-white border-b">
          <div className="max-w-7xl mx-auto px-6">
            <Reveal className="text-center space-y-4 mb-20">
              <h2 className="text-4xl font-bold text-primary tracking-tight">Engineered for Trust</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Authify combines modern cryptographic security with developer simplicity to deliver a resilient identity infrastructure.
              </p>
            </Reveal>
            
            <div className="grid md:grid-cols-3 gap-12">
              <Reveal delay={100} className="space-y-8">
                <div className="p-3 rounded-xl bg-accent w-fit">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4">Secure Authentication</h3>
                  <ul className="space-y-4">
                    {[
                      { title: "Cryptographic Credentials", desc: "Hardware-backed keys stored in secure enclaves." },
                      { title: "Device-Bound Identity", desc: "Ensure credentials cannot be exported or shared." },
                      { title: "Phishing-Resistant Origin", desc: "Verify application identity at the cryptographic level." },
                      { title: "Adaptive Verification", desc: "Dynamic risk-based verification tailored to user context." }
                    ].map((item, i) => (
                      <li key={i} className="group">
                        <p className="font-bold text-primary group-hover:text-secondary transition-colors">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={200} className="space-y-8">
                <div className="p-3 rounded-xl bg-accent w-fit">
                  <Cpu className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4">Developer Platform</h3>
                  <ul className="space-y-4">
                    {[
                      { title: "Simple APIs", desc: "RESTful endpoints designed for rapid, secure deployment." },
                      { title: "Fast Integration", desc: "Lightweight SDKs for web, mobile, and backend services." },
                      { title: "Cross-Device Trust", desc: "Seamless authentication across platforms using FIDO standards." }
                    ].map((item, i) => (
                      <li key={i} className="group">
                        <p className="font-bold text-primary group-hover:text-secondary transition-colors">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>

              <Reveal delay={300} className="space-y-8">
                <div className="p-3 rounded-xl bg-accent w-fit">
                  <FileText className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-4">Enterprise Security & Compliance</h3>
                  <ul className="space-y-4">
                    {[
                      { title: "Tamper-Evident Logs", desc: "Cryptographically signed audit trails for total transparency." },
                      { title: "Compliance Ready", desc: "Automated reporting for SOC2, GDPR, and HIPAA frameworks." },
                      { title: "Security Monitoring", desc: "Real-time analytics on risk signals and success rates." }
                    ].map((item, i) => (
                      <li key={i} className="group">
                        <p className="font-bold text-primary group-hover:text-secondary transition-colors">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Core Features Section */}
        <section id="features" className="py-24 bg-[#fcfcfc]">
          <div className="max-w-7xl mx-auto px-6">
            <Reveal className="text-center space-y-4 mb-16">
              <h2 className="text-4xl font-bold text-primary tracking-tight">Core Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Comprehensive identity security architecture built for modern enterprise requirements.
              </p>
            </Reveal>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  icon: <Key className="w-6 h-6" />, 
                  title: "Passwordless Authentication", 
                  desc: "Enable secure login without passwords by verifying possession of cryptographic credentials instead of shared secrets." 
                },
                { 
                  icon: <Smartphone className="w-6 h-6" />, 
                  title: "Device-Bound Credentials", 
                  desc: "Authenticate users through private keys securely generated and stored within trusted user devices." 
                },
                { 
                  icon: <ShieldCheck className="w-6 h-6" />, 
                  title: "Phishing-Resistant Security", 
                  desc: "Bind authentication to application origins to prevent credential replay on fraudulent websites." 
                },
                { 
                  icon: <Fingerprint className="w-6 h-6" />, 
                  title: "Zero Biometric Storage", 
                  desc: "Biometric data never leaves the user’s device — verification happens locally to preserve privacy." 
                },
                { 
                  icon: <Zap className="w-6 h-6" />, 
                  title: "Adaptive Authentication", 
                  desc: "Dynamically require stronger verification when elevated risk signals or unfamiliar devices are detected." 
                },
                { 
                  icon: <History className="w-6 h-6" />, 
                  title: "Tamper-Evident Audit Logs", 
                  desc: "Maintain cryptographically linked logs that help detect unauthorized modifications and support compliance." 
                },
                { 
                  icon: <Code2 className="w-6 h-6" />, 
                  title: "Developer-Friendly APIs", 
                  desc: "Integrate modern authentication into applications quickly using standards-based APIs." 
                },
                { 
                  icon: <MonitorSmartphone className="w-6 h-6" />, 
                  title: "Cross-Device Authentication", 
                  desc: "Allow users to securely approve sign-ins from new devices using a previously trusted device." 
                }
              ].map((feature, i) => (
                <Reveal key={i} delay={i * 50}>
                  <div className="bg-white p-8 rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 group h-full">
                    <div className="mb-6 p-3 rounded-lg bg-accent text-primary w-fit group-hover:bg-primary group-hover:text-white transition-colors">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-bold text-primary mb-3">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* How Authify Works Section */}
        <section className="py-24 bg-white border-y">
          <div className="max-w-7xl mx-auto px-6">
            <Reveal className="text-center space-y-4 mb-20">
              <h2 className="text-4xl font-bold text-primary tracking-tight">How Authify Works</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                A streamlined, secure flow that eliminates shared secrets without compromising usability.
              </p>
            </Reveal>
            
            <div className="grid md:grid-cols-4 gap-8 relative">
              <div className="hidden md:block absolute top-12 left-24 right-24 h-px bg-border z-0" />
              
              {[
                {
                  step: "1",
                  icon: <Settings className="w-6 h-6" />,
                  title: "Register Device",
                  desc: "Users enroll a trusted device, which generates a unique public-private key pair."
                },
                {
                  step: "2",
                  icon: <Lock className="w-6 h-6" />,
                  title: "Verify Locally",
                  desc: "The user unlocks their private key using on-device biometrics or a secure device PIN. Biometric data never leaves the device."
                },
                {
                  step: "3",
                  icon: <Cpu className="w-6 h-6" />,
                  title: "Cryptographic Authentication",
                  desc: "The device signs a secure challenge, proving possession of the private key without transmitting sensitive data."
                },
                {
                  step: "4",
                  icon: <CheckCircle2 className="w-6 h-6" />,
                  title: "Access Granted",
                  desc: "Authify verifies the signature using the public key and securely authenticates the user."
                }
              ].map((item, i) => (
                <Reveal key={i} delay={i * 100} className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <div className="w-24 h-24 rounded-full bg-white border-4 border-accent flex items-center justify-center text-primary shadow-lg group">
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center border-4 border-white">
                      {item.step}
                    </div>
                    {item.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-primary">{item.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-[#fcfcfc] border-b">
          <div className="max-w-7xl mx-auto px-6">
            <Reveal className="text-center space-y-4 mb-20">
              <h2 className="text-4xl font-bold text-primary tracking-tight">Simple, Transparent Pricing</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Authentication infrastructure designed to scale with your organization.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-8">
              {pricingPlans.map((plan, i) => (
                <Reveal key={i} delay={i * 100}>
                  <Card className={cn(
                    "relative flex flex-col h-full border-border/50 shadow-md hover:shadow-lg transition-all duration-300",
                    plan.popular && "border-primary/50 ring-1 ring-primary/20"
                  )}>
                    {plan.popular && (
                      <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2">
                        <Badge className="bg-primary text-white px-4 py-1">Most Popular</Badge>
                      </div>
                    )}
                    <CardHeader className="text-center pb-8">
                      <CardTitle className="text-xl font-bold text-primary">{plan.name}</CardTitle>
                      <CardDescription className="text-sm min-h-[40px] mt-2">{plan.description}</CardDescription>
                      <div className="mt-6">
                        <span className="text-4xl font-extrabold text-primary">{plan.price}</span>
                        {plan.price !== "Custom" && <span className="text-muted-foreground ml-1">/ month</span>}
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm">
                            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pt-8">
                      <Link href="/register" className="w-full">
                        <Button className={cn("w-full h-11", plan.popular ? "bg-primary" : "variant-outline")}>
                          {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                        </Button>
                      </Link>
                      <p className="text-xs text-center text-muted-foreground leading-relaxed">
                        {plan.footer}
                      </p>
                    </CardFooter>
                  </Card>
                </Reveal>
              ))}
            </div>

            <Reveal delay={400} className="mt-16 text-center space-y-6">
              <div className="max-w-3xl mx-auto p-6 bg-white border rounded-3xl shadow-sm space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  <strong>Zero biometric storage across all plans.</strong> Authentication is performed using device-bound cryptographic credentials to ensure maximum privacy and phishing resistance.
                </p>
                <div className="h-px bg-border/50 w-full" />
                <p className="text-sm text-primary font-medium italic">
                  “Security is foundational — not a premium add-on. All plans follow the same zero-biometric-storage architecture using device-bound cryptographic credentials.”
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* Outcome-Driven Security Positioning */}
        <section id="security" className="py-24 px-6 bg-[#fcfcfc]">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <Reveal className="space-y-6">
                <h2 className="text-4xl font-bold text-primary tracking-tight">Outcome-Driven Security Architecture</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Stop chasing vulnerabilities and start deploying resilient identity. Authify's platform delivers phishing resistance by default, ensuring your workforce and users remain secure regardless of attack sophistication.
                </p>
                <div className="space-y-4 pt-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl border bg-white shadow-sm">
                    <div className="p-2 rounded-lg bg-green-50 text-green-600">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Phishing-Resistant Origin Binding</p>
                      <p className="text-sm text-muted-foreground">Automatically prevents credential replay on unauthorized domains.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-primary/20 bg-primary/5 shadow-sm">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Hardware-Backed Credentials</p>
                      <p className="text-sm text-muted-foreground">Leverages secure enclaves (TPM/T2) to ensure keys cannot be exported.</p>
                    </div>
                  </div>
                </div>
              </Reveal>
              <Reveal delay={200} className="bg-primary p-8 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center gap-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-60">Identity Integrity</p>
                  <p className="text-3xl font-bold tracking-tight leading-tight">Designed to Eliminate Account Takeover Risk.</p>
                  <p className="text-sm opacity-80 pt-2">By leveraging WebAuthn and FIDO standards, Authify eliminates the shared-secret model entirely, delivering infrastructure-grade trust.</p>
                </div>
                <div className="h-px bg-white/20 w-full" />
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-70">Compliance Readiness</span>
                    <span className="font-bold">SOC2 / GDPR / HIPAA</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="opacity-70">Security Protocol</span>
                    <span className="font-bold">FIDO2 WebAuthn</span>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-6 text-center">
          <Reveal className="max-w-4xl mx-auto space-y-8 bg-white border border-border/60 rounded-[3rem] p-12 md:p-20 shadow-xl relative overflow-hidden">
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-primary tracking-tight">Deploy Phishing-Resistant Authentication for Your Applications.</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Join forward-thinking organizations building secure, frictionless applications with the Authify identity platform.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/register">
                  <Button size="lg" className="h-14 px-10 text-lg rounded-xl w-full sm:w-auto">Start Building Passwordless Today</Button>
                </Link>
                <Button variant="outline" size="lg" className="h-14 px-10 text-lg rounded-xl">Contact Sales</Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="bg-white py-12 px-6 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">Authify</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Authify. All rights reserved. Enterprise-grade authentication infrastructure for modern applications.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms of Service</Link>
            <Link href="#" className="hover:text-primary">Trust Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
