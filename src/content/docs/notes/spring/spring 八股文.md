---
title: Spring 八股文
---

## Spring 的启动过程？

通常说“Spring 的启动过程”，实际项目里一般指 **Spring Boot 启动 + Spring IoC 容器初始化**。

整体流程可以概括为：

```
执行 main()
   ↓
SpringApplication.run()
   ↓
准备环境和配置
   ↓
创建 ApplicationContext
   ↓
扫描并注册 BeanDefinition
   ↓
执行 refresh() 刷新容器
   ↓
创建并初始化所有非懒加载单例 Bean
   ↓
启动 Web 服务器
   ↓
执行 Runner
   ↓
应用启动完成
```

1. 执行启动类

   ```java
   @SpringBootApplication
   public class Application {
   
       public static void main(String[] args) {
           SpringApplication.run(Application.class, args);
       }
   }
   ```

   程序从 `main()` 方法进入，调用 `SpringApplication.run()`。

   `@SpringBootApplication` 主要包含：

   ```
   @SpringBootConfiguration：当前类是配置类
   @EnableAutoConfiguration：启用自动配置
   @ComponentScan：扫描当前包及其子包
   ```

2. 准备运行环境

   Spring Boot 会读取和整合各种配置，例如：

   ```
   application.yml
   application.properties
   系统环境变量
   JVM 参数
   命令行参数
   Profile 配置
   ```

   这些配置最终被放入 Spring 的 `Environment` 中。

   Spring Boot 还会判断应用类型：

   ```
   存在 Spring MVC：Servlet Web 应用
   存在 WebFlux：响应式 Web 应用
   都不存在：普通非 Web 应用
   ```

   然后创建对应的 `ApplicationContext`。

3. 创建并准备 Spring 容器

   Web MVC 项目通常创建：

   ```
   AnnotationConfigServletWebServerApplicationContext
   ```

   普通项目通常创建：

   ```
   AnnotationConfigApplicationContext
   ```

   此时只是创建了容器对象，绝大多数业务 Bean 还没有真正实例化。

   随后，Spring 会加载启动类和配置类，并解析：

   ```
   @Component
   @Service
   @Repository
   @Controller
   @Configuration
   @Bean
   @Import
   自动配置类
   ```

   将这些类转换成 `BeanDefinition`，注册到 `BeanFactory` 中。

   此时保存的是 Bean 的“创建说明书”，不是最终 Bean 对象。

4. 执行核心的 `refresh()`

   Spring 容器真正的初始化核心是：

   ```
   applicationContext.refresh();
   ```

   `refresh()` 的主要流程如下。Spring Framework 的源码顺序包括准备上下文、获取 `BeanFactory`、执行后置处理器、初始化事件系统、创建非懒加载单例 Bean，最后完成刷新。

   1. 准备 BeanFactory

      Spring 创建或刷新内部的 `BeanFactory`，并注册一些基础组件，例如：

      ```
      Environment
      ApplicationContext
      资源解析器
      类型转换器
      Aware 接口处理器
      ```

      `BeanFactory` 是后续创建和管理 Bean 的核心工厂。

   2. 执行 BeanFactoryPostProcessor

      ```
      BeanFactoryPostProcessor
      ```

      处理的是 `BeanDefinition`，此时普通 Bean 通常还没有创建。

      这一阶段会完成很多重要工作，例如：

      - 解析 `@Configuration`
      - 执行组件扫描
      - 处理 `@Bean`
      - 处理 `@Import`
      - 处理 Spring Boot 自动配置
      - 解析 `${}` 配置占位符
      - 注册更多 BeanDefinition

      也就是说，这一阶段主要是在补充和修改 Bean 的“创建说明书”。官方文档明确说明，`BeanFactoryPostProcessor` 在普通 Bean 实例化前处理 Bean 配置元数据。

   3. 注册 BeanPostProfessor

      接下来注册：

      ```
      BeanPostProcessor
      ```

      它处理的是之后创建出来的 Bean 实例。

      很多 Spring 功能都依赖它，例如：

      ```
      @Autowired 依赖注入
      @PostConstruct 初始化
      AOP 代理
      @Transactional
      @Async
      ```

      `BeanPostProcessor` 必须提前创建和注册，才能参与后续普通 Bean 的初始化过程。

   4. 初始化事件等基础组件

      Spring 会初始化：

      ```
      MessageSource：国际化
      ApplicationEventMulticaster：事件发布
      ApplicationListener：事件监听器
      LifecycleProcessor：生命周期组件
      ```

      这样容器后续就能发布和监听各种启动事件。

   5. 创建 Web 服务器

      对于 Spring Boot Web 项目，容器刷新期间会创建并启动嵌入式 Web 服务器，例如：

      ```
      Tomcat
      Jetty
      Undertow
      ```

      同时准备 Spring MVC 相关组件，例如：

      ```
      DispatcherServlet
      HandlerMapping
      HandlerAdapter
      HttpMessageConverter
      ```

      Web 服务器准备完成后，会发布相应的 `WebServerInitializedEvent`。

   6. 创建非懒加载的单例 Bean

      Spring 开始实例化剩余的非懒加载单例 Bean：

      ```
      实例化 Bean
         ↓
      依赖注入
         ↓
      执行 Aware 接口
         ↓
      BeanPostProcessor 初始化前处理
         ↓
      执行 @PostConstruct 等初始化方法
         ↓
      BeanPostProcessor 初始化后处理
         ↓
      必要时创建 AOP 代理
         ↓
      放入单例池
      ```

      这就是前面讨论过的 Bean 生命周期。

      默认情况下，非懒加载单例 Bean 会在容器启动期间创建；标记为懒加载的 Bean 通常等第一次使用时再创建。

5. 完成容器刷新

   所有核心 Bean 创建完成后，Spring 执行：

   ```
   finishRefresh();
   ```

   并发布：

   ```
   ContextRefreshedEvent
   ```

   到这一步，Spring `ApplicationContext` 已经初始化完成。

6. 执行 Runner

   Spring Boot 会执行实现了以下接口的 Bean：

   ```
   ApplicationRunner
   CommandLineRunner
   ```

   例如：

   ```
   @Component
   public class InitRunner implements CommandLineRunner {
   
       @Override
       public void run(String... args) {
           System.out.println("应用启动后执行");
       }
   }
   ```

   它们适合执行启动完成后的初始化任务。所有 Runner 执行完成后，Spring Boot 会发布 `ApplicationReadyEvent`，表示应用已经可以正常接收流量。

