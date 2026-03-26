/**
 * 灵枢智能排盘 App - 主入口
 * 国潮风格设计，让传统文化触手可及
 */
import React, { useState } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { colors } from './src/styles/theme';

// 导入所有页面
import HomeScreen from './src/screens/HomeScreen';
import LiuYaoInputScreen from './src/screens/LiuYaoInputScreen';
import LiuYaoResultScreen from './src/screens/LiuYaoResultScreen';
import QiMenInputScreen from './src/screens/QiMenInputScreen';
import QiMenResultScreen from './src/screens/QiMenResultScreen';

// 页面类型
type ScreenType = 
  | 'home'
  | 'liuyao-input'
  | 'liuyao-result'
  | 'qimen-input'
  | 'qimen-result';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [liuyaoResult, setLiuYaoResult] = useState<any>(null);
  const [qimenResult, setQiMenResult] = useState<any>(null);

  // 导航处理函数
  const navigateTo = (screen: ScreenType) => {
    setCurrentScreen(screen);
  };

  const goBack = () => {
    setCurrentScreen('home');
  };

  // 处理六爻排盘完成
  const handleLiuYaoComplete = (result: any) => {
    setLiuYaoResult(result);
    navigateTo('liuyao-result');
  };

  // 处理奇门排盘完成
  const handleQiMenComplete = (result: any) => {
    setQiMenResult(result);
    navigateTo('qimen-result');
  };

  // 渲染当前页面
  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return (
          <HomeScreen
            onStartLiuYao={() => navigateTo('liuyao-input')}
            onStartQiMen={() => navigateTo('qimen-input')}
            onViewHistory={() => alert('历史记录功能开发中...')}
          />
        );
      case 'liuyao-input':
        return (
          <LiuYaoInputScreen
            onBack={goBack}
            onResult={handleLiuYaoComplete}
          />
        );
      case 'liuyao-result':
        return (
          <LiuYaoResultScreen
            result={liuyaoResult}
            onBack={goBack}
            onRebook={() => navigateTo('liuyao-input')}
          />
        );
      case 'qimen-input':
        return (
          <QiMenInputScreen
            onBack={goBack}
            onResult={handleQiMenComplete}
          />
        );
      case 'qimen-result':
        return (
          <QiMenResultScreen
            result={qimenResult}
            onBack={goBack}
            onRebook={() => navigateTo('qimen-input')}
          />
        );
      default:
        return <HomeScreen onStartLiuYao={() => {}} onStartQiMen={() => {}} onViewHistory={() => {}} />;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.riceWhite} />
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.riceWhite,
  },
});
