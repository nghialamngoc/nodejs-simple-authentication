/**
 * Chuyển đổi chuỗi thời gian thành milliseconds.
 * @param s Chuỗi thời gian (ví dụ: '1s', '2m', '3h', '4d')
 * @returns Số milliseconds
 */
export const ms = (s: string): number => {
  const map: { [key: string]: number } = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };

  return s
    .split(/(\d+[smhd])/)
    .filter(Boolean)
    .reduce((sum, curr) => {
      const [, num, unit] = curr.match(/(\d+)([smhd])/) || [];
      return sum + parseInt(num, 10) * map[unit];
    }, 0);
};