总结就是：

Spring Boot 从 `SpringApplication.run()` 开始，先读取配置并创建 `ApplicationContext`，然后扫描配置类、组件和自动配置类，将它们注册为 `BeanDefinition`。接着调用 `refresh()` 刷新容器，先执行 `BeanFactoryPostProcessor` 完善 BeanDefinition，再注册 `BeanPostProcessor`，然后创建 Web 服务器并实例化所有非懒加载单例 Bean，完成依赖注入、初始化和 AOP 代理。最后发布容器刷新事件，执行 `ApplicationRunner` 和 `CommandLineRunner`，应用启动完成。

## Spring 的 DI 和 IoC 是什么？

Spring 中，DI 和 IoC 描述的是同一套机制的两个角度。

>IoC：对象不再自己控制依赖对象的创建；
>
>DI：Spring 将创建好的依赖对象注入进来。

### IoC（控制反转，Inversion of Control）

核心就是，对象的创建和依赖关系由容器管理，而不是代码里自己 new。

在传统 Java 代码中，一个类需要另一个对象时，往往是由自己创建：

```java
public class OrderService {

    private PaymentService paymentService =
            new WechatPaymentService();
}
```

这里，`OrderService` 自己决定：

- 创建哪些类
- 什么时候创建
- 对象如何初始化
- 对象的生命周期

也就是说，对对象的控制权在自己手里。

使用 Spring 后，业务类不再主动创建依赖对象，而是由 Spring 容器负责创建和管理：

```java
@Service
public class OrderService {

    private final PaymentService paymentService;

    public OrderService(PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}
```

对象控制权从业务代码转移到了 Spring 容器，这就是**控制反转**。

#### Spring 的 IoC 容器

Spring 中负责创建和管理对象的核心组件叫 IoC 容器。

两种主要的 IoC 容器：

| 特性     | BeanFactory              | ApplicationContext                     |
| -------- | ------------------------ | -------------------------------------- |
| 加载方式 | 懒加载，getBean 时才创建 | 预加载，启动时创建所有单例             |
| 功能     | 基础 IoC 能力            | 增加事件发布、国际化、AOP 代理         |
| 启动速度 | 快                       | 慢一些，但能提前暴露配置问题           |
| 适用场景 | 资源受限环境             | 生产环境标配（实际开发中通常使用这个） |

Spring 容器主要负责：

- 创建、保存 Bean（Bean 就是被 Spring 创建和管理的对象，即类的实例化对象）
- 注入 Bean 之间的依赖
- 管理 Bean 生命周期
- 处理 Bean 的初始化和销毁
- 处理作用域，如单例、原型
- 处理代理、事务、AOP 等功能

### DI（依赖注入，Dependence Injection）

DI 是 Spring 实现 IoC 的主要方式。

所谓依赖，是指一个对象运行时需要使用的其他对象。例如：

```java
public class OrderService {

    private PaymentService paymentService;
}
```

`OrderService` 依赖 `PaymentService`。

所谓注入，是指 Spring 将这个依赖对象传递给 `OrderService`。

总之，IoC 是一种设计思想，DI 是实现这种思想的具体手段。

**使用 IoC 和 DI 的优势：**

- 降低了类之间的耦合度
- 提高代码的复用性和可维护性
- 便于单元测试：比如说要测试 `OrderService`，直接传入一个 Mock `PaymentService` 对象，这样就不需要调用真实的接口了，比较便捷。
- 集中化的配置和管理
- 便于集成事务、AOP、缓存等 Spring 功能

#### Spring 依赖注入的方式？

最为主要的就是 构造器注入、Setter 注入、字段注入，分别如下：

1. 构造器注入（官方推荐）

   通过类构造函数传入依赖。

   ```java
   @Service
   public class UserService {
   
       private final UserRepository userRepository;
   
   	@Autowired
       public UserService(UserRepository userRepository) {
           this.userRepository = userRepository;
       }
   }
   ```

   如果只有一个构造函数，同上可以省略 `@Autowired` 注解。

   这种方式的优势：

   - 依赖关系明确
   - 可以使用 `final`，一旦初始化就不能被修改
   - 创建对象是必须传入依赖，不容易出现空指针
   - 便于单元测试：不需要依赖 Spring 容器，直接通过 `new` 传入 Mock 对象即可进行测试

   缺点：

   - 当依赖项过多时，构造函数会变得非常臃肿（这通常也暗示了该类职责过重，需要重构）
   - 无法解决构造器注入的循环依赖：因为构造器注入要求在创建对象时依赖就必须准备好，A 依赖 B，B 依赖 A，谁都没法先创建出来

2. Setter 注入

   通过调用类的 Setter 方法注入依赖。

   ```java
   @Service
   public class UserService {
   
       private UserRepository userRepository;
   
       @Autowired
       public void setUserRepository(UserRepository userRepository) {
           this.userRepository = userRepository;
       }
   }
   ```

   优势：

   - 灵活性高：依赖关系可以在 Bean 被创建后的任意时刻被重新注入或修改
   - 能解决循环依赖：借助 Spring 的三级缓存机制
   - 适合可选依赖：如果某个依赖不是必须的，使用 Setter 注入非常合适（如果找不到依赖，该属性就保持为 `null`，不会报错）

   缺点：

   - 无法保证依赖的不可变性（因为没有 `final` 来限制）
   - 无法保证依赖在 Bean 创建后一定被注入（可能存在 null 风险）

3. 字段注入

   直接在成员变量上使用注解 `@Autowired` 或 `@Resource`。

   ```java
   @Service
   public class UserService {
   
       @Autowired // 或 @Resource
       private UserRepository userRepository;
   }
   ```

   但这种方式不推荐用于正式业务代码，原因是：

   - 无法注入 `final` 字段，依赖可以被随意修改
   - 依赖关系不够直观
   - 测试困难，单元测试时通常需要反射或启动 Spring 容器
   - 与 Spring 强耦合，你的类必须依赖 Spring 的注解，无法脱离 Spring 容器独立使用

所以说，没有哪一种注入方式最好，而是要结合具体的业务场景来选择最合适的方式。

