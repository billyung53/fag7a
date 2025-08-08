// components/DeviceInfoPanel/DeviceInfoWrapper.js
import React from 'react';
import DeviceInfoPanel from './DeviceInfoPanel';
import { DEV_CONFIG } from '../../config/devConfig';

const DeviceInfoWrapper = () => {
  // Only render if enabled in dev config
  if (!DEV_CONFIG.SHOW_DEVICE_INFO) {
    return null;
  }

  return <DeviceInfoPanel />;
};

export default DeviceInfoWrapper;
