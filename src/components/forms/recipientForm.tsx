import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, CreditCard, Info } from "lucide-react";
import MomoNetworkSelect from "./MomoNetworkSelect";
import { LoadingButton } from "../Elements/Button";

export type DeliveryMethod = "mobile" | "bank";

export interface RecipientFormValues {
  deliveryMethod: DeliveryMethod;
  recipientName?: string;
  recipientPhone?: string;
  recipientBank?: string;
  recipientAccount?: string;
  networkCode?: string;
  networkName?: string;
}

interface Props {
  deliveryMethod: DeliveryMethod;
  defaultValues?: Partial<RecipientFormValues>;
  onSubmit: (values: RecipientFormValues) => void;
  // loading?: boolean;
  ghanaianBanks: string[];
}

export function RecipientForm({
  deliveryMethod,
  defaultValues,
  onSubmit,
  ghanaianBanks,
}: Props) {
  const [form, setForm] = useState({
    recipientName: defaultValues?.recipientName ?? "",
    recipientPhone: defaultValues?.recipientPhone ?? "",
    recipientBank: defaultValues?.recipientBank ?? "",
    recipientAccount: defaultValues?.recipientAccount ?? "",
    networkCode: defaultValues?.networkCode ?? "",
    networkName: defaultValues?.networkName ?? "",
  });

  // Reset when delivery method changes (important!)
  useEffect(() => {
    setForm({
      recipientName: "",
      recipientPhone: "",
      recipientBank: "",
      recipientAccount: "",
      networkCode: "",
      networkName: "",
    });
  }, [deliveryMethod]);

  const update = (patch: Partial<typeof form>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const [loading ,setLoading] = useState(false)
  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault();
setLoading(true)
 await   onSubmit({
      deliveryMethod,
      ...form,
    });
    setLoading(false)
  };

  return (
    <Card className="p-3 sm:p-5 border-2 dark:bg-slate-800 dark:border-slate-700">
      <h3 className="text-sm sm:text-base font-bold mb-4 flex items-center gap-2">
        <User className="w-4 h-4 text-blue-600" />
        Recipient Details
      </h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* MOBILE MONEY */}
        {deliveryMethod === "mobile" && (
          <>
            <div className="flex flex-col gap-1">
              <Label className="font-semibold">Recipient Name</Label>
              <Input
                value={form.recipientName}
                onChange={(e) => update({ recipientName: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label className="font-semibold">Mobile Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  className="pl-10"
                  value={form.recipientPhone}
                  onChange={(e) => update({ recipientPhone: e.target.value })}
                  placeholder="+233 XX XXX XXXX"
                />
              </div>
            </div>

            <MomoNetworkSelect
              value={form.networkCode}
              onChange={(network: any) =>
                update({
                  networkCode: network?.code,
                  networkName: network?.name,
                })
              }
            />
          </>
        )}

        {/* BANK */}
        {deliveryMethod === "bank" && (
          <>
            <div>
              <Label className="font-semibold">Bank</Label>
              <select
                className="w-full h-11 border rounded-lg px-3"
                value={form.recipientBank}
                onChange={(e) =>
                  update({
                    recipientBank: e.target.value,
                    recipientName: "",
                  })
                }
              >
                <option value="">Select Bank</option>
                {ghanaianBanks.map((bank) => (
                  <option key={bank}>{bank}</option>
                ))}
              </select>
            </div>

            <div>
              <Label className="font-semibold">Account Number</Label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  className="pl-10"
                  value={form.recipientAccount}
                  onChange={(e) =>
                    update({ recipientAccount: e.target.value })
                  }
                  placeholder="Enter account number"
                />
              </div>
            </div>
          </>
        )}

        {/* <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-blue-600 text-white rounded-lg font-semibold"
        >
          {loading ? "Saving..." : "Continue"}
        </button> */}

             <LoadingButton
                className="w-full  bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg"
                // onClick={handleNext}
                isLoading={loading}
                type="submit"
             
              >
                <span className=" flex gap-2 items-center ">
                  {" "}
               {loading ? "Saving..." : "Continue"}
                </span>
              </LoadingButton>

      </form>
    </Card>
  );
}
