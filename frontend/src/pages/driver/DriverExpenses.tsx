import React from "react";

const DriverExpenses: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Log Fuel & Expenses</h1>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Submit expense log</p>
        <p className="text-xs text-muted-foreground mt-1">Select category and attach receipt photos inline</p>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        Expense logs listing placeholder (Pending Implementation in later prompt)
      </div>
    </div>
  );
};

export default DriverExpenses;
