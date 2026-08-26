"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * The list view shared by all five collections.
 *
 * Filtering and pagination are client-side on purpose. These are editorial
 * collections — seven services, eight questions — and the whole set is already
 * in the payload. Round-tripping to the server to filter eight rows would add
 * latency and a loading state to something that should feel instant.
 */
export function DataTable<T>({
  columns,
  data,
  searchPlaceholder = "Axtar…",
  emptyMessage = "Hələ məlumat yoxdur.",
  pageSize = 10,
  toolbar,
}: {
  columns: ColumnDef<T, unknown>[];
  data: T[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  pageSize?: number;
  toolbar?: React.ReactNode;
}) {
  const [globalFilter, setGlobalFilter] = React.useState("");

  /*
    ESLint reports `react-hooks/incompatible-library` here: `useReactTable`
    returns fresh function identities each render, so the React Compiler skips
    memoising this component rather than risk a stale table.
    
    Left as is. Skipping memoisation is the safe half of that trade, and these
    tables render a handful of rows from a payload that is already in memory —
    there is nothing here worth memoising in the first place.
  */
  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const filtered = table.getFilteredRowModel().rows.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative sm:max-w-xs sm:flex-1">
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"
          />
          <Input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="pl-9"
          />
        </div>
        {toolbar}
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.015]">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id} className="hover:bg-transparent">
                {group.headers.map((header) => (
                  <TableHead key={header.id} style={{ width: header.getSize() }}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="py-12 text-center text-[13px] text-white/35"
                >
                  {globalFilter
                    ? `“${globalFilter}” üzrə nəticə tapılmadı.`
                    : emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Hidden when everything fits on one page — an inert pager is just noise. */}
      {pageCount > 1 ? (
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-white/35" aria-live="polite">
            {pageCount} səhifədən {pageIndex + 1}-ci · {filtered} element
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft />
              Əvvəlki
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Növbəti
              <ChevronRight />
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
