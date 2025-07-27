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
            console.log(e)
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
            console.log(e.target.classList.contains('option'))
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
            console.log(e.target.classList.contains('option'))
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
    })

    document.querySelector('#darkThemeBtn').addEventListener('click', () => 
    {
        if(document.querySelector('body').classList.contains('light'))
        {
            document.querySelector('body').classList.remove('light')
        }
        document.querySelector('body').classList.add('dark')
    })

    document.querySelector('#lightThemeBtn').addEventListener('click', () => 
    {
        if(document.querySelector('body').classList.contains('dark'))
        {
            document.querySelector('body').classList.remove('dark')
        }
        document.querySelector('body').classList.add('light')
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
        if(true)
        {
            //CHANGING PANEL
            await window.connecting.write('{"cmd":1}')
            setTimeout(isItConnected, 1000)
        }
        else
        {
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
                firstConnection = false
            }

            //TEMP VALUE
            document.querySelector('#tempHolder').innerHTML = obj.temp.toFixed(2)

            //PRESS VALUE
            document.querySelector('#pressHolder').innerHTML = obj.press.toFixed(2)

            //PWM
            document.querySelector('#pwmFreqHolder').innerHTML = obj.pwmFreq
            document.querySelector('#pwmDutyHolder').innerHTML = obj.pwmDuty

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
        {}

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

//GENERAL
document.addEventListener("DOMContentLoaded", () => 
{
    initTopBar()
    initSwitchesHorizontal()
    initSwitchesVertical()
    initThemes()
    initDialogs()
    initAboutButton()
    initCommunication()
    initPwmSettings()
    initRefreshingList()

    setTimeout(() => {refreshDeviceList()}, 1000) 
});



