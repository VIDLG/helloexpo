import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Device } from 'react-native-ble-plx';

interface BleDeviceItemProps {
  device: Device;
  onPress: (device: Device) => void;
  onDisconnect?: (device: Device) => void;
  actionLabel?: string;
  isConnected?: boolean;
}

export const BleDeviceItem = ({ device, onPress, onDisconnect, actionLabel = 'Connect', isConnected = false }: BleDeviceItemProps) => {
  const name = device.name || device.localName || 'Unknown Device';
  const initial = (name || '?')[0].toUpperCase();

  if (isConnected) {
    return (
      <TouchableOpacity
        onPress={() => onPress(device)}
        className="flex-row items-center p-3 bg-green-50 border border-green-100 rounded-lg mb-2">
        <View className="w-8 h-8 rounded-full bg-green-200 items-center justify-center mr-2">
          <Text className="text-green-700 font-bold">{initial}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>
            {name}
          </Text>
          <Text className="text-[10px] text-green-600 font-medium">Connected</Text>
        </View>
        {onDisconnect && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onDisconnect(device);
            }}
            className="bg-red-100 px-3 py-1.5 rounded-md ml-2">
            <Text className="text-red-600 text-xs font-bold">Disconnect</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(device)}
      className="flex-row items-center p-4 border-b border-gray-100 bg-white active:bg-gray-50">
      <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
        <Text className="text-blue-600 font-bold text-lg">{initial}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800">{name}</Text>
        <Text className="text-xs text-gray-500 mt-1">{device.id}</Text>
      </View>
      <View className="items-end">
        <Text className="text-xs text-gray-400">{device.rssi ? `${device.rssi} dBm` : ''}</Text>
        <Text className="text-xs text-blue-500 mt-1">{actionLabel}</Text>
      </View>
    </TouchableOpacity>
  );
};
