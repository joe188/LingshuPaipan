#!/bin/bash
set -e

echo "========================================"
echo "Divination App - APK 本地构建脚本"
echo "========================================"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 检查 Node.js
echo -e "\n${YELLOW}[1/6] 检查 Node.js...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js 18+${NC}"
  exit 1
fi
NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}❌ Node.js 版本过低 (当前: $(node --version))，需要 18+${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js $(node --version)${NC}"

# 2. 检查 npm 并设置淘宝源
echo -e "\n${YELLOW}[2/6] 设置 npm 镜像源...${NC}"
npm config set registry https://registry.npmmirror.com
echo -e "${GREEN}✅ npm 镜像源已设置为淘宝${NC}"

# 3. 检查 Java
echo -e "\n${YELLOW}[3/6] 检查 Java...${NC}"
if ! command -v java &> /dev/null; then
  echo -e "${RED}❌ Java 未安装${NC}"
  exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | cut -d'.' -f1)
if [ "$JAVA_VERSION" -ne 17 ]; then
  echo -e "${YELLOW}⚠️  Java 版本为 $(java -version 2>&1 | head -1)，推荐 Java 17${NC}"
  echo -e "${YELLOW}   尝试继续构建，但可能出现兼容性问题${NC}"
fi
echo -e "${GREEN}✅ Java 已安装${NC}"

# 4. 检查 Android SDK
echo -e "\n${YELLOW}[4/6] 检查 Android SDK...${NC}"
ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
if [ ! -d "$ANDROID_HOME" ]; then
  echo -e "${RED}❌ Android SDK 未找到 (期待位置: $ANDROID_HOME)${NC}"
  echo -e "${YELLOW}   请先安装 Android Studio 或命令行工具${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Android SDK: $ANDROID_HOME${NC}"

# 5. 创建 local.properties
echo -e "\n${YELLOW}[5/6] 配置项目...${NC}"
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
echo -e "${GREEN}✅ 已创建 android/local.properties${NC}"

# 6. 安装依赖并构建
echo -e "\n${YELLOW}[6/6] 安装依赖并开始构建...${NC}"
echo -e "${YELLOW}   这可能需要 10-20 分钟，请耐心等待${NC}\n"

# 安装 npm 依赖
if [ ! -d "node_modules" ]; then
  echo "正在安装 npm 依赖..."
  npm install
fi

# 构建 APK
cd android

# 强制使用系统 Gradle（跳过可能损坏的 wrapper）
if command -v gradle &> /dev/null; then
  echo "使用系统 Gradle..."
  GRADLE_CMD="gradle"
else
  echo "Gradle 未安装，正在下载 Gradle 8.3..."
  curl -sL https://services.gradle.org/distributions/gradle-8.3-bin.zip -o /tmp/gradle.zip
  unzip -q /tmp/gradle.zip -d /tmp
  export PATH="/tmp/gradle-8.3/bin:$PATH"
  GRADLE_CMD="gradle"
fi

# 执行构建（不使用 ./gradlew）
$GRADLE_CMD --no-daemon --stacktrace --info clean assembleRelease

# 检查 APK
APK_PATH=$(find . -path "*/build/outputs/apk/release/*.apk" | head -1)
if [ -f "$APK_PATH" ]; then
  echo -e "\n${GREEN}========================================"
  echo "✅ 构建成功！"
  echo "📦 APK 位置: $APK_PATH"
  echo "📦 APK 大小: $(du -h "$APK_PATH" | cut -f1)"
  echo "========================================${NC}"
else
  echo -e "\n${RED}========================================"
  echo "❌ 构建失败，未找到 APK 文件"
  echo "请检查上面的错误日志"
  echo "========================================${NC}"
  exit 1
fi
