#include <temppress.h>
#include "bmp3.h"
#include "common.h"
#include <main.h>

extern UART_HandleTypeDef huart1;
extern TIM_HandleTypeDef htim3;
extern TIM_HandleTypeDef htim2;
extern TempPress deviceState;

const GPIO_TypeDef* ledPorts[] = {LED_6_GPIO_Port, LED_5_GPIO_Port, LED_4_GPIO_Port, LED_3_GPIO_Port, LED_2_GPIO_Port, LED_1_GPIO_Port};
const uint16_t ledPins[] = {LED_6_Pin, LED_5_Pin, LED_4_Pin, LED_3_Pin, LED_2_Pin, LED_1_Pin};

int8_t rslt;
uint16_t settings_sel;

struct bmp3_dev dev;
struct bmp3_data data = { 0 };
struct bmp3_settings settings = { 0 };
struct bmp3_status status = { { 0 } };

void HAL_UARTEx_RxEventCallback(UART_HandleTypeDef *huart, uint16_t Size)
{
	if(huart == &huart1)
	{
		deviceState.stage = TEMPPRESS_STAGE_RECEIVE;
		deviceState.bufforSize = Size;
	}
}

void HAL_UART_TxCpltCallback(UART_HandleTypeDef *huart)
{
	if(huart == &huart1)
	{
		memset(deviceState.buffor, '\0', 1024);
		TempPress_TurnOnReceive(deviceState.buffor, BUFFOR_SIZE);
	}
}

void TempPress_TurnOnReceive(char *buffor, uint16_t size)
{
	HAL_UARTEx_ReceiveToIdle_DMA(&huart1, (uint8_t *)buffor, size);
}

void TempPress_Transmit(char *buffor, uint16_t size)
{
	HAL_UART_Transmit_DMA(&huart1, (uint8_t *)buffor, size);
}

void TempPress_UpdatePWM(float freq, float duty)
{
	if(freq >= 1 && freq <= 100 && duty >= 0 && duty <= 100)
	{
		uint16_t psc, arr, ccr;
		HAL_TIM_PWM_Stop(&htim3, TIM_CHANNEL_2);
		psc = 8000-1;
		arr = ((8000000.0)/(freq*(htim3.Instance->PSC+1))) - 1;
		ccr = (duty/100)*(arr + 1);
		htim3.Instance->PSC = psc;
		htim3.Instance->ARR = arr;
		htim3.Instance->CCR2 = ccr;
		htim3.Instance->EGR = TIM_EGR_UG;
		HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_2);
	}
}

void TempPress_UpdateLEDs(float * min, float * step, float * val)
{
	int32_t range = *val - *min;
	uint32_t amount = 0;

	if (range > 0 && step > 0)
	{
		amount = (range + *step - 1) / *step;
		if (amount > 6)
		{
			amount = 6;
		}
	}
	for(uint8_t i=0; i<6; i++)
	{
		if(i < amount)
		{
			HAL_GPIO_WritePin(ledPorts[i], ledPins[i], 1);
		}
		else
		{
			HAL_GPIO_WritePin(ledPorts[i], ledPins[i], 0);
		}
	}
}

TempPress_LEDMode TempPress_WhatIsMode()
{
	if(HAL_GPIO_ReadPin(LED_MODE_GPIO_Port, LED_MODE_Pin))
		return LEDMode_PRESS;
	return LEDMode_TEMP;
}

void TempPress_Init(TempPress* deviceState)
{
	deviceState->pwmFreq = 1;
	deviceState->pwmDuty = 50;
	deviceState->ledMode = TempPress_WhatIsMode();
	deviceState->pressStep = 300;
	deviceState->pressMin = 0;
	deviceState->tempStep = 5;
	deviceState->tempMin = 0;
	TempPress_UpdatePWM(deviceState->pwmFreq, deviceState->pwmDuty);
	TempPress_TurnOnReceive(deviceState->buffor, BUFFOR_SIZE);

	//BMP3 TEMP PRESS I2C MODULE
	rslt = bmp3_interface_init(&dev, BMP3_I2C_INTF);
	bmp3_check_rslt(rslt);

	rslt = bmp3_init(&dev);
	bmp3_check_rslt(rslt);

	settings.int_settings.drdy_en = BMP3_ENABLE;
	settings.press_en = BMP3_ENABLE;
	settings.temp_en = BMP3_ENABLE;
	settings.odr_filter.press_os = BMP3_OVERSAMPLING_2X;
	settings.odr_filter.temp_os = BMP3_OVERSAMPLING_2X;
	settings.odr_filter.odr = BMP3_ODR_100_HZ;
	settings_sel = BMP3_SEL_PRESS_EN | BMP3_SEL_TEMP_EN | BMP3_SEL_PRESS_OS | BMP3_SEL_TEMP_OS | BMP3_SEL_ODR | BMP3_SEL_DRDY_EN;

	rslt = bmp3_set_sensor_settings(settings_sel, &settings, &dev);
	bmp3_check_rslt(rslt);

	settings.op_mode = BMP3_MODE_NORMAL;

	rslt = bmp3_set_op_mode(&settings, &dev);
	bmp3_check_rslt(rslt);
}

void TempPress_GetTempAndPress(float * temp, float * press)
{
	rslt = bmp3_get_status(&status, &dev);

	bmp3_check_rslt(rslt);

	if (status.intr.drdy != BMP3_ENABLE && rslt == BMP3_OK)
	{
		rslt = bmp3_get_sensor_data(BMP3_PRESS_TEMP, &data, &dev);
		deviceState.temp = data.temperature;
		deviceState.press = data.pressure/100;
	}
}

void TempPress_UpdateLEDsBinary(uint8_t num, bool state)
{
	if(num & 1)
	{
		HAL_GPIO_WritePin(LED_1_GPIO_Port, LED_1_Pin, state);
	}
	if(num & 2)
	{
		HAL_GPIO_WritePin(LED_2_GPIO_Port, LED_2_Pin, state);
	}
	if(num & 4)
	{
		HAL_GPIO_WritePin(LED_3_GPIO_Port, LED_3_Pin, state);
	}
	if(num & 8)
	{
		HAL_GPIO_WritePin(LED_4_GPIO_Port, LED_4_Pin, state);
	}
}

bool ledErrorState = false;

void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)
{
  if(htim == &htim2)
  {
	  if(ledErrorState)
	  {
		  ledErrorState = false;
	  }
	  else
	  {
		  ledErrorState = true;
	  }
  }
}

void bmp3_check_rslt(int8_t rstl)
{
	uint8_t howMuchLeds = 0;

	switch (rstl)
    {
        case BMP3_OK:
            break;
        case BMP3_E_NULL_PTR:
        	howMuchLeds = 1;
            break;
        case BMP3_E_COMM_FAIL:
        	howMuchLeds = 2;
            break;
        case BMP3_E_INVALID_LEN:
        	howMuchLeds = 3;
            break;
        case BMP3_E_DEV_NOT_FOUND:
        	howMuchLeds = 4;
            break;
        case BMP3_E_CONFIGURATION_ERR:
        	howMuchLeds = 5;
            break;
        case BMP3_W_SENSOR_NOT_ENABLED:
        	howMuchLeds = 6;
            break;
        case BMP3_W_INVALID_FIFO_REQ_FRAME_CNT:
        	howMuchLeds = 7;
            break;
        default:
            break;
    }
	if(rstl != BMP3_OK)
	{
		HAL_TIM_Base_Start_IT(&htim2);
		while(true)
		{
			TempPress_UpdateLEDsBinary(howMuchLeds, ledErrorState);
		}
	}
}
