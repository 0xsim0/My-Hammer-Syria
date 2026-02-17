export const GOVERNORATES = [
  "Damascus",
  "Aleppo",
  "Homs",
  "Hama",
  "Latakia",
  "Deir ez-Zor",
  "Raqqa",
  "Hasakah",
  "Daraa",
  "Idlib",
  "Quneitra",
  "Tartus",
  "As-Suwayda",
  "Rural Damascus",
] as const;

export type Governorate = (typeof GOVERNORATES)[number];

export const CURRENCIES = ["SYP", "USD"] as const;
export type CurrencyType = (typeof CURRENCIES)[number];

export const JOB_STATUSES = ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"] as const;
export const BID_STATUSES = ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"] as const;

export const PAYMENT_METHODS = [
  "STRIPE",
  "CASH",
  "BANK_TRANSFER",
  "SYRIATEL_CASH",
] as const;

export const LOCALES = ["ar", "en"] as const;
export const DEFAULT_LOCALE = "ar";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_IMAGES_PER_JOB = 5;
export const JOBS_PER_PAGE = 12;

export const CURRENCY_SYMBOLS: Record<string, string> = {
  SYP: "ل.س",
  USD: "$",
};
