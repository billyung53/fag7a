# Dynamic CSS System

## Overview

This system automatically adjusts your website's layout and styling based on the actual device capabilities, including screen size, viewport dimensions, pixel ratio, and device type.

## How It Works

### 1. Device Detection (`useDeviceInfo.js`)

- Detects real device dimensions, not just CSS media queries
- Monitors both screen size AND viewport size
- Tracks orientation changes, pixel ratio, device type
- Updates automatically when device rotates or browser resizes

### 2. Dynamic CSS Generation (`useDynamicCSS.js`)

- Uses device info to generate CSS custom properties
- Creates device-specific styles injected into `<head>`
- Accounts for both screen AND viewport limitations
- Ensures no content exceeds actual screen boundaries

### 3. Device-Optimized Utilities (`deviceOptimized.css`)

- Provides utility classes that work with dynamic CSS variables
- Includes responsive components, safe area handling
- Touch-optimized button sizes and spacing

## Key Features

✅ **No Overflow Guarantee**: Content never exceeds actual screen dimensions
✅ **Viewport + Screen Aware**: Uses both viewport AND screen size for calculations  
✅ **Real Device Dimensions**: Not just generic breakpoints
✅ **Auto-Scaling Elements**: Buttons, fonts, gaps scale to device
✅ **Touch Optimization**: Proper touch targets on mobile devices
✅ **Orientation Handling**: Responds to landscape/portrait changes
✅ **Safe Area Support**: Handles device notches and rounded corners

## CSS Variables Available

The system creates these CSS custom properties:

```css
:root {
  --actual-screen-width: [device screen width]px;
  --actual-screen-height: [device screen height]px;
  --actual-viewport-width: [browser viewport width]px;
  --actual-viewport-height: [browser viewport height]px;
  --safe-area-width: [usable width]px;
  --safe-area-height: [usable height]px;
  --optimal-font-size: [calculated font size]px;
  --optimal-button-height: [calculated button height]px;
  --optimal-gap: [calculated spacing]px;
  --optimal-padding: [calculated padding]px;
}
```

## Usage

### Automatic (Recommended)

The system is automatically applied globally through `App.js`. No additional code needed in components.

### Manual Override

If you need device-specific styling in a component:

```javascript
import useDynamicCSS from "../hooks/useDynamicCSS";

function MyComponent() {
  const deviceInfo = useDynamicCSS(); // Optional: get device info

  return (
    <div className="device-constrained">
      <button className="device-btn">Auto-sized button</button>
      <div className="device-text-scale">Auto-sized text</div>
    </div>
  );
}
```

### CSS Classes Available

```css
.device-constrained    /* Constrains to safe device dimensions */
/* Constrains to safe device dimensions */
.device-flex-center    /* Responsive flex centering */
.device-btn           /* Touch-optimized buttons */
.device-text-scale    /* Auto-scaling typography */
.device-gap           /* Responsive spacing */
.device-padding       /* Responsive padding */
.safe-area-padding; /* Handles device notches */
```

## Examples

### Before (Generic Breakpoints)

```css
@media (max-width: 768px) {
  .button {
    font-size: 14px;
    height: 40px;
  }
}
```

### After (Device-Aware)

```css
.button {
  font-size: var(--optimal-font-size);
  height: var(--optimal-button-height);
  max-width: var(--safe-area-width);
}
```

## Device Testing

The DeviceInfoPanel shows:

- Real screen vs viewport dimensions
- Applied CSS variables
- Device type detection
- Safe area calculations

Enable in `src/config/devConfig.js`:

```javascript
export const DEV_CONFIG = {
  SHOW_DEVICE_INFO: true, // Shows floating debug panel
};
```

## Benefits

1. **Perfect Fit**: Content always fits within actual device boundaries
2. **No Horizontal Scrolling**: Guaranteed to fit viewport width
3. **Touch Friendly**: Proper button sizes for mobile devices
4. **Performance**: Eliminates layout shifts and overflow issues
5. **Future Proof**: Works with any device size automatically

## Production Ready

Set `SHOW_DEVICE_INFO: false` in devConfig.js before deployment. The dynamic CSS system has minimal performance impact and improves user experience across all devices.
