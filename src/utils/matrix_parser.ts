import * as fs from 'fs';
import * as path from 'path';
import { WinlineTestCase } from '../types/winline.types';
import { Logger } from './logger';

export class MatrixParser {
  /**
   * Phân tích và tải danh sách Winlines từ file JSON hoặc file Text thô
   * Hỗ trợ tự động nhận diện định dạng file.
   */
  public static parseFile(filePath: string): WinlineTestCase[] {
    const resolvedPath = path.resolve(process.cwd(), filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`File dữ liệu không tồn tại: ${resolvedPath}`);
    }

    const content = fs.readFileSync(resolvedPath, 'utf8').trim();
    if (!content) {
      throw new Error(`File dữ liệu trống: ${resolvedPath}`);
    }

    // Nếu là file JSON (bắt đầu bằng [ hoặc {)
    if (filePath.endsWith('.json') || content.startsWith('[') || content.startsWith('{')) {
      return this.parseJsonContent(content);
    }

    // Mặc định phân tích dạng Text thô
    return this.parseRawTextContent(content);
  }

  /**
   * Phân tích nội dung JSON
   */
  public static parseJsonContent(content: string): WinlineTestCase[] {
    try {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => {
          const testId = item.testId || `TC_LINE_${String(index + 1).padStart(2, '0')}`;
          const description = item.description || `Kiểm tra Winline ${index + 1}`;
          let matrix = item.matrix;
          if (typeof matrix === 'string') {
            matrix = matrix.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
          }
          return {
            ...item,
            testId,
            description,
            matrix
          };
        });
      } else if (parsed.winlines && Array.isArray(parsed.winlines)) {
        return this.parseJsonContent(JSON.stringify(parsed.winlines));
      }
      throw new Error('Định dạng JSON phải là một mảng các WinlineTestCase hoặc có thuộc tính winlines[]');
    } catch (err: any) {
      throw new Error(`Lỗi parse JSON Winline: ${err.message}`);
    }
  }

  /**
   * Phân tích nội dung Text thô (hỗ trợ copy-paste trực tiếp từ Chat/Excel/Notepad)
   * Ví dụ hỗ trợ:
   * Line 01: [10, 11, 12, 10, 11, 2, 2, 2, 2, 2, 12, 10, 11, 12, 10]
   * Line 2: 3, 3, 3, 3, 3, 10, 11, 12, 10, 11, 12, 10, 11, 12, 10
   * 10, 11, 12, 10, 11, 12, 10, 11, 12, 10, 4, 4, 4, 4, 4
   */
  public static parseRawTextContent(content: string): WinlineTestCase[] {
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('#') && !l.startsWith('//'));
    const testCases: WinlineTestCase[] = [];

    let autoIndex = 1;

    for (const line of lines) {
      // Tìm số dòng nếu có (Line 01, Line 1, Winline 01...)
      const lineLabelMatch = line.match(/(?:Line|Winline|Dòng)\s*(\d+)[:\s-]*/i);
      let lineNum = autoIndex;
      if (lineLabelMatch && lineLabelMatch[1]) {
        lineNum = parseInt(lineLabelMatch[1], 10);
      }

      // Trích xuất mảng các số nguyên từ dòng
      // Tìm phần nằm trong dấu ngoặc vuông [...] hoặc toàn bộ chuỗi số
      let matrixStr = '';
      const bracketMatch = line.match(/\[(.*?)\]/);
      if (bracketMatch) {
        matrixStr = bracketMatch[1];
      } else {
        // Loại bỏ phần nhãn "Line XX:" nếu có
        matrixStr = line.replace(/^(?:Line|Winline|Dòng)\s*\d+[:\s-]*/i, '');
      }

      // Tách các số nguyên phân tách bởi dấu phẩy, khoảng trắng hoặc chấm phẩy
      const numbers = matrixStr
        .split(/[,;\s]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0 && !isNaN(Number(s)))
        .map(s => parseInt(s, 10));

      if (numbers.length === 0) {
        Logger.warn(`Bỏ qua dòng không chứa số ma trận hợp lệ: "${line}"`);
        continue;
      }

      const testId = `TC_LINE_${String(lineNum).padStart(2, '0')}`;
      const description = `Kiểm tra Winline ${String(lineNum).padStart(2, '0')} (${numbers.length} ô ma trận)`;

      testCases.push({
        testId,
        description,
        matrix: numbers
      });

      autoIndex++;
    }

    if (testCases.length === 0) {
      throw new Error('Không trích xuất được bất kỳ ma trận Winline hợp lệ nào từ nội dung được cung cấp.');
    }

    return testCases;
  }

  /**
   * Lưu danh sách test cases ra file JSON chuẩn
   */
  public static saveToJson(testCases: WinlineTestCase[], targetPath: string): void {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetPath, JSON.stringify(testCases, null, 2), 'utf8');
  }
}

