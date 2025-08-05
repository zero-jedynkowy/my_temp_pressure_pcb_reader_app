//VARIABLES
let connectingList = null
let firstConnection = true
let settingsObj = {cmd:2}
let doesItNeedChangeDeviceSettings = false

//TOP BAR
function initTopBar()
{
    document.querySelector('#minimizeAppBtn').addEventListener('click', () => 
    {
        window.app.minimize()
    })

    document.querySelector('#closeAppBtn').addEventListener('click', () => 
    {
        window.app.close()
    })
}

//DIALOG
function openDialog(id)
{
    let temp = document.querySelector(id)
    temp.classList.remove('hidden')
    temp.classList.add('fadeIn')
}

function closeDialog(id)
{
    let temp = document.querySelector(id)
    temp.classList.add('fadeOut')
    temp.classList.remove('fadeIn')
}

function initDialogs()
{
    document.querySelectorAll('.dialog').forEach(element => 
    {
        element.addEventListener('animationend', (e) =>
        {
            if(e.animationName == 'dialogContentFadeOutAnimation')
            {
                e.target.parentElement.classList.add('hidden')
            }
        })
    });

    document.querySelectorAll('.dialog').forEach(element => 
    {
        element.addEventListener('click', (e) =>
        {
            if(e.target.classList.contains('dialogTopBarClose'))
            {
                closeDialog("#" + e.target.parentElement.parentElement.parentElement.id)
            }
        })
    });
}

//VERTICAL SWITCHES
function initSwitchesVertical()
{
    let verSwitches = document.querySelectorAll('.switchVertical')
    verSwitches.forEach(element => 
    {
        element.addEventListener('click', (e) => 
        {
            if(e.target.classList.contains('option'))
            {
                let topElement = e.target.getBoundingClientRect().top;
                let topParent = element.getBoundingClientRect().top
                let top = topElement - topParent
                e.currentTarget.querySelector('.switcher').style.top = top + "px"
            }
        })
    });
}

//HORIZONTAL SWITCHES
function initSwitchesHorizontal()
{
    let horSwitches = document.querySelectorAll('.switchHorizontal')
    horSwitches.forEach(element => 
    {
        element.addEventListener('click', (e) => 
        {
            if(e.target.classList.contains('option'))
            {
                let leftElement = e.target.getBoundingClientRect().left;
                let leftParent = element.getBoundingClientRect().left
                let left = leftElement - leftParent
                e.currentTarget.querySelector('.switcher').style.left = left + "px"
            }
        })
    });
}

//THEME
function initThemes()
{
    document.querySelector('#systemThemeBtn').addEventListener('click', () => 
    {
        if(document.querySelector('body').classList.contains('light'))
        {
            document.querySelector('body').classList.remove('light')
        }
        if(document.querySelector('body').classList.contains('dark'))
        {
            document.querySelector('body').classList.remove('dark')
        }
        window.settings.set('settings.theme', 'system')
    })

    document.querySelector('#darkThemeBtn').addEventListener('click', () => 
    {
        if(document.querySelector('body').classList.contains('light'))
        {
            document.querySelector('body').classList.remove('light')
        }
        document.querySelector('body').classList.add('dark')
        window.settings.set('settings.theme', 'dark')
    })

    document.querySelector('#lightThemeBtn').addEventListener('click', () => 
    {
        if(document.querySelector('body').classList.contains('dark'))
        {
            document.querySelector('body').classList.remove('dark')
        }
        document.querySelector('body').classList.add('light')
        window.settings.set('settings.theme', 'light')
    })
}

//LANG
function loadLang(lang)
{
    filePath = lang + ".json"
}

function initLang()
{
    document.querySelector("#engLangBtn").addEventListener('click', (e) => 
    {
        window.settings.set('settings.language', 'eng')
        loadLang('eng')
    })

    document.querySelector("#plLangBtn").addEventListener('click', (e) => 
    {
        window.settings.set('settings.language', 'pl')
        loadLang('pl')
    })
}

//CONNECTING, DISCONNECTING AND COMMUNICATION MANAGEMENT

