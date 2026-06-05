import { expect, test } from "@playwright/test";
import { mockJsonResponse } from "../helpers/api-mocks";
import { seedAuthedSession, TEST_USER } from "../helpers/auth-seed";
import { installShellMocks } from "../helpers/shell-mocks";

type DeptRow = {
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

function dept(over: Partial<DeptRow> = {}): DeptRow {
  return {
    id: "d-eng",
    name: "Engineering",
    code: "ENG",
    path: "/engineering",
    parentId: null,
    sortOrder: 0,
    isActive: true,
    memberCount: 12,
    createdOnUtc: "2026-01-15T00:00:00Z",
    ...over,
  };
}

const TREE: DeptRow[] = [
  dept(),
  dept({
    id: "d-eng-fe",
    name: "Frontend",
    code: "ENG-FE",
    path: "/engineering/frontend",
    parentId: "d-eng",
    memberCount: 5,
  }),
  dept({
    id: "d-eng-be",
    name: "Backend",
    code: "ENG-BE",
    path: "/engineering/backend",
    parentId: "d-eng",
    memberCount: 7,
  }),
  dept({ id: "d-sales", name: "Sales", code: "SALES", path: "/sales", memberCount: 3 }),
];

test.beforeEach(async ({ page }) => {
  await seedAuthedSession(page, TEST_USER);
  await installShellMocks(page);
});

test.describe("departments page", () => {
  test("renders the Departments heading and tree rows", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/departments/tree", TREE);

    await page.goto("/organization/departments");

    await expect(page.getByRole("heading", { name: "Departments", level: 1 })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Engineering")).toBeVisible();
    await expect(page.getByText("Frontend")).toBeVisible();
    await expect(page.getByText("Backend")).toBeVisible();
    await expect(page.getByText("Sales", { exact: true })).toBeVisible();
  });

  test("shows empty state when no departments", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/departments/tree", []);

    await page.goto("/organization/departments");

    await expect(page.getByText(/no departments/i)).toBeVisible({ timeout: 10_000 });
  });

  test("does NOT show create/edit/delete buttons (read-only)", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/departments/tree", TREE);

    await page.goto("/organization/departments");

    await expect(page.getByRole("button", { name: /new department/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /edit/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /delete/i })).not.toBeVisible();
  });

  test("shows member counts", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/departments/tree", TREE);

    await page.goto("/organization/departments");

    // Engineering has 12 members
    await expect(page.getByText("12")).toBeVisible();
    // Sales has 3 members
    await expect(page.getByText("3")).toBeVisible();
  });
});
