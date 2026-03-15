'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, FileText, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompliancePage() {
  const readiness = [
    { framework: "SOC2 Type II", status: "Audit Ready", score: 98, color: "bg-green-500" },
    { framework: "GDPR", status: "Compliant", score: 100, color: "bg-green-500" },
    { framework: "HIPAA", status: "In Progress", score: 85, color: "bg-yellow-500" },
    { framework: "ISO 27001", status: "Verification Needed", score: 72, color: "bg-orange-500" },
  ];

  const controls = [
    { id: "AC-1", title: "Phishing-Resistant MFA", status: "Passed", description: "FIDO2 WebAuthn enforced for all administrative accounts." },
    { id: "AC-2", title: "Cryptographic Audit Trail", status: "Passed", description: "Tamper-evident logs are signed and verified hourly." },
    { id: "AC-3", title: "Zero Biometric Data Transfer", status: "Passed", description: "Verification happens locally on the device enclave." },
    { id: "AC-4", title: "Session Integrity Monitoring", status: "Passed", description: "Adaptive risk scoring active for all cross-region logins." },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Compliance & Risk</h1>
          <p className="text-muted-foreground">Monitor organizational alignment with global security frameworks.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Compliance Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {readiness.map((item) => (
          <Card key={item.framework} className="border-none shadow-md">
            <CardHeader className="pb-2">
              <CardDescription className="text-xs font-bold uppercase tracking-wider">{item.framework}</CardDescription>
              <CardTitle className="text-2xl font-bold text-primary">{item.status}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium">
                  <span>Readiness Score</span>
                  <span>{item.score}%</span>
                </div>
                <Progress value={item.score} className="h-1.5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security Control Validation
            </CardTitle>
            <CardDescription>Continuous monitoring of critical identity controls.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {controls.map((control) => (
              <div key={control.id} className="p-4 rounded-xl border bg-accent/5 flex items-start justify-between group hover:border-primary/20 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-muted-foreground">{control.id}</span>
                    <h4 className="font-bold text-primary">{control.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{control.description}</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {control.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Artifact Library
            </CardTitle>
            <CardDescription>Access signed compliance documents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "2024 SOC2 Readiness Report",
              "GDPR Data Impact Assessment",
              "Phishing Resistance Audit",
              "Enclave Security Whitepaper"
            ].map((doc) => (
              <div key={doc} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/30 cursor-pointer transition-colors border border-transparent hover:border-border">
                <span className="text-sm font-medium">{doc}</span>
                <Download className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
            <div className="pt-4">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Next audit scheduled for <strong>September 2024</strong>. All evidence collectors are active.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}