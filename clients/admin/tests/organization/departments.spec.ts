import { expect, test } from "@playwright/test";
import { mockJsonResponse } from "../helpers/api-mocks";
import { seedAuthedSession, TEST_USER } from "../helpers/auth-seed";
import { installAdminShellMocks, ADMIN_PERMS } from "../helpers/shell-mocks";

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
    sortOrder: 0,
  }),
  dept({
    id: "d-eng-be",
    name: "Backend",
    code: "ENG-BE",
    path: "/engineering/backend",
    parentId: "d-eng",
    memberCount: 7,
    sortOrder: 1,
  }),
  dept({ id: "d-sales", name: "Sales", code: "SALES", path: "/sales", memberCount: 3 }),
];

test.beforeEach(async ({ page }) => {
  await seedAuthedSession(page, { ...TEST_USER, permissions: [...ADMIN_PERMS] });
  await installAdminShellMocks(page);
});

test.describe("departments list", () => {
  test("renders the Departments heading and tree rows", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/departments/tree", TREE);

    await page.goto("/organization/departments");

    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { name: "Departments", exact: true })).toBeVisible({
      timeout: 10_000,
    });
    // Scope to <ol> (desktop table) to avoid hidden mobile cards at desktop viewport
    await expect(main.locator("ol").getByText("Engineering")).toBeVisible();
    await expect(main.locator("ol").getByText("Frontend")).toBeVisible();
    await expect(main.locator("ol").getByText("Backend")).toBeVisible();
    await expect(main.locator("ol").getByText("Sales", { exact: true })).toBeVisible();
  });

  test("shows empty state when no departments exist", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/departments/tree", []);

    await page.goto("/organization/departments");

    await expect(page.getByText(/no departments defined yet/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("departments create form", () => {
  test("renders the create dialog with fields", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/departments/tree", TREE);

    await page.goto("/organization/departments");
    await page.getByRole("button", { name: "New department" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "New department" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(dialog.getByLabel(/^Name/)).toBeVisible();
    await expect(dialog.getByLabel(/^Code/)).toBeVisible();
  });

  test("submitting the form POSTs correct body", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/departments/tree", TREE);

    await page.route("**/api/v1/organization/departments", async (route) => {
      if (route.request().method() !== "POST") {
        await route.fallback();
        return;
      }
      await route.fulfill({
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: '"new-guid"',
      });
    });

    await page.goto("/organization/departments");
    await page.getByRole("button", { name: "New department" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByLabel(/^Name/).fill("Marketing");
    await dialog.getByLabel(/^Code/).fill("MKTG");

    const reqPromise = page.waitForRequest(
      (r) => r.url().endsWith("/api/v1/organization/departments") && r.method() === "POST",
      { timeout: 5_000 },
    );

    await dialog.getByRole("button", { name: /create department/i }).click();

    const req = await reqPromise;
    const body = JSON.parse(req.postData() ?? "{}");
    expect(body).toMatchObject({ name: "Marketing", code: "MKTG" });
  });

  test("client-side validation blocks empty name", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/departments/tree", TREE);

    let posted = false;
    await page.route("**/api/v1/organization/departments", async (route) => {
      if (route.request().method() === "POST") posted = true;
      await route.fallback();
    });

    await page.goto("/organization/departments");
    await page.getByRole("button", { name: "New department" }).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("button", { name: /create department/i }).click();

    // Both name and code are required, so 2 "Required." messages appear
    await expect(dialog.getByText("Required.").first()).toBeVisible();
    expect(posted).toBe(false);
  });
});

test.describe("departments delete", () => {
  test("delete confirmation shows warning and sends DELETE", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/departments/tree", TREE);

    await page.goto("/organization/departments");

    // The delete button has opacity-0 on desktop (visible on hover);
    // use { force: true } to bypass actionability checks.
    const deleteBtn = page.getByRole("button", { name: "Delete Frontend" });
    await deleteBtn.click({ force: true });

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/permanently removes/i)).toBeVisible();

    const reqPromise = page.waitForRequest(
      (r) => r.url().endsWith("/api/v1/organization/departments/d-eng-fe") && r.method() === "DELETE",
      { timeout: 5_000 },
    );

    await dialog.getByRole("button", { name: /delete department/i }).click();
    await reqPromise;
  });
});
