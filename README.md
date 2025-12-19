# HelloExpo BLE Scanner

这是一个基于 Expo 和 React Native 开发的蓝牙低功耗 (BLE) 扫描与连接示例应用。

## ✨ 功能特性

- 🔍 **蓝牙扫描**: 扫描附近的 BLE 设备。
- 📱 **设备连接**: 支持连接到 BLE 设备并查看详情。
- 🛡️ **权限管理**: 处理 Android 和 iOS 的蓝牙权限请求。
- 🎨 **现代 UI**: 使用 NativeWind (Tailwind CSS) 构建的响应式界面。
- ⚡ **高性能**: 基于 Expo SDK 54 和 React Native 0.81+。

## 🛠️ 技术栈

- **核心框架**: [React Native](https://reactnative.dev/), [Expo](https://expo.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **蓝牙库**: [react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx)
- **样式**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS)
- **包管理**: pnpm

## 🚀 快速开始

### 环境要求

- Node.js (推荐 LTS 版本)
- pnpm
- Android Studio (用于 Android 开发) 或 Xcode (用于 iOS 开发)
- 实体真机 (蓝牙功能无法在模拟器中完全测试)

### 安装依赖

```bash
pnpm install
```

### 运行应用

由于涉及到原生蓝牙模块，建议使用预构建 (Prebuild) 模式运行：

**Android:**

```bash
pnpm android
```

**iOS:**

```bash
pnpm ios
```

启动开发服务器：

```bash
pnpm start
```

## 📂 项目结构

```
helloexpo/
├── app.config.ts          # Expo 配置文件
├── App.tsx                # 应用入口
├── components/            # 组件目录
│   ├── BleScanner.tsx     # 蓝牙扫描主组件
│   └── ble/               # BLE 相关子组件
├── plugins/               # Expo Config Plugins
├── global.css             # Tailwind 全局样式
└── package.json
```

## ⚠️ 注意事项

1. **真机调试**: 蓝牙功能依赖硬件，请务必在真机上运行调试。
2. **权限**: Android 12+ 需要 `BLUETOOTH_SCAN` 和 `BLUETOOTH_CONNECT` 权限，应用已包含相关处理逻辑。
3. **Expo Dev Client**: 本项目使用了原生代码 (`react-native-ble-plx`)，不能直接在 Expo Go 中运行，需要构建 Development Build。

## 📄 许可证

MIT
