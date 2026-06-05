import { expect, test } from "@playwright/test";
import { mockJsonResponse } from "../helpers/api-mocks";
import { seedAuthedSession, TEST_USER } from "../helpers/auth-seed";
import { installShellMocks } from "../helpers/shell-mocks";

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
];

test.beforeEach(async ({ page }) => {
  await seedAuthedSession(page, TEST_USER);
  await installShellMocks(page);
});

test.describe("positions page", () => {
  test("renders the Positions heading and rows", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/positions", POSITIONS);

    await page.goto("/organization/positions");

    await expect(page.getByRole("heading", { name: "Positions", level: 1 })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Chief Executive Officer")).toBeVisible();
    await expect(page.getByText("Chief Technology Officer")).toBeVisible();
    await expect(page.getByText("Engineer")).toBeVisible();
  });

  test("shows empty state when no positions", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/positions", []);

    await page.goto("/organization/positions");

    await expect(page.getByText(/no positions/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test("does NOT show create/edit/delete buttons (read-only)", async ({ page }) => {
    await mockJsonResponse(page, "**/api/v1/organization/positions", POSITIONS);

    await page.goto("/organization/positions");

    await expect(page.getByRole("button", { name: /new position/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /edit/i })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /delete/i })).not.toBeVisible();
  });
});
