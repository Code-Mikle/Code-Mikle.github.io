---
title: Spring 八股文
---

# Spring 的 DI 和 IoC 是什么？

Spring 中，DI 和 IoC 描述的是同一套机制的两个角度。

>IoC：对象不再自己控制依赖对象的创建；
>
>DI：Spring 将创建好的依赖对象注入进来。

## IoC（控制反转，Inversion of Control）

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

### Spring 的 IoC 容器

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

## DI（依赖注入，Dependence Injection）

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

### Spring 依赖注入的方式？

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



### Spring 循环依赖是什么？

Spring 在创建 BeanA 的时候，BeanA 依赖 BeanB 的创建，BeanB 同时又依赖 BeanA 的创建。从而导致 Spring 在初始化时无法决定应该先创建哪一个，从而引发死循环。

#### Spring 解决循环依赖的方法？



# Bean 生命周期

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





