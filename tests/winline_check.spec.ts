import { test, expect } from '../src/fixtures/base.fixture';
import { Logger } from '../src/utils/logger';
import { MatrixParser } from '../src/utils/matrix_parser';
import { SlotGamePage } from '../src/pages/slot_game.page';
import { WinlineTestCase } from '../src/types/winline.types';
import * as path from 'path';

const GAME_URL = process.env.GAME_URL || 'https://neo-v2-play-staging.1kk6s8yq.com/slot/release/v1.1.3g-cheat/?game=n53989&acctId=TESTPLAYER21@TEST&cheat=1';
const gameId = SlotGamePage.extractGameId(GAME_URL);

function loadWinlineTestCases(): WinlineTestCase[] {
  // 1. Ưu tiên đường dẫn file do người dùng chỉ định qua biến môi trường
  if (process.env.WINLINE_DATA_PATH) {
    Logger.info(`Đang nạp Winlines từ tham số chỉ định: ${process.env.WINLINE_DATA_PATH}`);
    return MatrixParser.parseFile(process.env.WINLINE_DATA_PATH);
  }

  // 2. Kiểm tra file cấu hình mặc định của dự án
  const defaultCustomPath = path.resolve(__dirname, '../test-data/winlines.json');
  try {
    return MatrixParser.parseFile(defaultCustomPath);
  } catch {
    // 3. Fallback sang dữ liệu mẫu
    const sampleDataPath = path.resolve(__dirname, '../test-data/winlines.sample.json');
    Logger.info(`Chưa có file chỉ định, dùng dữ liệu mẫu từ: ${sampleDataPath}`);
    return MatrixParser.parseFile(sampleDataPath);
  }
}

test.describe(`SLOT GAME [${gameId.toUpperCase()}] - AUTOMATION WINLINE VERIFICATION`, () => {
  const testCases = loadWinlineTestCases();

  test.beforeEach(async ({ slotGamePage }) => {
    // Mở game và chỉ reload nếu chưa ở đúng trang
    await slotGamePage.openGame(GAME_URL);
  });

  for (const tc of testCases) {
    test(`[${tc.testId}] ${tc.description}`, async ({ slotGamePage }) => {
      // 1. Thực hiện inject ma trận, quay và dừng cuộn
      await slotGamePage.executeWinlineTest(tc);

      Logger.info(`[PASS] Hoàn thành kiểm tra Winline: ${tc.testId}`);
    });
  }
});
