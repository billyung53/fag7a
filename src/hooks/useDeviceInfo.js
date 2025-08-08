// hooks/useDeviceInfo.js
import { useState, useEffect } from 'react';

const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState(null);

  // Helper function to detect operating system
  const getOS = () => {
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    if (userAgent.includes('Windows NT')) {
      const version = userAgent.match(/Windows NT ([\d.]+)/);
      return {
        name: 'Windows',
        version: version ? version[1] : 'Unknown',
        full: 'Windows'
      };
    }
    
    if (userAgent.includes('Mac OS X') || platform.includes('Mac')) {
      const version = userAgent.match(/Mac OS X ([\d_.]+)/);
      return {
        name: 'macOS',
        version: version ? version[1].replace(/_/g, '.') : 'Unknown',
        full: 'macOS'
      };
    }
    
    if (userAgent.includes('Linux')) {
      return {
        name: 'Linux',
        version: 'Unknown',
        full: 'Linux'
      };
    }
    
    if (userAgent.includes('Android')) {
      const version = userAgent.match(/Android ([\d.]+)/);
      return {
        name: 'Android',
        version: version ? version[1] : 'Unknown',
        full: `Android ${version ? version[1] : ''}`
      };
    }
    
    if (userAgent.includes('iPhone') || userAgent.includes('iPad') || userAgent.includes('iPod')) {
      const version = userAgent.match(/OS ([\d_]+)/);
      return {
        name: 'iOS',
        version: version ? version[1].replace(/_/g, '.') : 'Unknown',
        full: `iOS ${version ? version[1].replace(/_/g, '.') : ''}`
      };
    }
    
    return {
      name: 'Unknown',
      version: 'Unknown',
      full: 'Unknown OS'
    };
  };

  // Helper function to detect device type
  const getDeviceType = () => {
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen.width;
    
    // Check user agent first
    if (/iPhone|iPod/.test(userAgent)) {
      return 'Mobile (iPhone)';
    }
    
    if (/iPad/.test(userAgent)) {
      return 'Tablet (iPad)';
    }
    
    if (/Android/.test(userAgent)) {
      // Try to distinguish between mobile and tablet Android devices
      if (screenWidth >= 768) {
        return 'Tablet (Android)';
      }
      return 'Mobile (Android)';
    }
    
    // Fallback to screen size detection
    if (screenWidth <= 480) {
      return 'Mobile';
    } else if (screenWidth <= 1024) {
      return 'Tablet';
    } else {
      return 'Desktop';
    }
  };

  // Helper function to detect browser
  const getBrowser = () => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) {
      const version = userAgent.match(/Chrome\/([\d.]+)/);
      return {
        name: 'Chrome',
        version: version ? version[1] : 'Unknown'
      };
    }
    
    if (userAgent.includes('Firefox')) {
      const version = userAgent.match(/Firefox\/([\d.]+)/);
      return {
        name: 'Firefox',
        version: version ? version[1] : 'Unknown'
      };
    }
    
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      const version = userAgent.match(/Version\/([\d.]+)/);
      return {
        name: 'Safari',
        version: version ? version[1] : 'Unknown'
      };
    }
    
    if (userAgent.includes('Edge')) {
      const version = userAgent.match(/Edge\/([\d.]+)/);
      return {
        name: 'Edge',
        version: version ? version[1] : 'Unknown'
      };
    }
    
    return {
      name: 'Unknown',
      version: 'Unknown'
    };
  };

  // Helper function to get screen orientation
  const getOrientation = () => {
    if (window.screen && window.screen.orientation) {
      return window.screen.orientation.type;
    }
    
    // Fallback
    return window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  };

  // Helper function to detect touch support
  const getTouchSupport = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  };

  // Helper function to get connection info (if available)
  const getConnectionInfo = () => {
    if (navigator.connection || navigator.mozConnection || navigator.webkitConnection) {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      return {
        effectiveType: connection.effectiveType || 'Unknown',
        downlink: connection.downlink || 'Unknown',
        rtt: connection.rtt || 'Unknown',
        saveData: connection.saveData || false
      };
    }
    return null;
  };

  // Helper function to get memory info (Chrome only)
  const getMemoryInfo = () => {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  };

  // Main function to collect all device information
  const collectDeviceInfo = () => {
    const info = {
      // Basic device information
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      
      // Operating system
      os: getOS(),
      
      // Device type
      deviceType: getDeviceType(),
      
      // Browser information
      browser: getBrowser(),
      
      // Screen information
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        availableWidth: window.screen.availWidth,
        availableHeight: window.screen.availHeight,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth,
        devicePixelRatio: window.devicePixelRatio || 1,
        orientation: getOrientation()
      },
      
      // Viewport information
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight
      },
      
      // Language and locale
      language: {
        primary: navigator.language,
        all: navigator.languages || [navigator.language],
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      
      // Features and capabilities
      features: {
        cookieEnabled: navigator.cookieEnabled,
        javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
        touchSupport: getTouchSupport(),
        online: navigator.onLine,
        doNotTrack: navigator.doNotTrack,
        maxTouchPoints: navigator.maxTouchPoints || 0
      },
      
      // Hardware concurrency (number of CPU cores available to the browser)
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
      
      // Connection information (if available)
      connection: getConnectionInfo(),
      
      // Memory information (Chrome only)
      memory: getMemoryInfo(),
      
      // Timestamp
      timestamp: new Date().toISOString(),
      
      // Additional useful properties
      misc: {
        vendor: navigator.vendor,
        appName: navigator.appName,
        appVersion: navigator.appVersion,
        product: navigator.product,
        buildID: navigator.buildID || 'Not available'
      }
    };

    return info;
  };

  // Collect device info on mount and when screen orientation changes
  useEffect(() => {
    const updateDeviceInfo = () => {
      setDeviceInfo(collectDeviceInfo());
    };

    // Initial collection
    updateDeviceInfo();

    // Update on resize/orientation change
    const handleResize = () => {
      updateDeviceInfo();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
};

export default useDeviceInfo;