const { SerialPort } = require('serialport')
const { DelimiterParser } = require('@serialport/parser-delimiter')
const format = require('string-format')
const { BrowserWindow, dialog} = require('@electron/remote')

let deviceElement = `<div class="device flex-column" data-device="{}" style="display: none">
                            <p class="deviceMainTitle">{}</p>
                    </div>`

function markDevice(event)
{
    $(event.currentTarget).stop()
    if($(event.currentTarget).hasClass('marked'))
    {
        $(event.currentTarget).removeClass('marked')
        $(event.currentTarget).animate({backgroundColor: 'white'}, 250)
    }
    else
    {
        $('.marked').animate({backgroundColor: 'white'})
        $('.device').removeClass('marked')
        $(event.currentTarget).addClass('marked')
        $(event.currentTarget).animate({backgroundColor: 'rgb(155, 155, 155)'}, 250)
    }
}

async function refreshDevicesList()
{
    let currentDevices = (await SerialPort.list()).map((e) => e.path)
    let oldDevices = [...document.querySelectorAll('.device')].map((e) => e.getAttribute('data-device'))

    currentDevices.forEach(async (element) => 
    {
        if(!oldDevices.includes(element))
        {
            document.querySelector('.subDevicesList').insertAdjacentHTML( 'afterbegin', format(deviceElement, element, element));
            document.querySelector(format('.device[data-device="{}"]', element)).addEventListener('click', markDevice)
            $(format('.device[data-device="{}"]', element)).show(500, "linear")
        }
    });

    oldDevices.forEach(async (element) => 
    {
        if(!currentDevices.includes(element))
        {
            $(format('.device[data-device="{}"]', element)).hide(250, () => {document.querySelector(format('.device[data-device="{}"]', element)).remove()})
        }
    });
}

let port = null
let parser = null
let exchangeDataStatus = 0
let lastObj = null

let connectionCounter = 0
let connectionInterval = 0

function waitForConnection()
{
    connectionCounter += 1
    if(connectionCounter == 3)
    {
        arguments[0]()
        clearInterval(connectionInterval)
    }
}

function runInterval(callback)
{
    connectionInterval = setInterval(waitForConnection, 1000, callback)
}

function resetInterval()
{
    connectionCounter = 0
}

function compareNumbers(a, b, difference)
{
    let temp = Math.abs(a - b)
    console.log(temp)
    if(temp > difference)
    {
        return true
    }
    return false
}

function processReceivedData(dataObj)
{
    let measHolders = document.querySelectorAll('.measValue')
    if(lastObj != null)
    {
        if(compareNumbers(lastObj.temperature, dataObj.temperature, 0.01))
        {
            $(measHolders[0]).text(format('{} {}C', dataObj.temperature.toFixed(2), String.fromCharCode(0x00B0)))
            lastObj = dataObj
        }
        if(compareNumbers(lastObj.pressure, dataObj.pressure, 0.1))
        {
            $(measHolders[1]).text(format('{} hPa', (dataObj.pressure/100).toFixed(2)))
            lastObj = dataObj
        }
    }
    else
    {
        $(measHolders[0]).text(format('{} {}C', dataObj.temperature.toFixed(2), String.fromCharCode(0x00B0)))
        $(measHolders[1]).text(format('{} hPa', (dataObj.pressure/100).toFixed(2)))
        lastObj = dataObj
    }
}

function exchangeData(data)
{
    data = data.toString()
    let dataObj = JSON.parse(data)
    // console.log(dataObj)
    switch(exchangeDataStatus)
    {
        case 0: //FIRST RUN
        {
            if(dataObj.id == 'TempPress Sensor V1')
            {
                exchangeDataStatus = 1;
                clearInterval(connectionInterval)
                processReceivedData(dataObj)
                $('.myDialogBack').promise().done(function(){
                    $('#connectingDialog').promise().done(function(){
                        $('.chooseDeviceContent').fadeOut(500, () => 
                        {
                            $('.devicePanel').fadeIn(500, () => {hideDialog("#connectingDialog")})
                        })
                    });
                });
                port.write('{"command":"get_data"}')
            }
            break;
        }
        case 1:
        {
            processReceivedData(dataObj)
            port.write('{"command":"get_data"}')
            break;
        }
    }
}

// function processReceivedData(dataObj)
// {
//     let measHolders = document.querySelectorAll('.measValue')
//     $(measHolders[0]).text(format('{} {}C', dataObj.temperature.toFixed(2), String.fromCharCode(0x00B0)))
//     $(measHolders[1]).text(format('{} hPa', (dataObj.pressure/100).toFixed(2)))
// }

async function connect()
{
    let markedDevice = document.querySelector('.marked')
    if(markedDevice != null)
    {
        port = new SerialPort({path: markedDevice.getAttribute('data-device'), baudRate: 115200}, async (error) => {
            console.dir(error)
            if(error == null)
            {
                showDialog('#connectingDialog')
                parser = port.pipe(new DelimiterParser({ delimiter: '}', includeDelimiter: true }))
                parser.on('data', exchangeData)
                port.write('{"command":"get_data"}')
                resetInterval()
                runInterval(() => 
                {
                    port.close()
                    $('#connectingDialog').fadeOut(250, () => {$('#cannotConnectDialog').fadeIn(250)})
                })
            }
            else
            {
                showDialog("#cannotConnectDialog")
            }
        })
    }
    else
    {
        showDialog("#notMarkDeviceDialog")
    }
}

function about()
{
    showDialog('#aboutDialog')
    
}

function refreshLoop() 
{
    setTimeout(() => 
    {
        refreshDevicesList()
        refreshLoop();
    }, 1000);
}

$( document ).ready(function() 
{
    $(".closeAppBtn").on('click', () => 
    {
        $('body').fadeOut(250, () => { BrowserWindow.getFocusedWindow().close()})
    })
    $(".minimalizeAppBtn").on('click', () => BrowserWindow.getFocusedWindow().minimize())
    $('.connectButton').on('click',connect)
    $('.aboutButton').on('click',about)
    $('.closeDialog').on('click', () => {$('.myDialog').fadeOut(250, () => {$('.myDialogBack').fadeOut(250)})})
    $('body').fadeIn(250)
    
    refreshLoop()
});