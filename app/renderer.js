//VARIABLES
let connectingList = null
let firstConnection = true
let settingsObj = {cmd:2}
let doesItNeedChangeDeviceSettings = false
let chartWorker = new Worker('./chartWorker.js');

//TOP BAR
function initTopBar()
{
    document.querySelector('#minimizeAppBtn').addEventListener('click', () => 
    {
        window.app.minimize()
    })

    document.querySelector('#closeAppBtn').addEventListener('click', () => 
    {
        window.connecting.close()
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
        element.querySelector('.switcher').style.width = 100/element.querySelectorAll('.option').length + "%"
    });
}

//CHARTS
Chart.defaults.font.family = 'Poppins'
Chart.defaults.font.weight = 'normal'

//CHARTS OBJECTS
let tempPressChart = 
{
    ui: null,
    data: null,
    config: {},
    chart: null,
    lastUpdate: Date.now(),
    labelsStep: null,
    labelsLabels: null,
    theme: null,
}

let chartWorkerSettings = 
{
    mode: '5min',
    temp: null,
    press: null,
    chartMode: null
}

chart5MinLang = 
{
    labels: ['5 min. ago', '4 min.', '3 min.', '2 min.', '1 min.', 'Now'],
    text: 'Temperature and pressure in last 5 minutes'
}

chart1hLang = 
{
    labels: ['1 h. ago', '50 min.', '40 min.', '30 min.', '20 min.', '10 min.', 'Now'],
    text: 'Temperature and pressure in last 1 hour'
}

chart6hLang = 
{
    labels: ['6 h. ago', '4 h.', '2 h.', '3 h.', '2 h.', '1 h.', 'Now'],
    text: 'Temperature and pressure in last 6 hours'
}

chart12hLang = 
{
    labels: ['12 h. ago', '10 h.', '8 h.', '6 h.', '4 h.', '2 h.', 'Now'],
    text: 'Temperature and pressure in last 12 hours'
}

chart24hLang = 
{
    labels: ['24 h. ago', '20 h.', '16 h.', '12 h.', '8 h.', '4 h.', 'Now'],
    text: 'Temperature and pressure in last 24 hours'
}

function setChart5min()
{
    tempPressChart.labelsStep = 60
    tempPressChart.labelsLabels = chart5MinLang.labels
    chartWorkerSettings.mode = '5min'
    tempPressChart.chart.data.labels = new Array(301).fill(0)
    tempPressChart.config.options.plugins.title.text = chart5MinLang.text
}

function setChart1h()
{
    tempPressChart.labelsStep = 100
    tempPressChart.labelsLabels = chart1hLang.labels
    chartWorkerSettings.mode = '1h'
    tempPressChart.chart.data.labels = new Array(601).fill(0)
    tempPressChart.config.options.plugins.title.text = chart1hLang.text
}

function setChart6h()
{
    tempPressChart.labelsStep = 100
    tempPressChart.labelsLabels = chart6hLang.labels
    chartWorkerSettings.mode = '6h'
    tempPressChart.chart.data.labels = new Array(601).fill(0)
    tempPressChart.config.options.plugins.title.text = chart6hLang.text
}

function setChart12h()
{
    tempPressChart.labelsStep = 100
    tempPressChart.labelsLabels = chart12hLang.labels
    chartWorkerSettings.mode = '12h'
    tempPressChart.chart.data.labels = new Array(601).fill(0)
    tempPressChart.config.options.plugins.title.text = chart12hLang.text
}

function setChart24h()
{
    tempPressChart.labelsStep = 100
    tempPressChart.labelsLabels = chart24hLang.labels
    chartWorkerSettings.mode = '24h'
    tempPressChart.chart.data.labels = new Array(601).fill(0)
    tempPressChart.config.options.plugins.title.text = chart24hLang.text
}

