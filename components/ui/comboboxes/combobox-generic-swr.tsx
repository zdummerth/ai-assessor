"use client";

import * as React from "react";
import useSWR, { type SWRConfiguration } from "swr";
import {
  ComboboxGeneric,
  type ComboboxGenericProps,
} from "@/components/ui/comboboxes/combobox-generic";

type QueryParamPrimitive = string | number | boolean;
type QueryParamValue =
  | QueryParamPrimitive
  | QueryParamPrimitive[]
  | null
  | undefined;

type QueryParams = Record<string, QueryParamValue>;

export interface ComboboxGenericSWRProps<
  TResponse,
  TItem,
  V extends string | number = string | number,
> extends Omit<
  ComboboxGenericProps<TItem, V>,
  "items" | "isLoading" | "onValueChange"
> {
  apiRoute: string;
  params?: QueryParams;
  transformData: (response: TResponse) => TItem[];
  value?: V[];
  onValueChange?: (value: V[]) => void;
  onChange?: (value: V[], selectedItems: TItem[]) => void;
  swrKey?: string | readonly unknown[];
  swrOptions?: SWRConfiguration<TItem[], Error>;
  fetchInit?: RequestInit;
  enabled?: boolean;
  fallbackItems?: TItem[];
  disableOnError?: boolean;
  onError?: (error: Error) => void;
}

function buildUrl(apiRoute: string, params?: QueryParams) {
  if (!params || Object.keys(params).length === 0) {
    return apiRoute;
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, rawValue]) => {
    if (rawValue === undefined || rawValue === null) {
      return;
    }

    if (Array.isArray(rawValue)) {
      rawValue.forEach((value) => {
        searchParams.append(key, String(value));
      });
      return;
    }

    searchParams.set(key, String(rawValue));
  });

  const query = searchParams.toString();
  return query ? `${apiRoute}?${query}` : apiRoute;
}

export function ComboboxGenericSWR<
  TResponse,
  TItem,
  V extends string | number = string | number,
>({
  apiRoute,
  params,
  transformData,
  value,
  onValueChange,
  onChange,
  itemToValue,
  itemToLabel,
  label,
  placeholder,
  sortItems,
  swrKey,
  swrOptions,
  fetchInit,
  enabled = true,
  fallbackItems,
  disableOnError = true,
  onError,
}: ComboboxGenericSWRProps<TResponse, TItem, V>) {
  const requestUrl = React.useMemo(
    () => buildUrl(apiRoute, params),
    [apiRoute, params],
  );

  const resolvedKey = React.useMemo(
    () => (enabled ? (swrKey ?? requestUrl) : null),
    [enabled, swrKey, requestUrl],
  );

  const fetchItems = React.useCallback(async () => {
    const response = await fetch(requestUrl, fetchInit);

    if (!response.ok) {
      let errorMessage = `Failed to fetch options (${response.status})`;
      try {
        const errorJson = (await response.json()) as {
          error?: string;
          message?: string;
        };
        errorMessage =
          errorJson.error ||
          errorJson.message ||
          `${errorMessage}: ${response.statusText}`;
      } catch {
        errorMessage = `${errorMessage}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const json = (await response.json()) as TResponse;
    return transformData(json);
  }, [fetchInit, requestUrl, transformData]);

  const { data, isLoading, error } = useSWR<TItem[], Error>(
    resolvedKey,
    fetchItems,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      ...swrOptions,
    },
  );

  const items = React.useMemo(
    () => data ?? fallbackItems ?? [],
    [data, fallbackItems],
  );

  React.useEffect(() => {
    if (!error || !onError) {
      return;
    }
    onError(error);
  }, [error, onError]);

  const handleValueChange = React.useCallback(
    (nextValue: V[]) => {
      onValueChange?.(nextValue);

      if (!onChange) {
        return;
      }

      const selectedItems = items.filter((item) =>
        nextValue.includes(itemToValue(item) as V),
      );

      onChange(nextValue, selectedItems);
    },
    [items, itemToValue, onChange, onValueChange],
  );

  return (
    <ComboboxGeneric<TItem, V>
      items={items}
      value={value}
      onValueChange={handleValueChange}
      itemToValue={itemToValue}
      itemToLabel={itemToLabel}
      label={label}
      placeholder={placeholder}
      sortItems={sortItems}
      isLoading={isLoading || (disableOnError && Boolean(error))}
    />
  );
}
