export type MapPointGeometry = {
  type: "Point";
  coordinates: [number, number];
};

export type NeighborhoodReportRow = {
  id: number;
  parcel_id: number;
  year: number | null;
  report_timestamp: string | null;
  neighborhood: string | null;
  address: string | null;
  grade: string | null;
  story: number | null;
  occupancy: number | null;
  cost_group: string | null;
  total_area: number | null;
  gla: number | null;
  year_built: number | null;
  cdu: string | null;
  ea: number | null;
  funct: number | null;
  econ: number | null;
  land: number | null;
  improve: number | null;
  prior: number | null;
  total: number | null;
  percent_change: number | null;
  bldg_source: string | null;
  address_id: string | null;
  tiger_address: string | null;
  geom: MapPointGeometry | string | null;
};
