import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
import {
  getPositions,
  createPosition,
  updatePosition,
  deletePosition,
  type PositionDto,
  type CreatePositionInput,
  type UpdatePositionInput,
} from "@/api/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, EntityPageHeader, ErrorBand } from "@/components/list";
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

const positionSchema = z.object({
  name: z.string().trim().min(1, "Required.").max(128),
  code: z
    .string()
    .trim()
    .min(1, "Required.")
    .max(64)
    .regex(/^[A-Z0-9_-]+$/, "Uppercase letters, digits, dash, underscore only."),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

type PositionFormValues = z.infer<typeof positionSchema>;

// ─── Editor state ──────────────────────────────────────────────────

type EditorState =
  | { mode: "closed" }
  | { mode: "create" }
  | { mode: "edit"; position: PositionDto }
  | { mode: "delete"; position: PositionDto };

// ─── Desktop grid ──────────────────────────────────────────────────

const DESKTOP_COLS = "grid-cols-[1fr_140px_80px_80px_24px]";

// ─── Page ──────────────────────────────────────────────────────────

export function PositionsPage() {
  const queryClient = useQueryClient();
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });
  const [search, setSearch] = useState("");

  const query = useQuery({
    queryKey: ["positions"],
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
  const isFiltered = search.trim().length > 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      <EntityPageHeader
        icon={Briefcase}
        title="Positions"
        total={totalCount || null}
        unit="position"
        description={
          query.isLoading
            ? "Loading positions..."
            : `${totalCount} ${totalCount === 1 ? "position" : "positions"} defined.`
        }
      >
        <Button
          onClick={() => setEditor({ mode: "create" })}
          className="h-9 flex-1 gap-1.5 rounded-lg px-4 text-[13px] font-semibold sm:flex-none"
        >
          <Plus className="size-4" /> New position
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
          aria-label="Search positions"
          className="h-9 w-full rounded-md border border-[var(--color-input)] bg-transparent pl-9 pr-3 font-mono text-[12.5px] outline-none transition-colors placeholder:text-[oklch(from_var(--color-muted-foreground)_l_c_h_/_0.7)] focus-visible:border-[var(--color-ring)] focus-visible:ring-[3px] focus-visible:ring-[oklch(from_var(--color-ring)_l_c_h_/_0.5)]"
        />
      </div>

      {/* Error */}
      {query.isError && (
        <ErrorBand
          message={
            query.error instanceof ApiRequestError
              ? query.error.problem?.detail ?? query.error.message
              : "Failed to load positions."
          }
        />
      )}

      {/* Loading */}
      {query.isLoading && (
        <div
          role="status"
          className="py-12 text-center font-mono text-sm uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]"
        >
          Loading...
        </div>
      )}

      {/* Empty */}
      {!query.isLoading && items.length === 0 && !query.isError && (
        <EmptyState
          icon={Briefcase}
          kicker="// no positions"
          title="No positions defined yet."
          description="Create positions to assign to users across departments."
          action={
            <Button variant="outline" onClick={() => setEditor({ mode: "create" })}>
              New position
            </Button>
          }
        />
      )}

      {/* No search results */}
      {!query.isLoading && items.length > 0 && filtered.length === 0 && (
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
            {filtered.length} position{filtered.length !== 1 ? "s" : ""}
            {isFiltered && ` matching "${search}"`}
          </p>

          {/* Mobile cards */}
          <div className="space-y-2 md:hidden">
            {filtered.map((p) => (
              <PositionMobileCard
                key={p.id}
                position={p}
                onEdit={() => setEditor({ mode: "edit", position: p })}
                onDelete={() => setEditor({ mode: "delete", position: p })}
              />
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-xs md:block">
            <div
              className={`grid items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-muted)]/40 px-4 py-2.5 ${DESKTOP_COLS}`}
            >
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Position
              </span>
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Code
              </span>
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Order
              </span>
              <span className="text-[11.5px] font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">
                Status
              </span>
              <span />
            </div>

            <ol className="divide-y divide-[var(--color-border)]">
              {filtered.map((p, i) => (
                <PositionDesktopRow
                  key={p.id}
                  position={p}
                  isLast={i === filtered.length - 1}
                  onEdit={() => setEditor({ mode: "edit", position: p })}
                  onDelete={() => setEditor({ mode: "delete", position: p })}
                />
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <PositionEditorDialog
        editor={editor}
        onClose={() => setEditor({ mode: "closed" })}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["positions"] });
          setEditor({ mode: "closed" });
        }}
      />

      <DeletePositionDialog
        editor={editor}
        onClose={() => setEditor({ mode: "closed" })}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["positions"] });
          setEditor({ mode: "closed" });
        }}
      />
    </div>
  );
}

// ─── Mobile card ────────────────────────────────────────────────────

function PositionMobileCard({
  position,
  onEdit,
  onDelete,
}: {
  position: PositionDto;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 shadow-xs",
        !position.isActive && "opacity-70",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--color-muted)] text-[var(--color-muted-foreground)]"
          >
            <Briefcase className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[14px] font-medium text-[var(--color-foreground)]">
              {position.name}
            </p>
            <code className="mt-0.5 block truncate text-[11px] text-[var(--color-muted-foreground)]">
              {position.code}
            </code>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${position.name}`}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-muted-foreground)] hover:bg-[var(--color-accent)] hover:text-[var(--color-foreground)]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${position.name}`}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-muted-foreground)] hover:bg-[oklch(from_var(--color-destructive)_l_c_h_/_0.12)] hover:text-[var(--color-destructive)]"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-2 ml-[44px] flex flex-wrap items-center gap-1.5">
        <span className="font-mono text-[10.5px] text-[var(--color-muted-foreground)]">
          Order: {position.sortOrder}
        </span>
        <span
          className={cn(
            "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10.5px] font-medium",
            position.isActive
              ? "bg-[oklch(from_var(--color-success)_l_c_h_/_0.12)] text-[var(--color-success)]"
              : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
          )}
        >
          {position.isActive ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
}

