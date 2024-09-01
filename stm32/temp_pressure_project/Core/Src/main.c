/* USER CODE BEGIN Header */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include "bmp3.h"
#include "common.h"
#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include "cJSON.h"

/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */
/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */
/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */
/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/
I2C_HandleTypeDef hi2c1;

TIM_HandleTypeDef htim3;

UART_HandleTypeDef huart1;

/* USER CODE BEGIN PV */

//KOD BOSHA
int8_t rslt;
uint16_t settings_sel;

struct bmp3_dev dev;
struct bmp3_data data = { 0 };
struct bmp3_settings settings = { 0 };
struct bmp3_status status = { { 0 } };

//MOJ KOD
enum
{
	TRANSMIT,
	MEASUREMENT,
	PROCESS_RECEIVED_DATA
} typedef DeviceState;

uint8_t measurement_mode = 0;
double press_min = 70000;
double press_step = 10000;
double temp_min = 0;
double temp_step = 10;
double temp = 0;
char rx[50] = {0};
char tx[50] = {0};
uint8_t bufferCounter = 0;
DeviceState state;

uint16_t ccr = 0;
uint16_t prescaler = 0;
uint16_t counterPeriod = 0;


/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
static void MX_GPIO_Init(void);
static void MX_USART1_UART_Init(void);
static void MX_TIM3_Init(void);
static void MX_I2C1_Init(void);
/* USER CODE BEGIN PFP */
/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */
void bmp3_set_measurement_leds(double * measurement, double * min, double * step)
{
	double temp = *measurement - *min;
	uint16_t leds = 0;
	temp /= *step;
	leds = 0;
	if(temp > 6)
	{
		temp = 6;
	}
	for(uint8_t i=0; i<(uint8_t)temp; i++)
	{
		leds |= M1_Pin << i;
	}
	HAL_GPIO_WritePin(M1_GPIO_Port, M1_Pin | M2_Pin | M3_Pin | M4_Pin | M5_Pin | M6_Pin, 0);
	HAL_GPIO_WritePin(M1_GPIO_Port, leds, 1);
}

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    if(huart->Instance == USART1)
    {
        if(rx[bufferCounter] == '}')
        {
        	bufferCounter = 0;
        	state = PROCESS_RECEIVED_DATA;
        }
        else
        {
        	bufferCounter += 1;
        }
        HAL_UART_Receive_IT(&huart1, (uint8_t *)&rx[bufferCounter], 1);
    }
}
/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{

  /* USER CODE BEGIN 1 */
  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */
  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */
  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_USART1_UART_Init();
  MX_TIM3_Init();
  MX_I2C1_Init();
  /* USER CODE BEGIN 2 */
  rslt = bmp3_interface_init(&dev, BMP3_I2C_INTF);
  bmp3_check_rslt("bmp3_interface_init", rslt);
  rslt = bmp3_init(&dev);
  bmp3_check_rslt("bmp3_init", rslt);
  settings.int_settings.drdy_en = BMP3_ENABLE;
  settings.press_en = BMP3_ENABLE;
  settings.temp_en = BMP3_ENABLE;
  settings.odr_filter.press_os = BMP3_OVERSAMPLING_2X;
  settings.odr_filter.temp_os = BMP3_OVERSAMPLING_2X;
  settings.odr_filter.odr = BMP3_ODR_100_HZ;
  settings_sel = BMP3_SEL_PRESS_EN | BMP3_SEL_TEMP_EN | BMP3_SEL_PRESS_OS | BMP3_SEL_TEMP_OS | BMP3_SEL_ODR | BMP3_SEL_DRDY_EN;
  rslt = bmp3_set_sensor_settings(settings_sel, &settings, &dev);
  bmp3_check_rslt("bmp3_set_sensor_settings", rslt);
  settings.op_mode = BMP3_MODE_NORMAL;
  rslt = bmp3_set_op_mode(&settings, &dev);
  bmp3_check_rslt("bmp3_set_op_mode", rslt);

  measurement_mode = HAL_GPIO_ReadPin(MEASUREMENT_MODE_GPIO_Port, MEASUREMENT_MODE_Pin);
  HAL_UART_Receive_IT(&huart1, (uint8_t *)rx, 1);
  state = MEASUREMENT;

  HAL_TIM_Base_Start_IT(&htim3);

  HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_2);

  ccr = htim3.Instance->CCR2;
  prescaler = htim3.Instance->PSC;
  counterPeriod = htim3.Instance->ARR;
