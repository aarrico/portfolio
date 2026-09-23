import { test, expect } from "@playwright/test";

test("navigates Home → About → Projects → detail → Resume → Contact", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("ARRICO");

  await page.getByRole("link", { name: "About" }).click();
  await expect(page).toHaveURL(/\/about$/);

  await page.getByRole("link", { name: "Projects" }).click();
  await expect(page).toHaveURL(/\/projects$/);

  await page
    .getByRole("link", { name: /starly/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/projects\/starly$/);
  await expect(
    page.getByRole("img", { name: /starly pipeline simulation/i }),
  ).toBeVisible();
  await page.getByRole("button", { name: /fill queue/i }).click();
  await expect(page.getByRole("log")).toContainText("503", { timeout: 15_000 });

  await page.goBack();
  await page
    .getByRole("link", { name: /advection-diffusion solver/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/projects\/advection-diffusion$/);
  const windSlider = page.getByLabel(/wind speed/i);
  await expect(windSlider).toBeVisible();
  await windSlider.fill("2");
  await expect(windSlider).toHaveValue("2");
  const curve = page.getByRole("img", { name: /concentration curve at t/i });
  await expect(curve).not.toHaveAttribute("aria-label", /t = 0\.00$/);
  await page.getByRole("button", { name: "Pause", exact: true }).click();
  const paused = await curve.getAttribute("aria-label");
  await page.waitForTimeout(250);
  await expect(curve).toHaveAttribute("aria-label", paused!);
  await page.getByRole("button", { name: "Play", exact: true }).click();
  await expect(curve).not.toHaveAttribute("aria-label", paused!);

  await page.goBack();
  await page
    .getByRole("link", { name: /portfolio site/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/projects\/portfolio$/);

  await page.getByRole("link", { name: "Resume" }).click();
  await expect(page).toHaveURL(/\/resume$/);
  await expect(page.getByRole("link", { name: /download pdf/i })).toBeVisible();

  await page.getByRole("link", { name: "Contact" }).click();
  await expect(page).toHaveURL(/\/contact$/);
  const email = page.getByRole("main").getByRole("link", { name: "Email" });
  await expect(email).toBeVisible();
  await expect(email).toHaveAttribute(
    "href",
    /^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/,
  );
  await expect(page.locator("form")).toHaveCount(0);
});
