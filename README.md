<!-- <p align="center">
  <img src="app/resources/logo.png"/>
</p> -->

<table>
    <tr>
        <td width="200">
            <img src="app/resources/logo.png"/>
        </td>
        <td>
            <h1>TempPress</h1>
            <h3>Temperature and pressure device with PC app</h3>
            <p>A device which measures temperature and pressure. Also it has diodes which are scale for the choosen measurement. Also there is a PWM diode which the user can controll.</p>
            <br>
        </td>
    </tr>
</table>




# TempPress
## Temperature and pressure device with PC app

A device which measures temperature and pressure. Also it has diodes which are scale for the choosen measurement. Also there is a PWM diode which the user can controll.

The device communicates to PC by the USB-C port and the USB-UART converter. The PCB uses STM32 MCU. Also there is a built-in MCU programmer.

The PCB was designed in Altium Designer.
The PC App was created in Visual Studio Code with Electron.
The MCU Source Code was created in STM32CubeIDE.

### PC App

To run the app you need type in the console:
```console
user@pc:~$ cd app
user@pc:~$ yarn install
user@pc:~$ yarn start
```

To build the APP you need type in the console:
```console
user@pc:~$ cd app
```


## PC App Images

![alt text](readme_files/image.png)

![alt text](readme_files/image-1.png)

![alt text](readme_files/image-2.png)

## PCB Images

![alt text](readme_files/image-3.png)
