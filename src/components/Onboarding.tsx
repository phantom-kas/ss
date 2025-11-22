import { useState } from 'react';
import { Star, Upload, CreditCard, DollarSign, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Progress } from './ui/progress';

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-emerald-50/30 to-blue-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-2xl p-6 shadow-xl dark:bg-slate-800 dark:border-slate-700">
        <div className="mb-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-700 to-blue-900 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-slate-900 dark:text-white font-semibold">StableSend</span>
          </div>
          <Progress value={progress} className="mb-3 h-2" />
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm">Step {step} of {totalSteps}</p>
        </div>

        {step === 1 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-blue-700 dark:text-blue-400" />
            </div>
            <h2 className="text-slate-900 dark:text-white mb-2 text-xl">Verify Your Identity</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              To comply with regulations and keep your account secure, we need to verify your identity.
            </p>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 mb-6">
              <h3 className="text-slate-900 dark:text-white mb-3 text-sm font-medium">You'll need:</h3>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Government-issued ID</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm">Proof of address</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-slate-700 dark:text-slate-300 text-sm">A selfie for verification</span>
                </div>
              </div>
            </div>
            <Button onClick={nextStep} className="bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-9">
              Start Verification <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-3">Your information is encrypted and secure</p>
          </div>
        )}

        {step === 2 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-slate-900 dark:text-white mb-2 text-xl">Link Payment Method</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Connect your preferred payment method to start sending money.
            </p>
            <div className="space-y-3 mb-6">
              <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-700 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-blue-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <CreditCard className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-slate-900 dark:text-white text-sm font-medium">Debit/Credit Card</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">Visa, Mastercard, Amex</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                </div>
              </Card>
              <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-700 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-blue-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="text-slate-900 dark:text-white text-sm font-medium">Bank Account</h3>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">Link your bank account</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                </div>
              </Card>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(step - 1)} className="h-9 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600">
                Back
              </Button>
              <Button onClick={nextStep} className="flex-1 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-9">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-slate-900 dark:text-white mb-2 text-xl">Set Preferred Currency</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
              Choose your default currency. You can always change this later.
            </p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { code: 'USD', name: 'US Dollar', symbol: '$' },
                { code: 'EUR', name: 'Euro', symbol: '€' },
                { code: 'GBP', name: 'British Pound', symbol: '£' },
                { code: 'USDT', name: 'Tether', symbol: '₮' },
              ].map((currency) => (
                <Card key={currency.code} className="p-3 hover:shadow-md transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-700 dark:bg-slate-700 dark:border-slate-600 dark:hover:border-blue-500">
                  <div className="text-center">
                    <div className="text-2xl text-slate-900 dark:text-white mb-1">{currency.symbol}</div>
                    <p className="text-slate-900 dark:text-white text-sm font-medium">{currency.code}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">{currency.name}</p>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep(step - 1)} className="h-9 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:hover:bg-slate-600">
                Back
              </Button>
              <Button onClick={onComplete} className="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 h-9">
                Complete Setup <CheckCircle2 className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}