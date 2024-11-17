const { SerialPort } = require('serialport')
const { DelimiterParser } = require('@serialport/parser-delimiter')
const format = require('string-format')
const { BrowserWindow} = require('@electron/remote')
const settings = BrowserWindow.getFocusedWindow().settings
const fs = require('fs');
const path = require('path');

// EXCHANGED DATA BETWEEN PC AND DEVICE
// {
//     id: 0,
//     temp: 0,
//     press: 0
//     temp_min: 0,
//     temp_step: 0,
//     press_min: 0,
//     press_step: 0,
//     prescaler: 0,
//     counterPeriod: 0,
//     ccr: 0
// }

let deviceElement = `
    <div class="device" data-device="{}">
        <div class="deviceTitle">{}</div>
        <div class="d-none deviceSubtitle">Producent: {}</div>
    </div>
`

async function loadSettings()
{
    let temp = null
    temp = await settings.get('theme')
    if(temp == undefined)
    {
        temp = 'system'
    }
    changeSettings({target:document.querySelector('.themeBtn.'+temp)})

    temp = await settings.get('language')
    if(temp == undefined)
    {
        temp = 'eng'
    }
    changeSettings({target:document.querySelector('.langBtn.'+temp)})
}

function changeSettings(source)
{
    let temp = Array.from(source.target.classList)
    if(temp.includes('themeBtn'))
    {
        if(!temp.includes('rightMenuBtnMarked'))
        {
            if(temp.includes('system'))
            {
                BrowserWindow.getFocusedWindow().nativeTheme.themeSource = 'system'
                settings.set("theme", "system");
            }
            else if(temp.includes('light'))
            {
                BrowserWindow.getFocusedWindow().nativeTheme.themeSource = 'light'
                settings.set("theme", "light");
            }
            else
            {
                BrowserWindow.getFocusedWindow().nativeTheme.themeSource = 'dark'
                settings.set("theme", "dark");
            }
            try
            {
                document.querySelector('.themeBtn.rightMenuBtnMarked').classList.remove('rightMenuBtnMarked')
            }
            catch(error){}
            source.target.classList.add('rightMenuBtnMarked')
        }
    }
    else
    {
        if(!temp.includes('rightMenuBtnMarked'))
        {
            let x = null
            if(temp.includes('pl'))
            {
                settings.set("language", "pl");
                x = 'pl'
            }
            else
            {
                settings.set("language", "eng");
                x = 'eng'
            }
            const jsonFilePath = path.join(__dirname, 'language.json');
            fs.readFile(jsonFilePath, 'utf8', (err, data) => 
            {
                data = JSON.parse(data)
                data = data[x]
                x = document.querySelectorAll('.lang')
                for(let i=0; i<x.length; i++)
                {
                    x[i].innerHTML = data[i]
                }
            });
            try
            {
                document.querySelector('.langBtn.rightMenuBtnMarked').classList.remove('rightMenuBtnMarked')
            }
            catch(error){}
            source.target.classList.add('rightMenuBtnMarked')
        }
    }
}

function aboutProgram()
{
    $('.dialogBackground').fadeIn(250, () => 
    {
        $('.aboutProgramDialog').fadeIn(250)
    })
}

function setCloseAllDialogs()
{
    $('.dialogCloseButton').on('click', () => 
    {
        $('.dialog').fadeOut(250, () => 
        {
            $('.dialogBackground').fadeOut(250)
        })
    })
}

function closeApp()
{
    $('body').fadeOut(250, () => 
    {
        BrowserWindow.getFocusedWindow().close()
    })
}

function minimalizeApp()
{
    BrowserWindow.getFocusedWindow().minimize()
}

let deviceManager = 
{
    port: null,
    parser: null,
    exchangeDataStatus: 0,
    lastReceivedData: null,
    tempNewSettings: {}
}

function calcDuty(ccr, counterPeriod)
{
    return (ccr/counterPeriod)*100
}

function calcFreq(counterPeriod, prescaler)
{
    return (42000000)/(counterPeriod*prescaler)
}

function calcPrescaler(freq)
{
    return (42000000)/(freq*1000)
}

