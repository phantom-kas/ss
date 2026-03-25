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
import Step1 from './send/step1';
import { useNavigate } from '@tanstack/react-router';

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

  const navigate = useNavigate()

  return (<>
     
        
          {/* Step 1: Recipient Details */}
          {step === 1 && (
          

            <Step1 setSendData={setSendData} deliveryMethods={deliveryMethods} ghanaianBanks={ghanaianBanks} EXCHANGE_RATE={EXCHANGE_RATE} sendData={sendData} recentRecipients={recentRecipients} handleNext={(e)=>navigate({to:'/send/'+e+'/verify'})} />

          
          )}
  
    </>
  );
}