#### Spring 循环依赖是什么？

Spring 在创建 BeanA 的时候，BeanA 依赖 BeanB 的创建，BeanB 同时又依赖 BeanA 的创建。从而导致 Spring 在初始化时无法决定应该先创建哪一个，从而引发死循环。

#### 解决循环依赖的方法

对于**单例 Bean 的字段注入或 Setter 注入**，Spring 可以通过“提前暴露未完全初始化的 Bean”解决。

过程如下：

```
1. Spring 开始创建 A。

2. 实例化原始 A，此时 A 的属性还没有注入。

3. 将“获取 A 早期引用的 ObjectFactory”放入三级缓存。

4. A 进行属性注入，发现依赖 B，于是开始创建 B。

5. 实例化原始 B。

6. 将“获取 B 早期引用的 ObjectFactory”放入三级缓存。

7. B 进行属性注入，发现依赖 A。

8. 查找 A：
   一级缓存没有；
   二级缓存没有；
   三级缓存找到 A 的 ObjectFactory。

9. 调用 ObjectFactory 获取 A 的早期引用。
   该引用可能是原始 A，也可能是 A 的早期代理。

10. 将 A 的早期引用放入二级缓存，
    并删除三级缓存中 A 的 ObjectFactory。

11. 将 A 的早期引用注入 B。

12. B 完成初始化和后置处理，
    最终放入一级缓存，并清理 B 的二、三级缓存记录。

13. 回到 A 的创建流程，
    将一级缓存中完整的 B 注入 A。

14. A 完成初始化和后置处理，
    最终引用放入一级缓存，
    并清理 A 的二、三级缓存记录。
```

Spring 内部通常用三个缓存管理单例 Bean：

```
一级缓存 singletonObjects
保存已经完整初始化的、可以直接用的 Bean

二级缓存 earlySingletonObjects
保存提前暴露（即半成品，已经实例化但没填充属性）的 Bean 引用

三级缓存 singletonFactories
保存能够生成早期 Bean 引用的 ObjectFactory（注： Bean 本身，而是一个能够生产 Bean 的工厂）
```

Spring 源码中的 `DefaultSingletonBeanRegistry` 确实维护了这三个 Map，并通过 `singletonFactories` 和 `earlySingletonObjects` 获取正在创建中的单例对象。

简单理解：

```
A 还没完全创建好
    ↓
Spring 先把 A 的“半成品引用”提供给 B
    ↓
B 创建完成
    ↓
再把 B 注入 A
```

注意⚠️⚠️⚠️：对于**构造器循环依赖**无法这样解决。

**实际项目中的解决方法：**

1. 重新设计依赖关系（最推荐）

   通常循环依赖说明两个类职责耦合过紧。可以把公共逻辑提取到第三个 Bean，或者调整成单向依赖，这是最根本的解决方法。

2. 在一侧使用 `@Lazy`

   ```java
   @Service
   public class AService {
   
       private final BService bService;
   
       public AService(@Lazy BService bService) {
           this.bService = bService;
       }
   }
   ```

   Spring 此时注入的不是立即创建好的 `BService`，而是一个延迟解析代理；真正调用时再查找目标 Bean，从而打断创建阶段的循环。

3. 使用 Setter 注入

   ```java
   @Service
   public class AService {
   
       private BService bService;
   
       @Autowired
       public void setBService(BService bService) {
           this.bService = bService;
       }
   }
   ```

   Setter 注入是在对象实例化以后再设置依赖，因此 Spring 才有机会提前暴露对象。Spring 官方文档也将 Setter 注入列为处理循环依赖的一种方式，但不建议为了保留错误设计而大量使用。

> 当前 Spring Boot 的 `spring.main.allow-circular-references` 默认值为 `false`，因此即便是传统上能够通过早期引用处理的循环依赖，Spring Boot 默认也可能直接禁止。可以将其设为 `true` 临时兼容，但不应把它作为长期解决方案。
>
> ```yam
> spring.main.allow-circular-references=true
> ```

所以 Spring 能够解决的循环依赖如下：

| 情况                       | 能否自动解决 |
| -------------------------- | ------------ |
| 单例 Bean + 字段注入       | 通常可以     |
| 单例 Bean + Setter 注入    | 通常可以     |
| 单例 Bean + 构造器相互注入 | 不可以       |
| prototype Bean 循环依赖    | 不可以       |
| 使用 `@Lazy` 打断创建循环  | 可以         |
| 重新设计为单向依赖         | 最推荐       |

**二级缓存已经能够解决问题了，为什么还要引入三级缓存？**

Spring 使用三级缓存，主要是为了在发生循环依赖时，能够延迟决定应该暴露“原始对象”还是“代理对象”。

如果完全不考虑 AOP 代理，只需要把原始对象提前暴露，那么一级缓存 + 二级缓存确实可以解决循环依赖。

不考虑 AOP 时，可以这样处理：

```
1. 实例化原始 A
2. 把原始 A 放入二级缓存
3. A 注入 B，需要创建 B
4. B 注入 A，从二级缓存得到原始 A
5. B 创建完成
6. B 注入 A
7. A 创建完成，放入一级缓存
```

因此，仅从“解决普通对象的循环依赖”这个目标来看，二级缓存确实够了。

问题在于 AOP，假设 A 上有事务：

```java
@Service
public class AService {

    @Transactional
    public void execute() {
    }
}
```

A 最终放入 Spring 容器的可能不是原始对象，而是代理对象：

```
原始 A
   ↓
AOP 处理
   ↓
A 的代理对象
```

如果 Spring直接把原始 A 放到二级缓存：

```
B 中注入的是：原始 A

Spring 容器最终保存的是：A 的代理对象
```

那么系统中就出现了两个不同引用：

```
B.aService             → 原始 A
context.getBean(A.class) → A 的代理对象
```

这样，B 调用 A 的方法时就可能绕过代理，导致：

- `@Transactional` 不生效
- `@Async` 不生效
- 缓存切面不生效
- 自定义 AOP 切面不生效

所以循环依赖时，Spring 不能简单地提前暴露原始对象。

**三级缓存保存的不是缓存而是工厂：**

Spring实例化 A 后，不会马上决定暴露什么，而是放入一个工厂：

```java
addSingletonFactory(
    "aService",
    () -> getEarlyBeanReference(...)
);
```

