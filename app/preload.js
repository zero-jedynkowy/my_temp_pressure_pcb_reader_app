const {contextBridge, ipcRenderer} = require('electron')
const { DelimiterParser } = require('@serialport/parser-delimiter')
const {SerialPort} = require('serialport')


contextBridge.exposeInMainWorld('electronAPI', 
{
    closeApp: () => ipcRenderer.send('closeApp'),
    minimalizeApp: () => ipcRenderer.send('minimalizeApp'),
    devicesList: () => ipcRenderer.invoke('devicesList'),
    createPort: (path, baudRate) => {return new SerialPort({ path: path, baudRate: baudRate})}
  
    // test: () => {return require('serialport')}
})