function updateUI()
{    
    document.querySelector('.deviceID').innerHTML = format('{}', deviceManager.lastReceivedData.id)
    document.querySelector('.tempValue').innerHTML = format('{} {}C', deviceManager.lastReceivedData.temperature.toFixed(2), String.fromCharCode(0x00B0))
    document.querySelector('.pressValue').innerHTML = format('{} hPa', (deviceManager.lastReceivedData.pressure/100).toFixed(2))
    document.querySelector('.freqHolder').innerHTML = format('{} Hz', Math.floor(calcFreq(deviceManager.lastReceivedData.counterPeriod, deviceManager.lastReceivedData.prescaler)))
    document.querySelector('.dutyHolder').innerHTML = format('{} %', Math.floor(calcDuty(deviceManager.lastReceivedData.ccr, deviceManager.lastReceivedData.counterPeriod)))
    document.querySelector('.tempMinHolder').innerHTML = format('{} {}C', deviceManager.lastReceivedData.temp_min, String.fromCharCode(0x00B0))
    document.querySelector('.tempStepHolder').innerHTML = format('{} {}C', deviceManager.lastReceivedData.temp_step, String.fromCharCode(0x00B0))
    document.querySelector('.pressMinHolder').innerHTML = format('{} hPa', deviceManager.lastReceivedData.press_min/100)
    document.querySelector('.pressStepHolder').innerHTML = format('{} hPa', deviceManager.lastReceivedData.press_step/100)
}

function updateUISliders()
{
    document.querySelector('.pwmFreqSlider').value = Math.floor(calcFreq(deviceManager.lastReceivedData.counterPeriod, deviceManager.lastReceivedData.prescaler))
    document.querySelector('.pwmDutySlider').value = Math.floor(calcDuty(deviceManager.lastReceivedData.ccr, deviceManager.lastReceivedData.counterPeriod))
    document.querySelector('.minTempSlider').value = deviceManager.lastReceivedData.temp_min
    document.querySelector('.stepTempSlider').value = deviceManager.lastReceivedData.temp_step
    document.querySelector('.minPressSlider').value = deviceManager.lastReceivedData.press_min/100
    document.querySelector('.stepPressSlider').value = deviceManager.lastReceivedData.press_step/100
}

function exchangeData(data)
{
    data = JSON.parse(data.toString())
    switch(deviceManager.exchangeDataStatus)
    {
        case 0: //FIRST COMMUNCATION
        {
            if(data.id == 'TempPress Sensor')
            {
                clearInterval(myInterval)
                deviceManager.exchangeDataStatus = 1
                deviceManager.lastReceivedData = data
   
                updateUI()
                updateUISliders()
                $('.connectingDialog').fadeOut(250).promise().done(() => 
                {
                    $('.dialogBackground').fadeOut(250).promise().done(() => 
                    {
                        $('.devicesList').fadeOut(250).promise().done(() => {
                            $('.devicePanel').fadeIn(500)
                            myIntervalIntervalFun = disconnect
                            myInterval = setInterval(countdownForDisconecting, 100)
                        })
                    })
                })
            }
            else disconnect()
        }
        case 1: //ONGOING COMMUNICATION
        {
            myIntervalCounter = 0
            Object.entries(deviceManager.tempNewSettings).forEach(element => 
            {
                if(deviceManager.tempNewSettings[element[0]] == deviceManager.lastReceivedData[element[0]])
                {
                    delete deviceManager.tempNewSettings[element[0]]
                }
            });
            deviceManager.lastReceivedData = data
            deviceManager.port.write(JSON.stringify(deviceManager.tempNewSettings))
            updateUI()
        }
    }
}


let myInterval = null
let myIntervalCounter = 0
let myIntervalIntervalFun = null


function countdownForDisconecting()
{
    myIntervalCounter++;
    if(myIntervalCounter >= 5)
    {
        myIntervalCounter = 0
        clearInterval(myInterval)
        myIntervalIntervalFun()
    }
}

function connect()
{
    let markedDevice = document.querySelector('.markedDevice')
    myIntervalCounter = 0
    if(markedDevice != null)
    {
        deviceManager.port = new SerialPort({path: markedDevice.getAttribute('data-device'), baudRate: 115200}, async (error) => 
        {
            if(error == null)
            {
                $('.dialogBackground').fadeIn(250, () => 
                {
                    $('.connectingDialog').fadeIn(250).promise().done(() => 
                    {
                        deviceManager.parser = deviceManager.port.pipe(new DelimiterParser({ delimiter: '}', includeDelimiter: true }))
                        deviceManager.parser.on('data', exchangeData)
                        deviceManager.port.write('{}')
                        myIntervalIntervalFun = () => {$('.connectingDialog').fadeOut(250, () => {$('.cannotConnectDialog').fadeIn(250)})}
                        myInterval = setInterval(countdownForDisconecting, 1000)
                    })
                })
                
                
                // resetInterval()
                // runInterval(() => 
                // {
                //     deviceManager.port.close()
                //     $('.connectingDialog').fadeOut(250, () => 
                //     {
                //         $('.dialogBackground').fadeOut(250)
                //     })
                //     // $('#connectingDialog').fadeOut(250, () => {$('#cannotConnectDialog').fadeIn(250)})
                // })
            }
            else
            {
                $('.dialogBackground').fadeIn(250, () => 
                {
                    $('.cannotConnectDialog').fadeIn(250)
                })
            }
        })
    }
    else
    {
        $('.dialogBackground').fadeIn(250, () => 
        {
            $('.notChoosenDeviceDialog').fadeIn(250)
        })
    }
}

