import { test, expect } from "@playwright/test";

test("navigates Home → About → Projects → detail → Resume → Contact", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ARRICO");

  await page.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);

  await page.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);

  await page.getByRole("link", { name: /portfolio site/i }).first().click();
  await expect(page).toHaveURL(/\/projects\/portfolio$/);

  await page.getByRole("link", { name: "Resume" }).click();
  await expect(page).toHaveURL(/\/resume$/);
  await expect(page.getByRole("link", { name: /download pdf/i })).toBeVisible();

  await page.getByRole("link", { name: "Contact" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByLabel("Email")).toBeVisible();
});
