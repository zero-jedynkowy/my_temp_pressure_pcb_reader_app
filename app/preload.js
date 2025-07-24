const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateCounter: (callback) => ipcRenderer.on('update-counter', (_event, value) => callback(value)),
  counterValue: (value) => ipcRenderer.send('counter-value', value)
})

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


  receivingData: (callback) => ipcRenderer.on('connecting.receivingData', (_event, value) => callback(value)),
})