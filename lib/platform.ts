export function isElectron(): boolean {
  if (typeof window !== 'undefined') {
    // Check multiple ways to detect Electron
    const userAgent = navigator.userAgent.toLowerCase();
    return (
      !!(window as any).electron || 
      userAgent.indexOf('electron') > -1 ||
      !!(window as any).process?.type
    );
  }
  return false;
}
