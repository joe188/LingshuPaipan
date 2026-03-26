# 灵枢智能排盘 - 自动化发布指南

## 🚀 GitHub Actions 自动化发布流程

### 配置说明

本项目已配置 **GitHub Actions 自动化发布流程**，实现：
- ✅ 代码推送自动构建
- ✅ 自动创建 GitHub Release
- ✅ 自动上传 APK 文件
- ✅ 自动生成发布说明

### 使用方法

#### 方法一：通过 Tag 发布 Release（推荐）

1. **提交代码并打标签**
   ```bash
   git add .
   git commit -m "feat: 完成 XX 功能"
   git tag v1.0.0  # 版本号：v主版本。次版本。修订号
   git push origin master --tags
   ```

2. **自动触发**
   - GitHub Actions 会自动检测到新标签
   - 开始构建流程
   - 创建 Release 并上传 APK

3. **查看进度**
   - 访问：https://github.com/joe188/divination-app/actions
   - 查看构建日志

#### 方法二：Master 分支自动构建（可选）

每次推送到 `master` 分支时自动构建，APK 作为 Artifact 保存 30 天。

### 版本号规范

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)：

- **v1.0.0** - 初始版本
- **v1.0.1** - Bug 修复
- **v1.1.0** - 新功能
- **v2.0.0** - 重大更新

### 发布流程

```bash
# 1. 完成开发后，提交代码
git add .
git commit -m "feat: 添加 XX 功能"

# 2. 推送到远程
git push origin master

# 3. 打版本标签
git tag v1.0.0
git push origin v1.0.0

# 或者一起推送
git push origin master --tags
```

### 查看 Release

发布成功后：
1. 访问：https://github.com/joe188/divination-app/releases
2. 下载最新 APK
3. 安装到 Android 设备

### 自定义发布说明

GitHub Actions 会自动生成发布说明，也可以手动编辑：

1. 访问 Releases 页面
2. 点击对应版本
3. 点击 "Edit" 编辑说明
4. 添加更新日志、功能介绍等

### 构建产物

每次构建会生成：
- **app-release.apk** - Release 版本 APK（约 20MB）
- **构建日志** - 详细构建过程
- **测试报告** - 如果有测试的话

### 故障排查

#### 构建失败
查看 Actions 日志，常见原因：
- 依赖下载失败 → 检查网络
- 代码编译错误 → 修复代码
- 签名问题 → 检查签名配置

#### APK 未生成
检查：
- JS Bundle 是否生成成功
- Gradle 构建是否完成
- 输出路径是否正确

### 高级配置

#### 添加自动签名

在 `android/gradle.properties` 添加：
```properties
RELEASE_STORE_FILE=release-key.keystore
RELEASE_KEY_ALIAS=my-key-alias
RELEASE_STORE_PASSWORD=your-password
RELEASE_KEY_PASSWORD=your-password
```

在 `android/app/build.gradle` 配置签名：
```groovy
android {
    signingConfigs {
        release {
            storeFile file(RELEASE_STORE_FILE)
            storePassword RELEASE_STORE_PASSWORD
            keyAlias RELEASE_KEY_ALIAS
            keyPassword RELEASE_KEY_PASSWORD
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

#### 多渠道打包

修改 `android/app/build.gradle`：
```groovy
flavorDimensions "version"
productFlavors {
  full {
    dimension "version"
    applicationIdSuffix ".full"
  }
  lite {
    dimension "version"
    applicationIdSuffix ".lite"
  }
}
```

### 相关文件

- `.github/workflows/android-release.yml` - 发布工作流
- `.github/workflows/android.yml` - CI 测试工作流
- `android/app/build.gradle` - Android 构建配置
- `android/gradle.properties` - Gradle 配置

---

**最后更新**: 2026-03-26  
**维护者**: 虾仔 🦐
