import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Building2,
  Network,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  getDepartmentTree,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  type DepartmentDto,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
} from "@/api/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Field, Select, EntityPageHeader, ErrorBand } from "@/components/list";
import { EmptyState } from "@/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import { ApiRequestError } from "@/lib/api-client";
import { cn } from "@/lib/cn";

// ─── Schema ────────────────────────────────────────────────────────

const departmentSchema = z.object({
  name: z.string().trim().min(1, "Required.").max(128),
  code: z
    .string()
    .trim()
    .min(1, "Required.")
    .max(64)
    .regex(/^[A-Z0-9_-]+$/, "Uppercase letters, digits, dash, underscore only."),
  parentId: z.string().nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

type DepartmentFormValues = z.infer<typeof departmentSchema>;

// ─── Editor state ──────────────────────────────────────────────────

type EditorState =
  | { mode: "closed" }
  | { mode: "create"; parentId?: string | null }
  | { mode: "edit"; department: DepartmentDto }
  | { mode: "delete"; department: DepartmentDto };

// ─── Desktop grid ──────────────────────────────────────────────────

const DESKTOP_COLS = "grid-cols-[1fr_120px_80px_80px_24px]";

// ─── Helpers ───────────────────────────────────────────────────────

function depthFromPath(path: string | null | undefined): number {
  if (!path) return 0;
  return path.split("/").filter(Boolean).length - 1;
}

// ─── Page ──────────────────────────────────────────────────────────

export function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });
  const [search, setSearch] = useState("");

  const treeQuery = useQuery({
    queryKey: ["departments", "tree"],
    queryFn: getDepartmentTree,
  });

  const items = treeQuery.data ?? [];

  const sorted = useMemo(() => {
    const copy = [...items];
    copy.sort((a, b) => (a.path ?? "").localeCompare(b.path ?? ""));
    return copy;
  }, [items]);

  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q),
    );
  }, [sorted, search]);

  const totalCount = items.length;
  const isFiltered = search.trim().length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <EntityPageHeader
        icon={Building2}
        title="Departments"
        total={totalCount || null}
        unit="department"
        description={
          treeQuery.isLoading
            ? "Loading the organization structure..."
            : `${totalCount} ${totalCount === 1 ? "department" : "departments"} in the organization.`
        }
      >
        <Button
          onClick={() => setEditor({ mode: "create" })}
          className="h-9 flex-1 gap-1.5 rounded-lg px-4 text-[13px] font-semibold sm:flex-none"
        >
          <Plus className="size-4" /> New department
        </Button>
      </EntityPageHeader>

      {/* Search */}
      <div className="relative w-full max-w-sm">
        <span
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-foreground)]"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </span>
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, code..."
          aria-label="Search departments"
          className="h-9 w-full rounded-md border border-[var(--color-input)] bg-transparent pl-9 pr-3 font-mono text-[12.5px] outline-none transition-colors placeholder:text-[oklch(from_var(--color-muted-foreground)_l_c_h_/_0.7)] focus-visible:border-[var(--color-ring)] focus-visible:ring-[3px] focus-visible:ring-[oklch(from_var(--color-ring)_l_c_h_/_0.5)]"
        />
      </div>

      {/* Error */}
      {treeQuery.isError && (
        <ErrorBand
          message={
            treeQuery.error instanceof ApiRequestError
              ? treeQuery.error.problem?.detail ?? treeQuery.error.message
              : "Failed to load departments."
          }
        />
      )}

      {/* Loading */}
      {treeQuery.isLoading && (
        <div
          role="status"
          className="py-12 text-center font-mono text-sm uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]"
        >
          Loading...
        </div>
      )}

      {/* Empty */}
      {!treeQuery.isLoading && items.length === 0 && !treeQuery.isError && (
        <EmptyState
          icon={Network}
          kicker="// no departments"
          title="No departments defined yet."
          description="Create the root departments to start building your organization chart."
          action={
            <Button variant="outline" onClick={() => setEditor({ mode: "create" })}>
              New department
            </Button>
          }
        />
      )}

      {/* No search results */}
      {!treeQuery.isLoading && items.length > 0 && filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="font-display text-2xl text-[var(--color-foreground)]">No matches.</p>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Try adjusting your search terms.
          </p>
          <Button
            variant="outline"
            className="mt-4 h-9 rounded-lg px-4 text-[13px]"
            onClick={() => setSearch("")}
          >
            Clear search
          </Button>
        </div>
      )}

      {/* Results */}
      {filtered.length > 0 && (
        <div>
          <p className="mb-3 text-[12px] font-medium text-[var(--color-muted-foreground)]">
            {filtered.length} department{filtered.length !== 1 ? "s" : ""}
            {isFiltered && ` matching "${search}"`}
          </p>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {filtered.map((d) => (
              <DepartmentMobileCard
                key={d.id}
                department={d}
                onEdit={() => setEditor({ mode: "edit", department: d })}
                onDelete={() => setEditor({ mode: "delete", department: d })}
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xs md:block">
            <div
              className={`grid items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 px-4 py-2.5 ${DESKTOP_COLS}`}
            >
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Department
              </span>
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Code
              </span>
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Members
              </span>
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Status
              </span>
              <span />
            </div>

            <ol className="divide-y divide-[var(--color-border)]">
              {filtered.map((d, i) => (
                <DepartmentDesktopRow
                  key={d.id}
                  department={d}
                  isLast={i === filtered.length - 1}
                  onEdit={() => setEditor({ mode: "edit", department: d })}
                  onDelete={() => setEditor({ mode: "delete", department: d })}
                />
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <DepartmentEditorDialog
        editor={editor}
        departments={items}
        onClose={() => setEditor({ mode: "closed" })}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["departments", "tree"] });
          setEditor({ mode: "closed" });
        }}
      />

      <DeleteDepartmentDialog
        editor={editor}
        onClose={() => setEditor({ mode: "closed" })}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["departments", "tree"] });
          setEditor({ mode: "closed" });
        }}
      />
    </div>
  );
}

