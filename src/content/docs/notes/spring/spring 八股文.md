---
title: Spring 八股文
---

## Spring 依赖注入是什么？



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
   - 创建对象是必须传入以来，不容易出现空指针
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



## Spring 循环依赖是什么？

Spring 在创建 BeanA 的时候，BeanA 依赖 BeanB 的创建，BeanB 同时又依赖 BeanA 的创建。从而导致 Spring 在初始化时无法决定应该先创建哪一个，从而引发死循环。

### Spring 解决循环依赖的方法？