逻辑相当于：

```java
ObjectFactory<?> factory = () -> {
    // 根据 BeanPostProcessor 决定：
    // 返回原始 A，还是返回 A 的早期代理对象
    return getEarlyBeanReference(a);
};
```

源码中的 `getEarlyBeanReference()` 会调用 `SmartInstantiationAwareBeanPostProcessor`，后置处理器可以在这里返回代理引用。

创建流程变成：

```
1. 实例化原始 A
2. 把“生成 A 早期引用的工厂”放入三级缓存
3. A 开始注入 B
4. 创建 B
5. B 需要 A
6. 从三级缓存调用工厂
7. 工厂判断 A 是否需要代理
8. 得到原始 A 或 A 的代理对象
9. 将结果放入二级缓存
10. 将该引用注入 B
```

如果 A 需要 AOP，B 得到的就是 A 的早期代理对象：

```
B.aService               ┐
                         ├→ 同一个 A 代理对象
Spring 容器最终保存的 A    ┘
```

## Spring Bean

### Bean 生命周期

Spring Bean 的生命周期，是指一个 Bean 从“被 Spring 发现并创建”，到 “初始化完成并投入使用”，再到 “容器关闭时被销毁”的整个过程。

对于常见的单例 Bean，可以概括为：

```
扫描 Bean 定义，注册 BeanDefinition
   ↓
实例化 Bean
   ↓
属性填充、依赖注入
   ↓
执行 Aware 接口
   ↓
BeanPostProcessor 初始化前处理
   ↓
执行初始化方法
   ↓
BeanPostProcessor 初始化后处理
   ↓
Bean 可以使用
   ↓
容器关闭
   ↓
执行销毁方法
```

1. 扫描 Bean 定义，注册 BeanDefinition

   Spring 首先扫描配置，找到需要管理的类，例如：

   ```java
   @Service
   public class UserService {
   }
   ```

   此时 Spring 通常还没有创建 `UserService` 对象，而是先生成一个 `BeanDefinition`。

   `BeanDefinition` 可以理解为 Bean 的“创建说明书”，里面记录：

   - Bean 对应的类
   - Bean 名称
   - Bean 作用域
   - 是否延迟加载
   - 初始化方法
   - 销毁方法
   - 构造参数
   - 依赖关系

   因此：

   ```
   BeanDefinition 不是 Bean 对象
   BeanDefinition 是描述如何创建 Bean 的元数据
   ```

2. 实例化 Bean

   Spring 根据 `BeanDefinition` 创建 Bean 对象。例如：

   ```java
   UserService userService = new UserService();
   ```

   这一步叫实例化。需要注意，实例化只是对象已经被创建出来了，此时对象依赖的其他 Bean 可能还没有完成注入。例如：

   ```java
   @Service
   public class UserService {
   
       @Autowired
       private UserRepository userRepository;
   }
   ```

   刚执行完构造方法时，`userRepository` 在某些注入方式下可能还是 `null`。

   注意⚠️⚠️⚠️：构造器注入则是在创建对象时直接传入依赖。

3. 属性填充和依赖注入

   实例化后，Spring 会给 Bean 注入依赖。

   例如字段注入：

   ```java
   @Autowired
   private UserRepository userRepository;
   ```

   Setter 注入：

   ```java
   @Autowired
   public void setUserRepository(UserRepository userRepository) {
       this.userRepository = userRepository;
   }
   ```

   Spring 会从容器中查找匹配的 `UserRepository` Bean，然后赋值给 `UserService`。

4. 执行 Aware 接口

   如果 Bean 实现了 Spring 提供的某些 `Aware` 接口，Spring 会把容器相关对象传递给 Bean。例如：

   ```java
   @Component
   public class UserService implements BeanNameAware {
   
       @Override
       public void setBeanName(String name) {
           System.out.println("当前 Bean 名称：" + name);
       }
   }
   ```

5. BeanPostProcessor 初始化前处理

   Spring 会调用所有 `BeanPostProcessor` 的 `postProcessBeforeInitialization()` 方法，例如：

   ```java
   @Component
   public class MyBeanPostProcessor
           implements BeanPostProcessor {
   
       @Override
       public Object postProcessBeforeInitialization(
               Object bean,
               String beanName) {
   
           System.out.println(
                   "初始化前：" + beanName
           );
   
           return bean;
       }
   }
   ```

   这个方法会在 Bean 的初始化方法之前执行。

   `BeanPostProcessor` 可以对 Bean 进行统一处理，例如：

   - 检查 Bean
   - 修改 Bean 属性
   - 识别特殊注解
   - 包装 Bean
   - 为 Bean 创建代理对象

   Spring 中很多功能都依赖 Bean 后置处理器完成，例如：

   - `@Autowired`
   - `@PostConstruct`
   - AOP
   - `@Transactional`
   - `@Async`

6. 执行初始化方法

   Spring 支持多种初始化方法。

   常见顺序是：

   ```
   @PostConstruct
       ↓
   InitializingBean.afterPropertiesSet()
       ↓
   自定义 init-method
   ```

   **@PostConstruct**

   最常用的初始化方式：

   ```java
   @Component
   public class UserService {
       
       private final UserRepository userRepository;
   
       public UserService(UserRepository userRepository) {
           this.userRepository = userRepository;
       }
   
       @PostConstruct
       public void init() {
           System.out.println("UserService 初始化");
       }
   }
   ```

   执行 `init()` 时，依赖通常已经完成注入，因此可以使用注入的 Bean。

   **InitializingBean**

   Bean 可以实现 Spring 接口：

   ```java
   @Component
   public class UserService implements InitializingBean {
   
       @Override
       public void afterPropertiesSet() {
           System.out.println("初始化");
       }
   }
   ```

   缺点是业务类依赖 Spring 接口，通常不如 `@PostConstruct` 简洁。

   **自定义初始化方法**

   使用 `@Bean` 指定：

   ```java
   public class UserService {
   
       public void init() {
           System.out.println("自定义初始化");
       }
   }
   @Configuration
   public class AppConfig {
   
       @Bean(initMethod = "init")
       public UserService userService() {
           return new UserService();
       }
   }
   ```

