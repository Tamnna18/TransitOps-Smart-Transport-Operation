import React from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X, Wallet, Camera } from "lucide-react";
import { toast } from "sonner";

interface DriverExpense {
  id: number;
  date: string;
  category: "Fuel" | "Lodging" | "Food" | "Tolls";
  amount: number;
  location: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

const DriverExpenses: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [expenses, setExpenses] = React.useState<DriverExpense[]>([
    { id: 1, date: "2026-07-12", category: "Fuel", amount: 456.00, location: "Love's Station, GJ", status: "PENDING" },
    { id: 2, date: "2026-07-10", category: "Lodging", amount: 180.00, location: "Motel 6, MH", status: "APPROVED" },
    { id: 3, date: "2026-07-09", category: "Food", amount: 28.50, location: "TA Truck Stop Diner, MH", status: "APPROVED" },
  ]);

  const [formData, setFormData] = React.useState({ category: "Fuel", amount: "", location: "", notes: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: DriverExpense = {
      id: expenses.length + 1,
      date: new Date().toISOString().split("T")[0],
      category: formData.category as any,
      amount: Number(formData.amount),
      location: formData.location,
      status: "PENDING",
    };
    setExpenses([newExpense, ...expenses]);
    toast.success("Expense receipt logged. Sent to Analyst for approval.");
    setIsFormOpen(false);
    setFormData({ category: "Fuel", amount: "", location: "", notes: "" });
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Expense Logs & Fuel Entries"
        description="Log your daily route expenditures, fuel fill-ups, lodging stipends, and submit receipts for reimbursement."
        actions={
          <Button onClick={() => setIsFormOpen(true)} className="flex items-center gap-1.5 text-xs">
            <Plus className="h-4 w-4" /> Add Receipt
          </Button>
        }
      />

      {/* Expenses Table */}
      <Card className="border border-border/50 bg-card shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase">
              <tr>
                <th className="px-6 py-4">Submitted Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Merchant / Location</th>
                <th className="px-6 py-4">Charged Amount</th>
                <th className="px-6 py-4">Reimbursement Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-xs font-medium text-foreground">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 font-mono">{exp.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                      exp.category === "Fuel" ? "bg-sky-500/10 text-sky-500" :
                      exp.category === "Lodging" ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                    }`}>
                      {exp.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{exp.location}</td>
                  <td className="px-6 py-4 font-semibold">${exp.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold ${
                      exp.status === "PENDING" ? "bg-indigo-500/10 text-indigo-500" :
                      exp.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"
                    }`}>
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ADD RECEIPT DIALOG */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm bg-card shadow-2xl border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-base flex items-center gap-1.5">
                <Wallet className="h-5 w-5" /> Submit Expense Receipt
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsFormOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="grid gap-1.5">
                  <Label htmlFor="category">Expense Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="flex h-9 rounded-md border bg-transparent px-3 py-1"
                  >
                    <option value="Fuel">Fuel Fill-up</option>
                    <option value="Lodging">Lodging Allowance</option>
                    <option value="Food">Meals Stipend</option>
                    <option value="Tolls">Tolls / Weigh Station</option>
                  </select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="amount">Amount (INR )</Label>
                  <Input
                    id="amount"
                    type="number"
                    required
                    placeholder="75.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="location">Station Location / Address</Label>
                  <Input
                    id="location"
                    required
                    placeholder="Love's Station #412, GJ"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Camera Scan / Attach Receipt</Label>
                  <Button type="button" variant="outline" className="flex items-center gap-1.5 text-xs py-5">
                    <Camera className="h-4 w-4" /> Scan Receipt Image
                  </Button>
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 border-t p-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsFormOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm">Submit</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DriverExpenses;
