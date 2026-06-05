import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Network } from "lucide-react";
import { getDepartmentTree, type DepartmentDto } from "@/api/organization";
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

const DESKTOP_COLS = "grid-cols-[1fr_120px_100px_80px]";

function depthFromPath(path: string | null | undefined): number {
  if (!path) return 0;
  return path.split("/").filter(Boolean).length - 1;
}

export function DepartmentsPage() {
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["organization", "departments", "tree"],
    queryFn: getDepartmentTree,
  });

  const items = query.data ?? [];

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => (a.path ?? "").localeCompare(b.path ?? ""));
    return copy;
  }, [items]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q),
    );
  }, [sorted, search]);

  const totalCount = items.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      <EntityPageHeader
        icon={Network}
        title="Departments"
        total={totalCount || null}
        unit="department"
        description={
          query.isLoading
            ? "Loading..."
            : `${totalCount} ${totalCount === 1 ? "department" : "departments"} in the organization.`
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
          <span>{(query.error as Error)?.message ?? "Failed to load departments"}</span>
        </div>
      ) : items.length === 0 ? (
        <EntityEmpty
          icon={Network}
          title="No departments"
          body="The organization chart is empty. Departments will appear here once created by an administrator."
        />
      ) : (
        <div>
          <p className="mb-3 text-[12px] font-medium text-[var(--color-muted-foreground)]">
            {filtered.length} of {totalCount} department{totalCount !== 1 ? "s" : ""}
          </p>

          <EntityListCard>
            <EntityListHeader className={DESKTOP_COLS}>
              <span>Department</span>
              <span>Code</span>
              <span>Members</span>
              <span>Status</span>
            </EntityListHeader>
            {filtered.map((d, i) => (
              <DepartmentRow
                key={d.id}
                department={d}
                isLast={i === filtered.length - 1}
              />
            ))}
          </EntityListCard>
        </div>
      )}
    </div>
  );
}

function DepartmentRow({
  department,
  isLast,
}: {
  department: DepartmentDto;
  isLast: boolean;
}) {
  const depth = depthFromPath(department.path);

  return (
    <EntityListRow className={DESKTOP_COLS} isLast={isLast}>
      <div
        className="flex min-w-0 items-center gap-2.5"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {depth > 0 && (
          <span aria-hidden className="text-[var(--color-border)]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </span>
        )}
        <span className="truncate text-[14px] font-medium text-[var(--color-foreground)]">
          {department.name}
        </span>
      </div>
      <code className="truncate font-mono text-[12px] text-[var(--color-muted-foreground)]">
        {department.code}
      </code>
      <span className="text-[12px] tabular-nums text-[var(--color-muted-foreground)]">
        {department.memberCount}
      </span>
      <span
        className={cn(
          "inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[10.5px] font-medium",
          department.isActive
            ? "bg-[oklch(from_var(--color-success)_l_c_h_/_0.12)] text-[var(--color-success)]"
            : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
        )}
      >
        {department.isActive ? "Active" : "Inactive"}
      </span>
    </EntityListRow>
  );
}
