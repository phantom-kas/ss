import { useEffect } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import api from "@/lib/axios";
import { useAuthStore } from "@/stores/auth";
import { showError } from "@/lib/error";



export const Route = createFileRoute('/verify-email')({
  component: VerifyEmail,
});


function VerifyEmail (){
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as any;
  const user = useAuthStore();

  useEffect(() => {
    const token = search.token;
    api
      .get("auth/verify-email", {
        params: { token },
        // @ts-ignore – custom axios config
        _showAllMessages: true,
      })
      .then((res) => {
        if (res.data.status !== "success") return;

        if (user.isLoggedIn()) {
          navigate({ to: "/dashboard" });
        }
      }).catch(e=>showError(e));
  }, []);

  return (
    <div className="w-screen h-screen flex flex-col gap-4 text-white bg-black justify-center items-center">
      <p>Verifying your email…</p>
    </div>
  );
};

export default VerifyEmail;
