import { Page, Locator, expect } from '@playwright/test';
import { Logger } from '../utils/logger';
import * as path from 'path';
import * as fs from 'fs';

export abstract class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Điều hướng đến URL và chờ trang load hoàn tất
   */
  async goto(url: string): Promise<void> {
    Logger.info(`Navigating to URL: ${url}`);
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Chờ element hiển thị và tương tác được
   */
  async waitForVisible(locator: Locator, timeoutMs = 15000): Promise<void> {
    await expect(locator).toBeVisible({ timeout: timeoutMs });
  }

  /**
   * Click an toàn với auto-wait
   */
  async safeClick(locator: Locator, description = ''): Promise<void> {
    if (description) Logger.info(`Clicking: ${description}`);
    await this.waitForVisible(locator);
    await locator.click();
  }

  /**
   * Chụp ảnh màn hình lưu bằng chứng kiểm thử vào thư mục evidence/screenshots
   */
  async takeScreenshot(name: string): Promise<Buffer> {
    const evidenceDir = path.resolve(process.cwd(), 'evidence/screenshots');
    if (!fs.existsSync(evidenceDir)) {
      fs.mkdirSync(evidenceDir, { recursive: true });
    }

    const filePath = path.join(evidenceDir, `${name}.png`);
    Logger.info(`Lưu ảnh bằng chứng: ${filePath}`);
    return await this.page.screenshot({ path: filePath, fullPage: false });
  }
}
