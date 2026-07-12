import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import {
  User,
  Settings as SettingsIcon,
  Shield,
  HelpCircle,
  Eye,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";

// Zod schemas for forms
const profileSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(6, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, "Required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Required"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const Settings: React.FC = () => {
  const { user, login } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { settings, updateSettings } = useSettingsStore();
  const [activeTab, setActiveTab] = React.useState<"profile" | "system" | "security" | "roles" | "help">("profile");

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "Rajesh Patel",
      email: user?.email || "fleet.manager@transitops.in",
      phone: "+91 9825012345",
      address: "Satellite, Ahmedabad, GJ 10001",
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileUpdate = (data: ProfileFormValues) => {
    if (user) {
      // Mock update local auth profile details
      login(localStorage.getItem("transitops_auth_token") || "", {
        ...user,
        name: data.name,
        email: data.email,
      });
      toast.success("Profile details updated successfully");
    }
  };

  const onPasswordUpdate = (_data: PasswordFormValues) => {
    toast.success("Password changed successfully");
    resetPassword();
  };

  const handleSystemSettingsChange = (key: string, value: any) => {
    updateSettings({ [key]: value });
    toast.success("System preference updated");
  };

  const [activeFaq, setActiveFaq] = React.useState<number | null>(null);

  const faqs = [
    { q: "How do I dispatch a vehicle with pending compliance certificates?", a: "TransitOps restricts dispatch of vehicles with expired insurance or fitness certificates to ensure compliance. You must upload a valid renewal certificate under Fleet Registry → Vehicle Details to re-enable dispatch." },
    { q: "Can I log multiple fuel receipts under one trip?", a: "Yes. Drivers can submit multiple fuel logs during a trip. The system will aggregate the total consumption and calculate the overall km/L upon trip completion." },
    { q: "How do I export reports for annual accounting?", a: "Navigate to the Reports Library, select your required category tab (e.g. Fuel Consumption), filter the dates, and click 'Download CSV'." }
  ];

  return (
    <div className="space-y-6 animate-fade-in relative min-h-screen">
      <PageHeader
        title="Settings & System Configuration"
        description="Configure client profiles, timezone options, system parameters, security policies, and browse help documentation."
      />

      {/* Tabs Layout */}
      <div className="grid gap-6 md:grid-cols-4 items-start">
        {/* Left Hand Navigation Menu */}
        <Card className="border border-border/50 bg-card shadow-sm p-2 flex flex-col gap-1">
          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors text-left ${
              activeTab === "profile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <User className="h-4 w-4" /> My Profile
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors text-left ${
              activeTab === "system" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <SettingsIcon className="h-4 w-4" /> System Preferences
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors text-left ${
              activeTab === "security" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Shield className="h-4 w-4" /> Security
          </button>
          <button
            onClick={() => setActiveTab("roles")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors text-left ${
              activeTab === "roles" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Eye className="h-4 w-4" /> Role Permissions
          </button>
          <button
            onClick={() => setActiveTab("help")}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors text-left ${
              activeTab === "help" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <HelpCircle className="h-4 w-4" /> Help & Support
          </button>
        </Card>

        {/* Right Hand Panels */}
        <div className="md:col-span-3 space-y-6">
          {/* PROFILE PANEL */}
          {activeTab === "profile" && (
            <Card className="border border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Personal Profile Details</CardTitle>
                <CardDescription>Manage user name, contact information, and billing registry addresses</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileSubmit(onProfileUpdate)}>
                <CardContent className="space-y-4">
                  {/* Mock Profile Avatar */}
                  <div className="flex items-center gap-4 border-b pb-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
                      {user?.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{user?.name}</h4>
                      <p className="text-xs text-muted-foreground uppercase">{user?.role} Account Status: Active</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" {...registerProfile("name")} />
                      {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name.message}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="email">Email address</Label>
                      <Input id="email" type="email" {...registerProfile("email")} />
                      {profileErrors.email && <p className="text-xs text-destructive">{profileErrors.email.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="phone">Phone number</Label>
                      <Input id="phone" {...registerProfile("phone")} />
                      {profileErrors.phone && <p className="text-xs text-destructive">{profileErrors.phone.message}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="address">Operating Address</Label>
                      <Input id="address" {...registerProfile("address")} />
                      {profileErrors.address && <p className="text-xs text-destructive">{profileErrors.address.message}</p>}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 border-t p-4">
                  <Button type="submit" disabled={isProfileSubmitting}>
                    {isProfileSubmitting ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* SYSTEM PREFERENCES PANEL */}
          {activeTab === "system" && (
            <Card className="border border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">System Preferences</CardTitle>
                <CardDescription>Configure global parameters, language translations, and display timelines</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Application Interface Theme</Label>
                    <p className="text-xs text-muted-foreground">Toggle between high-contrast dark and light modes</p>
                  </div>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as any)}
                    className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-xs focus-visible:outline-none"
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                  </select>
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Measurement Metric Units</Label>
                    <p className="text-xs text-muted-foreground">Select distance metrics (km vs. kilometers)</p>
                  </div>
                  <select
                    value={settings.unitSystem}
                    onChange={(e) => handleSystemSettingsChange("unitSystem", e.target.value)}
                    className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-xs focus-visible:outline-none"
                  >
                    <option value="imperial">Imperial (km, Gallons)</option>
                    <option value="metric">Metric (Kilometers, Liters)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between pb-1">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold">Table Page Limit Size</Label>
                    <p className="text-xs text-muted-foreground">Default rows displayed per pagination view</p>
                  </div>
                  <select
                    value={settings.pageSize}
                    onChange={(e) => handleSystemSettingsChange("pageSize", Number(e.target.value))}
                    className="flex h-9 rounded-md border bg-transparent px-3 py-1 text-xs focus-visible:outline-none"
                  >
                    <option value="10">10 Rows</option>
                    <option value="25">25 Rows</option>
                    <option value="50">50 Rows</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SECURITY PANEL */}
          {activeTab === "security" && (
            <Card className="border border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Security Configuration</CardTitle>
                <CardDescription>Configure password encryption keys and audit active user session tokens</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordSubmit(onPasswordUpdate)}>
                <CardContent className="space-y-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" {...registerPassword("currentPassword")} />
                    {passwordErrors.currentPassword && <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="newPassword">New Secure Password</Label>
                    <Input id="newPassword" type="password" {...registerPassword("newPassword")} />
                    {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" {...registerPassword("confirmPassword")} />
                    {passwordErrors.confirmPassword && <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 border-t p-4">
                  <Button type="submit" disabled={isPasswordSubmitting}>
                    {isPasswordSubmitting ? "Changing..." : "Change Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          )}

          {/* ROLE SETTINGS PANEL */}
          {activeTab === "roles" && (
            <Card className="border border-border/50 bg-card shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Role Privileges Matrix (Read Only)</CardTitle>
                <CardDescription>Active authorization scopes associated with role: <strong>{user?.role}</strong></CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-xs leading-relaxed text-muted-foreground">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-foreground">Fleet Operations Write</span>
                  <span className="text-emerald-500 font-medium">Enabled</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-foreground">Dispatch Creation Control</span>
                  <span className="text-emerald-500 font-medium">Enabled</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-semibold text-foreground">Financial Ledger Audit Scopes</span>
                  <span className="text-emerald-500 font-medium">Enabled</span>
                </div>
                <div className="flex justify-between pb-1">
                  <span className="font-semibold text-foreground">Global Admin configurations</span>
                  <span className="text-destructive font-medium">Restricted</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* HELP CENTER PANEL */}
          {activeTab === "help" && (
            <div className="space-y-6">
              {/* FAQs Accordion */}
              <Card className="border border-border/50 bg-card shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Frequently Asked Questions</CardTitle>
                  <CardDescription>Browse operator manuals and quick troubleshooting guides</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="border-b last:border-b-0 pb-3 last:pb-0">
                      <button
                        onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-foreground text-left py-2 focus:outline-none"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${activeFaq === idx ? "rotate-180" : ""}`} />
                      </button>
                      {activeFaq === idx && (
                        <p className="text-xs text-muted-foreground leading-relaxed mt-2 p-2 bg-muted/40 rounded">
                          {faq.a}
                        </p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Version Specs */}
              <Card className="border border-border/50 bg-card shadow-sm p-6 text-center text-xs text-muted-foreground space-y-1 bg-muted/10">
                <p className="font-bold text-foreground">TransitOps ERP System</p>
                <p>Version v1.2.0 (Build 9942) - TypeScript React Client</p>
                <p>Licensed under commercial fleet distribution policy.</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
