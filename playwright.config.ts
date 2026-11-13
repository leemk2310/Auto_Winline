import { defineConfig, devices } from '@playwright/test';

const vpWidth = parseInt(process.env.VIEWPORT_WIDTH || '1440', 10);
const vpHeight = parseInt(process.env.VIEWPORT_HEIGHT || '900', 10);
const isHeadless = process.env.HEADLESS === 'true';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1, // Chạy tuần tự từng test case để quan sát rõ ràng
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }]
  ],
  timeout: 120000, // 2 phút mỗi test case
  expect: {
    timeout: 20000,
  },
  use: {
    viewport: { width: vpWidth, height: vpHeight },
    headless: isHeadless,
    actionTimeout: 20000,
    navigationTimeout: 60000,
    trace: 'retain-on-failure',
    screenshot: 'on',
    video: {
      mode: 'on',
      size: { width: vpWidth, height: vpHeight },
    },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: `Slot Browser (${vpWidth}x${vpHeight})`,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: vpWidth, height: vpHeight },
        video: {
          mode: 'on',
          size: { width: vpWidth, height: vpHeight },
        },
      },
    },
  ],
});
