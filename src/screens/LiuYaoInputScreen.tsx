/**
 * 六爻排盘输入页 - 铜钱起卦
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { colors, fonts, spacing, radii } from '../styles/theme';
import { GuochaoButton } from '../components/GuochaoButton';
import { GuochaoCard } from '../components/GuochaoCard';

interface LiuYaoInputScreenProps {
  onBack?: () => void;
  onResult?: (result: any) => void;
}

export const LiuYaoInputScreen: React.FC<LiuYaoInputScreenProps> = ({
  onBack,
  onResult,
}) => {
  const [yaoLines, setYaoLines] = useState<number[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [coins, setCoins] = useState<boolean[]>([true, true, true]);
  const [isComplete, setIsComplete] = useState(false);

  // 摇卦（模拟抛铜钱）
  const shakeCoins = () => {
    if (yaoLines.length >= 6 || isComplete) return;
    
    setIsShaking(true);
    
    // 模拟动画
    setTimeout(() => {
      // 随机生成三个铜钱的结果
      const newCoins = [
        Math.random() > 0.5,
        Math.random() > 0.5,
        Math.random() > 0.5,
      ];
      
      setCoins(newCoins);
      
      // 计算爻类型
      const yangCount = newCoins.filter(c => c).length;
      let yaoType: number;
      
      if (yangCount === 3) yaoType = 9;  // 老阳
      else if (yangCount === 2) yaoType = 7;  // 少阳
      else if (yangCount === 1) yaoType = 8;  // 少阴
      else yaoType = 6;  // 老阴
      
      const newYaoLines = [...yaoLines, yaoType];
      setYaoLines(newYaoLines);
      setIsShaking(false);
      
      // 如果已经摇了 6 次，显示完成
      if (newYaoLines.length === 6) {
        setIsComplete(true);
      }
    }, 800);
  };

  const reset = () => {
    setYaoLines([]);
    setCoins([true, true, true]);
    setIsComplete(false);
  };

  // 处理查看结果
  const handleViewResult = () => {
    if (yaoLines.length === 6) {
      onResult && onResult({ yaoLines });
    }
  };

  const getYaoTypeText = (type: number) => {
    switch (type) {
      case 6: return '老阴 ⚋';
      case 7: return '少阳 ⚊';
      case 8: return '少阴 ⚋';
      case 9: return '老阳 ⚊';
      default: return '';
    }
  };

  const getYaoSymbol = (type: number) => {
    return type === 7 || type === 9 ? '⚊' : '⚋';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>六爻排盘</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 铜钱展示区 */}
        <GuochaoCard style={styles.coinsCard}>
          <Text style={styles.coinsTitle}>请摇卦三次，得一爻</Text>
          
          <View style={styles.coinsContainer}>
            {coins.map((isYang, index) => (
              <View
                key={index}
                style={[
                  styles.coin,
                  isYang ? styles.coinYang : styles.coinYin,
                  isShaking && styles.coinShaking,
                ]}
              >
                <Text style={styles.coinText}>
                  {isYang ? '字' : '花'}
                </Text>
              </View>
            ))}
          </View>

          <Text style={styles.instruction}>
            已摇 {yaoLines.length} 爻，还需 {6 - yaoLines.length} 爻
          </Text>

          {isComplete ? (
            <GuochaoButton
              title="查看结果"
              onPress={handleViewResult}
              style={styles.shakeButton}
            />
          ) : (
            <GuochaoButton
              title={isShaking ? '摇卦中...' : '开始摇卦'}
              onPress={shakeCoins}
              disabled={isShaking || yaoLines.length >= 6}
              style={styles.shakeButton}
            />
          )}
        </GuochaoCard>

        {/* 已得爻展示 */}
        {yaoLines.length > 0 && (
          <GuochaoCard style={styles.yaoLinesCard}>
            <Text style={styles.yaoLinesTitle}>已得爻象（从下往上）</Text>
            
            <View style={styles.yaoLinesContainer}>
              {yaoLines.map((type, index) => (
                <View key={index} style={styles.yaoLineRow}>
                  <Text style={styles.yaoLinePosition}>
                    {['初', '二', '三', '四', '五', '上'][index]}爻
                  </Text>
                  <Text style={styles.yaoLineSymbol}>
                    {getYaoSymbol(type)}
                  </Text>
                  <Text style={styles.yaoLineType}>
                    {getYaoTypeText(type)}
                  </Text>
                </View>
              ))}
            </View>
          </GuochaoCard>
        )}

        {/* 操作按钮 */}
        <View style={styles.actionButtons}>
          {yaoLines.length > 0 && !isComplete && (
            <GuochaoButton
              title="重新开始"
              onPress={reset}
              variant="secondary"
              style={styles.actionButton}
            />
          )}
        </View>

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  backText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.gray[700],
  },
  title: {
    fontSize: fonts.sizes.xl,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  coinsCard: {
    margin: spacing.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  coinsTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    marginBottom: spacing.lg,
  },
  coinsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  coin: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.gold,
  },
  coinYang: {
    backgroundColor: colors.riceWhite,
  },
  coinYin: {
    backgroundColor: colors.cinnabarRed,
  },
  coinShaking: {
    transform: [{ rotate: '360deg' }],
  },
  coinText: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    fontWeight: 'bold',
  },
  instruction: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.songTi,
    color: colors.gray[700],
    marginBottom: spacing.md,
  },
  shakeButton: {
    width: '80%',
  },
  yaoLinesCard: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  yaoLinesTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    marginBottom: spacing.md,
  },
  yaoLinesContainer: {
    marginTop: spacing.md,
  },
  yaoLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  yaoLinePosition: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.gray[700],
    width: 50,
  },
  yaoLineSymbol: {
    fontSize: fonts.sizes['2xl'],
    color: colors.cinnabarRed,
  },
  yaoLineType: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.songTi,
    color: colors.gray[600],
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  actionButton: {
    flex: 1,
    maxWidth: 200,
  },
  spacer: {
    height: spacing['4xl'],
  },
});

export default LiuYaoInputScreen;
