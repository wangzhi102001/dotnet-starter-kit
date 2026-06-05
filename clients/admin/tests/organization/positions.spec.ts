import { expect, test } from "@playwright/test";
import { mockJsonResponse } from "../helpers/api-mocks";
import { seedAuthedSession, TEST_USER } from "../helpers/auth-seed";
import { installAdminShellMocks, ADMIN_PERMS } from "../helpers/shell-mocks";

type PosRow = {
  id: string;
  name: string;
  code: string;
  sortOrder: number;
  isActive: boolean;
};

function pos(over: Partial<PosRow> = {}): PosRow {
  return {
    id: "p-ceo",
    name: "Chief Executive Officer",
    code: "CEO",
    sortOrder: 1,
    isActive: true,
    ...over,
  };
}

const POSITIONS: PosRow[] = [
  pos(),
  pos({ id: "p-cto", name: "Chief Technology Officer", code: "CTO", sortOrder: 2 }),
  pos({ id: "p-eng", name: "Engineer", code: "ENG", sortOrder: 10 }),
  pos({ id: "p-intern", name: "Intern", code: "INTERN", sortOrder: 50, isActive: false }),
];

test.beforeEach(async ({ page }) => {
  await seedAuthedSession(page, { ...TEST_USER, permissions: [...ADMIN_PERMS] });
  await installAdminShellMocks(page);
});

test.describe("positions list", () => {
  test("renders the Positions heading and rows", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/positions", POSITIONS);

    await page.goto("/organization/positions");

    const main = page.getByRole("main");
    await expect(main.getByRole("heading", { name: "Positions", exact: true })).toBeVisible({
      timeout: 10_000,
    });
    // Scope to <ol> (desktop table) to avoid hidden mobile cards at desktop viewport
    await expect(main.locator("ol").getByText("Chief Executive Officer")).toBeVisible();
    await expect(main.locator("ol").getByText("Chief Technology Officer")).toBeVisible();
    await expect(main.locator("ol").getByText("Engineer")).toBeVisible();
  });

  test("shows empty state when no positions exist", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/positions", []);

    await page.goto("/organization/positions");

    await expect(page.getByText(/no positions defined yet/i)).toBeVisible({
      timeout: 10_000,
    });
  });
});

test.describe("positions create form", () => {
  test("renders create dialog and POSTs correct body", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/positions", POSITIONS);

    await page.route("**/api/v1/organization/positions", async (route) => {
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

    await page.goto("/organization/positions");
    await page.getByRole("button", { name: "New position" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel(/^Name/)).toBeVisible({ timeout: 10_000 });

    await dialog.getByLabel(/^Name/).fill("Designer");
    await dialog.getByLabel(/^Code/).fill("DSGN");

    const reqPromise = page.waitForRequest(
      (r) => r.url().endsWith("/api/v1/organization/positions") && r.method() === "POST",
      { timeout: 5_000 },
    );

    await dialog.getByRole("button", { name: /create position/i }).click();

    const req = await reqPromise;
    const body = JSON.parse(req.postData() ?? "{}");
    expect(body).toMatchObject({ name: "Designer", code: "DSGN" });
  });
});
