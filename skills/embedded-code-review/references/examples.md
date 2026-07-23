# 典型嵌入式代码缺陷示例

## 示例 1：ISR 中调用阻塞函数
```c
// 错误：ISR 中调用 vTaskDelay
void TIM2_IRQHandler(void) {
    HAL_TIM_IRQHandler(&htim2);
    vTaskDelay(10);
}
// 正确：发信号给任务处理
void TIM2_IRQHandler(void) {
    HAL_TIM_IRQHandler(&htim2);
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;
    xSemaphoreGiveFromISR(xSemaphore, &xHigherPriorityTaskWoken);
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}
```

## 示例 2：DMA cache 一致性
```c
// 风险：DMA buffer 未处理 cache
uint8_t rx_buffer[1024];
HAL_UART_Receive_DMA(&huart1, rx_buffer, 1024);
process_data(rx_buffer);  // cache 中可能是旧数据

// 正确：使用 cache 维护
__ALIGN_BEGIN uint8_t rx_buffer[1024] __ALIGN_END;
HAL_UART_Receive_DMA(&huart1, rx_buffer, 1024);
__SCB_InvalidateDCache_by_Addr(rx_buffer, 1024);
```

## 示例 3：整数溢出
```c
// 危险：未检查边界
uint16_t len = ntohs(packet->length);
memcpy(dest, data, len);  // len 可能 > dest 容量

// 正确：添加边界检查
uint16_t len = ntohs(packet->length);
if (len > DEST_SIZE) { return; }
memcpy(dest, data, len);
```

## 示例 4：优先级反转
```c
// 风险：低优先级任务持有高优先级任务需要的锁
void LowPriorityTask(void *pvParameters) {
    xSemaphoreTake(xLock, portMAX_DELAY);
    // ...长时间操作...
    xSemaphoreGive(xLock);
}
void HighPriorityTask(void *pvParameters) {
    xSemaphoreTake(xLock, portMAX_DELAY);
}
// 使用优先级继承互斥量
xLock = xSemaphoreCreateMutex();
```
