---
title: Java 并发
---

## 待整理问题

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

## 线程基础

> Java 线程是 JVM 中执行任务的基本单位，同一进程中的多个线程共享堆和方法区，但每个线程拥有自己独立的程序计数器、虚拟机栈和本地方法栈。
>
> Java 中可以通过 Thread、Runnable、Callable 等方式定义线程任务，实际工程中一般通过线程池执行。
>
> Java 线程生命周期包括 NEW、RUNNABLE、BLOCKED、WAITING、TIMED_WAITING 和 TERMINATED 六种状态。
>
> 在线程协作方面，可以通过 sleep、wait、join、interrupt 等机制控制线程的休眠、等待、等待其他线程结束以及中断。
>
> 由于多个线程共享堆内存，因此并发访问共享变量时会产生原子性、可见性和有序性问题，后续通常使用 synchronized、volatile、CAS、Lock 以及 JUC 并发工具来解决。

线程（Thread）是 CPU 调度和执行的基本单位。

一个进程可以包含多个线程，例如一个 Java 程序启动后至少会有主线程：

```java
public static void main(String[] args) {
    System.out.println(Thread.currentThread().getName()); // 输出：main
}
```

JVM 本身实际上还会创建 GC 等其他后台线程。

进程和线程的区别可以这样理解：

- 进程是资源分配的基本单位。
- 线程是 CPU 调度的基本单位。
- 同一个进程中的线程共享堆、方法区等资源。
- 每个线程有自己独立的程序计数器、虚拟机栈、本地方法栈。

这也是并发问题产生的根本原因之一：多个线程会同时访问同一个堆中的共享对象。

### 线程创建

最基础的方式主要有三类。

第一种，继承 `Thread`，重写 `run()` 方法：

```java
class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("执行任务");
    }
}

public class Main {
    public static void main(String[] args) {
        MyThread thread = new MyThread();
        thread.start();
    }
}
```

第二种，实现 `Runnable` 接口：

```java
class MyTask implements Runnable {
    @Override
    public void run() {
        System.out.println("执行任务");
    }
}

public class Main {
    public static void main(String[] args) {
        Thread thread = new Thread(new MyTask());
        thread.start();
    }
}
```

也可以写成：

```java
new Thread(() -> {
    System.out.println("执行任务");
}).start();
```

第三种，实现 `Callable`，通常结合 `FutureTask`：

```java
Callable<Integer> callable = () -> {
    return 100;
};

FutureTask<Integer> futureTask = new FutureTask<>(callable);

Thread thread = new Thread(futureTask);
thread.start();

Integer result = futureTask.get();
System.out.println(result);
```

`Runnable` 和 `Callable` 最核心的区别是：

| 特性         | Runnable     | Callable |
| ------------ | ------------ | -------- |
| 返回值       | 无           | 有       |
| 抛出受检异常 | 不可以直接抛 | 可以     |
| 核心方法     | `run()`      | `call()` |

实际开发中一般不会频繁手动 `new Thread()`，而是使用线程池。下述是两种通过线程池创建的方式：

第一种，使用线程池 `ExecutorService`，生产环境最推荐的方式。

线程池能复用线程，避免频繁创建销毁的开销。

```java
ExecutorService executor = Executors.newFixedThreadPool(10);
executor.submit(() -> System.out.println("任务执行"));
```

第二种，使用 `CompletableFuture`

Java 8 引入的异步编程工具，底层默认使用 `ForkJoinPool`。能很方便地组合多个异步任务，处理任务之间的依赖关系。

```java
CompletableFuture.runAsync(() -> System.out.println("异步执行"));
```

### 线程的生命周期

> Java 线程有 NEW、RUNNABLE、BLOCKED、WAITING、TIMED_WAITING 和 TERMINATED 六种状态。其中调用 `start()` 后进入 RUNNABLE；竞争 `synchronized` Monitor 失败进入 BLOCKED；无期限的 `wait/join/park` 进入 WAITING；`sleep` 或带超时的 `wait/join` 进入 TIMED_WAITING；任务执行完成后进入 TERMINATED。需要特别注意 Java 的 RUNNABLE 同时包含操作系统的 Ready 和 Running 状态。

Java 在 `Thread.State` 中定义了 6 种线程状态：

```
NEW
RUNNABLE
BLOCKED
WAITING
TIMED_WAITING
TERMINATED
```

整体可以记成：

```
           start()
NEW -----------------> RUNNABLE
                         |
                         |
             ┌-----------+------------┐
             ↓           ↓            ↓
          BLOCKED      WAITING    TIMED_WAITING
             |           |            |
             └-----------+------------┘
                         ↓
                     RUNNABLE
                         |
                         ↓
                    TERMINATED
```

#### `NEW`：新建状态

线程对象 `Thread` 已经创建，但还没有调用 `start()`。

```java
Thread thread = new Thread(() -> {
    System.out.println("hello");
});

System.out.println(thread.getState()); // 输出：NEW
```

此时只是 JVM 堆里存在了一个 `Thread` 对象，还没有真正启动对应线程。调用 `start()` 后，进入 `RUNNABLE` 状态。

注意，一个线程只能 `start()` 一次。

> 例如：
>
> ```java
> thread.start();
> thread.start();
> ```
>
> 第二次会抛 `IllegalThreadStateException` 异常。

#### `RUNNABLE`：可运行状态

调用 `start()` 后进入该状态。

> 注意 Java 中的 `RUNNABLE` 并不等于当前一定在 CPU 上运行。它实际包括操作系统层面的两个状态：
>
> ```
> READY：等待 CPU 调度
> RUNNING：正在 CPU 上执行
> ```
>
> 所以：
>
> ```
> Java：RUNNABLE
> 操作系统：READY + RUNNING
> ```
>
> 比如有 100 个 Java 线程，但 CPU 只有 8 个核心。这 100 个线程可能全部处于 `RUNNABLE`，但真正同时执行的线程数量远小于 100。

#### `BLOCKED`：阻塞状态

线程等待进入 `synchronized` 临界区，即等待获取对象 Monitor 锁。例如：

```java
Object lock = new Object();

Thread t1 = new Thread(() -> {
    synchronized (lock) {
        try {
            Thread.sleep(10000);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
});

Thread t2 = new Thread(() -> {
    synchronized (lock) {
        System.out.println("t2 获取锁");
    }
});

t1.start();
t2.start();
```

假设 `t1` 先拿到了 `lock`，进入了 `synchronized`。这时 `t2` 也执行 `synchronized (lock)`，但是锁已经被 `t1` 持有。那么线程 `t2` 进入 `BLOCKED` 状态。整个过程如下：

```
t1：
RUNNABLE
   ↓ 获取锁
RUNNABLE
   ↓ sleep
TIMED_WAITING

t2：
RUNNABLE
   ↓ 尝试获得 synchronized 锁失败
BLOCKED
```

注意这里一个非常关键的地方：`t1` 虽然 `sleep()` 了，但是不会释放锁。所以：

```
t1：TIMED_WAITING，并且仍然持有 lock
t2：BLOCKED，等待 lock
```

等 `t1` 从 `synchronized` 代码块退出，`t1` 释放锁，`t2` 重新竞争锁，`t2` 获得锁后状态转为 `RUNNABLE`。

#### `WAITING`：无限等待状态

表示当前线程正在无限期等待其他线程执行某个动作。

常见操作：

```java
object.wait();
thread.join();
LockSupport.park();
```

- `wait()`

  ```java
  synchronized (lock) {
      lock.wait();
  }
  ```

  线程会：

  ```
  RUNNABLE
     ↓ wait()
  WAITING
  ```

  同时非常重要：`wait()` 会释放当前持有的 Monitor 锁。之后别人调用：

  ```java
  lock.notify();
  // 或
  lock.notifyAll();
  ```

  等待线程才有机会恢复。但这里还有一个容易忽略的细节。`notify()` 之后，并不是：

  ```
  WAITING → RUNNABLE
  ```

  一定立即发生。因为被唤醒的线程还需要重新获得 Monitor。更准确地说：

  ```
  WAITING
     ↓ notify()
  等待重新获取 Monitor
     ↓
  获得 Monitor
     ↓
  RUNNABLE
  ```

  这个细节后面学习 Monitor 时会更清楚。

- `join()`

- `park()`

#### `TIMED_WAITING`：超时等待

最多等待指定的时间，也就是有超时时间的等待，常见方法：

```
Thread.sleep(1000);
object.wait(1000);
thread.join(1000);
LockSupport.parkNanos(...);
```

比如：

```java
Thread.sleep(5000);
```

线程：

```
RUNNABLE
   ↓ sleep(5000)
TIMED_WAITING
   ↓ 5 秒结束
RUNNABLE
```

注意 `sleep()` 并不意味着 CPU 5 秒之后立刻执行这个线程。只是意味着至少休眠这么长时间，之后重新具备被调度的资格。例如：

```java
Thread.sleep(1000);
```

更准确的理解是至少休眠约 1 秒，然后进入 `RUNNABLE` 状态，等待 CPU 调度。所以并不能认为：

```java
sleep(1000)
```

就会精确在 1000ms 后继续执行。

#### `TERMINATED`：终止状态

线程的 `run()` 方法执行完毕后，就进入 `TERMINATED` 状态，线程生命周期结束。例如：

```java
Thread thread = new Thread(() -> {
    System.out.println("hello");
});

thread.start();
thread.join();
System.out.println(thread.getState()); // 输出：TERMINATED
```

