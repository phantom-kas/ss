import { LucideIcon } from "lucide-react";

export type DeliveryMethod = "mobile" | "bank" | "crypto";


export interface DeliveryMethodOption {
  id: DeliveryMethod;
  name: string;
  desc: string;
  time: string;
  fee: number;
  icon: LucideIcon;
  disabled?: boolean;
}
