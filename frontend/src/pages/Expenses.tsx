import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useFleetStore } from "@/store/useFleetStore";
import { useDriverStore } from "@/store/useDriverStore";
import {
  Wallet,
  Fuel,
  CreditCard,
  Plus,
  X,
  Search,
  Download
} from "lucide-react";
import { toast } from "sonner";

// Zod validation schemas
const expenseSchema = z.object({
  date: z.string().min(1, "Date is required"),
  vehicleId: z.number().min(1, "Vehicle is required"),
  driverId: z.number().min(1, "Driver is required"),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(1, "Category is required"),
  volumeLitres: z.number(),
  location: z.string().min(3, "Location details required"),
  notes: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

interface ExpenseLog {
  id: number;
  date: string;
  vehicleId: number;
  driverId: number;
  amount: number;
  category: "Fuel" | "Maintenance" | "Tolls" | "Lodging";
  volumeLitres?: number;
  location: string;
  notes?: string;
}

import api from "@/services/api";

const Expenses: React.FC = () => {
  const { vehicles } = useFleetStore();
  const { drivers } = useDriverStore();

  const [activeTab, setActiveTab] = React.useState<"logs" | "budgets" | "roi">("logs");
  const [isExpenseOpen, setIsExpenseOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Database list states
  const [expenseLogs, setExpenseLogs] = React.useState<ExpenseLog[]>([]);

  const fetchExpenses = async () => {
    try {
      const response = await api.get("/expenses");
      setExpenseLogs(response.data);
    } catch (e) {
      console.error("fetchExpenses error: ", e);
    }
  };

  React.useEffect(() => {
    fetchExpenses();
  }, []);

  // Form Hooks
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: "Fuel",
      volumeLitres: 0,
      amount: 0,
      vehicleId: 0,
      driverId: 0,
      location: "",
      notes: "",
    },
  });

  const onExpenseSubmit = async (data: ExpenseFormValues) => {
    try {
      await api.post("/expenses", {
        date: data.date,
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        amount: data.amount,
        category: data.category,
        volumeLitres: data.category === "Fuel" ? data.volumeLitres : null,
        location: data.location,
        notes: data.notes,
      });
      await fetchExpenses();
      toast.success("Expense transaction logged successfully.");
      setIsExpenseOpen(false);
      reset();
    } catch (e: any) {
      toast.error(e.message || "Failed to log expense transaction.");
    }
  };

  const handleExport = () => {
    const headers = ["ID", "Date", "Vehicle", "Driver", "Amount", "Category", "Location"];
    const csvContent = [
      headers.join(","),
      ...expenseLogs.map(l => [
        l.id,
        l.date,
        vehicles.find(v => v.id === l.vehicleId)?.licensePlate || "Unknown",
        drivers.find(d => d.id === l.driverId)?.name || "Unknown",
        l.amount,
        l.category,
        `"${l.location}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "transitops_expenses_ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Ledger logs exported to CSV");
  };

  // Financial calculations
  const totalSpend = expenseLogs.reduce((acc, l) => acc + l.amount, 0);
  const fuelSpend = expenseLogs.filter(l => l.category === "Fuel").reduce((acc, l) => acc + l.amount, 0);
  const fuelGals = expenseLogs.filter(l => l.category === "Fuel").reduce((acc, l) => acc + (l.volumeLitres || 0), 0);
  const avgFuelCost = fuelGals > 0 ? (fuelSpend / fuelGals).toFixed(2) : "0.00";

  // Filter logs
  const filteredLogs = expenseLogs.filter(l => {
    const plate = vehicles.find(v => v.id === l.vehicleId)?.licensePlate || "";
    const driver = drivers.find(d => d.id === l.driverId)?.name || "";
    return l.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Fuel & Expense Ledgers"
        description="Monitor operating expenditure profiles, record fuel card charges, and audit vehicle return-on-investment curves."
        actions={
          <div className="flex gap-2">
            <Button onClick={() => setIsExpenseOpen(true)} className="flex items-center gap-1.5 text-xs">
              <Plus className="h-4 w-4" /> Log Expense
            </Button>
            <Button variant="outline" onClick={handleExport} className="flex items-center gap-1.5 text-xs">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-6 border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5"><Wallet className="h-4 w-4 text-emerald-500" /> Total Ledger Expenses</span>
          <h3 className="text-3xl font-extrabold mt-2">${totalSpend.toLocaleString()}</h3>
        </Card>
        <Card className="p-6 border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5"><Fuel className="h-4 w-4 text-sky-500" /> Total Fuel Spend</span>
          <h3 className="text-3xl font-extrabold mt-2">${fuelSpend.toLocaleString()}</h3>
        </Card>
        <Card className="p-6 border bg-card shadow-sm">
          <span className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-amber-500" /> Avg Fuel Price / Gal</span>
          <h3 className="text-3xl font-extrabold mt-2">${avgFuelCost}</h3>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "logs" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Expense Logs
        </button>
        <button
          onClick={() => setActiveTab("budgets")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "budgets" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Budget Analysis
        </button>
        <button
          onClick={() => setActiveTab("roi")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
            activeTab === "roi" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Vehicle ROI Monitor
        </button>
      </div>

      {/* Subpage Contents */}
      {activeTab === "logs" && (
        <Card className="border border-border/50 bg-card shadow-sm">
          <CardHeader className="flex flex-col md:flex-row items-center gap-4 pb-4 border-b">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by plate, driver, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
          </CardHeader>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4">Transaction Date</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Vehicle / Driver</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-medium text-foreground">
                {filteredLogs.map((l) => {
                  const plate = vehicles.find(v => v.id === l.vehicleId)?.licensePlate || "Unknown";
                  const driverName = drivers.find(d => d.id === l.driverId)?.name || "Unknown";
                  return (
                    <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-mono">{l.date}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          l.category === "Fuel" ? "bg-sky-500/10 text-sky-500" :
                          l.category === "Maintenance" ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                        }`}>
                          {l.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>Plate: {plate}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Driver: {driverName}</div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">${l.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-muted-foreground">{l.location}</td>
                      <td className="px-6 py-4 text-[10px] text-muted-foreground">{l.notes || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === "budgets" && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border border-border/50 bg-card shadow-sm p-6 space-y-4">
            <h4 className="font-semibold text-sm">Monthly Expenditure Cap Limits</h4>
            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Fuel Allowance</span>
                  <span>INR 8,000 / INR 10,000 Budgeted</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-sky-500 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Maintenance Reserves</span>
                  <span>INR 4,500 / INR 5,000 Budgeted</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "90%" }} />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-medium">
                  <span>Lodging & Daily Stipends</span>
                  <span>INR 1,200 / INR 3,000 Budgeted</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: "40%" }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "roi" && (
        <Card className="border border-border/50 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Asset Return-on-Investment (ROI)</CardTitle>
            <CardDescription>Estimated revenue yield against aggregated operational ledger expenses</CardDescription>
          </CardHeader>
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b text-xs font-semibold text-muted-foreground uppercase">
                <tr>
                  <th className="px-6 py-4">Vehicle Specification</th>
                  <th className="px-6 py-4">Operating Expense</th>
                  <th className="px-6 py-4">Est. Revenue Generated</th>
                  <th className="px-6 py-4">Yield Variance</th>
                  <th className="px-6 py-4">ROI Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs font-medium text-foreground">
                {vehicles.map((v) => {
                  const expense = expenseLogs.filter(l => l.vehicleId === v.id).reduce((acc, l) => acc + l.amount, 0);
                  const revenue = expense * 2.8; // Mock revenue multiple
                  const yieldVar = revenue - expense;
                  const roiPercent = expense > 0 ? Math.round((yieldVar / expense) * 100) : 0;
                  return (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-semibold">{v.name} ({v.licensePlate})</td>
                      <td className="px-6 py-4 text-destructive font-mono">${expense.toLocaleString()}</td>
                      <td className="px-6 py-4 text-emerald-500 font-mono">${revenue.toLocaleString()}</td>
                      <td className="px-6 py-4 font-semibold">${yieldVar.toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-500">
                          {roiPercent}% ROI
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* LOG EXPENSE DIALOG */}
      {isExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm bg-card shadow-2xl border border-border/50">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <CardTitle className="text-base">Log Fleet Transaction</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setIsExpenseOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </CardHeader>
            <form onSubmit={handleSubmit(onExpenseSubmit)}>
              <CardContent className="space-y-4 pt-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="date">Transaction Date</Label>
                    <Input id="date" type="date" {...register("date")} />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="category">Category</Label>
                    <select id="category" {...register("category")} className="flex h-9 rounded-md border bg-transparent px-3 py-1">
                      <option value="Fuel">Fuel Purchase</option>
                      <option value="Maintenance">Maintenance Repair</option>
                      <option value="Lodging">Lodging Stipend</option>
                      <option value="Tolls">Tolls / Licensing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="vehicleId">Vehicle</Label>
                    <select id="vehicleId" {...register("vehicleId", { valueAsNumber: true })} className="flex h-9 rounded-md border bg-transparent px-3 py-1">
                      <option value="0">-- Select --</option>
                      {vehicles.map(v => (
                        <option key={v.id} value={v.id}>{v.licensePlate}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="driverId">Driver</Label>
                    <select id="driverId" {...register("driverId", { valueAsNumber: true })} className="flex h-9 rounded-md border bg-transparent px-3 py-1">
                      <option value="0">-- Select --</option>
                      {drivers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="amount">Charged Amount (INR )</Label>
                    <Input id="amount" type="number" placeholder="250" {...register("amount", { valueAsNumber: true })} />
                    {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="volumeLitres">Volume (Gal - Fuel Only)</Label>
                    <Input id="volumeLitres" type="number" placeholder="60" {...register("volumeLitres", { valueAsNumber: true })} />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="location">Merchant Location / Station</Label>
                  <Input id="location" placeholder="Love's Station, Albany GJ" {...register("location")} />
                  {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="notes">Reference Notes</Label>
                  <Input id="notes" placeholder="Invoice # or receipt reference number" {...register("notes")} />
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 border-t p-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsExpenseOpen(false)}>Cancel</Button>
                <Button type="submit" size="sm">Log Transaction</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Expenses;