// ─── Mobile card ────────────────────────────────────────────────────

function DepartmentMobileCard({
  department,
  onEdit,
  onDelete,
}: {
  department: DepartmentDto;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const depth = depthFromPath(department.path);

  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-xs",
        !department.isActive && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3" style={{ paddingLeft: `${depth * 16}px` }}>
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
          >
            <Network className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-[var(--color-foreground)]">
              {department.name}
            </p>
            <code className="mt-0.5 block truncate text-[11px] text-[var(--color-muted-foreground)]">
              {department.code}
            </code>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${department.name}`}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${department.name}`}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-muted-foreground)] hover:bg-[oklch(from_var(--color-destructive)_l_c_h_/_0.12)] hover:text-[var(--color-destructive)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1.5" style={{ paddingLeft: `${depth * 16 + 44}px` }}>
        <Badge variant="outline" className="font-mono text-[10px]">
          {department.memberCount} {department.memberCount === 1 ? "member" : "members"}
        </Badge>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10.5px] font-medium",
            department.isActive
              ? "bg-[oklch(from_var(--color-success)_l_c_h_/_0.12)] text-[var(--color-success)]"
              : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
          )}
        >
          {department.isActive ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
}

// ─── Desktop row ────────────────────────────────────────────────────

function DepartmentDesktopRow({
  department,
  onEdit,
  onDelete,
}: {
  department: DepartmentDto;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const depth = depthFromPath(department.path);

  return (
    <li className={cn("list-none", !department.isActive && "opacity-70")}>
      <div
        className={cn(
          `group grid w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-accent)] ${DESKTOP_COLS}`,
        )}
      >
        {/* Name + indentation */}
        <div className="flex min-w-0 items-center gap-2.5" style={{ paddingLeft: `${depth * 20}px` }}>
          {depth > 0 && (
            <span aria-hidden className="text-[var(--color-border)]">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </span>
          )}
          <span className="truncate text-[14px] font-medium text-[var(--color-foreground)]">
            {department.name}
          </span>
        </div>

        {/* Code */}
        <code className="truncate font-mono text-[12px] text-[var(--color-muted-foreground)]">
          {department.code}
        </code>

        {/* Members */}
        <span className="text-[12px] tabular-nums text-[var(--color-muted-foreground)]">
          {department.memberCount}
        </span>

        {/* Status */}
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${department.name}`}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${department.name}`}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-muted-foreground)] hover:bg-[oklch(from_var(--color-destructive)_l_c_h_/_0.12)] hover:text-[var(--color-destructive)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </li>
  );
}

// ─── Create / Edit dialog ───────────────────────────────────────────

