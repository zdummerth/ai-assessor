"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import clsx from "clsx";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function Pagination({ totalPages }: { totalPages: number }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentPage = Number(searchParams.get("page")) || 1;
  console.log("Pagination - currentPage:", currentPage);
  console.log("Pagination - totalPages:", totalPages);

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(
      searchParams as unknown as URLSearchParams,
    );
    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    const url = createPageURL(page);
    router.push(url);
  };

  const btnClass = (disabled?: boolean) =>
    clsx("flex h-10 w-10 items-center justify-center rounded-md border", {
      "pointer-events-none text-gray-300": disabled,
      "hover:bg-gray-100": !disabled,
    });

  return (
    <div className="flex items-center gap-3">
      <button
        className={btnClass(currentPage <= 1)}
        onClick={() => goToPage(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
        aria-label="Previous page"
      >
        <ArrowLeftIcon className="w-4" />
      </button>

      <select
        className="px-3 py-2 border rounded-md"
        value={String(currentPage)}
        onChange={(e) => goToPage(Number(e.target.value))}
        aria-label="Select page"
      >
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>

      <button
        className={btnClass(currentPage >= totalPages)}
        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        aria-label="Next page"
      >
        <ArrowRightIcon className="w-4" />
      </button>
    </div>
  );
}
