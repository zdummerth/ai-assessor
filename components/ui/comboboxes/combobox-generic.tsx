"use client";
import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";

export interface ComboboxGenericProps<
  T,
  V extends string | number = string | number,
> {
  items: readonly T[] | T[];
  value?: V[];
  onValueChange?: (value: V[]) => void;
  itemToValue: (item: T) => V;
  itemToLabel: (item: T) => string;
  label?: string;
  placeholder?: string;
  isLoading?: boolean;
  sortItems?: (items: T[]) => T[];
}

export function ComboboxGeneric<
  T,
  V extends string | number = string | number,
>({
  items,
  value,
  onValueChange,
  itemToValue,
  itemToLabel,
  label = "Select",
  placeholder = "Select items...",
  isLoading = false,
  sortItems,
}: ComboboxGenericProps<T, V>) {
  const id = React.useId();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Sort items if sortItems function is provided
  const sortedItems = React.useMemo(() => {
    const itemsArray = Array.from(items);
    if (sortItems) {
      return sortItems(itemsArray);
    }
    // Default: sort by label alphabetically/numerically
    return itemsArray.sort((a, b) => {
      const aLabel = itemToLabel(a);
      const bLabel = itemToLabel(b);
      const aNum = parseFloat(aLabel);
      const bNum = parseFloat(bLabel);
      const aIsNum = !isNaN(aNum);
      const bIsNum = !isNaN(bNum);
      if (aIsNum && bIsNum) {
        return aNum - bNum;
      } else if (aIsNum) {
        return -1;
      } else if (bIsNum) {
        return 1;
      } else {
        return aLabel.localeCompare(bLabel);
      }
    });
  }, [items, sortItems, itemToLabel]);

  // Map value to items for selected state
  const selectedItems = React.useMemo(() => {
    if (!value) return [];
    return sortedItems.filter((item) => {
      const itemValue = itemToValue(item);
      return value.includes(itemValue as unknown as V);
    });
  }, [value, sortedItems, itemToValue]);

  return (
    <Combobox.Root
      items={sortedItems}
      value={selectedItems}
      onValueChange={(selected) => {
        onValueChange?.(selected.map((item) => itemToValue(item)));
      }}
      itemToStringLabel={itemToLabel}
      itemToStringValue={(item) => String(itemToValue(item))}
      multiple
    >
      <div className="flex flex-col gap-1 text-sm font-medium">
        <label className="inline-flex text-inherit" htmlFor={id}>
          {label}
        </label>
        <Combobox.Chips
          className="relative flex min-h-10 w-full flex-wrap items-center gap-1 rounded-md border border-gray-200 bg-[canvas] px-1.5 py-1 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-blue-800"
          ref={containerRef}
        >
          <Combobox.Value>
            {(selectedValue: T[]) => (
              <React.Fragment>
                {selectedValue.map((item) => (
                  <Combobox.Chip
                    key={String(itemToValue(item))}
                    className="flex cursor-default items-center gap-1 rounded-md bg-gray-100 py-1 pl-2 pr-1 text-sm text-gray-900 outline-none focus-within:bg-blue-800 focus-within:text-gray-50 [@media(hover:hover)]:[&[data-highlighted]]:bg-blue-800 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50"
                    aria-label={itemToLabel(item)}
                  >
                    {itemToLabel(item)}
                    <Combobox.ChipRemove
                      className="inline-flex items-center justify-center rounded-md border-none bg-transparent p-[0.2rem] text-inherit hover:bg-gray-200"
                      aria-label="Remove"
                    >
                      <XIcon />
                    </Combobox.ChipRemove>
                  </Combobox.Chip>
                ))}
                <Combobox.Input
                  id={id}
                  placeholder={selectedValue.length > 0 ? "" : placeholder}
                  className="h-8 min-w-24 flex-1 rounded-md border-0 bg-transparent pl-2 text-base font-normal outline-none placeholder:font-normal"
                  disabled={isLoading}
                />
              </React.Fragment>
            )}
          </Combobox.Value>
        </Combobox.Chips>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner
          className="outline-none z-[100]"
          style={{ pointerEvents: "auto" }}
          anchor={containerRef}
          sideOffset={4}
        >
          <Combobox.Popup
            className="box-border z-[100] w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pb-2 scroll-pt-2 overscroll-contain rounded-md bg-[canvas] py-2 text-gray-900 shadow-[0_10px_15px_-3px_var(--color-gray-200),0_4px_6px_-4px_var(--color-gray-200)] outline outline-1 outline-gray-200 transition-[opacity,transform,scale] duration-100 data-[ending-style]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:-outline-offset-1 dark:shadow-none dark:outline-gray-300"
            style={{ pointerEvents: "auto" }}
            aria-busy={isLoading}
          >
            {isLoading && (
              <div className="flex items-center gap-2 py-1 pl-4 pr-5 text-sm text-gray-600">
                <span className="inline-block size-3 animate-[spin_0.75s_linear_infinite] rounded-full border border-current border-r-transparent" />
                Loading...
              </div>
            )}
            <Combobox.Empty className="box-border px-4 py-2 text-sm leading-4 text-gray-600 empty:hidden">
              No items found.
            </Combobox.Empty>
            <Combobox.List>
              {(item: T) => (
                <Combobox.Item
                  key={String(itemToValue(item))}
                  value={item}
                  className="grid bg-background text-foreground cursor-pointer select-none grid-cols-[0.75rem_1fr] items-start gap-2 py-2 pl-4 pr-5 text-base leading-[1.2rem] outline-none [@media(hover:hover)]:[&[data-highlighted]]:relative [@media(hover:hover)]:[&[data-highlighted]]:z-0 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-900 [@media(hover:hover)]:[&[data-highlighted]]:before:absolute [@media(hover:hover)]:[&[data-highlighted]]:before:inset-y-0 [@media(hover:hover)]:[&[data-highlighted]]:before:inset-x-2 [@media(hover:hover)]:[&[data-highlighted]]:before:z-[-1] [@media(hover:hover)]:[&[data-highlighted]]:before:rounded [@media(hover:hover)]:[&[data-highlighted]]:before:bg-gray-100 [@media(hover:hover)]:[&[data-highlighted]]:before:content-['']"
                  style={{ pointerEvents: "auto" }}
                >
                  <Combobox.ItemIndicator className="col-start-1 mt-1">
                    <CheckIcon className="size-3" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2 flex flex-col gap-1">
                    <div className="text-[0.95rem] font-medium">
                      {itemToLabel(item)}
                    </div>
                  </div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

function CheckIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      fill="currentcolor"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      {...props}
    >
      <path d="M9.1603 1.12218C9.50684 1.34873 9.60427 1.81354 9.37792 2.16038L5.13603 8.66012C5.01614 8.8438 4.82192 8.96576 4.60451 8.99384C4.3871 9.02194 4.1683 8.95335 4.00574 8.80615L1.24664 6.30769C0.939709 6.02975 0.916013 5.55541 1.19372 5.24822C1.47142 4.94102 1.94536 4.91731 2.2523 5.19524L4.36085 7.10461L8.12299 1.33999C8.34934 0.993152 8.81376 0.895638 9.1603 1.12218Z" />
    </svg>
  );
}

function XIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}
