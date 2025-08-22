const { ipcMain } = require('electron')
const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')
const {SerialPort} = require('serialport')
const { InterByteTimeoutParser } = require('@serialport/parser-inter-byte-timeout')
const {Chart} = require('chart.js/auto')
const fs = require('fs').promises;

let settings = null
let currentWindow = null
let port = null
let parser = null

function createWindow() 
{
    currentWindow = new BrowserWindow(
    {
        width: 700,
        height: 600,
        frame: false,
        transparent: false,
        resizable: false,
        thickFrame: false,
        titleBarStyle: 'hidden',
        backgroundColor: '#00000000',
        icon: './resources/logo.png',
        webPreferences: 
        {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegrationInWorker: true
        }
    })
    currentWindow.loadFile('index.html')
    // currentWindow.openDevTools()
    settings = require('electron-settings')
}

app.whenReady().then(() => 
{
    //IPC
    ipcMain.handle('app.minimize', () => 
    {
        currentWindow.minimize()
    })

    ipcMain.handle('app.close', () => 
    {
        if (port && port.isOpen) 
        {
            port.close();
        }
        port = null;
        mainWindow = null;
        app.quit()
    })

    ipcMain.handle('connecting.list', () => 
    {
        try
        {
            return SerialPort.list()
        }
        catch(e)
        {
            return []
        }
    })

    ipcMain.handle('connecting.createConnection', async (event, portName) => 
    {
        try
        {
            port = await new SerialPort({path: portName, baudRate: 115200}, (err) => 
            {
                if(err == null)
                {
                    currentWindow.webContents.send('connecting.isOpen', true)
                }
                else
                {
                    currentWindow.webContents.send('connecting.isOpen', false)
                }
                
            })
            parser = port.pipe(new InterByteTimeoutParser({ interval: 30 }))
            parser.on('data', (data) => 
            {
                currentWindow.webContents.send('connecting.receivingData', data.toString())
            })
            port.on('close', (e) => 
            {
                currentWindow.webContents.send('connecting.disconnectingDevice')
            })
            port.on('error', (e) => 
            {
                currentWindow.webContents.send('connecting.disconnectingDevice')
            })
        }
        catch(e)
        {
            currentWindow.webContents.send('connecting.isOpen', false)
            return false
        }
    })

    ipcMain.handle('connecting.write', (event, message) => 
    {
        try
        {
            port.write(message)
            return true
        }
        catch(e)
        {
            return false
        }
    })

    ipcMain.handle('connecting.close', () => 
    {
        try
        {
            port.close()
        }
        catch(e)
        {

        }
    })

    ipcMain.handle('settings.has', (event, name) => 
    {
        return settings.hasSync(name)
    })

    ipcMain.handle('settings.set', (event, name, value) => 
    {
        return settings.setSync(name, value)
    })
    
    ipcMain.handle('settings.get', (event, name) => 
    {
        return settings.getSync(name)
    })

    ipcMain.handle('lang.load', async (event, name) => 
    {
        const configPath = path.join(__dirname, 'resources', name + '.json');
        const data = await fs.readFile(configPath, 'utf8');
        config = JSON.parse(data);
        return config
    })

    //OTHERS
    createWindow()
    app.on('activate', () => 
    {
        if (BrowserWindow.getAllWindows().length === 0) 
        {
            createWindow()
        }
    })
    app.disableHardwareAcceleration();
})

app.on('window-all-closed', () => 
{
    if (process.platform !== 'darwin') 
    {
        app.quit()
    }
})