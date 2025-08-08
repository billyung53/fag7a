import React from 'react';
import useDeviceInfo from '../hooks/useDeviceInfo';


function Authentication() {
  const deviceInfo = useDeviceInfo();

  // Use optional chaining and default values
  const width = deviceInfo?.viewport?.width || 0;
  const height = deviceInfo?.viewport?.height || 0;

  console.log(width, height);
  console.log('Viewport:', deviceInfo?.viewport);
  
  return (
    <div 
    
    style={{ 
        width: `${width/1.15}px`, 
        height: `${height/2}px`, 
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
        </div>
      )}
    </div>
  );
}
export default Authentication;
