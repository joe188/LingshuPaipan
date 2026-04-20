import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Calendar, LocaleConfig, DateData } from 'react-native-calendars';
import { Solar, Lunar } from 'lunar-javascript';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type CalendarNavigationProp = StackNavigationProp<RootStackParamList, 'Calendar'>;

// 1. 配置中文语言（react-native-calendars 默认是英文，需配置）
LocaleConfig.locales['zh-cn'] = {
  monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  monthNamesShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  dayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
  dayNamesShort: ['日', '一', '二', '三', '四', '五', '六'],
  today: '今天'
};
LocaleConfig.defaultLocale = 'zh-cn';

/**
 * 获取指定公历日期的农历信息
 */
const getLunarInfo = (date: Date | string) => {
  try {
    let solar: Solar;
    if (typeof date === 'string') {
      const d = new Date(date);
      if (isNaN(d.getTime())) {
        return getDefaultLunarInfo();
      }
      solar = Solar.fromDate(d);
    } else if (date instanceof Date) {
      solar = Solar.fromDate(date);
    } else {
      return getDefaultLunarInfo();
    }
    
    const lunar = solar.getLunar();
    
    return {
      lunarText: lunar.toString(),
      lunarDayChinese: lunar.getDayInChinese() || '',
      festivals: lunar.getFestivals() || [],
      jieQi: solar.getJieQi(),
      solarHoliday: solar.getHoliday(),
      ganZhi: lunar.getYearInGanZhi(),
      isLeap: lunar.isLeap(),
      lunarMonth: lunar.getMonth(),
      lunarMonthChinese: lunar.getMonthInChinese(),
      lunarDay: lunar.getDay(),
      yearGanZhi: lunar.getYearInGanZhi(),
      monthGanZhi: lunar.getMonthInGanZhi(),
      dayGanZhi: lunar.getDayInGanZhi(),
      zodiac: lunar.getZodiac(),
    };
  } catch (e) {
    console.error('农历转换错误', e);
    return getDefaultLunarInfo();
  }
};

// 安全默认值
const getDefaultLunarInfo = () => ({
  lunarText: '',
  lunarDayChinese: '',
  festivals: [],
  jieQi: '',
  solarHoliday: '',
  ganZhi: '',
  isLeap: false,
  lunarMonth: 0,
  lunarMonthChinese: '',
  lunarDay: 0,
  yearGanZhi: '',
  monthGanZhi: '',
  dayGanZhi: '',
  zodiac: '',
});

/**
 * 获取指定日期的宜忌
 */
