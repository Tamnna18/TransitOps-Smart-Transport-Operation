import React from "react";

const DriverDocuments: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My Documents</h1>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Commercial Driver License (CDL)</p>
        <p className="text-xs text-emerald-600 mt-1">Status: Verified & Active</p>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        Driver files list placeholder (Pending Implementation in later prompt)
      </div>
    </div>
  );
};

export default DriverDocuments;
