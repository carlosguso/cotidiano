import { contextBridge } from 'electron';
import type { ElectronAPI } from './index.d';

const api: ElectronAPI = {
  platform: process.platform,
};

contextBridge.exposeInMainWorld('electronAPI', api);
