export type DashboardStats = {
  total_brands: number;
  active_brands: number;
  former_brands: number;
  total_subscriptions: number;
  active_subscriptions: number;
  inactive_subscriptions: number;
  disabled_subscriptions: number;
};

export type DashboardPackage = {
  package_id: string;
  package_name: string;
  active_subscriptions: number;
};

export type DashboardActivity = {
  activity: string | null;
  total_brands: number;
  active_subscriptions: number;
};

export type SubscriptionWithStatus = {
  id: string;
  brand_id: string;
  package_id: string;
  start_date: string;
  end_date: string;
  payment_date: string | null;
  manually_disabled: boolean;
  disabled_note: string | null;
  note: string | null;
  status: "AKTIVNA" | "NEAKTIVNA" | "ISKLJUCENA";
};
