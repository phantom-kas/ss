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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (sendData.recipientId) {
      handleNext();
      return;
    }
    setLoading(true);
    // Validation
    if (!sendData.deliveryMethod)
      return toast.error("Select a delivery method");
    if (!sendData.recipientName)
      return toast.error("Recipient name is required");
    if (sendData.deliveryMethod === "mobile" && !sendData.recipientPhone)
      return toast.error("Enter recipient's mobile number");
    if (
      sendData.deliveryMethod === "bank" &&
      (!sendData.recipientBank || !sendData.recipientAccount)
    )
      return toast.error("Enter recipient's bank details");

    const recipientPayload = {
      deliveryMethod: sendData.deliveryMethod,
      name: sendData.recipientName,
      phone: sendData.recipientPhone || null,
      bank: sendData.recipientBank || null,
      account: sendData.recipientAccount || null,
      networkCode: sendData.networkCode || null,
      networkName: sendData.networkName || null,
    };

    try {
      await api.post("/recipients/add-raw", recipientPayload);
      toast.success("Saved Successfully");
      handleNext();
    } catch (err) {
      showError(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <motion.form
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onSubmit={handleSubmit}
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
      <div className="mb-3 sm:mb-5">
        <Label className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 block">
          Delivery Method
        </Label>
        <div className="space-y-2 sm:space-y-3">
          {deliveryMethods.map((method) => (
            <button
              type="button"
              key={method.id}
              onClick={() =>
                setSendData({
                  ...sendData,
                  deliveryMethod: method.id,
                  recipientName: "",
                  recipientPhone: "",
                  recipientBank: "",
                  recipientAccount: "",
                })
              }
              disabled={method.id === "bank"}
              className={cn(
                `w-full p-3 sm:p-5 rounded-xl border-2 transition-all text-left  ${
                  sendData.deliveryMethod === method.id
                    ? "border-blue-700 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md"
                    : "border-slate-200 dark:border-slate-700 dark:bg-slate-800 "
                }`,
                method.id === "bank"
                  ? " opacity-60  "
                  : " hover:border-slate-300 dark:hover:border-slate-600 active:scale-[0.98] ",
              )}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <div
                  className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    sendData.deliveryMethod === method.id
                      ? "bg-blue-700"
                      : "bg-slate-100 dark:bg-slate-700"
                  }`}
                >
                  <method.icon
                    className={`w-6 h-6 sm:w-7 sm:h-7 ${sendData.deliveryMethod === method.id ? "text-white" : "text-slate-600 dark:text-slate-300"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-0.5 sm:mb-1">
                    {method.name}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                    {method.desc}
                  </p>
                </div>
                <div className="flex flex-col items-end flex-shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-0.5">
                    {method.time}
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                    {method.fee}% fee
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      {/* Recent Recipients - Show after delivery method is selected */}
      {/* {sendData.deliveryMethod &&
        recentRecipients.filter(
          (r) => r.deliveryMethod === sendData.deliveryMethod,
        ).length > 0 && (
          <Card className="p-3 sm:p-4 mb-3 sm:mb-5 dark:bg-slate-800 dark:border-slate-700 border-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-2">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400" />
              Recent Recipients
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Select from your recent transfers
            </p>
            <div className="space-y-2">
              {recentRecipients
                .filter((r) => r.deliveryMethod === sendData.deliveryMethod)
                .map((recipient) => (
                  <button
                  type="button"
                    key={recipient.id}
                    onClick={() => {
                      if (recipient.deliveryMethod === "mobile") {
                        setSendData({
                          ...sendData,
                          recipientName: recipient.name,
                          recipientPhone: recipient.phone!,
                        });
                      } else if (recipient.deliveryMethod === "bank") {
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
                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-0.5">
                          {recipient.name}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                          {recipient.deliveryMethod === "mobile"
                            ? recipient.phone
                            : `${recipient.bank} • ${recipient.account}`}
                        </p>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {recipient.lastSent}
                        </p>
                        <div className="mt-0.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                          Select →
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
            </div>
            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                Or enter new recipient details below
              </p>
            </div>
          </Card>
        )} */}
      {sendData.deliveryMethod && (
        <RecentRecipients
          selected={sendData.recipientId}
          deliveryMethod={
            sendData.deliveryMethod === "mobile"
              ? "mobile_money"
              : sendData.deliveryMethod
          }
          onSelect={function (recipient: any): void {
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
          }}
        />
      )}
      {/* Recipient Details - Show after delivery method is selected */}
      {sendData.deliveryMethod && !sendData.recipientName && (
        <Card className="p-3 sm:p-5 mb-3 sm:mb-5 dark:bg-slate-800 dark:border-slate-700 border-2">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            Recipient Details
          </h3>
          <div className="space-y-3 sm:space-y-4">
            {sendData.deliveryMethod === "mobile" && (
              <div>
                <Label
                  htmlFor="recipientPhone"
                  className="text-xs sm:text-sm mb-1.5 sm:mb-2 block dark:text-slate-300 font-semibold"
                >
                  Mobile Money Number
                </Label>
                <div className="relative mb-4">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="recipientPhone"
                    placeholder="+233 XX XXX XXXX"
                    className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500"
                    value={sendData.recipientName}
                    onChange={(e) => handleNameChange(e.target.value)}
                  />
                </div>
                <div className="relative mb-4">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500" />
                  <Input
                    id="recipientPhone"
                    placeholder="+233 XX XXX XXXX"
                    className="pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-500"
                    value={sendData.recipientPhone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                  />
                </div>
                <MomoNetworkSelect
                  onChange={(network: any) => {
                    setSendData((prev: any) => ({
                      ...prev,
                      networkCode: network?.code ?? "",
                      networkName: network?.name ?? "",
                    }));
                    // Re-verify if account number exists
                    // if (sendData.recipientAccount.length >= 10) {
                    //   verifyRecipient('bank', sendData.recipientAccount);
                    // }
                  }}
                  value={setSendData.networkCode}
                />
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-1.5 sm:mt-2 flex items-center gap-1.5">
                  <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Enter the mobile money number (MTN, Vodafone Cash, or
                  AirtelTigo)
                </p>
              </div>
            )}

            {sendData.deliveryMethod === "bank" && (
              <>
                <div>
                  <Label
                    htmlFor="recipientBank"
                    className="text-xs sm:text-sm mb-1.5 sm:mb-2 block dark:text-slate-300 font-semibold"
                  >
                    Bank Name
                  </Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500 z-10" />
                    <select
                      id="recipientBank"
                      className="w-full pl-10 sm:pl-11 h-11 sm:h-12 text-sm sm:text-base border-2 border-slate-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 dark:text-white"
                      value={sendData.recipientBank}
                      onChange={(e) => {
                        setSendData({
                          ...sendData,
                          recipientBank: e.target.value,
                          recipientName: "",
                        });
                        // Re-verify if account number exists
                        if (sendData.recipientAccount.length >= 10) {
                          verifyRecipient("bank", sendData.recipientAccount);
                        }
                      }}
                    >
                      <option value="">Select a bank</option>
                      {ghanaianBanks.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="recipientAccount"
                    className="text-xs sm:text-sm mb-1.5 sm:mb-2 block dark:text-slate-300 font-semibold"
                  >
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
          </div>
        </Card>
      )}

      {(sendData.recipientPhone.length >= 10 ||
        (sendData.recipientAccount.length >= 10 && sendData.recipientBank)) && (
        <Card className="p-3 sm:p-5 mb-3 sm:mb-5 dark:bg-slate-800 dark:border-slate-700 border-2">
          {" "}
          <div
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
          </div>
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
    </motion.form>
  );
};

export default Step1;
