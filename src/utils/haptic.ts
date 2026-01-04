// Haptic feedback utilities
export const haptic = {
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },
  
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(25);
    }
  },
  
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  },
  
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 30]);
    }
  },
  
  warning: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 100, 50]);
    }
  },
  
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100, 50, 100]);
    }
  },
  
  notification: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 30, 30]);
    }
  },
  
  powerChange: (isOn: boolean) => {
    if ('vibrate' in navigator) {
      if (isOn) {
        // Exciting pattern for power restored
        navigator.vibrate([50, 100, 50, 100, 150]);
      } else {
        // Sad pattern for power outage
        navigator.vibrate([200, 100, 200]);
      }
    }
  },
};

export default haptic;
