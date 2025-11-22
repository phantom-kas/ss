import { useState } from 'react';
import { ArrowLeft, CreditCard, Plus, Building2, MoreVertical, CheckCircle2, X, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { AppLayout } from './AppLayout';
import type { Page } from '../App';

interface PaymentMethodsProps {
  navigateTo: (page: Page) => void;
  onLogout: () => void;
}

export function PaymentMethods({ navigateTo, onLogout }: PaymentMethodsProps) {
  const [activeTab, setActiveTab] = useState<'cards' | 'banks'>('cards');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addMethodType, setAddMethodType] = useState<'card' | 'bank'>('card');

  // Form states
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
  });

  const [bankData, setBankData] = useState({
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking',
  });

  const openAddDialog = (type: 'card' | 'bank') => {
    setAddMethodType(type);
    setShowAddDialog(true);
  };

  const handleAddPaymentMethod = () => {
    // Here you would typically save the payment method
    console.log('Adding payment method:', addMethodType);
    setShowAddDialog(false);
    // Reset forms
    setCardData({ cardNumber: '', cardName: '', expiryDate: '', cvv: '' });
    setBankData({ bankName: '', accountNumber: '', routingNumber: '', accountType: 'checking' });
  };

  return (
    <AppLayout navigateTo={navigateTo} currentPage="payment-methods" onLogout={onLogout}>
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-3 sm:py-6 pb-20 md:pb-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => navigateTo('settings')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">Payment Methods</h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Manage your payment options</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('cards')}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'cards'
                ? 'bg-blue-700 text-white dark:bg-blue-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setActiveTab('banks')}
            className={`px-4 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === 'banks'
                ? 'bg-blue-700 text-white dark:bg-blue-600'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            Bank Accounts
          </button>
        </div>

        {/* Cards Tab */}
        {activeTab === 'cards' && (
          <div className="space-y-3">
            {/* Add Card Button */}
            <Card 
              onClick={() => openAddDialog('card')}
              className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all cursor-pointer dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Add New Card</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Visa, Mastercard, or American Express</p>
                </div>
              </div>
            </Card>

            {/* Existing Cards */}
            <Card className="p-4 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Visa •••• 4242</p>
                    <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] rounded-full font-medium">
                      Default
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Expires 12/25</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">John Doe</p>
                </div>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </button>
              </div>
            </Card>

            <Card className="p-4 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Mastercard •••• 8888</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Expires 03/26</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">John Doe</p>
                </div>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Bank Accounts Tab */}
        {activeTab === 'banks' && (
          <div className="space-y-3">
            {/* Add Bank Button */}
            <Card 
              onClick={() => openAddDialog('bank')}
              className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all cursor-pointer dark:bg-slate-800"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Link Bank Account</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Connect via Plaid or manual entry</p>
                </div>
              </div>
            </Card>

            {/* Existing Banks */}
            <Card className="p-4 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-blue-700 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Chase Bank</p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Checking •••• 1234</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Connected 3 months ago</p>
                </div>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </button>
              </div>
            </Card>

            <Card className="p-4 dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Wells Fargo</p>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">Savings •••• 5678</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Connected 1 month ago</p>
                </div>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <MoreVertical className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                </button>
              </div>
            </Card>
          </div>
        )}

        {/* Security Notice */}
        <Card className="p-4 sm:p-6 mt-4 bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">Your payments are secure</h3>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                All payment information is encrypted and stored securely. We never share your details with third parties without your consent.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a new payment method to your account. Choose the type of payment method you want to add.
          </DialogDescription>

          {/* Card Form */}
          {addMethodType === 'card' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="4242 4242 4242 4242"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardData.cardName}
                  onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  value={cardData.expiryDate}
                  onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={cardData.cvv}
                  onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Bank Form */}
          {addMethodType === 'bank' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  placeholder="Chase Bank"
                  value={bankData.bankName}
                  onChange={(e) => setBankData({ ...bankData, bankName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Account Number</Label>
                <Input
                  id="accountNumber"
                  placeholder="1234567890"
                  value={bankData.accountNumber}
                  onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  placeholder="123456789"
                  value={bankData.routingNumber}
                  onChange={(e) => setBankData({ ...bankData, routingNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountType">Account Type</Label>
                <select
                  id="accountType"
                  value={bankData.accountType}
                  onChange={(e) => setBankData({ ...bankData, accountType: e.target.value })}
                >
                  <option value="checking">Checking</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="text-sm font-medium"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddPaymentMethod}
              className="text-sm font-medium"
            >
              Add Payment Method
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}