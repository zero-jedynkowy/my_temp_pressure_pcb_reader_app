#include <stdint.h>
#include <stdlib.h>
#include <stdio.h>
#include "bmp3.h"
#include "common.h"

static uint8_t dev_addr;
extern I2C_HandleTypeDef hi2c1;

/*!
 * I2C read function map to COINES platform
 */
BMP3_INTF_RET_TYPE bmp3_i2c_read(uint8_t reg_addr, uint8_t *reg_data, uint32_t len, void *intf_ptr)
{
    uint8_t device_addr = *(uint8_t*)intf_ptr;

    (void)intf_ptr;

    return HAL_I2C_Mem_Read(&hi2c1, device_addr << 1, reg_addr, 1, reg_data, len, HAL_MAX_DELAY);
}

/*!
 * I2C write function map to COINES platform
 */
BMP3_INTF_RET_TYPE bmp3_i2c_write(uint8_t reg_addr, const uint8_t *reg_data, uint32_t len, void *intf_ptr)
{
    uint8_t device_addr = *(uint8_t*)intf_ptr;

    (void)intf_ptr;

    return HAL_I2C_Mem_Write(&hi2c1, device_addr << 1, reg_addr, 1, reg_data, len, HAL_MAX_DELAY);
}

/*!
 * Delay function map to COINES platform
 */
void bmp3_delay_us(uint32_t period, void *intf_ptr)
{
    (void)intf_ptr;

    HAL_Delay(period);
}

BMP3_INTF_RET_TYPE bmp3_interface_init(struct bmp3_dev *bmp3, uint8_t intf)
{
    int8_t rslt = BMP3_OK;

    if (bmp3 != NULL)
    {
        if (intf == BMP3_I2C_INTF)
        {
            printf("I2C Interface\n");
            dev_addr = BMP3_ADDR_I2C_PRIM;
            bmp3->read = bmp3_i2c_read;
            bmp3->write = bmp3_i2c_write;
            bmp3->intf = BMP3_I2C_INTF;
        }
        bmp3->delay_us = bmp3_delay_us;
        bmp3->intf_ptr = &dev_addr;
    }
    else
    {
        rslt = BMP3_E_NULL_PTR;
    }

    return rslt;
}
