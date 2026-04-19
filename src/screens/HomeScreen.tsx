/**
 * HomeScreen - 首页（国潮美化版）
 * 功能：展示今日运势、开始排盘入口、历史记录
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Animated,
} from 'react-native';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';
import { getRecentRecords, getStatistics } from '../database/queries/history';
import { DivinationRecord } from '../database/models/DivinationRecord';
import theme from '../styles/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { solarToLunar, getGanZhiYear, getZodiac } from '../utils/lunar-calendar';

const { colors, fonts, spacing, radii } = theme;
const { width, height } = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  LiuYao: undefined;
  BaZiInput: undefined;
  QiMen: undefined;
  History: undefined;
  HistoryDetail: { recordId: string };
  Result: undefined;
  YijingTest: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

// 获取今日日期信息
const getTodayInfo = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  const day = today.getDate();
  const weekDay = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][today.getDay()];
  
  // 使用万年历获取农历信息
  const lunarInfo = solarToLunar(year, month, day);
  
  return {
    date: `${year} 年 ${month} 月 ${day} 日 ${weekDay}`,
    lunar: `农历${lunarInfo.lunarMonthName}${lunarInfo.lunarDayName}`,
    ganZhiYear: lunarInfo.ganZhiYear,
    ganZhiMonth: lunarInfo.ganZhiMonth,
    ganZhiDay: lunarInfo.ganZhiDay,
    zodiac: lunarInfo.zodiac,
    wuxing: {
      wood: 25,
      fire: 30,
      earth: 20,
      metal: 15,
      water: 10,
    },
  };
};

const todayInfo = getTodayInfo();

// 八卦符号
const BAGUA_SYMBOLS = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<DivinationRecord[]>([]);
  const [stats, setStats] = useState<{ total: number; favoriteCount: number }>({ total: 0, favoriteCount: 0 });
  const [loading, setLoading] = useState(true);
  const fadeAnim = new Animated.Value(0);

  // 加载历史记录和统计
  useEffect(() => {
    loadData();
    // 淡入动画
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadData = async () => {
    try {
      const [records, statistics] = await Promise.all([
        getRecentRecords(3),
        getStatistics(),
      ]);
      setHistory(records);
      setStats({ total: statistics.total, favoriteCount: statistics.favoriteCount });
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // 生成历史记录标题
  const getHistoryTitle = (record: DivinationRecord) => {
    const typeMap = {
      bazi: '八字排盘',
      liuyao: '六爻占卜',
      qimen: '奇门遁甲',
    };
    const type = typeMap[record.baziType] || '排盘';
    const date = record.lunarDate || '';
    return `${type} · ${date}`;
  };

  // 生成三类图标
  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'bazi': return '🔮';
      case 'liuyao': return '🪙';
      case 'qimen': return '🗺️';
      default: return '📋';
    }
  };

  // 五行进度条
  const renderWuxingBar = (element: string, value: number, color: string) => (
    <View key={element} style={styles.wuxingItem}>
      <Text style={styles.wuxingLabel}>{element}</Text>
      <View style={styles.wuxingBarBg}>
        <Animated.View 
          style={[
            styles.wuxingBarFill, 
            { 
              width: `${value}%`,
              backgroundColor: color,
            }
          ]}
        />
      </View>
      <Text style={styles.wuxingValue}>{value}%</Text>
    </View>
  );

  // 功能卡片配置
  const featureCards = [
    {
      title: '六爻占卜',
      icon: '🪙',
      gradient: ['#667eea', '#764ba2'],
      onPress: () => navigation.navigate('LiuYao'),
      desc: '摇卦问事，洞察天机',
    },
    {
      title: '八字排盘',
      icon: '🔮',
      gradient: ['#f093fb', '#f5576c'],
      onPress: () => navigation.navigate('BaZiInput'),
      desc: '四柱命理，推算人生',
    },
    {
      title: '奇门遁甲',
      icon: '🗺️',
      gradient: ['#4facfe', '#00f2fe'],
      onPress: () => navigation.navigate('QiMen'),
      desc: '排局布阵，趋吉避凶',
    },
  ];

  // 次要功能卡片
  const secondaryCards = [
    {
      title: '全局设置',
      icon: '⚙️',
      backgroundColor: colors.gold,
      onPress: () => navigation.navigate('Settings'),
      desc: 'AI 配置\n主题切换',
    },
    {
      title: '使用手册',
      icon: '📖',
      backgroundColor: colors.white,
      borderColor: colors.gold,
      onPress: () => Alert.alert('📖 使用手册', '功能开发中...\n\n包含：\n- 新手指南\n- 常见问题\n- 功能说明'),
      desc: '新手指南\n常见问题',
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.cinnabarRed} />
        <Text style={styles.loadingText}>灵枢排盘加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 顶部装饰 - 八卦图案 */}
      <View style={styles.baguaHeader}>
        <View style={styles.baguaCircle}>
          {BAGUA_SYMBOLS.map((symbol, index) => {
            const angle = (index * 45 * Math.PI) / 180;
            const x = Math.cos(angle) * 60;
            const y = Math.sin(angle) * 60;
            return (
              <Text
                key={index}
                style={[
                  styles.baguaSymbol,
                  {
                    left: x + 70,
                    top: y + 70,
                  }
                ]}
              >
                {symbol}
              </Text>
            );
          })}
          <Text style={styles.taiji}>☯</Text>
        </View>
      </View>

      {/* 今日运势卡片 */}
      <Animated.View style={[styles.fortuneCard, { opacity: fadeAnim }]}>
        <View style={styles.fortuneHeader}>
          <Text style={styles.fortuneDate}>{todayInfo.date}</Text>
          <Text style={styles.fortuneLunar}>{todayInfo.lunar}</Text>
          <Text style={styles.fortuneGanZhi}>
            {todayInfo.ganZhiYear}年 {todayInfo.ganZhiMonth}月 {todayInfo.ganZhiDay}日
          </Text>
          <Text style={styles.fortuneZodiac}>生肖：{todayInfo.zodiac}</Text>
        </View>
      </Animated.View>

      {/* 功能入口 */}
      <View style={styles.featuresSection}>
        <View style={styles.featuresGrid}>
          {featureCards.map((feature, index) => (
            <TouchableOpacity
              key={feature.title}
              style={[
                styles.featureCard,
                {
                  backgroundColor: feature.gradient[0],
                }
              ]}
              onPress={feature.onPress}
              activeOpacity={0.8}
            >
              <Text style={[styles.featureIcon, { fontSize: 32, textAlign: 'center' }]}>{feature.icon}</Text>
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 底部功能 */}
      <View style={styles.bottomSection}>
        <View style={styles.bottomGrid}>
          {secondaryCards.map((card) => (
            <TouchableOpacity
              key={card.title}
              style={[
                styles.bottomCard,
                {
                  backgroundColor: card.backgroundColor,
                  borderColor: card.borderColor || 'transparent',
                }
              ]}
              onPress={card.onPress}
              activeOpacity={0.8}
            >
              <Text style={[styles.bottomIcon, { fontSize: 24, textAlign: 'center' }]}>{card.icon}</Text>
              <Text style={styles.bottomTitle}>{card.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.riceWhite,
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: fonts.sizes.md,
    color: colors.inkBlack,
    fontFamily: fonts.kaiTi,
  },
  
  // 八卦头部
  baguaHeader: {
    height: 140,
    backgroundColor: colors.cinnabarRed,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomLeftRadius: radii['3xl'],
    borderBottomRightRadius: radii['3xl'],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  baguaCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.gold,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.riceWhite,
  },
  baguaSymbol: {
    position: 'absolute',
    fontSize: 20,
    color: colors.inkBlack,
    fontWeight: 'bold',
  },
  taiji: {
    fontSize: 40,
    color: colors.inkBlack,
  },
  
  // 运势卡片
  fortuneCard: {
    margin: spacing.lg,
    marginTop: -30,
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  fortuneHeader: {
    alignItems: 'center',
  },
  fortuneDate: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
  },
  fortuneLunar: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  fortuneGanZhi: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.cinnabarRed,
    marginTop: spacing.sm,
    fontWeight: fonts.weights.semibold,
  },
  fortuneZodiac: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.sourceHan,
    color: colors.gray[700],
    marginTop: spacing.xs,
  },
  fortuneMain: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  fortuneBadge: {
    backgroundColor: colors.cinnabarRed,
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    borderRadius: radii.lg,
    marginRight: spacing.lg,
  },
  fortuneText: {
    fontSize: fonts.sizes['2xl'],
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
  },
  fortuneAdvice: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.sourceHan,
    color: colors.gray[700],
    flex: 1,
  },
  
  // 五行
  wuxingSection: {
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    paddingTop: spacing.lg,
  },
  wuxingTitle: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.semibold,
    marginBottom: spacing.md,
  },
  wuxingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  wuxingLabel: {
    width: 24,
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
  },
  wuxingBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.gray[200],
    borderRadius: radii.full,
    marginHorizontal: spacing.md,
    overflow: 'hidden',
  },
  wuxingBarFill: {
    height: '100%',
    borderRadius: radii.full,
  },
  wuxingValue: {
    width: 36,
    fontSize: fonts.sizes.sm,
    color: colors.gray[600],
    textAlign: 'right',
  },
  
  // 功能区域
  featuresSection: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    marginBottom: spacing.md,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    height: 100,
    borderRadius: radii.xl,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 32,
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.white,
    fontWeight: fonts.weights.bold,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  featureDesc: {
    fontSize: fonts.sizes.xs,
    fontFamily: fonts.sourceHan,
    color: colors.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  
  // 底部功能
  bottomSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  bottomGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    height: 80,
    borderRadius: radii.lg,
    padding: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
  },
  bottomIcon: {
    textAlign: 'center',
  },
  bottomTitle: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: fonts.weights.bold,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default HomeScreen;
