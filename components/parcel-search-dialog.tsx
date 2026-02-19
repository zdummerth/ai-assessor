"use client";

import { useState } from "react";
import { useDebounce } from "use-debounce";
import useSWR from "swr";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ParcelSearchResult {
  id: number;
  parcel_id: number;
  full_address: string;
  owner_name: string;
  block: string | null;
  lot: string | null;
  ext: string | null;
  match_type: string;
  relevance_score: number;
}

interface ParcelSearchResponse {
  data: ParcelSearchResult[];
}

const fetcher = async (url: string): Promise<ParcelSearchResult[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch search results");
  }
  const json: ParcelSearchResponse = await response.json();
  return json.data;
};

export function ParcelSearchDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch] = useDebounce(searchInput, 300);

  const shouldFetch = debouncedSearch.trim().length > 0;

  const { data: results, isLoading } = useSWR(
    shouldFetch
      ? `/api/parcel-search?q=${encodeURIComponent(debouncedSearch)}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );

  const handleResultClick = () => {
    setIsOpen(false);
    setSearchInput("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Search className="h-4 w-4 mr-2" />
          Search Parcels
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl h-[80vh] z-[10000] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Search Parcels</DialogTitle>
          <DialogDescription>
            Search by address, owner name, block/lot, or property details
          </DialogDescription>
          <Input
            placeholder="e.g. 123 Main St, Smith, Block 5 Lot 3"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            autoFocus
          />
        </DialogHeader>
        <div className="space-y-4">
          <div className="max-h-[400px] overflow-y-auto">
            {isLoading && (
              <div className="text-sm text-muted-foreground text-center py-8">
                Searching...
              </div>
            )}
            {!isLoading && searchInput.trim().length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                Start typing to search
              </div>
            )}
            {!isLoading &&
              searchInput.trim().length > 0 &&
              results &&
              results.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  No results found
                </div>
              )}
            {!isLoading && results && results.length > 0 && (
              <div className="space-y-2">
                {results.map((result) => (
                  <Link
                    key={result.id}
                    href={`/admin/parcels/${result.parcel_id}`}
                    onClick={handleResultClick}
                    className="block p-3 rounded-md hover:bg-muted transition-colors border"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="font-medium text-sm">
                          {result.full_address}
                        </div>
                        {result.owner_name && (
                          <div className="text-xs text-muted-foreground">
                            Owner: {result.owner_name}
                          </div>
                        )}
                        {(result.block || result.lot || result.ext) && (
                          <div className="text-xs text-muted-foreground">
                            {[
                              result.block && `Block ${result.block}`,
                              result.lot && `Lot ${result.lot}`,
                              result.ext && `Ext ${result.ext}`,
                            ]
                              .filter(Boolean)
                              .join(" • ")}
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        <span className="capitalize">
                          {result.match_type.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