线程一旦进入 `TERMINATED` 状态，生命周期彻底结束，不能重新调用 `thread.start()` 启动，否则会抛出 `IllegalThreadStateException`。也就是说 Java 线程不能启动 → 死亡 → 重新启动。如果需要再次执行任务，必须创建新线程。

#### BLOCKED 和 WAITING 的区别

这是线程状态中最容易混淆的两个。可以直接这样理解：

```
BLOCKED 我要锁，但是锁被别人拿着。
WAITING 我主动等待别人通知/完成某件事情。
```

例如 `BLOCKED`：

```java
synchronized (lock) { ... }
```

锁被其他线程持有，当前线程转为 `BLOCKED` 状态。

例如 `WAITING`：

```java
lock.wait();
// 或
thread.join();
// 或
LockSupport.park();
```

则当前线程转为 `WAITING` 状态。

更严格一点：

| 状态            | 典型原因                                 |
| --------------- | ---------------------------------------- |
| `BLOCKED`       | 等待 `synchronized` Monitor              |
| `WAITING`       | `wait()` / `join()` / `park()`           |
| `TIMED_WAITING` | `sleep()` / 有超时的 `wait()` / `join()` |

这里尤其要注意 `ReentrantLock.lock()` 等不到锁时，并不会表现为 `BLOCKED`。

因为 `BLOCKED` 这个 Java 状态主要对应：

```
synchronized Monitor 锁竞争
```

`ReentrantLock` 基于 AQS，内部通常会通过 `LockSupport.park()` 挂起线程，因此可能看到 `WAITING` 状态，而不是 `BLOCKED` 状态。

这是一个比较有区分度的面试细节。

#### 完整实例-串起来六个状态

假设有两个线程：

```java
Object lock = new Object();

Thread t1 = new Thread(() -> {
    synchronized (lock) {
        try {
            Thread.sleep(5000);
            lock.wait();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
});

Thread t2 = new Thread(() -> {
    synchronized (lock) {
        lock.notify();
    }
});
```

`t1` 刚创建，状态为 `NEW`。执行 `t1.start();` 后，状态变为 `RUNNBALE`。接着进入 `synchronized (lock)` 成功获得锁，状态仍然是 `RUNNABLE`。然后执行 `Thread.sleep(5000);` 后，状态变为 `TIMED_WAITING`，而且仍持有 `lock`。

此时 `t2` 去执行 `synchronized (lock)`，由于拿不到锁，`t2` 状态变为 `BLOCKED`。5 秒后 `t1` 结束 `TIMED_WAITING` 状态，转为 `RUNNABLE` 状态。然后执行 `lock.wait();`，`t1` 释放 `lock`，转为 `WAITING` 状态。

此时 `t2` 终于可以获得锁，由 `BLOCKED` 状态转为 `RUNNABLE` 状态。`t2` 执行 `lock.notify();`，`t1` 被唤醒，但需要重新竞争 `lock`。`t2` 退出 `synchronized`，释放锁。`t1` 获得锁，状态由 `WAITING` 转为 `RUNNABLE`。

最后，两个线程的 `run()` 都执行结束，状态变为 `TERMINATED`。

注意：如果把这段过程真正理解了，那么 Java 六种线程状态基本就掌握了。

### start() vs run()

这是线程最经典的面试题之一。假设：

```java
Thread thread = new Thread(() -> {
    System.out.println(Thread.currentThread().getName());
});
```

执行 `thread.run();` 本质只是普通方法调用 `main`，并没有创建新的执行线程。而 `thread.start();` 执行后，JVM 会真正启动一个新线程，新线程随后执行 `run();`，输出类似：`Thread-0`。因此：

```
start()
    ↓
创建/启动新线程
    ↓
新线程调用 run()
```

而不是：

```
run() → 创建线程
```

### sleep()、wait()、join()

这几个方法很容易混淆。

#### sleep()

`sleep()` 表示当前线程暂停执行一段时间。

```java
Thread.sleep(1000);
```

最关键的一点：`sleep()` 不释放当前线程已经持有的锁。例如：

```java
synchronized (lock) {
    Thread.sleep(5000);
}
```

这 5 秒期间 `lock` 仍然被当前线程持有。会让当前线程状态从 `RUNNABLE` → `TIMED_WAITTING` → `RUNNABLE`。

#### wait()、notify()、notifyAll()

> `wait、notify、notifyAll` 是 Java 基于对象 Monitor 提供的线程通信机制，它们定义在 Object 类中。线程必须先持有对象的 Monitor 才能调用这些方法。调用 `wait()` 后线程会释放 Monitor 并进入等待状态；其他线程在持有同一个 Monitor 时调用 `notify()` 可以唤醒一个等待线程，`notifyAll()` 可以唤醒所有等待线程。被唤醒的线程不会立即执行，而是需要重新竞争 Monitor，获得锁之后 `wait()` 才真正返回。实际使用 `wait()` 时一般要放在 `while` 循环中反复检查业务条件，以处理多线程竞争和虚假唤醒。

这三个方法定义在 Object 类中，用于线程间的等待-通知协作，必须在 `synchronized` 同步块中使用。

Java 中的 `wait()`、`notify()`、`notifyAll()`，也就是基于对象 Monitor 的线程通信机制。

这部分和 `synchronized` 是绑定在一起的。核心思想：`synchronized` 解决“谁能进入临界区”，`wait/notify` 解决“进入临界区之后，线程之间如何等待和协作”。

先看一个典型场景。假设消费者线程发现当前没有数据：

```java
synchronized (lock) {
    if (queue.isEmpty()) {
        // 没数据，继续执行也没有意义
    }
}
```

它不能一直死循环：

```java
while (queue.isEmpty()) { ... }
```

否则会持续占用 CPU。更合理的方式是：

```java
synchronized (lock) {
    while (queue.isEmpty()) {
        lock.wait();
    }
    // 消费数据
}
```

生产者生产数据后：

```java
synchronized (lock) {
    queue.add(data);
    lock.notifyAll();
}
```

这就是最经典的等待/通知机制。

##### `wait()`

`wait()` 当前线程是 `RUNNBALE` 状态，执行 `lock.wait()` 方法，释放 lock 的 Monitor 锁，并进入 `WAITING` 状态。例如：

```java
synchronized (lock) {
    System.out.println("开始等待");
    lock.wait();
    System.out.println("继续执行");
}
```

执行到 `lock.wait()` 后，当前线程不会继续执行。直到其他线程对同一个对象调用：

```java
lock.notify();
// 或者
lock.notifyAll();
```

唤醒之后，重新竞争 Monitor。如果获得 Monitor，进入 `RUNNBALE` 状态。

**为什么 `wait()` 必须放在 `synchronized` 中？**

错误示例：

```java
Object lock = new Object();
lock.wait();
```

会抛 `IllegalMonitorStateException` 异常，正确写法：

```java
synchronized (lock) {
    lock.wait();
}
```

原因是一个线程只有持有某个对象的 Monitor，才有资格操作这个 Monitor 对应的等待集合。可以简单理解成：

```
lock 对象
   │
   ├── Monitor 锁
   └── 等待这个 Monitor 的线程
```

线程调用 `lock.wait();`，本质上是在说：我暂时放弃 `lock` 这个 Monitor，把自己加入 `lock` 的等待集合。

因此调用之前必须先拥有 `lock` 的 Monitor，也就是：

```java
synchronized (lock)
```

##### `notify()`

表示唤醒一个正在等待该对象锁的线程。假设有多个线程：

```
线程 A
线程 B
线程 C
```

都执行 `lock.wait();`，它们都在等待。此时线程 D：

```java
synchronized (lock) {
    lock.notify();
}
```

`notify()` 的作用是：从这个对象的等待线程中唤醒一个线程。至于具体唤醒谁，不保证。并不依赖先 wait 的线程先被 notify 的这种顺序。

##### `notifyAll()`

表示唤醒这个对象等待集合中的所有线程。例如：

```
A WAITING
B WAITING
C WAITING

lock.notifyAll();
     ↓
A 被唤醒
B 被唤醒
C 被唤醒
```

但这里有一个非常重要的细节是被唤醒 ≠ 立即执行。因为这些线程还需要重新获得 `lock` 的 Monitor。

**`notify()` 后为什么不能立即继续执行？**

```java
synchronized (lock) {
    lock.notify();
    // 还有很多代码
}
```

调用 `notify()` 并不会释放锁。所以假设：

```
线程 A：wait()
线程 B：notify()
```

过程其实是：

```
线程 A：wait()
 ↓
释放 lock
 ↓
WAITING
```

线程 B 获得锁：

```
线程 B：获得 lock
 ↓
notify()
```

线程 A 被唤醒。但是此时 `lock` 仍然在线程 B 手里，所以线程 A 不能执行。

只有 B：

```java
synchronized (lock) {
    lock.notify();
    // B 继续运行
} // 到这里才释放锁
```

退出同步块以后：

```
B 释放 lock
     ↓
A 重新竞争 lock
     ↓
A 获取 lock
     ↓
wait() 返回
     ↓
继续执行
```

因此 `notify()` 只是通知等待线程重新参与锁竞争，并不会把锁直接交给它。

**`wait()` 返回以后为什么还持有锁？**

```java
synchronized (lock) {
    lock.wait();
    System.out.println("继续执行");
}
```

当 `wait()` 真正返回时，意味着当前线程已经重新获取了 `lock` 的 Monitor。所以：

```java
System.out.println("继续执行");
```

依然是在 `synchronized` 保护下执行的。完整过程：

