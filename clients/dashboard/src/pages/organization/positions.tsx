import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Briefcase } from "lucide-react";
import { getPositions } from "@/api/organization";
import {
  EntityPageHeader,
  EntitySearch,
  EntityEmpty,
  EntityListCard,
  EntityListHeader,
  EntityListRow,
  EntityListLoading,
} from "@/components/list";
import { cn } from "@/lib/cn";

const DESKTOP_COLS = "grid-cols-[1fr_140px_100px_80px]";

export function PositionsPage() {
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["organization", "positions"],
    queryFn: getPositions,
  });

  const items = query.data ?? [];

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    return copy;
  }, [items]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q),
    );
  }, [sorted, search]);

  const totalCount = items.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <EntityPageHeader
        icon={Briefcase}
        title="Positions"
        total={totalCount || null}
        unit="position"
        description={
          query.isLoading
            ? "Loading..."
            : `${totalCount} ${totalCount === 1 ? "position" : "positions"} defined.`
        }
      />

      <EntitySearch
        value={search}
        onChange={setSearch}
        placeholder="Search name, code..."
      />

      {query.isLoading && items.length === 0 ? (
        <EntityListLoading desktopColumns={DESKTOP_COLS} />
      ) : query.isError ? (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-[oklch(from_var(--color-destructive)_l_c_h_/_0.30)] bg-[oklch(from_var(--color-destructive)_l_c_h_/_0.06)] px-3 py-2 text-sm text-[var(--color-destructive)]"
        >
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{(query.error as Error)?.message ?? "Failed to load positions"}</span>
        </div>
      ) : items.length === 0 ? (
        <EntityEmpty
          icon={Briefcase}
          title="No positions"
          body="No positions have been defined yet. They will appear here once created by an administrator."
        />
      ) : (
        <div>
          <p className="mb-3 text-[12px] font-medium text-[var(--color-muted-foreground)]">
            {filtered.length} of {totalCount} position{totalCount !== 1 ? "s" : ""}
          </p>

          <EntityListCard>
            <EntityListHeader className={DESKTOP_COLS}>
              <span>Position</span>
              <span>Code</span>
              <span>Order</span>
              <span>Status</span>
            </EntityListHeader>
            {filtered.map((p, i) => (
              <EntityListRow key={p.id} className={DESKTOP_COLS} isLast={i === filtered.length - 1}>
                <span className="truncate text-[14px] font-medium text-[var(--color-foreground)]">
                  {p.name}
                </span>
                <code className="truncate font-mono text-[12px] text-[var(--color-muted-foreground)]">
                  {p.code}
                </code>
                <span className="text-[12px] tabular-nums text-[var(--color-muted-foreground)]">
                  {p.sortOrder}
                </span>
                <span
                  className={cn(
                    "inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[10.5px] font-medium",
                    p.isActive
                      ? "bg-[oklch(from_var(--color-success)_l_c_h_/_0.12)] text-[var(--color-success)]"
                      : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
                  )}
                >
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </EntityListRow>
            ))}
          </EntityListCard>
        </div>
      )}
    </div>
  );
}
