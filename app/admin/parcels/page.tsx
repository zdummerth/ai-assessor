import { getParcelGeometries } from "./queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import ParcelMapWrapper from "./parcel-map-wrapper";

export default async function ParcelsPage() {
  const { data: parcels, error } = await getParcelGeometries(1000);

  if (error) {
    return <div>Error loading parcels: {error.message}</div>;
  }

  if (!parcels || parcels.length === 0) {
    return <div>No parcels found.</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Parcel Map</CardTitle>
          <CardDescription>
            Viewing {parcels.length} parcel geometries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* @ts-expect-error // TypeScript issue with LatLngExpression */}
          <ParcelMapWrapper parcels={parcels} />
        </CardContent>
      </Card>
    </div>
  );
}
