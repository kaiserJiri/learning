import { test, expect } from '@playwright/test';

const viewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 600, height: 960 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 1024, height: 768 },
  { width: 1180, height: 820 },
  { width: 1440, height: 1000 },
  { width: 844, height: 390 },
  { width: 568, height: 320 },
];

for (const viewport of viewports) {
  test(`dark layout and usable practice at ${viewport.width} × ${viewport.height}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/#home');
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));

    for (const [route, name] of [['home', 'Můj přehled'], ['lessons', 'Lekce'], ['words', 'Slovíčka'], ['progress', 'Můj pokrok']]) {
      await page.getByRole('navigation').getByRole('link', { name, exact: route !== 'lessons' }).click();
      await expect(page.locator('.nav-link.active')).toHaveAttribute('href', `#${route}`);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      const nav = await page.getByRole('navigation').getByRole('link', { name, exact: route !== 'lessons' }).boundingBox();
      expect(nav.height).toBeGreaterThanOrEqual(44);
      expect(nav.y).toBeGreaterThanOrEqual(0);
      expect(nav.y + nav.height).toBeLessThanOrEqual(viewport.height);
      expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toBe('dark');
    }

    await page.getByRole('link', { name: 'Můj přehled', exact: true }).click();
    const start = page.getByRole('button', { name: 'Začít první lekci' });
    await start.scrollIntoViewIfNeeded();
    // The decorative illustration must never cover the primary action.
    await start.click({ trial: true });
    await start.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    expect(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);

    for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Další slovíčko' }).click();
    await page.getByRole('button', { name: 'Jdeme na kvíz' }).click();
    await page.getByRole('button', { name: /^\d Ahoj$/ }).click();
    await expect(page.getByRole('status')).toHaveText('✓ Přesně tak!');
    await page.getByRole('button', { name: 'Další otázka' }).click();
    await page.getByRole('button', { name: 'Zavřít lekci' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
    expect(errors).toEqual([]);
  });
}
