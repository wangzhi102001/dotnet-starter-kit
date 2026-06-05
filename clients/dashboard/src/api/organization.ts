import { apiFetch } from "@/lib/api-client";

const BASE = "/api/v1/organization";

// ─── DTOs ─────────────────────────────────────────────────────────

export type DepartmentDto = {
  id: string;
  name: string;
  code: string;
  path?: string | null;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
  memberCount: number;
  createdOnUtc: string;
};

export type PositionDto = {
  id: string;
  name: string;
  code: string;
  sortOrder: number;
  isActive: boolean;
};

// ─── Fetchers (read-only) ─────────────────────────────────────────

export async function getDepartmentTree(): Promise<DepartmentDto[]> {
  return apiFetch<DepartmentDto[]>(`${BASE}/departments/tree`);
}

export async function getPositions(): Promise<PositionDto[]> {
  return apiFetch<PositionDto[]>(`${BASE}/positions`);
}
