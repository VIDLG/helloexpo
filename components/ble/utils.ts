export const getServiceName = (uuid: string) => {
  const commonServices: { [key: string]: string } = {
    '1800': 'Generic Access',
    '1801': 'Generic Attribute',
    '180a': 'Device Information',
    '180f': 'Battery Service',
    '1805': 'Current Time Service',
    '180d': 'Heart Rate',
    '1818': 'Cycling Power',
    '1816': 'Cycling Speed and Cadence',
  };
  // Handle both 16-bit and 128-bit UUIDs
  // 16-bit UUIDs are often returned as 0000xxxx-0000-1000-8000-00805f9b34fb
  if (uuid.length === 36 && uuid.startsWith('0000') && uuid.endsWith('00805f9b34fb')) {
    const shortUuid = uuid.substring(4, 8).toLowerCase();
    return commonServices[shortUuid] || 'Custom Service';
  }
  return commonServices[uuid.toLowerCase()] || 'Custom Service';
};
