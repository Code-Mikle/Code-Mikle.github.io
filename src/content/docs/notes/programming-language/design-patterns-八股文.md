---
title: 设计模式 八股文
---

[工厂方法设计模式](https://refactoringguru.cn/design-patterns/catalog)

## 创建者模式



## 结构型模式

### 门面模式（外观模式）

门面模式（Facade Pattern），也叫外观模式，是一种**结构型设计模式**。

它的核心思想是：为一组复杂的子系统提供一个统一的高层接口，让调用方用更简单的方式访问系统，而不用直接面对内部复杂细节。

**直观理解**

比如你要组装一台电脑才能打游戏，底层可能涉及：

- CPU 启动
- 内存自检
- 硬盘加载
- 显卡初始化
- 操作系统启动

如果让用户自己依次调用：

```java
cpu.start();
memory.check();
disk.load();
gpu.init();
os.boot();
```

那调用方就得知道：

- 系统内部有哪些模块
- 调用顺序是什么
- 哪些步骤不能漏
- 哪些模块彼此有依赖

这很麻烦。

门面模式的做法是：

- 提供一个统一入口，比如 `ComputerFacade`
- 对外只暴露一个简单方法，比如 `start()`
- 内部由门面统一协调各个子系统

这样调用方只需要：

```java
computerFacade.start();
```

它不需要知道里面到底做了多少事。

**结构**

通常有两个核心部分：

1. Facade（门面类）

   对外提供简单接口，封装对子系统的组合调用；

2. SubSystem Classes（子系统类）

   负责真正的业务实现。门面只是“包装和协调”，核心能力仍在子系统中。

**示例**

假设我们做一个“家庭影院”系统。
看电影前，用户其实要操作很多设备：

- 打开投影仪
- 打开音响
- 放下幕布
- 打开播放器
- 开始播放

如果让用户自己调，会很烦。

1. 子系统类

   ```java
   public class Projector {
       public void on() {
           System.out.println("投影仪打开");
       }
   
       public void off() {
           System.out.println("投影仪关闭");
       }
   }
   ```

   ```java
   public class SoundSystem {
       public void on() {
           System.out.println("音响打开");
       }
   
       public void off() {
           System.out.println("音响关闭");
       }
   }
   ```

   ```java
   public class Screen {
       public void down() {
           System.out.println("幕布放下");
       }
   
       public void up() {
           System.out.println("幕布升起");
       }
   }
   ```

   ```java
   public class DVDPlayer {
       public void on() {
           System.out.println("DVD 播放器打开");
       }
   
       public void play() {
           System.out.println("开始播放电影");
       }
   
       public void off() {
           System.out.println("DVD 播放器关闭");
       }
   }
   ```

2. 门面类

   ```java
   public class HomeTheaterFacade {
       private final Projector projector;
       private final SoundSystem soundSystem;
       private final Screen screen;
       private final DVDPlayer dvdPlayer;
   
       public HomeTheaterFacade(Projector projector, SoundSystem soundSystem,
                                Screen screen, DVDPlayer dvdPlayer) {
           this.projector = projector;
           this.soundSystem = soundSystem;
           this.screen = screen;
           this.dvdPlayer = dvdPlayer;
       }
   
       public void watchMovie() {
           System.out.println("准备观影...");
           screen.down();
           projector.on();
           soundSystem.on();
           dvdPlayer.on();
           dvdPlayer.play();
       }
   
       public void endMovie() {
           System.out.println("结束观影...");
           dvdPlayer.off();
           soundSystem.off();
           projector.off();
           screen.up();
       }
   }
   ```

   上述代码中 `private final Projector projector;` 的 final 可以写，也可以不写。需要分情况：

   - 什么时候字段适合写 `final`
     - 如果门面类是这样设计的：
       - 通过构造器注入子系统
       - 生命周期内不打算更换子系统实例
       - 这个依赖是门面稳定组成部分
   - 什么时候字段不一定写 `final`
     - 如果你的门面需要动态替换子系统，比如：
       - 运行时切换不同实现
       - 延迟初始化
       - 支持 setter 注入
       - 某个子系统可能为空，后续再设置

3. 调用

   ```java
   public class Main {
       public static void main(String[] args) {
           Projector projector = new Projector();
           SoundSystem soundSystem = new SoundSystem();
           Screen screen = new Screen();
           DVDPlayer dvdPlayer = new DVDPlayer();
   
           HomeTheaterFacade facade = new HomeTheaterFacade(
                   projector, soundSystem, screen, dvdPlayer
           );
   
           facade.watchMovie();
           System.out.println("----");
           facade.endMovie();
       }
   }
   ```

4. 输出

   ```java
   准备观影...
   幕布放下
   投影仪打开
   音响打开
   DVD 播放器打开
   开始播放电影
   ----
   结束观影...
   DVD 播放器关闭
   音响关闭
   投影仪关闭
   幕布升起
   ```

**优点**

- 简化调用：调用方不需要了解子系统的内部细节和调用顺序；
- 降低耦合：客户端和复杂子系统之间的依赖减少了；
- 提高可读性：高层业务代码会更干净，不会充满对子系统的零散调用；
- 更有利于分层：门面可以作为系统对外的统一入口，便于做模块边界控制。

**缺点**

- 可能变成“万能类”：如果什么逻辑都堆到门面里，门面类会越来越臃肿；
- 不能从根本上消除复杂性：它只是隐藏复杂性，不是消灭复杂性；
- 过度封装会降低灵活度：如果门面接口设计得太死，调用方想做细粒度控制就不方便。

**适用场景**

常见于这些情况：

- 一个功能背后要协调多个类或模块
- 想给旧系统、复杂系统提供一个简单入口
- 希望对外屏蔽内部实现细节
- 做分层架构时，给上层提供统一服务接口

例如：

- 家庭影院一键观影
- 电商下单流程：校验库存、计算价格、创建订单、扣减库存、生成物流单
- 文件转换流程：读取文件、解析内容、转换格式、写出结果
- 系统启动流程：初始化配置、连接数据库、加载缓存、启动服务

**业务场景**

比如电商下单，底层可能有这些服务：

- `InventoryService`：检查库存
- `PaymentService`：完成支付
- `OrderService`：创建订单
- `SmsService`：发送通知

如果没有门面，调用方可能这样写：

```java
inventoryService.check(productId);
paymentService.pay(accountId, amount);
orderService.create(productId, accountId);
smsService.send(phone, "下单成功");
```

如果以后流程变了，调用方也得跟着改。

用了门面模式后：

```java
orderFacade.placeOrder(productId, accountId, amount, phone);
```

调用方只关心“下单”这个动作，不关心底层是怎么协作的。

## 行为型模式

### 策略模式

策略模式（Strategy Pattern）是一种**行为型设计模式**。

它的核心思想是：把一组可互换的算法或行为封装起来，让它们可以在运行时自由切换，而不把大量 `if-else` 写死在业务代码里。

**直观理解**

比如你做一个支付系统：

- 微信支付
- 支付宝支付
- 银行卡支付

如果你直接写：

```java
if (type.equals("wechat")) {
    // 微信支付逻辑
} else if (type.equals("alipay")) {
    // 支付宝逻辑
} else if (type.equals("bank")) {
    // 银行卡逻辑
}
```

问题是：

- 分支越来越多
- 修改一种支付方式容易影响别的逻辑
- 扩展新支付方式要改原有代码

策略模式的做法是：

- 定义一个统一接口，比如 `PayStrategy`
- 每种支付方式各自实现这个接口
- 使用时把具体策略传进去

这样系统只关心“怎么调用”，不关心“具体是哪一种算法”。

**结构**

通常有三个角色：

1. Strategy（策略接口）

   定义所有策略共有的行为。

   ```java
   public interface PayStrategy {
       void pay(int amount);
   }
   ```

2. ConcreteStrategy（具体策略）

   不同算法的具体实现。

   ```java
   public class WechatPay implements PayStrategy {
       public void pay(int amount) {
           System.out.println("使用微信支付：" + amount);
       }
   }
   
   public class AlipayPay implements PayStrategy {
       public void pay(int amount) {
           System.out.println("使用支付宝支付：" + amount);
       }
   }
   ```

3. Context（上下文）

   持有一个策略对象，真正使用策略完成业务。

   ```java
   public class PaymentContext {
       private PayStrategy strategy;
   
       public PaymentContext(PayStrategy strategy) {
           this.strategy = strategy;
       }
   
       public void executePay(int amount) {
           strategy.pay(amount);
       }
   }
   ```

   调用：

   ```java
   public class Main {
       public static void main(String[] args) {
           PayStrategy strategy = new WechatPay();
           PaymentContext context = new PaymentContext(strategy);
           context.executePay(100);
       }
   }
   ```

**优点**

- 消除了大量的条件分支：避免复杂的 `if-else` 或 `switch`；
- 符合开闭原则：增加新策略时，通常不用修改原有代码，只需新增一个实现类；
- 更容易测试和维护：每个策略独立，职责清晰；
- 支持运行时切换：同一套业务流程可以根据场景替换不同算法。

**缺点**

- 类会变多：每个策略都要单独写个类；
- 客户端需要知道有哪些策略：调用方往往要决定用哪个策略；
- 简单场景可能过度设计：如果只有两三个非常稳定的分支，直接 `if-else` 可能更简单。

**适用场景**

- 支付方式选择
- 日志输出方式
- 优惠计算规则
- 不同角色的行为差异
- 表单校验规则
- 路由/推荐/定价等算法切换

### 模板方法模式

模板方法模式（Template Method Pattern）是一种**行为型设计模式**。

它的核心思想是：在父类中定义一个算法的执行骨架，把某些具体步骤延迟到子类实现。这样可以在不改变整体流程的前提下，让子类定制其中部分行为。

**直观理解**

比如你做一个“制作饮品”的系统：

- 泡茶
- 泡咖啡

它们的流程很像：

1. 烧水
2. 冲泡
3. 倒入杯中
4. 加调料

但“冲泡”和“加调料”不一样：

- 茶：浸泡茶叶、加柠檬
- 咖啡：冲咖啡粉、加糖和牛奶

如果你分别写两套完整流程，会有很多重复代码。
模板方法模式的做法是：

- 在父类里把“固定流程”写好
- 把“可变步骤”留给子类实现

这样系统只关心“流程顺序”，而子类决定“某一步具体怎么做”。

**结构**

通常有两个核心角色：

1. AbstractClass（抽象类）

   定义算法骨架，也就是模板方法。

   其中：

   - 某些步骤由父类直接实现
   - 某些步骤声明为抽象方法，由子类实现
   - 某些步骤可以提供默认实现，子类按需覆盖

2. ConcreteClass（具体子类）

   实现抽象步骤，补齐具体细节。

**示例**

1. 抽象父类，定义模板方法

   ```java
   public abstract class Beverage {
   
       // 模板方法：定义算法骨架
       public final void prepareRecipe() {
           boilWater();
           brew();
           pourInCup();
           addCondiments();
       }
   
       // 公共步骤：父类直接实现
       private void boilWater() {
           System.out.println("烧水");
       }
   
       private void pourInCup() {
           System.out.println("倒入杯中");
       }
   
       // 可变步骤：交给子类实现
       protected abstract void brew();
   
       protected abstract void addCondiments();
   }
   ```

2. 具体子类：泡茶

   ```java
   public class Tea extends Beverage {
   
       @Override
       protected void brew() {
           System.out.println("用热水浸泡茶叶");
       }
   
       @Override
       protected void addCondiments() {
           System.out.println("加入柠檬");
       }
   }
   ```

3. 具体子类：泡咖啡

   ```java
   public class Coffee extends Beverage {
   
       @Override
       protected void brew() {
           System.out.println("用热水冲泡咖啡粉");
       }
   
       @Override
       protected void addCondiments() {
           System.out.println("加入糖和牛奶");
       }
   }
   ```

4. 调用

   ```java
   public class Main {
       public static void main(String[] args) {
           Beverage tea = new Tea();
           tea.prepareRecipe();
   
           System.out.println("----");
   
           Beverage coffee = new Coffee();
           coffee.prepareRecipe();
       }
   }
   ```

5. 输出效果

   ```
   烧水
   用热水浸泡茶叶
   倒入杯中
   加入柠檬
   ----
   烧水
   用热水冲泡咖啡粉
   倒入杯中
   加入糖和牛奶
   ```

**优点**

- 复用公共流程：把通用步骤提取到父类，避免重复代码；
- 统一流程控制：关键流程顺序由父类掌控，子类不能随意打乱；
- 符合开闭原则：新增一种具体实现时，通常只需要新增子类；
- 便于约束扩展点：哪些步骤能改，哪些步骤不能改父类能够明确规定。

**缺点**

- 依赖继承：模板方法模式主要基于继承，不如组合灵活；
- 子类数量可能增多：每种变体通常都要一个子类；
- 修改骨架可能影响所有子类：父类模板一旦变化，所有子类都受影响；
- 继承层次深时可读性会下降：流程在父类，细节在子类，层次复杂时不容易追踪。

**适用场景**

常见于这些情况：

- 多个子类有相同的处理流程，但某些步骤不同
- 想把公共逻辑抽到父类统一维护
- 想限制子类只能改某些步骤，不能改整体流程
- 框架设计中，父类定义生命周期，子类实现钩子步骤

例如：

- 导出文件流程：打开文件、写内容、关闭文件
- 爬虫流程：发请求、解析数据、持久化
- Web 请求处理流程：鉴权、执行业务、记录日志
- 游戏角色行动流程：准备、执行动作、结算结果

**模板方法中的“钩子方法”**

模板方法模式里经常还有一个概念：**钩子方法（Hook Method）**。

意思是：

- 父类给一个默认实现，通常什么都不做，或者返回一个默认值
- 子类可以选择性覆盖
- 用来影响模板流程中的某些分支

例如：

```java
public abstract class Beverage {

    public final void prepareRecipe() {
        boilWater();
        brew();
        pourInCup();
        if (customerWantsCondiments()) {
            addCondiments();
        }
    }

    private void boilWater() {
        System.out.println("烧水");
    }

    private void pourInCup() {
        System.out.println("倒入杯中");
    }

    protected abstract void brew();

    protected abstract void addCondiments();

    // 钩子方法：默认加调料
    protected boolean customerWantsCondiments() {
        return true;
    }
}
```

子类可以覆盖它：

```java
public class PlainTea extends Beverage {

    @Override
    protected void brew() {
        System.out.println("用热水浸泡茶叶");
    }

    @Override
    protected void addCondiments() {
        System.out.println("不加任何调料");
    }

    @Override
    protected boolean customerWantsCondiments() {
        return false;
    }
}
```

这样就能在不改模板骨架的情况下，灵活控制流程分支。