```
获取 lock
   ↓
wait()
   ↓
释放 lock
   ↓
WAITING
   ↓
被 notify
   ↓
竞争 lock
   ↓
重新获得 lock
   ↓
wait() 返回
   ↓
继续执行
```

**为什么 `wait()` 一般用 `while`，而不是 `if`?**

这是 `wait/notify` 非常经典的问题。错误写法：

```java
synchronized (lock) {
    if (queue.isEmpty()) {
        lock.wait();
    }
    consume(queue.remove());
}
```

更推荐：

```java
synchronized (lock) {
    while (queue.isEmpty()) {
        lock.wait();
    }
    consume(queue.remove());
}
```

为什么？

假设两个消费者：C1 和 C2 都发现 `queue 为空`，于是：

```
C1 → wait
C2 → wait
```

生产者生产一个元素 `queue = [A]`，然后 `lock.notifyAll();`，C1、C2 都醒了。

假设 C1 先拿到锁，C1 取走 A。于是 `queue = []`，然后 C2 获得锁。如果 C2 的代码是：

```java
if (queue.isEmpty()) {
    lock.wait();
}
```

由于 C2 已经从 `wait()` 返回，if 不会重新判断（因为在前面 C2 执行 `lock.wait();` 后，释放锁，然后挂起并记录执行到的代码位置，所以当 C2 被再次唤醒时，会继续从上次挂起的位置继续执行代码），它会直接 `queue.remove();`，此时队列已经空了，就会出问题。而：

```java
while (queue.isEmpty()) {
    lock.wait();
}
```

C2 被唤醒之后，重新判断 `queue.isEmpty()`，发现还是空，那么继续 `wait()`。因此标准写法是：

```java
synchronized (lock) {
    while (!条件满足) {
        lock.wait();
    }
    // 执行业务逻辑
}
```

这也能够防御所谓的虚假唤醒（Spurious Wakeup）。

> 虚假唤醒：在操作系统和 JVM 的底层实现中，处于 `WAITING` 状态的线程可能会在没有收到任何 `notify()` 或 `notifyAll()` 信号的情况下被意外唤醒。底层原因是操作系统的线程调度机制，POSIX 标准也允许这种行为。
>
> - **如果用 `if`**：线程被虚假唤醒后，会跳过条件检查，直接执行后续代码。这可能导致程序在条件未满足时发生逻辑错误或抛出异常。
> - **如果用 `while`**：线程被唤醒后，会**重新评估条件**。如果条件依然不满足（即确实是虚假唤醒），线程会再次调用 `wait()` 继续等待，从而保证了安全性。

也就是说线程存在在没有满足业务条件时从等待状态恢复的可能性，因此 Java 官方推荐等待条件始终放在循环里重新检查。

##### `notify()` 和 `notifyAll()` 怎么选择？

理论上 `notify()` 开销可能更小，因为只唤醒一个线程。

但实际编程中，一般更推荐 `notifyAll()`，特别是存在不同等待条件时。例如有生产者线程、消费者线程，它们都在同一个 `lock` 上等待。如果生产者调用 `notify();` 本来想唤醒消费者，结果 JVM 恰好唤醒了另一个生产者。从而导致生产者醒来，条件不满足，进入 `WAITING` 状态。

消费者仍然睡着，可能导致程序迟迟无法向前推进。因此一般更加稳妥建议用 `notifyAll();`，让所有线程重新检查自己的条件。当然，它的代价是更多线程被唤醒，从而更多的锁进行竞争，继而上下文切换增加。

现代 Java 并发代码中，如果存在多个不同条件，更适合使用 `ReentrantLock + Condition`，因为可以建立多个等待队列。

##### 标准的等待通知模型

推荐直接记住这个模板。

等待方：

```java
synchronized (lock) {

    while (!condition) {
        lock.wait();
    }
    // 条件满足
    // 执行业务代码
}
```

通知方：

```java
synchronized (lock) {

    // 修改共享状态
    condition = true;

    lock.notifyAll();
}
```

关键顺序是：通知方修改条件，并发送通知，而不是只发 `notifyAll();`。因为通知本身并不是业务条件。

##### 一个完整的生产者消费者示例

假设只允许容器中存一个元素：

```java
class Container {
    private String data;
    private boolean hasData = false;

    public synchronized void put(String value) throws InterruptedException {

        while (hasData) {
            wait();
        }

        data = value;
        hasData = true;

        notifyAll();
    }

    public synchronized String get() throws InterruptedException {

        while (!hasData) {
            wait();
        }

        String result = data;

        data = null;
        hasData = false;

        notifyAll();

        return result;
    }
}
```

生产者：`container.put("hello");`

消费者：`String data = container.get();`

假设消费者先执行 `hasData = false`，于是：

```java
while (!hasData) {
    wait();
}
```

消费者释放锁，进入 `WAITING` 状态。

生产者获得锁，写入 `data` 并将 `hasData` 置为 `true`，然后执行 `notifyAll()` 唤醒所有消费者。

生产者释放锁后，消费者重新获得锁，如果 `!hasData == false`，于是退出 `while`，消费 `data`，这就是最基本的线程协作。

##### 为什么 `wait/notify` 属于 `Object` ，而非 `Thread` ？

很多人第一次看会觉得：

```
wait()
notify()
```

好像都是线程操作，为什么不放到 Thread 里面？

因为它们操作的核心并不是“线程”，而是对象 Monitor，线程只是在这个 Monitor 上等待或唤醒。例如：

```
lock.wait();
```

实际语义是当前线程进入 `lock` 对象对应 Monitor 的等待集合。

而 `lock.notify();` 是从 `lock` 对象 Monitor 的等待线程中唤醒一个。所以 `wait/notify` 属于 Object 是合理的。

如果放在 Thread 类里，那每个线程都得维护一套等待队列，逻辑会很乱。现在这种设计，锁和等待队列都绑定在对象上，哪个线程拿到这个对象的锁，哪个线程就能操作它的等待队列。

##### `wait/notify` 与 `ReentrantLock/Condition`

`synchronized`：

```java
synchronized (lock) {
    while (!condition) {
        lock.wait();
    }
}
```

对应 `ReentrantLock`：

```java
lock.lock();

try {
    while (!condition) {
        conditionObject.await();
    }
} finally {
    lock.unlock();
}
```

唤醒：

```java
conditionObject.signal();
// 或者
conditionObject.signalAll();
```

关系可以理解为：

```java
Object.wait() ≈ Condition.await()
Object.notify() ≈ Condition.signal()
Object.notifyAll() ≈ Condition.signalAll()
```

但是 `Condition` 更灵活，因为：

```java
Lock lock = new ReentrantLock();

Condition notEmpty = lock.newCondition();
Condition notFull = lock.newCondition();
```

可以分别维护：

```
notEmpty 等待队列
notFull 等待队列
```

而传统 `wait/notify` 一个 Monitor 主要对应一个 WaitSet。

#### join()

`join()` 当前线程等待 `t` 线程执行完成。例如：

```java
Thread t1 = new Thread(() -> {
    // 执行任务
});

t1.start();
t1.join();
```

假设这是 `main` 线程执行的。那么 `t1.join();` 意思是当前线程 main 等待 `t1` 执行结束。所以 `t1` 是 `RUNNABLE` 状态，`main` 是 `WAITING` 状态。当 `t1 → TERMINATED` 之后，`main → RUNNABLE`。

因此，`t1.join()` 不是让 `t1` 等待，而是谁调用 `join()`，谁等待目标线程。

#### `wait()` 和 `sleep()` 的区别？

| 对比                 | `wait()`           | `sleep()`        |
| -------------------- | ------------------ | ---------------- |
| 所属类               | `Object`           | `Thread`         |
| 是否释放锁           | 是                 | 否               |
| 是否必须持有 Monitor | 是                 | 否               |
| 主要用途             | 线程通信           | 暂停线程         |
| 无参是否无限等待     | 是                 | 没有无参版本     |
| 唤醒方式             | `notify/notifyAll` | 超时或 interrupt |

最核心一句：`sleep()` 是线程调度行为，而 `wait()` 是 Monitor 下的线程协作

### yield()

表示当前线程提示调度器：我愿意暂时让出 CPU。

```java
Thread.yield();
```

但是它只是一个提示。调用之后，当前线程完全有可能马上再次获得 CPU。因此不能依赖 `yield()` 保证线程执行顺序。

### 线程中断-interrupt

Java 不推荐强制停止一个线程，而采用“协作式中断”。例如：

```java
Thread thread = new Thread(() -> {
    while (!Thread.currentThread().isInterrupted()) {
        // 执行任务
    }

});

thread.start();
thread.interrupt();
```

这里 `thread.interrupt();` 并不是立即杀死线程，而是设置线程的中断标记，让线程自己决定是否退出。

常见 API：

```
thread.interrupt();
thread.isInterrupted();
Thread.interrupted();
```

这里尤其注意 `isInterrupted()` 读取中断标记，但不清除。而 `Thread.interrupted()` 读取当前线程的中断状态，并清除中断标记。

### 守护线程

Java 中线程分为：

```
用户线程
守护线程 Daemon Thread
```

普通线程默认是用户线程：

```java
Thread thread = new Thread(...);
```

设置为守护线程：

```java
thread.setDaemon(true);
thread.start();
```

必须在 `start()` 之前调用。

守护线程的特点是当 JVM 中不存在任何用户线程时，JVM 可以退出，不会等待守护线程执行完成。

例如 JVM 的一些 GC 线程就是典型的后台线程。因此不能使用守护线程执行必须保证完成的重要任务，例如：保存重要数据、数据库事务提交、关键文件写入。

