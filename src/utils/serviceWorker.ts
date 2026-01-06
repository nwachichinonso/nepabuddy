// Register service worker for push notifications
export const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  try {
    // Register the push service worker
    const registration = await navigator.serviceWorker.register('/sw-push.js', {
      scope: '/',
    });

    console.log('Service Worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
};

// Initialize service worker on app load
export const initServiceWorker = async () => {
  if (typeof window === 'undefined') return;

  // Wait for load to not block initial render
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      registerServiceWorker();
    });
  } else {
    await registerServiceWorker();
  }
};
