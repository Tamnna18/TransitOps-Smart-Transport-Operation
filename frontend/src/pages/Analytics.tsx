import React from "react";
import { PageHeader } from "@/components/common/PageHeader";

const Analytics: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Operations Analytics"
        description="Extract profitability indices and average fuel mileage data."
      />
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Profitability Analytics charts placeholder (Pending Implementation in later prompt)
      </div>
    </div>
  );
};

export default Analytics;
