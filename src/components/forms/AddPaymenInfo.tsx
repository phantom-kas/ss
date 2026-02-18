import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { DeliveryMethodSelector } from "../forms/PaymentOptions";
import { RecipientForm, RecipientFormValues } from "../forms/recipientForm";
import { LoadingButton } from "../Elements/Button";
import api from "@/lib/axios";
import { toast } from "sonner";
import { showError } from "@/lib/error";
import { DeliveryMethod } from "@/types/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ghanaianBanks: any[];
  onSaved?: (wallet: any) => void;
};

export default function AddPayoutMethodDialog({
  open,
  onOpenChange,
  ghanaianBanks,
  onSaved,
}: Props) {
  const [deliveryMethod, setDeliveryMethod] = useState<string>();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: RecipientFormValues) => {
    if (!deliveryMethod) {
      toast.error("Select a payment method");
      return;
    }

    const payload = {
      deliveryMethod,
      name: values.recipientName,
      phone: values.recipientPhone || null,
      bank: values.recipientBank || null,
      account: values.recipientAccount || null,
      networkCode: values.networkCode || null,
      networkName: values.networkName || null,
      isSelf: true, // 👈 mark as user's own wallet
    };

    try {
      setLoading(true);

      const res = await api.post("/user/payout-methods", payload);

      toast.success("Payment method added");

      onSaved?.(res.data.data);

      // reset state
      setDeliveryMethod(undefined);
      onOpenChange(false);
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="sm:max-w-lg overflow-auto h-screen">
        <DialogHeader>
          <DialogTitle>Add Your Payment Details</DialogTitle>
          <DialogDescription>
            This is where we will send money to you.
          </DialogDescription>
        </DialogHeader>

        {/* Step 1 — Choose Method */}
        <div className="mb-4">
          <DeliveryMethodSelector
            value={deliveryMethod as DeliveryMethod}
            onChange={setDeliveryMethod}
          />
        </div>

        {/* Step 2 — Enter Details */}
        {deliveryMethod && (
          <RecipientForm
            deliveryMethod={deliveryMethod as DeliveryMethod}
            ghanaianBanks={ghanaianBanks}
            onSubmit={handleSubmit}
          />
        )}

        {/* Footer */}
        <LoadingButton
          className="w-full mt-4"
          isLoading={loading}
          disabled={!deliveryMethod}
          type="submit"
          form="recipient-form"
        >
          Save Payment Method
        </LoadingButton>
      </DialogContent>
    </Dialog>
  );
}
