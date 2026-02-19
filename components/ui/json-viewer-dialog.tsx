"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JsonViewerDialogProps {
  data: unknown;
  title: string;
  buttonText?: string;
}

function tryParseJsonString(str: string): unknown | null {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function isExpandable(value: unknown): boolean {
  if (typeof value === "string") {
    const parsed = tryParseJsonString(value);
    if (parsed !== null) return true;
  }
  return (typeof value === "object" && value !== null) || Array.isArray(value);
}

function formatScalarValue(value: unknown): string {
  if (value === null) return "—";
  if (typeof value === "string") {
    // Check if it's a JSON string
    const parsed = tryParseJsonString(value);
    if (parsed !== null) {
      return Array.isArray(parsed)
        ? `${parsed.length} item${parsed.length !== 1 ? "s" : ""}`
        : "Details";
    }
    return value.length > 150 ? value.substring(0, 150) + "…" : value;
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString();
  if (Array.isArray(value))
    return `${value.length} item${value.length !== 1 ? "s" : ""}`;
  return "Details";
}

interface JsonFieldProps {
  name: string;
  value: unknown;
  level?: number;
}

function JsonField({ name, value, level = 0 }: JsonFieldProps) {
  const [expanded, setExpanded] = useState(level === 0);

  // Check if string is actually JSON
  let actualValue = value;
  if (typeof value === "string") {
    const parsed = tryParseJsonString(value);
    if (parsed !== null) {
      actualValue = parsed;
    }
  }

  const canExpand = isExpandable(actualValue);

  if (!canExpand) {
    return (
      <Card className="p-4 mb-2 bg-gradient-to-r from-background to-muted/20 hover:bg-muted/40 transition-colors">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-foreground">{name}</div>
            <div className="text-sm text-muted-foreground mt-1 break-words">
              {formatScalarValue(value)}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const displayValue = formatScalarValue(value);

  return (
    <Card className="p-4 mb-2 bg-gradient-to-r from-background to-muted/20 hover:bg-muted/40 transition-colors">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex items-center justify-between gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground">{name}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {displayValue}
          </div>
        </div>
        <span className="text-lg text-muted-foreground flex-shrink-0">
          {expanded ? "▼" : "▶"}
        </span>
      </button>

      {expanded && (
        <div className="mt-4 ml-4 border-l-2 border-muted/50 pl-4 space-y-2">
          {Array.isArray(actualValue)
            ? (actualValue as unknown[]).map((item, index) => (
                <JsonField
                  key={index}
                  name={`Item ${index + 1}`}
                  value={item}
                  level={level + 1}
                />
              ))
            : Object.entries(actualValue as Record<string, unknown>).map(
                ([key, val]) => (
                  <JsonField
                    key={key}
                    name={key}
                    value={val}
                    level={level + 1}
                  />
                ),
              )}
        </div>
      )}
    </Card>
  );
}

export function JsonViewerDialog({
  data,
  title,
  buttonText = "View Details",
}: JsonViewerDialogProps) {
  const [open, setOpen] = useState(false);

  if (!data) {
    return <span className="text-muted-foreground text-xs">—</span>;
  }

  const isObject =
    typeof data === "object" && data !== null && !Array.isArray(data);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>View details below</DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-2">
          {isObject ? (
            Object.entries(data as Record<string, unknown>).map(
              ([key, value]) => (
                <JsonField key={key} name={key} value={value} level={0} />
              ),
            )
          ) : (
            <JsonField name="Data" value={data} level={0} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
