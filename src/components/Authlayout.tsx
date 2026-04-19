import * as React from "react"
import { ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import logo from 'figma:asset/872c19024a848c86be2cfb9320e9ce2d33228284.png'
import { useNavigate } from "@tanstack/react-router"
import AuthContainer from "./authentication/AuthContainer"

interface AuthLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
  showBack?: boolean
  onBack?: () => void
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  showBack = true,
  onBack,
}: AuthLayoutProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate({ to: '/' })
    }
  }


  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-linear-to-br from-blue-50 via-emerald-50/30 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {showBack && (
        <button
          onClick={handleBack}
          className="absolute top-4 left-4 p-2 hover:bg-white/80 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
      )}

      <AuthContainer>
        {/* Logo + heading */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <img src={logo} alt="StableSend" className="h-11 sm:h-12" />
          </div>
          <h2 className="text-slate-900 dark:text-white mb-1 text-xl">{title}</h2>
          {subtitle && (
            <p className="text-slate-600 dark:text-slate-400 text-sm">{subtitle}</p>
          )}
        </div>

        {/* Page content — form, OTP, QR, etc */}
        {children}

        {/* Footer — sign up link, terms, etc */}
        {footer && (
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm mt-4">
            {footer}
          </p>
        )}
      </AuthContainer>
    </div>
  )
}