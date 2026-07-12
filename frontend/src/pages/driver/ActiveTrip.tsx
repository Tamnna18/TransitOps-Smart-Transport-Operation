import React from "react";

const ActiveTrip: React.FC = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My Active Trip</h1>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Active Route status</p>
        <h3 className="text-lg font-bold mt-1">#TO-9942</h3>
        <p className="text-xs text-emerald-600 mt-1">Dispatched - Ready to Start</p>
      </div>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">Trip Timeline</h3>
        <div className="text-xs text-muted-foreground">
          Origin: New York Hub<br/>
          Destination: Philadelphia Depot
        </div>
      </div>
    </div>
  );
};

export default ActiveTrip;
