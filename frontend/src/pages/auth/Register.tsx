import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { ROLES } from "@/constants";
import { Truck } from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

const registerSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string().min(1, "Please select an operational role"),
});

type RegisterSchema = z.infer<typeof registerSchema>;

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
    },
  });

  const onSubmit = async (data: RegisterSchema) => {
    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      const { token, user } = response.data;
      login(token, user);

      toast.success(`Account created! Welcome, ${user.name}!`);

      if (user.role === ROLES.DRIVER) {
        navigate("/driver/active-trip");
      } else {
        navigate("/app/dashboard");
      }
    } catch (err: any) {
      console.error("Registration component error: ", err);
      toast.error(err.message || "Failed to register account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-card/50 to-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="w-full border-border/40 bg-card/60 backdrop-blur-md shadow-2xl relative">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex justify-center mb-2">
              <div className="p-3 bg-primary/10 rounded-full border border-primary/20">
                <Truck className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center font-bold tracking-tight">Create Account</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Sign up to join the TransitOps Fleet Operations ERP
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Yash Desai"
                  {...register("name")}
                  className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.name && (
                  <p className="text-xs font-semibold text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. yash.desai@transitops.in"
                  {...register("email")}
                  className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.email && (
                  <p className="text-xs font-semibold text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  {...register("password")}
                  className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-xs font-semibold text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="role">Operational Role</Label>
                <select
                  id="role"
                  {...register("role")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select your role...</option>
                  <option value="MANAGER">Fleet Manager</option>
                  <option value="DRIVER">Driver / Operator</option>
                  <option value="SAFETY">Safety Officer</option>
                  <option value="ANALYST">Financial Analyst</option>
                </select>
                {errors.role && (
                  <p className="text-xs font-semibold text-destructive mt-1">{errors.role.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Registering account..." : "Sign Up"}
              </Button>
              
              <div className="text-sm text-center text-muted-foreground mt-2">
                Already have an account?{" "}
                <Link to="/login" className="text-primary font-semibold hover:underline">
                  Log In
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
