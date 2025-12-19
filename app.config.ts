import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => {
  return {
    ...config,
    name: "helloexpo",
    slug: "helloexpo",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "org.vidlg.helloexpo",
      infoPlist: {
        NSBluetoothAlwaysUsageDescription: "Allow $(PRODUCT_NAME) to connect to bluetooth devices",
        NSBluetoothPeripheralUsageDescription: "Allow $(PRODUCT_NAME) to connect to bluetooth devices"
      }
    },
    android: {
      package: "org.vidlg.helloexpo",
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    experiments: {
      tsconfigPaths: true
    },
    plugins: [
      "./plugins/withAndroidMirrors",
      ["./plugins/withNdk", {}],
      [
        "react-native-ble-plx",
        {
          "isBackgroundEnabled": false,
          "modes": [
            "peripheral",
            "central"
          ],
          "bluetoothAlwaysPermission": "Allow $(PRODUCT_NAME) to connect to bluetooth devices"
        }
      ]
    ]
  };
};
