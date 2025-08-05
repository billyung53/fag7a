import { useState, useEffect } from 'react';

function useOrientation() {
  const [orientation, setOrientation] = useState({
    isPortrait: window.innerHeight > window.innerWidth,
    isLandscape: window.innerWidth > window.innerHeight,
    isMobile: window.innerWidth <= 768
  });

  useEffect(() => {
    const updateOrientation = () => {
      setOrientation({
        isPortrait: window.innerHeight > window.innerWidth,
        isLandscape: window.innerWidth > window.innerHeight,
        isMobile: window.innerWidth <= 768
      });
    };

    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}

export default useOrientation;
