"use client";
import * as React from "react";
import { Combobox } from "@base-ui/react/combobox";
import useSWR from "swr";

export interface ComboboxOption {
  label: string;
  value: string;
}

interface ComboboxWithFetcherProps<T extends ComboboxOption> {
  // SWR Configuration
  swrKey: string;
  fetcher: () => Promise<unknown[]>;
  mapToOptions: (data: unknown[]) => T[];

  // Behavior
  mode?: "single" | "multi";
  onChange?: (value: T | T[] | null) => void;

  // UI Configuration
  label?: string;
  placeholder?: string;
  width?: string;
}

export function ComboboxWithFetcher<T extends ComboboxOption>({
  swrKey,
  fetcher,
  mapToOptions,
  mode = "single",
  onChange,
  label = "Select an option",
  placeholder = "Search...",
  width = "w-64",
}: ComboboxWithFetcherProps<T>) {
  const id = React.useId();
  const {
    data: rawData = [],
    isLoading,
    error,
  } = useSWR(swrKey, fetcher, {
    revalidateOnFocus: false,
  });

  const options = mapToOptions(rawData);

  const handleSelectionChange = (value: T | T[] | null) => {
    onChange?.(value);
  };

  if (mode === "multi") {
    return (
      <MultiSelectCombobox<T>
        id={id}
        options={options}
        isLoading={isLoading}
        error={error}
        onChange={handleSelectionChange}
        label={label}
        placeholder={placeholder}
        width={width}
      />
    );
  }

  return (
    <SingleSelectCombobox<T>
      id={id}
      options={options}
      isLoading={isLoading}
      error={error}
      onChange={handleSelectionChange}
      label={label}
      placeholder={placeholder}
      width={width}
    />
  );
}

interface SingleSelectComboboxProps<T extends ComboboxOption> {
  id: string;
  options: T[];
  isLoading: boolean;
  error: Error | null | undefined;
  onChange?: (value: T | null) => void;
  label: string;
  placeholder: string;
  width: string;
}

