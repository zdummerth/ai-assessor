import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ParcelSearchDialog } from "@/components/parcel-search-dialog";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex-1 w-full flex flex-col gap-6 p-4">
      <nav className="flex gap-3">
        <Link href="/admin/employees">
          <Button variant="ghost">Employees</Button>
        </Link>
        <Link href="/admin/neighborhoods/explore">
          <Button variant="ghost">Neighborhoods</Button>
        </Link>
        <Link href="/admin/sales/search">
          <Button variant="ghost">Sales Search</Button>
        </Link>
        <ParcelSearchDialog />;
      </nav>
      {children}
    </div>
  );
}