function disconnect()
{
    clearInterval(myInterval)
    myIntervalCounter = 0
    deviceManager.port.close()
    deviceManager.port = null
    deviceManager.exchangeDataStatus = 0
    $('.devicePanel').fadeOut(250, () => 
    {
        $('.devicesList').fadeIn(250, () => 
        {
            $('.dialogBackground').fadeIn(250, () => 
            {
                $('.disconnectDialog').fadeIn(250)
            })
        })
    })
}

function markDevice(event)
{
    $(event.currentTarget).stop()
    if($(event.currentTarget).hasClass('markedDevice'))
    {
        $(event.currentTarget).removeClass('markedDevice')
        // $(event.currentTarget).animate({backgroundColor: 'white'}, 250)
    }
    else
    {
        $('.markedDevice').animate({backgroundColor: 'white'})
        $('.device').removeClass('markedDevice')
        $(event.currentTarget).addClass('markedDevice')
        // $(event.currentTarget).animate({backgroundColor: 'rgb(155, 155, 155)'}, 250)
    }
}

async function refreshDevicesList()
{
    let currentDevices = (await SerialPort.list()).map((e) => 
    {
        // IN COMMENTS THERE IS A FILTERING THE DEVICES
        // let temp = 'None'
        // if(e.manufacturer != null) temp = e.manufacturer   
        // return [e.path, temp]
        return [e.path, '']
    })

    currentDevices = currentDevices.filter((e) => {if(e[1] != 'None') return e})
    let oldDevices = [...document.querySelectorAll('.device')].map((e) => e.getAttribute('data-device'))

    currentDevices.forEach(async (element) => 
    {
        if(!oldDevices.includes(element[0]))
        {
            document.querySelector('.devicesListContent').insertAdjacentHTML('afterbegin', format(deviceElement, element[0], element[0], element[1]));
            document.querySelector(format('.device[data-device="{}"]', element[0])).addEventListener('click', markDevice)
            $(format('.device[data-device="{}"]', element[0])).fadeIn(500)
        }
    });

    oldDevices.forEach(async (element) => 
    {
        let temp = [...currentDevices].map((e) => e[0])
        if(!temp.includes(element))
        {
            $(format('.device[data-device="{}"]', element)).fadeOut(500, () => {document.querySelector(format('.device[data-device="{}"]', element)).remove()})
        }
    });

    if(document.querySelector('.devicesListContent').scrollHeight != document.querySelector('.devicesListContent').offsetHeight)
    {
        document.querySelectorAll('.device')[currentDevices.length - 1].style.borderBottom = 0
    }
}

function refreshLoop() 
{
    setTimeout(() => 
    {
        refreshDevicesList()
        refreshLoop();
    }, 1000);
}

function changePWMduty(event)
{
    let temp = parseInt(event.currentTarget.value)
    deviceManager.tempNewSettings.ccr = temp*10
}

function changePWMfrequency(event)
{
    let temp = parseInt(event.currentTarget.value)
    deviceManager.tempNewSettings.prescaler = Math.floor(calcPrescaler(temp))
}

function changeTempMin(event)
{   
    let temp = parseInt(event.currentTarget.value)
    deviceManager.tempNewSettings.temp_min = temp
}

function changeTempStep(event)
{
    let temp = parseInt(event.currentTarget.value)
    deviceManager.tempNewSettings.temp_step = temp
}

function changePressMin(event)
{   
    let temp = parseInt(event.currentTarget.value)
    deviceManager.tempNewSettings.press_min = temp*100
}

function changePressStep(event)
{
    let temp = parseInt(event.currentTarget.value)
    deviceManager.tempNewSettings.press_step = temp*100
}

// MAIN SECTION
$(document).ready(function() 
{
    $('.aboutButton').on('click', aboutProgram)
    $('.topBarMinimalizeAppButton').on('click', minimalizeApp)
    $('.topBarCloseAppButton').on('click', closeApp)
    $('.connectButton').on('click', connect)
    $('.disconnectButton').on('click', disconnect)
    $('.pwmFreqSlider').on('input', changePWMfrequency)
    // $('.pwmFreqButton').on('click', changePWMfrequency)
    $('.pwmDutySlider').on('input', changePWMduty)
    // $('.pwmDutyButton').on('click', changePWMduty)
    $('.minTempSlider').on('input', changeTempMin)
    $('.stepTempSlider').on('input', changeTempStep)
    $('.minPressSlider').on('input', changePressMin)
    $('.stepPressSlider').on('input', changePressStep)
    
    $('.langBtn').on('click', changeSettings)
    $('.themeBtn').on('click', changeSettings)

    loadSettings();
    
    setCloseAllDialogs()
    $('body').fadeIn(1000)
    refreshLoop()
});