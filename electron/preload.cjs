// Electron Preload Script
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktopApp', {
  isDesktop: true,
  platform: process.platform,
  version: '2026.1.0',
  developer: 'صادق الظاهري 2026',
  contact: '772092700',
});