//CREATION OF A DEVICE FOR THE DEVICES LIST
function createDevice(id)
{
    let result = document.createElement('div')
    result.innerHTML = id
    result.dataset.id = id
    result.classList.add('device')
    result.classList.add('fadeIn')
    return result
}

//REFRESHING THE DEVICES LIST
function initRefreshingList()
{
    connectingList = document.querySelector('#connectingPanelList div div')

    //PERMANENT DELETE THE DEVICE FROM THE LIST
    connectingList.addEventListener('animationend', (e) => 
    {
        if(e.animationName == 'deviceFadeOutAnimation' 
        && e.target.classList.contains('device'))
        {
            e.target.remove()
        }
    })

    //MARKING THE DEVICE ON THE LIST
    connectingList.addEventListener('click', (e) => 
    {
        if(e.target.classList.contains('device'))
        {
            if(e.target.classList.contains('marked'))
            {
                e.target.classList.remove('marked')
            }
            else
            {
                let isThisExist = connectingList.querySelector('.device.marked')
                
                if(isThisExist != null)
                {
                    isThisExist.classList.remove('marked')
                    e.target.classList.add('marked')
                }
                else
                {
                    e.target.classList.add('marked')
                }
            }
        }
    })
}

//REFRESHING THE DEVICES LIST UPDATER LOOP
async function refreshDeviceList()
{
    let newList = await window.connecting.list()
    newList = newList.map((x) => x.path)
    
    let oldList = Array.from(document.querySelectorAll('.device'))
    oldList = oldList.map((x) => x.dataset.id)

    let toAdd = newList.filter((x) => !oldList.includes(x))
    let toRemove = oldList.filter((x) => !newList.includes(x))

    toAdd.forEach(element => 
    {
        connectingList.appendChild(createDevice(element))
    });

    toRemove.forEach(element => 
    {
       document.querySelector(`.device[data-id="${element}"]`).classList.add('fadeOut')
    });

    setTimeout(() => {refreshDeviceList()}, 1)
}

//ABOUT THE PROGRAMME BUTTON
function initAboutButton()
{
    document.querySelector('#aboutBtn').addEventListener('click', () => 
    {
        openDialog('#aboutDialog')
    })
}

//INIT PWM RANGE SLIDERS
function initPwmSettings()
{
    document.querySelector('#pwmFreqRange').addEventListener('input', (e) => 
    {
        settingsObj.pwmFreq = Number.parseInt(e.target.value)
        doesItNeedChangeDeviceSettings = true
    })

    document.querySelector('#pwmDutyRange').addEventListener('input', (e) => 
    {
        settingsObj.pwmDuty = Number.parseInt(e.target.value)
        doesItNeedChangeDeviceSettings = true
    })
}

//INIT TEMP RANGE SLIDERS
function initTempSettings()
{
    document.querySelector('#tempMinRange').addEventListener('input', (e) => 
    {
        settingsObj.tempMin = Number.parseFloat(e.target.value)
        doesItNeedChangeDeviceSettings = true
    })

    document.querySelector('#tempStepRange').addEventListener('input', (e) => 
    {
        settingsObj.tempStep = Number.parseFloat(e.target.value)
        doesItNeedChangeDeviceSettings = true
    })
}

//INIT PRESS RANGE SLIDERS
function initPressSettings()
{
    document.querySelector('#pressMinRange').addEventListener('input', (e) => 
    {
        settingsObj.pressMin = Number.parseFloat(e.target.value)
        doesItNeedChangeDeviceSettings = true
    })

    document.querySelector('#pressStepRange').addEventListener('input', (e) => 
    {
        settingsObj.pressStep = Number.parseFloat(e.target.value)
        doesItNeedChangeDeviceSettings = true
    })
}

//LED SWITCH
function updateLedSwitch(state)
{
    let leftElement = null
    let leftParent = document.querySelector('#ledSwitchContent').getBoundingClientRect().left

    if(state == 'temp')
    {
        leftElement = document.querySelector('#tempLedSwitch').getBoundingClientRect().left
    }
    else if(state == 'press')
    {
        leftElement = document.querySelector('#pressLedSwitch').getBoundingClientRect().left
    }
    let left = leftElement - leftParent
    document.querySelector('#ledSwitchContent').querySelector('.ledSwitchThumb').style.left = left + "px"
}

