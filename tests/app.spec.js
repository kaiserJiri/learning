import { test, expect } from '@playwright/test';

const translations = ['Ahoj', 'Děkuji', 'Prosím', 'Na shledanou', 'Těší mě'];
async function learn(page) {
  await page.getByRole('button', { name: 'Začít první lekci' }).click();
  for (let i=0;i<4;i++) await page.getByRole('button', { name: 'Další slovíčko' }).click();
  await page.getByRole('button', { name: 'Jdeme na kvíz' }).click();
}
async function answer(page, allRight = true) {
  for (let i=0;i<5;i++) {
    const index = allRight ? i : (i + 1) % 5;
    await page.getByRole('button', { name: new RegExp(`^\\d ${translations[index]}$`) }).click();
    await page.getByRole('button', { name: i===4 ? 'Zobrazit výsledek' : 'Další otázka' }).click();
  }
}
test('complete a lesson and retain progress after reload', async ({ page }) => {
  await page.goto('/');
  await learn(page);
  await answer(page);
  await expect(page.getByText('Správně 5 z 5 odpovědí.')).toBeVisible();
  await page.getByRole('button', { name: 'Zpět na přehled' }).click();
  await page.reload();
  await page.getByRole('link', { name: 'Můj pokrok' }).click();
  await expect(page.getByRole('heading', { name: '1 ze 4 lekcí za tebou' })).toBeVisible();
  await expect(page.locator('.progress-numbers').getByText('5', {exact:true})).toBeVisible();
  await expect(page.locator('.progress-numbers').getByText('100 %', {exact:true})).toBeVisible();
});
test('incorrect answers teach the translation and do not complete the lesson', async ({ page }) => {
  await page.goto('/');
  await learn(page);
  await page.getByRole('button', { name: /^\d Děkuji$/ }).click();
  await expect(page.getByRole('status')).toContainText('Hello = Ahoj');
  await expect(page.locator('.answer.correct')).toContainText('Ahoj');
  await page.getByRole('button', { name: 'Další otázka' }).click();
  for (let i=1;i<5;i++) {
    await page.getByRole('button', { name: new RegExp(`^\\d ${translations[(i+1)%5]}$`) }).click();
    await page.getByRole('button', { name: i===4 ? 'Zobrazit výsledek' : 'Další otázka' }).click();
  }
  await expect(page.getByText('Správně 0 z 5 odpovědí.')).toBeVisible();
  await page.getByRole('button', { name: 'Zpět na přehled' }).click();
  await page.getByRole('link', { name: 'Můj pokrok' }).click();
  await expect(page.getByRole('heading', { name: '0 ze 4 lekcí za tebou' })).toBeVisible();
});
test('mobile vocabulary flips and navigation stays within viewport', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#words');
  await expect(page.getByRole('button', {name:'Otočit kartičku'})).toContainText('Hello');
  await page.getByRole('button', {name:'Otočit kartičku'}).click();
  await expect(page.getByRole('button', {name:'Otočit kartičku'})).toContainText('Ahoj');
  await page.getByRole('button', {name:'Další slovíčko'}).click();
  await expect(page.getByRole('button', {name:'Otočit kartičku'})).toContainText('Thank you');
  await page.getByRole('link', { name: 'Lekce' }).click();
  await expect(page.locator('.lesson-card')).toHaveCount(4);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
test('invalid saved data does not break the app and Escape closes lessons', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(()=>localStorage.setItem('little-step-progress-v1','{"completed":42}'));
  await page.reload();
  await page.getByRole('button', { name: 'Začít první lekci' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});
