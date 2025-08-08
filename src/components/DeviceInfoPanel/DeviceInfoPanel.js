// components/DeviceInfoPanel/DeviceInfoPanel.js
import React, { useState } from 'react';
import useDeviceInfo from '../../hooks/useDeviceInfo';
import './DeviceInfoPanel.css';

const DeviceInfoPanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const deviceInfo = useDeviceInfo();

  if (!deviceInfo) {
    return null;
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setIsMinimized(false);
    }
  };

  const toggleMinimized = () => {
    setIsMinimized(!isMinimized);
    if (!isMinimized) {
      setIsExpanded(false);
    }
  };

  const formatMemorySize = (bytes) => {
    if (!bytes) return 'N/A';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const renderSection = (title, data, isObject = false) => {
    if (!data) return null;
    
    return (
      <div className="device-info-section">
        <h4>{title}</h4>
        {isObject ? (
          <div className="device-info-object">
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="device-info-item">
                <span className="device-info-key">{key}:</span>
                <span className="device-info-value">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="device-info-value">{String(data)}</div>
        )}
      </div>
    );
  };

  return (
    <div className={`device-info-panel ${isMinimized ? 'minimized' : ''}`}>
      {/* Header with controls */}
      <div className="device-info-header">
        <span className="device-info-title">
          {isMinimized ? '📱' : 'Device Info'}
        </span>
        <div className="device-info-controls">
          {!isMinimized && (
            <button 
              className="device-info-toggle"
              onClick={toggleExpanded}
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          )}
          <button 
            className="device-info-minimize"
            onClick={toggleMinimized}
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? '📋' : '−'}
          </button>
        </div>
      </div>

      {/* Content */}
      {!isMinimized && (
        <div className={`device-info-content ${isExpanded ? 'expanded' : ''}`}>
          {/* Basic Info - Always shown */}
          <div className="device-info-basic">
            {renderSection('Device Type', deviceInfo.deviceType)}
            {renderSection('OS', `${deviceInfo.os.name} ${deviceInfo.os.version}`)}
            {renderSection('Browser', `${deviceInfo.browser.name} ${deviceInfo.browser.version}`)}
            {renderSection('Screen', `${deviceInfo.screen.width}×${deviceInfo.screen.height} (${deviceInfo.screen.orientation})`)}
            {renderSection('Viewport', `${deviceInfo.viewport.width}×${deviceInfo.viewport.height}`)}
          </div>

          {/* Detailed Info - Shown when expanded */}
          {isExpanded && (
            <div className="device-info-detailed">
              {renderSection('Screen Details', {
                'Available Size': `${deviceInfo.screen.availableWidth}×${deviceInfo.screen.availableHeight}`,
                'Color Depth': `${deviceInfo.screen.colorDepth}-bit`,
                'Pixel Ratio': deviceInfo.screen.devicePixelRatio,
                'Orientation': deviceInfo.screen.orientation
              }, true)}

              {renderSection('Language', {
                'Primary': deviceInfo.language.primary,
                'All': deviceInfo.language.all.join(', '),
                'Timezone': deviceInfo.language.timezone
              }, true)}

              {renderSection('Features', {
                'Touch Support': deviceInfo.features.touchSupport ? 'Yes' : 'No',
                'Max Touch Points': deviceInfo.features.maxTouchPoints,
                'Online': deviceInfo.features.online ? 'Yes' : 'No',
                'Cookies Enabled': deviceInfo.features.cookieEnabled ? 'Yes' : 'No'
              }, true)}

              {renderSection('Hardware', {
                'CPU Cores': deviceInfo.hardwareConcurrency
              }, true)}

              {deviceInfo.connection && renderSection('Connection', {
                'Type': deviceInfo.connection.effectiveType,
                'Downlink': `${deviceInfo.connection.downlink} Mbps`,
                'RTT': `${deviceInfo.connection.rtt}ms`,
                'Save Data': deviceInfo.connection.saveData ? 'Yes' : 'No'
              }, true)}

              {deviceInfo.memory && renderSection('Memory (Chrome)', {
                'Used JS Heap': formatMemorySize(deviceInfo.memory.usedJSHeapSize),
                'Total JS Heap': formatMemorySize(deviceInfo.memory.totalJSHeapSize),
                'JS Heap Limit': formatMemorySize(deviceInfo.memory.jsHeapSizeLimit)
              }, true)}

              {renderSection('Misc', {
                'User Agent': deviceInfo.userAgent,
                'Platform': deviceInfo.platform,
                'Vendor': deviceInfo.misc.vendor,
                'Last Updated': new Date(deviceInfo.timestamp).toLocaleString()
              }, true)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DeviceInfoPanel;
