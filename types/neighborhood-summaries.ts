// Types for neighborhood summaries

export type NeighborhoodType =
  | "cda_neighborhood"
  | "assessor_neighborhood"
  | "commercial_cluster"
  | "building_category"
  | "occupancy";

export type SummaryType =
  | "commercial_sales"
  | "commercial_sales_by_category"
  | "residential_sales"
  | "residential_sales_by_occupancy"
  | "residential_ratios"
  | "residential_ratios_by_occupancy";

// Sales metrics structure
export interface SalesMetrics {
  median_sale_price?: number;
  avg_sale_price?: number;
  median_price_sqft?: number;
  avg_price_sqft?: number;
  number_of_sales: number;
  building_category?: string;
  occupancy_at_sale?: string;
}

// Ratio metrics structure
export interface RatioMetrics {
  median_ratio?: number;
  avg_ratio?: number;
  median_cost_ratio?: number;
  avg_cost_ratio?: number;
  number_of_sales: number;
  building_category?: string;
  occupancy_at_sale?: string;
}

// Combined metrics type
export type NeighborhoodMetrics = SalesMetrics | RatioMetrics;

export interface NeighborhoodSummary {
  id: number;
  neighborhood_type: NeighborhoodType;
  neighborhood_id: string;
  summary_type: SummaryType;
  metrics: NeighborhoodMetrics;
  computed_at: string;
  created_at: string;
  updated_at: string;
}

// Search params for filtering summaries
export interface NeighborhoodSummarySearchParams {
  neighborhood_type?: NeighborhoodType;
  neighborhood_id?: string;
  summary_type?: SummaryType;
  limit?: number;
  offset?: number;
}
