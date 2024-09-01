///*
// * bmp390.c
// *
// *  Created on: Jul 18, 2024
// *      Author: zero-jedynkowy
// */
//
//#include "temp_press.h"
////
////uint8_t tx[10] = {0};
////uint8_t rx[10] = {0};
//
//void TempPress_Init(TempPress * myObj)
//{
//	myObj->measurementMode = TEMPERATURE;
//	myObj->temperature = 0;
//	myObj->pressure = 0;
//
//	uint8_t tx[10] = {0};
//	uint8_t rx[10] = {0};
////	HAL_I2C_Master_Transmit(&hi2c1, BMP390_ADDRESS << 1, tx, 1, 1000);
////	HAL_I2C_Master_Receive(&hi2c1,  BMP390_ADDRESS << 1, rx, 1, 1000);
//
//	HAL_I2C_Mem_Read(&hi2c1, BMP390_ADDRESS << 1, BMP390_CHIP_ID, 1, rx, 1, HAL_MAX_DELAY);
//	if(rx[0] != 0x60)
//	{
//		while(1)
//		{
//			HAL_GPIO_TogglePin(MEAS1_GPIO_Port, MEAS1_Pin);
//			HAL_GPIO_TogglePin(MEAS2_GPIO_Port, MEAS2_Pin);
//			HAL_GPIO_TogglePin(MEAS3_GPIO_Port, MEAS3_Pin);
//			HAL_GPIO_TogglePin(MEAS4_GPIO_Port, MEAS4_Pin);
//			HAL_GPIO_TogglePin(MEAS5_GPIO_Port, MEAS5_Pin);
//			HAL_GPIO_TogglePin(MEAS6_GPIO_Port, MEAS6_Pin);
//			HAL_Delay(1000);
//		}
//	}
//	tx[0] = 0x33;
//	HAL_I2C_Mem_Write(&hi2c1, BMP390_ADDRESS << 1, BMP390_PWR_CTRL, 1, tx, sizeof(tx[0]), HAL_MAX_DELAY);
//	tx[0] = 0x12;
//	HAL_I2C_Mem_Write(&hi2c1, BMP390_ADDRESS << 1, BMP390_PWR_CTRL, 1, tx, sizeof(tx[0]), HAL_MAX_DELAY);
//	tx[0] = 0x4;
//	HAL_I2C_Mem_Write(&hi2c1, BMP390_ADDRESS << 1, BMP390_PWR_CTRL, 1, tx, sizeof(tx[0]), HAL_MAX_DELAY);
//
////	HAL_I2C_Mem_Write(&hi2c1, (uint16_t)BMP390_ADDRESS << 1, 0x1C, 1, (uint8_t*)&buffer, sizeof(buffer), HAL_MAX_DELAY);
////	buffer = 0x4;
////	HAL_I2C_Mem_Write(&hi2c1, (uint16_t)BMP390_ADDRESS << 1, 0x1F, 1, (uint8_t*)&buffer, sizeof(buffer), HAL_MAX_DELAY);
//
//}
//
//void TempPress_GetMeasurement(TempPress * myObj)
//{
//
//	HAL_I2C_Mem_Read(&hi2c1, BMP390_ADDRESS << 1, BMP390_DATA, 1, rx, 6, HAL_MAX_DELAY);
//	HAL_Delay(1000);
//	uint32_t x = 0;
//	uint32_t y = 0;
//	uint32_t z = 0;
//	uint32_t q = 0;
//	x = rx[0];
//	y = rx[1] << 8;
//	z = rx[2] << 16;
//	q = z | y | x;
//
//
////	while(HAL_I2C_Mem_Read(&hi2c1, BMP390_ADDRESS << 1, 0x04, 1, &a, 1, HAL_MAX_DELAY) == HAL_OK);
////	while(HAL_I2C_Mem_Read(&hi2c1, BMP390_ADDRESS << 1, 0x05, 1, &b, 1, HAL_MAX_DELAY) == HAL_OK);
////	while(HAL_I2C_Mem_Read(&hi2c1, BMP390_ADDRESS << 1, 0x06, 1, &c, 1, HAL_MAX_DELAY) == HAL_OK);
//
////	HAL_I2C_Mem_Read(&hi2c1, BMP390_ADDRESS << 1, 0x07, 1, &y, 3, HAL_MAX_DELAY);
//
//}
//
//void TempPress_ProcessMessage(TempPress * myObj)
//{
//
//}
