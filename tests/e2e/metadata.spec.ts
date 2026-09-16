import { expect, test } from "@playwright/test";

test("serves the themed SVG favicon from page metadata", async ({
  page,
  request,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  const icon = page.locator('link[rel="icon"][type="image/svg+xml"]');
  await expect(icon).toHaveAttribute("href", /^\/icon\.svg/);
  const asset = await request.get((await icon.getAttribute("href"))!);
  expect(asset.status()).toBe(200);
  expect(asset.headers()["content-type"]).toContain("image/svg+xml");
  expect(await asset.text()).toContain('mask="url(#m)"');
});

test("contact link remains visible on mobile with reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/contact");
  const email = page.locator('a[href^="mailto:"]');
  await expect(email).toBeVisible();
  await expect(email).toHaveAttribute(
    "href",
    `mailto:${await email.textContent()}`,
  );
  await expect(page.locator("form")).toHaveCount(0);
});
