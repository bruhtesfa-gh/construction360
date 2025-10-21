"use client";

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Search, Plus, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DemoQuote {
  id: string;
  contractNumber: string | null;
  quoteContractType: string | null;
  status: string | null;
  createdAt: string | null;
  communityCode: string | null;
  communityPhaseCode: string | null;
  lot: string | null;
  block: string | null;
  state: string | null;
}

const DEMO_QUOTES: DemoQuote[] = [
  {
    id: 'qc-001',
    contractNumber: 'QC-001',
    quoteContractType: 'New Construction',
    status: 'Pending',
    createdAt: '2024-09-12T10:24:00Z',
    communityCode: 'SUNNY-VALLEY',
    communityPhaseCode: 'PH1',
    lot: 'Lot 12',
    block: 'Block A',
    state: 'TX',
  },
  {
    id: 'qc-002',
    contractNumber: 'QC-002',
    quoteContractType: 'Spec Home',
    status: 'Approved',
    createdAt: '2024-08-30T15:45:00Z',
    communityCode: 'HIGHLAND-PARK',
    communityPhaseCode: 'PH2',
    lot: 'Lot 7',
    block: 'Block C',
    state: 'CO',
  },
  {
    id: 'qc-003',
    contractNumber: 'QC-003',
    quoteContractType: 'Custom Build',
    status: 'Draft',
    createdAt: '2024-09-21T09:10:00Z',
    communityCode: 'LAKEVIEW',
    communityPhaseCode: 'PH3',
    lot: 'Lot 2',
    block: 'Block D',
    state: 'AZ',
  },
  {
    id: 'qc-004',
    contractNumber: 'QC-004',
    quoteContractType: 'New Construction',
    status: 'Pending',
    createdAt: '2024-07-18T12:00:00Z',
    communityCode: 'SUNNY-VALLEY',
    communityPhaseCode: 'PH1',
    lot: 'Lot 3',
    block: 'Block A',
    state: 'TX',
  },
  {
    id: 'qc-005',
    contractNumber: 'QC-005',
    quoteContractType: 'Spec Home',
    status: 'Closed',
    createdAt: '2024-09-05T18:30:00Z',
    communityCode: 'MEADOW-RIDGE',
    communityPhaseCode: 'PH2',
    lot: 'Lot 18',
    block: 'Block B',
    state: 'TX',
  },
];

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export default function ManageQuotePage() {
  const router = useRouter();

  const [searchValue, setSearchValue] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredQuotes = useMemo(() => {
    const term = appliedSearch.trim().toLowerCase();
    if (!term) return DEMO_QUOTES;
    return DEMO_QUOTES.filter((quote) =>
      [
        quote.contractNumber,
        quote.quoteContractType,
        quote.status,
        quote.communityCode,
        quote.communityPhaseCode,
        quote.lot,
        quote.block,
        quote.state,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(term))
    );
  }, [appliedSearch]);

  const totalCount = filteredQuotes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedQuotes = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredQuotes.slice(start, end);
  }, [filteredQuotes, page, pageSize]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(searchValue.trim());
  };

  const handleClear = () => {
    setSearchValue('');
    setAppliedSearch('');
    setPage(1);
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value));
    setPage(1);
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  };

  const startIndex = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = totalCount === 0 ? 0 : Math.min(page * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Quote Management</h1>
          <p className="text-sm text-muted-foreground">
            Review and search existing quote contracts for this builder.
          </p>
        </div>
        <Button onClick={() => router.push('/sales_and_marketing/quote-management/add-quote')}>
          <Plus className="mr-2 h-4 w-4" /> Add Quote
        </Button>
      </div>

      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search by contract, community, or lot"
              className="pl-9"
            />
            {searchValue && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button type="submit" variant="secondary">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
          <div className="flex items-center gap-2">
            <label htmlFor="quote-page-size" className="text-sm text-muted-foreground">
              Rows per page
            </label>
            <select
              id="quote-page-size"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </form>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Phase Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Community Code
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Lot
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Block
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Contract Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  State
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {paginatedQuotes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-muted-foreground">
                    No quote contracts found.
                  </td>
                </tr>
              ) : (
                paginatedQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 text-sm">{quote.communityPhaseCode ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">{quote.communityCode ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">{quote.lot ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">{quote.block ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">{quote.quoteContractType ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">{quote.state ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      {quote.createdAt ? format(new Date(quote.createdAt), 'MM/dd/yyyy') : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Showing {startIndex} to {endIndex} of {totalCount} quotes
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={handleNextPage} disabled={page === totalPages}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
