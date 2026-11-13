import { test as baseTest } from '@playwright/test';
import { SlotGamePage } from '../pages/slot_game.page';
import { SafariHeatPage } from '../pages/safari_heat.page';
import { VideoConverter } from '../utils/video_converter';
import { Logger } from '../utils/logger';
import * as path from 'path';
import * as fs from 'fs';

type GameFixtures = {
  slotGamePage: SlotGamePage;
  safariHeatPage: SafariHeatPage;
};

export const test = baseTest.extend<GameFixtures>({
  slotGamePage: async ({ page, context }, use, testInfo) => {
    const gamePage = new SlotGamePage(page);

    // Bắt đầu thực thi test case
    await use(gamePage);

    // TEARDOWN: Sau khi test case kết thúc
    const videoObj = page.video();

    // Đóng page và context để Playwright hoàn tất ghi file video
    await page.close().catch(() => {});
    await context.close().catch(() => {});

    // Chuyển đổi video ghi lại từ WebM sang MP4
    if (videoObj) {
      try {
        const webmPath = await videoObj.path();
        if (webmPath && fs.existsSync(webmPath)) {
          // Lấy testId từ tiêu đề test (ví dụ "[TC_LINE_01] Winline 1..." -> "TC_LINE_01")
          const match = testInfo.title.match(/\[(.*?)\]/);
          const testId = match ? match[1] : testInfo.title.replace(/[^a-zA-Z0-9_-]/g, '_');

          const baseEvidenceDir = process.env.EVIDENCE_DIR || 'evidence';
          const evidenceVideosDir = path.resolve(process.cwd(), baseEvidenceDir, 'videos');
          if (!fs.existsSync(evidenceVideosDir)) {
            fs.mkdirSync(evidenceVideosDir, { recursive: true });
          }

          const outputMp4Path = path.join(evidenceVideosDir, `${testId}.mp4`);
          await VideoConverter.convertWebmToMp4(webmPath, outputMp4Path);
        }
      } catch (err: any) {
        Logger.warn(`Không thể trích xuất hoặc convert video cho test [${testInfo.title}]: ${err.message}`);
      }
    }
  },

  // Alias tương thích ngược cho safariHeatPage
  safariHeatPage: async ({ slotGamePage }, use) => {
    await use(slotGamePage as SafariHeatPage);
  },
});

export { expect } from '@playwright/test';
