
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Smartphone, ShieldCheck, Trash2, Plus, Monitor } from "lucide-react";

export default function DevicesPage() {
  const devices = [
    { id: "DEV-101", name: "MacBook Pro (Alex's Laptop)", type: "TouchID / Security Key", status: "Active", lastUsed: "2 mins ago" },
    { id: "DEV-102", name: "iPhone 15 Pro", type: "FaceID / Passkey", status: "Active", lastUsed: "1 hour ago" },
    { id: "DEV-103", name: "YubiKey 5C NFC", type: "Hardware Key", status: "Active", lastUsed: "3 days ago" },
    { id: "DEV-104", name: "Alex's iPad Pro", type: "FaceID / Passkey", status: "Inactive", lastUsed: "2 weeks ago" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Registered Devices</h1>
          <p className="text-muted-foreground">Manage the hardware and biometric authenticators bound to your account.</p>
        </div>
        <Button className="bg-primary">
          <Plus className="w-4 h-4 mr-2" />
          Register New Device
        </Button>
      </div>

      <div className="grid gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              Device Integrity Status: Secure
            </CardTitle>
            <CardDescription>All registered devices are using hardware-backed enclaves for private key storage.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white rounded-xl border overflow-hidden">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow>
                    <TableHead className="font-bold text-primary">Device Name</TableHead>
                    <TableHead className="font-bold text-primary">Type</TableHead>
                    <TableHead className="font-bold text-primary">Status</TableHead>
                    <TableHead className="font-bold text-primary">Last Used</TableHead>
                    <TableHead className="font-bold text-primary text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {devices.map((device) => (
                    <TableRow key={device.id} className="hover:bg-accent/20 transition-colors">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          {device.type.includes('Laptop') || device.type.includes('Hardware') ? <Monitor className="w-4 h-4 text-muted-foreground" /> : <Smartphone className="w-4 h-4 text-muted-foreground" />}
                          {device.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{device.type}</TableCell>
                      <TableCell>
                        <Badge variant={device.status === 'Active' ? 'secondary' : 'outline'}>
                          {device.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{device.lastUsed}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