### 线程优先级

Java 提供：

```java
Thread.MIN_PRIORITY   // 1
Thread.NORM_PRIORITY  // 5
Thread.MAX_PRIORITY   // 10
```

例如：

```java
thread.setPriority(10);
```

但线程优先级只是 JVM 向操作系统调度器提供的建议。不能认为 `优先级 10` 就一定比 `优先级 5` 先执行。所以不能依赖优先级实现程序逻辑。

## Java 内存模型 JMM

> Java 内存模型 JMM 是 Java 为多线程环境定义的一套内存访问规范，它屏蔽了不同 CPU 和操作系统底层内存模型的差异。JMM 抽象出了主内存和线程工作内存，共享变量存储在主内存中，线程在执行时会把变量读取到自己的工作内存，因此多线程访问共享数据时可能产生原子性、可见性和有序性问题。
>
> 原子性是指一个操作不可被其他线程交叉干扰；可见性是指一个线程对共享变量的修改能否被其他线程看到；有序性则主要涉及编译器、JIT 和 CPU 的指令重排序。
>
> JMM 通过 happens-before 规则定义不同线程操作之间的可见性和顺序关系，例如 Monitor 解锁 happens-before 后续加锁、volatile 写 happens-before 后续 volatile 读、Thread.start 和 Thread.join 也都有相应的 happens-before 规则。
>
> 在实际并发编程中，volatile 主要保证可见性和有序性，synchronized 能保证临界区的原子性、可见性和必要的有序性，而 CAS 主要用于实现共享变量的原子更新。

JMM（Java Memory Model，Java 内存模型）是 JVM 定义的一套“多线程访问共享内存时应该遵守的规则”。

它主要规定了多个线程之间如何读取、修改、同步共享变量，以及一个线程对共享变量的修改什么时候能被另一个线程看到。

> 注意：JMM ≠ JVM 内存区域
>
> JMM：多线程情况下，共享数据怎么访问，以及线程之间怎么保证数据一致性。
>
> JVM：Java 程序运行时，数据存在哪里。

JMM 的核心目的是解决多线程并发编程中的三大核心问题：**可见性**、**原子性**和**有序性**。从而屏蔽不同硬件（如 x86、ARM）和操作系统在内存访问上的差异，确保 Java 程序在不同平台上表现出一致的并发行为。

**为什么需要 JMM？**

《Java 并发编程的艺术》

### 主内存和工作内存

JMM 抽象出了两个概念：主内存（Main Memory）和工作内存（Working Memory）。可以简单画成：

```
                主内存
        ┌─────────────────┐
        │   count = 0     │
        └─────────────────┘
             ↑       ↑
        ┌────┘       └────┐
   线程 A 工作内存     线程 B 工作内存
   ┌───────────┐       ┌───────────┐
   │ count = 0 │       │ count = 0 │
   └───────────┘       └───────────┘
```

- 主内存：所有线程共享的内存区域，存储着所有共享变量（如实例变量、静态变量等），所有线程都能访问，但线程不能直接操作主内存中的共享变量。线程执行的时候，会把需要的数据读取到自己的工作内存中保存为副本。它大致对应 JVM 内存区域中的堆和方法区。
- 工作内存：每个线程独有的私有内存区域，存储了该线程使用的共享变量的副本。它大致对应 JVM 中的虚拟机栈、CPU 高速缓存或寄存器。

**交互规则**：线程不能直接操作主内存中的变量。所有的读取、赋值和计算都必须在工作内存中进行，完成后再同步回主内存。这种机制虽然提升了性能，但也正是引发并发问题的根源。

例如，初始时主内存中 `count = 0`，线程 A 将主内存中的数据 `count = 0` 读入自己的工作内存，然后修改为 `count = 10`，接着把修改后的 `count` 写入主内存中，然后主内存中的值变为 `count = 10`。

当然，这里的主内存和工作内存是 JMM 的抽象概念。不要简单认为：

```
主内存 = 物理内存 RAM
工作内存 = CPU Cache
```

现实实现可能涉及：

```
CPU 寄存器
L1/L2/L3 Cache
Store Buffer
主内存
编译器优化
JIT 优化
```

JMM 是在这些硬件细节之上定义的一套抽象规则。

**为什么需要工作内存？**

因为 CPU 的速度远远快于内存，如果 CPU 每执行一个操作，都去主内存 RAM 中获取数据，性能会非常差。所以现代计算机实际上存在：

```
CPU -> 寄存器 -> L1 Cache -> L2 Cache -> L3 Cache -> 主内存
```

线程运行时可能会使用这些高速存储结构。这样性能提高了，但是新的问题出现：**不同线程看到的数据可能不一样。**

#### 可见性

可见性：一个线程修改共享变量之后，其他线程能够及时看到这个修改。

由于线程操作的是工作内存中的副本，若不及时同步回主内存，其他线程读取的仍是旧值。JMM 通过 `volatile`、`synchronized` 和 `final` 等机制，强制线程在修改后同步到主内存，并在读取时从主内存加载最新值，从而保障可见性。

假设主内存中初始 `boolean flag = false;`，线程 A 进入如下循环：

```java
while (!flag) { ... }
```

线程 B 将 `flag` 修改为 `true`，按理此刻线程 A 发现 `flag == true` 后，应该退出循环。但是多线程情况下，不一定。可能会发生，线程 B 修改 `flag` 为 `true`，但是线程 A 的工作内存里仍然可能是 `flag = false`，于是 A可能一直循环。这就是可见性问题。

`volatile` 最核心的用途就是解决这个问题，它会强制线程每次读写都直接跟主内存交互。例如：

```java
private volatile boolean flag = false;
```

线程 B 修改为 `flag = true;`，之后线程 A再次读取：

```java
while (!flag) { ... }
```

能够看到最新值。所以先记 `volatile` 保证可见性。但这还不是 `volatile` 的全部作用，后面还会涉及它的有序性语义。

#### 原子性

原子性：指一个操作或一组操作要么全部执行且不被中断，要么全不执行，中间不能被其他线程干扰。

例如 `count++` 包括了三个操作：

```
1. 读取 count
2. count + 1
3. 写回 count
```

假设 `count = 0`，线程 A 读取 `count = 0`，线程 B 读取 `count = 0`，然后：

```
线程 A：0 + 1 = 1，写回 count = 1
线程 B：0 + 1 = 1，写回 count = 1
```

结果 `count = 1`，但实际上执行了两次 `count++;`，正确结果应该是 `2`，这就是原子性问题。

#### 有序性

有序性：指程序执行的顺序按照代码的先后顺序执行。

为了提高性能，编译器和 CPU 可能会对指令进行重排序（Reordering），但通过 happens-before 关系保证跨线程的有序性。虽然在单线程下不影响结果，但在多线程下可能导致逻辑混乱。JMM 通过 `volatile` 和锁机制禁止特定的指令重排，保障多线程环境下的有序性。例如：

```java
int a = 1;
int b = 2;
```

我们很自然地认为 CPU 一定限制性 `a = 1`，再执行 `b = 2`。但实际上编译器、JIT 和 CPU 为了提升性能，在不影响单线程语义的情况下，可能进行指令重排序。

```
源代码顺序为：
a = 1;
b = 2;

实际执行时可能经过优化：
b = 2;
a = 1;
```

在单线程中通常没有问题，因为最终结果一样。但是在多线程下就会出现问题，来看一个经典例子：

```java
// 线程 A：
data = new Data();
ready = true;

// 线程 B：
if (ready) { data.doSomething(); }
```

我们希望线程 A 创建 `Data` 对象实例 `data`，然后将 `ready = true`。线程 B 看到 `ready == true` 后，就认为 data 已经准备完成。但是 `new Data()` 不是一个简单操作。可以抽象成：

```
1. 分配内存
2. 初始化对象
3. data 指向这个内存
```

正常情况下按顺序依次执行 `1 → 2 → 3`，但某些操作之间可能发生重排序：`1 → 3 → 2`。于是可能出现分配内存后，`data` 指向分配的内存区域，`ready` 置为 `true`。线程 B 看到 `ready = true`，然后访问 `data`，但此时 `data` 并没有初始化完成。这就是有序性问题。所以有序性的核心是多线程环境下，代码执行顺序不能仅凭源代码书写顺序来推断。

**为什么 JVM 要允许指令重排序呢？**

不是 JVM 故意把程序搞乱，而是为了性能。例如：

```
指令 A：需要等待内存
指令 B：不依赖 A
```

CPU 完全可以在等待 A 的同时，先执行 B，这样可以提高 CPU 利用率和指令流水线效率。因此 JMM 不是完全禁止重排序，而是规定哪些地方允许重排序，哪些地方必须保持特定的跨线程顺序。

于是就引出了整个 JMM 中非常核心的 `happens-before`。

##### happens-before

`happens-before`（先行发生） 时 JMM 的核心原则，它规定：如果操作 A happens-before 操作 B，那么 JMM 保证 A 的执行结果对 B 可见，并且 A 在内存语义上先于 B。

> 注意：`happens-before` 并不单纯等价于时间上 A 一定比 B 早执行，它更强调 `可见性和有序性`。也就是：A happens-before B 意味着：A 的结果对 B 可见，并且 JVM 不能进行破坏这种关系的重排序

**happens-before 的核心规则**

面试不一定要把所有规则背下来，但下面几个必须掌握。

