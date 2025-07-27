#include <temppress.h>

static void fillValueInt(lwjson_t * lwjson, char * key, uint16_t * value)
{
	const lwjson_token_t* token;
	if((token = lwjson_find(lwjson, key)) != NULL)
	{
		if(token->type == LWJSON_TYPE_NUM_INT)
		{
			*value = token->u.num_int;
		}
	}
}

static void fillValue(lwjson_t * lwjson, char * key, float * value)
{
	const lwjson_token_t* token;
	if((token = lwjson_find(lwjson, key)) != NULL)
	{
		if(token->type == LWJSON_TYPE_NUM_REAL)
		{
			*value = token->u.num_real;
		}
		else if(token->type == LWJSON_TYPE_NUM_INT)
		{
			*value = token->u.num_int;
		}
	}
}

void TempPress_Loop(TempPress* dev)
{
	switch(dev->stage)
	{
		case TEMPPRESS_STAGE_RECEIVE:
			lwjson_token_t tokens[128];
			lwjson_t lwjson;
			lwjson_init(&lwjson, tokens, LWJSON_ARRAYSIZE(tokens));
			if (lwjson_parse(&lwjson, dev->buffor) == lwjsonOK)
			{
				lwjson_token_t* cmd;
				if ((cmd = lwjson_find(&lwjson, "cmd")) != NULL)
				{
					if(cmd->type == LWJSON_TYPE_NUM_INT)
					{
						if(cmd->u.num_int == 1) //GET_DATA
						{
							dev->stage = TEMPPRESS_STAGE_TRANSMIT;
						}
						else if(cmd->u.num_int == 2) //SET_DATA
						{
							fillValue(&lwjson, "tempStep", &dev->tempStep);
							fillValue(&lwjson, "pressStep", &dev->pressStep);
							fillValue(&lwjson, "tempMin", &dev->tempMin);
							fillValue(&lwjson, "pressMin", &dev->pressMin);
							fillValueInt(&lwjson, "pwmFreq", &dev->pwmFreq);
							fillValueInt(&lwjson, "pwmDuty", &dev->pwmDuty);
							TempPress_UpdatePWM(dev->pwmFreq, dev->pwmDuty);
							dev->stage = TEMPPRESS_STAGE_TRANSMIT;
						}
						else
						{
							dev->stage = TEMPPRESS_STAGE_MAIN;
							TempPress_TurnOnReceive(dev->buffor, BUFFOR_SIZE);
						}
					}
					else
					{
						dev->stage = TEMPPRESS_STAGE_MAIN;
						TempPress_TurnOnReceive(dev->buffor, BUFFOR_SIZE);
					}
				}
				else
				{
					dev->stage = TEMPPRESS_STAGE_MAIN;
					TempPress_TurnOnReceive(dev->buffor, BUFFOR_SIZE);
				}
				lwjson_free(&lwjson);
			}
			else
			{
				dev->stage = TEMPPRESS_STAGE_MAIN;
				TempPress_TurnOnReceive(dev->buffor, BUFFOR_SIZE);
			}
			memset(dev->buffor, '\0', 1024);
			break;
		case TEMPPRESS_STAGE_MAIN:
			TempPress_GetTempAndPress(&dev->temp, &dev->press);
			dev->ledMode = TempPress_WhatIsMode();
			if(dev->ledMode == 0)
			{
				TempPress_UpdateLEDs(&dev->tempMin, &dev->tempStep, &dev->temp);
			}
			else
			{
				TempPress_UpdateLEDs(&dev->pressMin, &dev->pressStep, &dev->press);
			}
			break;
		case TEMPPRESS_STAGE_TRANSMIT:
			sprintf(dev->buffor, JSON_ANSWER_PATTERN, dev->ledMode, dev->temp, dev->press, dev->pwmFreq,
					dev->pwmDuty, dev->tempMin, dev->tempStep, dev->pressMin, dev->pressStep);
			TempPress_Transmit(dev->buffor, strlen(dev->buffor));
			dev->stage = TEMPPRESS_STAGE_MAIN;
			break;
		default:
			dev->stage = TEMPPRESS_STAGE_MAIN;
			break;
	}
}
