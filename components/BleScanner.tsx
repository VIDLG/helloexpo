import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Platform,
  PermissionsAndroid,
  ActivityIndicator,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BleDeviceItem } from './ble/BleDeviceItem';
import { BleDeviceDetails } from './ble/BleDeviceDetails';

const manager = new BleManager();

// rendering phase, 渲染阶段
// 异步时机设置状态
export const BleScanner = () => {
  const insets = useSafeAreaInsets();
  const [isScanning, setIsScanning] = useState(false);
  const [scannedDevices, setScannedDevices] = useState<Device[]>([]);
  const [connectedDevices, setConnectedDevices] = useState<Device[]>([]);
  const [viewingDevice, setViewingDevice] = useState<Device | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectingDeviceId, setConnectingDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const subscription = manager.onStateChange((state) => {
      if (state === 'PoweredOn') {
        // Bluetooth is ready
      } else if (state === 'Unauthorized') {
        if (Platform.OS === 'ios') {
          Alert.alert('Permission Error', 'Please allow Bluetooth permission in Settings');
        }
      }
    }, true);
    return () => {
      subscription.remove();
      manager.stopDeviceScan();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      if (Platform.Version >= 31) {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          result['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } else {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    }
    return true;
  };

  const startScan = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert('权限不足', '请授予蓝牙权限以进行扫描');
      return;
    }

    setScannedDevices([]);
    setIsScanning(true);

    manager.startDeviceScan(null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        console.log('Scan error:', error);
        setIsScanning(false);
        Alert.alert('扫描错误', error.message);
        return;
      }

      if (device) {
        setScannedDevices((prevDevices) => {
          if (prevDevices.find((d) => d.id === device.id)) {
            return prevDevices;
          }
          // Don't add if already connected
          if (connectedDevices.find((d) => d.id === device.id)) {
            return prevDevices;
          }
          return [...prevDevices, device];
        });
      }
    });

    // Auto stop after 10 seconds
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  const stopScan = () => {
    manager.stopDeviceScan();
    setIsScanning(false);
  };

  const connectToDevice = async (device: Device) => {
    stopScan();
    setIsConnecting(true);
    setConnectingDeviceId(device.id);
    try {
      // Check if already connected
      if (connectedDevices.find((d) => d.id === device.id)) {
        Alert.alert('Already connected');
        return;
      }

      const connected = await manager.connectToDevice(device.id);
      // We discover services here to ensure the device is ready, but we load them in details view
      await connected.discoverAllServicesAndCharacteristics();

      setConnectedDevices((prev) => [...prev, connected]);

      // Remove from scanned list
      setScannedDevices((prev) => prev.filter((d) => d.id !== device.id));

      // Automatically view the newly connected device
      setViewingDevice(connected);
    } catch (e: any) {
      console.log('Connection error:', e);
      // Don't show alert if cancelled (error code 201 or message check could be added here)
      if (e.errorCode !== 201 && e.message !== 'Cancelled') {
         Alert.alert('连接失败', e.message || '无法连接到设备');
      }
    } finally {
      setIsConnecting(false);
      setConnectingDeviceId(null);
    }
  };

  const cancelConnection = async () => {
    if (connectingDeviceId) {
      try {
        await manager.cancelDeviceConnection(connectingDeviceId);
      } catch (e) {
        console.log('Cancel connection error:', e);
      }
      setIsConnecting(false);
      setConnectingDeviceId(null);
    }
  };

  const disconnectDevice = async (device: Device) => {
    try {
      await manager.cancelDeviceConnection(device.id);
      setConnectedDevices((prev) => prev.filter((d) => d.id !== device.id));

      if (viewingDevice?.id === device.id) {
        setViewingDevice(null);
      }
    } catch (e) {
      console.log('Disconnect error:', e);
    }
  };

  // Detail View for a specific device
  if (viewingDevice) {
    return (
      <BleDeviceDetails
        device={viewingDevice}
        onBack={() => setViewingDevice(null)}
        onDisconnect={disconnectDevice}
      />
    );
  }

  // Main Scanner View
  return (
    <View className="flex-1 bg-gray-50">
      {/* Scanner Header */}
      <View style={{ paddingTop: insets.top }} className="bg-white shadow-sm z-10">
        <View className="p-4">
          <Text className="text-2xl font-bold text-gray-900">BLE Scanner</Text>
          <Text className="text-sm text-gray-500">Find nearby Bluetooth Low Energy devices</Text>
        </View>
      </View>

      {isConnecting && (
        <View className="absolute inset-0 bg-black/30 z-50 items-center justify-center">
          <View className="bg-white p-6 rounded-2xl items-center shadow-lg w-48">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="mt-4 text-gray-700 font-medium">Connecting...</Text>
            <TouchableOpacity
              onPress={cancelConnection}
              className="mt-4 bg-gray-100 px-4 py-2 rounded-full active:bg-gray-200">
              <Text className="text-gray-600 font-medium text-sm">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={isScanning} onRefresh={startScan} colors={['#2563eb']} />
        }>
        {/* Connected Devices Section */}
        {connectedDevices.length > 0 && (
          <View className="mt-4">
            <Text className="px-4 text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">
              Connected Devices ({connectedDevices.length})
            </Text>
            <View className="px-4">
              {connectedDevices.map((device) => (
                <BleDeviceItem
                  key={device.id}
                  device={device}
                  onPress={() => setViewingDevice(device)}
                  onDisconnect={disconnectDevice}
                  isConnected={true}
                />
              ))}
            </View>
          </View>
        )}

        {/* Scanned Devices Section */}
        <View className="mt-4">
          <Text className="px-4 text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">
            Available Devices
          </Text>
          {scannedDevices.length === 0 ? (
            <View className="items-center justify-center py-10 px-10">
              <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                <Text className="text-3xl">📡</Text>
              </View>
              <Text className="text-gray-500 text-center font-medium">
                {isScanning ? 'Scanning...' : 'No devices found'}
              </Text>
            </View>
          ) : (
            scannedDevices.map((device) => (
              <View key={device.id}>
                <BleDeviceItem device={device} onPress={connectToDevice} />
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <View
        className="absolute left-0 right-0 items-center"
        style={{ bottom: 32 + insets.bottom }}>
        <TouchableOpacity
          onPress={isScanning ? stopScan : startScan}
          className={`px-8 py-4 rounded-full shadow-lg flex-row items-center ${
            isScanning ? 'bg-red-500' : 'bg-blue-600'
          }`}>
          <Text className="text-white font-bold text-lg mr-2">
            {isScanning ? 'Stop Scanning' : 'Start Scan'}
          </Text>
          {isScanning && <ActivityIndicator color="white" size="small" />}
        </TouchableOpacity>
      </View>
    </View>
  );
};
