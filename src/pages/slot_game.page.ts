import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { Logger } from '../utils/logger';
import { WinlineTestCase } from '../types/winline.types';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Universal Slot Game Page Object
 * Áp dụng cho mọi game slot phát triển trên nền tảng Cocos Web Engine với Cheat Overlay
 */
export class SlotGamePage extends BasePage {
  // Locators dùng chung cho mọi game slot
  readonly canvas: Locator;
  readonly cheatOverlay: Locator;
  readonly matrixInput: Locator;
  readonly applyButton: Locator;
  readonly clearButton: Locator;
  readonly nearWinButton: Locator;
  readonly freeGameButton: Locator;
  readonly splashLoading: Locator;

  // Cấu hình linh hoạt theo biến môi trường
  readonly delayAfterSpinMs: number;
  readonly evidenceBaseDir: string;

  constructor(page: Page) {
    super(page);
    this.canvas = page.locator('#GameCanvas');
    this.cheatOverlay = page.locator('#cheat-overlay');
    this.matrixInput = page.locator('#cheat-overlay input[type="text"]');
    this.applyButton = page.locator('#cheat-overlay button:has-text("Apply")');
    this.clearButton = page.locator('#cheat-overlay button:has-text("Clear")');
    this.nearWinButton = page.locator('#cheat-overlay button:has-text("NearWin")');
    this.freeGameButton = page.locator('#cheat-overlay button:has-text("FreeGame")');
    this.splashLoading = page.locator('#splash');

    // Đọc delay từ biến môi trường (mặc định 10 giây)
    const envDelay = process.env.DELAY_AFTER_SPIN ? parseInt(process.env.DELAY_AFTER_SPIN, 10) : 10;
    this.delayAfterSpinMs = (!isNaN(envDelay) && envDelay >= 0 ? envDelay : 10) * 1000;

    // Đọc thư mục evidence từ biến môi trường
    this.evidenceBaseDir = process.env.EVIDENCE_DIR || 'evidence';
  }