1. 程序顺序规则：在单线程内，前面的操作 happens-before 后面的操作。

   ```java
   int a = 10;
   int b = a + 1;
   ```

   同一个线程中，前面的操作 `a = 10` happens-before 后面的操作 `b = a + 1`。注意这说的是 JMM 的语义顺序，不代表 CPU 绝对不会做任何内部重排序。只要最终单线程行为符合程序语义即可。

2. Monitor 锁规则：对一个锁的 `unlock` 操作 happens-before 后续对同一把锁的 `lock` 操作。例如：

   ```java
   // 线程 A：
   synchronized (lock) {
       value = 10;
   }
   
   // 线程 B：
   synchronized (lock) {
       System.out.println(value);
   }
   ```

   线程 A 执行后解锁，因此 B 可以看到 A 的修改。这就是为什么 `synchronized` 不仅有互斥性，还有可见性。

3. volatile 规则：对于一个 `volatile` 变量的写操作 happens-before 后续对它的读。例如：

   ```java
   // 线程 A：
   data = 100;
   volatile boolean flag = true;
   
   // 线程 B：
   if (flag) {
       System.out.println(data);
   }
   ```

   那么：

   ```
   线程 A：
   data = 100
    ↓
   flag = true   volatile write
   
           happens-before
   
   线程 B：
   读取 flag     volatile read
    ↓
   读取 data
   ```

   因此，如果 B 读到 `flag == true`，那么之前 `data = 100` 也能够正确地对 B 可见。

4. Thread.start() 规则：`Thread.start()` happens-before 线程内的任何操作。例如：

   ```java
   // 线程 A：
   int a = 10;
   thread.start();
   ```

   线程 B 是这个 `thread`。那么 `thread.start()` 之前线程 A 的操作，happens-before 新线程中的操作。所以：

   ```
   a = 10
    ↓
   thread.start()
    ↓
   线程 B 能看到 a=10
   ```

5. Thread.join() 规则：线程的所有操作 happens-before `Thread.join()` 返回。

   例如，线程 B：`result = 100;` 然后结束。线程 A：

   ```java
   threadB.join();
   System.out.println(result);
   ```

   线程 B 中的操作 `result = 100` happens-before `join()` 返回后的线程 A 操作。所以 A 能看到 B 执行完成前的结果。

6. 传递性：如果 A happens-before B，且 B happens-before C，则 A happens-before C。


### 多线程问题

现在就可以理解 Java 多线程为什么难？核心就是三个问题：

- 原子性，多个操作可能交叉执行。例如 `count++;`；
- 可见性，线程 A 改了 `flag = true;`，线程 B 可能看不到；
- 有序性，编译器、JIT、CPU 可能对指令进行重排序。于是源代码顺序不一定完全等于实际执行顺序。

因此：

```
                  Java 并发问题
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       原子性        可见性        有序性
          ↓            ↓            ↓
      操作被打断    数据看不到     指令重排序
```

所以 Java 并发后面所有机制，基本都围绕三个核心问题展开：原子性、可见性、有序性。例如：

- `synchronized`：原子性 + 可见性 + 有序性约束。
- `volatile`：可见性 + 有序性。
- CAS：实现无锁原子操作。
- `Lock`：显式锁。
- AQS：很多 JUC 同步组件的基础。
- `AtomicInteger`：基于 CAS 的原子类。
- 线程池：管理线程生命周期和资源。

#### volatile 解决什么问题？

`volatile` 解决可见性和有序性。

- 对于可见性：强制线程每次读取变量时都从主内存中获取最新值，每次写入变量时都立刻刷回主内存。确保一个线程的修改对其他线程立即可见。
- 通过插入内存屏障，禁止编译器和 CPU 对 `volatile` 变量的读写操作进行特定的指令重排序。

适用场景：双重检查锁定（DCL）单例模式中防止指令重排、作为多线程间的状态标志位（如 `running = false`）。

例如：

```java
private volatile boolean running = true;
```

即，volatile 写 `running` 时，及时对其他线程可见，同时提供一定的内存屏障语义，禁止某些危险重排序。但 `volatile` 不能保证复合操作的原子性。例如：

```java
volatile int count;
count++;
```

依然不安全。所以保证了可见性和有序性，但是不能保证原子性。

#### synchronized 解决什么问题？

`synchronized` 解决原子性、可见性和有序性问题，它是 Java 提供的重量级锁机制，它是并发安全的“全能选手”。

- 对于原子性，`synchronized` 同一时间只允许一个线程进入临界区。所以：

  ```java
  synchronized (lock) {
      count++;
  }
  ```

  不会交叉执行。

- 对于可见性，在加锁和解锁时，JMM 会强制刷新工作内存。

  ```
  unlock
  happens-before
  后续 lock
  ```

  所以前一个线程的修改能被后面的线程看到。

- 对于有序性，锁的内存语义限制了会破坏 happens-before 的重排序。

适用场景：需要保证多个操作的绝对安全、复杂的临界区代码、不希望开发者手动处理底层同步细节的场景。

#### CAS 解决什么问题？

CAS（Compare-And-Swap）是一种硬件级别的原子操作，它比较内存中的某个值是否为预期值，如果是就更新为新值，不是就不动。整个比较和交换的过程是一条 CPU 指令完成的，不可能被打断。

解决了无锁原子性和锁竞争带来的性能问题。

- 对于无锁原子性：通过“比较并交换”指令，在不加锁的情况下保证单个变量操作的原子性。如果内存值与预期不符，则循环重试（自旋）。
- 对于锁竞争带来的性能问题：避免了 `synchronized` 等悲观锁在多线程竞争时引发的线程上下文切换和阻塞开销。

整个比较 + 修改，由硬件提供原子保证。所以：

```java
AtomicInteger count = new AtomicInteger();
count.incrementAndGet();
```

不需要 `synchronized`，也能安全做原子加一。所以，CAS 的核心能力是原子条件更新，而 Java 原子类还配套提供相应的内存可见性和有序性语义。

适用场景：高并发下的简单变量更新（如计数器、状态机）、构建无锁数据结构（如 `ConcurrentHashMap`、`BlockingQueue`）。

### 总结

`volatile`、`synchronized`、CAS 三者对比：

| 机制           | 原子性           | 可见性                   | 有序性           | 是否阻塞   |
| -------------- | ---------------- | ------------------------ | ---------------- | ---------- |
| `volatile`     | ❌ 复合操作不保证 | ✅                        | ✅                | 不阻塞     |
| `synchronized` | ✅                | ✅                        | ✅                | 可能阻塞   |
| CAS            | ✅ 原子更新       | ✅ 通常配合原子类内存语义 | ✅ 有相应内存语义 | 通常不阻塞 |

一张图总结：

```
                    Java 内存模型 JMM
                         ↓
              主内存 ←→ 工作内存
                         ↓
               多线程共享数据访问
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
        原子性          可见性          有序性
          │              │              │
      count++         缓存/副本        指令重排序
      非原子           不一致
          └──────────────┼──────────────┘
                         ↓
                  happens-before
                  定义同步关系
       ┌─────────────────┼────────────────┐
       ↓                 ↓                ↓
    volatile        synchronized        CAS
 可见性 + 有序性    三者都能保证      原子条件更新
```

## 锁

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

### synchronized

> `synchronized` 是 Java 提供的内置同步机制，可以修饰实例方法、静态方法和代码块。实例同步方法锁的是当前对象，静态同步方法锁的是 Class 对象，代码块锁的是显式指定的对象。它底层基于对象 Monitor 实现，同一个 Monitor 同一时刻只能被一个线程持有，因此能够保证临界区操作的互斥性和原子性。同时，Monitor 的解锁 happens-before 后续对同一个 Monitor 的加锁，因此还能够保证线程之间的内存可见性。`synchronized` 还是可重入锁，同一线程可以重复进入同一个 Monitor。字节码层面，同步代码块主要通过 `monitorenter/monitorexit` 实现，同步方法则通过 `ACC_SYNCHRONIZED` 标志实现。

`synchronized` 本质上解决的是多个线程并发访问共享资源时，保证同一时刻只有符合条件的线程进入临界区，并建立必要的内存可见性和 happens-before 关系。

#### 常见写法

`synchronized` 有三种常见写法。

**第一种，修饰实例方法**：

```java
public synchronized void method() {
    // 临界区
}
```

等价于：

```java
public void method() {
    synchronized (this) {
        // 临界区
    }
}
```

锁的是 `当前对象 this`，所以如果两个线程操作的是不同实例：

```java
A a1 = new A();
A a2 = new A();
```

分别调用：

```java
a1.method();
a2.method();
```

它们锁的不是同一个对象，因此可以并发执行。

**第二种，修饰静态方法**：

```java
public static synchronized void method() { ... }
```

锁的是 `当前类对应的 Class 对象`，也就是类似：

```java
synchronized (A.class) { ... }
```

所以静态同步方法属于“类级别锁”。

**第三种，同步代码块**：

```java
synchronized (lock) {
    // 临界区
}
```

锁的是 lock 对象对应的 Monitor，这种方式最灵活，因为可以精确控制临界区范围。比如：

```java
public void method() {
    // 不需要同步的逻辑
    doSomething();

    synchronized (lock) {
        // 真正访问共享资源的部分
        count++;
    }

    // 不需要同步的逻辑
}
```

通常比直接：

```java
public synchronized void method() { ... }
```

锁粒度更小。

#### synchronized 锁的是什么？

不是“锁代码”。而是锁对象对应的 Monitor。例如：

```java
Object lock = new Object();

synchronized (lock) { ... }
```

可以抽象为：

