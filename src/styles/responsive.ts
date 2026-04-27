import { Dimensions, Platform } from 'react-native';

// 响应式设计配置
export const RESPONSIVE_CONFIG = {
  // 屏幕尺寸
  screenWidth: Dimensions.get('window').width,
  screenHeight: Dimensions.get('window').height,
  
  // 断点
  breakpoints: {
    phone: 0,
    phoneLarge: 414, // iPhone Plus/Max
    tablet: 768,     // iPad
  },
  
  // 响应式断点
  isSmallPhone: Dimensions.get('window').width < 375,
  isLargePhone: Dimensions.get('window').width >= 414,
  isTablet: Dimensions.get('window').width >= 768,
  
  // 字体缩放
  fontScale: Dimensions.get('window').fontScale || 1,
};

// 响应式宽度计算
export const responsiveWidth = (percentage: number): number => {
  return (RESPONSIVE_CONFIG.screenWidth * percentage) / 100;
};

// 响应式高度计算
export const responsiveHeight = (percentage: number): number => {
  return (RESPONSIVE_CONFIG.screenHeight * percentage) / 100;
};

// 响应式字体大小
export const responsiveFontSize = (fontSize: number): number => {
  const baseFontSize = fontSize;
  const scale = RESPONSIVE_CONFIG.fontScale;
  
  // 根据屏幕宽度调整字体
  if (RESPONSIVE_CONFIG.screenWidth < 375) {
    return baseFontSize * 0.9 * scale;
  } else if (RESPONSIVE_CONFIG.screenWidth >= 414) {
    return baseFontSize * 1.1 * scale;
  }
  return baseFontSize * scale;
};

// 响应式边距
export const responsiveMargin = (margin: number): number => {
  if (RESPONSIVE_CONFIG.isTablet) {
    return margin * 1.5;
  }
  return margin;
};

// 响应式内边距
export const responsivePadding = (padding: number): number => {
  if (RESPONSIVE_CONFIG.isTablet) {
    return padding * 1.5;
  }
  return padding;
};

// 响应式圆角
export const responsiveBorderRadius = (radius: number): number => {
  if (RESPONSIVE_CONFIG.isTablet) {
    return radius * 1.2;
  }
  return radius;
};

// 平台检测
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// 响应式组件样式
export const responsiveStyles = {
  // 容器
  container: {
    width: '100%',
    height: '100%',
    paddingHorizontal: responsivePadding(16),
    paddingVertical: responsivePadding(12),
  },
  
  // 按钮
  button: {
    paddingVertical: responsivePadding(12),
    paddingHorizontal: responsivePadding(24),
    borderRadius: responsiveBorderRadius(8),
  },
  
  // 输入框
  input: {
    paddingVertical: responsivePadding(12),
    paddingHorizontal: responsivePadding(16),
    borderRadius: responsiveBorderRadius(8),
    fontSize: responsiveFontSize(16),
  },
  
  // 文本
  text: {
    fontSize: responsiveFontSize(14),
  },
  
  // 图标
  icon: {
    width: responsiveWidth(24),
    height: responsiveHeight(24),
  },
};

// 响应式布局断点
export const getBreakpoint = (): 'phone' | 'phoneLarge' | 'tablet' => {
  const width = RESPONSIVE_CONFIG.screenWidth;
  if (width >= 768) return 'tablet';
  if (width >= 414) return 'phoneLarge';
  return 'phone';
};
