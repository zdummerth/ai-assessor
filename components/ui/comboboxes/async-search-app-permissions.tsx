"use client";
import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import { list } from "@/app/admin/app-permissions/queries";
import type { Tables } from "@/database-types";

type AppPermission = Tables<"app_permissions">;

interface AsyncSearchAppPermissionsProps {
  value?: AppPermission[] | null;
  onChange?: (value: AppPermission[]) => void;
  label?: string;
  placeholder?: string;
}

export function AsyncSearchAppPermissions({
  value,
  onChange,
  label = "Search Role Permissions",
  placeholder = "Search by permission...",
}: AsyncSearchAppPermissionsProps) {
  const id = React.useId();
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const [searchResults, setSearchResults] = React.useState<AppPermission[]>([]);
  const [selectedValues, setSelectedValues] = React.useState<AppPermission[]>(
    () => {
      if (!value) return [];
      return value || [];
    },
  );
  console.log("selectedValues:", selectedValues);
  const [searchValue, setSearchValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [blockStartStatus, setBlockStartStatus] = React.useState(false);

  const [isPending, startTransition] = React.useTransition();

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const selectedValuesRef = React.useRef<AppPermission[]>([]);

  const trimmedSearchValue = searchValue.trim();

  const items = React.useMemo(() => {
    if (selectedValues.length === 0) {
      return searchResults;
    }

    const merged = [...searchResults];

    selectedValues.forEach((item) => {
      if (
        !searchResults.some(
          (result) =>
            result.name === item.name &&
            result.description === item.description,
        )
      ) {
        merged.push(item);
      }
    });

    return merged;
  }, [searchResults, selectedValues]);

  function getStatus() {
    if (isPending) {
      return (
        <React.Fragment>
          <span
            aria-hidden
            className="inline-block size-3 animate-[spin_0.75s_linear_infinite] rounded-full border border-current border-r-transparent rtl:border-r-current rtl:border-l-transparent"
          />
          Searching…
        </React.Fragment>
      );
    }

    if (error) {
      return error;
    }

    if (trimmedSearchValue === "" && !blockStartStatus) {
      return selectedValues.length > 0
        ? null
        : "Start typing to search permissions…";
    }

    if (searchResults.length === 0 && !blockStartStatus) {
      return `No matches for "${trimmedSearchValue}".`;
    }

    return null;
  }

  function getEmptyMessage() {
    if (
      trimmedSearchValue === "" ||
      isPending ||
      searchResults.length > 0 ||
      error
    ) {
      return null;
    }

    return "Try a different search term.";
  }

  return (
    <Combobox.Root
      items={items}
      itemToStringLabel={(item: AppPermission) =>
        `${item.name}: ${item.description}`
      }
      isItemEqualToValue={(item, selectedValue) =>
        item.name === selectedValue.name &&
        item.description === selectedValue.description
      }
      multiple={true}
      filter={null}
      onOpenChangeComplete={(open) => {
        if (!open) {
          setSearchResults(selectedValuesRef.current);
          setBlockStartStatus(false);
        }
      }}
      onValueChange={(nextSelectedValues) => {
        selectedValuesRef.current = nextSelectedValues;
        setSelectedValues(nextSelectedValues);
        setSearchValue("");
        setError(null);

        if (nextSelectedValues?.length === 0) {
          setSearchResults([]);
          setBlockStartStatus(false);
        } else {
          setBlockStartStatus(true);
        }

        onChange?.(nextSelectedValues);
      }}
      onInputValueChange={(nextSearchValue, { reason }) => {
        setSearchValue(nextSearchValue);

        const controller = new AbortController();
        abortControllerRef.current?.abort();
        abortControllerRef.current = controller;

        if (nextSearchValue === "") {
          setSearchResults(selectedValuesRef.current);
          setError(null);
          setBlockStartStatus(false);
          return;
        }

        if (reason === "item-press") {
          return;
        }

        startTransition(async () => {
          setError(null);

          try {
            const { data, error: queryError } = await list(
              0,
              99,
              nextSearchValue,
            );

            if (controller.signal.aborted) {
              return;
            }

            if (queryError) {
              setSearchResults([]);
              setError("Failed to fetch permissions. Please try again.");
              return;
            }

            setSearchResults(data || []);
          } catch (err) {
            console.error("Error fetching role permissions:", err);
            if (!controller.signal.aborted) {
              setSearchResults([]);
              setError("An error occurred while searching.");
            }
          }
        });
      }}
    >
      <div className="flex flex-col gap-1 text-sm font-medium text-gray-900">
        <label className="inline-flex text-inherit" htmlFor={id}>
          {label}
        </label>
        <Combobox.Chips
          className="relative flex min-h-10 w-[16rem] md:w-[20rem] flex-wrap items-center gap-1 rounded-md border border-gray-200 bg-[canvas] px-1.5 py-1 focus-within:outline focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-blue-800"
          ref={containerRef}
        >
          <Combobox.Value>
            {(value: AppPermission[]) => (
              <React.Fragment>
                {value.map((item) => (
                  <Combobox.Chip
                    key={`${item.name}-${item.description}`}
                    className="flex cursor-default items-center gap-1 rounded-md bg-gray-100 py-1 pl-2 pr-1 text-sm text-gray-900 outline-none focus-within:bg-blue-800 focus-within:text-gray-50 [@media(hover:hover)]:[&[data-highlighted]]:bg-blue-800 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50"
                    aria-label={`${item.name}: ${item.description}`}
                  >
                    {item.description}
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
                  placeholder={value.length > 0 ? "" : placeholder}
                  className="h-8 min-w-24 flex-1 rounded-md border-0 bg-transparent pl-2 text-base font-normal text-gray-900 outline-none placeholder:font-normal"
                />
              </React.Fragment>
            )}
          </Combobox.Value>
        </Combobox.Chips>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner
          className="outline-none"
          anchor={containerRef}
          sideOffset={4}
        >
          <Combobox.Popup
            className="box-border w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pb-2 scroll-pt-2 overscroll-contain rounded-md bg-[canvas] py-2 text-gray-900 shadow-[0_10px_15px_-3px_var(--color-gray-200),0_4px_6px_-4px_var(--color-gray-200)] outline outline-1 outline-gray-200 transition-[opacity,transform,scale] duration-100 data-[ending-style]:transition-none data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:-outline-offset-1 dark:shadow-none dark:outline-gray-300"
            aria-busy={isPending || undefined}
          >
            <Combobox.Status className="flex items-center gap-2 py-1 pl-4 pr-5 text-sm text-gray-600 empty:hidden">
              {getStatus()}
            </Combobox.Status>
            <Combobox.Empty className="box-border px-4 py-2 text-sm leading-4 text-gray-600 empty:hidden">
              {getEmptyMessage()}
            </Combobox.Empty>
            <Combobox.List>
              {(item: AppPermission) => (
                <Combobox.Item
                  key={`${item.name}-${item.description}`}
                  value={item}
                  className="grid cursor-default select-none grid-cols-[0.75rem_1fr] items-start gap-2 py-2 pl-4 pr-5 text-base leading-[1.2rem] outline-none [@media(hover:hover)]:[&[data-highlighted]]:relative [@media(hover:hover)]:[&[data-highlighted]]:z-0 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-900 [@media(hover:hover)]:[&[data-highlighted]]:before:absolute [@media(hover:hover)]:[&[data-highlighted]]:before:inset-y-0 [@media(hover:hover)]:[&[data-highlighted]]:before:inset-x-2 [@media(hover:hover)]:[&[data-highlighted]]:before:z-[-1] [@media(hover:hover)]:[&[data-highlighted]]:before:rounded [@media(hover:hover)]:[&[data-highlighted]]:before:bg-gray-100 [@media(hover:hover)]:[&[data-highlighted]]:before:content-['']"
                >
                  <Combobox.ItemIndicator className="col-start-1 mt-1">
                    <CheckIcon className="size-3" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2 flex flex-col gap-1">
                    <div className="text-[0.95rem] font-medium">
                      {item.description}
                    </div>
                    <div className="text-sm text-gray-600">
                      Permission: {item.name}
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
