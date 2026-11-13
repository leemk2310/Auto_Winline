#!/usr/bin/env node

/**
 * ============================================================================
 * UNIVERSAL SLOT WINLINE AUTOMATION RUNNER (CLI TOOLKIT)
 * Công cụ tự động hoá kiểm thử và quay video MP4 cho mọi game Slot Cocos
 * ============================================================================
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Phân tích tham số dòng lệnh
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    url: process.env.GAME_URL || '',
    data: process.env.WINLINE_DATA_PATH || '',
    delay: process.env.DELAY_AFTER_SPIN || '10',
    viewport: '1440x900',
    headless: false,
    filter: '',
    out: '',
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '-u' || arg === '--url') {
      options.url = args[++i];
    } else if (arg === '-d' || arg === '--data') {
      options.data = args[++i];
    } else if (arg === '--delay') {
      options.delay = args[++i];
    } else if (arg === '--viewport') {
      options.viewport = args[++i];
    } else if (arg === '--headless') {
      options.headless = true;
    } else if (arg === '-g' || arg === '--filter') {
      options.filter = args[++i];
    } else if (arg === '-o' || arg === '--out') {
      options.out = args[++i];
    } else if (arg === '-h' || arg === '--help') {
      options.help = true;
    }
  }

  return options;
}

function showHelp() {
  console.log(`
================================================================================
🎰 UNIVERSAL SLOT WINLINE AUTOMATION RUNNER
================================================================================

Cách sử dụng:
  node bin/runner.js [options]

Các tham số (Options):
  -u, --url <URL>        URL của Slot Game cần kiểm tra (BẮT BUỘC)
                         Ví dụ: "https://neo-v2-play-staging.1kk6s8yq.com/slot/release/v1.1.3g-cheat/?game=n53989&cheat=1"

  -d, --data <PATH>      Đường dẫn file Winline cần kiểm tra (.json hoặc .txt)
                         Hỗ trợ copy/paste ma trận dạng: Line 01: [10, 11, ...] hoặc mảng JSON.
                         Mặc định: test-data/winlines.json

  --delay <SECONDS>      Thời gian dừng để quan sát UI sau mỗi vòng quay (giây).
                         Mặc định: 10

  --viewport <WxH>       Độ phân giải màn hình trình duyệt (Width x Height).
                         Mặc định: 1440x900

  --headless             Chạy ở chế độ ẩn (không mở cửa sổ trình duyệt).
                         Mặc định: Mở trình duyệt thật (headed mode).

  -g, --filter <REGEX>   Lọc và chỉ chạy test case khớp với tên (ví dụ: -g "TC_LINE_01")

  -o, --out <DIR>        Thư mục lưu video MP4 và ảnh chụp màn hình.
                         Mặc định: evidence/<game_id>/

  -h, --help             Hiển thị hướng dẫn sử dụng này.

Ví dụ:
  # 1. Chạy với URL và file Winlines mới:
  node bin/runner.js -u "https://.../?game=n53989&cheat=1" -d "test-data/my_winlines.txt"

  # 2. Chạy với thời gian dừng 5 giây và lưu vào thư mục riêng:
  node bin/runner.js -u "https://.../?game=n53989&cheat=1" -d "test-data/winlines.json" --delay 5 -o "evidence/safari_run_1"

  # 3. Chạy kiểm tra nhanh chỉ Line 01:
  node bin/runner.js -u "https://.../?game=n53989&cheat=1" -g "TC_LINE_01"
================================================================================
`);
}

function extractGameId(url) {
  if (!url) return 'slot_game';
  const match = url.match(/[?&]game=([^&#]+)/i);
  return match ? match[1] : 'slot_game';
}

function normalizeDataFile(rawPath) {
  if (!rawPath) {
    const defaultJson = path.resolve(__dirname, '../test-data/winlines.json');
    if (fs.existsSync(defaultJson)) return defaultJson;
    return path.resolve(__dirname, '../test-data/winlines.sample.json');
  }

  const resolved = path.resolve(process.cwd(), rawPath);
  if (!fs.existsSync(resolved)) {
    console.error(`❌ [LỖI] Không tìm thấy file dữ liệu: ${resolved}`);
    process.exit(1);
  }
  return resolved;
}

async function run() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    process.exit(0);
  }

  // Fallback URL nếu chưa truyền
  if (!options.url) {
    options.url = 'https://neo-v2-play-staging.1kk6s8yq.com/slot/release/v1.1.3g-cheat/?game=n53989&acctId=TESTPLAYER21@TEST&cheat=1';
    console.log(`⚠️  Chưa truyền --url, sử dụng URL mặc định: ${options.url}`);
  }

  // Đảm bảo URL có tham số cheat=1
  if (!options.url.includes('cheat=1')) {
    const separator = options.url.includes('?') ? '&' : '?';
    options.url += `${separator}cheat=1`;
    console.log(`ℹ️  Đã tự động thêm tham số cheat=1 vào URL.`);
  }

  const dataFilePath = normalizeDataFile(options.data);
  const gameId = extractGameId(options.url);

  // Phân tích kích thước viewport
  let [vpWidth, vpHeight] = options.viewport.split('x').map(n => parseInt(n.trim(), 10));
  if (isNaN(vpWidth) || isNaN(vpHeight)) {
    vpWidth = 1440;
    vpHeight = 900;
  }

  // Thư mục lưu evidence (luôn đặt trong project root/evidence/<gameId>)
  const projectRoot = path.resolve(__dirname, '..');
  const evidenceDir = options.out ? path.resolve(process.cwd(), options.out) : path.resolve(projectRoot, 'evidence', gameId);
  const videosDir = path.resolve(evidenceDir, 'videos');
  const screenshotsDir = path.resolve(evidenceDir, 'screenshots');

  fs.mkdirSync(videosDir, { recursive: true });
  fs.mkdirSync(screenshotsDir, { recursive: true });

  console.log(`
================================================================================
🎰 KHỞI ĐỘNG KIỂM THỬ TỰ ĐỘNG SLOT GAME WINLINES
================================================================================
  🎮 Game ID:             ${gameId.toUpperCase()}
  🔗 Game URL:            ${options.url}
  📄 File Dữ Liệu:        ${dataFilePath}
  🖥️  Màn Hình Viewport:   ${vpWidth}x${vpHeight}
  👀 Chế Độ Hiển Thị:     ${options.headless ? 'Headless (Ẩn giao diện)' : 'Headed (Mở trình duyệt trực quan)'}
  ⏳ Dừng Quan Sát UI:    ${options.delay} giây sau mỗi vòng quay
  📁 Thư Mục Evidence:    ${evidenceDir}/
  🎥 Định Dạng Video:     MP4 (Mỗi Test Case 1 Video riêng)
================================================================================
`);

  // Thiết lập biến môi trường cho Playwright process
  const env = {
    ...process.env,
    GAME_URL: options.url,
    WINLINE_DATA_PATH: dataFilePath,
    DELAY_AFTER_SPIN: options.delay,
    VIEWPORT_WIDTH: String(vpWidth),
    VIEWPORT_HEIGHT: String(vpHeight),
    EVIDENCE_DIR: evidenceDir,
    HEADLESS: options.headless ? 'true' : 'false'
  };

  const cliPath = path.resolve(__dirname, '../node_modules/@playwright/test/cli.js');
  const configPath = path.resolve(__dirname, '../playwright.config.ts');

  const cliArgs = [cliPath, 'test', '--config', configPath];
  if (!options.headless) {
    cliArgs.push('--headed');
  }
  if (options.filter) {
    cliArgs.push('-g', options.filter);
  }

  const startTime = Date.now();
  const child = spawn(process.execPath, cliArgs, {
    cwd: path.resolve(__dirname, '..'),
    env,
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n================================================================================`);
    if (code === 0) {
      console.log(`✅ [HOÀN TẤT XUẤT SẮC] Toàn bộ test case đã hoàn thành trong ${duration}s!`);
    } else {
      console.log(`⚠️  [KẾT THÚC CÓ LỖI] Quá trình kiểm thử kết thúc với mã lỗi: ${code} (${duration}s)`);
    }
    console.log(`📁 Thư mục video MP4:    ${videosDir}`);
    console.log(`📸 Thư mục ảnh chụp PNG: ${screenshotsDir}`);
    console.log(`================================================================================\n`);
    process.exit(code || 0);
  });
}

run().catch((err) => {
  console.error('❌ Lỗi khởi chạy Runner:', err);
  process.exit(1);
});

