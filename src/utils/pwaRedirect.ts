/**
 * Redirects to scan page if app is opened as PWA without a bar context
 */
export function checkPWAAndRedirect() {
  // Check if app is running in standalone mode (installed as PWA)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  // Check if we're on the home page or root
  const currentPath = window.location.pathname;
  const isRootOrHome = currentPath === '/' || currentPath === '/index.html';

  // If PWA and on root, redirect to scan
  if (isStandalone && isRootOrHome) {
    window.location.href = '/scan';
    return true;
  }

  return false;
}
