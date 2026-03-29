"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const DEFAULT_TABLE_PAGE_OPTIONS = ["10", "30", "50", "all"] as const;
export type TablePageOption = (typeof DEFAULT_TABLE_PAGE_OPTIONS)[number];

type DataTablePaginationProps = {
  currentPage: number;
  pageOptions?: readonly string[];
  rowsPerPage: string;
  showingFrom: number;
  showingTo: number;
  totalItems: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (value: string) => void;
};

function pageWindow(totalPages: number, currentPage: number) {
  const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function DataTablePagination({
  currentPage,
  pageOptions = DEFAULT_TABLE_PAGE_OPTIONS,
  rowsPerPage,
  showingFrom,
  showingTo,
  totalItems,
  totalPages,
  onPageChange,
  onRowsPerPageChange,
}: DataTablePaginationProps) {
  const pages = pageWindow(totalPages, currentPage);

  return (
    <div className="flex flex-col gap-4 border-t border-border/40 bg-muted/15 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <p className="font-sans text-sm text-muted-foreground lg:w-60">
        Showing {showingFrom}-{showingTo} of {totalItems} items
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1 lg:flex-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || totalItems === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {pages.map((pageNumber) => (
          <Button
            key={pageNumber}
            type="button"
            variant={pageNumber === currentPage ? "default" : "outline"}
            size="icon"
            className="h-9 w-9 rounded-full font-sans text-sm"
            onClick={() => onPageChange(pageNumber)}
            disabled={totalItems === 0}
          >
            {pageNumber}
          </Button>
        ))}

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 rounded-full"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || totalItems === 0}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-3 lg:w-60 lg:justify-end">
        <span className="font-sans text-sm text-muted-foreground">Rows per page:</span>
        <Select value={rowsPerPage} onValueChange={onRowsPerPageChange}>
          <SelectTrigger className="h-9 w-[96px] rounded-full bg-background font-sans">
            <SelectValue placeholder="10" />
          </SelectTrigger>
          <SelectContent>
            {pageOptions.map((option) => (
              <SelectItem key={option} value={option} className="font-sans">
                {option === "all" ? "All" : option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
