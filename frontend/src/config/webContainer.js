import { WebContainer } from '@webcontainer/api';

let webContainerInstance = null;

export const getWebContainer = async () => {
  if (!webContainerInstance) {
    webContainerInstance = await WebContainer.boot({
      endpoint: '/webcontainer/fetch.worker.js', // path relative to public folder
    });
  }
  return webContainerInstance;
};