```
Java 对象 lock
      |
      v
   Monitor
```

多个线程执行 `synchronized (lock)`，本质是在竞争同一个 Monitor。如果线程 A 已经持有 Monitor，线程 B 再来尝试获取 Monitor 就会失败，然后线程 B 进入 `BLOCKED` 状态。

当线程 A 退出 `synchronized (lock) { ... }` 同步块，就会释放 Monitor，然后其他线程重新竞争。

再看一个经典例子：

```java
class Counter {
    private int count = 0;
    public synchronized void increment() {
        count++;
    }
}
```

`count++;` 不是原子操作，大致可以拆成：

```
读取 count
   ↓
+1
   ↓
写回 count
```

如果不加锁：

```
线程 A：读 10
线程 B：读 10

线程 A：写 11
线程 B：写 11
```

最终 `count` 是 11，而不是 12。使用 `synchronized` 之后：

```
线程 A -> 获取锁 -> 读取 10 -> 计算 11 -> 写入 11 -> 释放锁
线程 B -> 获取锁 -> 读取 11 -> 计算 12 -> 写入 12 -> 释放锁
```

这样就保证了**原子性**。

这里要区分一个概念：`synchronized` 并不是让 `count++` 本身变成 CPU 原子指令。而是通过互斥，让整个临界区在逻辑上表现为原子操作。也就是说，互斥是同一时刻只有一个线程执行临界区，临界区整体具备原子性。

第二个能力是**可见性**。

假设线程 A 修改共享变量：

```java
synchronized (lock) {
    value = 100;
}
```

线程 B：

```java
synchronized (lock) {
    System.out.println(value);
}
```

根据 Java 内存模型，对一个 Monitor 的 unlock happens-before 后续对同一个 Monitor 的 lock。可以简化记成：

```
线程 A：
修改数据
  ↓
释放 synchronized 锁
  ↓
        happens-before
  ↓
线程 B：
获取同一把锁
  ↓
看到 A 之前的修改
```

所以 `synchronized` 不仅仅是互斥锁，还具备内存语义。这也是为什么通常说：`synchronized` 是 `原子性`+`可见性`+`一定程度上的有序性保证`。

> 这里的“有序性”更准确地说，是它通过 happens-before 规则和临界区边界限制编译器/JVM/CPU 的重排序，使同步前后的内存操作对正确同步的线程表现出预期顺序。
>
> 但注意：`synchronized` 并不是让所有机器指令完全禁止重排序。JVM 仍然可以进行不影响单线程语义和 happens-before 语义的优化。

接下来讲一个非常重要的特性：**可重入性**。

`synchronized` 是可重入锁。比如：

```java
public synchronized void methodA() {
    methodB();
}

public synchronized void methodB() {
    System.out.println("B");
}
```

`methodA()` 锁的是 `this`，`methodB()` 也锁的是 `this`。如果 `synchronized` 不可重入：

```
线程获取 this
   ↓
进入 methodA
   ↓
调用 methodB
   ↓
再次申请 this
   ↓
自己等自己
```

那就死锁了。但 Java 支持同一个线程已经持有某个 Monitor 时，再次请求同一个 Monitor。所以 `methodA()` 中可以继续调用加锁了的 `methodB()`。

可重入通常可以抽象成：

```
Monitor
   |
   ├── owner：当前持有线程
   |
   └── entry count：重入次数
```

例如：

```
第一次进入 count = 1
再次进入 count = 2
退出 methodB count = 1
退出 methodA count = 0
释放锁
```

所以 `synchronized` 是可重入互斥锁。

总结，`synchronized` 锁的是 lock 对象对应的 Monitor，`synchronized` 具有原子性、可见性、可重入性。

### Lock

#### ReentrantLock

#### ReentrantReadWriteLock

#### Condition

### AQS

#### state

#### CAS

> CAS 是 Compare And Swap，是一种基于乐观锁思想的原子操作。它包含当前值、期望值和新值三个参数，只有当前值与期望值相同时才把它更新成新值，否则更新失败并通常通过自旋重新尝试。CAS 的比较和交换由 JVM 和 CPU 的原子指令保证，因此可以在不使用传统互斥锁的情况下完成一些线程安全的状态更新。Java 的 AtomicInteger、ConcurrentHashMap、AQS 等都大量使用 CAS。它的主要问题是高竞争时自旋会消耗 CPU，以及可能出现 ABA 问题，ABA 可以通过版本号或 AtomicStampedReference 解决。

CAS 是 Compare And Swap（比较并交换），也叫 Compare And Set。它是一种典型的无锁并发原语，Java 中大量用于实现原子类、并发容器、AQS 等机制。

核心思想一句话：修改变量之前，先判断它的值是不是我之前看到的那个值；如果是，就更新，如果不是，说明被其他线程改过，本次更新失败。

比如现在有一个共享变量：

```java
int value = 10;
```

线程 A 想把它修改成 `11`。CAS 操作逻辑上可以表示成：

```java
CAS(value, 10, 11);
```

这里有三个值：

```text
V：当前内存中的值
A：Expected Value，期望值
B：New Value，要修改成的新值
```

CAS 做的事情就是：

```text
if (V == A) {
    V = B;
    return true;
} else {
    return false;
}
```

也就是：

```text
当前值 == 期望值？
├── 是 → 更新成新值，成功
└── 否 → 不修改，失败
```

关键在于“比较 + 修改”这两个动作由 CPU 保证是一个原子操作。因此不会发生比较完之后、修改之前，被另一个线程插进来的问题。

举一个并发场景。假设：`value = 10`，线程 A 和线程 B 都读到了 `10`，然后都准备执行 `value++`。如果不用同步机制：

```text
线程 A：读取 10
线程 B：读取 10

线程 A：计算 11
线程 B：计算 11

线程 A：写入 11
线程 B：写入 11
```

最后 `value = 11`，但正确应该是 `12`，这就是典型的并发丢失更新问题。

使用 CAS：

```text
线程 A：CAS(value, 10, 11)
线程 B：CAS(value, 10, 11)
```

假设 A 先成功，`value` 从 10 变为 11，然后 B 再执行：

```text
当前 value = 11
期望 value = 10
```

发现 `11 != 10`，所以 B 的 CAS 失败。

B 重新读取 `value = 11`，重新计算得到 `12`，再执行：

```java
CAS(value, 11, 12);
```

这次成功。最终 `value = 12`。

所以完整过程可以理解成：

```text
读取旧值
↓
计算新值
↓
CAS
│
├── 成功 → 结束
│
└── 失败
     ↓
   重新读取
     ↓
   重新计算
     ↓
   再 CAS
```

这种不断重试的过程，就是：CAS + 自旋。

Java 中最典型的 CAS 应用就是 `AtomicInteger`。例如：

```java
AtomicInteger count = new AtomicInteger(0);
count.incrementAndGet();
```

多个线程同时执行 `count.incrementAndGet();` 仍然能够保证原子性。它的逻辑可以简化理解成：

```java
int oldValue;
int newValue;

do {
    oldValue = get();
    newValue = oldValue + 1;
} while (!compareAndSet(oldValue, newValue));

return newValue;
```

比如：

```text
oldValue = 10
newValue = 11
```

然后：

```java
compareAndSet(10, 11);
```

如果失败，则重新读、重新算、重新 CAS，直到成功。

**为什么 CAS 比 `synchronized` 看起来更“轻”？**

传统锁的思路：

```text
线程 A
↓
拿锁
↓
修改
↓
释放锁

线程 B
↓
拿不到锁
↓
阻塞 / 等待
```

CAS 的思路：

```text
线程 A
↓
尝试修改
↓
成功


线程 B
↓
尝试修改
↓
失败
↓
重新尝试
```

因此 CAS 通常属于乐观锁思想。

它假设大多数情况下不会发生冲突，我先直接尝试修改；真的冲突了再重试。

而 `synchronized`、`ReentrantLock` 更接近悲观锁：我认为可能发生冲突，所以修改之前先把资源锁住。

可以这样理解：

```text
悲观锁：
先锁，再干活

乐观锁 / CAS：
先干，提交的时候检查有没有冲突
```

**CAS 为什么是原子的？**

这一点非常关键。如果 CAS 只是 Java 代码：

```java
if (value == expected) {
    value = newValue;
}
```

那它本身并不安全。因为可能发生：

```text
线程 A：
value == expected    // true

        ↓ 此时切走

线程 B：
修改 value

        ↓

线程 A：
value = newValue
```

还是有并发问题。真正的 CAS 最终依赖 CPU 提供的原子指令。Java 在底层通过 JVM 对应的原子操作实现，例如现代 JDK 中会涉及 `VarHandle`、JVM intrinsic 等机制，最终映射到底层 CPU 的原子指令。所以 CAS 的原子性最终是由硬件支持的。

CAS 有三个非常重要的问题。

第一，CAS 自旋可能浪费 CPU。

比如竞争非常激烈：

```text
100 个线程
↓
同时 CAS 一个变量
```

可能出现：

```text
线程 A 成功

线程 B 失败 → 重试
线程 C 失败 → 重试
线程 D 失败 → 重试
...
```

大量线程不停：

```text
读取
计算
CAS
失败
重试
```

它们不会阻塞睡眠，而是在 CPU 上不断运行。

所以 CAS 在低竞争场景性能很好，但高竞争场景可能因为大量自旋消耗 CPU。

这也是为什么不存在 CAS 永远比锁快。竞争激烈时，阻塞式锁反而可能更加合理。

------

