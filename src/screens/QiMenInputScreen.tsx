/**
 * 奇门遁甲排盘输入页
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

interface QiMenInputScreenProps {
  onBack?: () => void;
  onResult?: (result: any) => void;
}

export const QiMenInputScreen: React.FC<QiMenInputScreenProps> = ({
  onBack,
  onResult,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedHour, setSelectedHour] = useState<number>(
    new Date().getHours()
  );
  const [selectedDirection, setSelectedDirection] = useState<string>('东');

  const directions = ['东', '南', '西', '北', '东南', '西南', '西北', '东北'];

  const handleStartPan = () => {
    // TODO: 调用 QiMenEngine
    onResult &&
      onResult({
        date: selectedDate,
        hour: selectedHour,
        direction: selectedDirection,
      });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.title}>奇门遁甲</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* 时间选择 */}
        <GuochaoCard style={styles.section}>
          <Text style={styles.sectionTitle}>选择时间</Text>
          
          <View style={styles.dateDisplay}>
            <Text style={styles.dateText}>
              {selectedDate.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Text style={styles.hourText}>
              {selectedHour}:00 ({getShiChen(selectedHour)})
            </Text>
          </View>

          <View style={styles.hourSelector}>
            {[...Array(12)].map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.hourButton,
                  selectedHour === i * 2 && styles.hourButtonActive,
                ]}
                onPress={() => setSelectedHour(i * 2)}
              >
                <Text
                  style={[
                    styles.hourTextItem,
                    selectedHour === i * 2 && styles.hourTextActive,
                  ]}
                >
                  {i * 2}时
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GuochaoCard>

        {/* 方位选择 */}
        <GuochaoCard style={styles.section}>
          <Text style={styles.sectionTitle}>选择方位</Text>
          
          <View style={styles.directionGrid}>
            {directions.map((dir) => (
              <TouchableOpacity
                key={dir}
                style={[
                  styles.directionButton,
                  selectedDirection === dir && styles.directionButtonActive,
                ]}
                onPress={() => setSelectedDirection(dir)}
              >
                <Text
                  style={[
                    styles.directionText,
                    selectedDirection === dir && styles.directionTextActive,
                  ]}
                >
                  {dir}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </GuochaoCard>

        {/* 起局按钮 */}
        <GuochaoButton
          title="开始起局"
          onPress={handleStartPan}
          style={styles.startButton}
        />

        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

function getShiChen(hour: number): string {
  const shiChen = [
    '子时',
    '丑时',
    '寅时',
    '卯时',
    '辰时',
    '巳时',
    '午时',
    '未时',
    '申时',
    '酉时',
    '戌时',
    '亥时',
  ];
  return shiChen[Math.floor(hour / 2)];
}

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
  section: {
    margin: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.kaiTi,
    color: colors.inkBlack,
    marginBottom: spacing.md,
  },
  dateDisplay: {
    marginBottom: spacing.lg,
  },
  dateText: {
    fontSize: fonts.sizes.lg,
    fontFamily: fonts.songTi,
    color: colors.inkBlack,
  },
  hourText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.gray[700],
    marginTop: spacing.xs,
  },
  hourSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  hourButton: {
    width: '30%',
    padding: spacing.sm,
    marginVertical: spacing.xs,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  hourButtonActive: {
    backgroundColor: colors.cinnabarRed,
    borderColor: colors.cinnabarRed,
  },
  hourTextItem: {
    fontSize: fonts.sizes.sm,
    fontFamily: fonts.kaiTi,
    color: colors.gray[700],
  },
  hourTextActive: {
    color: colors.riceWhite,
  },
  directionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  directionButton: {
    width: '47%',
    padding: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  directionButtonActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  directionText: {
    fontSize: fonts.sizes.md,
    fontFamily: fonts.kaiTi,
    color: colors.gray[700],
  },
  directionTextActive: {
    color: colors.inkBlack,
    fontWeight: 'bold',
  },
  startButton: {
    margin: spacing.lg,
  },
  spacer: {
    height: spacing['4xl'],
  },
});

export default QiMenInputScreen;
