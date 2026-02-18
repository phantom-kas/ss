import {
  ArrowRight,
  CheckCircle2,
  Building,
  User,
  Phone,
  CreditCard,
  Info,
  Zap,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

import { motion } from "motion/react";
import { useState } from "react";
import MomoNetworkSelect from "../forms/MomoNetworkSelect";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/axios";
import { showError } from "@/lib/error";
import { LoadingButton } from "../Elements/Button";
import { RecentRecipients } from "../recipients";
import { RecentRecipientsVertical } from "../recipients2";
import { RecipientForm, RecipientFormValues } from "../forms/recipientForm";
import { DeliveryMethodSelector } from "../forms/PaymentOptions";

const Step1 = ({
  setSendData,
  deliveryMethods,
  ghanaianBanks,
  EXCHANGE_RATE,
  sendData,
  recentRecipients,
  handleNext,
}: {
  setSendData: any;
  deliveryMethods: any;
  ghanaianBanks: any;
  EXCHANGE_RATE: any;
  sendData: any;
  recentRecipients: any;
  handleNext: any;
}) => {
  const handlePhoneChange = (phone: string) => {
    setSendData((prev) => ({
      ...prev,
      recipientPhone: phone,
      recipientId: undefined,
      recipientName: "",
    }));

    // Trigger verification when phone number is complete (example: +233 XX XXX XXXX = 13+ chars)
    if (phone.length >= 10) {
      verifyRecipient("mobile", phone);
    }
  };
  const handleNameChange = (e: string) => {
    setSendData((prev) => ({
      ...prev,
      recipientId: undefined,
      recipientName: e,
    }));
  };
  const verifyRecipient = async (
    deliveryMethod: string,
    identifier: string,
  ) => {
    setIsVerifying(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock name generation based on phone/account number
    const mockNames = [
      "Kwame Mensah",
      "Ama Serwaa",
      "Kofi Asante",
      "Abena Osei",
      "Kwesi Boateng",
      "Akosua Adjei",
      "Yaw Owusu",
      "Efua Agyeman",
    ];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];

    setSendData((prev) => ({ ...prev, recipientName: randomName }));
    setIsVerifying(false);
  };
  const handleAccountChange = (account: string) => {
    setSendData((prev) => ({
      ...prev,
      recipientAccount: account,
      recipientId: undefined,
      recipientName: "",
    }));
    // Trigger verification when account number is complete (typically 10+ digits)
    if (account.length >= 10 && sendData.recipientBank) {
      verifyRecipient("bank", account);
    }
  };

  const [isVerifying, setIsVerifying] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data:any) => {
    // e.preventDefault();
    if (data.recipientId) {
      handleNext();
      return;
    }
    setLoading(true);
    // Validation
    
    if (!sendData.deliveryMethod)
      return toast.error("Select a delivery method");
    if (!data.recipientName)
      return toast.error("Recipient name is required");
    if (data.deliveryMethod === "mobile" && !data.recipientPhone)
      return toast.error("Enter recipient's mobile number");
    if (
      data.deliveryMethod === "bank" &&
      (!data.recipientBank || !data.recipientAccount)
    )
      return toast.error("Enter recipient's bank details");

    const recipientPayload = {
      deliveryMethod: sendData.deliveryMethod,
      
      name: data.recipientName,
      phone: data.recipientPhone || null,
      bank: data.recipientBank || null,
      account: data.recipientAccount || null,
      networkCode: data.networkCode || null,
      networkName: data.networkName || null,
    };

    try {
      const res = await api.post("/recipients/add-raw", recipientPayload);

      setSendData(old=>{return {...old,
        recipientId:res.data.data.id,
         recipientName: data.recipientName,
                recipientPhone: data.recipientPhone,
      }})
      toast.success("Saved Successfully");
      handleNext();
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      // onSubmit={handleSubmit}
    >
      <div className="mb-3 sm:mb-5">
        <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
          <span className="text-xl sm:text-2xl">🇬🇭</span>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white">
            Send to Ghana
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Choose how the recipient will receive money
        </p>
      </div>
      {/* Exchange Rate Banner */}
      <Card className="p-2.5 sm:p-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-emerald-600 dark:to-emerald-700 text-white mb-3 sm:mb-5 border-0 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 fill-white" />
            <span className="text-xs sm:text-sm font-semibold">Live Rate</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg sm:text-2xl font-bold">
              ₵{EXCHANGE_RATE}
            </span>
            <span className="text-[10px] sm:text-xs text-emerald-100">
              per USD
            </span>
          </div>
        </div>
      </Card>

     
      {/* Delivery Method Selection */}
      
    <DeliveryMethodSelector value={sendData.deliveryMethod} onChange={e=>setSendData({...sendData,deliveryMethod: e})}/>
    
     
  {sendData.deliveryMethod && (

      <RecentRecipientsVertical deliveryMethod={
            sendData.deliveryMethod === "mobile"
              ? "mobile_money"
              : sendData.deliveryMethod
          }     onSelect={function (recipient: any): void {
            console.log(recipient);
            if (recipient.method === "mobile_money") {
              setSendData({
                ...sendData,
                recipientId: recipient.id,
                recipientName: recipient.full_name,
                recipientPhone: "xxxxxxxx" + recipient.momo_number,
              });
            } else if (recipient.deliveryMethod === "bank") {
              setSendData({
                ...sendData,
                recipientName: recipient.name,
                recipientBank: recipient.bank_name!,
                recipientAccount: recipient.account_number!,
              });
            }
          }}/> )}
      {/* Recipient Details - Show after delivery method is selected */}
      {sendData.deliveryMethod && !sendData.recipientName && (
       <RecipientForm deliveryMethod={sendData.deliveryMethod} 
      onSubmit={(values) => {
    console.log("FORM VALUES:", values);
    handleSubmit(values);
  }} ghanaianBanks={[]}/>
      )}


      

      {(sendData.recipientPhone.length >= 10 ||
        (sendData.recipientAccount.length >= 10 && sendData.recipientBank)) && (
        <Card className="p-3 sm:p-5 mb-3 sm:mb-5 dark:bg-slate-800 dark:border-slate-700 border-2">
          {" "}
          <motion.div
          key={sendData.recipientId}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`p-3 sm:p-4 rounded-lg border-2 transition-all ${
              isVerifying
                ? "border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30"
                : sendData.recipientName
                  ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30"
                  : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900"
            }`}
          >
            <Label className="text-[10px] sm:text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5 sm:mb-2 block">
              {isVerifying ? "Verifying..." : "Verified Account Name"}
            </Label>
            {isVerifying ? (
              <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="text-xs sm:text-sm font-medium">
                  Looking up account details...
                </span>
              </div>
            ) : sendData.recipientName ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {sendData.recipientName}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Registered name on{" "}
                    {sendData.deliveryMethod === "mobile"
                      ? "mobile money account"
                      : sendData.recipientBank}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Complete the{" "}
                {sendData.deliveryMethod === "mobile"
                  ? "phone number"
                  : "account details"}{" "}
                to verify
              </p>
            )}
          </motion.div>

            <button
        className="w-full text-white  bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg"
        onClick={()=>setSendData((prev:any) => ({
      ...prev,
      recipientAccount: undefined,
      recipientId: undefined,
      recipientName: undefined,
    }))}
        // isLoading={loading}
        type="button"
      
      >
      
          Cancel
        {/* </span> */}
      </button>
        </Card>
      )}
      <LoadingButton
        className="w-full  bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg"
        // onClick={handleNext}
        isLoading={loading}
        type="submit"
        onClick={_e=>handleNext()}
        disabled={
          !sendData.deliveryMethod ||
          !sendData.recipientName ||
          isVerifying ||
          (sendData.deliveryMethod === "mobile" && !sendData.recipientPhone) ||
          (sendData.deliveryMethod === "bank" &&
            (!sendData.recipientBank || !sendData.recipientAccount))
        }
      >
        <span className=" flex gap-2 items-center ">
          {" "}
          Continue <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
        </span>
      </LoadingButton>
      {/* <Butto */}
    </motion.div>
  );
};

export default Step1;
