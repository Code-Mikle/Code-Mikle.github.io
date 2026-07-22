---
title: MyBatis 八股文
---

## MyBatis 的常见注解

`@MapperScan` 用于指定 MyBatis Mapper 接口所在的包。

```java
@SpringBootApplication
@MapperScan("com.example.mapper")
public class Application {...}
```

例如：

```
public interface UserMapper {
    User selectById(Long id);
}
```

MyBatis 会扫描指定包下的 Mapper 接口，创建代理对象并注册到 Spring 容器，之后就可以直接注入：

```
@Service
public class UserService {

    private final UserMapper userMapper;

    public UserService(UserMapper userMapper) {
        this.userMapper = userMapper;
    }
}
```

使用 `@MapperScan` 后，通常不需要在每个 Mapper 接口上再写 `@Mapper`

`@TableName` 该注解是 MyBatis Plus 中用于指定实体类与数据库表之间映射关系的注解，通过在实体类上使用此注解，可以明确指出该实体类对应的数据库表名，从而避免了手动编写 SQL 语句的麻烦。

```java
@TableName(value ="user")
public class User implements Serializable {
       ......
}
```

`@TableId` 该注解是 MyBatis-Plus 框架中用于标识数据库表主键字段的注解

```java
@TableId(type = IdType.AUTO)
private long id;
```

数据库中的对应的表中的对应字段，也要设置为自增，以 MySQL 为例。

```mysql
id BIGINT PRIMARY KEY AUTO_INCREMENT
```

`@TableLogic` 该注解是 MyBatis-Plus 框架中用于标记逻辑删除字段的。还有一种方式就是直接在配置文件中设置。

```java
@TableLogic
private Integer isDelete;
```

### MyBatis-Flex 注解

`@Id` 它告诉框架，当前字段的 ID 不需要手动赋值，也不需要数据库自增，而是由框架在插入数据前，利用雪花算法自动生成一个全局唯一的 Long 型 ID。

```java
@Id(keyType = KeyType.Generator, value = KeyGenerators.snowFlakeId)
```

为什么使用雪花算法

- 分布式系统：在微服务架构中，多个服务实例可能同时插入数据，数据库自增 ID 会冲突。
- 避免暴露业务信息：自增 ID 容易被猜测（如 /user/1, /user/2），雪花 ID 是无序的，更安全。