7. BeanPostProcessor 初始化后处理

   初始化完成后，Spring 调用 `postProcessAfterInitialization()` 示例：

   ```java
   @Component
   public class MyBeanPostProcessor
           implements BeanPostProcessor {
   
       @Override
       public Object postProcessAfterInitialization(
               Object bean,
               String beanName) {
   
           System.out.println(
                   "初始化后：" + beanName
           );
   
           return bean;
       }
   }
   ```

   这一步非常重要，因为 Spring 经常在这里生成代理对象。

8. Bean 正常使用

   完成初始化后，Bean 就可以被其他 Bean 注入和调用。

9. 容器关闭，执行销毁方法

   当 Spring 容器关闭时，会执行 Bean 的销毁方法。

   常见执行顺序是：

   ```
   @PreDestroy
       ↓
   DisposableBean.destroy()
       ↓
   自定义 destroy-method
   ```

   **@PreDestroy**

   ```java
   @Component
   public class UserService {
   
       @PreDestroy
       public void destroy() {
           System.out.println("释放资源");
       }
   }
   ```

   通常用于：

   - 关闭线程池
   - 关闭网络连接
   - 关闭文件流
   - 释放缓存
   - 注销监听器
   - 停止后台任务

   **DisposableBean**

   ```java
   @Component
   public class UserService implements DisposableBean {
   
       @Override
       public void destroy() {
           System.out.println("销毁");
       }
   }
   ```

   **自定义销毁方法**

   ```java
   public class UserService {
   
       public void close() {
           System.out.println("关闭资源");
       }
   }
   @Bean(destroyMethod = "close")
   public UserService userService() {
       return new UserService();
   }
   ```

### Spring Bean 的作用域

Spring Bean 的作用域（Scope）决定了：

1. Spring 为一个 Bean 创建多少个实例。
2. Bean 实例能够存活多长时间。
3. 在什么范围内获取到的是同一个 Bean。

最常用的是：

```
singleton：一个 Spring 容器中一个实例，默认作用域  -  适合：无状态的 Bean（如 Service、DAO、工具类）
prototype：每次获取都创建一个新实例  -  适合：有状态的 Bean（如需要存储请求上下文信息的对象）
request：一次 HTTP 请求一个实例  -  适合：存储当前请求的上下文信息（如请求参数封装）
session：一个 HTTP Session 一个实例  -  适合：存储用户登录信息、临时购物车数据等
application：一个 Web 应用一个实例  -  适合：全局应用配置、全局缓存
websocket：一个 WebSocket 会话一个实例  -  适合：WebSocket 通信场景
```

## Spring 的主要模块

Spring 主要由以下模块组成：

1. 核心容器 Core Container
    负责创建和管理 Bean，实现 IoC、DI 和 Bean 生命周期管理。主要包括 `spring-core`、`spring-beans`、`spring-context`。
2. AOP 模块
    负责面向切面编程，把日志、事务、权限校验等公共逻辑统一处理。
3. 数据访问模块
    负责数据库访问和事务管理，包括 JDBC、ORM 和事务支持。主要包括 `spring-jdbc`、`spring-tx`、`spring-orm`。
4. Web 模块
    负责开发 Web 应用和接口。主要包括 Spring MVC、WebFlux 和 WebSocket。
5. 消息模块
    负责消息的发送、接收和处理，常用于 WebSocket、消息队列等场景。
6. 测试模块
    负责测试 Spring 应用，例如加载 Spring 容器、测试 Controller 和事务。

## Spring AOP

Spring AOP（Aspect-Oriented Programming，面向切面编程） 是 Spring 提供的面向切面编程功能，用来把日志、事务、权限校验等“公共逻辑”从业务代码中抽离出来，统一处理。

例如，多个业务方法都需要记录日志：

```java
public void createOrder() {
    System.out.println("开始记录日志");
    // 创建订单
    System.out.println("结束记录日志");
}

public void cancelOrder() {
    System.out.println("开始记录日志");
    // 取消订单
    System.out.println("结束记录日志");
}
```

这种写法会导致公共代码重复，而且业务代码中混入了日志代码。

使用 AOP 后，可以把日志单独写成一个切面：

```java
@Aspect
@Component
public class LogAspect {

    @Before("execution(* com.example.service.*.*(..))")
    public void before() {
        System.out.println("调用业务方法前记录日志");
    }
}
```

业务类只保留自身逻辑：

```java
@Service
public class OrderService {

    public void createOrder() {
        System.out.println("创建订单");
    }

    public void cancelOrder() {
        System.out.println("取消订单");
    }
}
```

当调用这些方法时，Spring 会自动在方法执行前调用日志逻辑。

**Spring AOP 的作用：**

可以简单理解为：

```
不修改业务代码
    ↓
在业务方法执行前后
    ↓
自动添加公共功能
```

常见应用包括：

- 事务管理
- 日志记录
- 权限校验
- 接口耗时统计
- 缓存
- 异常处理
- 重试

例如常用的：

```java
@Transactional
public void createOrder() {
    // 数据库操作
}
```

`@Transactional` 底层就使用了 Spring AOP。Spring 会在方法执行前开启事务，执行成功后提交，发生异常时回滚。

**重要概念：**

- 切面（Aspect）

  公共逻辑所在的类，例如日志切面：

  ```java
  @Aspect
  @Component
  public class LogAspect {
  }
  ```

- 连接点（Join Point）

  可以被增强的位置。

  在 Spring AOP 中，主要就是 Bean 的方法执行。

  例如：

  ```java
  orderService.createOrder();
  ```

  `createOrder()` 的执行就是一个连接点。

- 切入点（PointCut）

  指定哪些方法需要被增强。

  ```java
  execution(* com.example.service.*.*(..))
  ```

  它表示匹配 `service` 包下类的所有方法。

- 通知（Advice）

  表示在目标方法的什么时间执行公共逻辑。

  常见类型：

  ```
  @Before       // 方法执行前
  @After        // 方法执行后
  @AfterReturning // 方法正常返回后
  @AfterThrowing  // 方法抛异常后
  @Around       // 包围整个方法
  ```

  例如：

  ```java
  @Before("execution(* com.example.service.*.*(..))")
  public void before() {
      System.out.println("方法执行前");
  }
  ```

- 目标对象（Target）

  真正执行具体业务逻辑的对象，例如：

  ```java
  OrderService
  ```

**AOP 的实现原理：**

