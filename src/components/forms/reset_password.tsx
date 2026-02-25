import { useState, useEffect } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { LoadingButton } from "../Elements/Button";
import { toast } from "sonner";
import { ArrowLeft, Lock } from "lucide-react";
import { Button } from "../ui/button";
import logo from "figma:asset/872c19024a848c86be2cfb9320e9ce2d33228284.png";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth";
import { showError } from "@/lib/error";

export function ResetPassword() {
  const searchParams = useSearch({ from: '/password-reset' }) as any;
  const token = searchParams.token;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // alert(';')
  // Optional: redirect if no token
  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing token");
      navigate({ to: "/signin" });
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // alert('sdasd')
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", { token, newPassword });
      // alert('sdad')

      toast.success("Password has been reset successfully!");
      // alert('sdad')
      navigate({ to: "/signin" });
    } catch (err: any) {
      // toast.error(err?.response?.data?.error || "Failed to reset password");
      showError(err)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-linear-to-br from-blue-50 via-emerald-50/30 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Button
        variant="link"
        className="absolute top-4 left-4 p-2 text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400"
        onClick={() => navigate({ to: "/signin" })}
      >
        <ArrowLeft className="w-5 h-5" />
      </Button>

      <Card className="w-full max-w-md p-6 shadow-xl dark:bg-slate-800 dark:border-slate-700">
        <div className="text-center mb-6">
          <img src={logo} alt="StableSend" className="h-12 mx-auto mb-3" />
          <h2 className="text-xl text-slate-900 dark:text-white mb-1">
            Reset Password
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="newPassword" className="text-sm dark:text-slate-300">
              New Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                id="newPassword"
                type="password"
                placeholder="••••••••"
                className="pl-9 h-9 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm dark:text-slate-300">
              Confirm Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className="pl-9 h-9 text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <LoadingButton
            isLoading={loading}
            type="submit"
            className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-9 text-sm"
          >
            Reset Password
          </LoadingButton>
        </form>
      </Card>
    </div>
  );
}