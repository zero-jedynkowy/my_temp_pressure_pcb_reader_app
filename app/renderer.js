





// //CONNECTING, DISCONNECTING AND COMMUNICATION


// //LED SWITCH
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

// document.querySelector('#connectBtn').addEventListener('click', (e) => 
// {
//     document.querySelector('#connectingPanel').addEventListener('animationend', (e) => 
//     {
//         document.querySelector('#connectingPanel').classList.add('hidden')
//         document.querySelector('#devicePanel').classList.remove('hidden')
//         document.querySelector('#devicePanel').classList.add('fadeIn')
//     }, {once: true})

//     document.querySelector('#connectingPanel').classList.add('fadeOut')
//     document.querySelector('#connectingPanel').classList.remove('fadeIn') 
// })

// document.querySelector('#disconnectBtn').addEventListener('click', () => 
// {
//     document.querySelector('#devicePanel').addEventListener('animationend', (e) => 
//     {
//         document.querySelector('#devicePanel').classList.add('hidden')
//         document.querySelector('#connectingPanel').classList.remove('hidden')
//         document.querySelector('#connectingPanel').classList.add('fadeIn')
//     }, {once: true})

//     document.querySelector('#devicePanel').classList.add('fadeOut')
//     document.querySelector('#devicePanel').classList.remove('fadeIn')
// })

// function createDevice()
// {
//     let temp = document.createElement('div')
//     temp.classList.add('device')
// }

// let connectingList = document.querySelector('#connectingPanelList div div')

// connectingList.addEventListener('click', (e) => 
// {
//     if(e.target.classList.contains('device'))
//     {
//         console.log('sss')
//     }
// })

// async function updateConnectingPanelList()
// {
//     let newList = await window.connecting.list()
//     newList = newList.map((x) => {return [x.path, x.friendlyName]})
    

//     setTimeout(() => {updateConnectingPanelList()}, 1000)
// }




// //GENERAL
// document.addEventListener("DOMContentLoaded", () => 
// {
//     initSwitchesHorizontal()
//     initSwitchesVertical()
//     initThemes()
//     initTopBar()
// });


// function createDevice(port)
// {
//     let temp = document.createElement('div')
//     temp.classList.add('device')
//     temp.classList.add('fadeIn')
//     temp.innerHTML = port
//     document.querySelector('#connectingPanelList div div').appendChild(temp)
// }

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
    // let idUI = document.createElement('div')
    
    result.innerHTML = id

    // result.appendChild(idUI)
    result.dataset.id = id
    result.classList.add('device')
    result.classList.add('fadeIn')

    return result
}

//REFRESHING THE DEVICES LIST
let connectingList = document.querySelector('#connectingPanelList div div')
let refreshingListLoopFlag = true
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

    if(refreshingListLoopFlag)
    {
        setTimeout(() => {refreshDeviceList()}, 1000)
    }
}

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

//CONNECT BUTTON
document.querySelector('#connectBtn').addEventListener('click', async (e) => 
{
    let device = document.querySelector('.device.marked')
    let status = null
    if(device == null)
    {
        return
    }
    device = device.dataset.id
    status = await window.connecting.createConnection(device)
    
    await window.connecting.write('{"cmd":1}')





    //CHANGING PANEL
    document.querySelector('#connectingPanel').addEventListener('animationend', (e) => 
    {
        document.querySelector('#connectingPanel').classList.add('hidden')
        document.querySelector('#devicePanel').classList.remove('hidden')
        document.querySelector('#devicePanel').classList.add('fadeIn')
    }, {once: true})

    document.querySelector('#connectingPanel').classList.add('fadeOut')
    document.querySelector('#connectingPanel').classList.remove('fadeIn')
})

//DISCONNECT BUTTON
document.querySelector('#disconnectBtn').addEventListener('click', () => 
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
})

//GENERAL
document.addEventListener("DOMContentLoaded", () => 
{
    initTopBar()
    initSwitchesHorizontal()
    initSwitchesVertical()
    initThemes()

    refreshDeviceList()
    
});




window.connecting.receivingData((value) => 
{
    try
    {
        //GENERAL
        let obj = JSON.parse(value)
        //TEMP VALUE
        document.querySelector('#tempHolder').innerHTML = obj.temp.toFixed(2)

        //PRESS VALUE
        document.querySelector('#pressHolder').innerHTML = obj.press.toFixed(2)

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

    }
    setTimeout(() => {window.connecting.write('{"cmd":1}')}, 200)
})