function SingleSelectCombobox<T extends ComboboxOption>({
  id,
  options,
  isLoading,
  error,
  onChange,
  label,
  placeholder,
  width,
}: SingleSelectComboboxProps<T>) {
  return (
    <Combobox.Root items={options} onValueChange={onChange}>
      <div className="relative flex flex-col gap-1 text-sm leading-5 font-medium text-gray-900">
        <label htmlFor={id}>{label}</label>
        <div className="relative [&>input]:pr-[calc(0.5rem+1.5rem)] has-[.combobox-clear]:[&>input]:pr-[calc(0.5rem+1.5rem*2)]">
          <Combobox.Input
            placeholder={isLoading ? "Loading..." : placeholder}
            id={id}
            disabled={isLoading || !!error}
            className={`h-10 ${width} rounded-md font-normal border border-gray-200 pl-3.5 text-base text-gray-900 bg-[canvas] focus:outline focus:outline-2 focus:-outline-offset-1 focus:outline-blue-800 disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <div className="absolute right-2 bottom-0 flex h-10 items-center justify-center text-gray-600">
            <Combobox.Clear
              className="combobox-clear flex h-10 w-6 items-center justify-center rounded bg-transparent p-0"
              aria-label="Clear selection"
            >
              <ClearIcon className="size-4" />
            </Combobox.Clear>
            <Combobox.Trigger
              className="flex h-10 w-6 items-center justify-center rounded bg-transparent p-0"
              aria-label="Open popup"
            >
              <ChevronDownIcon className="size-4" />
            </Combobox.Trigger>
          </div>
        </div>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner className="outline-none" sideOffset={4}>
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[23rem] max-w-[var(--available-width)] origin-[var(--transform-origin)] rounded-md bg-[canvas] text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300 duration-100">
            {error && (
              <div className="p-4 text-[0.925rem] leading-4 text-red-600">
                Error loading options
              </div>
            )}
            {isLoading && (
              <div className="p-4 text-[0.925rem] leading-4 text-gray-600">
                Loading...
              </div>
            )}
            <Combobox.Empty className="p-4 text-[0.925rem] leading-4 text-gray-600 empty:m-0 empty:p-0">
              No options found.
            </Combobox.Empty>
            <Combobox.List className="outline-0 overflow-y-auto scroll-py-[0.5rem] py-2 overscroll-contain max-h-[min(23rem,var(--available-height))] data-[empty]:p-0">
              {(item: T) => (
                <Combobox.Item
                  key={item.value}
                  value={item}
                  className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-8 pl-4 text-base leading-4 outline-none select-none data-[highlighted]:relative data-[highlighted]:z-0 data-[highlighted]:text-gray-50 data-[highlighted]:before:absolute data-[highlighted]:before:inset-x-2 data-[highlighted]:before:inset-y-0 data-[highlighted]:before:z-[-1] data-[highlighted]:before:rounded-sm data-[highlighted]:before:bg-gray-900"
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-3" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2">{item.label}</div>
                </Combobox.Item>
              )}
            </Combobox.List>
          </Combobox.Popup>
        </Combobox.Positioner>
      </Combobox.Portal>
    </Combobox.Root>
  );
}

interface MultiSelectComboboxProps<T extends ComboboxOption> {
  id: string;
  options: T[];
  isLoading: boolean;
  error: Error | null | undefined;
  onChange?: (value: T[] | null) => void;
  label: string;
  placeholder: string;
  width: string;
}

function MultiSelectCombobox<T extends ComboboxOption>({
  id,
  options,
  isLoading,
  error,
  onChange,
  label,
  placeholder,
  width,
}: MultiSelectComboboxProps<T>) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  return (
    <Combobox.Root items={options} multiple onValueChange={onChange}>
      <div className="max-w-[28rem] flex flex-col gap-1">
        <label
          className="text-sm leading-5 font-medium text-gray-900"
          htmlFor={id}
        >
          {label}
        </label>
        <Combobox.Chips
          className={`flex flex-wrap items-center gap-0.5 rounded-md border border-gray-200 px-1.5 py-1 ${width} focus-within:outline focus-within:outline-2 focus-within:-outline-offset-1 focus-within:outline-blue-800`}
          ref={containerRef}
        >
          <Combobox.Value>
            {(value: T[]) => (
              <React.Fragment>
                {value.map((item) => (
                  <Combobox.Chip
                    key={item.value}
                    className="flex items-center gap-1 rounded-md bg-gray-100 px-1.5 py-[0.2rem] text-sm text-gray-900 outline-none cursor-default [@media(hover:hover)]:[&[data-highlighted]]:bg-blue-800 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50 focus-within:bg-blue-800 focus-within:text-gray-50"
                    aria-label={item.label}
                  >
                    {item.label}
                    <Combobox.ChipRemove
                      className="rounded-md p-1 text-inherit hover:bg-gray-200"
                      aria-label="Remove"
                    >
                      <XIcon />
                    </Combobox.ChipRemove>
                  </Combobox.Chip>
                ))}
                <Combobox.Input
                  id={id}
                  placeholder={value.length > 0 ? "" : placeholder}
                  disabled={isLoading || !!error}
                  className="min-w-12 flex-1 h-8 rounded-md border-0 bg-transparent pl-2 text-base text-gray-900 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </React.Fragment>
            )}
          </Combobox.Value>
        </Combobox.Chips>
      </div>

      <Combobox.Portal>
        <Combobox.Positioner
          className="z-50 outline-none"
          sideOffset={4}
          anchor={containerRef}
        >
          <Combobox.Popup className="w-[var(--anchor-width)] max-h-[min(var(--available-height),23rem)] max-w-[var(--available-width)] origin-[var(--transform-origin)] overflow-y-auto scroll-pt-2 scroll-pb-2 overscroll-contain rounded-md bg-[canvas] py-2 text-gray-900 shadow-lg shadow-gray-200 outline-1 outline-gray-200 transition-[transform,scale,opacity] data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 dark:shadow-none dark:-outline-offset-1 dark:outline-gray-300">
            {error && (
              <div className="px-4 py-2 text-[0.925rem] leading-4 text-red-600">
                Error loading options
              </div>
            )}
            {isLoading && (
              <div className="px-4 py-2 text-[0.925rem] leading-4 text-gray-600">
                Loading...
              </div>
            )}
            <Combobox.Empty className="px-4 py-2 text-[0.925rem] leading-4 text-gray-600 empty:m-0 empty:p-0">
              No options found.
            </Combobox.Empty>
            <Combobox.List>
              {(item: T) => (
                <Combobox.Item
                  key={item.value}
                  className="grid cursor-default grid-cols-[0.75rem_1fr] items-center gap-2 py-2 pr-8 pl-4 text-base leading-4 outline-none select-none [@media(hover:hover)]:[&[data-highlighted]]:relative [@media(hover:hover)]:[&[data-highlighted]]:z-0 [@media(hover:hover)]:[&[data-highlighted]]:text-gray-50 [@media(hover:hover)]:[&[data-highlighted]]:before:absolute [@media(hover:hover)]:[&[data-highlighted]]:before:inset-x-2 [@media(hover:hover)]:[&[data-highlighted]]:before:inset-y-0 [@media(hover:hover)]:[&[data-highlighted]]:before:z-[-1] [@media(hover:hover)]:[&[data-highlighted]]:before:rounded-sm [@media(hover:hover)]:[&[data-highlighted]]:before:bg-gray-900"
                  value={item}
                >
                  <Combobox.ItemIndicator className="col-start-1">
                    <CheckIcon className="size-3" />
                  </Combobox.ItemIndicator>
                  <div className="col-start-2">{item.label}</div>
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

function ClearIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}

function ChevronDownIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M6 9l6 6 6-6" />
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
