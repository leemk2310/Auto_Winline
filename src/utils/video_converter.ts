import { execFile } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

const FFMPEG_PATHS = [
  'C:\\Users\\LeMinhKhanh(Lee)\\AppData\\Local\\Monosnap\\current\\FFmpeg\\ffmpeg.exe',
  'ffmpeg.exe',
  'ffmpeg'
];

export class VideoConverter {
  private static resolvedFfmpegPath: string | null = null;

  public static getFfmpegPath(): string | null {
    if (this.resolvedFfmpegPath) return this.resolvedFfmpegPath;

    for (const p of FFMPEG_PATHS) {
      if (fs.existsSync(p)) {
        this.resolvedFfmpegPath = p;
        return p;
      }
    }
    this.resolvedFfmpegPath = 'ffmpeg'; // fallback to PATH
    return this.resolvedFfmpegPath;
  }

  /**
   * Chuyển đổi video WebM ghi từ Playwright sang MP4 chuẩn (H.264 / yuv420p)
   * Định dạng tương thích hoàn hảo với mọi trình phát video, Jira, Teams và báo cáo.
   */
  public static async convertWebmToMp4(inputWebmPath: string, outputMp4Path: string): Promise<boolean> {
    const ffmpeg = this.getFfmpegPath();
    if (!ffmpeg) {
      Logger.error('Không tìm thấy FFmpeg binary trên hệ thống!');
      return false;
    }

    if (!fs.existsSync(inputWebmPath)) {
      Logger.error(`File nguồn WebM không tồn tại: ${inputWebmPath}`);
      return false;
    }

    // Đảm bảo thư mục đích tồn tại
    const targetDir = path.dirname(outputMp4Path);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    Logger.info(`[VideoConverter] Bắt đầu convert WebM sang MP4: ${path.basename(outputMp4Path)}...`);

    const runFfmpeg = (codec: string): Promise<{ success: boolean; error?: string }> => {
      return new Promise((resolve) => {
        const args = [
          '-y',
          '-i', inputWebmPath,
          '-c:v', codec,
          '-pix_fmt', 'yuv420p',
          '-movflags', '+faststart',
          outputMp4Path
        ];

        execFile(ffmpeg, args, (error, _stdout, stderr) => {
          if (error) {
            resolve({ success: false, error: stderr || error.message });
          } else {
            resolve({ success: true });
          }
        });
      });
    };

    let result = await runFfmpeg('h264_mf');
    if (!result.success) {
      Logger.warn(`[VideoConverter] Encoder h264_mf thất bại, chuyển sang libopenh264: ${result.error}`);
      result = await runFfmpeg('libopenh264');
    }

    if (result.success && fs.existsSync(outputMp4Path)) {
      const stats = fs.statSync(outputMp4Path);
      Logger.info(`[VideoConverter] ✅ Convert MP4 thành công: ${outputMp4Path} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
      return true;
    } else {
      Logger.error(`[VideoConverter] ❌ Không thể tạo file MP4: ${result.error}`);
      return false;
    }
  }
}