//  counterPeriod = htim3.Instance
//  prescaler = htim3.Init.Prescaler;
//  prescaler = htim3.Init.

  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
	while(1)
	{
		switch(state)
		{
			case TRANSMIT:
			{
				cJSON *root = cJSON_CreateObject();
				ccr = htim3.Instance->CCR2;
				prescaler = htim3.Instance->PSC;
				counterPeriod = htim3.Instance->ARR;
				cJSON_AddStringToObject(root, "id", "TempPress Sensor V1");
				cJSON_AddNumberToObject(root, "temperature", data.temperature);
				cJSON_AddNumberToObject(root, "pressure", data.pressure);
				cJSON_AddNumberToObject(root, "temp_step", temp_step);
				cJSON_AddNumberToObject(root, "temp_min", temp_min);
				cJSON_AddNumberToObject(root, "press_step", press_step);
				cJSON_AddNumberToObject(root, "press_min", press_min);
				cJSON_AddNumberToObject(root, "prescaler", prescaler);
				cJSON_AddNumberToObject(root, "counterPeriod", counterPeriod);
				cJSON_AddNumberToObject(root, "ccr", ccr);
				char *json_string = cJSON_Print(root);
				HAL_UART_Transmit(&huart1, (uint8_t *)json_string, strlen(json_string), HAL_MAX_DELAY);
				cJSON_Delete(root);
				free(json_string);
				state = MEASUREMENT;
				break;
			}
			case MEASUREMENT:
			{
				rslt = bmp3_get_status(&status, &dev);
				bmp3_check_rslt("bmp3_get_status", rslt);
				if (status.intr.drdy != BMP3_ENABLE && rslt == BMP3_OK)
				{
					rslt = bmp3_get_sensor_data(BMP3_PRESS_TEMP, &data, &dev);
					measurement_mode = HAL_GPIO_ReadPin(MEASUREMENT_MODE_GPIO_Port, MEASUREMENT_MODE_Pin);
					if(measurement_mode == 0)
					{
						bmp3_set_measurement_leds(&data.temperature, &temp_min, &temp_step);
					}
					else
					{
						bmp3_set_measurement_leds(&data.pressure, &press_min, &press_step);
					}
				}
				ccr = htim3.Instance->CCR2;
				prescaler = htim3.Instance->PSC;
				counterPeriod = htim3.Instance->ARR;
				break;
			}
			case PROCESS_RECEIVED_DATA:
			{
			    cJSON *root = cJSON_Parse(rx);
			    cJSON *command = cJSON_GetObjectItemCaseSensitive(root, "command");
			    if(strcmp(command->valuestring, "get_data") == 0)
			    {
			    	state = TRANSMIT;
			    }
			    else if(strcmp(command->valuestring, "press_min") == 0)
			    {
			    	cJSON *value = cJSON_GetObjectItemCaseSensitive(root, "value");
			    	press_min = value->valuedouble;
			    	state = TRANSMIT;
			    }
			    else if(strcmp(command->valuestring, "press_step") == 0)
			    {
			    	cJSON *value = cJSON_GetObjectItemCaseSensitive(root, "value");
			    	press_step = value->valuedouble;
			    	state = TRANSMIT;
			    }
			    else if(strcmp(command->valuestring, "temp_min") == 0)
				{
			    	cJSON *value = cJSON_GetObjectItemCaseSensitive(root, "value");
			    	temp_min = value->valuedouble;
					state = TRANSMIT;
				}
				else if(strcmp(command->valuestring, "temp_step") == 0)
				{
					cJSON *value = cJSON_GetObjectItemCaseSensitive(root, "value");
					temp_step = value->valuedouble;
					state = TRANSMIT;
				}
				else if(strcmp(command->valuestring, "ccr") == 0)
				{
					cJSON *value = cJSON_GetObjectItemCaseSensitive(root, "value");
				    HAL_TIM_PWM_Stop(&htim3, TIM_CHANNEL_2);
					__HAL_TIM_SET_COMPARE(&htim3, TIM_CHANNEL_2, value->valueint);
					__HAL_TIM_SET_COUNTER(&htim3, 0);
					HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_2);
					state = TRANSMIT;
				}
				else if(strcmp(command->valuestring, "prescaler") == 0)
				{
					cJSON *value = cJSON_GetObjectItemCaseSensitive(root, "value");
					HAL_TIM_PWM_Stop(&htim3, TIM_CHANNEL_2);
					__HAL_TIM_SET_PRESCALER(&htim3, value->valueint);
					__HAL_TIM_SET_COUNTER(&htim3, 0);
					HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_2);
					state = TRANSMIT;
				}
				else if(strcmp(command->valuestring, "counterPeriod") == 0)
				{
					cJSON *value = cJSON_GetObjectItemCaseSensitive(root, "value");
					HAL_TIM_PWM_Stop(&htim3, TIM_CHANNEL_2);
					htim3.Instance->ARR = value->valueint;
//					__HAL_TIM_SET_COUNTER(&htim3, value->valueint);
					__HAL_TIM_SET_COUNTER(&htim3, 0);
					HAL_TIM_PWM_Start(&htim3, TIM_CHANNEL_2);
					state = TRANSMIT;
				}
				else
				{
					state = MEASUREMENT;
				}
			    memset(rx, 0, sizeof(rx));
			    cJSON_Delete(root);
				break;
			}
		}
	}
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
  /* USER CODE END 3 */
}