  /**
   * Trích xuất Game ID từ URL (ví dụ: ?game=n53989 -> "n53989")
   */
  public static extractGameId(url: string): string {
    const match = url.match(/[?&]game=([^&#]+)/i);
    return match ? match[1] : 'slot_game';
  }

  /**
   * Mở game với viewport cấu hình và chờ game nạp xong hoàn toàn
   */
  async openGame(gameUrl: string): Promise<void> {
    const currentUrl = this.page.url();
    const gameId = SlotGamePage.extractGameId(gameUrl);

    if (currentUrl.includes(`game=${gameId}`) && await this.canvas.isVisible().catch(() => false)) {
      Logger.info(`[${gameId}] Trình duyệt đã ở sẵn trong game, bỏ qua reload để giữ trạng thái.`);
      return;
    }

    const vpWidth = parseInt(process.env.VIEWPORT_WIDTH || '1440', 10);
    const vpHeight = parseInt(process.env.VIEWPORT_HEIGHT || '900', 10);

    Logger.info(`Mở Slot Game [${gameId}] tại: ${gameUrl}`);
    Logger.info(`Thiết lập Viewport: ${vpWidth}x${vpHeight}`);
    await this.page.setViewportSize({ width: vpWidth, height: vpHeight });
    await this.goto(gameUrl);

    // 1. Chờ màn hình splash loading ẩn đi
    Logger.info('Chờ màn hình splash loading nạp xong assets...');
    try {
      await this.splashLoading.waitFor({ state: 'hidden', timeout: 45000 });
    } catch {
      Logger.warn('Splash loading không ẩn sau 45s, tiếp tục kiểm tra Game Canvas...');
    }

    // 2. Chờ GameCanvas hiển thị
    Logger.info('Chờ Game Canvas sẵn sàng...');
    await expect(this.canvas).toBeVisible({ timeout: 45000 });

    // 3. Đảm bảo Cheat Overlay hiển thị
    Logger.info('Kiểm tra Cheat Overlay trên giao diện...');
    await expect(this.cheatOverlay).toBeVisible({ timeout: 30000 });

    // 4. Chờ 3 giây để game engine ổn định
    Logger.info('Chờ 3 giây để hệ thống game hoàn tất render ban đầu...');
    await this.page.waitForTimeout(3000);
    Logger.info(`Slot Game [${gameId}] & Cheat Menu đã sẵn sàng 100%!`);
  }

  /**
   * Inject chuỗi Ma trận 15 ô biểu tượng thông qua Cheat Menu
   */
  async injectMatrix(matrix: number[] | string): Promise<void> {
    const matrixStr = Array.isArray(matrix) ? matrix.join(',') : matrix;
    Logger.info(`Injecting Matrix: [${matrixStr}]`);

    // Mở rộng cheat menu nếu đang bị thu nhỏ
    const isMenuExpanded = await this.matrixInput.isVisible().catch(() => false);
    if (!isMenuExpanded) {
      const toggleBtn = this.cheatOverlay.locator('button').first();
      await toggleBtn.click();
      await this.page.waitForTimeout(500);
    }

    // Nhập giá trị ma trận vào ô input
    await this.matrixInput.click();
    await this.matrixInput.fill(matrixStr);
    await this.page.waitForTimeout(500);

    // Nhấn Apply
    await this.applyButton.click();
    Logger.info('Đã nhấn [Apply] ma trận cheat.');

    // Chờ 1.5 giây để quan sát ma trận đã được nạp
    await this.page.waitForTimeout(1500);
  }

  /**
   * Kích hoạt vòng quay và chờ cuộn dừng hoàn tất
   */
  async spinReels(): Promise<void> {
    Logger.info('Bắt đầu quay cuộn (nhấn phím Spacebar)...');

    // Focus vào canvas và bấm Spacebar để quay
    await this.canvas.focus();
    await this.page.keyboard.press('Space');

    // Chờ 1.5s tạo hiệu ứng cuộn quay
    await this.page.waitForTimeout(1500);

    // Bấm Spacebar lần 2 để dừng cuộn tại ma trận đã nạp
    await this.page.keyboard.press('Space');

    // Chờ 3s để cuộn dừng hoàn toàn và các đường winline sáng lên
    Logger.info('Chờ cuộn dừng và đường Winline hiển thị...');
    await this.page.waitForTimeout(3000);
    Logger.info('Vòng quay đã dừng lại.');
  }

  /**
   * Chụp ảnh bằng chứng cho test case
   */
  async captureScreenshot(testId: string): Promise<void> {
    const screenshotDir = path.resolve(process.cwd(), this.evidenceBaseDir, 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    const filePath = path.join(screenshotDir, `${testId}.png`);
    Logger.info(`Lưu ảnh bằng chứng: ${filePath}`);
    await this.page.screenshot({ path: filePath, fullPage: false });
  }

  /**
   * Thực hiện toàn bộ quy trình kiểm thử cho 1 test case winline:
   * 1. Inject Matrix
   * 2. Spin & Stop Reels
   * 3. Capture Screenshot
   * 4. Tạm dừng quan sát UI
   */
  async executeWinlineTest(testCase: WinlineTestCase): Promise<void> {
    Logger.testStep(`Kiểm thử ${testCase.testId}: ${testCase.description}`);

    // Bước 1: Inject ma trận
    await this.injectMatrix(testCase.matrix);

    // Bước 2: Quay cuộn
    await this.spinReels();

    // Bước 3: Chụp ảnh bằng chứng
    await this.captureScreenshot(testCase.testId);

    // Bước 4: Tạm dừng theo cấu hình (mặc định 10 giây) để quan sát UI trực quan
    const delaySec = this.delayAfterSpinMs / 1000;
    Logger.info(`⏳ TẠM DỪNG ${delaySec} GIÂY: Vui lòng quan sát kết quả Winline (${testCase.testId}) trên màn hình...`);
    await this.page.waitForTimeout(this.delayAfterSpinMs);
    Logger.info(`✅ Đã quan sát xong ${delaySec}s cho ${testCase.testId}. Chuẩn bị chuyển sang test case tiếp theo.`);
  }
}

