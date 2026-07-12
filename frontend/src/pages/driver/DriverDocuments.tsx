import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Upload, Calendar } from "lucide-react";
import { toast } from "sonner";

interface DocInfo {
  name: string;
  number: string;
  expiry: string;
  status: "ACTIVE" | "EXPIRED" | "EXPIRES_SOON";
}

const DriverDocuments: React.FC = () => {
  const [docs] = React.useState<DocInfo[]>([
    { name: "Commercial Driver License (CDL Class A)", number: "CDL-8842-GJ", expiry: "2026-08-01", status: "EXPIRES_SOON" },
    { name: "DOT Medical Certification Card", number: "DOT-9942", expiry: "2027-05-18", status: "ACTIVE" },
    { name: "Transportation Worker Identification (TWIC)", number: "TWIC-04281", expiry: "2028-09-02", status: "ACTIVE" },
  ]);

  const handleUpload = () => {
    toast.success("Document uploaded. Under review by Safety Officer.");
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Compliance Certificates & Licenses"
        description="Verify your commercial driver's license status, DOT certifications, and upload renewal document cards."
      />

      <div className="grid gap-6 md:grid-cols-3">
        {/* Compliance checklist summary */}
        <Card className="md:col-span-2 border border-border/50 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Active Credentials</CardTitle>
            <CardDescription>Official compliance credentials registered on file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {docs.map((doc, idx) => (
              <div key={idx} className="p-4 rounded-lg border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex gap-3">
                  <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-semibold text-foreground">{doc.name}</p>
                    <p className="text-muted-foreground font-mono">Reference No: {doc.number}</p>
                    <p className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Expiry: {doc.expiry}</p>
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                    doc.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-500" :
                    doc.status === "EXPIRES_SOON" ? "bg-amber-500/10 text-amber-500 animate-pulse" : "bg-destructive/10 text-destructive"
                  }`}>
                    {doc.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Uploader Card */}
        <Card className="border border-border/50 bg-card shadow-sm p-6 flex flex-col justify-between h-80">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Upload Credentials Scan</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">Submit high-resolution JPEG or PDF scans of CDL license card updates, DOT medical certifications, or TWIC credentials cards.</p>
          </div>
          <div className="border border-dashed border-border/80 rounded-lg p-6 text-center space-y-3 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer" onClick={handleUpload}>
            <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
            <div className="text-xs text-muted-foreground">
              <span className="text-primary font-semibold">Click to upload</span> or drag and drop files here
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DriverDocuments;
