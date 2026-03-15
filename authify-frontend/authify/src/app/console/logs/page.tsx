'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Download, Filter, ShieldCheck } from "lucide-react"

export default function LogsPage() {
  const logs = [
    { id: "EVT-8921", user: "john.doe@example.com", event: "WebAuthn Login", result: "Success", risk: "Low", ip: "192.168.1.1", timestamp: "2024-05-21 14:22:01" },
    { id: "EVT-8920", user: "sarah.w@techcorp.io", event: "Key Registration", result: "Success", risk: "Medium", ip: "45.12.89.22", timestamp: "2024-05-21 13:45:12" },
    { id: "EVT-8919", user: "admin@global.biz", event: "Dashboard Access", result: "Success", risk: "Low", ip: "102.14.2.55", timestamp: "2024-05-21 12:10:05" },
    { id: "EVT-8918", user: "unknown", event: "Brute Force Attempt", result: "Blocked", risk: "Critical", ip: "213.4.192.11", timestamp: "2024-05-21 11:32:44" },
    { id: "EVT-8917", user: "mike.r@startup.co", event: "Step-up Auth", result: "Required", risk: "High", ip: "88.19.144.2", timestamp: "2024-05-21 09:15:22" },
    { id: "EVT-8916", user: "lisa.m@enterprise.com", event: "WebAuthn Login", result: "Success", risk: "Low", ip: "172.16.0.4", timestamp: "2024-05-21 08:44:01" },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Audit Logs</h1>
          <p className="text-muted-foreground">Detailed logs of all authentication and platform events.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" size="sm">
            <ShieldCheck className="w-4 h-4 mr-2" />
            Verify Log Integrity
          </Button>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by user, IP, or event ID..." className="pl-10" />
        </div>
        <Button variant="ghost" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-md border overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-bold text-primary">Event ID</TableHead>
              <TableHead className="font-bold text-primary">User Identity</TableHead>
              <TableHead className="font-bold text-primary">Event Type</TableHead>
              <TableHead className="font-bold text-primary">Result</TableHead>
              <TableHead className="font-bold text-primary">Risk Level</TableHead>
              <TableHead className="font-bold text-primary text-right">Timestamp</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id} className="hover:bg-accent/30 transition-colors">
                <TableCell className="font-mono text-xs">{log.id}</TableCell>
                <TableCell className="font-medium">{log.user}</TableCell>
                <TableCell>{log.event}</TableCell>
                <TableCell>
                  <Badge variant={log.result === 'Success' ? 'secondary' : log.result === 'Blocked' ? 'destructive' : 'outline'}>
                    {log.result}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      log.risk === 'Low' ? 'bg-green-500' :
                      log.risk === 'Medium' ? 'bg-yellow-500' :
                      log.risk === 'High' ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm">{log.risk}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-sm">{log.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}