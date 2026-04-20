import { Solar, Lunar } from 'lunar-javascript';

/**
 * 获取指定公历日期的农历信息
 * @param date - Date 对象或 'YYYY-MM-DD' 字符串
 */
export const getLunarInfo = (
  date: Date | string
): {
  lunarText: string; // 完整农历文本，如 "正月初一"
  lunarDayChinese: string; // 农历日期（中文），如 "初一"
  festivals: string[]; // 节日（农历+公历）
  jieQi: string; // 节气
  ganZhi: string; // 干支纪年
  isLeap: boolean; // 是否闰月
  lunarMonth: number; // 农历月份（1-12）
  lunarMonthChinese: string; // 农历月份（中文），如 "正"
  lunarDay: number; // 农历日期（1-30）
  yearGanZhi: string; // 年干支
  monthGanZhi: string; // 月干支
  dayGanZhi: string; // 日干支
  zodiac: string; // 生肖
} | null => {
  try {
    let solar: Solar;
    if (typeof date === 'string') {
      const [year, month, day] = date.split('-').map(Number);
      solar = Solar.fromYmd(year, month, day);
    } else {
      solar = Solar.fromDate(date);
    }
    const lunar: Lunar = solar.getLunar();

    const festivals = lunar.getFestivals() as string[];
    const jieQi = solar.getJieQi() as string;

    return {
      lunarText: lunar.toString(), // 如 "正月初一"
      lunarDayChinese: lunar.getDayInChinese(), // 如 "初一"
      festivals,
      jieQi,
      ganZhi: lunar.getYearInGanZhi(),
      isLeap: lunar.isLeap(),
      lunarMonth: lunar.getMonth(),
      lunarMonthChinese: lunar.getMonthInChinese(), // 如 "正"
      lunarDay: lunar.getDay(),
      yearGanZhi: lunar.getYearInGanZhi(),
      monthGanZhi: lunar.getMonthInGanZhi(),
      dayGanZhi: lunar.getDayInGanZhi(),
      zodiac: lunar.getZodiac(),
    };
  } catch (e) {
    console.error('农历转换错误', e);
    return null;
  }
};
