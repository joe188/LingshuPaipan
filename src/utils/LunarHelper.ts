console.log('LunarHelper module loaded');
const lunar = require('lunar-typescript');
const { Solar, Lunar } = lunar || {};

const ZODIAC_FALLBACK = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];

function safeAccess(obj, prop, fallback) {
  try {
    if (!obj) {
      console.log(`safeAccess: obj is falsy for prop=${prop}`);
      return fallback;
    }
    const val = obj[prop];
    if (typeof val === 'function') {
      return val.call(obj);
    }
    if (typeof val !== 'undefined') {
      return val;
    }
    return fallback;
  } catch (e) {
    console.error(`safeAccess error: prop=${prop}, error=`, e);
    return fallback;
  }
}

export const getLunarInfo = (date) => {
  try {
    console.log('🛠️ getLunarInfo START:', date);
    if (!Solar || !Lunar) throw new Error('Solar/Lunar not loaded');

    let year, month, day;
    if (typeof date === 'string') {
      console.log('Parsing string date');
      [year, month, day] = date.split('-').map(Number);
    } else {
      console.log('Parsing Date object');
      year = date.getFullYear();
      month = date.getMonth() + 1;
      day = date.getDate();
    }
    console.log('Parsed:', year, month, day);

    console.log('Calling Solar.fromYmd');
    if (typeof Solar.fromYmd !== 'function') {
      throw new Error('Solar.fromYmd is not a function');
    }
    const solar = Solar.fromYmd(year, month, day);
    console.log('Solar.fromYmd returned:', !!solar);
    if (!solar) throw new Error('Solar.fromYmd returned null/undefined');
    
    console.log('Calling solar.getLunar via safeAccess');
    const l = safeAccess(solar, 'getLunar', null);
    console.log('getLunar returned:', !!l);
    if (!l) throw new Error('solar.getLunar failed');
    console.log('Lunar object obtained');

    // zodiac with fallback
    let zodiac = safeAccess(l, 'getZodiac', null);
    console.log('zodiac from getZodiac:', zodiac);
    if (!zodiac) {
      zodiac = ZODIAC_FALLBACK[(year - 4) % 12];
      console.log('zodiac fallback:', zodiac);
    }

    // Collect other fields
    const result = {
      lunarText: safeAccess(l, 'toString', ''),
      lunarDayChinese: safeAccess(l, 'getDayInChinese', ''),
      festivals: safeAccess(l, 'getFestivals', []) || [],
      jieQi: safeAccess(solar, 'getJieQi', '') || '',
      ganZhi: safeAccess(l, 'getYearInGanZhi', ''),
      isLeap: safeAccess(l, 'isLeap', false),
      lunarMonth: safeAccess(l, 'getMonth', month),
      lunarMonthChinese: safeAccess(l, 'getMonthInChinese', ''),
      lunarDay: safeAccess(l, 'getDay', day),
      yearGanZhi: safeAccess(l, 'getYearInGanZhi', ''),
      monthGanZhi: safeAccess(l, 'getMonthInGanZhi', ''),
      dayGanZhi: safeAccess(l, 'getDayInGanZhi', ''),
      zodiac,
    };
    console.log('getLunarInfo SUCCESS');
    return result;
  } catch (e) {
    console.error('农历转换错误', e);
    if (e && e.stack) console.error('Stack:', e.stack);
    return null;
  }
};
