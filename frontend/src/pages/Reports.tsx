import React from "react";
import { PageHeader } from "@/components/common/PageHeader";

const Reports: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Reports Library"
        description="Compile and export custom operations audits and compliance summaries."
      />
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Reports Library placeholder (Pending Implementation in later prompt)
      </div>
    </div>
  );
};

export default Reports;
