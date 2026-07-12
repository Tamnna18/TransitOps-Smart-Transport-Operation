import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useAuthStore } from "@/store/useAuthStore";
import { ROLES, type Role } from "@/constants";
import { Truck } from "lucide-react";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginSchema = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginSchema) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      let role: Role = ROLES.MANAGER;
      let name = "Rajesh Patel";
      
      if (data.email.includes("driver")) {
        role = ROLES.DRIVER;
        name = "Rahul Sharma";
      } else if (data.email.includes("safety")) {
        role = ROLES.SAFETY;
        name = "Sarah Connor";
      } else if (data.email.includes("analyst")) {
        role = ROLES.ANALYST;
        name = "Mark Baum";
      }

      const mockUser = {
        id: 1,
        email: data.email,
        name,
        role,
        createdAt: new Date().toISOString(),
      };

      login("mock_jwt_token_payload", mockUser);
      toast.success(`Welcome back, ${name}!`);
      
      if (role === ROLES.DRIVER) {
        navigate("/driver/active-trip");
      } else {
        navigate("/app/dashboard");
      }
    } catch (err) {
      toast.error("Failed to authenticate. Please check your credentials.");
    }
  };

  const handleMockLogin = (role: keyof typeof ROLES) => {
    const roleEmails = {
      MANAGER: "fleet.manager@transitops.in",
      DRIVER: "driver@transitops.com",
      SAFETY: "safety@transitops.com",
      ANALYST: "analyst@transitops.com",
    };
    setValue("email", roleEmails[role]);
    setValue("password", "password123");
    handleSubmit(onSubmit)();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
            <Truck className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground">
            TransitOps
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Smart Transport Operations Platform
          </p>
        </div>

        <Card className="border border-border/50 shadow-xl bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign in</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your portal
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={errors.email ? "border-destructive" : ""}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Button
                    variant="link"
                    type="button"
                    className="px-0 font-normal text-xs"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Forgot password?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  className={errors.password ? "border-destructive" : ""}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
              
              <div className="relative w-full">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    Or select a mock portal role
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleMockLogin("MANAGER")}
                >
                  Fleet Manager
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleMockLogin("DRIVER")}
                >
                  Driver
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleMockLogin("SAFETY")}
                >
                  Safety Officer
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => handleMockLogin("ANALYST")}
                >
                  Finance Analyst
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
