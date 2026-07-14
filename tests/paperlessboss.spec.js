// @ts-check
import { test, expect } from '@playwright/test';

test.describe('PaperlessBoss E2E Tests', () => {
  
  test('Landing Page loads successfully', async ({ page }) => {
    // 1. Visit the production page
    await page.goto('https://paperlessboss.com');
    
    // 2. Verify title exists
    await expect(page).toHaveTitle(/PaperlessBoss/i);
    
    // 3. Verify Visakhapatnam address is displayed
    const address = page.locator('text=CodeCrafters Tower, Visakhapatnam, AP, India');
    await expect(address).toBeVisible();
  });

  test('Submit Contact Us Form', async ({ page }) => {
    await page.goto('https://paperlessboss.com');
    
    // Fill out Contact Us form fields
    await page.locator('#name').fill('Test User');
    await page.locator('#contactEmail').fill('test@example.com');
    await page.locator('#subject').fill('Playwright E2E Query');
    await page.locator('#message').fill('This is an automated E2E test message.');
    
    // Click submit
    await page.click('button:has-text("Send Message")');
    
    // Assert success response message
    await expect(page.locator('text=Thank you for getting in touch')).toBeVisible();
  });
});
