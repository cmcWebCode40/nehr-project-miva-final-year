"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  className?: string;
}

export interface DataTableSelectFilter<T> {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  accessor: (row: T) => string;
}

interface DataTableProps<T> {
  data: T[] | undefined;
  columns: DataTableColumn<T>[];
  rowKey: (row: T) => string;
  isLoading?: boolean;
  searchPlaceholder?: string;
  getSearchableText?: (row: T) => string;
  selectFilters?: DataTableSelectFilter<T>[];
  emptyMessage?: string;
}

const ALL = "__all__";

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading,
  searchPlaceholder = "Search...",
  getSearchableText,
  selectFilters = [],
  emptyMessage = "Nothing here yet.",
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [selectValues, setSelectValues] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((row) => {
      if (query && getSearchableText) {
        if (!getSearchableText(row).toLowerCase().includes(query.toLowerCase())) return false;
      }
      for (const filter of selectFilters) {
        const selected = selectValues[filter.key];
        if (selected && selected !== ALL && filter.accessor(row) !== selected) return false;
      }
      return true;
    });
  }, [data, query, getSearchableText, selectFilters, selectValues]);

  if (isLoading) return <LoadingState />;

  return (
    <div className="space-y-3">
      {(getSearchableText || selectFilters.length > 0) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {getSearchableText && (
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-brand-gray-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="pl-8"
              />
            </div>
          )}
          {selectFilters.map((filter) => (
            <Select
              key={filter.key}
              value={selectValues[filter.key] ?? ALL}
              onValueChange={(value) =>
                setSelectValues((prev) => ({ ...prev, [filter.key]: value }))
              }
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All {filter.label.toLowerCase()}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState message={emptyMessage} />
      ) : (
        <div className="overflow-x-auto rounded-[4px] border border-brand-gray-300">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => (
                  <TableHead key={column.key} className={column.className}>
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((row) => (
                <TableRow key={rowKey(row)}>
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
