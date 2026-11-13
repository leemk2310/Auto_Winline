/**
 * Logger tiện ích với format chuẩn, phân biệt rõ các level: INFO, WARN, ERROR, DEBUG
 */
export class Logger {
  private static formatTime(): string {
    return new Date().toISOString();
  }

  static info(message: string, ...args: any[]): void {
    console.log(`[INFO]  [${this.formatTime()}] ${message}`, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    console.warn(`[WARN]  [${this.formatTime()}] ${message}`, ...args);
  }

  static error(message: string, ...args: any[]): void {
    console.error(`[ERROR] [${this.formatTime()}] ${message}`, ...args);
  }

  static testStep(stepName: string): void {
    console.log(`\n================== [STEP: ${stepName}] ==================`);
  }
}

