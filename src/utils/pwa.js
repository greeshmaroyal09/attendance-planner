export function registerPwaServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return Promise.resolve(false);
  }

  return navigator.serviceWorker.register('/sw.js').catch((error) => {
    console.error('Service worker registration failed:', error);
    return false;
  });
}