Spring 通常会为目标 Bean 创建一个代理对象。

```
调用者
  ↓
代理对象
  ↓
执行日志、事务等公共逻辑
  ↓
调用真正的业务对象
```

例如：

```java
OrderService orderService = context.getBean(OrderService.class);
```

这里拿到的可能并不是原始 `OrderService`，而是 Spring 创建的代理对象。

代理对象会完成类似逻辑：

```java
public void createOrder() {
    // 开启事务

    target.createOrder();

    // 提交事务
}
```

**AOP 完整示例：**

```java
@Aspect
@Component
public class TimeAspect {

    @Around("execution(* com.example.service.*.*(..))")
    public Object recordTime(ProceedingJoinPoint joinPoint)
            throws Throwable {

        long start = System.currentTimeMillis();

        Object result = joinPoint.proceed();

        long end = System.currentTimeMillis();

        System.out.println(
                joinPoint.getSignature().getName()
                + "耗时：" + (end - start) + "ms"
        );

        return result;
    }
}
```

总结，Spring AOP 就是通过代理对象，在不修改业务代码的情况下，在业务方法执行前后统一加入日志、事务、权限等公共功能。

## Spring MVC

Spring MVC 是 Spring 提供的 Web 开发框架，主要用于接收 HTTP 请求、调用业务逻辑，并返回页面或 JSON 数据。可以简单理解为：

```text
浏览器发送请求
    ↓
Spring MVC 接收请求
    ↓
找到对应的 Controller 方法
    ↓
调用 Service 处理业务
    ↓
返回 JSON 或页面
```

例如：

```java
@RestController
@RequestMapping("/users")
public class UserController {
    @GetMapping("/{id}")
    public User getUser(@PathVariable Long id) {
        return new User(id, "张三");
    }
}
```

访问：`GET /users/1`，Spring MVC 会调用 `getUser()`，并把返回的 `User` 对象转换成 JSON：

```json
{
  "id": 1,
  "name": "张三"
}
```

Spring MVC 的核心组件主要有：

- `DispatcherServlet`：统一接收请求，相当于总控制器。
- `Controller`：处理具体请求。
- `HandlerMapping`：根据请求地址找到对应的 Controller 方法。
- `HandlerAdapter`：负责调用 Controller 方法。
- `ViewResolver`：将返回的视图名称解析成具体页面。
- `HttpMessageConverter`：负责 Java 对象和 JSON 之间的转换。

其中最核心的是 `DispatcherServlet`。

完整流程可以概括为：

```text
客户端请求
    ↓
DispatcherServlet
    ↓
HandlerMapping 找到 Controller
    ↓
HandlerAdapter 调用 Controller
    ↓
Controller 调用 Service
    ↓
返回数据
    ↓
转换成 JSON 或页面
```

常见注解包括：

```java
@Controller
@RestController
@RequestMapping
@GetMapping
@PostMapping
@RequestParam
@PathVariable
@RequestBody
```

总结：Spring MVC 是一个基于 Servlet 的 Web 框架，用于处理 HTTP 请求、调用业务代码，并返回页面或 JSON 数据。

**口述一个请求从进入 Spring MVC 到返回响应的全过程**，可以按以下 8 个步骤来回答：

1. **发起请求**：客户端（浏览器/前端）发送 HTTP 请求后，请求首先到达 Tomcat 这样的 Servlet 容器。Servlet 容器会先执行配置好的 Filter，例如字符编码过滤器、登录认证过滤器等。过滤器执行完成后，请求进入 Spring MVC 的核心组件，被 `DispatcherServlet` 拦截。
2. **查找处理器**：`DispatcherServlet` 调用 `HandlerMapping`（处理器映射器），根据请求的 URL 找到对应的 Controller 方法。
3. **获取适配器**：`DispatcherServlet` 通过 `HandlerAdapter`（处理器适配器）来适配并调用对应的 Controller 方法。
4. **执行拦截器**：执行拦截器（Interceptor）的 `preHandle` 方法，进行权限校验、日志记录等预处理。
5. **执行业务逻辑**：Controller 方法执行，通常会调用 Service 层处理业务，并返回结果（如 `ModelAndView` 或直接返回 JSON 数据）。
6. **解析视图**：如果返回的是视图名称，`DispatcherServlet` 会调用 `ViewResolver`（视图解析器）将其解析为具体的 View 对象（如 JSP、Thymeleaf）。
7. **渲染视图**：View 对象负责将模型数据渲染成最终的 HTML 或 JSON 响应。
8. **返回响应**：`DispatcherServlet` 将最终的响应内容返回给客户端。

## Spring 的事务

Spring 事务，就是由 Spring 帮你统一管理数据库事务，保证一组数据库操作要么全部成功，要么全部失败回滚，从而保证数据的**一致性**和**完整性**。

例如转账：

```java
public void transfer() {
    accountMapper.decreaseBalance(1L, 100);
    accountMapper.increaseBalance(2L, 100);
}
```

这两条操作必须作为一个整体：

```
扣款成功 + 加款成功 → 提交事务
任意一步失败       → 全部回滚
```

使用 Spring 事务：

```java
@Service
public class AccountService {

    @Transactional
    public void transfer() {
        accountMapper.decreaseBalance(1L, 100);
        accountMapper.increaseBalance(2L, 100);
    }
}
```

Spring 会在方法执行前开启事务：

```
开启事务
   ↓
执行 transfer()
   ↓
执行成功：提交事务
出现异常：回滚事务
```

**Spring 事务的本质**

数据库本身提供事务能力，Spring 并不是自己实现数据库事务。

Spring 的作用主要是：

- 帮你开启事务
- 帮你提交事务
- 出现异常时帮你回滚
- 统一管理 JDBC、MyBatis、JPA 等框架的事务
- 减少手写事务代码

传统写法可能是：

```java
connection.setAutoCommit(false);

try {
    // 执行多条 SQL
    connection.commit();
} catch (Exception e) {
    connection.rollback();
}
```

使用 Spring 后，只需要：

```java
@Transactional
public void transfer() {
    // 执行多条 SQL
}
```

**@Transcational 的实现原理**

Spring 事务通常基于 AOP 代理实现。

```
调用者
   ↓
Spring 事务代理
   ↓
开启事务
   ↓
调用真正的业务方法
   ↓
成功则提交，异常则回滚
```

