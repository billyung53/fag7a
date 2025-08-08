import React from 'react';
import useDeviceInfo from '../hooks/useDeviceInfo';
import useWindowWidth from '../hooks/useWindowWidth';

function Authentication() {
  const deviceInfo = useDeviceInfo();
  const windowWidth = useWindowWidth();

  // Use optional chaining and default values
  let containerWidth;

  if (deviceInfo?.viewport?.width < 600) {
    containerWidth = deviceInfo?.viewport?.width/1.2; // Mobile devices
  }
  if (deviceInfo?.viewport?.width > 600) {
    containerWidth = deviceInfo?.viewport?.width/1.9; // Desktop devices
  }

  const width = deviceInfo?.viewport?.width || 0;
  const height = deviceInfo?.viewport?.height || 0;

  console.log(width, height);
  console.log('Viewport:', deviceInfo?.viewport);
  console.log('Device Info:', deviceInfo);

  
  return (
    <>
      <div className='test' style={{
        width: `${containerWidth}px`, 
        height: `${height/1.3}px`, 
        textAlign: 'center', 
        backgroundColor: '#1a1a1a',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        position: 'absolute',
      }}>
        {deviceInfo && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}>
            <p style={{ color: '#fff', fontSize: '16px' }}>Width: {width}px</p>
            <p style={{ color: '#fff', fontSize: '16px' }}>Height: {height}px</p>
            <p style={{ color: '#fff', fontSize: '16px' }}>Device Type: {deviceInfo.deviceType}</p>
            <p style={{ color: '#fff', fontSize: '16px' }}>{deviceInfo?.screen?.availableWidth}</p>
            <p style={{ color: '#fff', fontSize: '16px' }}>{windowWidth}</p>
          </div>
        )}
      </div>

      {/* Floating Circle Button */}
      <button
        style={{
          position: 'fixed',
          bottom: '50%',
          left: '12%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          transform: 'scale(1)',
        }}
      >
        1
      </button>

            {/* Floating Circle Button */}
      <button
        style={{
          position: 'fixed',
          bottom: '50%',
          right: '12%',
          width: '60px',
          height: '60px',
          borderRadius: '50%',
          backgroundColor: '#007bff',
          border: 'none',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(0, 123, 255, 0.3)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          transform: 'scale(1)',
        }}
      >
        2
      </button>
    </>
  );
}

export default Authentication;