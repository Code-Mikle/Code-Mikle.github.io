---
title: Java 响应式编程
---
响应式编程的适用范围：

1. SSE 实时推送

   - 任务执行进度
   - 大模型流式输出
   - 文件导入进度
   - 项目构建日志
   - 自动修复过程
   - 消息通知
   - 后台任务状态变化

2. WebSocket 实时通信

   - 在线聊天
   - 实时协作
   - 在线客服
   - 实时通知
   - 游戏状态同步
   - 行情或监控数据推送

3. 消息队列和事件流

   Kafka、RabbitMQ 等消息不是一次性到达，而是持续消费

4. 调用多个外部服务

   例如一个页面需要同时获取

   - 用户信息
   - 项目信息
   - 账户额度
   - 最近生成记录

5. 大文件的流式读取、上传和下载

   例如下载一个很大的文件时，不希望一次性把整个文件读进内存，而是分块传输。典型场景包括

   - 视频流
   - 大文件下载
   - 对象存储文件转发
   - CSV 大数据导出
   - 日志文件传输

6. 批量数据并发处理

   例如需要处理 100 个独立任务，这可以用于

   - 批量调用第三方 API
   - 批量生成图片
   - 批量检查网站
   - 批量处理文件
   - 批量执行独立任务

   但如果任务内部是普通阻塞方法，就需要合理切换调度器，并限制并发量，否则可能把线程池打满。

7. 超时、重试和降级

   Reactor 很适合描述异步调用的控制逻辑：

   ```java
   modelClient.call(request)
           .timeout(Duration.ofSeconds(30))
           .retryWhen(Retry.backoff(2, Duration.ofSeconds(1)))
           .onErrorResume(error -> fallbackService.execute());
   ```

   表达的意思是：

   - 最多等待 30 秒；

   - 失败后退避重试两次；

   - 仍然失败则执行降级逻辑。

   不过重试必须谨慎：

   - 查询类请求通常可以重试；
   - 扣款、下单、保存等写操作，必须先解决幂等问题；
   - 大模型生成重试可能产生重复内容和额外费用。

8. 把回调式 API 转换为 Flux

   当前项目中的 `processTokenStream` 就属于这种情况。原始 API 采用回调：

   ```java
   tokenStream
           .onPartialResponse(...)
           .onCompleteResponse(...)
           .onError(...);
   ```

   而 Controller 希望返回 `Flux<String>`，所以需要使用 `Flux.create` 进行适配：

   ```java
   Flux.create(sink -> {
       tokenStream
               .onPartialResponse(sink::next)
               .onCompleteResponse(response -> sink.complete())
               .onError(sink::error)
               .start();
   });
   ```

   除了大模型以外，下面这些回调式组件也可能这样适配

   - WebSocket 客户端
   - 第三方 SDK 事件监听
   - 文件监听器
   - 硬件设备数据
   - 异步任务进度监听

   在选型上可以参考如下：

   ```
   一次请求 → 一个结果
   优先使用普通同步方法
   
   一次请求 → 持续产生多个结果
   考虑使用 Flux
   
   异步操作 → 最终产生一个结果
   考虑使用 Mono
   
   回调式第三方 SDK → 需要接入响应式接口
   使用 Flux.create 或 Mono.create
   ```

   