因此，从 Spring 容器中获取的 Service，可能是一个代理对象，而不是原始对象。

**默认回滚规则**

默认情况下：

```
RuntimeException、Error → 回滚
受检异常 Exception      → 默认不回滚
```

例如：

```java
@Transactional
public void transfer() {
    throw new RuntimeException();
}
```

会回滚。

**事务的常见属性**

```java
@Transactional(
    rollbackFor = Exception.class,
    propagation = Propagation.REQUIRED,
    isolation = Isolation.DEFAULT,
    timeout = 30,
    readOnly = false
)
```

常见属性含义：

- `rollbackFor`：指定哪些异常需要回滚
- `propagation`：事务传播行为
- `isolation`：事务隔离级别
- `timeout`：事务超时时间
- `readOnly`：是否为只读事务

其中默认传播行为是：

```java
Propagation.REQUIRED
```

意思是：

```
外部已有事务 → 加入现有事务
外部没有事务 → 创建新事务
```

### 事务的四大特性（ACID）

1. 原子性（Atomicity）：一个事务是一个不可分割的最小执行单位，事务中的操作要么全部成功，要么全部失败回滚。
2. 一致性（Consistency）：事务执行前后，数据的完整性约束保持不变（如转账前后总金额不变）。
3. 隔离性（Isolation）：多个并发事务之间相互隔离，互不干扰。例如两个事务同时修改同一个账户余额，数据库需要避免脏读、不可重复读等问题。
4. 持久性（Durability）：事务一旦提交，对数据库的修改就是永久的。即使数据库随后宕机，已经提交的数据也不应丢失。

### 事务的隔离级别

事务隔离级别用于控制多个事务并发执行时，彼此能看到多少数据变化。

SQL 标准定义了四种隔离级别，隔离程度从低到高如下，并发性能一般从高到低。

| 隔离级别                                      | 脏读 | 不可重复读 | 幻读 | 并发性能 |
| --------------------------------------------- | ---- | ---------- | ---- | -------- |
| 读未提交 `READ UNCOMMITTED`                   | 可能 | 可能       | 可能 | 最高     |
| 读已提交 `READ COMMITTED`（生产环境一般推荐） | 避免 | 可能       | 可能 | 较高     |
| 可重复读 `REPEATABLE READ`                    | 避免 | 避免       | 可能 | 较高     |
| 串行化 `SERIALIZABLE`                         | 避免 | 避免       | 避免 | 最低     |

1. 读未提交

   一个事务可以读取另一个事务还没有提交的数据。

   ```
   事务 A 修改余额为 500，但未提交
   事务 B 读取到余额 500
   事务 A 回滚
   ```

   事务 B 读取到了一个最终不存在的数据，这叫脏读。

   这是隔离级别最低的一种，实际项目中很少使用。

2. 读已提交

   一个事务只能读取其他事务已经提交的数据，可以避免脏读。

   但是同一个事务中，两次查询结果可能不同：

   ```
   事务 A 第一次查询余额：1000
   事务 B 修改余额为 800，并提交
   事务 A 第二次查询余额：800
   ```

   事务 A 两次读取同一行数据，结果不一致，这叫不可重复读。

3. 可重复读

   在同一个事务中，多次读取同一行数据，结果保持一致。

   ```
   事务 A 第一次查询余额：1000
   事务 B 修改余额为 800，并提交
   事务 A 第二次查询仍然是：1000
   ```

   但按照 SQL 标准，可重复读仍然可能产生幻读。

   例如第一次查询：

   ```sql
   SELECT * FROM user WHERE age > 18;
   ```

   返回 10 条记录。

   其他事务插入一条符合条件的记录并提交，当前事务再次查询时，可能出现 11 条记录。这种新增或消失的行称为幻读。

4. 串行化

   隔离级别最高。

   数据库让并发事务尽量按照串行顺序执行：

   ```
   事务 A 执行完成
       ↓
   事务 B 再执行
   ```

   它可以避免脏读、不可重复读和幻读，但可能造成：

   - 大量锁等待
   - 并发性能下降
   - 事务超时
   - 吞吐量降低

   因此一般只在对数据一致性要求极高、并发量较低的场景使用。

### 事务的传播行为

事务传播行为，指的是当一个带事务的方法调用另一个带事务的方法时，内部方法应该加入外部事务、创建新事务，还是不用事务。

Spring 主要有 7 种传播行为。

1. REQUIRED

   默认值，也是最常用的。

   ```java
   @Transactional(propagation = Propagation.REQUIRED)
   ```

   规则：

   ```
   外部有事务：加入外部事务
   外部没事务：创建新事务
   ```

   例如：

   ```java
   @Transactional
   public void createOrder() {
       saveOrder();
       reduceStock();
   }
   @Transactional
   public void reduceStock() {
   }
   ```

   `reduceStock()` 会加入 `createOrder()` 的事务，两者共用一个事务。

   只要其中一个方法失败，整个事务都会回滚。

2. REQUIRES_NEW

   无论外部是否有事务，都创建一个新的独立事务。

   ```java
   @Transactional(propagation = Propagation.REQUIRES_NEW)
   ```

   规则：

   ```
   外部有事务：挂起外部事务，创建新事务
   外部没事务：创建新事务
   ```

   例如：

   ```java
   @Transactional
   public void createOrder() {
       orderMapper.insert();
   
       logService.saveLog();
   
       throw new RuntimeException();
   }
   @Transactional(propagation = Propagation.REQUIRES_NEW)
   public void saveLog() {
       logMapper.insert();
   }
   ```

   执行结果可能是：

   ```
   订单事务回滚
   日志事务已经独立提交，不回滚
   ```

   适合：

   - 操作日志
   - 审计记录
   - 独立通知记录

3. SUPPORTS

   有事务就加入，没有事务就以非事务方式执行。

   ```java
   @Transactional(propagation = Propagation.SUPPORTS)
   ```

   规则：

   ```
   外部有事务：加入事务
   外部没事务：不用事务
   ```

   常用于查询方法。

4. NOT_SUPPORTED

   始终以非事务方式执行。

   ```java
   @Transactional(propagation = Propagation.NOT_SUPPORTED)
   ```

   规则：

   ```
   外部有事务：挂起外部事务
   外部没事务：直接执行
   ```

   适合不希望被长事务影响的操作。

