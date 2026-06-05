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

// ─── Input types ──────────────────────────────────────────────────

export type CreateDepartmentInput = {
  name: string;
  code: string;
  parentId?: string | null;
  sortOrder?: number;
};

export type UpdateDepartmentInput = {
  departmentId: string;
  name: string;
  code: string;
  parentId?: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type CreatePositionInput = {
  name: string;
  code: string;
  sortOrder?: number;
};

export type UpdatePositionInput = {
  positionId: string;
  name: string;
  code: string;
  sortOrder: number;
  isActive: boolean;
};

// ─── Department fetchers ──────────────────────────────────────────

export async function getDepartmentTree(): Promise<DepartmentDto[]> {
  return apiFetch<DepartmentDto[]>(`${BASE}/departments/tree`);
}

export async function getDepartmentById(id: string): Promise<DepartmentDto> {
  return apiFetch<DepartmentDto>(`${BASE}/departments/${encodeURIComponent(id)}`);
}

export async function createDepartment(input: CreateDepartmentInput): Promise<string> {
  return apiFetch<string>(`${BASE}/departments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateDepartment(input: UpdateDepartmentInput): Promise<void> {
  await apiFetch<void>(`${BASE}/departments/${encodeURIComponent(input.departmentId)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deleteDepartment(id: string): Promise<void> {
  await apiFetch<void>(`${BASE}/departments/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ─── Position fetchers ────────────────────────────────────────────

export async function getPositions(): Promise<PositionDto[]> {
  return apiFetch<PositionDto[]>(`${BASE}/positions`);
}

export async function createPosition(input: CreatePositionInput): Promise<string> {
  return apiFetch<string>(`${BASE}/positions`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updatePosition(input: UpdatePositionInput): Promise<void> {
  await apiFetch<void>(`${BASE}/positions/${encodeURIComponent(input.positionId)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

export async function deletePosition(id: string): Promise<void> {
  await apiFetch<void>(`${BASE}/positions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
