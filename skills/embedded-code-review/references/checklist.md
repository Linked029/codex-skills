# 嵌入式代码审查详细检查项

## 内存安全
- `malloc`/`calloc`/`realloc` 返回值必须检查 NULL
- `free` 后必须将指针置 NULL 或立即离开作用域
- 检查所有函数内的 goto/return/break 路径确保没有资源泄漏
- 固定大小缓冲区处理外部输入时必须检查长度
- 禁止在中断上下文中使用 `malloc`
- 谨慎使用 `alloca`——栈溢出不会返回 NULL，直接崩

## 并发与竞态
- 全局/静态变量访问必须有锁保护（或原子操作）
- 中断与任务共享的数据必须使用临界区或关中断保护
- 判断 volatile 使用是否合理（C 标准：不保证原子性）
- 锁获取顺序必须一致，避免死锁
- FreeRTOS 等 RTOS 中注意：xSemaphoreTake 不能在 ISR 中调用（改用 xSemaphoreTakeFromISR）

## DMA / Cache 一致性
- DMA buffer 必须 cache-line aligned
- 使用 DMA 前需 clean cache（写方向）或 invalidate cache（读方向）
- DMA buffer 不能分配在栈上

## 中断上下文（ISR）
- ISR 中不能调用阻塞 API（信号量等待、消息队列接收、printf、malloc）
- ISR 应尽可能短，复杂逻辑 defer 到任务/工作队列
- 嵌套中断需检查优先级配置与栈空间

## 实时性
- 高优先级任务不应被低优先级任务持有的锁阻塞（优先级反转）
- 检查是否有非确定性循环（等待轮询硬件寄存器）
- 关中断时间应尽可能短（通常 < 100us）