5. MANDATORY

   必须在已有事务中执行。

   ```java
   @Transactional(propagation = Propagation.MANDATORY)
   ```

   规则：

   ```
   外部有事务：加入事务
   外部没事务：直接抛异常
   ```

   适合要求调用方必须先开启事务的方法。

6. NEVER

   禁止在事务中执行。

   ```java
   @Transactional(propagation = Propagation.NEVER)
   ```

   规则：

   ```
   外部有事务：抛异常
   外部没事务：正常执行
   ```

   它和 `MANDATORY` 正好相反。

7. NESTED

   在当前事务中创建一个嵌套事务。

   ```java
   @Transactional(propagation = Propagation.NESTED)
   ```

   外部有事务时，会基于保存点执行：

   ```
   外部事务
       ↓
   创建保存点
       ↓
   执行内部事务
   ```

   内部事务失败时，可以回滚到保存点，而不一定导致整个外部事务回滚。

   ```
   外部事务可以继续执行
   内部事务只回滚自己的部分
   ```

   如果外部事务最终回滚，内部事务也会一起回滚。

   需要底层数据库和事务管理器支持保存点。

> 注意⚠️⚠️⚠️：同一个类内部直接调用事务方法，通常不会经过 Spring 代理，因此传播行为可能不生效。

### 事务不生效的情况

事务失效的情况很多，主要可以分为两类：**事务代理没有生效** 和 **回滚规则没有生效**。

**事务代理没有生效**

Spring 事务的底层是基于 AOP 动态代理实现的。如果代码执行时绕过了代理对象，事务自然无法生效。

1. 同类内部方法调用！！！

   在同一个类中，方法 A（无事务注解）直接调用方法 B（有 `@Transactional` 注解）。

   因为内部调用相当于 `this.B()`，走的是目标对象本身的方法，完全绕过了 Spring 生成的代理对象，导致事务拦截器无法介入。

2. 方法非 public 修饰

   `@Transactional` 注解加在 `private`、`protected` 或包可见的方法上。

   因为 Spring AOP 默认只能拦截 `public` 方法。对于非 public 方法，代理无法生成相应的拦截逻辑，注解会被直接忽略。

3. 方法被 final 或 static 修饰

   事务方法被声明为 `final` 或 `static`。

   因为 Spring 默认使用 CGLIB 生成子类代理，无法重写 `final` 方法；而 JDK 动态代理也无法处理 `static` 方法，导致代理失效。

4. Bean 未被 Spring 容器管理

   类上没有加 `@Service`、`@Component` 等注解，而是通过 `new` 关键字手动创建的对象。

   因为对象不是 Spring 容器管理的 Bean，Spring 根本无法为其生成代理对象。

5. 多线程场景

   在事务方法内部开启子线程执行数据库操作。

   因为 Spring 事务上下文是基于 `ThreadLocal` 绑定的，子线程无法继承父线程的事务上下文，导致子线程中的操作不在事务范围内。

**回滚规则没有生效**

这类情况是代码成功进入了事务，但由于异常处理不当或配置错误，导致事务该回滚时没有回滚。

1. 异常被捕获且未抛出（吞掉异常）！！！

   在事务方法内部使用 `try...catch` 捕获了异常，但只在 `catch` 块中打印了日志，没有将异常重新抛出。

   因为 Spring 事务代理认为方法正常执行完毕，会默认提交事务。

   解决方法在 `catch` 块中手动抛出异常，或者调用 `TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()` 手动标记回滚。

2. 抛出了错误的异常类型！！！

   方法抛出了受检异常（如 `Exception`、`IOException`），但没有配置 `rollbackFor`。

   因为 Spring 事务默认只对 `RuntimeException`（运行时异常）和 `Error` 进行回滚。遇到受检异常时，默认会提交事务。

   解决方法在注解中显式指定回滚异常，如 `@Transactional(rollbackFor = Exception.class)`。

3. 事务传播机制配置错误

   错误地使用了 `Propagation.NOT_SUPPORTED`（以非事务方式执行，挂起当前事务）或 `Propagation.NEVER`（如果存在事务则抛异常）。

   因为这些传播行为本身就排斥事务，导致事务被挂起或直接报错。

4. 数据库引擎本身不支持事务

   MySQL 数据库的表引擎使用的是 `MyISAM`。

   因为 `MyISAM` 引擎本身不具备事务能力，即使代码配置了 `@Transactional` 也无济于事，必须使用 `InnoDB` 引擎。

5. 多数据源下事务管理器配置错误

   项目中配置了多个数据源和多个事务管理器，但业务操作走的是数据源 A，而 `@Transactional` 默认或错误地指定了管理数据源 B 的事务管理器。

   因为事务管理器没有管到真正执行 SQL 的数据库连接，导致事务失效。

### Spring 事务与 Mysql 事务的区别

| 维度     | Spring 事务                     | MySQL 数据库事务                      |
| -------- | ------------------------------- | ------------------------------------- |
| 层级定位 | 应用层（业务逻辑层）            | 数据库引擎层（底层存储）              |
| 实现原理 | 基于 AOP（动态代理） 拦截方法   | 基于 Undo Log、Redo Log、锁机制       |
| 控制方式 | `@Transactional` 注解（声明式） | `BEGIN`、`COMMIT`、`ROLLBACK` SQL语句 |
| 作用范围 | 可跨越多个数据库、消息队列等    | 仅限当前 MySQL 数据库连接             |
| 核心职责 | 负责业务边界和策略编排          | 负责数据持久化和并发控制              |

它们并不是替代关系，而是**管理与被管理、封装与被封装**的关系：

1. **Spring 事务是“指挥官”**：它通过 AOP 代理拦截业务方法，决定事务何时开启、何时提交、何时回滚。它不直接操作数据，而是通过底层的数据库事务来干活。
2. **MySQL 事务是“执行者”**：当 Spring 决定开启事务时，它会调用 MySQL 的驱动，向数据库发送 `BEGIN` 指令。后续所有的 SQL 操作都在 MySQL 引擎内部通过锁、MVCC（多版本并发控制）等机制来保证隔离性和一致性。

## Restful 风格的接口





## Spring 的注解使用指南





## Spring Boot 与 Spring MVC、Spring 的区别与联系？