const getTodayFortune = (year: number, month: number, day: number) => {
  const yiOptions = [
    ['祭祀', '祈福', '求嗣', '开光'],
    ['开市', '立券', '交易', '纳财'],
    ['嫁娶', '出行', '搬家', '动土'],
    ['修造', '起基', '安门', '安床'],
    ['入殓', '破土', '启攒', '安葬'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
    ['祭祀', '祈福', '求嗣', '开光', '出行', '解除'],
  ];
  const jiOptions = [
    ['动土', '破土'],
    ['嫁娶'],
    ['开市', '立券'],
    ['安葬'],
    ['出行'],
    ['祭祀', '祈福'],
    ['动土', '破土'],
    ['嫁娶'],
    ['开市', '立券'],
    ['安葬'],
    ['出行'],
    ['祭祀', '祈福'],
  ];
  const jishenOptions = [
    ['天德', '月德', '天恩'],
    ['天愿', '天赦', '月恩'],
    ['四相', '时德', '民日'],
    ['三合', '临日', '天喜'],
    ['五富', '不将', '六合'],
    ['圣心', '五合', '官日'],
    ['天马', '要安', '驿马'],
    ['民日', '天巫', '福德'],
    ['天德', '月德', '天恩'],
    ['天愿', '天赦', '月恩'],
    ['四相', '时德', '民日'],
    ['三合', '临日', '天喜'],
  ];
  const xiongshaOptions = [
    ['月破', '大耗'],
    ['灾煞', '天火'],
    ['血忌', '天贼'],
    ['五虚', '土符'],
    ['归忌', '流血'],
    ['天牢', '黑道'],
    ['朱雀', '白虎'],
    ['勾陈', '玄武'],
    ['天牢', '黑道'],
    ['朱雀', '白虎'],
    ['勾陈', '玄武'],
    ['天牢', '黑道'],
  ];
  const chongOptions = [
    '冲鼠', '冲牛', '冲虎', '冲兔', '冲龙', '冲蛇', '冲马', '冲羊', '冲猴', '冲鸡', '冲狗', '冲猪'
  ];
  const shaOptions = [
    '煞北', '煞西', '煞南', '煞东', '煞北', '煞西', '煞南', '煞东', '煞北', '煞西', '煞南', '煞东'
  ];

  const dayIndex = (year + month + day) % 12;
  const zhiIndex = (year + month + day) % 12;

  return {
    yi: yiOptions[dayIndex] || [],
    ji: jiOptions[dayIndex] || [],
    jishen: jishenOptions[dayIndex] || [],
    xiongsha: xiongshaOptions[dayIndex] || [],
    chong: chongOptions[zhiIndex] || '',
    sha: shaOptions[zhiIndex] || '',
  };
};

export default function CalendarScreen() {
  const navigation = useNavigation<CalendarNavigationProp>();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // 生成日历月视图的 markedDates
  const markedDates = useMemo(() => {
    const marks: Record<string, any> = {};

    if (selectedDate) {
      marks[selectedDate] = {
        selected: true,
        selectedColor: '#2196f3',
      };
    }

    if (!marks[todayStr]) {
      marks[todayStr] = {
        marked: true,
        dotColor: '#2196f3',
      };
    }

    return marks;
  }, [selectedDate, todayStr]);

  const onDayPress = (day: DateData) => {
    setSelectedDate(day.dateString);
  };

  // 渲染底部详情卡片
  const renderDetailCard = () => {
    if (!selectedDate) return null;
    const [year, month, day] = selectedDate.split('-').map(Number);
    const lunarInfo = getLunarInfo(selectedDate);
    const fortune = getTodayFortune(year, month, day);

    if (!lunarInfo) return null;

    return (
      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>
          {year}年{month}月{day}日 {lunarInfo.lunarText}
          {lunarInfo.jieQi && ` · ${lunarInfo.jieQi}`}
        </Text>

        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>宜：</Text>
          <Text style={[styles.detailValue, styles.detailValueYi]}>{fortune.yi.join('、')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>忌：</Text>
          <Text style={[styles.detailValue, styles.detailValueJi]}>{fortune.ji.join('、')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>吉神：</Text>
          <Text style={styles.detailValue}>{fortune.jishen.join('、')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>冲煞：</Text>
          <Text style={styles.detailValue}>{fortune.chong} {fortune.sha}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>凶煞：</Text>
          <Text style={styles.detailValue}>{fortune.xiongsha.join('、')}</Text>
        </View>
      </View>
    );
  };

  // 自定义日期单元格 - 实现优先级显示
  const renderDay = useCallback(
    (date: any) => {
      const { date: dateStr, state } = date;
      if (!dateStr) return <View style={styles.dayWrapper} />;
      
      const parts = dateStr.split('-');
      if (parts.length < 3) return <View style={styles.dayWrapper} />;
      
      const dayNum = Number(parts[2]);
      const lunarInfo = getLunarInfo(dateStr);
      const isSelected = dateStr === selectedDate;

      const textColor =
        state === 'disabled'
          ? '#ccc'
          : isSelected
          ? '#fff'
          : state === 'today'
          ? '#2196f3'
          : '#333';

      // 核心逻辑：优先级显示
      // 1. 公历节日 → 红色
      // 2. 农历节日 → 红色
      // 3. 节气 → 橙色
      // 4. 农历初一 → 显示"X月"
      // 5. 普通 → 显示农历日期
      
      let displayText = lunarInfo?.lunarDayChinese || '';
      let lunarTextColor = isSelected ? '#fff' : '#666';
      
      // 优先级判断
      if (lunarInfo?.solarHoliday) {
        // 公历节日（如国庆节）
        displayText = lunarInfo.solarHoliday;
        lunarTextColor = isSelected ? '#fff' : '#e53935'; // 红色
      } else if (lunarInfo?.festivals && lunarInfo.festivals.length > 0) {
        // 农历节日（如春节、中秋）
        displayText = lunarInfo.festivals[0];
        lunarTextColor = isSelected ? '#fff' : '#e53935'; // 红色
      } else if (lunarInfo?.jieQi) {
        // 节气（如立春、冬至）
        displayText = lunarInfo.jieQi;
        lunarTextColor = isSelected ? '#fff' : '#ff9800'; // 橙色
      } else if (lunarInfo?.lunarDayChinese === '初一') {
        // 农历初一显示月份
        displayText = (lunarInfo.lunarMonthChinese || '') + '月';
        lunarTextColor = isSelected ? '#fff' : '#666';
      }

      return (
        <View style={[styles.dayWrapper, isSelected && styles.dayWrapperSelected]}>
          <Text style={[styles.dayNumber, { color: textColor }]}>{dayNum}</Text>
          {displayText && (
            <Text style={[styles.lunarText, { color: lunarTextColor }]}>
              {displayText}
            </Text>
          )}
        </View>
      );
    },
    [selectedDate]
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Calendar
        style={styles.calendar}
        current={todayStr}
        markedDates={markedDates}
        onDayPress={onDayPress}
        renderDay={renderDay}
        hideExtraDays
        theme={{
          backgroundColor: '#f5f5f5',
          calendarBackground: '#f5f5f5',
          headerBackground: '#f5f5f5',
          monthTextColor: '#222',
          textSectionTitleColor: '#666',
          selectedDayBackgroundColor: '#2196f3',
          selectedDayTextColor: '#fff',
          todayTextColor: '#2196f3',
          dayTextColor: '#333',
          textDisabledColor: '#ccc',
          arrowColor: '#333',
          monthTextFontSize: 18,
          textDayFontSize: 16,
        }}
      />

      {renderDetailCard()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    paddingBottom: 32,
  },
  calendar: {
    backgroundColor: '#f5f5f5',
  },
  dayWrapper: {
    width: 38,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    margin: 2,
  },
  dayWrapperSelected: {
    backgroundColor: '#2196f3',
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  lunarText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  detailCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  detailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 12,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    width: 50,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  detailValueYi: {
    color: '#2e7d32',
  },
  detailValueJi: {
    color: '#c62828',
  },
});