//CHECKING IS THE DEVICE CONNECTED
function isItConnected()
{
    closeDialog('#connectingDialog')
    if(!firstConnection)
    {
        openDialog('#connectedDialog')
        setTimeout(() => {closeDialog('#connectedDialog')}, 1000)
        document.querySelector('#connectingPanel').addEventListener('animationend', (e) => 
        {
            document.querySelector('#connectingPanel').classList.add('hidden')
            document.querySelector('#devicePanel').classList.remove('hidden')
            document.querySelector('#devicePanel').classList.add('fadeIn')
        }, {once: true})
        document.querySelector('#connectingPanel').classList.add('fadeOut')
        document.querySelector('#connectingPanel').classList.remove('fadeIn')
    }
    else
    {
        openDialog('#cantConnectDialog')
    }
}

//CHARTS
Chart.defaults.font.family = 'Poppins'
const range = (start, end) => [...Array(end - start + 1)].map((_, i) => start + i);
const rangeDown = (start, end) => Array.from({ length: start - end + 1 }, (_, i) => start - i);

//CHARTS OBJECTS
let tempPressChart = 
{
    ui: null,
    data: null,
    config: {},
    chart: null,
    lastUpdate: Date.now(),
    currentIndex: 0,
    maxIndex: 300-1,
    minVal: [0, 0],
    maxVal: [0, 0],
    realMinVal: 0,
    realMaxVal: 0
}

//INITS OF THE CHARTS
function initTempChart()
{
    tempPressChart.ui = document.querySelector("#tempPressChart")

    tempPressChart.data = 
    {
        labels: rangeDown(tempPressChart.maxIndex+1, 0),
        datasets: 
        [{
            label: 'Temperature [°C]',
            borderColor: '#36A2EB',
            data: new Array(tempPressChart.maxIndex + 1).fill(0),
            borderWidth: 2,
            tension: 0.4,
            pointStyle: false,
            pointRadius: 0,
        },
        {
            label: 'Pressure [hPa]',
            borderColor: '#e04346',
            data: new Array(tempPressChart.maxIndex + 1).fill(0),
            borderWidth: 2,
            tension: 0.4,
            pointStyle: false,
            pointRadius: 0,
        }]
    }

    tempPressChart.config = 
    {
        type: 'line',
        data: tempPressChart.data,
        options: 
        {
            responsiveAnimationDuration: 0,
            datasets:
            {
                line:
                {
                    pointRadius: 0
                }
            },
            elements:
            {
                point:
                {
                    radius: 0
                }
            },
            responsive: true,
            animation: false,
            plugins: 
            {
                title: 
                {
                    display: true,
                    text: 'Temperature and pressure in last 5 minutes'
                },
                decimation: 
                {
                    enabled: true,
                    algorithm: 'lttb', // Lepszy do gładkich krzywych
                    samples: 500,     // Maksymalna liczba punktów po redukcji
                }
            },
            interaction: 
            {
                intersect: false,
            },
            scales: 
            {
                x: 
                {
                    display: true,
                    title: 
                    {
                        display: true
                    },
                    ticks: 
                    {
                        callback: function(val, index) 
                        {
                            const showEvery = 60; 
                            if (index % showEvery === 0) 
                            { 
                                switch(index / showEvery)
                                {
                                    case 5:
                                        return 'Now';
                                    case 4:
                                        return '1 min';
                                    case 3:
                                        return '2 min';
                                    case 2:
                                        return '3 min';
                                    case 1:
                                        return '4 min';
                                    case 0:
                                        return '5 minutes ago';
                                }
                                // return this.getLabelForValue(val);
                            }
                            return null;
                        },
                        autoskip: false,
                    },
                    grid:
                    {
                        stepSize: 1
                    }
                },
                y: 
                {
                    display: true,
                    title: 
                    {
                        display: true,
                        text: '' //Temperature [°C] and pressure [hPa]
                    },
                    suggestedMin: 20,
                    suggestedMax: 40
                }
            }
        },
    }
        
    tempPressChart.chart = new Chart(tempPressChart.ui, tempPressChart.config)
}