function DepartmentEditorDialog({
  editor,
  departments,
  onClose,
  onSuccess,
}: {
  editor: EditorState;
  departments: DepartmentDto[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isOpen = editor.mode === "create" || editor.mode === "edit";
  const isEdit = editor.mode === "edit";
  const existing = isEdit ? editor.department : null;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: existing?.name ?? "",
      code: existing?.code ?? "",
      parentId: existing?.parentId ?? null,
      sortOrder: existing?.sortOrder ?? 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateDepartmentInput) => createDepartment(input),
    onSuccess: () => {
      toast.success("Department created.");
      onSuccess();
    },
    onError: (err) => {
      toast.error("Failed to create department.", {
        description: err instanceof ApiRequestError ? err.problem?.detail ?? err.message : undefined,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateDepartmentInput) => updateDepartment(input),
    onSuccess: () => {
      toast.success("Department updated.");
      onSuccess();
    },
    onError: (err) => {
      toast.error("Failed to update department.", {
        description: err instanceof ApiRequestError ? err.problem?.detail ?? err.message : undefined,
      });
    },
  });

  const onSubmit = handleSubmit((values: DepartmentFormValues) => {
    if (isEdit && existing) {
      updateMutation.mutate({
        departmentId: existing.id,
        name: values.name,
        code: values.code,
        parentId: values.parentId || null,
        sortOrder: values.sortOrder,
        isActive: existing.isActive,
      });
    } else {
      createMutation.mutate({
        name: values.name,
        code: values.code,
        parentId: (editor.mode === "create" ? editor.parentId : values.parentId) || null,
        sortOrder: values.sortOrder,
      });
    }
  });

  // Parent department options with indentation
  const parentOptions = useMemo(() => {
    const sorted = [...departments];
    sorted.sort((a, b) => (a.path ?? "").localeCompare(b.path ?? ""));
    return sorted
      .filter((d) => !isEdit || d.id !== existing?.id) // exclude self
      .map((d) => {
        const depth = depthFromPath(d.path);
        const prefix = "    ".repeat(Math.max(0, depth));
        return { value: d.id, label: `${prefix}${d.name}` };
      });
  }, [departments, isEdit, existing?.id]);

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          onClose();
        }
      }}
    >
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit department" : "New department"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update ${existing?.name ?? ""} — code, parent, and sort order.`
              : "Add a department to the organization chart."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <DialogBody className="space-y-4">
            <Field id="dept-name" label="Name" error={errors.name?.message}>
              <Input
                id="dept-name"
                {...register("name")}
                placeholder="e.g. Engineering"
                autoFocus
                aria-invalid={!!errors.name}
              />
            </Field>

            <Field id="dept-code" label="Code" error={errors.code?.message}>
              <Input
                id="dept-code"
                {...register("code")}
                placeholder="e.g. ENG"
                className="font-mono uppercase"
                aria-invalid={!!errors.code}
              />
            </Field>

            <Field id="dept-parent" label="Parent department" hint="Optional. Leave empty for a root-level department.">
              <Select
                value={watch("parentId") ?? ""}
                onValueChange={(v) => setValue("parentId", v || null)}
                options={parentOptions}
                emptyLabel="None (root level)"
              />
            </Field>

            <Field id="dept-sort" label="Sort order">
              <Input
                id="dept-sort"
                {...register("sortOrder", { valueAsNumber: true })}
                type="number"
                min={0}
                className="w-24"
              />
            </Field>
          </DialogBody>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onClose();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete dialog ──────────────────────────────────────────────────

function DeleteDepartmentDialog({
  editor,
  onClose,
  onSuccess,
}: {
  editor: EditorState;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isOpen = editor.mode === "delete";
  const department = editor.mode === "delete" ? editor.department : null;

  const mutation = useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => {
      toast.success("Department deleted.");
      onSuccess();
    },
    onError: (err) => {
      toast.error("Failed to delete department.", {
        description: err instanceof ApiRequestError ? err.problem?.detail ?? err.message : undefined,
      });
    },
  });

  if (!department) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete department</DialogTitle>
          <DialogDescription>
            This permanently removes{" "}
            <strong className="text-[var(--color-foreground)]">{department.name}</strong>{" "}
            ({department.code}). Departments with child departments or assigned members cannot be
            deleted — reassign or remove them first.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate(department.id)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Deleting..." : "Delete department"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
