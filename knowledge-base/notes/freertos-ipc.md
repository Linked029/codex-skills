# FreeRTOS 任务通信

## 队列
- xQueueCreate: 创建队列
- xQueueSend: 发送数据
- xQueueReceive: 接收数据

## 信号量
- 二值信号量: 任务间同步
- 计数信号量: 资源管理
- 互斥量: 带优先级继承

## 注意事项
- ISR 中使用 FromISR 结尾的 API
- 优先级反转使用互斥量解决