function updateChart(temp, press)
{
    if(Math.abs(Date.now() - tempPressChart.lastUpdate) >= 1000)
    {
        tempPressChart.lastUpdate = Date.now()

        //TEMP
        tempPressChart.data.datasets[0].data.push(temp)
        tempPressChart.data.datasets[0].data.shift()
        tempPressChart.data.datasets[1].data.push(press)
        tempPressChart.data.datasets[1].data.shift()

        tempPressChart.minVal[0] = Math.min(...tempPressChart.data.datasets[0].data)
        tempPressChart.maxVal[0] = Math.max(...tempPressChart.data.datasets[0].data)
        tempPressChart.minVal[1] = Math.min(...tempPressChart.data.datasets[1].data)
        tempPressChart.maxVal[1] = Math.max(...tempPressChart.data.datasets[1].data)

        if(tempPressChart.chart.isDatasetVisible(0) && !tempPressChart.chart.isDatasetVisible(1))
        {
            tempPressChart.realMinVal = tempPressChart.minVal[0]
            tempPressChart.realMaxVal = tempPressChart.maxVal[0]
            console.log('only press')
        }
        if(tempPressChart.chart.isDatasetVisible(1) && !tempPressChart.chart.isDatasetVisible(0))
        {
            tempPressChart.realMinVal = tempPressChart.minVal[1]
            tempPressChart.realMaxVal = tempPressChart.maxVal[1]
            console.log('only temp')
        }
        if(tempPressChart.chart.isDatasetVisible(0) && tempPressChart.chart.isDatasetVisible(1))
        {
            tempPressChart.realMinVal = Math.min(tempPressChart.minVal[0], tempPressChart.minVal[1])
            tempPressChart.realMaxVal = Math.max(tempPressChart.maxVal[0], tempPressChart.maxVal[1])
            console.log('both')
        }
        
        tempPressChart.chart.config.options.scales.y.min = tempPressChart.realMinVal - tempPressChart.realMinVal * 0.2
        tempPressChart.chart.config.options.scales.y.max =  tempPressChart.realMaxVal + tempPressChart.realMaxVal * 0.2
        tempPressChart.chart.update();
    }
}