//INITS OF THE CHARTS
function initTempChart()
{
    tempPressChart.ui = document.querySelector("#tempPressChart")
    tempPressChart.theme = document.querySelector('body')
    tempPressChart.data = 
    {
        labels: null,
        datasets: 
        [{
            label: 'Temperature [°C]',
            borderColor: '#36A2EB',
            data: null,
            borderWidth: 2,
            tension: 0.4,
            pointStyle: false,
            pointRadius: 0,
        },
        {
            label: 'Pressure [hPa]',
            borderColor: '#e04346',
            data: null,
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
                    text: 'Temperature and pressure in last 5 minutes',
                    font:
                    {
                        weight: 'normal'
                    }
                },
                decimation: 
                {
                    enabled: true,
                    algorithm: 'lttb',
                    samples: 500,
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
                            if (index % tempPressChart.labelsStep === 0) 
                            {   
                                return tempPressChart.labelsLabels[index / tempPressChart.labelsStep];
                            }
                            return null;
                        },
                        autoskip: false,
                    },
                    grid:
                    {
                        color: (ctx) => 
                        {
                            let val = tempPressChart.theme.classList.contains('light')
                            val += tempPressChart.theme.classList.contains('dark') << 1
                            
                            if(val == 0)
                            {
                                if(window.matchMedia('(prefers-color-scheme: light)').matches)
                                {
                                    val = 1;
                                }
                                else
                                {
                                    val = 2;
                                }
                            }
                            switch(val)
                            {
                                case 1:
                                    return '#808080'
                                case 2:
                                    return '#808080'
                            }
                        },
                        stepSize: 1
                    }
                },
                y: 
                {
                    grid:
                    {
                        color: (ctx) => 
                        {
                            let val = tempPressChart.theme.classList.contains('light')
                            val += tempPressChart.theme.classList.contains('dark') << 1
                            
                            if(val == 0)
                            {
                                if(window.matchMedia('(prefers-color-scheme: light)').matches)
                                {
                                    val = 1;
                                }
                                else
                                {
                                    val = 2;
                                }
                            }
                            switch(val)
                            {
                                case 1:
                                    return '#808080'
                                case 2:
                                    return '#808080'
                            }
                        },
                    },
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

    chartWorker.onmessage = (e) => 
    {
        tempPressChart.data.datasets[0].data = e.data["temp"]
        tempPressChart.data.datasets[1].data = e.data["press"];
        tempPressChart.chart.config.options.scales.y.min = e.data['min']
        tempPressChart.chart.config.options.scales.y.max =  e.data['max']
        tempPressChart.chart.update();
    };

    document.querySelector('#chartMode5min').addEventListener('click', setChart5min)
    document.querySelector('#chartMode1h').addEventListener('click', setChart1h)
    document.querySelector('#chartMode6h').addEventListener('click', setChart6h)
    document.querySelector('#chartMode12h').addEventListener('click', setChart12h)
    document.querySelector('#chartMode24h').addEventListener('click', setChart24h)
}

function updateChart(temp, press)
{
    if(Math.abs(Date.now() - tempPressChart.lastUpdate) >= 1000)
    {
        chartWorkerSettings.temp = temp
        chartWorkerSettings.press = press
        if(tempPressChart.chart.isDatasetVisible(1) && !tempPressChart.chart.isDatasetVisible(0))
        {
            chartWorkerSettings.chartMode = 'press'
        }
        else if(tempPressChart.chart.isDatasetVisible(0) && !tempPressChart.chart.isDatasetVisible(1))
        {
            chartWorkerSettings.chartMode = 'temp'
        }
        else 
        {
            // tempPressChart.chart.isDatasetVisible(0) && tempPressChart.chart.isDatasetVisible(1)
            chartWorkerSettings.chartMode = 'both'
        }
        chartWorker.postMessage(chartWorkerSettings);
        tempPressChart.lastUpdate = Date.now()
    }
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
        Chart.defaults.backgroundColor = '#00000';
        Chart.defaults.borderColor = '#00000';
        Chart.defaults.color = '#ffffff';
        window.settings.set('settings.theme', 'dark')
    })

    document.querySelector('#lightThemeBtn').addEventListener('click', () => 
    {
        if(document.querySelector('body').classList.contains('dark'))
        {
            document.querySelector('body').classList.remove('dark')
        }
        document.querySelector('body').classList.add('light')
        Chart.defaults.backgroundColor = '#ffffff';
        Chart.defaults.borderColor = '#ffffff';
        Chart.defaults.color = '#00000';
        window.settings.set('settings.theme', 'light')
    })
}

//LANG
async function loadLang(lang)
{
    result = await window.lang.load(lang)
    for(let i=0; i<result['content'].length; i++)
    {
        if(result['content'][i][0] == 0)
        {
            document.querySelector('[data-lang="' + i + '"]').innerHTML = result['content'][i][1];
        }
        if(result['content'][i][0] == 1)
        {
            switch(result['content'][i][1])
            {
                case 0:
                    chart5MinLang.text = result['content'][i][2]
                    break;
                case 1:
                    chart1hLang.text = result['content'][i][2]
                    break;
                case 2:
                    chart6hLang.text = result['content'][i][2]
                    break;
                case 3:
                    chart12hLang.text = result['content'][i][2]
                    break;
                case 4:
                    chart24hLang.text = result['content'][i][2]
                    break;
            }
        }
        if(result['content'][i][0] == 2)
        {
            switch(result['content'][i][1])
            {
                case 0:
                    tempPressChart.data.datasets[0].label = result['content'][i][2]
                    break;
                case 1:
                    tempPressChart.data.datasets[0].label = result['content'][i][2]
                    break;
            }
        }
        if(result['content'][i][0] == 3)
        {
            switch(result['content'][i][1])
            {
                case 0:
                    chart5MinLang.labels = result['content'][i][2]
                    break;
                case 1:
                    chart1hLang.labels = result['content'][i][2]
                    break;
                case 2:
                    chart6hLang.labels = result['content'][i][2]
                    break;
                case 3:
                    chart12hLang.labels = result['content'][i][2]
                    break;
                case 4:
                    chart24hLang.labels = result['content'][i][2]
                    break;
            }
        }
    }
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
                document.querySelector('#chartMode5min').click()
                if(obj.ledSwitch == 0)
                {
                    updateLedSwitch('temp')
                }
                else
                {
                    updateLedSwitch('press')
                }
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
            // console.log(e)
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
    initDialogs()
    initAboutButton()
    initCommunication()
    initPwmSettings()
    initTempSettings()
    initPressSettings()
    initRefreshingList()
    initTempChart()
    initThemes()
    initLang()
    await initSettings()

    setTimeout(() => {refreshDeviceList()}, 1000) 
});