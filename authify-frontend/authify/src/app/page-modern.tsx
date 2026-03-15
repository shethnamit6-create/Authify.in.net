'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  ArrowRight,
  Zap,
  Lock,
  Globe,
  Code,
  ShieldCheck,
  Fingerprint,
  Key,
  Cpu,
  BarChart3,
  Users,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ModernHome() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "Zero-Knowledge Authentication",
      description: "Military-grade cryptography eliminates password-based attacks"
    },
    {
      icon: <Fingerprint className="w-6 h-6" />,
      title: "Biometric Security",
      description: "Advanced biometric verification without data storage"
    },
    {
      icon: <Key className="w-6 h-6" />,
      title: "Hardware-Backed Keys",
      description: "Secure enclaves protect cryptographic credentials"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Compliance",
      description: "SOC2, GDPR, and enterprise-ready security"
    },
    {
      icon: <Code className="w-6 h-6" />,
      title: "Developer APIs",
      description: "Clean, documented APIs for rapid integration"
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Enterprise Performance",
      description: "Scalable architecture for millions of users"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "<50ms", label: "Latency" },
    { value: "0", label: "Breaches" },
    { value: "256-bit", label: "Encryption" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Navigation */}
      <header className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50" 
          : "bg-transparent"
      )}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <span className="text-xl font-bold text-slate-900">Authify</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Features</Link>
            <Link href="#security" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Security</Link>
            <Link href="/developers" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">Developers</Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-slate-900">Sign In</Button>
            </Link>
            <Link href="/admin">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                Admin Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' stroke=\'rgb(203 213 225)\' stroke-width=\'0.5\'%3E%3Cpath d=\'M0 30h60M0 60h60M0 90h60M0 120h60\'/%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-8">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-slate-200/50">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-slate-700">System Operational</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight tracking-tight">
                Next-Generation
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Authentication
                </span>
              </h1>
              
              <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                Enterprise-grade identity infrastructure built for the 
                <span className="font-semibold text-slate-900"> passwordless future</span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-xl">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="border-slate-300 text-slate-700 hover:bg-slate-50">
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Key Differentiators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12">
              {[
                { icon: <Lock className="w-5 h-5" />, text: "Zero Passwords" },
                { icon: <ShieldCheck className="w-5 h-5" />, text: "Zero Breaches" },
                { icon: <Zap className="w-5 h-5" />, text: "Lightning Fast" },
                { icon: <Globe className="w-5 h-5" />, text: "Global Scale" }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-slate-600">
                  <div className="text-blue-600">{item.icon}</div>
                  <span className="font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="animate-bounce">
            <div className="w-6 h-10 border-2 border-slate-300 rounded-full flex justify-center">
              <div className="w-1 h-4 bg-slate-400 rounded-full"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-6 mb-16">
            <h2 className="text-4xl font-bold text-slate-900">Why Authify?</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Built for security teams that demand uncompromising protection
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group p-8 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                    {feature.icon}
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-blue-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center space-y-8 mb-16">
            <h2 className="text-4xl font-bold text-slate-900">Performance Metrics</h2>
            <p className="text-xl text-slate-600">
              Real-time performance you can depend on
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stat.value}</div>
                <div className="text-sm font-medium text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold text-slate-900">Enterprise Security</h2>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Military-grade encryption with zero-knowledge architecture
                </p>
              </div>
              
              <div className="space-y-6">
                {[
                  "FIDO2/WebAuthn compliant",
                  "Hardware security modules",
                  "End-to-end encryption",
                  "Zero-trust architecture"
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 text-white">
                <Shield className="w-16 h-16 mb-6" />
                <h3 className="text-2xl font-bold mb-4">Security First</h3>
                <p className="text-blue-100 leading-relaxed">
                  Every authentication request is cryptographically verified and tamper-evident
                </p>
                <div className="mt-8">
                  <Link href="/register">
                    <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 w-full">
                      Start Secure Authentication
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white mb-4">
              Ready to eliminate passwords?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of companies securing their digital future
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl">
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/developers">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <div className="space-y-2 text-slate-400">
                <div>Authentication</div>
                <div>Security</div>
                <div>Enterprise</div>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <div className="space-y-2 text-slate-400">
                <div>About</div>
                <div>Blog</div>
                <div>Careers</div>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Resources</h3>
              <div className="space-y-2 text-slate-400">
                <div>Documentation</div>
                <div>API Reference</div>
                <div>Support</div>
              </div>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <div className="space-y-2 text-slate-400">
                <div>Privacy</div>
                <div>Terms</div>
                <div>Compliance</div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-slate-800 text-center text-slate-400">
            <p>&copy; 2024 Authify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