/**
  * @brief System Clock Configuration
  * @retval None
  */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /** Configure the main internal regulator output voltage
  */
  __HAL_RCC_PWR_CLK_ENABLE();
  __HAL_PWR_VOLTAGESCALING_CONFIG(PWR_REGULATOR_VOLTAGE_SCALE1);

  /** Initializes the RCC Oscillators according to the specified parameters
  * in the RCC_OscInitTypeDef structure.
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSE;
  RCC_OscInitStruct.HSEState = RCC_HSE_ON;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSE;
  RCC_OscInitStruct.PLL.PLLM = 4;
  RCC_OscInitStruct.PLL.PLLN = 168;
  RCC_OscInitStruct.PLL.PLLP = RCC_PLLP_DIV8;
  RCC_OscInitStruct.PLL.PLLQ = 4;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }

  /** Initializes the CPU, AHB and APB buses clocks
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV1;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_1) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief I2C1 Initialization Function
  * @param None
  * @retval None
  */
static void MX_I2C1_Init(void)
{

  /* USER CODE BEGIN I2C1_Init 0 */
  /* USER CODE END I2C1_Init 0 */

  /* USER CODE BEGIN I2C1_Init 1 */
  /* USER CODE END I2C1_Init 1 */
  hi2c1.Instance = I2C1;
  hi2c1.Init.ClockSpeed = 100000;
  hi2c1.Init.DutyCycle = I2C_DUTYCYCLE_2;
  hi2c1.Init.OwnAddress1 = 0;
  hi2c1.Init.AddressingMode = I2C_ADDRESSINGMODE_7BIT;
  hi2c1.Init.DualAddressMode = I2C_DUALADDRESS_DISABLE;
  hi2c1.Init.OwnAddress2 = 0;
  hi2c1.Init.GeneralCallMode = I2C_GENERALCALL_DISABLE;
  hi2c1.Init.NoStretchMode = I2C_NOSTRETCH_DISABLE;
  if (HAL_I2C_Init(&hi2c1) != HAL_OK)
  {
    Error_Handler();
  }
  /* USER CODE BEGIN I2C1_Init 2 */
  /* USER CODE END I2C1_Init 2 */

}

/**
  * @brief TIM3 Initialization Function
  * @param None
  * @retval None
  */
