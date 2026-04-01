import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface BankAccount {
  guid:        string;
  institution: string | null;
  name:        string | null;
  subtype:     string | null;
  mask:        string | null;
  isVerified:  boolean;
}

interface SendState {
  // Selected funding source
  selectedBankAccount: BankAccount | null;

  // Amount the user wants to send
  amount: number | null;

  // Recipient id selected in step 1
  recipientId: string | null;

  // Rate snapshot shown on review screen
  rate: {
    marketRate:    number;
    spreadPercent: number;
    finalRate:     number;
  } | null;

  // Actions
  setSelectedBankAccount: (account: BankAccount | null) => void;
  setAmount:              (amount: number | null) => void;
  setRecipientId:         (id: string | null) => void;
  setRate:                (rate: SendState['rate']) => void;
  resetSend:              () => void;
}

const initialState = {
  selectedBankAccount: null,
  amount:              null,
  recipientId:         null,
  rate:                null,
};

export const useSendStore = create<SendState>()(
  persist(
    (set) => ({
      ...initialState,

      setSelectedBankAccount: (account) =>
        set({ selectedBankAccount: account }),

      setAmount: (amount) =>
        set({ amount }),

      setRecipientId: (id) =>
        set({ recipientId: id }),

      setRate: (rate) =>
        set({ rate }),

      // Call this after a successful send or when the user cancels
      resetSend: () => set(initialState),
    }),
    {
      name:    'send-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Actions callable outside components
export const sendActions = {
  setSelectedBankAccount: (account: BankAccount | null) =>
    useSendStore.setState({ selectedBankAccount: account }),

  setAmount: (amount: number | null) =>
    useSendStore.setState({ amount }),

  setRecipientId: (id: string | null) =>
    useSendStore.setState({ recipientId: id }),

  setRate: (rate: SendState['rate']) =>
    useSendStore.setState({ rate }),

  resetSend: () =>
    useSendStore.setState(initialState),

  get: () => useSendStore.getState(),
};