import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Smartphone, Building, User, Phone, CreditCard, Info, Zap, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { AppLayout } from './AppLayout';
import { motion, AnimatePresence } from 'motion/react';
import type { Page } from '../App';
import type { RecipientData } from '../App';

interface SendMoneyProps {
  navigateTo: (page: Page, transaction?: any) => void;
  onLogout: () => void;
  prefilledRecipient?: RecipientData | null;
}

export function SendMoney({ navigateTo, onLogout, prefilledRecipient }: SendMoneyProps) {
  // If recipient is prefilled, start at step 2 (amount), otherwise start at step 1
  const [step, setStep] = useState(prefilledRecipient ? 2 : 1);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [sendData, setSendData] = useState({
    deliveryMethod: prefilledRecipient?.deliveryMethod || '',
    amount: '',
    paymentMethod: '',
    recipientName: prefilledRecipient?.recipientName || '',
    recipientPhone: prefilledRecipient?.recipientPhone || '',
    recipientBank: prefilledRecipient?.recipientBank || '',
    recipientAccount: prefilledRecipient?.recipientAccount || '',
  });

  const EXCHANGE_RATE = 11.25;

  // Mock recent recipients data
  const recentRecipients = [
    {
      id: '1',
      name: 'Kwame Mensah',
      phone: '+233 24 567 8901',
      deliveryMethod: 'mobile',
      lastSent: '2 days ago',
      avatar: 'KM'
    },
    {
      id: '2',
      name: 'Abena Osei',
      phone: '+233 55 123 4567',
      deliveryMethod: 'mobile',
      lastSent: '1 week ago',
      avatar: 'AO'
    },
    {
      id: '3',
      name: 'Kofi Asante',
      bank: 'GCB Bank',
      account: '1234567890',
      deliveryMethod: 'bank',
      lastSent: '2 weeks ago',
      avatar: 'KA'
    },
  ];

  const deliveryMethods = [
    { id: 'mobile', name: 'Mobile Money', desc: 'MTN, Vodafone, AirtelTigo', icon: Smartphone, time: 'Instant', fee: 0.5 },
    { id: 'bank', name: 'Bank Transfer', desc: 'Any Ghanaian bank', icon: Building, time: '2-4 hours', fee: 0.5 },
  ];

  const ghanaianBanks = [
    'GCB Bank', 'Ecobank Ghana', 'Stanbic Bank', 'Absa Bank Ghana', 'Fidelity Bank',
    'CalBank', 'Access Bank Ghana', 'Zenith Bank Ghana', 'First National Bank', 'UBA Ghana',
  ];

  const calculateFee = (amount: string) => (parseFloat(amount) * 0.005).toFixed(2);
  const calculateTotal = (amount: string) => (parseFloat(amount) + parseFloat(calculateFee(amount))).toFixed(2);
  const calculateRecipientAmount = (amount: string) => {
    if (!amount) return '0.00';
    return (parseFloat(amount) * EXCHANGE_RATE).toFixed(2);
  };

  // Mock API call to verify and fetch recipient name
  const verifyRecipient = async (deliveryMethod: string, identifier: string) => {
    setIsVerifying(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock name generation based on phone/account number
    const mockNames = [
      'Kwame Mensah', 'Ama Serwaa', 'Kofi Asante', 'Abena Osei',
      'Kwesi Boateng', 'Akosua Adjei', 'Yaw Owusu', 'Efua Agyeman'
    ];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    
    setSendData(prev => ({ ...prev, recipientName: randomName }));
    setIsVerifying(false);
  };

  // Auto-verify when mobile number is entered (10+ digits)
  const handlePhoneChange = (phone: string) => {
    setSendData(prev => ({ ...prev, recipientPhone: phone, recipientName: '' }));
    
    // Trigger verification when phone number is complete (example: +233 XX XXX XXXX = 13+ chars)
    if (phone.length >= 10) {
      verifyRecipient('mobile', phone);
    }
  };

  // Auto-verify when account number is entered and bank is selected
  const handleAccountChange = (account: string) => {
    setSendData(prev => ({ ...prev, recipientAccount: account, recipientName: '' }));
    
    // Trigger verification when account number is complete (typically 10+ digits)
    if (account.length >= 10 && sendData.recipientBank) {
      verifyRecipient('bank', account);
    }
  };

  const handleNext = () => { if (step < 4) setStep(step + 1); };
  const handleBack = () => { if (step > 1) setStep(step - 1); };

  const handleConfirmSend = () => {
    const txId = `SS${Date.now().toString().slice(-8)}`;
    setTransactionId(txId);
    setShowConfirmation(true);
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', desc: 'Visa •••• 4242', icon: CreditCard },
    { id: 'bank', name: 'Bank Account', desc: 'Chase •••• 1234', icon: Building },
  ];

  return (
    <AppLayout navigateTo={navigateTo} currentPage="send" onLogout={onLogout}>
      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-3 sm:px-6 py-3">
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            {[1, 2, 3, 4].map((s, idx) => (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-all ${
                      s < step 
                        ? 'bg-emerald-600 text-white' 
                        : s === step 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-200 dark:ring-blue-400/30' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
                    }`}>
                    {s < step ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : s}
                  </div>
                  <span className={`text-[10px] sm:text-xs font-medium mt-1 sm:mt-1.5 whitespace-nowrap ${
                    step === idx + 1 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : step > idx + 1
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {['Recipient', 'Amount', 'Payment', 'Review'][idx]}
                  </span>
                </div>
                
                {s < 4 && (
                  <div className={`w-10 sm:w-16 h-0.5 mx-1 sm:mx-1.5 ${
                    s < step ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-3 sm:px-4 py-2 sm:py-6 pb-20 md:pb-6 overflow-hidden">
        <AnimatePresence mode="wait">
          {/* Step 1: Recipient Details */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="mb-3 sm:mb-5">
                <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                  <span className="text-xl sm:text-2xl">🇬🇭</span>
                  <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">Send to Ghana</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Choose how the recipient will receive money</p>
              </div>

              {/* Exchange Rate Banner */}
              <Card className="p-2.5 sm:p-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white mb-3 sm:mb-5 border-0 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
                    <span className="text-xs sm:text-sm font-semibold">Live Rate</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-lg sm:text-2xl font-bold">₵{EXCHANGE_RATE}</span>
                    <span className="text-[10px] sm:text-xs text-emerald-100">per USD</span>
                  </div>
                </div>
              </Card>

              {/* Delivery Method Selection */}
              <div className="mb-3 sm:mb-5">
                <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 block">Delivery Method</Label>
                <div className="space-y-2 sm:space-y-3">
                  {deliveryMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSendData({ ...sendData, deliveryMethod: method.id, recipientName: '', recipientPhone: '', recipientBank: '', recipientAccount: '' })}
                      className={`w-full p-3 sm:p-5 rounded-xl border-2 transition-all text-left active:scale-[0.98] ${
                        sendData.deliveryMethod === method.id ? 'border-blue-700 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'border-slate-200 dark:border-slate-700 dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          sendData.deliveryMethod === method.id ? 'bg-blue-700' : 'bg-slate-100 dark:bg-slate-700'
                        }`}>
                          <method.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${sendData.deliveryMethod === method.id ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5 sm:mb-1">{method.name}</p>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{method.desc}</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">{method.time}</span>
                          <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">{method.fee}% fee</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Recipients - Show after delivery method is selected */}
              {sendData.deliveryMethod && recentRecipients.filter(r => r.deliveryMethod === sendData.deliveryMethod).length > 0 && (
                <Card className="p-3 sm:p-4 mb-3 sm:mb-5 dark:bg-slate-800 dark:border-slate-700 border-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
                    Recent Recipients
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">Select from your recent transfers</p>
                  <div className="space-y-2">
                    {recentRecipients
                        .filter(r => r.deliveryMethod === sendData.deliveryMethod)
                        .map((recipient) => (
                          <button
                            key={recipient.id}
                            onClick={() => {
                              if (recipient.deliveryMethod === 'mobile') {
                                setSendData({
                                  ...sendData,
                                  recipientName: recipient.name,
                                  recipientPhone: recipient.phone!,
                                });
                              } else if (recipient.deliveryMethod === 'bank') {
                                setSendData({
                                  ...sendData,
                                  recipientName: recipient.name,
                                  recipientBank: recipient.bank!,
                                  recipientAccount: recipient.account!,
                                });
                              }
                            }}
                            className="w-full p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all text-left group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {recipient.avatar}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">{recipient.name}</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                                  {recipient.deliveryMethod === 'mobile' ? recipient.phone : `${recipient.bank} • ${recipient.account}`}
                                </p>
                              </div>
                              <div className="flex-shrink-0 text-right">
                                <p className="text-xs text-slate-500 dark:text-slate-400">{recipient.lastSent}</p>
                                <div className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                  Select →
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-center text-slate-500 dark:text-slate-400">Or enter new recipient details below</p>
                  </div>
                </Card>
              )}

              {/* Recipient Details - Show after delivery method is selected */}
              {sendData.deliveryMethod && (
                <Card className="p-3 sm:p-5 mb-3 sm:mb-5 dark:bg-slate-800 dark:border-slate-700 border-2">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                    Recipient Details
                  </h3>
                  <div className="space-y-3 sm:space-y-4">
                    {sendData.deliveryMethod === 'mobile' && (
                      <div>
                        <Label htmlFor="recipientPhone" className="text-xs sm:text-sm mb-1.5 sm:mb-2 block dark:text-slate-300 font-semibold">
                          Mobile Money Number
                        </Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500" />
                          <Input
                            id="recipientPhone"
                            placeholder="+233 XX XXX XXXX"
                            className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500"
                            value={sendData.recipientPhone}
                            onChange={(e) => handlePhoneChange(e.target.value)}
                          />
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2 flex items-center gap-1.5">
                          <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          Enter the mobile money number (MTN, Vodafone Cash, or AirtelTigo)
                        </p>
                      </div>
                    )}

                    {sendData.deliveryMethod === 'bank' && (
                      <>
                        <div>
                          <Label htmlFor="recipientBank" className="text-xs sm:text-sm mb-1.5 sm:mb-2 block dark:text-slate-300 font-semibold">
                            Bank Name
                          </Label>
                          <div className="relative">
                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 z-10" />
                            <select
                              id="recipientBank"
                              className="w-full pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                              value={sendData.recipientBank}
                              onChange={(e) => {
                                setSendData({ ...sendData, recipientBank: e.target.value, recipientName: '' });
                                // Re-verify if account number exists
                                if (sendData.recipientAccount.length >= 10) {
                                  verifyRecipient('bank', sendData.recipientAccount);
                                }
                              }}
                            >
                              <option value="">Select a bank</option>
                              {ghanaianBanks.map(bank => (
                                <option key={bank} value={bank}>{bank}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="recipientAccount" className="text-xs sm:text-sm mb-1.5 sm:mb-2 block dark:text-slate-300 font-semibold">
                            Account Number
                          </Label>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500" />
                            <Input
                              id="recipientAccount"
                              placeholder="Enter account number"
                              className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500"
                              value={sendData.recipientAccount}
                              onChange={(e) => handleAccountChange(e.target.value)}
                            />
                          </div>
                          <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2 flex items-center gap-1.5">
                            <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            Enter the bank account number
                          </p>
                        </div>
                      </>
                    )}

                    {/* Verified Name Display */}
                    {(sendData.recipientPhone.length >= 10 || (sendData.recipientAccount.length >= 10 && sendData.recipientBank)) && (
                      <div className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
                        isVerifying 
                          ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30' 
                          : sendData.recipientName 
                          ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900'
                      }`}>
                        <Label className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5 sm:mb-2 block">
                          {isVerifying ? 'Verifying...' : 'Verified Account Name'}
                        </Label>
                        {isVerifying ? (
                          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                            <span className="text-xs sm:text-sm font-medium">Looking up account details...</span>
                          </div>
                        ) : sendData.recipientName ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">{sendData.recipientName}</p>
                              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                                Registered name on {sendData.deliveryMethod === 'mobile' ? 'mobile money account' : sendData.recipientBank}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                            Complete the {sendData.deliveryMethod === 'mobile' ? 'phone number' : 'account details'} to verify
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              )}

              <Button
                className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg"
                onClick={handleNext}
                disabled={
                  !sendData.deliveryMethod || 
                  !sendData.recipientName ||
                  isVerifying ||
                  (sendData.deliveryMethod === 'mobile' && !sendData.recipientPhone) ||
                  (sendData.deliveryMethod === 'bank' && (!sendData.recipientBank || !sendData.recipientAccount))
                }
              >
                Continue <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step 2: Amount */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {/* Recipient Info Banner - Show when prefilled */}
              {prefilledRecipient && (
                <Card className="p-3 mb-4 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white border-0 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-emerald-100 mb-0.5">Sending to</div>
                      <div className="font-bold text-base truncate">{sendData.recipientName}</div>
                      <div className="text-xs text-emerald-100 truncate">
                        {sendData.deliveryMethod === 'mobile' ? sendData.recipientPhone : `${sendData.recipientBank} • ${sendData.recipientAccount}`}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setStep(1);
                      }}
                      className="text-xs text-white hover:text-emerald-100 underline flex-shrink-0"
                    >
                      Change
                    </button>
                  </div>
                </Card>
              )}
              
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white mb-1">How much to send?</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Enter the amount in USD</p>
              </div>

              <Card className="p-4 sm:p-6 mb-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
                <div className="mb-6">
                  <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3 block">You Send</Label>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-3xl sm:text-4xl md:text-5xl text-slate-900 dark:text-white font-bold">$</span>
                      <Input
                        type="number"
                        placeholder="0"
                        className="border-0 bg-transparent p-0 h-auto text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none flex-1"
                        value={sendData.amount}
                        onChange={(e) => setSendData({ ...sendData, amount: e.target.value })}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-medium">USD</span>
                      <span>•</span>
                      <span className="text-xs">United States Dollar</span>
                    </div>
                  </div>
                </div>

                {sendData.amount && parseFloat(sendData.amount) > 0 ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-slate-200 dark:border-slate-700"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <div className="bg-blue-600 dark:bg-blue-500 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-md">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3 block">
                        {sendData.recipientName} Gets
                      </Label>
                      <div className="flex items-baseline gap-3 mb-2">
                        <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-600 dark:text-emerald-400">
                          ₵{calculateRecipientAmount(sendData.amount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="font-medium">GHS</span>
                        <span>•</span>
                        <span className="text-xs">Ghanaian Cedi 🇬🇭</span>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-emerald-50 dark:from-blue-950/30 dark:to-emerald-950/30 rounded-xl p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Exchange Rate</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">1 USD = ₵{EXCHANGE_RATE}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                        <Zap className="w-3 h-3 fill-emerald-600 dark:fill-emerald-400" />
                        <span className="font-medium">Live rate • Updates every minute</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <ArrowRight className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Enter an amount to see conversion</p>
                  </div>
                )}
              </Card>

              <div className="mb-4">
                <Label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-3 block">Quick Select</Label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[100, 250, 500, 1000, 2500, 5000].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSendData({ ...sendData, amount: amount.toString() })}
                      className={`group relative p-3 sm:p-4 border-2 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                        sendData.amount === amount.toString() 
                          ? 'border-blue-600 dark:border-blue-500 bg-blue-600 dark:bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/50' 
                          : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
                      }`}
                    >
                      <div className="text-sm sm:text-base">${amount.toLocaleString()}</div>
                      <div className={`text-[10px] sm:text-xs mt-0.5 ${
                        sendData.amount === amount.toString()
                          ? 'text-blue-100'
                          : 'text-slate-500 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                      }`}>
                        ≈ ₵{(amount * EXCHANGE_RATE).toLocaleString()}
                      </div>
                    </button>
                  ))}</div>
              </div>

              {sendData.amount && parseFloat(sendData.amount) > 0 && (
                <Card className="p-4 mb-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <div className="space-y-2.5 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 dark:text-slate-400">Transfer amount</span>
                      <span className="font-semibold text-slate-900 dark:text-white">${sendData.amount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-600 dark:text-slate-400">Transfer fee</span>
                        <Info className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      </div>
                      <span className="font-semibold text-slate-900 dark:text-white">${calculateFee(sendData.amount)}</span>
                    </div>
                    <div className="h-px bg-slate-300 dark:bg-slate-700"></div>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-900 dark:text-white">Total to pay</span>
                      <span className="font-bold text-lg text-slate-900 dark:text-white">${calculateTotal(sendData.amount)}</span>
                    </div>
                  </div>
                </Card>
              )}

              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-3 mb-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
                      <Info className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-blue-900 dark:text-blue-200 mb-0.5">Transparent pricing</h4>
                    <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                      Only 0.5% fee with no hidden charges. {sendData.recipientName} gets the exact amount shown.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleBack} 
                  className="h-12 px-6 dark:border-slate-700 dark:hover:bg-slate-800 border-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  className="flex-1 h-12 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
                  onClick={handleNext}
                  disabled={!sendData.amount || parseFloat(sendData.amount) <= 0}
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment Method */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">How will you pay?</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Choose your payment method</p>
              </div>

              {/* Transaction Summary */}
              <Card className="p-4 mb-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">You Pay</div>
                    <div className="text-xl font-bold text-slate-900 dark:text-white">${calculateTotal(sendData.amount)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">{sendData.recipientName} Gets</div>
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">₵{calculateRecipientAmount(sendData.amount)}</div>
                  </div>
                </div>
              </Card>

              <Card className="p-4 sm:p-5 mb-4 dark:bg-slate-800 dark:border-slate-700">
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSendData({ ...sendData, paymentMethod: method.id })}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left active:scale-[0.98] ${
                        sendData.paymentMethod === method.id ? 'border-blue-700 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md' : 'border-slate-200 dark:border-slate-700 dark:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          sendData.paymentMethod === method.id ? 'bg-blue-700' : 'bg-slate-100 dark:bg-slate-700'
                        }`}>
                          <method.icon className={`w-6 h-6 ${sendData.paymentMethod === method.id ? 'text-white' : 'text-slate-600 dark:text-slate-300'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{method.name}</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{method.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="h-12 px-6 dark:border-slate-700 dark:hover:bg-slate-800 border-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  className="flex-1 h-12 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-base font-semibold shadow-lg"
                  onClick={handleNext}
                  disabled={!sendData.paymentMethod}
                >
                  Review Transfer <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-1">Review & Confirm</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Check all details before sending</p>
              </div>

              {/* Amount Summary */}
              <Card className="p-4 sm:p-5 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-700 dark:to-blue-900 text-white mb-3 border-0">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-blue-100 mb-1">You Send</div>
                    <div className="text-2xl sm:text-3xl font-bold">${sendData.amount}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-blue-100 mb-1">They Get 🇬🇭</div>
                    <div className="text-2xl sm:text-3xl font-bold">₵{calculateRecipientAmount(sendData.amount)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-100">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Rate: 1 USD = ₵{EXCHANGE_RATE} GHS</span>
                </div>
              </Card>

              {/* Transfer Details */}
              <Card className="p-4 mb-3 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Transfer Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Destination</span>
                    <span className="text-slate-900 dark:text-white font-medium">Ghana 🇬🇭</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Delivery Method</span>
                    <span className="text-slate-900 dark:text-white font-medium">{deliveryMethods.find(m => m.id === sendData.deliveryMethod)?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Arrival Time</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{deliveryMethods.find(m => m.id === sendData.deliveryMethod)?.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Fee</span>
                    <span className="text-slate-900 dark:text-white font-medium">${calculateFee(sendData.amount)}</span>
                  </div>
                  <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                  <div className="flex justify-between">
                    <span className="text-slate-900 dark:text-white font-bold">Total Cost</span>
                    <span className="text-slate-900 dark:text-white font-bold text-base">${calculateTotal(sendData.amount)}</span>
                  </div>
                </div>
              </Card>

              {/* Recipient Details */}
              <Card className="p-4 mb-3 dark:bg-slate-800 dark:border-slate-700">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Recipient in Ghana</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-400">Verified Name</span>
                    <span className="text-slate-900 dark:text-white font-medium">{sendData.recipientName}</span>
                  </div>
                  {sendData.deliveryMethod === 'mobile' && sendData.recipientPhone && (
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Mobile Money</span>
                      <span className="text-slate-900 dark:text-white font-medium">{sendData.recipientPhone}</span>
                    </div>
                  )}
                  {sendData.deliveryMethod === 'bank' && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Bank</span>
                        <span className="text-slate-900 dark:text-white font-medium">{sendData.recipientBank}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Account</span>
                        <span className="text-slate-900 dark:text-white font-mono text-xs">{sendData.recipientAccount}</span>
                      </div>
                    </>
                  )}
                </div>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={handleBack} className="h-12 px-6 dark:border-slate-700 dark:hover:bg-slate-800 border-2">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button
                  className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-base font-semibold shadow-lg"
                  onClick={handleConfirmSend}
                >
                  Confirm & Send <CheckCircle2 className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] mx-auto dark:bg-slate-800 dark:border-slate-700">
          <DialogTitle className="sr-only">Transfer Successful</DialogTitle>
          <DialogDescription className="sr-only">
            Your transfer to {sendData.recipientName} has been completed successfully
          </DialogDescription>

          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>

          <div className="text-center mb-3">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
              Transfer Successful!
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Money is on its way to {sendData.recipientName}
            </p>
          </div>

          <Card className="p-2.5 mb-3 bg-slate-50 dark:bg-slate-900 dark:border-slate-700">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs text-slate-600 dark:text-slate-400">Transaction ID</span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                {transactionId}
              </span>
            </div>
          </Card>

          <Card className="p-3 mb-3 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white border-0">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-[10px] text-emerald-100 mb-0.5">You Sent</div>
                <div className="text-xl font-bold">${sendData.amount}</div>
              </div>
              <div className="text-2xl">→</div>
              <div className="text-right">
                <div className="text-[10px] text-emerald-100 mb-0.5">They Get</div>
                <div className="text-xl font-bold">₵{calculateRecipientAmount(sendData.amount)}</div>
              </div>
            </div>
            <div className="h-px bg-white/20 mb-2"></div>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-emerald-100">
              <div>
                <div className="text-emerald-200 mb-0.5">Rate</div>
                <div className="text-white font-semibold">₵{EXCHANGE_RATE}</div>
              </div>
              <div>
                <div className="text-emerald-200 mb-0.5">Fee</div>
                <div className="text-white font-semibold">${calculateFee(sendData.amount)}</div>
              </div>
              <div className="text-right">
                <div className="text-emerald-200 mb-0.5">Total</div>
                <div className="text-white font-bold">${calculateTotal(sendData.amount)}</div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Recipient</div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{sendData.recipientName}</div>
            </div>
            <div className="p-2.5 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Delivery</div>
              <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {deliveryMethods.find(m => m.id === sendData.deliveryMethod)?.time}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className="w-full bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-10"
              onClick={() => {
                setShowConfirmation(false);
                navigateTo('dashboard');
              }}
            >
              Done
            </Button>
            <Button
              variant="outline"
              className="w-full h-10 dark:border-slate-700 dark:hover:bg-slate-700"
              onClick={() => {
                setShowConfirmation(false);
                navigateTo('transactions');
              }}
            >
              View Details
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}