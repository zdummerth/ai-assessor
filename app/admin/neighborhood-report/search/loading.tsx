import { NeighborhoodsLoading } from "@/components/neighborhoods-loading";

export default function Loading() {
  return (
    <div className="flex min-h-[400px] items-center justify-center rounded-lg border bg-muted/30">
      <NeighborhoodsLoading />
    </div>
  );
}
