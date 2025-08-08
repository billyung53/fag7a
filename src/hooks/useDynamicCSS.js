// hooks/useDynamicCSS.js
import { useEffect } from 'react';
import useDeviceInfo from './useDeviceInfo';

const useDynamicCSS = () => {
  const deviceInfo = useDeviceInfo();

  useEffect(() => {
    if (!deviceInfo) return;

    // Remove existing dynamic styles
    const existingStyle = document.getElementById('dynamic-device-styles');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Create new style element
    const styleElement = document.createElement('style');
    styleElement.id = 'dynamic-device-styles';
    
    // Get actual device dimensions
    const screenWidth = deviceInfo.screen.width;
    const screenHeight = deviceInfo.screen.height;
    const viewportWidth = deviceInfo.viewport.width;
    const viewportHeight = deviceInfo.viewport.height;
    const availableWidth = deviceInfo.screen.availableWidth;
    const availableHeight = deviceInfo.screen.availableHeight;
    const pixelRatio = deviceInfo.screen.devicePixelRatio;
    const isLandscape = viewportWidth > viewportHeight;
    const isMobile = deviceInfo.deviceType.includes('Mobile');
    const isTablet = deviceInfo.deviceType.includes('Tablet');
    const isDesktop = deviceInfo.deviceType.includes('Desktop');
    
    // Calculate safe dimensions (use the most restrictive)
    const safeWidth = Math.min(viewportWidth, screenWidth, availableWidth);
    const safeHeight = Math.min(viewportHeight, screenHeight, availableHeight);
    
    // Calculate optimal element sizes based on both screen and viewport
    const optimalFontSize = Math.max(12, Math.min(24, Math.floor(safeWidth / 30)));
    const optimalButtonHeight = Math.max(40, Math.min(80, Math.floor(safeHeight / 12)));
    const optimalGap = Math.max(3, Math.min(20, Math.floor(safeWidth / 100)));
    const optimalPadding = Math.max(5, Math.min(20, Math.floor(safeWidth / 80)));

    // Design system variables
    const designSystem = {
      // Typography scale
      fontSizeSmall: Math.max(10, Math.min(14, Math.floor(optimalFontSize * 0.7))),
      fontSizeBase: optimalFontSize,
      fontSizeLarge: Math.min(32, Math.floor(optimalFontSize * 1.5)),
      fontSizeXLarge: Math.min(48, Math.floor(optimalFontSize * 2)),
      
      // Spacing scale
      spaceXSmall: Math.max(2, Math.min(5, Math.floor(optimalGap * 0.5))),
      spaceSmall: optimalGap,
      spaceMedium: Math.max(8, Math.min(25, Math.floor(optimalGap * 2))),
      spaceLarge: Math.max(12, Math.min(40, Math.floor(optimalGap * 3))),
      spaceXLarge: Math.max(16, Math.min(60, Math.floor(optimalGap * 4))),
      
      // Padding scale
      paddingSmall: optimalPadding,
      paddingMedium: Math.max(8, Math.min(30, Math.floor(optimalPadding * 1.5))),
      paddingLarge: Math.max(12, Math.min(40, Math.floor(optimalPadding * 2))),
      
      // Component sizes
      buttonHeight: optimalButtonHeight,
      buttonHeightSmall: Math.max(30, Math.min(50, Math.floor(optimalButtonHeight * 0.75))),
      buttonHeightLarge: Math.min(100, Math.floor(optimalButtonHeight * 1.25)),
      
      // Layout dimensions (based on viewport)
      sidebarWidth: Math.max(120, Math.min(250, Math.floor(safeWidth * 0.18))),
      contentWidth: Math.max(400, Math.min(1200, Math.floor(safeWidth * 0.6))),
      gridItemMinWidth: Math.max(100, Math.min(200, Math.floor(safeWidth * 0.15))),
      
      // Border radius
      borderRadius: Math.max(4, Math.min(12, Math.floor(optimalPadding * 0.8))),
      borderRadiusLarge: Math.max(8, Math.min(20, Math.floor(optimalPadding * 1.2))),
    };

    // Generate dynamic CSS based on actual device info and viewport
    const dynamicCSS = `
      /* Dynamic styles for ${deviceInfo.deviceType} - Screen: ${screenWidth}x${screenHeight}, Viewport: ${viewportWidth}x${viewportHeight} */
      :root {
        --actual-screen-width: ${screenWidth}px;
        --actual-screen-height: ${screenHeight}px;
        --actual-viewport-width: ${viewportWidth}px;
        --actual-viewport-height: ${viewportHeight}px;
        --available-width: ${availableWidth}px;
        --available-height: ${availableHeight}px;
        --pixel-ratio: ${pixelRatio};
        --safe-area-width: ${safeWidth}px;
        --safe-area-height: ${safeHeight - 20}px; /* Extra margin for OS elements */
        
        /* Legacy variables for backward compatibility */
        --optimal-font-size: ${optimalFontSize}px;
        --optimal-button-height: ${optimalButtonHeight}px;
        --optimal-gap: ${optimalGap}px;
        --optimal-padding: ${optimalPadding}px;
        
        /* Design System - Typography */
        --font-size-small: ${designSystem.fontSizeSmall}px;
        --font-size-base: ${designSystem.fontSizeBase}px;
        --font-size-large: ${designSystem.fontSizeLarge}px;
        --font-size-xlarge: ${designSystem.fontSizeXLarge}px;
        
        /* Design System - Spacing */
        --space-xs: ${designSystem.spaceXSmall}px;
        --space-sm: ${designSystem.spaceSmall}px;
        --space-md: ${designSystem.spaceMedium}px;
        --space-lg: ${designSystem.spaceLarge}px;
        --space-xl: ${designSystem.spaceXLarge}px;
        
        /* Design System - Padding */
        --padding-sm: ${designSystem.paddingSmall}px;
        --padding-md: ${designSystem.paddingMedium}px;
        --padding-lg: ${designSystem.paddingLarge}px;
        
        /* Design System - Component Sizes */
        --button-height: ${designSystem.buttonHeight}px;
        --button-height-sm: ${designSystem.buttonHeightSmall}px;
        --button-height-lg: ${designSystem.buttonHeightLarge}px;
        
        /* Design System - Layout */
        --sidebar-width: ${designSystem.sidebarWidth}px;
        --content-width: ${designSystem.contentWidth}px;
        --grid-item-min-width: ${designSystem.gridItemMinWidth}px;
        
        /* Design System - Border Radius */
        --border-radius: ${designSystem.borderRadius}px;
        --border-radius-lg: ${designSystem.borderRadiusLarge}px;
        
        /* Dynamic Layout Percentages */
        --layout-sidebar-percent: ${Math.max(15, Math.min(20, (designSystem.sidebarWidth / safeWidth) * 100))}%;
        --layout-content-percent: ${Math.max(60, Math.min(70, (designSystem.contentWidth / safeWidth) * 100))}%;
        
        /* Device type identifier */
        --device-type: '${deviceInfo.deviceType}';
      }

      /* Global reset to prevent overflow */
      * {
        box-sizing: border-box;
        max-width: 100%;
      }

      html, body {
        width: 100vw !important;
        height: 100vh !important;
        max-width: var(--safe-area-width) !important;
        max-height: var(--safe-area-height) !important;
        overflow: hidden !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        margin: 0 !important;
        padding: 0 !important;
        ${isMobile ? 'touch-action: manipulation;' : ''}
      }

      /* App container - constrain to safe dimensions */
      .App {
        width: 100% !important;
        height: 100% !important;
        max-width: var(--safe-area-width) !important;
        max-height: var(--safe-area-height) !important;
        overflow: hidden !important;
        position: relative !important;
      }

      /* Main container adjustments */
      .container {
        width: 100% !important;
        height: 100% !important;
        max-width: var(--safe-area-width) !important;
        max-height: var(--safe-area-height) !important;
        overflow: hidden !important;
        position: relative !important;
        display: flex !important;
        flex-direction: column !important;
      }

      /* Game layout - optimized for viewport and screen */
      .game-layout {
        width: 100% !important;
        height: 100% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: var(--optimal-gap) !important;
        padding: var(--optimal-padding) !important;
        overflow: hidden !important;
        ${isLandscape && isMobile ? `
          flex-direction: row;
          gap: ${Math.max(3, Math.floor(safeWidth / 150))}px;
          padding: ${Math.max(3, Math.floor(safeWidth / 200))}px;
        ` : ''}
      }

      /* Team score panels - responsive sizing */
      .team-score {
        width: ${isMobile ? Math.max(60, Math.floor(safeWidth / 8)) : Math.max(100, Math.floor(safeWidth / 12))}px !important;
        height: ${isMobile ? Math.max(60, Math.floor(safeHeight / 10)) : Math.max(100, Math.floor(safeHeight / 8))}px !important;
        flex-shrink: 0 !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: ${Math.max(10, Math.floor(safeWidth / 60))}px !important;
      }

      .team-score .score-circle {
        width: ${isMobile ? Math.max(40, Math.floor(safeWidth / 12)) : Math.max(60, Math.floor(safeWidth / 20))}px !important;
        height: ${isMobile ? Math.max(40, Math.floor(safeWidth / 12)) : Math.max(60, Math.floor(safeWidth / 20))}px !important;
        font-size: ${Math.max(12, Math.floor(safeWidth / 40))}px !important;
      }

      /* Jeopardy grid - main game area */
      .jeopardy-grid {
        flex: 1 !important;
        max-width: calc(var(--safe-area-width) - ${isMobile ? Math.floor(safeWidth / 4) : Math.floor(safeWidth / 6)}px) !important;
        max-height: var(--safe-area-height) !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        gap: var(--optimal-gap) !important;
        overflow: hidden !important;
        padding: 0 !important;
      }

      /* Category headers */
      .category-header {
        min-height: var(--optimal-button-height) !important;
        max-height: ${Math.floor(safeHeight / 8)}px !important;
        font-size: ${Math.max(10, Math.floor(safeWidth / 50))}px !important;
        padding: ${Math.max(5, Math.floor(safeWidth / 100))}px !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: center !important;
        align-items: center !important;
        overflow: hidden !important;
        word-wrap: break-word !important;
        text-overflow: ellipsis !important;
      }

      .category-row {
        display: flex !important;
        gap: var(--optimal-gap) !important;
        width: 100% !important;
        height: 100% !important;
        justify-content: space-between !important;
      }

      .category-row .category-header {
        flex: 1 !important;
      }

      /* Value buttons row */
      .value-row {
        display: flex !important;
        gap: var(--optimal-gap) !important;
        width: 100% !important;
        justify-content: space-between !important;
        flex-wrap: wrap !important;
      }

      .value-row .value-btn {
        flex: 1 !important;
        min-width: ${Math.max(60, Math.floor(safeWidth / 8))}px !important;
        min-height: var(--optimal-button-height) !important;
        font-size: ${Math.max(12, Math.floor(safeWidth / 45))}px !important;
      }

      /* Question display - full screen utilization */
      .question-display-container {
        width: 100% !important;
        height: 100% !important;
        max-height: var(--safe-area-height) !important;
        display: flex !important;
        flex-direction: column !important;
        justify-content: space-between !important;
        padding: var(--optimal-padding) !important;
        overflow: hidden !important;
        gap: ${Math.max(5, Math.floor(safeHeight / 40))}px !important;
      }

      /* Timer positioning and sizing */
      .question-timer {
        width: ${Math.max(40, Math.floor(Math.min(safeWidth, safeHeight) / 15))}px !important;
        height: ${Math.max(40, Math.floor(Math.min(safeWidth, safeHeight) / 15))}px !important;
        font-size: ${Math.max(14, Math.floor(Math.min(safeWidth, safeHeight) / 25))}px !important;
        flex-shrink: 0 !important;
      }

      /* Question text - adaptive sizing */
      .question {
        flex: 1 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        font-size: ${Math.max(14, Math.min(24, Math.floor(safeWidth / 35)))}px !important;
        line-height: 1.4 !important;
        max-height: ${Math.floor(safeHeight * 0.4)}px !important;
        overflow: hidden !important;
        padding: ${Math.max(5, Math.floor(safeWidth / 100))}px !important;
        word-wrap: break-word !important;
        hyphens: auto !important;
      }

      /* Answer buttons grid - optimized for device */
      .answers {
        display: grid !important;
        grid-template-columns: 1fr 1fr !important;
        gap: ${Math.max(8, Math.floor(safeWidth / 80))}px !important;
        max-height: ${Math.floor(safeHeight * 0.35)}px !important;
        flex-shrink: 0 !important;
        width: 100% !important;
      }

      .answer-btn {
        min-height: ${Math.max(40, Math.floor(safeHeight / 8))}px !important;
        max-height: ${Math.floor(safeHeight / 6)}px !important;
        font-size: ${Math.max(10, Math.min(16, Math.floor(safeWidth / 50)))}px !important;
        padding: ${Math.max(5, Math.floor(safeWidth / 100))}px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        text-align: center !important;
        word-wrap: break-word !important;
        overflow: hidden !important;
        line-height: 1.3 !important;
        hyphens: auto !important;
      }

      /* Back button optimizations */
      .back-button {
        padding: ${Math.max(5, Math.floor(safeWidth / 100))}px ${Math.max(10, Math.floor(safeWidth / 60))}px !important;
        font-size: ${Math.max(12, Math.floor(safeWidth / 60))}px !important;
        min-height: ${Math.max(32, Math.floor(safeHeight / 20))}px !important;
      }

      /* Result display */
      .result {
        font-size: ${Math.max(16, Math.floor(safeWidth / 30))}px !important;
        padding: ${Math.max(8, Math.floor(safeWidth / 80))}px !important;
        text-align: center !important;
        flex-shrink: 0 !important;
      }

      /* Device-specific optimizations */
      ${isMobile && isLandscape ? `
        /* Mobile landscape ultra-compact mode */
        .game-layout {
          gap: 2px !important;
          padding: 2px !important;
        }
        
        .jeopardy-grid {
          gap: 2px !important;
        }
        
        .category-header {
          min-height: ${Math.max(30, Math.floor(safeHeight / 12))}px !important;
          font-size: ${Math.max(8, Math.floor(safeWidth / 70))}px !important;
          padding: 2px !important;
        }
        
        .question {
          font-size: ${Math.max(12, Math.floor(safeWidth / 45))}px !important;
          max-height: ${Math.floor(safeHeight * 0.35)}px !important;
        }
        
        .answers {
          gap: 4px !important;
          max-height: ${Math.floor(safeHeight * 0.4)}px !important;
        }
        
        .answer-btn {
          min-height: ${Math.max(35, Math.floor(safeHeight / 10))}px !important;
          font-size: ${Math.max(9, Math.floor(safeWidth / 60))}px !important;
          padding: 3px !important;
        }
      ` : ''}

      ${safeWidth <= 480 ? `
        /* Extra small screens */
        .question {
          font-size: 12px !important;
          padding: 3px !important;
          max-height: ${Math.floor(safeHeight * 0.3)}px !important;
        }
        
        .answer-btn {
          font-size: 9px !important;
          padding: 3px !important;
          min-height: ${Math.max(30, Math.floor(safeHeight / 12))}px !important;
        }
        
        .team-score {
          width: ${Math.floor(safeWidth / 10)}px !important;
          height: ${Math.floor(safeHeight / 12)}px !important;
          font-size: 8px !important;
        }
      ` : ''}

      ${isDesktop ? `
        /* Desktop optimizations */
        .game-layout {
          max-width: 1400px;
          margin: 0 auto;
        }
      ` : ''}

      /* Prevent any scrolling regardless of content */
      @media screen and (max-width: ${safeWidth}px) and (max-height: ${safeHeight}px) {
        body, html, .App, .container {
          overflow: hidden !important;
          position: fixed !important;
          max-width: ${safeWidth}px !important;
          max-height: ${safeHeight}px !important;
        }
      }

      /* Viewport-specific overrides */
      @media screen and (max-width: ${viewportWidth}px) and (max-height: ${viewportHeight}px) {
        .container, .App {
          width: ${viewportWidth}px !important;
          height: ${viewportHeight}px !important;
        }
      }
    `;

    styleElement.textContent = dynamicCSS;
    document.head.appendChild(styleElement);

    console.log(`🎯 Dynamic CSS applied for: ${deviceInfo.deviceType}`);
    console.log(`📱 Screen: ${screenWidth}x${screenHeight}, Viewport: ${viewportWidth}x${viewportHeight}`);
    console.log(`✅ Safe Area: ${safeWidth}x${safeHeight}, Pixel Ratio: ${pixelRatio}`);

  }, [deviceInfo]);

  return deviceInfo;
};

export default useDynamicCSS;
