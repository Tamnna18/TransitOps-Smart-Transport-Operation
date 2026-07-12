import React from "react";
import { PageHeader } from "@/components/common/PageHeader";

const Expenses: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Fuel & Expenses"
        description="Audit fuel fill-ups and trip operating expenditures."
      />
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Expense Auditing Grid placeholder (Pending Implementation in later prompt)
      </div>
    </div>
  );
};

export default Expenses;