第二，CAS 通常只能方便地保证单个共享状态的原子更新。

例如：

```java
AtomicInteger count;
```

很好处理。

但如果一个业务操作需要同时保证：

```text
balance
+
status
+
version
```

三个变量一起修改：

```text
要么全部成功
要么全部失败
```

单个 CAS 就比较难处理。

通常可以：

- 把多个状态封装到一个不可变对象里，然后 CAS 整个引用；
- 使用锁；
- 使用更高层的并发结构。

所以 CAS 特别适合单一状态或可封装成一个状态的原子更新。

------

第三，也是最高频的：ABA 问题。

假设一个变量初始：

```text
A
```

线程 1 读取：

```text
A
```

然后线程 1 暂停。

线程 2：

```text
A
↓
B
↓
A
```

最后又变回了 A。

线程 1 恢复后执行 CAS：

```text
期望值 = A
当前值 = A
```

发现：

```text
A == A
```

于是 CAS 成功。

但是线程 1 不知道：这个 A 已经不是“原来的那个状态过程”了，中间曾经被改成过 B。

这就是 ABA：

```text
A
↓
B
↓
A
```

CAS 只检查当前值是不是 A？却不知道它中间有没有发生过变化？

------

解决 ABA 的经典办法是：给数据增加版本号。

例如一开始：

```text
A, version=1
```

线程 2：

```text
A,1
↓
B,2
↓
A,3
```

虽然值重新变成 A，但是版本已经：

```text
1 → 3
```

线程 1 原本期望：

```text
A,1
```

现在看到：

```text
A,3
```

于是 CAS 失败。

Java 中有 `AtomicStampedReference` 就是这种思想。

例如：

```java
AtomicStampedReference<String> ref =
        new AtomicStampedReference<>("A", 1);
```

同时维护：

```text
引用值
+
版本戳 stamp
```

从而解决 ABA。

------

这和你前面问过的 MySQL 乐观锁其实非常像。

例如数据库：

```sql
UPDATE products
SET stock = stock - 1,
    version = version + 1
WHERE id = 1
  AND version = #{oldVersion};
```

逻辑就是：

```text
CAS：

当前值 == 期望值？
→ 才更新


数据库 version 乐观锁：

当前 version == 我之前读取的 version？
→ 才 UPDATE
```

本质思想高度相似：更新之前验证“这个状态有没有被别人修改过”。

------

再回到刚才讲的 `ConcurrentHashMap`。

假设：

```text
table[5] == null
```

线程 A 想插入 NodeA，线程 B 想插入 NodeB。

如果普通：

```java
table[5] = node;
```

可能相互覆盖。

ConcurrentHashMap 可以通过 CAS 表达：

```text
CAS(
    table[5],
    null,
    NodeA
)
```

意思是：只有 table[5] 仍然是 null，我才把 NodeA 放进去。

如果另一个线程抢先放进去了：

```text
table[5] != null
```

CAS 就失败，然后线程重新走后续逻辑。

所以我们之前说：

```text
ConcurrentHashMap put

桶为空
→ CAS

桶不为空
→ synchronized
```

现在就能理解为什么空桶适合 CAS 了：

```text
只是把：

null
↓
Node

这样一个简单状态进行原子替换
```

不需要直接上锁。

------

最后把 CAS 记成：

```text
CAS(V, A, B)

V = 当前值
A = 期望值
B = 新值

      V == A ?
      /      \
    是        否
    ↓         ↓
 V = B      更新失败
 成功         ↓
             重试
```

它的优缺点可以总结为：

| 方面           | CAS                                  |
| -------------- | ------------------------------------ |
| 思想           | 乐观并发控制                         |
| 核心操作       | 比较 + 交换                          |
| 原子性         | CPU/JVM 底层保证                     |
| 是否需要互斥锁 | 通常不需要                           |
| 冲突处理       | 失败后自旋重试                       |
| 优点           | 低竞争下开销小                       |
| 缺点           | 高竞争下自旋耗 CPU                   |
| 经典问题       | ABA                                  |
| ABA 解决       | 版本号 / `AtomicStampedReference`    |
| Java 应用      | Atomic 类、ConcurrentHashMap、AQS 等 |



#### CLH 队列

#### acquire/release

## ThreadLocal

````
ThreadLocal 属于高频题，要搞清楚：

```
Thread
↓
ThreadLocalMap
↓
Entry
↓
key = WeakReference<ThreadLocal>
value = Object
```

以及：

> 为什么 ThreadLocal 会导致内存泄漏？
````



## 并发工具类

```
java.util.concurrent
│
├── 线程同步工具
│   ├── CountDownLatch
│   ├── CyclicBarrier
│   ├── Semaphore
│   ├── Exchanger
│   └── Phaser
│
├── 锁
│   ├── Lock
│   ├── ReentrantLock
│   ├── ReadWriteLock
│   ├── ReentrantReadWriteLock
│   ├── StampedLock
│   └── Condition
│
├── 原子类
│   ├── AtomicInteger
│   ├── AtomicLong
│   ├── AtomicReference
│   ├── LongAdder
│   └── ...
│
├── 并发容器
│   ├── ConcurrentHashMap
│   ├── CopyOnWriteArrayList
│   ├── BlockingQueue
│   └── ...
│
└── 线程池
    ├── Executor
    ├── ExecutorService
    ├── ThreadPoolExecutor
    └── ScheduledThreadPoolExecutor
```

### 线程同步工具

这类工具专门用于解决多线程之间的协调与通信问题，是日常开发中的高频考点和实用工具：

- **CountDownLatch（倒计时门闩）**：允许一个或多个线程等待其他线程完成一系列操作后才继续执行。它是一次性的，常用于分布式系统中等待多个服务初始化完成，或并发测试中等待所有子任务结束。
- **CyclicBarrier（循环屏障）**：让一组线程互相等待，直到所有线程都到达某个屏障点（Barrier）时，才能一起继续执行。与 CountDownLatch 不同，它是可重用的，适用于多阶段数据处理（如 ETL 流程）或图形渲染中的分块处理。
- **Semaphore（信号量）**：本质上是一个计数器，用于控制同时访问特定资源的线程数量。常见应用场景包括数据库连接池管理、API 接口限流控制等。
- **Exchanger（数据交换器）**：专门用于实现两个线程之间的数据交换，适用于流水线作业中的数据交接或加密解密过程中的密钥交换。

#### CountDownLatch



#### CyclicBarrier

#### Semaphore

### 锁机制

JUC 提供了比 `synchronized` 更精细、更灵活的显式锁控制体系（底层大多基于 AQS 框架实现）：

- **ReentrantLock（可重入锁）**：支持公平锁/非公平锁切换、可中断锁获取、超时等待等特性，适用于需要响应中断的长时间任务或公平调度场景。
- **ReadWriteLock（读写锁）**：通过读写分离提升并发度。读锁可被多个线程共享，写锁独占，非常适合缓存系统等读多写少的场景。
- **StampedLock（邮戳锁）**：在 Java 8 引入，支持乐观读模式，在读多写少场景下性能优于 ReadWriteLock，但需注意其不可重入的特性。

#### ReentrantLock

#### ReadWriteLock





### 原子操作类

基于 CAS（Compare-And-Swap）硬件级指令实现的无锁编程利器，性能远超传统的锁机制：

- **基本类型原子类**：如 `AtomicInteger`、`AtomicLong`、`AtomicBoolean`，提供线程安全的自增、自减、比较并交换等操作，适用于高并发计数器、状态标志等。
- **引用与数组类型**：如 `AtomicReference`、`AtomicIntegerArray`，用于对象或数组的原子更新。
- **解决 ABA 问题**：`AtomicStampedReference` 通过引入版本号，解决了 CAS 操作中值被修改回原值导致的逻辑漏洞。
- **高并发累加器**：Java 8 引入的 `LongAdder`，在极高并发下比 `AtomicLong` 具有更好的吞吐量。

#### AtomicInteger

#### AtomicLong



### 异步计算

用于处理耗时任务，避免阻塞主线程：

- **Future / FutureTask**：表示一个异步计算的结果，可以通过它来检查计算是否完成、获取结果或取消任务。
- **CompletableFuture**：扩展了 Future 接口，支持链式调用、组合多个异步操作、异常处理等，是实现响应式编程的强大工具。

#### Future

#### CompletableFuture



### 并发容器

#### ConcurrentHashMap

#### CopyOnWriteArrayList

#### BlockingQueue



## 线程池

Java 线程池（ThreadPool）是 Java 并发编程中管理线程的核心组件。它的核心思想是通过“池化资源管理”来预先创建并复用一组线程，从而避免频繁创建和销毁线程带来的高昂开销，同时限制最大并发数以防止系统资源耗尽。

**为什么要使用线程池？**

如果每来一个请求就：

```java
new Thread(() -> {
    doTask();
}).start();
```

会有以下问题：

- 线程创建和销毁有成本。

  线程需要自己的：

  ```
  虚拟机栈
  程序计数器
  本地方法栈
  操作系统线程资源
  ```

  频繁创建和销毁线程会产生额外开销。

- 线程数量不可控。

  例如突然来了 100000 个请求，如果给每个请求都创建一个线程的话，那么就需要大量线程，而线程太多会造成：

  ```
  内存消耗增加
  上下文切换频繁
  CPU 调度压力增加
  甚至 OOM
  ```

  线程池则可以只用 20 工作线程来处理请求，其余的请求排队等待执行，从而把并发度控制在合理范围。

### ThreadPoolExecutor

Java 线程池主要位于 `java.util.concurrent`，也就是 JUC。

