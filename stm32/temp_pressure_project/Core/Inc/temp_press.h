/*
 * bmp390.h
 *
 *  Created on: Jul 18, 2024
 *      Author: zero-jedynkowy
 */

#ifndef INC_TEMP_PRESS_H_

#include "main.h"

extern I2C_HandleTypeDef hi2c1;


#define INC_TEMP_PRESS_H_
#define BMP390_ADDRESS 0x76
#define BMP390_CHIP_ID 0x00
#define BMP390_DATA 0x04
#define BMP390_PWR_CTRL 0x1B


enum
{
	TEMPERATURE,
	PRESSURE
} typedef MeasurementMode;

struct
{
	MeasurementMode measurementMode;
	uint8_t measurementBuffor[6];
	float temperature;
	float pressure;
} typedef TempPress;

void TempPress_Init(TempPress * myObj);
void TempPress_GetMeasurement(TempPress * myObj);

#endif /* INC_TEMP_PRESS_H_ */
