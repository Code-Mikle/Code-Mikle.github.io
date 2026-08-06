---
title: Java 并发
---

## Java 并发

### 待整理问题

为什么业务实际应用中要避免使用 ThreadLocal？

---

> 并发不能零散地学。我建议按下面这条主线：
>
> ```
> 线程
> ↓
> 线程安全问题
> ↓
> JMM
> ↓
> volatile
> ↓
> synchronized
> ↓
> CAS
> ↓
> AQS
> ↓
> ReentrantLock
> ↓
> 并发容器
> ↓
> 线程池
> ```
>
> 可以拆成六层。

- **线程池**：核心参数、拒绝策略、工作流程。
- **锁机制**：synchronized 的锁升级过程、ReentrantLock、AQS（抽象队列同步器）原理。
- **JUC 工具类**：CountDownLatch、CyclicBarrier、Semaphore 的使用场景。

### 线程基础

```
线程创建方式
线程生命周期
start() vs run()
sleep() vs wait()
notify / notifyAll
join
interrupt
守护线程
```

### Java 内存模型 JMM

> 这一块非常重要：
>
> ```
> 主内存
> 工作内存
> 可见性
> 原子性
> 有序性
> happens-before
> 指令重排序
> ```
>
> 一定要理解：
>
> > 多线程问题的本质是什么？
>
> 通常就是三个：
>
> ```
> 原子性
> 可见性
> 有序性
> ```
>
> 然后自然引出：
>
> ```
> volatile 解决什么？
> synchronized 解决什么？
> CAS 解决什么？
> ```

### 锁

> 建议形成一个完整的锁体系：
>
> ```
> synchronized
> ├── 对象锁
> ├── 类锁
> ├── monitor
> └── 锁优化
> 
> Lock
> ├── ReentrantLock
> ├── ReentrantReadWriteLock
> └── Condition
> 
> AQS
> ├── state
> ├── CAS
> ├── CLH 队列
> └── acquire/release
> ```
>
> 这里尤其要深入：
>
> ```
> synchronized 原理
> volatile 原理
> CAS 原理
> AQS 原理
> ReentrantLock 原理
> ```

### 并发工具类

> ```
> CountDownLatch
> CyclicBarrier
> Semaphore
> CompletableFuture
> ThreadLocal
> ```
>
> ThreadLocal 属于高频题，要搞清楚：
>
> ```
> Thread
> ↓
> ThreadLocalMap
> ↓
> Entry
> ↓
> key = WeakReference<ThreadLocal>
> value = Object
> ```
>
> 以及：
>
> > 为什么 ThreadLocal 会导致内存泄漏？

### 并发集合

> 重点：
>
> ```
> ConcurrentHashMap
> CopyOnWriteArrayList
> BlockingQueue
> ```
>
> 尤其是 ConcurrentHashMap：
>
> ```
> JDK 7
> Segment + HashEntry
> 
> JDK 8
> Node[] + CAS + synchronized
> ```

### 线程池

> 线程池属于必须完全掌握的内容：
>
> ```
> ThreadPoolExecutor
> │
> ├── corePoolSize
> ├── maximumPoolSize
> ├── keepAliveTime
> ├── workQueue
> ├── threadFactory
> └── RejectedExecutionHandler
> ```
>
> 必须能完整回答：
>
> > 一个任务提交到线程池之后，到底经历了什么？
>
> 流程大致是：
>
> ```
> 任务到来
>   ↓
> 线程数 < corePoolSize
>   → 创建核心线程
>   ↓ 否
> 加入阻塞队列
>   ↓ 队列满
> 线程数 < maximumPoolSize
>   → 创建非核心线程
>   ↓ 否
> 拒绝策略
> ```
>
> 然后继续准备生产问题：
>
> > 线程池参数应该怎么配置？