核心体系：

```
Executor
   ↑
ExecutorService
   ↑
AbstractExecutorService
   ↑
ThreadPoolExecutor
```

最顶层：

```java
public interface Executor {
    void execute(Runnable command);
}
```

只定义了一件事情是提交任务，例如：

```java
executor.execute(task);
```

真正最核心的线程池实现是 `ThreadPoolExecutor`，学习 Java 线程池，重点基本就是理解这个类。

#### 核心参数

```java
public ThreadPoolExecutor(
        int corePoolSize,
        int maximumPoolSize,
        long keepAliveTime,
        TimeUnit unit,
        BlockingQueue<Runnable> workQueue,
        ThreadFactory threadFactory,
        RejectedExecutionHandler handler
)
```

1. `corePoolSize` 核心线程数

   表示线程池长期保留的核心线程数量。即使这些线程空闲也不会被回收，除非设置了 `allowCoreThreadTimeOut`。

   > 核心线程数的设置？
   >
   > 对于 CPU 密集型：
   >
   > 例如：大量计算、加解密、图像处理、压缩、算法计算等。线程基本一直占用 CPU，通常线程数不宜太大。
   >
   > 设置为 `CPU 核数` 或者 `CPU 核数 + 1` 即可。
   >
   > 对于 IO 密集型：
   >
   > 例如：数据库访问、RPC、HTTP 调用、磁盘 IO 等。线程经常处于等待，CPU 大部分时间其实空着，比如总执行时间 100ms，其中 CPU 计算 10ms，等待 IO 90ms。因此可以增加线程数。
   >
   > 设置为 `线程数 ≈ CPU 核数 × (1 + 等待时间 / 计算时间)`。但是估算，实际生产环境应结合CPU 利用率、响应时间、吞吐量、数据库连接池线程数、下游承载能力、压测结果来综合考虑调整。

2. `maximumPoolSize` 最大线程数

   线程池允许创建的最大线程数量。

3. `keepAliveTime` 空闲存活时间

   当线程数大于核心线程数时，非核心线程空闲多长时间后被销毁。

4. `unit` 时间单元

   `keepAliveTime` 的时间单位（如秒、毫秒）。

5. `workQueue` 任务队列

   用于缓存等待执行任务的阻塞队列（如 `ArrayBlockingQueue`、`LinkedBlockingQueue`、`SynchronousQueue`）。当核心线程都在忙时，新来的任务不会马上创建非核心线程，而是先进入阻塞队列。

   > 为什么不是先增加线程处理请求，而是要进入队列排队？
   >
   > 因为线程的创建是有代价的，每创建一个线程起码占用 1MB 栈空间，操作系统还要维护线程上下文、调度开销等。如果任务突然来一波就疯狂创建线程，系统资源很快就会耗尽，CPU 光切换上下文都忙不过来了。
   >
   > 而队列的作用就是削峰填谷，任务暂时堆在队列里，让现有线程慢慢消化。如果队列都塞满了说明真扛不住了，这时候再增加线程。

6. `threadFactory` 线程工厂

   用于创建新线程的工厂，通常用于给线程自定义名字（例如：`order-worker`），方便排查问题。

   > 之所以让自定义线程名是因为默认线程名通常是 `pool-7-thread-13`，在线上排产问题是不容易直接看出是什么业务。

7. `handler` 拒绝策略

   当线程数和队列都达到上限时，对新提交任务的处理策略。

   四种拒绝策略：

   - AbortPolicy（默认）：直接抛出 `RejectedExecutionException` 异常，阻止系统正常工作。
   - CallerRunsPolicy：由提交该任务的线程（调用者线程）自己执行该任务，起到一种反压（限流）的效果。
   - DiscardPolicy：直接静默丢弃新提交的任务，不抛出任何异常。
   - DiscardOldestPolicy：丢弃队列中最旧（等待时间最长）的任务，然后尝试重新提交当前新任务。

#### 工作流程

整个流程可以记成：

```
提交任务
   ↓
当前线程数 < corePoolSize？
   │
   ├── 是 → 创建核心线程执行
   │
   └── 否
         ↓
    workQueue 能否入队？
         │
         ├── 能 → 进入队列
         │
         └── 不能
               ↓
       当前线程数 < maximumPoolSize？
               │
               ├── 是 → 创建非核心线程执行
               │
               └── 否 → 拒绝策略
```

#### execute() 和 submit() 的区别

线程池提交任务有两个常见方法：`execute()` 和 `submit()`。

`execute()`：

```java
executor.execute(() -> {
    doTask();
});
```

只能提交 `Runnable`，没有返回值，执行时抛异常会直接打印堆栈。

`submit()`：

```java
Future<Integer> future = executor.submit(() -> {
    return 100;
});
```

可以提交 `Runnable` 或 `Callable`，然后返回一个 `Future` 对象可以获取执行结果或异常信息。

还有一个很重要的异常处理区别。

如果：

```java
execute(() -> {
    throw new RuntimeException("error");
});
```

异常可以传播到工作线程的未捕获异常处理流程。

而：

```java
Future<?> future = submit(() -> {
    throw new RuntimeException("error");
});
```

异常通常被包装进 `Future`，需要调用 `future.get();` 时才会以 `ExecutionException` 表现出来。

因此使用 `submit()` 后如果完全不处理 Future，很容易把任务异常“藏起来”。

#### 线程池状态

`ThreadPoolExecutor` 内部有几个重要状态：

```
RUNNING 正常运行：接收新任务，处理队列任务
SHUTDOWN 调用 shutdown() 后进入该状态：不接新任务，但继续处理已有任务
STOP 调用 shutdownNow() 后进入该状态：不接收新任务，不再处理队列任务，尝试中断正在执行的线程
TIDYING 所有任务终止，workerCount 为 0，准备调用 terminated() 钩子方法
TERMINATED terminated() 执行完毕，线程池彻底终止
```

#### shutdown() 和 shutdownNow()

这两种方法都是关闭线程池的方法，核心区别在于对待已提交任务的态度。

`executor.shutdown()`：线程池进入 `SHUTDOWN` 状态，不再接受新任务，但队列中排队的任务和正在执行的任务都会跑完后，才会真正终止线程池。

`executor.shutdownNow()` ：线程池进入 `STOP` 状态，不接受新任务，尝试中断正在执行任务的线程，将尚未执行的队列任务返回。

注意：`shutdownNow()` 也不能保证真的“强制杀死”线程。因为 Java 的中断本身是协作式中断，如果任务代码完全忽略 `Thread.interrupted()`，或者没有响应中断，任务仍可能继续执行。

对于正常退出，用 `shutdown()`；紧急情况退出，用 `shutdownNow()`。

#### 为什么不建议使用 Executors 工具类创建线程池？

JDK 的 `Executors` 虽然提供了一些快速创建线程池的 API，例如：

```java
Executors.newFixedThreadPool(10); // 固定线程数
Executors.newSingleThreadExecutor(); // 单线程池
Executors.newCachedThreadPool(); // 缓存线程池
Executors.newScheduledThreadPool(5); // 定时任务线程池
```

虽然用起来方便，但生产环境中通常推荐：显式使用 `ThreadPoolExecutor`，明确设置线程数、队列容量、线程工厂和拒绝策略。

那么为什么不建议使用 Executors 工具类呢？

比如：

```java
Executors.newFixedThreadPool(10);
```

内部使用的任务队列类似 `LinkedBlockingQueue`，容量非常大。

如果任务生产速度持续高于消费速度，就会导致队列不断增加，占用大量堆内存，可能出现 OOM。

而 `Executors.newCachedThreadPool();` 其最大线程数非常大，并且搭配 `SynchronousQueue`，任务一多，就可能疯狂创建线程，最终可能导致线程过多、上下文切换严重、内存耗尽。

所以生产环境一般更希望，所有关键参数都明确可控。

#### 完整的线程池示例

```java
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class ThreadPoolDemo {
    public static void main(String[] args) {
        AtomicInteger index = new AtomicInteger();

        ThreadFactory threadFactory = task -> {
            Thread thread = new Thread(task);
            thread.setName("order-worker-" + index.incrementAndGet());
            return thread;
        };

        ThreadPoolExecutor executor =
                new ThreadPoolExecutor(
                        4,
                        8,
                        60,
                        TimeUnit.SECONDS,
                        new ArrayBlockingQueue<>(100),
                        threadFactory,
                        new ThreadPoolExecutor.CallerRunsPolicy()
                );

        try {
            for (int i = 0; i < 1000; i++) {
                int taskId = i;
                executor.execute(() -> {
                    System.out.println(Thread.currentThread().getName() + " execute task " + taskId);
                });
            }
        } finally {
            executor.shutdown();
        }
    }
}
```

这就是生产代码比较应该有的思路：

```
核心线程数
最大线程数
队列容量
线程名称
拒绝策略
关闭线程池
```

都明确指定。

### 总结

本质上线程池是在平衡工作线程、请求的大量任务和等待队列。也就是：

```
                   大量任务
                      ↓
                 ThreadPool
                /           \
               ↓             ↓
         工作线程          等待队列
```

如果线程太少，CPU / IO 资源没有充分利用，任务等待时间增加。

线程太多，上下文切换增加，内存消耗增加，下游压力增加。

队列太小：容易触发拒绝；队列太大：任务积压严重，响应时间越来越长，甚至 OOM。

所以线程池调优本质上不是“线程越多越快”，而是在吞吐量、延迟、资源占用和系统稳定性之间做平衡。