//INIT THE COMMUNICATION
function initCommunication()
{
    //CONNECT BUTTON
    document.querySelector('#connectBtn').addEventListener('click', () => 
    {
        let device = document.querySelector('.device.marked')
        let status = null
        if(device == null)
        {
            openDialog("#notChoosenDeviceDialog")
            return
        }
        openDialog("#connectingDialog")
        setTimeout(async () => 
        {
            firstConnection = true
            device = device.dataset.id
            window.connecting.createConnection(device)
        }, 2000)
    })

    //DISCONNECT BUTTON
    document.querySelector('#disconnectBtn').addEventListener('click', () => 
    {
        window.connecting.close()
    })

    //IS PORT OPEN
    window.connecting.isOpen(async (value) => 
    {
        if(value)
        {
            //CHANGING PANEL
            await window.connecting.write('{"cmd":1}')
            setTimeout(isItConnected, 1000)
        }
        else
        {
            closeDialog('#connectingDialog')
            openDialog('#cantConnectDialog')
        }
    })

    //PROCESS RECEIVED DATA
    window.connecting.receivingData((value) => 
    {
        try
        {
            let obj = JSON.parse(value)
            if(firstConnection)
            {
                document.querySelector('#pwmFreqRange').value = obj.pwmFreq
                document.querySelector('#pwmDutyRange').value = obj.pwmDuty
                document.querySelector("#tempMinRange").value = obj.tempMin.toFixed(2)
                document.querySelector('#tempStepHolder').value = obj.tempStep.toFixed(2)
                document.querySelector("#pressMinRange").value = obj.pressMin.toFixed(2)
                document.querySelector('#pressStepRange').value = obj.pressStep.toFixed(2)
                firstConnection = false
            }

            //TEMP VALUE
            document.querySelector('#tempHolder').innerHTML = obj.temp.toFixed(2)

            //PRESS VALUE
            document.querySelector('#pressHolder').innerHTML = obj.press.toFixed(2)

            //PWM
            document.querySelector('#pwmFreqHolder').innerHTML = obj.pwmFreq
            document.querySelector('#pwmDutyHolder').innerHTML = obj.pwmDuty

            //TEMP SETTINGS
            document.querySelector('#tempMinHolder').innerHTML = obj.tempMin
            document.querySelector('#tempStepHolder').innerHTML = obj.tempStep

            //PRESS SETTINGS
            document.querySelector('#pressMinHolder').innerHTML = obj.pressMin
            document.querySelector('#pressStepHolder').innerHTML = obj.pressStep

            //UPDATE CHARTS
            updateChart(parseFloat(obj.temp.toFixed(2)), parseFloat(obj.press.toFixed(2)))

            //LED SWITCH
            if(obj.ledSwitch == 0)
            {
                updateLedSwitch('temp')
            }
            else
            {
                updateLedSwitch('press')
            }
        }
        catch(e)
        {
            console.log(e)
        }

        //SET DATA TO SEND
        message = null
        if(doesItNeedChangeDeviceSettings)
        {
            settingsObj.cmd = 2
            message = JSON.stringify(settingsObj)
            doesItNeedChangeDeviceSettings = false
            settingsObj = {}
        }
        else
        {
            message = '{"cmd":1}'
        }
        setTimeout(() => {window.connecting.write(message)}, 1)
    })

    //IT HAPPENS WHEN THE DEVICE IS DISCONNECTED
    window.connecting.disconnectingDevice(() => 
    {
        openDialog('#disconnectedDialog')
        disconnectingAndChangingPanels()
    })
}

//DISCONNECTING CHANGING PANELS
function disconnectingAndChangingPanels()
{
    //CHANGING PANEL
    document.querySelector('#devicePanel').addEventListener('animationend', (e) => 
    {
        document.querySelector('#devicePanel').classList.add('hidden')
        document.querySelector('#connectingPanel').classList.remove('hidden')
        document.querySelector('#connectingPanel').classList.add('fadeIn')
    }, {once: true})

    document.querySelector('#devicePanel').classList.add('fadeOut')
    document.querySelector('#devicePanel').classList.remove('fadeIn')
}

//SETTINGS
async function initSettings()
{
    let language, theme, isItExist;

    //CHECK SETTINGS
    isItExist = await window.settings.has('settings.language')
    if(isItExist)
    {
        language = await window.settings.get('settings.language')
    }
    else
    {
        await window.settings.set('settings.language', 'eng')
    }

    isItExist = await window.settings.has('settings.theme')
    if(isItExist)
    {
        theme = await window.settings.get('settings.theme')
    }
    else
    {
        await window.settings.set('settings.theme', 'system')
    }

    //APPLY SETTINGS
    switch(theme)
    {
        case 'system':
            document.querySelector('#systemThemeBtn').click()
            break;
        case 'dark':
            document.querySelector('#darkThemeBtn').click()
            break;
        case 'light':
            document.querySelector('#lightThemeBtn').click()
            break;
        default:
            document.querySelector("#systemThemeBtn").click()
            break;
    }
    switch(language)
    {
        case 'eng':
            document.querySelector("#engLangBtn").click()
            break;
        case 'pl':
            document.querySelector("#plLangBtn").click()
            break;
        default:
            document.querySelector("#engLangBtn").click()
            break;
    }
}

//GENERAL
document.addEventListener("DOMContentLoaded", async () => 
{
    initTopBar()
    initSwitchesHorizontal()
    initSwitchesVertical()
    initThemes()
    initLang()
    initDialogs()
    await initSettings()
    initAboutButton()
    initCommunication()
    initPwmSettings()
    initTempSettings()
    initPressSettings()
    initRefreshingList()
    initTempChart()
    // initPressChart()
    

    setTimeout(() => {refreshDeviceList()}, 1000) 
});