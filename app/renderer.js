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
        console.log(option)
        switchUI.querySelector('.switchThumb').style.right = rightOffset + 'px'
    },
    init()
    {
        document.querySelectorAll('.switch').forEach(element => 
        {
            element.addEventListener('click', (e) => 
            {
                console.log(element.id)
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






window.onload = () => 
{
    mySwitch.init()
    mySettings.init()
}























// let x = document.querySelectorAll('.switch')

// x.forEach(element => 
// {
//     element.addEventListener('click', (e) => 
//     {
//         console.log(e.target.classList.contains('switchOption'))
//         if(e.target.classList.contains('switchOption'))
//         {
//             const parentRect = e.target.parentElement.getBoundingClientRect();
//             const elementRect = e.target.getBoundingClientRect();
//             const rightOffset = parentRect.right - elementRect.right;           
//             console.log(rightOffset, parentRect, elementRect)




//             // console.log(window.getComputedStyle(e.target).right)
//             element.querySelector('.switchThumb').style.right = rightOffset + 'px'
//         }
//     })    
// });



// function serialportElement(path, pnpId)
// {
//     let temp = document.createElement('div')
//     temp.classList.add('serialport', 'dark:text-white', 'text-black', 'bg-gray-400', 'text-[1.5rem]')
//     temp.classList.add('dark:bg-gray-600', 'p-[1rem]', 'mr-[1rem]', 'overflow-x-auto', 'text-nowrap', 'flex-shrink-0', 'rounded-md')
//     temp.innerHTML = path
//     temp.dataset.id = pnpId
//     return temp
// }


// let serialportList = document.querySelector('#serialportList')

// async function refresh()
// {
//     let newList = await window.serialport.list()
//     let oldList = serialportList.querySelector('serialport').map((x) => x.dataset.id)
//     console.log(oldList)

//     temp.forEach(element => 
//     {
//         serialportList.appendChild(serialportElement(element.path, element.pnpId))
//         // console.log(element.path)
//         // console.log(element.pnpId)
//     });

//     setTimeout(refresh, 0);
// }




//end

