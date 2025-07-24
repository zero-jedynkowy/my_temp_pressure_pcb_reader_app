#include <common.h>
#include <bmp3.h>
#include <bmp3_defs.h>
#include <stdbool.h>
#include <stdio.h>
#include <lwjson/lwjson.h>


#define BUFFOR_SIZE 1024
#define JSON_ANSWER_PATTERN "{\"ledSwitch\":%d,\"temp\":%.2f,\"press\":%.2f, \"pwmFreq\": %d, \
\"pwmDuty\": %d, \"tempMin\": %.2f, \"tempStep\": %.2f, \"pressMin\": %.2f, \"pressStep\": %.2f}"

enum
{
	TEMPPRESS_STAGE_MAIN,
	TEMPPRESS_STAGE_TRANSMIT,
	TEMPPRESS_STAGE_RECEIVE
} typedef TempPress_Stage;

enum
{
	LEDMode_TEMP,
	LEDMode_PRESS
} typedef TempPress_LEDMode;

struct
{
	char buffor[BUFFOR_SIZE];
	uint16_t bufforSize;

	uint8_t ledMode;
	float temp;
	float press;
	float tempStep;
	float pressStep;
	float tempMin;
	float pressMin;
	uint16_t pwmFreq;
	uint16_t pwmDuty;

	uint8_t bmp3State;

	TempPress_Stage stage;
} typedef TempPress;


void TempPress_Init(TempPress*);
void TempPress_Loop(TempPress*);
void TempPress_TurnOnReceive(char*, uint16_t);
void TempPress_Transmit(char*, uint16_t);
void TempPress_UpdatePWM(float, float);
void TempPress_UpdateLEDs(float*, float*, float*);
TempPress_LEDMode TempPress_WhatIsMode();
void TempPress_GetTempAndPress(float *, float *);
