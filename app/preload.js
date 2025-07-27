const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('app', 
{
  minimize: () => ipcRenderer.invoke('app.minimize'),
  close: () => ipcRenderer.invoke('app.close')
})

contextBridge.exposeInMainWorld('connecting', 
{
  list: () => ipcRenderer.invoke('connecting.list'),
  createConnection: (port) => ipcRenderer.invoke('connecting.createConnection', port),
  write: (message) => ipcRenderer.invoke('connecting.write', message),
  
  close: () => ipcRenderer.invoke('connecting.close'),
  disconnectingDevice: (callback) => ipcRenderer.on('connecting.disconnectingDevice', (_event) => callback()),
  receivingData: (callback) => ipcRenderer.on('connecting.receivingData', (_event, value) => callback(value)),
  isOpen: (callback) => ipcRenderer.on('connecting.isOpen', (_event, value) => callback(value)),
})