static void MX_TIM3_Init(void)
{

  /* USER CODE BEGIN TIM3_Init 0 */
  /* USER CODE END TIM3_Init 0 */

  TIM_ClockConfigTypeDef sClockSourceConfig = {0};
  TIM_MasterConfigTypeDef sMasterConfig = {0};
  TIM_OC_InitTypeDef sConfigOC = {0};

  /* USER CODE BEGIN TIM3_Init 1 */
  /* USER CODE END TIM3_Init 1 */
  htim3.Instance = TIM3;
  htim3.Init.Prescaler = 42000;
  htim3.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim3.Init.Period = 250;
  htim3.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  htim3.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
  if (HAL_TIM_Base_Init(&htim3) != HAL_OK)
  {
    Error_Handler();
  }
  sClockSourceConfig.ClockSource = TIM_CLOCKSOURCE_INTERNAL;
  if (HAL_TIM_ConfigClockSource(&htim3, &sClockSourceConfig) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_TIM_PWM_Init(&htim3) != HAL_OK)
  {
    Error_Handler();
  }
  sMasterConfig.MasterOutputTrigger = TIM_TRGO_RESET;
  sMasterConfig.MasterSlaveMode = TIM_MASTERSLAVEMODE_DISABLE;
  if (HAL_TIMEx_MasterConfigSynchronization(&htim3, &sMasterConfig) != HAL_OK)
  {
    Error_Handler();
  }
  sConfigOC.OCMode = TIM_OCMODE_PWM1;
  sConfigOC.Pulse = 125;
  sConfigOC.OCPolarity = TIM_OCPOLARITY_HIGH;
  sConfigOC.OCFastMode = TIM_OCFAST_DISABLE;
  if (HAL_TIM_PWM_ConfigChannel(&htim3, &sConfigOC, TIM_CHANNEL_2) != HAL_OK)
  {
    Error_Handler();
  }
  /* USER CODE BEGIN TIM3_Init 2 */
  /* USER CODE END TIM3_Init 2 */
  HAL_TIM_MspPostInit(&htim3);

}

/**
  * @brief USART1 Initialization Function
  * @param None
  * @retval None
  */
static void MX_USART1_UART_Init(void)
{

  /* USER CODE BEGIN USART1_Init 0 */
  /* USER CODE END USART1_Init 0 */

  /* USER CODE BEGIN USART1_Init 1 */
  /* USER CODE END USART1_Init 1 */
  huart1.Instance = USART1;
  huart1.Init.BaudRate = 115200;
  huart1.Init.WordLength = UART_WORDLENGTH_8B;
  huart1.Init.StopBits = UART_STOPBITS_1;
  huart1.Init.Parity = UART_PARITY_NONE;
  huart1.Init.Mode = UART_MODE_TX_RX;
  huart1.Init.HwFlowCtl = UART_HWCONTROL_NONE;
  huart1.Init.OverSampling = UART_OVERSAMPLING_16;
  if (HAL_UART_Init(&huart1) != HAL_OK)
  {
    Error_Handler();
  }
  /* USER CODE BEGIN USART1_Init 2 */
  /* USER CODE END USART1_Init 2 */

}

/**
  * @brief GPIO Initialization Function
  * @param None
  * @retval None
  */
static void MX_GPIO_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};
/* USER CODE BEGIN MX_GPIO_Init_1 */
/* USER CODE END MX_GPIO_Init_1 */

  /* GPIO Ports Clock Enable */
  __HAL_RCC_GPIOH_CLK_ENABLE();
  __HAL_RCC_GPIOA_CLK_ENABLE();
  __HAL_RCC_GPIOC_CLK_ENABLE();
  __HAL_RCC_GPIOB_CLK_ENABLE();

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(GPIOC, M1_Pin|M2_Pin|M3_Pin|M4_Pin
                          |M5_Pin|M6_Pin, GPIO_PIN_RESET);

  /*Configure GPIO pin : INT_Pin */
  GPIO_InitStruct.Pin = INT_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_INPUT;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(INT_GPIO_Port, &GPIO_InitStruct);

  /*Configure GPIO pin : MEASUREMENT_MODE_Pin */
  GPIO_InitStruct.Pin = MEASUREMENT_MODE_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_INPUT;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(MEASUREMENT_MODE_GPIO_Port, &GPIO_InitStruct);

  /*Configure GPIO pins : M1_Pin M2_Pin M3_Pin M4_Pin
                           M5_Pin M6_Pin */
  GPIO_InitStruct.Pin = M1_Pin|M2_Pin|M3_Pin|M4_Pin
                          |M5_Pin|M6_Pin;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOC, &GPIO_InitStruct);

/* USER CODE BEGIN MX_GPIO_Init_2 */
/* USER CODE END MX_GPIO_Init_2 */
}

/* USER CODE BEGIN 4 */
/* USER CODE END 4 */

/**
  * @brief  This function is executed in case of error occurrence.
  * @retval None
  */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
  /* USER CODE END Error_Handler_Debug */
}

#ifdef  USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  *         where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */
