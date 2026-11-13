/**
 * Định nghĩa cấu trúc dữ liệu cho bài kiểm thử Winline
 */
export interface WinlineExpected {
  /** Chỉ số dòng trúng thưởng (Line 1 đến Line 15) */
  lineIndex?: number;
  /** Tên hoặc ID của biểu tượng trúng thưởng */
  symbol?: string | number;
  /** Số lượng biểu tượng liên tiếp tạo thành chuỗi thắng (2, 3, 4, 5) */
  count?: number;
  /** Có sự tham gia của biểu tượng Wild (Sư tử) để nhân đôi tiền thưởng không */
  withWilds?: boolean;
  /** Tiền thưởng mong đợi của dòng hoặc hệ số nhân */
  expectedLineWin?: number;
}

export interface WinlineTestCase {
  /** Mã test case định danh duy nhất (ví dụ: TC_WL_001) */
  testId: string;
  /** Mô tả mục đích kiểm thử (ví dụ: "Line 1 - 5 Wilds Sư tử trúng thưởng cao nhất") */
  description: string;
  /**
   * Ma trận 15 ô biểu tượng (5 cuộn x 3 hàng).
   * Có thể là mảng 15 số nguyên hoặc chuỗi phân cách bởi dấu phẩy: "1,2,3,4,5,6,7,8,9,10,11,12,13,14,15"
   * Thứ tự ô:
   * [Reel1_Row1, Reel2_Row1, Reel3_Row1, Reel4_Row1, Reel5_Row1,
   *  Reel1_Row2, Reel2_Row2, Reel3_Row2, Reel4_Row2, Reel5_Row2,
   *  Reel1_Row3, Reel2_Row3, Reel3_Row3, Reel4_Row3, Reel5_Row3]
   */
  matrix: number[] | string;
  /** Danh sách các dòng thắng mong đợi từ ma trận trên */
  expectedWinlines?: WinlineExpected[];
  /** Tổng tiền thắng mong đợi (Total Win) */
  expectedTotalWin?: number;
  /** Có mong đợi kích hoạt 15 Vòng Quay Miễn Phí (3+ Scatter) hay không */
  expectFreeSpins?: boolean;
}

export interface SpinResultActual {
  totalWin: number;
  balance: number;
  linesWon: Array<{
    line: number;
    symbol: number | string;
    count: number;
    win: number;
  }>;
  freeGamesTriggered: boolean;
  rawMatrix?: number[];
}

