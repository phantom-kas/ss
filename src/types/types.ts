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



export type UserRole = "user" | "admin";

export interface User {
  id: string;
  public_id: string;

  first_name: string;
  last_name: string;

  email_norm: string;
  email_verified: boolean;

  image_url: string | null;

  role: UserRole;

  done_onboarding: boolean;
  totp_enabled: boolean;
}