// ─── Desktop row ────────────────────────────────────────────────────

function PositionDesktopRow({
  position,
  onEdit,
  onDelete,
}: {
  position: PositionDto;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <li className={cn("list-none", !position.isActive && "opacity-70")}>
      <div
        className={cn(
          `group grid w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-accent)] ${DESKTOP_COLS}`,
        )}
      >
        {/* Name */}
        <span className="truncate text-[14px] font-medium text-[var(--color-foreground)]">
          {position.name}
        </span>

        {/* Code */}
        <code className="truncate font-mono text-[12px] text-[var(--color-muted-foreground)]">
          {position.code}
        </code>

        {/* Sort order */}
        <span className="text-[12px] tabular-nums text-[var(--color-muted-foreground)]">
          {position.sortOrder}
        </span>

        {/* Status */}
        <span
          className={cn(
            "inline-flex w-fit items-center rounded-full px-1.5 py-0.5 text-[10.5px] font-medium",
            position.isActive
              ? "bg-[oklch(from_var(--color-success)_l_c_h_/_0.12)] text-[var(--color-success)]"
              : "bg-[var(--color-muted)] text-[var(--color-muted-foreground)]",
          )}
        >
          {position.isActive ? "Active" : "Inactive"}
        </span>

        {/* Actions */}
        <div className="flex items-center justify-end gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`Edit ${position.name}`}
            className="grid h-7 w-7 place-items-center rounded-md text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`Delete ${position.name}`}
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

function PositionEditorDialog({
  editor,
  onClose,
  onSuccess,
}: {
  editor: EditorState;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isOpen = editor.mode === "create" || editor.mode === "edit";
  const isEdit = editor.mode === "edit";
  const existing = isEdit ? editor.position : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PositionFormValues>({
    resolver: zodResolver(positionSchema),
    defaultValues: {
      name: existing?.name ?? "",
      code: existing?.code ?? "",
      sortOrder: existing?.sortOrder ?? 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (input: CreatePositionInput) => createPosition(input),
    onSuccess: () => {
      toast.success("Position created.");
      onSuccess();
    },
    onError: (err) => {
      toast.error("Failed to create position.", {
        description: err instanceof ApiRequestError ? err.problem?.detail ?? err.message : undefined,
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdatePositionInput) => updatePosition(input),
    onSuccess: () => {
      toast.success("Position updated.");
      onSuccess();
    },
    onError: (err) => {
      toast.error("Failed to update position.", {
        description: err instanceof ApiRequestError ? err.problem?.detail ?? err.message : undefined,
      });
    },
  });

  const onSubmit = handleSubmit((values: PositionFormValues) => {
    if (isEdit && existing) {
      updateMutation.mutate({
        positionId: existing.id,
        name: values.name,
        code: values.code,
        sortOrder: values.sortOrder,
        isActive: existing.isActive,
      });
    } else {
      createMutation.mutate({
        name: values.name,
        code: values.code,
        sortOrder: values.sortOrder,
      });
    }
  });

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
          <DialogTitle>{isEdit ? "Edit position" : "New position"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Update ${existing?.name ?? ""} — code and sort order.`
              : "Define a position that can be assigned to users."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit}>
          <DialogBody className="space-y-4">
            <Field id="pos-name" label="Name" error={errors.name?.message}>
              <Input
                id="pos-name"
                {...register("name")}
                placeholder="e.g. Chief Technology Officer"
                autoFocus
                aria-invalid={!!errors.name}
              />
            </Field>

            <Field id="pos-code" label="Code" error={errors.code?.message}>
              <Input
                id="pos-code"
                {...register("code")}
                placeholder="e.g. CTO"
                className="font-mono uppercase"
                aria-invalid={!!errors.code}
              />
            </Field>

            <Field id="pos-sort" label="Sort order">
              <Input
                id="pos-sort"
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
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Create position"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete dialog ──────────────────────────────────────────────────

function DeletePositionDialog({
  editor,
  onClose,
  onSuccess,
}: {
  editor: EditorState;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isOpen = editor.mode === "delete";
  const position = editor.mode === "delete" ? editor.position : null;

  const mutation = useMutation({
    mutationFn: (id: string) => deletePosition(id),
    onSuccess: () => {
      toast.success("Position deleted.");
      onSuccess();
    },
    onError: (err) => {
      toast.error("Failed to delete position.", {
        description: err instanceof ApiRequestError ? err.problem?.detail ?? err.message : undefined,
      });
    },
  });

  if (!position) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="sm">
        <DialogHeader>
          <DialogTitle>Delete position</DialogTitle>
          <DialogDescription>
            This permanently removes{" "}
            <strong className="text-[var(--color-foreground)]">{position.name}</strong>{" "}
            ({position.code}). Positions assigned to users cannot be deleted — reassign them first.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => mutation.mutate(position.id)}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Deleting..." : "Delete position"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
