//OTHERS
const mySettings = 
{
    async init()
    {
        let val = await window.settings.getSync('')
        switch(val['theme'])
        {
            case 'system':
            {
                val['theme'] = 'system'
                break;
            }
            case 'dark':
            {
                val['theme'] = 'dark'
                break;
            }
            case 'light':
            {
                val['theme'] = 'light'
                break;
            }
            default:
            {
                val['theme'] = 'system'
                break;
            }
        }
        switch(val['language'])
        {
            case 'pl':
            {
                val['language'] = 'pl'
                break;
            }
            case 'eng':
            {
                val['language'] = 'eng'
                break;
            }
            default:
            {
                val['language'] = 'eng'
                break;
            }
        }
        mySwitch.switchChange('#languageSwitch', val['language'])
        mySwitch.switchChange('#themeSwitch', val['theme'])
        mySettings.applySettings(val['theme'])
        mySettings.applySettings(val['language'])
        await window.settings.setSync(val)
    },

    async updateSettings(option)
    {
        let val = await window.settings.getSync('')
        if(['pl', 'eng'].includes(option))
        {
            val['language'] = option
        }
        else if(['system', 'dark', 'light'].includes(option))
        {
            val['theme'] = option
        }
        await window.settings.setSync(val)
    },

    async applySettings(option)
    {
        switch(option)
        {
            case 'dark':
            {
                document.querySelector('html').classList.add('dark')
                break
            }
            case 'light':
            {
                document.querySelector('html').classList.remove('dark')
                break
            }
            case 'system':
            {
                if(window.settings.isDarkMode())
                {
                    document.querySelector('html').classList.add('dark')
                }
                else
                {
                    document.querySelector('html').classList.remove('dark')
                }
                break;
            }
            default:
            {
                break;
            }
        }
        let content = null
        let ui = document.querySelectorAll('[data-lang]')
        switch(option)
        {
            case 'pl':
            {
                content = await window.settings.loadLanguage('pl')
                break
            }
            case 'eng':
            {
                content = await window.settings.loadLanguage('eng')
                break
            }
            default:
            {
                break
            }
        }
        try 
        {
            ui.forEach(element => 
            {
                element.innerHTML = content[parseInt(element.dataset.lang)]
            });
        } 
        catch (error) 
        {
            
        }
    }
}

const mySwitch = 
{
    switchChange(switchId, option)
    {
        let switchUI = document.querySelector(switchId)
        let optionUI = switchUI.querySelector('[data-option="' + option +'"]')
        let switchReg = switchUI.getBoundingClientRect()
        let optionReg = optionUI.getBoundingClientRect()
        let rightOffset = switchReg.right - optionReg.right
        ////console.log(option)
        switchUI.querySelector('.switchThumb').style.right = rightOffset + 'px'
    },
    init()
    {
        document.querySelectorAll('.switch').forEach(element => 
        {
            element.addEventListener('click', (e) => 
            {
                ////console.log(element.id)
                if(e.target.classList.contains('switchOption'))
                {
                    mySwitch.switchChange("#" + element.id, e.target.dataset.option)
                    mySettings.applySettings(e.target.dataset.option)
                    mySettings.updateSettings(e.target.dataset.option)
                }
            })    
        });
    }
}

//TOP BAR BTNS
document.querySelector('#minimizeAppBtn').addEventListener('click', window.app.minimize)
document.querySelector('#closeAppBtn').addEventListener('click', window.app.close)

//SET UP ALL DIALOGS
document.querySelectorAll('.dialog').forEach(element => 
{
    element.addEventListener('click', (e) => 
    {
        if(e.target.classList.contains('closeDialogBtn'))
        {
            element.classList.toggle('open')
        }
    })
});

function showDialog(id)
{
    document.querySelector(id).classList.toggle('open')
}

//DEVICE CONNECTING
const mySerialportService = 
{
    refreshListFlag: true,
    ui:
    {
        serialportList: null,
        connectBtn: null,
    },
    init()
    {
        this.ui.serialportList = document.querySelector('#serialportList')
        this.ui.serialportList.addEventListener('click', (e) => 
        {
            if(e.target.classList.contains('serialport'))
            {
                if(e.target.classList.contains('marked'))
                {
                    e.target.classList.remove('marked')
                }
                else
                {
                    document.querySelector('.serialport.marked')?.classList.remove('marked')
                    e.target.classList.add('marked')
                }
            }
        })
    },
    createSerialportUI(name, id)
    {
        let obj = document.createElement('div')
        obj.classList.add('serialport')
        obj.classList.add('dark:text-white', 'text-black', 'bg-gray-400', 'text-[1.5rem]')
        obj.classList.add('dark:bg-gray-600', 'p-[1rem]', 'mr-[1rem]', 'overflow-x-auto', 'text-nowrap', 'flex-shrink-0', 'rounded-md')
        obj.dataset.id = id
        obj.innerText = name
        return obj
    },
    async refreshList()
    {
        //NEW
        let newList = await window.serialport.list()
        let newListId = newList.map((x) => x.pnpId.replaceAll(`\\`, '-'))

        //OLD
        let oldList = this.ui.serialportList.querySelectorAll('.serialport')   
        
        let oldListId = []

        if(oldList != null)
        {
            oldListId = Array.from(oldList).map((x) => x.dataset.id)
        }

        //IS THERE A NEW DEVICE WHICH IS NOT ON THE UI LIST?
        newListId.forEach(element => 
        {
            if(!oldListId.includes(element))
            {
                this.ui.serialportList.appendChild(this.createSerialportUI(newList[newListId.indexOf(element)].path, element))
            }
        });

        //IS THERE A DEVICE ON THE LIST WHICH IS NOT IN THE NEW LIST?
        oldListId.forEach(element => 
        {
            if(!newListId.includes(element))
            {
                document.querySelector('[data-id="' + element +'"]').remove()
            }
        });
    
        //DOES THE APP STILL NEED TO REFRESH LIST?
        if(this.refreshListFlag)
        {
            setTimeout(() => mySerialportService.refreshList(), 1000)
        }
    }
}

document.querySelector('#aboutBtn').addEventListener('click', () => {showDialog('#aboutDialog')})

document.querySelector('#connectingBtn').addEventListener('click', () => 
{
    let deviceStr = document.querySelector('.marked')
    if(deviceStr != null)
    {
        deviceStr = deviceStr.innerHTML
        showDialog('#connectingDialog')
        setTimeout(async () => 
        {
            let result = await window.serialport_service.open(deviceStr)
            if(result)
            {
                showDialog('#connectingDialog')
            }
            else
            {

            }
        }, 2000)
    }
    else
    {
        showDialog('#notChoosenDialog')
    }
})












//FINAL RUN AND SET ALL THINGS AFTER LOAD THE UI
window.onload = () => 
{
    mySwitch.init()
    mySettings.init()
    mySerialportService.init()
    setTimeout(() => mySerialportService.refreshList(), 0)
}