"use client";

import { useState } from "react";
import { MapPin, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface AddressWithMapProps {
  address?: string | null;
  fallback?: string;
  className?: string;
}

export function AddressWithMap({
  address,
  fallback = "—",
  className = "",
}: AddressWithMapProps) {
  const [copied, setCopied] = useState(false);
  const displayAddress = address || fallback;
  const hasAddress = address && address.trim().length > 0;

  const handleMapClick = () => {
    if (hasAddress) {
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(address)}`;
      window.open(mapsUrl, "_blank");
    }
  };

  const handleCopyClick = async () => {
    if (hasAddress) {
      try {
        await navigator.clipboard.writeText(address);
        setCopied(true);
        toast.success("Address copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy address");
      }
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span>{displayAddress}</span>
      {hasAddress && (
        <div className="flex items-center gap-0.5">
          <button
            onClick={handleMapClick}
            className="inline-flex items-center justify-center h-5 w-5 rounded transition-colors hover:bg-muted text-muted-foreground hover:text-foreground active:opacity-70"
            title={`Open ${address} in Google Maps`}
            aria-label={`Open ${address} in Google Maps`}
          >
            <MapPin className="h-4 w-4" />
          </button>
          <button
            onClick={handleCopyClick}
            className="inline-flex items-center justify-center h-5 w-5 rounded transition-colors hover:bg-muted text-muted-foreground hover:text-foreground active:opacity-70"
            title="Copy address to clipboard"
            aria-label="Copy address to clipboard"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
