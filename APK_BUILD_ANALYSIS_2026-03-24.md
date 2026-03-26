# APK 编译问题分析报告

**项目**: divination-app (周易排盘 APP)
**时间**: 2026-03-24 ~ 持续
**状态**: 🔴 持续失败，需团队分析

---

## 📊 问题时间线

| 时间 | 事件 | 状态 |
|------|------|------|
| 21:14 | 首次触发构建 (build-apk.yml) | ❌ failed |
| 21:23 | 自动触发 (push) (android.yml) | ❌ failed |
| 21:43 | 手动触发 (build-apk.yml) | ❌ failed |
| 22:18 | 手动触发 (build-apk.yml, 修复 wrapper) | ❌ failed |
| 22:25 | 手动触发 (build-apk.yml, 添加 SDK) | ❌ failed |
| 22:30 | 手动触发 (build-apk.yml, 更新 SDK 版本) | ⏳ running |

---

## 🔍 错误演变

### 1. 初始错误
```
Error: Could not find or load main class "-Xmx64m"
Caused by: java.lang.ClassNotFoundException: "-Xmx64m"
```
**原因**: `android/gradlew` 中 `DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'` 引号格式错误
**修复**: 改为 `DEFAULT_JVM_OPTS="-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError"`

### 2. 第二类错误
```
java.lang.NoClassDefFoundError: org/gradle/cli/ParsedCommandLine
```
**原因**: `gradle-wrapper.jar` 文件损坏或版本不匹配
**修复**: 删除 wrapper，改用 `gradle/actions/setup-gradle@v3` 直接安装 Gradle 8.3

### 3. 当前持续失败
所有修复后构建仍失败，错误未知（需查看详细日志）

---

## ✅ 已实施的修复

### Commit: aba1371
- 修正 `android/gradlew` JVM 参数
- 修正 `android/gradle.properties`

### Commit: eeee1ea
- 删除 `gradle-wrapper.jar` 和 `gradle-wrapper.properties`
- `.github/workflows/build-apk.yml`:
  - 添加 `Setup Gradle` 步骤 (Gradle 8.3)
  - 改用 `gradle` 命令而非 `./gradlew`

### Commit: 35e9940
- `.github/workflows/build-apk.yml`:
  - 添加 `Setup Android SDK` 步骤 (API 33, build-tools 33.0.2)

### Commit: f0492b0
- 更新 Android SDK 版本以匹配项目配置:
  - API Level: 33 → **34**
  - build-tools: 33.0.2 → **34.0.0**

---

## 📦 当前配置

### 工作流: `.github/workflows/build-apk.yml`
```yaml
- Setup Node: v18
- Setup Java: Temurin 17
- Setup Android SDK: API 34, build-tools 34.0.0, NDK 25.1.8937393
- Setup Gradle: 8.3
- npm install
- gradle --no-daemon --stacktrace --info clean assembleRelease
```

### 项目配置: `android/build.gradle`
```gradle
buildToolsVersion = "34.0.0"
compileSdkVersion = 34
targetSdkVersion = 34
minSdkVersion = 21
classpath "com.android.tools.build:gradle:8.2.1"
kotlinVersion = "1.9.22"
```

---

## 🤔 可能的问题点

即使配置正确，仍可能失败的原因：

1. **React Native 版本兼容性**
   - RN 0.73.0 可能需要特定版本的 Android Gradle Plugin
   - AGP 8.2.1 与 Gradle 8.3 可能存在兼容性问题

2. **依赖问题**
   - `npm install` 可能失败或安装错误的依赖版本
   - 缺少 `yarn.lock`，使用 `npm install` 可能导致版本漂移

3. **NDK 版本不匹配**
   - 配置的 NDK 版本 `25.1.8937393` 可能与其他组件不兼容

4. **Kotlin 版本**
   - Kotlin 1.9.22 可能与 AGP 8.2.1 有兼容性问题

5. **内存不足**
   - GitHub Actions  runner 内存可能不足（即使设置了 `-Xmx4096m`）

6. **其他环境变量缺失**
   - 如 `ANDROID_HOME`、`ANDROID_NDK_HOME` 等

---

## 📋 建议的下一步

### 立即行动（今晚）
1. **查看详细日志** - 访问 https://github.com/joe188/divination-app/actions 查看最新失败 run 的完整日志
2. **识别具体错误** - 找到失败的根本原因（依赖、兼容性、配置等）
3. **尝试本地构建** - 如果可能，在本地或 Docker 中复现问题

### 团队协作（明天）
1. **召集相关人员**:
   - Android 开发工程师
   - React Native 专家
   - CI/CD 工程师

2. **讨论要点**:
   - 检查 RN 0.73.0 + AGP 8.2.1 + Gradle 8.3 的兼容性
   - 确定正确的 Android SDK、Build-tools、NDK 版本组合
   - 是否需要生成新的 `gradle-wrapper`（版本匹配）
   - 是否应该使用 `yarn` 而非 `npm`
   - 是否需要添加 `ANDROID_NDK_HOME` 环境变量
   - 检查 `local.properties` 是否需要设置 `sdk.dir` 或 `ndk.dir`

3. **快速验证方案**:
   - 在 GitHub 上临时添加调试步骤（如 `ls -la android/`、`cat android/gradle.properties`）
   - 尝试使用 `android.yml` 而非自定义 workflow（它更成熟）
   - 考虑使用官方 React Native Android 构建镜像

---

## 🔗 重要链接

- **GitHub Actions**: https://github.com/joe188/divination-app/actions
- **最新构建**: https://github.com/joe188/divination-app/actions/runs/23494625173
- **仓库**: https://github.com/joe188/divination-app
- **项目文档**: `divination-app/README.md`, `divination-app/ENGINEERING_REVIEW.md`

---

## 📝 备注

- 已删除 `gradle-wrapper`，完全依赖 GitHub Actions 的 `setup-gradle` action
- 工作流文件持续更新中，每次失败都推送了新修复
- 建议团队**先查看最新 run 的详细日志**再讨论方案

---

**生成时间**: 2026-03-24 22:37 GMT+8
**生成者**: OpenClaw Assistant
