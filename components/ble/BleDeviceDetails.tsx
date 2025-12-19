import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Device, Service, Characteristic } from 'react-native-ble-plx';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getServiceName } from './utils';

interface BleDeviceDetailsProps {
  device: Device;
  onBack: () => void;
  onDisconnect: (device: Device) => void;
}

export const BleDeviceDetails = ({ device, onBack, onDisconnect }: BleDeviceDetailsProps) => {
  const insets = useSafeAreaInsets();
  const [services, setServices] = useState<Service[]>([]);
  const [characteristics, setCharacteristics] = useState<Record<string, Characteristic[]>>({});
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, [device]);

  const loadServices = async () => {
    try {
      setLoading(true);
      // Ensure services are discovered. If already connected and discovered, this should be fast.
      // Sometimes we might need to call discoverAllServicesAndCharacteristics again if connection was lost/restored
      // or if we just want to be sure.
      if (await device.isConnected()) {
         await device.discoverAllServicesAndCharacteristics();
         const discoveredServices = await device.services();
         setServices(discoveredServices);
      } else {
          Alert.alert("Device Disconnected", "The device is no longer connected.");
          onBack();
      }
    } catch (e) {
      console.error('Error loading services:', e);
      Alert.alert('Error', 'Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const toggleService = async (service: Service) => {
    if (expandedService === service.uuid) {
      setExpandedService(null);
    } else {
      setExpandedService(service.uuid);
      if (!characteristics[service.uuid]) {
        try {
          const chars = await service.characteristics();
          setCharacteristics((prev) => ({ ...prev, [service.uuid]: chars }));
        } catch (e) {
          console.error('Failed to fetch characteristics', e);
        }
      }
    }
  };

  const renderCharacteristic = (char: Characteristic) => (
    <View key={char.id} className="pl-4 py-2 border-l-2 border-gray-200 ml-2 mb-2">
      <Text className="text-sm font-medium text-gray-700">UUID: {char.uuid}</Text>
      <View className="flex-row flex-wrap mt-1 gap-2">
        {char.isReadable && (
          <Text className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">READ</Text>
        )}
        {char.isWritableWithResponse && (
          <Text className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">WRITE</Text>
        )}
        {char.isWritableWithoutResponse && (
          <Text className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
            WRITE_NO_RESP
          </Text>
        )}
        {char.isNotifiable && (
          <Text className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">
            NOTIFY
          </Text>
        )}
        {char.isIndicatable && (
          <Text className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
            INDICATE
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View style={{ paddingTop: insets.top }} className="bg-white shadow-sm z-10">
        <View className="flex-row items-center p-4">
          <TouchableOpacity
            onPress={onBack}
            className="p-2 -ml-2 mr-2 rounded-full active:bg-gray-100">
            <Text className="text-blue-600 text-lg font-bold">← Back</Text>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
              {device.name || 'Unknown Device'}
            </Text>
            <Text className="text-xs text-green-600 font-medium">● Connected</Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Disconnect', 'Are you sure you want to disconnect?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Disconnect', style: 'destructive', onPress: () => onDisconnect(device) },
              ]);
            }}
            className="bg-red-50 px-3 py-1.5 rounded-md border border-red-100">
            <Text className="text-red-600 text-xs font-bold">Disconnect</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}>
        <Text className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">
          Services & Characteristics
        </Text>

        {loading ? (
          <View className="p-8 items-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-gray-400 mt-2">Loading services...</Text>
          </View>
        ) : services.length > 0 ? (
          services.map((service) => (
            <View
              key={service.id}
              className="bg-white rounded-xl mb-3 overflow-hidden shadow-sm border border-gray-100">
              <TouchableOpacity
                onPress={() => toggleService(service)}
                className="p-4 flex-row items-center justify-between bg-white active:bg-gray-50">
                <View className="flex-1">
                  <Text className="text-base font-bold text-gray-800">
                    {getServiceName(service.uuid)}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-0.5">{service.uuid}</Text>
                </View>
                <Text className="text-gray-400 text-lg">
                  {expandedService === service.uuid ? '−' : '+'}
                </Text>
              </TouchableOpacity>

              {expandedService === service.uuid && (
                <View className="bg-gray-50 p-3 border-t border-gray-100">
                  {characteristics[service.uuid] ? (
                    characteristics[service.uuid].length > 0 ? (
                      characteristics[service.uuid].map(renderCharacteristic)
                    ) : (
                      <Text className="text-gray-400 text-sm italic p-2">
                        No characteristics found
                      </Text>
                    )
                  ) : (
                    <ActivityIndicator size="small" color="#6b7280" className="py-4" />
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          <View className="p-8 items-center">
            <Text className="text-gray-400">No services found</Text>
          </View>
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
};
