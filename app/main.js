const { ipcMain } = require('electron')
const { app, BrowserWindow } = require('electron/main')
const path = require('node:path')
const {SerialPort} = require('serialport')
const { InterByteTimeoutParser } = require('@serialport/parser-inter-byte-timeout')

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
        transparent: true,
        icon: './resources/logo.png',
        webPreferences: 
        {
            preload: path.join(__dirname, 'preload.js')
        }
    })
    currentWindow.loadFile('index.html')
    // currentWindow.openDevTools()
}

app.whenReady().then(() => 
{
    //IPC
    ipcMain.handle('app.minimize', () => 
    {
        // currentWindow.webContents.send('connecting.receivingData', 'zbyszek')
        currentWindow.minimize()
    })

    ipcMain.handle('app.close', () => 
    {
        app.quit()
    })

    ipcMain.handle('connecting.list', () => 
    {
        return SerialPort.list()
    })

    ipcMain.handle('connecting.createConnection', async (event, portName) => 
    {
        try
        {
            port = await new SerialPort({path: portName, baudRate: 115200}, (err) => {return err})
            parser = port.pipe(new InterByteTimeoutParser({ interval: 30 }))
            parser.on('data', (data) => 
            {
                currentWindow.webContents.send('connecting.receivingData', data.toString())
            })
        }
        catch(e)
        {
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

    //OTHERS
    createWindow()
    app.on('activate', () => 
    {
        if (BrowserWindow.getAllWindows().length === 0) 
        {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => 
{
    if (process.platform !== 'darwin') 
    {
        app.quit()
    }
})