export type MapStyle =
  | "osm"
  | "osm-hot"
  | "carto-light"
  | "carto-dark"
  | "stadia-light"
  | "stadia-dark"
  | "esri-worldimagery"
  | "esri-topomap";

export const MAP_TILE_CONFIGS: Record<
  MapStyle,
  { url: string; attribution: string }
> = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  "osm-hot": {
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  "carto-light": {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  },
  "carto-dark": {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; CARTO",
  },
  "stadia-light": {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; Stadia Maps",
  },
  "stadia-dark": {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap contributors &copy; Stadia Maps",
  },
  "esri-worldimagery": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  "esri-topomap": {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
};

export function getTileConfig(mapStyle: MapStyle) {
  return MAP_TILE_CONFIGS[mapStyle] || MAP_TILE_CONFIGS.osm;
}
