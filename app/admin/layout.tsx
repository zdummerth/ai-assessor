import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      </nav>
      {children}
    </div>
  );
}
