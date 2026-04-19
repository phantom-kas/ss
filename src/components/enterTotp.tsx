import * as React from "react"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { AuthLayout } from "./Authlayout"
import { LoadingButton } from "./Elements/Button"
import { FieldGroup } from "./ui/field"
import AuthContainer from "./authentication/AuthContainer"

interface TotpPageProps {
  title?: string
  subtitle?: string
  onSubmit: (code: string) => Promise<void>
  isLoading?: boolean
  error?: string
  onCancel?: () => void
  cancelLabel?: string
  submitLabel?: string
  submitLoadingLabel?: string
  showBack?:boolean
}

export function TotpPage({
  title = "Two-factor authentication",
  subtitle = "Enter the 6-digit code from your authenticator app.",
  onSubmit,
  isLoading = false,
  error,
  showBack = true,
  onCancel,
  cancelLabel = "Cancel",
  submitLabel = "Verify",
  submitLoadingLabel = "Verifying...",
}: TotpPageProps) {
  const [code, setCode] = React.useState("")
  const [localError, setLocalError] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      setLocalError("Please enter the full 6-digit code.")
      return
    }
    setLocalError("")
    await onSubmit(code)
  }

  // Auto submit when all 6 digits entered
  React.useEffect(() => {
    if (code.length === 6) {
      setLocalError("")
      onSubmit(code)
    }
  }, [code])

  const displayError = error || localError

  return (
    <AuthLayout showBack={showBack} title={title} subtitle={subtitle}>
      <form onSubmit={handleSubmit}>
       
        <FieldGroup className="flex flex-col items-center gap-4">
          <InputOTP
            maxLength={6}
            value={code}
            onChange={(val) => {
              setCode(val)
              setLocalError("")
            }}
            disabled={isLoading}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {displayError && (
            <span className="text-destructive text-xs text-center">{displayError}</span>
          )}

          <LoadingButton
            type="submit"
            variant="blue"
            className="w-full"
            isLoading={isLoading}
            loadingText={submitLoadingLabel}
          >
            {submitLabel}
          </LoadingButton>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
        </FieldGroup>
       
      </form>
    </AuthLayout>
  )
}