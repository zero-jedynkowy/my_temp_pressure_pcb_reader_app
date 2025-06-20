const { contextBridge,  ipcRenderer} = require('electron/renderer')

contextBridge.exposeInMainWorld('serialport', 
{
    list: () => ipcRenderer.invoke('serialport.list')
})

contextBridge.exposeInMainWorld('settings', 
{
    hasSync: (id) => ipcRenderer.invoke('settings.hasSync', {id}),
    getSync: (id) => ipcRenderer.invoke('settings.getSync', {id}),
    setSync: (val) => ipcRenderer.invoke('settings.setSync', {val}),
    isDarkMode: () => ipcRenderer.invoke('settings.isDarkMode'),
    loadLanguage: (lang) => ipcRenderer.invoke('settings.loadLanguage', {lang}),
})

contextBridge.exposeInMainWorld('app', 
{
    close: () => ipcRenderer.invoke('app.close'),
    minimize: () => ipcRenderer.invoke('app.minimize')
})

contextBridge.exposeInMainWorld('serialport_service', {
    open: (serialport) => ipcRenderer.invoke('serialport.open', {serialport})
})