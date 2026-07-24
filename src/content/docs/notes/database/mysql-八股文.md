---
title: MySQL 数据库
sidebar:
  order: 5
---

## 数据库三大范式

数据库三大范式是关系型数据库表设计的三条规范，主要目的是：减少数据冗余，避免插入异常、更新异常和删除异常，提高数据一致性。

三大范式具有递进关系：

```
第一范式 1NF：列不可再分
    ↓
第二范式 2NF：消除非主属性对主键的部分依赖
    ↓
第三范式 3NF：消除非主属性对主键的传递依赖
```

满足第三范式的表，一定满足第二范式和第一范式。在理解三大范式前，需要先理解两个概念：

```
主属性：属于某个候选键的字段
非主属性：不属于任何候选键的字段
```

日常学习中，可以暂时把“候选键”理解为能够唯一确定一条记录的最小字段组合。

1. 第一范式 1NF（First Normal Form）

   每个字段必须是原子的，不能再拆分。比如下述“用户表”就是一个反例：

   | user_id | name | phone                   |
   | ------- | ---- | ----------------------- |
   | 1       | 张三 | 13800000001,13900000002 |

   `phone` 字段中存储了两个手机号：`13800000001,13900000002`。这会导致查询、修改和约束都比较困难。例如查询手机号为 `13900000002` 的用户时，只能进行字符串匹配：

   ```sql
   SELECT * FROM user WHERE phone LIKE '%13900000002%';
   ```

   为了让上述示例满足第一范式，需要将其拆分为如下两个表：

   用户表：

   | user_id | name |
   | ------- | ---- |
   | 1       | 张三 |

   手机号表：

   | id   | user_id | phone       |
   | ---- | ------- | ----------- |
   | 1    | 1       | 13800000001 |
   | 2    | 1       | 13900000002 |

   这样每个字段只保存一个值。需要注意，“不可再分”取决于具体业务。例如地址：`北京市朝阳区某某街道`。如果业务只需要把地址作为一个整体展示，它可以视为原子值；如果业务需要根据省、市、区查询，就应该拆成：

   ```
   province
   city
   district
   detail_address
   ```

   所以第一范式并不是要求所有字符串都必须拆到最细，而是：在当前业务语义下，一个字段只表达一个属性值。

2. 第二范式 2N（Second Normal Form）

   在 1NF 基础上，非主键字段必须完全依赖主键，不能只依赖联合主键的一部分。

   这主要针对联合主键的场景，比如订单明细表用 [订单ID + 商品ID] 做联合索引，如果把 订单时间 也放进来就违反了 2NF，因为订单时间只依赖订单ID。

   下述是一个示例，假设有一张学生选课表-student_course，这张表的联合主键是 `(student_id, course_id)`：

   | student_id | course_id | student_name | course_name | score |
   | ---------- | --------- | ------------ | ----------- | ----- |
   | 1          | 101       | 张三         | MySQL       | 90    |
   | 1          | 102       | 张三         | Java        | 85    |
   | 2          | 101       | 李四         | MySQL       | 88    |

   字段之间的依赖关系是：

   ```
   (student_id, course_id) → score   # score 依赖整个联合主键
   student_id → student_name   # student_name 只依赖 student_id
   course_id → course_name   # course_name 只依赖 course_id
   ```

   所以 `student_name` 和 `course_name` 对联合主键存在部分依赖，不满足第二范式。

   目前存在的问题是：

   - 数据冗余：张三选择了多少门课程，`student_name` 就会重复存储多少次。
   - 更新异常：张三改名时，需要修改多行。
   - 插入异常：还没有学生选课时，可能无法单独录入课程信息。
   - 删除异常：如果删除最后一条 MySQL 选课记录，课程名称等课程信息也会同时丢失。

   因此，应该将目前的 学生选课表-student_course 拆分为如下三个表：

   学生表-student：

   | student_id | student_name |
   | ---------- | ------------ |
   | 1          | 张三         |
   | 2          | 李四         |

   课程表-course：

   | course_id | course_name |
   | --------- | ----------- |
   | 101       | MySQL       |
   | 102       | Java        |

   选课表-student_course：

   | student_id | course_id | score |
   | ---------- | --------- | ----- |
   | 1          | 101       | 90    |
   | 1          | 102       | 85    |
   | 2          | 101       | 88    |

   现在：

   ```
   student_id → student_name
   course_id → course_name
   (student_id, course_id) → score
   ```

   每个非主属性都完全依赖所在表的候选键，因此满足第二范式。

3. 第三范式 3NF（Third Normal Form）

   在 2NF 基础上，非主键字段之间不能有依赖关系。比如员工表里存了部门ID和部门名称，部门名称依赖部门ID而不是员工ID，这就是传递依赖，应该把部分名称拆到部门表里。

   示例如下，下述是一个员工表-employee，主键是 employee_id：

   | employee_id | employee_name | department_id | department_name |
   | ----------- | ------------- | ------------- | --------------- |
   | 1           | 张三          | 10            | 技术部          |
   | 2           | 李四          | 10            | 技术部          |
   | 3           | 王五          | 20            | 财务部          |

   依赖关系为：

   ```
   employee_id → department_id   # department_id 依赖 employee_id
   department_id → department_name   # department_name 依赖 department_id
   ```

   所以可以得到：

   ```
   employee_id → department_id → department_name
   ```

   `department_name` 并不是直接依赖 `employee_id`，而是通过 `department_id` 间接依赖 `employee_id`。这叫传递依赖，因此不满足第三范式。

   存在的问题如下：

   - 数据冗余：技术部有多少员工，技术部这个名称就重复存储多少次。
   - 更新异常：技术部改名时，需要修改所有技术部员工的数据。
   - 插入异常：如果一个部门暂时没有员工，就无法在员工表中保存这个部门。
   - 删除异常：如果删除某个部门的最后一名员工，部门信息也会丢失。

   因此，将目前 员工表-employee 拆分为如下两个表：

   员工表-employee：

   | employee_id | employee_name | department_id |
   | ----------- | ------------- | ------------- |
   | 1           | 张三          | 10            |
   | 2           | 李四          | 10            |
   | 3           | 王五          | 20            |

   部门表-deparment：

   | department_id | department_name |
   | ------------- | --------------- |
   | 10            | 技术部          |
   | 20            | 财务部          |

   现在依赖关系变成：

   ```
   employee_id → employee_name, department_id
   department_id → department_name
   ```

   每个非主属性都直接依赖自己所在表的主键，满足第三范式。

### 反范式

实际项目中不一定严格满足三大范式的设计要求。范式化能够减少冗余、提高一致性，但也会增加表的数量和关联查询。例如订单明细表-order_item中，经常会保存商品购买时的名称和价格：

| order_id | product_id | product_name | purchase_price |
| -------- | ---------- | ------------ | -------------- |
| 1001     | 2001       | MySQL 实战   | 69.00          |

从严格范式角度看，`product_name` 可以通过 `product_id` 查询商品表，不一定需要重复存储。但订单通常需要保留购买当时的商品快照。即使商品后来改名、改价，历史订单也不能跟着改变。因此保存：`product_name` 和 `purchase_price` 是合理的业务冗余。

## MySQL 的索引

MySQL 的索引，可以理解为数据库为表中数据建立的一种“快速查找结构”。

没有索引时，MySQL 查询数据通常需要从第一行开始逐行扫描，这叫全表扫描。建立索引后，MySQL 可以通过索引快速定位到目标记录，类似于通过书的目录直接找到某一页，而不是从头翻到尾。

例如有一张用户表：

```sql
CREATE TABLE user (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    phone VARCHAR(20)
);
```

查询手机号：

```sql
SELECT * FROM user WHERE phone = '13800138000';
```

如果 `phone` 没有索引，MySQL 可能需要检查表中的每一行。如果给 `phone` 建立索引：

```sql
CREATE INDEX idx_phone ON user(phone);
```

MySQL 就可以先通过 `idx_phone` 找到对应记录的位置，再读取完整数据。

**索引的本质**

索引本质上是一种额外维护的数据结构，其中保存了：`索引列的值 + 对应数据记录的位置`。例如：

```
13800138000 -> 第 100 行数据
13900139000 -> 第 253 行数据
```

实际的 InnoDB 索引并不是简单的数组，而主要使用 B+ 树组织。

**为什么 MySQL 采用 B+ 树？**

InnoDB 的普通索引通常采用 B+ 树，主要因为：

1. B+ 树是多叉树，树的高度较低。
2. 一次磁盘页读取可以加载很多索引项。
3. 查询一条数据通常只需要较少的磁盘 I/O。
4. 叶子节点有序并相互连接，适合范围查询。
5. 支持排序、分组、最大值、最小值等操作。

例如：

```sql
SELECT * FROM user WHERE age BETWEEN 20 AND 30;
```

找到 `age = 20` 的位置后，可以沿着叶子节点顺序读取到 `age = 30`，不需要重新搜索每一个值。

B+ 树可以简单理解为：

```
                  [20 | 40]
                 /    |    \
            <20     20~40    >40
```

真正的数据或索引记录主要存储在叶子节点中。

**索引能够加速哪些操作的效率？**

索引主要能够提高以下操作的性能：

```sql
WHERE 条件查询
JOIN 关联查询
ORDER BY 排序
GROUP BY 分组
MIN()、MAX() 查询
```

例如：

```sql
SELECT * FROM user WHERE phone = ?;

SELECT *
FROM orders o
JOIN user u ON o.user_id = u.id;

SELECT * FROM user ORDER BY age;
```

在索引设计合理的情况下，可以减少扫描的数据量，甚至避免额外排序。

**索引的优缺点**

| 优点                                   | 缺点                                                         |
| -------------------------------------- | ------------------------------------------------------------ |
| 极大加快查询速度（最主要的作用）       | 占用额外的磁盘空间（索引文件本身要存数据）                   |
| 加速排序和分组（ORDER BY, GROUP BY）   | 降低写入速度（每次增删改数据，都要同时更新索引，相当于既要改正文又要改目录） |
| 强制唯一性（唯一索引可以防止重复数据） | 维护成本（如果索引建得太多或太乱，优化器可能会选错索引，反而变慢） |

### 索引的分类

MySQL 索引可以从 5 个维度来分类。

> 面试时一般先从数据结构角度切入，重点讲 B+ 树索引，然后再展开聊聚簇索引和非聚簇索引的区别。

#### 按数据结构或访问方法

1. B+ 树索引

   最常用的，InnoDB 和 MyISAM 默认都用它。多层平衡树结构，叶子节点用链表串起来，既能快速定位单条记录，又能高效做范围扫描。以下索引默认通常都是 B+ 树：

   ```sql
   PRIMARY KEY (id)
   UNIQUE KEY uk_phone (phone)
   KEY idx_name (name)
   KEY idx_name_age (name, age)
   ```

   B+ 树适合：等值查询、范围查询、排序、分组、最左前缀匹配。例如：

   ```sql
   SELECT * FROM user WHERE age BETWEEN 20 AND 30;
   ```

2. Hash 索引

   哈希索引通过哈希函数直接算出数据位置，适合等值查询 O(1) 级别：

   ```sql
   WHERE id = 100
   ```

   但不适合范围查询和排序：

   ```sql
   WHERE id > 100 ORDER BY id
   ```

   需要注意：

   - MEMORY 存储引擎支持显式 Hash 索引。
   - InnoDB 不支持用户显式创建普通 Hash 索引。
   - InnoDB 内部存在自适应哈希索引，即 Adaptive Hash Index，但它由 MySQL 自动维护，不是用户创建的普通索引。

3. 全文索引

   全文索引不是简单按照完整字符串排序，而是将文本分词后建立类似“倒排索引”的结构。

   ```sql
   CREATE FULLTEXT INDEX idx_content ON article(content);
   ```

   查询：

   ```sql
   SELECT * FROM article WHERE MATCH(content) AGAINST('MySQL 索引');
   ```

   适合大段文本中的关键词搜索。

4. 空间索引

   空间索引用于处理空间数据类型，例如：`POINT`、`LINESTRING`、`POLYGON`。通常使用适合多维空间检索的数据结构，例如 R-tree。

   ```sql
   CREATE SPATIAL INDEX idx_location ON store(location);
   ```

#### 按 InnoDB 存储组织方式

这个维度关注的是：

> 索引叶子节点中到底存储什么。

1. 聚簇索引

   InnoDB 的聚簇索引叶子节点存储完整的数据行，即 `主键值 → 完整行数据`。例如：

   ```sql
   CREATE TABLE user (
       id BIGINT PRIMARY KEY,
       name VARCHAR(50)
   );
   ```

   `id` 对应的主键索引就是聚簇索引。InnoDB 一张表只能有一个聚簇索引，因为表中的数据行只能按照一种索引结构进行物理组织。InnoDB 选择聚簇索引的规则大致是：

   - 优先使用主键。

   - 没有主键时，选择第一个非空唯一索引。

   - 两者都没有时，生成隐藏的行 ID。

2. 二级索引

   除聚簇索引之外的普通 B+ 树索引，在 InnoDB 中通常称为二级索引或辅助索引。

   二级索引叶子节点存储：`索引列值 → 主键值`（意思是存储的是 索引列值 到 主键值 的映射，根据索引列值拿到主键值后，再用主键值去聚簇索引里查一遍。）。例如：

   ```sql
   CREATE INDEX idx_name ON user(name);
   ```

   索引叶子节点大致是：`name + id`。执行：

   ```sql
   SELECT * FROM user WHERE name = 'Tom';
   ```

   查询过程通常是：`二级索引 idx_name` → `找到主键 id` → `聚簇索引` → `获得完整数据行`， 这个过程就是回表。

#### 按约束性质

> 这个维度关注索引是否对数据施加唯一性约束。

1. 主键索引（Primary Key）：在 InnoDB 中，主键索引也叫聚簇索引。

   ```sql
   PRIMARY KEY (id)
   ```

   具有的特点：唯一、非空、一张表只能有一个主键、在 InnoDB 中通常也是聚簇索引。

2. 唯一索引（Unique Index）

   ```sql
   UNIQUE KEY uk_phone (phone)
   ```

   要求非 `NULL` 索引值不能重复。它与主键索引的主要区别是：

   - 一张表可以有多个唯一索引。
   - 唯一索引列可以允许 `NULL`。
   - 在 InnoDB 中通常是二级索引，而不是聚簇索引。

3. 普通索引（Normal Index）

   ```sql
   KEY idx_name (name)
   ```

   只用于提高查询效率，不要求索引值唯一。

#### 按索引列数量

1. 单列索引，只包含一个字段：

   ```sql
   CREATE INDEX idx_name ON user(name);
   ```

2. 联合索引（Composite Index），包含多个字段：

   ```sql
   CREATE INDEX idx_name_age ON user(name, age);
   ```

   联合索引也叫组合索引、复合索引、Composite Index等，它通常遵循最左前缀原则。例如索引：`(name, age, status)`，可以较好地支持：

   ```
   WHERE name = ?
   WHERE name = ? AND age = ?
   WHERE name = ? AND age = ? AND status = ?
   ```

   注意：建索引的列顺序很重要。

   不能直接按照传统最左前缀方式支持：

   ```
   WHERE age = ?
   WHERE status = ?
   ```

   需要强调的是，联合索引也可以同时是唯一索引：

   ```sql
   CREATE UNIQUE INDEX uk_name_phone ON user(name, phone);
   ```

   这个索引同时属于：`B+ 树索引`、`二级索引`、`唯一索引`、`联合索引`。因此，“联合”和“唯一”显然不是互斥分类。

#### 按特殊用途

1. 全文索引（Fulltext Index），用于自然语言文本搜索：

   ```sql
   FULLTEXT KEY idx_content(content)
   ```

2. 空间索引，用于地理空间数据搜索：

   ```sql
   SPATIAL KEY idx_location(location)
   ```

#### 一个索引属于多种类型

例如：

```sql
CREATE TABLE user (
    id BIGINT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    name VARCHAR(50),
    age INT,

    UNIQUE KEY uk_phone(phone),
    KEY idx_name_age(name, age)
);
```

可以如下划分：

| 索引                      | 数据结构 | 存储组织 | 约束性质 | 列数     |
| ------------------------- | -------- | -------- | -------- | -------- |
| `PRIMARY KEY(id)`         | B+ 树    | 聚簇索引 | 主键索引 | 单列     |
| `uk_phone(phone)`         | B+ 树    | 二级索引 | 唯一索引 | 单列     |
| `idx_name_age(name, age)` | B+ 树    | 二级索引 | 普通索引 | 联合索引 |

再例如：

```sql
CREATE UNIQUE INDEX uk_tenant_username ON user(tenant_id, username);
```

它同时是：`B+ 树索引`、`二级索引`、`唯一索引`、`联合索引`。

### 创建索引的注意事项



### 如何排查索引效果



### 总结

索引的核心目的是**以空间换时间**，通过牺牲一定的磁盘空间和写入性能，来换取查询、排序和分组操作的巨大性能提升。同时，特定类型的索引（如主键、唯一索引）还能起到数据约束的作用。

## MySQL 的存储引擎

> 面试重点：InnoDB 与 MyISAM 的区别

MySQL 的存储引擎，是**真正负责表数据和索引的存储、读取、事务、锁、崩溃恢复等工作的组件**。

MySQL Server 上层负责 SQL 解析、优化和执行调度，底层由存储引擎负责具体访问数据。MySQL 采用可插拔存储引擎架构，因此同一个数据库中，不同表可以选择不同引擎。MySQL 8.4 默认使用 `InnoDB`，官方也建议除特殊场景外优先使用 InnoDB。

MySQL 的存储引擎包括：InnoDB、MyISAM、MEMORY、CSV、ARCHIVE、BLACKHOLE、MERGE / MRG_MYISAM、FEDERATED、NDB。

其中日常开发只需要掌握：InnoDB、MyISAM、MEMORY。而且，现代业务系统通常直接选择 InnoDB。

### InnoDB

`InnoDB` 是 MySQL 8.4 的默认存储引擎，也是最常用的通用存储引擎。它支持事务、提交、回滚、崩溃恢复、行级锁、MVCC 和外键，适合高并发读写以及对数据可靠性要求较高的业务。

主要特点：

```
支持事务, 支持 ACID, 支持行级锁, 支持 MVCC, 支持外键, 支持崩溃恢复, 主键索引是聚簇索引, 适合高并发读写
```

InnoDB 默认通过 MVCC 提供一致性非锁定读；写操作主要使用行级锁，因此不同事务修改不同数据行时通常可以并发执行。

适用场景：订单系统、支付系统、用户系统、库存系统、电商系统、后台管理系统、绝大部分互联网业务。

需要事务、高并发、数据可靠性时，优先选择 InnoDB。

### MyISAM

`MyISAM` 是 MySQL 早期常用的存储引擎，但现在已经不是默认选择。它不支持事务、不支持 MVCC、不支持外键，使用表级锁；读取较多、更新较少且不要求事务的历史场景中可能使用。

主要特点：

```
不支持事务, 不支持回滚, 不支持外键, 不支持 MVCC, 使用表级锁, 支持 B+ 树索引, 支持全文索引, 数据文件和索引文件分开存储, 适合读多写少, 并发要求较低的场景
```

适用场景：历史遗留系统、读多写少的数据、不需要事务的数据、低并发的静态数据。

但即使是读多写少的业务，现代 MySQL 中通常仍优先使用 InnoDB，因为 InnoDB 的缓存、并发、恢复和索引能力更完整。

### MEMORY

`MEMORY` 引擎把表数据存储在内存中，因此访问延迟较低，但 MySQL 服务关闭或服务器宕机后，表中的数据会丢失；表定义仍然存在，重启后表变为空表。

主要特点：

```
数据存储在内存中, 重启后数据丢失, 表结构不会丢失, 不支持事务, 不支持外键, 使用表级锁, 支持 Hash 索引, 支持 B-Tree 索引, 不支持 BLOB 和 TEXT
```

MEMORY 支持 Hash 和 B-Tree 两种索引，但使用表级锁，高并发写入时不一定比 InnoDB 更快。

适用场景：临时计算结果、非关键缓存数据、快速查找表、允许重启后丢失的数据。

不过现实项目通常会使用 Redis 作为独立缓存，而不是大量使用 MEMORY 表。

### InnoDB 与 MyISAM 的区别

| 对比项               | InnoDB       | MyISAM           |
| -------------------- | ------------ | ---------------- |
| 事务                 | 支持         | 不支持           |
| `COMMIT`、`ROLLBACK` | 支持         | 不支持           |
| 锁粒度               | 主要是行级锁 | 表级锁           |
| MVCC                 | 支持         | 不支持           |
| 外键                 | 支持         | 不支持           |
| 崩溃恢复             | 支持         | 能力较弱         |
| 聚簇索引             | 支持         | 不支持           |
| 主键索引叶子节点     | 完整数据行   | 数据记录位置     |
| 并发写入             | 较好         | 较差             |
| 全文索引             | 支持         | 支持             |
| 典型场景             | 通用业务系统 | 历史读多写少场景 |

### 常用命令

查看当前 MySQL 实例实际支持的引擎：`SHOW ENGINES;`

查看某张表使用的引擎：`SHOW TABLE STATUS LIKE 'table_name';`

修改已有表的引擎：`ALTER TABLE user ENGINE = InnoDB;`

## MySQL 的事务

MySQL 事务是指，把一组 SQL 操作作为一个不可分割的执行单元，要么全部成功提交，要么全部失败回滚。

事务主要由存储引擎实现。现代 MySQL 中通常使用 `InnoDB`，因为 InnoDB 支持事务；MyISAM 不支持事务。

例如银行转账：

```sql
UPDATE account
SET balance = balance - 100
WHERE id = 1;

UPDATE account
SET balance = balance + 100
WHERE id = 2;
```

这两条 SQL 必须作为一个整体执行。不能出现账户 1 已扣款，但账户 2 没到账的情况。因此，需要添加事务，上述示例添加事务后，如下所示：

```sql
START TRANSACTION;   # 开启事务

UPDATE account
SET balance = balance - 100
WHERE id = 1;

UPDATE account
SET balance = balance + 100
WHERE id = 2;

COMMIT; # 提交事务
```

回滚事务：`ROLLBACK;` 发生异常时，进行回滚。

### 事务的 ACID 特性

1. 原子性（Atomicity）：一个事务是一个不可分割的最小执行单位，事务中的操作要么全部成功，要么全部失败回滚。InnoDB 主要通过 `Undo Log` 保证原子性。事务失败时，可以利用 Undo Log 撤销已执行的修改。
2. 一致性（Consistency）：事务执行前后，数据必须保证合法状态（如转账前后总金额不变）。
3. 隔离性（Isolation）：多个并发事务之间相互隔离，互不干扰。例如两个事务同时修改同一个账户余额，数据库需要避免脏读、不可重复读等问题。InnoDB 主要通过 锁、MVCC、Undo Log、Read View 机制实现隔离性。
4. 持久性（Durability）：事务一旦提交，对数据库的修改就是永久的。即使数据库随后宕机，已经提交的数据也不应丢失，能够恢复。InnoDB 主要通过 `Redo Log` 保证持久性。提交事务时，不一定立即把所有数据页写入磁盘，但会先保证相关 Redo Log 持久化。数据库重启后可以通过 Redo Log 恢复已提交的数据。

### 事务的隔离级别

事务隔离级别用于控制多个事务并发执行时，彼此能看到多少数据变化。

SQL 标准定义了四种隔离级别，隔离程度从低到高如下，并发性能一般从高到低。

| 隔离级别                                      | 脏读 | 不可重复读 | 幻读 | 并发性能 |
| --------------------------------------------- | ---- | ---------- | ---- | -------- |
| 读未提交 `READ UNCOMMITTED`                   | 可能 | 可能       | 可能 | 最高     |
| 读已提交 `READ COMMITTED`（生产环境一般推荐） | 避免 | 可能       | 可能 | 较高     |
| 可重复读 `REPEATABLE READ`                    | 避免 | 避免       | 可能 | 较高     |
| 串行化 `SERIALIZABLE`                         | 避免 | 避免       | 避免 | 最低     |

简单来说：

- 脏读：读到了别的事务还没提交的、可能回滚的“脏”数据。
- 不可重复读：在同一个事务里，两次读取同一行数据，结果不一样（因为被别的事务修改了）。
- 幻读：在同一个事务里，两次查询返回的记录条数不一样（因为被别的事务插入或删除了）。

1. 读未提交

   一个事务可以读取另一个事务还没有提交的数据。

   ```
   事务 A 修改余额为 500，但未提交
   事务 B 读取到余额 500
   事务 A 回滚
   ```

   事务 B 读取到了一个最终不存在的数据，这叫脏读。这是隔离级别最低的一种，实际项目中很少使用。

2. 读已提交

   一个事务只能读取其他事务已经提交的数据，可以避免脏读。但是同一个事务中，两次查询结果可能不同：

   ```
   事务 A 第一次查询余额：1000
   事务 B 修改余额为 800，并提交
   事务 A 第二次查询余额：800
   ```

   事务 A 两次读取同一行数据，结果不一致，这叫不可重复读。

3. 可重复读（这样不是会读到过期的数据吗？？？？？？）

   在同一个事务中，多次读取同一行数据，结果保持一致。

   ```
   事务 A 第一次查询余额：1000
   事务 B 修改余额为 800，并提交
   事务 A 第二次查询仍然是：1000
   ```

   但按照 SQL 标准，可重复读仍然可能产生幻读。例如第一次查询：

   ```sql
   SELECT * FROM user WHERE age > 18;
   ```

   返回 10 条记录。其他事务插入一条符合条件的记录并提交，当前事务再次查询时，可能出现 11 条记录。这种新增或消失的行称为幻读。

4. 串行化

   隔离级别最高。数据库让并发事务尽量按照串行顺序执行：

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

### 快照读与当前读

快照读和当前读，描述的不是两种锁，而是 **InnoDB 读取数据的两种方式**：

1. 快照读（Snapshot Read）：读取 MVCC 生成的历史快照，通常不加行锁。

   能够看到创建快照时已经提交的数据，当前事务自己执行的修改。

   普通查询通常属于快照读：

   ```sql
   SELECT * FROM user WHERE id = 1;
   ```

   快照读通过 MVCC 读取符合当前事务可见性规则的数据版本，一般不会对记录加行锁。

   在 InnoDB 的 `READ COMMITTED` 和 `REPEATABLE READ` 隔离级别下，普通 `SELECT` 通常不会直接读取磁盘中最新的数据版本，而是根据：

   ```
   Read View
   事务 ID
   Undo Log 版本链
   ```

   找到当前事务应该看见的数据版本。普通一致性读通常不会对读取的索引记录加行锁，因此其他事务仍然可以修改这些记录。

   注意：其他事务已经对某记录加了 X 锁，普通快照读通常也不需要等待，因为它可以通过 Undo Log 读取旧版本。

   **示例如下**：

   初始数据为 `id = 1, balance = 1000`，事务 A：

   ```sql
   START TRANSACTION;
   
   UPDATE account SET balance = 900 WHERE id = 1;
   ```

   事务 A 尚未提交。此时事务 B：

   ```sql
   START TRANSACTION;
   
   SELECT balance FROM account WHERE id = 1;
   ```

   事务 B 通常不会等待事务 A，而是通过 Undo Log 找到事务 A 修改前的版本：

   ```sql
   balance = 1000
   ```

   其过程可以理解为：

   ```
   当前记录 balance = 900
           ↓ 该版本对事务 B 不可见
   根据 DB_ROLL_PTR 找 Undo Log
           ↓
   构造旧版本 balance = 1000
           ↓
   返回 1000
   ```

   因此快照读的核心不是“读取内存快照的副本”，而是：按照 Read View 的可见性规则，从当前版本和 Undo Log 版本链中找到一个可见版本。

2. 当前读（Current Read），官方文档称为锁定读：读取可以被加锁的最新数据版本，并对扫描到的索引记录或范围加锁。

   常见当前读：

   ```sql
   SELECT ... FOR SHARE;
   SELECT ... FOR UPDATE;
   UPDATE ...;
   DELETE ...;
   INSERT ...;
   ```

   其中显式锁定读主要有两种：

   - 共享当前读

     ```sql
     SELECT * FROM user WHERE id = 1 FOR SHARE;
     ```

     它会对读取的索引记录申请 S 锁。其他事务仍然可以获取兼容的 S 锁，但不能对同一记录获取 X 锁进行修改，直到当前事务提交或回滚。

   - 排它当前读

     ```sql
     SELECT * FROM user WHERE id = 1 FOR UPDATE;
     ```

     它会对读取的索引记录申请 X 锁，其加锁方式类似于对这些记录执行 `UPDATE`。其他事务不能同时修改这些记录，也不能获得冲突的锁。

**快照读和当前读与记录锁、间隙锁、临键锁之间的关系**：

- 快照读主要依赖 MVCC（多版本并发控制）机制，读取的是数据的历史版本（快照），因为不加锁，所以它不会阻塞其他事务的读写操作，并发性能极高；
- 读取的是数据库中最新已提交的数据版本。为了保证数据一致性，它在读取的同时必须对数据加锁。

#### 快照读与 Read View 的关系

快照读依赖 Read View，但不同隔离级别创建 Read View 的时机不同。

**READ COMMITED**

每一次快照读通常都会创建新的 Read View：

```sql
START TRANSACTION;

SELECT * FROM user WHERE id = 1; -- Read View 1

SELECT * FROM user WHERE id = 1; -- Read View 2
```

如果两次查询之间，其他事务修改并提交了数据，第二次查询可能看见新数据。因此会出现不可重复读。

**REPEATABLE READ**

同一个事务中的多次快照读，通常复用第一次快照读建立的 Read View：

```sql
START TRANSACTION;

SELECT * FROM user WHERE id = 1; -- 建立 Read View

SELECT * FROM user WHERE id = 1; -- 复用 Read View
```

即使两次查询之间有其他事务修改并提交，第二次快照读通常仍然看到第一次查询时的版本，因此实现可重复读。

注意，通常是**第一次快照读**建立 Read View，不一定是执行 `START TRANSACTION` 时立即建立。

例如：

```sql
START TRANSACTION;

-- 其他事务此时提交了数据

SELECT * FROM user;
```

这个 `SELECT` 才可能建立事务的 Read View。

#### 锁是返回行还是扫描行

当前读的加锁范围不是简单按照最终返回结果决定，而主要按照 InnoDB 实际扫描到的索引记录和索引范围决定。例如：

```sql
SELECT * FROM user WHERE phone = '13800138000' FOR UPDATE;
```

如果 `phone` 有唯一索引，通常能精确定位并只锁一条索引记录。

如果 `phone` 没有索引，MySQL 可能扫描聚簇索引中的大量记录，导致锁定范围显著扩大。InnoDB 对锁定读、`UPDATE` 和 `DELETE` 通常会对执行过程中扫描到的索引记录加锁；缺少合适索引时，甚至可能扫描并锁定大量记录。

因此：索引不仅影响查询速度，也直接影响当前读的加锁范围和并发性能。

#### 快照读与当前读分别什么时候使用

只需要读取数据，不依赖“读取后数据不能变化”：

```sql
SELECT * FROM product WHERE id = 1;
```

使用快照读即可。它并发能力高，读写通常不会互相阻塞。

读取后准备基于该值进行修改，而且不允许其他事务抢先修改：

```sql
START TRANSACTION;

SELECT stock FROM product WHERE id = 1 FOR UPDATE;

UPDATE product SET stock = stock - 1 WHERE id = 1;

COMMIT;
```

使用当前读。不过扣库存通常可以进一步改为单条条件更新：

```sql
UPDATE product SET stock = stock - 1 WHERE id = 1 AND stock > 0;
```

然后检查影响行数，减少一次查询和事务锁持有时间。

#### 快照读与当前读如何解决幻读

InnoDB 在 REPEATABLE READ（RR） 级别下，快照读通过 MVCC 让幻影记录不可见；当前读通过间隙锁、临键锁阻止幻影记录被插入。

1. 对于快照读

   允许插入，但当前事务不可见。因为在 RR 隔离级别下，同一事务中的快照读通常复用第一次快照读建立的 Read View。其他事务即使插入并提交了符合条件的新记录，当前事务后续的普通 SELECT 仍然按照原来建立的 Read View 来查询，因此看不到新插入的数据。

2. 对于当前读

   直接阻止其他事务插入。例如事务 A：

   ```sql
   START TRANSACTION;
   
   SELECT * FROM user WHERE age BETWEEN 18 AND 30 FOR UPDATE;
   ```

   在 RR 下，如果这是一个范围扫描，InnoDB 通常会对扫描到的索引范围添加临键锁：`临键锁 = 记录锁 + 间隙锁`

   记录锁保护已有记录，间隙锁阻止其他事务向相关索引间隙插入新记录。InnoDB 在 RR 下默认使用临键锁处理索引范围扫描，从而防止幻影行。

### 事务的底层实现机制

只是对于 InnoDB 引擎而言。MySQL 的事务不是由一个单独组件实现的，而是由 **InnoDB 的 Undo Log、Redo Log、MVCC、锁、Buffer Pool、Doublewrite Buffer，以及 MySQL Server 层的 Binlog 协同实现**。

**以 UPDATE 语句为例：**

假设执行：

```sql
START TRANSACTION;

UPDATE account
SET balance = balance - 100
WHERE id = 1;

COMMIT;
```

它大致经历一下过程：

```
1. 开启事务，获得事务 ID
2. 根据索引找到目标记录
3. 对记录加排他锁
4. 生成 Undo Log，保存修改前的信息
5. 在 Buffer Pool 中修改数据页
6. 生成 Redo Log，记录如何重做本次修改
7. COMMIT 时持久化必要日志
8. 标记事务提交成功
9. 释放事务持有的锁
10. 脏页随后异步刷入数据文件
```

**各个组成部分：**

1. Undo Log 保证原子性，主要有两个作用：

   **回滚日志：**每次修改数据前，先把原值存到 Undo Log 里。事务回滚时，按 Undo Log 反向操作把数据恢复回去。要么全做完，要么全撤销，不会出现改了一半的中间状态。例如：

   ```sql
   UPDATE user SET age = 20 WHERE id = 1;
   ```

   Undo Log 会记录修改前的数据，以便事务失败时恢复。

   **为 MVCC 保存历史版本：**InnoDB 会在聚簇索引记录中维护隐藏字段，其中主要包括：

   ```
   DB_TRX_ID
   最后一次插入或修改该记录的事务 ID
   
   DB_ROLL_PTR
   指向对应 Undo Log 记录的回滚指针
   ```

   假设一行数据经历了多次修改：

   ```
   当前版本：balance = 700
       ↓ DB_ROLL_PTR
   旧版本：balance = 800
       ↓
   更旧版本：balance = 900
       ↓
   最旧版本：balance = 1000
   ```

   这样就形成了版本链。其他事务可以根据自己的可见性规则，从版本链中找到应该读取的版本。

2. Redo Log 保证崩溃恢复和持久性

   解决的是：数据页发生了什么修改，崩溃后如何重新执行这个修改。

   事务修改数据时，一般先修改内存中的 Buffer Pool 页面，这个被修改但尚未写入数据文件的页面叫作脏页。

   ```
   磁盘数据页
       ↓ 读取
   Buffer Pool 中的数据页
       ↓ 修改
      脏页
   ```

   如果事务提交后数据库突然宕机，可能出现：

   ```
   Redo Log 已经持久化
   数据脏页还没有写入数据文件
   ```

   数据库重启时，InnoDB 可以读取 Redo Log，将尚未完整写入数据文件的修改重新执行。官方文档说明，Redo Log 用于崩溃恢复；意外关闭前没有完成数据文件更新的修改会在初始化期间自动重放。

   这就是常说的 WAL（Write-Ahead Logging）：先写日志，再允许对应数据页稍后刷盘。

3. 锁（行锁、间隙锁等等）保证隔离性

   两个事务同时改一行，必须一个等另一个释放锁。InnoDB 的锁粒度精确到行级，还有间隙锁防止幻读。

   InnoDB 常见锁包括：

   ```
   共享锁 S Lock
   排他锁 X Lock
   记录锁 Record Lock
   间隙锁 Gap Lock
   临键锁 Next-Key Lock
   意向锁 Intention Lock
   意向锁 Intention Lock
   插入意向锁 Insert Intention Lock
   ```

   锁主要用于控制并发修改，保证事务隔离。

4. MVCC（多版本并发控制）保证隔离性的读写并发

   解决的是：当一个事务正在修改数据时，另一个事务如何在不阻塞写事务的情况下读取一个合理的数据版本。

   读操作不加锁，通过 Undo Log 里的版本链找到自己应该看到的数据版本。写的时候别人照样能读，读的时候别人照样能写，并发度直接拉满。它允许：

   ```
   读操作通常不阻塞写操作
   写操作通常不阻塞普通快照读
   ```

   InnoDB 通过：

   ```
   隐藏事务 ID
   回滚指针
   Undo Log
   Read View
   ```

   判断某个事务应该看到哪个数据版本。

### 长事务可能导致的问题？？？



## MySQL 的锁

MySQL 中的锁，主要用于控制多个事务并发访问同一份数据，避免出现脏写、数据覆盖、幻读等问题。

可以从四个角度理解：

```
按锁粒度：表锁、页锁、行锁
按兼容关系：共享锁、排他锁
按锁定范围：记录锁、间隙锁、临键锁
按特殊用途：意向锁、插入意向锁、AUTO-INC 锁、元数据锁
```

**为什么需要锁？**

假设账户余额为 1000，两个事务同时执行：

```sql
UPDATE account SET balance = balance - 100 WHERE id = 1;
```

如果没有并发控制，两个事务可能都先读到 1000，然后都写入 900，最终只扣了 100，而不是 200。锁的作用就是保证多个事务修改同一数据时，按照受控顺序执行。

### 按锁粒度划分

1. 表级锁：表级锁锁住整张表。

   MyISAM 主要使用表级锁。

   特点：加锁开销小、锁冲突概率高、并发能力较低。

   ```sql
   # 手动加表锁
   LOCK TABLES user READ;   
   LOCK TABLES user WRITE;
   # 解锁
   UNLOCK TABLES;
   ```

   `READ` 锁允许当前会话读取，但不能修改；其他会话通常也可以读取。

   `WRITE` 锁允许当前会话读写，其他会话通常无法访问该表，直到锁被释放。

   适用场景：比如要使用 DDL 语句修改整张表。

2. 行级锁：行级锁锁住索引记录，而不是直接锁住物理数据行。

   InnoDB 主要使用行级锁，它的行级锁其实叫索引记录级锁，锁的不是数据行，而是索引记录。

   特点：锁粒度小、并发能力高、锁管理成本较高、可能发生死锁。

   例如：

   ```sql
   UPDATE user SET name = 'Tom' WHERE id = 1;
   ```

   如果 `id` 是索引字段，通常只锁定对应索引记录。

   如果查询条件没有合适索引，MySQL 可能扫描大量索引记录，使锁定范围明显扩大。

3. 页级锁

   页级锁锁住一个数据页，粒度介于表锁和行锁之间。

   部分存储引擎曾使用页锁，但 InnoDB 日常主要讨论表级锁和行级锁。

### 共享锁和排他锁

1. 共享锁：S 锁，也叫读锁。

   多个事务可以同时持有同一条记录的共享锁，但不能同时对该记录加排他锁。

   手动加共享锁：

   ```sql
   SELECT * FROM user WHERE id = 1 FOR SHARE;
   ```

   共享锁的兼容关系：

   ```
   S 锁与 S 锁兼容
   S 锁与 X 锁不兼容
   ```

   例如：

   ```
   事务 A：对 id = 1 加 S 锁
   事务 B：也可以对 id = 1 加 S 锁
   事务 C：不能对 id = 1 加 X 锁，需要等待
   ```

2. 排他锁：X 锁，也叫写锁。

   一个事务持有某条记录的排他锁后，其他事务不能再对该记录获取共享锁或排他锁。

   手动加排他锁：

   ```sql
   SELECT * FROM user WHERE id = 1 FOR UPDATE;
   ```

   以下操作通常会自动对相关记录加排他锁：

   ```sql
   INSERT
   UPDATE
   DELETE
   ```

两种锁之间的兼容关系：

| 已持有\申请 | S    | X    |
| ----------- | ---- | ---- |
| S           | 兼容 | 冲突 |
| X           | 冲突 | 冲突 |

### 记录锁、间隙锁、临键锁

1. 记录锁，Record Lock，锁住某一条索引记录。例如：

   ```sql
   SELECT * FROM user WHERE id = 10 FOR UPDATE;
   ```

   如果 `id` 是唯一索引，并且使用等值查询，通常只锁住 `id = 10` 对应的索引记录。记录锁防止其他事务修改或删除该记录。

2. 间隙锁，Gap Lock，锁住索引记录之间的空隙，而不是某一条已经存在的记录。

   假设索引中存在：

   ```
   10
   20
   30
   ```

   那么索引间隙包括：

   ```
   (-∞, 10)
   (10, 20)
   (20, 30)
   (30, +∞)
   ```

   如果事务锁住 `(10, 20)` 这个间隙，其他事务就不能在这个范围内插入新记录。例如：

   ```sql
   SELECT * FROM user WHERE id > 10 AND id < 20 FOR UPDATE;
   ```

   在特定隔离级别和执行计划下，可能锁住 `10` 和 `20` 之间的间隙。

   间隙锁的核心作用是：防止其他事务在查询范围内插入新记录，从而避免当前读发生幻读。

   需要注意，间隙锁本身主要限制插入，不一定阻止其他事务更新已经存在的其他记录。

3. 临键锁，Next-Key Lock，是：`记录锁 + 间隙锁`。

   它锁定一个左开右闭区间。假设索引值为：

   ```
   10
   20
   30
   ```

   对应的临键锁区间大致是：

   ```
   (-∞, 10]
   (10, 20]
   (20, 30]
   (30, +∞)
   ```

   例如锁住`(10, 20]`，意味着：锁住记录 20，同时锁住 10 到 20 之间的间隙。

   InnoDB 在 `REPEATABLE READ` 隔离级别下进行范围当前读时，通常通过临键锁避免幻读。例如：

   ```sql
   SELECT * FROM user WHERE age >= 20 AND age <= 30 FOR UPDATE;
   ```

   它不仅可能锁住现有的年龄记录，还可能锁住相关索引间隙，防止其他事务插入新的 `age = 25` 记录。

### 按特殊用途划分

1. 意向锁（Intention Locks），一种表级锁，用于表示：某个事务准备或已经对表中的某些行加锁。主要有：

   ```
   意向共享锁 IS（Intention Shared Lock）
   意向排他锁 IX（Intention Exclusive Lock）
   ```

   例如事务要对某一行加共享锁，会先对表加 `IS` 锁。要对某一行加排他锁，会先对表加 `IX` 锁。

   ```
   行级 S 锁之前：先加表级 IS 锁
   行级 X 锁之前：先加表级 IX 锁
   ```

   意向锁的主要作用不是阻塞普通行锁，而是提高表锁与行锁之间的冲突判断效率。

   假设某事务想给整张表加写锁。如果没有意向锁，它必须检查表中每一行是否已经有行锁。有了意向锁后，只需要检查表级意向锁，就能知道表中是否存在相应行锁。

   常见兼容关系：？？？？？

   | 已有锁 | IS   | IX   | S    | X    |
   | ------ | ---- | ---- | ---- | ---- |
   | IS     | 兼容 | 兼容 | 兼容 | 冲突 |
   | IX     | 兼容 | 兼容 | 冲突 | 冲突 |
   | S      | 兼容 | 冲突 | 兼容 | 冲突 |
   | X      | 冲突 | 冲突 | 冲突 | 冲突 |

   `IX` 和 `IX` 可以兼容，因为两个事务可以分别修改不同的数据行。

2. 插入意向锁（Insert Intention Lock），一种特殊的间隙锁，表示事务准备在某个索引间隙中插入记录。

   例如索引中存在：

   ```
   10
   20
   ```

   事务 A 插入：

   ```sql
   INSERT INTO user(id) VALUES (12);
   ```

   事务 B 插入：

   ```sql
   INSERT INTO user(id) VALUES (18);
   ```

   虽然它们都在 `(10, 20)` 的间隙中，但插入位置不同，通常可以并发执行。

   插入意向锁的作用就是让不同位置的插入尽量并发，而不是简单锁住整个间隙。

   但如果该间隙已经被其他事务的 Gap Lock 或 Next-Key Lock 锁住，插入仍然需要等待。

3. AUTO-INC 锁

   当表使用自增主键时：

   ```sql
   CREATE TABLE user (
       id BIGINT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(50)
   );
   ```

   执行：

   ```sql
   INSERT INTO user(name) VALUES ('Tom');
   ```

   InnoDB 需要为新记录生成自增值。AUTO-INC 锁用于协调并发插入时自增值的分配。具体锁行为受 `innodb_autoinc_lock_mode` 配置影响。

   一般情况下，普通单行插入能够高效分配自增值；批量插入、`INSERT ... SELECT` 等语句可能采用更严格的协调方式。自增值通常保证唯一递增，但不保证绝对连续。例如事务获取了自增值后回滚，这个自增值通常不会重新使用，因此可能产生空洞。

4. 元数据锁，Metadata Lock，简称 MDL。它保护的是表结构，而不是具体数据记录。

   元数据锁分为读锁和写锁：

   - 元数据读锁（MDL_SHARED）：当一个事务需要读取表的元数据时（如执行 SELECT 操作），会获取读锁。多个事务可以同时持有读锁，不会相互阻塞；
   - 元数据写锁（MDL_EXCLUSIVE）：当一个事务需要修改表的元数据时（如执行 ALTER TABLE 操作），会获取写锁。写锁会阻塞其他任何读锁和写锁，确保独占访问。

   元数据锁的主要作用：防止并发的 DDL 操作和 DML 操作冲突。例如执行：

   ```sql
   SELECT * FROM user;
   ```

   MySQL 会对 `user` 表获取**元数据读锁**，防止查询过程中表结构被删除或修改。另一个会话执行：

   ```sql
   ALTER TABLE user ADD COLUMN age INT;
   ```

   需要获取**元数据写锁**。如果前面的事务还没有结束，`ALTER TABLE` 可能一直等待。典型场景：

   ```sql
   START TRANSACTION;
   
   SELECT * FROM user;
   ```

   事务没有提交。另一个连接执行：

   ```sql
   ALTER TABLE user ADD COLUMN age INT;
   ```

   可能被阻塞。因此长事务不仅可能持有行锁，还可能导致 DDL 等待元数据锁。

### 悲观锁和乐观锁

悲观锁和乐观锁都不是 MySQL 真实存在的锁，而是两种并发控制思想，本质区别在于对冲突的预期态度不同。

1. 悲观锁：假设并发冲突很可能发生，因此先加锁，再操作数据。例如：

   ```sql
   START TRANSACTION;
   
   SELECT stock
   FROM product
   WHERE id = 1
   FOR UPDATE;
   
   UPDATE product
   SET stock = stock - 1
   WHERE id = 1;
   
   COMMIT;
   ```

   `FOR UPDATE` 就是典型的数据库悲观锁。特点：

   - 冲突控制直接
   - 适合写冲突较多的场景
   - 可能产生阻塞和死锁

   适用场景：写多读少，数据冲突概率极高的场景（如电商秒杀扣减库存、金融转账）

2. 乐观锁：通常不是 MySQL 提供的一种具体锁，而是应用层通过版本号或条件更新实现的并发控制方案。假设冲突很少发生，干脆不加锁，等到真正更新的时候再检查数据有没有被别人改过。通常用一个 version 字段来实现，读的时候把 version 一起读出来，更新的时候在 WHERE 条件里带上这个 version，如果 version 变了就说明别人改过，更新影响 0 行。

   例如表中有：

   ```sql
   id
   stock
   version
   ```

   更新时执行：

   ```sql
   UPDATE product
   SET stock = stock - 1,
       version = version + 1
   WHERE id = 1
     AND version = 5;
   ```

   如果受影响行数为 1，说明更新成功。

   如果受影响行数为 0，说明版本已经变化，其他事务可能已经修改过数据。

   乐观锁适合：

   - 读多写少
   - 冲突概率较低
   - 允许失败后重试

   适用场景：读多写少，数据冲突较低的场景。

### 死锁

死锁是指多个事务互相等待对方释放锁，形成循环等待。例如：

```
事务 A：
锁住 id = 1
等待 id = 2

事务 B：
锁住 id = 2
等待 id = 1
```

示例：

事务 A：

```sql
START TRANSACTION;

UPDATE account
SET balance = balance - 100
WHERE id = 1;

UPDATE account
SET balance = balance + 100
WHERE id = 2;
```

事务 B：

```sql
START TRANSACTION;

UPDATE account
SET balance = balance - 100
WHERE id = 2;

UPDATE account
SET balance = balance + 100
WHERE id = 1;
```

两个事务访问资源顺序相反，就可能发生死锁。InnoDB 检测到死锁后，通常会主动回滚其中一个事务，让另一个事务继续执行。

减少死锁的方法包括：

- 按照固定顺序访问数据
- 拆分大事务
- 降低隔离级别：可重复读比读已提交多了间隙锁和临键锁，锁的范围更大。如果业务允许，用读已提交能减少锁冲突。
- 合理建立索引
- 调整锁等待超时

### 总结

**MySQL 中的锁**

- 表级锁、页级锁、行级锁说的都是锁的粒度。
- 共享锁（S 锁，允许持有者读取）和排他锁（X 锁，允许持有者修改或删除）说的都是锁的模式。
- 而记录锁（锁行（即锁定某一条索引记录），具有 S 和 X 模式）、间隙锁（锁空隙，InnoDB 内部可以表示为 Gap S Lock 和 Gap X Lock，但是间隙 S 锁与间隙 X 锁在功能上没有区别，因为间隙锁本身就是排它性的）、临键锁（锁行+锁空隙，分为 S 和 X 模式）这三个是索引锁的锁定范围划分的。
- 还有一些针对特殊位置的锁，意向锁（表级锁，用于表明事务准备或已经对表中的记录加共享锁或排他锁，以快速协调表锁与行锁之间的兼容关系）、插入意向锁（一种特殊的间隙锁，插入意向锁允许多个事务在同一索引间隙的不同位置并发插入，但如果目标间隙已被其他事务的间隙锁或临键锁封锁，插入意向锁仍然会等待）、AUTO-INC 锁（表级锁，协调并发 INSERT 时 AUTO_INCREMENT 值的分配，平衡连续性、可预测性和插入并发性能）、元数据锁（保护表结构，防止并发的 DDL 和 DML 操作冲突）。

- 死锁说的是多个事务之间互相等待对方释放锁，总而导致一种循环等待的状态。

- 悲观锁和乐观锁说的是两种并发控制的思想。

**锁的范围**

InnoDB 加锁通常依据实际扫描到的索引记录和索引范围，而不是只依据最终返回的记录。

`UPDATE`、`DELETE` 和锁定读通常会对扫描到的索引记录加锁。非唯一索引查询或范围查询可能加 gap lock 或 next-key lock；完整唯一索引的等值查询通常只加 record lock。

所以索引确实可能导致：

```
扫描范围扩大
锁定范围扩大
锁等待增加
死锁概率增加
并发能力下降
```

**隔离级别会影响锁**

在 `REPEATABLE READ` 下，范围查询通常更容易出现 gap lock 和 next-key lock。

在 `READ COMMITTED` 下，普通搜索和索引扫描中的 gap locking 通常被关闭，但外键检查和重复键检查等场景仍可能使用间隙锁。

所以不能脱离以下因素判断 SQL 加什么锁：

```
隔离级别
使用的索引
查询条件
是否唯一索引
执行计划
SQL 类型
数据实际分布
```

## MVCC

MVCC，全称是 **Multi-Version Concurrency Control，多版本并发控制**。

它的核心思想是，同一条数据在逻辑上保留多个历史版本，让读事务读取适合自己的版本，而不必和写事务互相阻塞。

在 InnoDB 中，MVCC 主要用于实现：

```
普通 SELECT 的快照读
READ COMMITTED 隔离级别
REPEATABLE READ 隔离级别
```

**MVCC 要解决的问题**

假设账户余额原来是 1000。事务 A 正在修改：

```sql
START TRANSACTION;

UPDATE account SET balance = 900 WHERE id = 1;
```

但事务 A 还没有提交。此时事务 B 执行：

```sql
SELECT balance FROM account WHERE id = 1;
```

如果没有 MVCC，通常只有两种选择：

```
1. 事务 B 等待事务 A 释放锁
2. 事务 B 直接读取事务 A 未提交的 900
```

第一种并发性能差，第二种会产生脏读。MVCC 提供第三种方式：

```
事务 A 正在修改当前版本 900
事务 B 通过历史版本读取 1000
```

因此读操作通常不用等待写操作：

```
读不阻塞写
写不阻塞普通快照读
```

**MVCC 的核心组成**

InnoDB 的 MVCC 主要依赖四部分：

```
隐藏字段
Undo Log
版本链
Read View
```

1. 隐藏字段

   InnoDB 的聚簇索引记录中会维护一些隐藏信息，主要包括：

   DB_TRX_ID：记录最后一次插入或修改该行数据的事务 ID。可以理解为：

   ```
   这一版本是谁修改的
   ```

   DB_ROLL_PTR：回滚指针，指向 Undo Log 中该记录修改前的历史版本。可以理解为：

   ```
   上一个版本在哪里
   ```

   DB_ROW_ID：如果表中没有合适的主键或唯一非空索引，InnoDB 会生成隐藏行 ID，用于组织聚簇索引。`DB_ROW_ID` 不是 MVCC 可见性判断的核心，核心是前两个字段。

2. Undo Log 和版本链

   假设一条记录被依次修改：

   ```
   balance = 1000
   balance = 900
   balance = 800
   balance = 700
   ```

   当前数据页中通常只保存最新版本：

   ```
   balance = 700
   ```

   旧版本并不是全部作为完整副本直接堆在数据页中，而是通过 Undo Log 保存恢复旧版本所需的信息。

   通过 `DB_ROLL_PTR` 可以形成版本链：

   ```
   当前版本：balance = 700，事务 ID = 30
           ↓ DB_ROLL_PTR
   旧版本：balance = 800，事务 ID = 25
           ↓
   旧版本：balance = 900，事务 ID = 20
           ↓
   旧版本：balance = 1000，事务 ID = 10
   ```

   当当前版本对某个事务不可见时，InnoDB 就沿着 Undo Log 版本链向前查找，直到找到可见版本。

   所以 Undo Log 有两个作用：

   ```
   事务回滚
   MVCC 历史版本读取
   ```

3. Read View

   仅有版本链还不够，InnoDB 还需要判断：当前事务到底应该看见哪个版本？这个判断依据就是 `Read View`。

   Read View 可以理解为某一时刻的事务快照，其中记录了创建快照时数据库中事务的活动情况。

   概念上通常包含：

   ```
   m_ids 创建 Read View 时仍然活跃的事务 ID 集合
   min_trx_id 活跃事务中的最小事务 ID
   max_trx_id 下一个将要分配的事务 ID
   creator_trx_id 创建该 Read View 的事务 ID
   ```

   读取数据时，InnoDB 会拿数据版本的 `DB_TRX_ID` 与 Read View 进行比较。

   **版本可见性规则**

   - 当前事务自己修改的版本，可见
   - 版本由快照创建前已提交的事务产生，通常可见
   - 版本由快照创建时仍未提交的事务产生，不可见
   - 版本由快照创建后才开始的事务产生，不可见

   整个过程如下：

   ```
   读取当前记录版本
           ↓
   检查 DB_TRX_ID
           ↓
   该版本对 Read View 是否可见？
       ├── 可见：返回当前版本
       └── 不可见：
             根据 DB_ROLL_PTR 查找 Undo Log
                       ↓
                 判断旧版本是否可见
                       ↓
                 直到找到可见版本
   ```

### 读已提交和可重复读的区别

RC 和 RR 都使用 MVCC，主要区别是：Read View 的创建和复用时机不同。

**对于 READ COMMITED**

每次快照读通常都会创建新的 Read View。

```sql
START TRANSACTION;

SELECT balance FROM account WHERE id = 1;
-- Read View 1

SELECT balance FROM account WHERE id = 1;
-- Read View 2
```

如果两次查询之间，其他事务修改并提交了数据，第二次查询可能看见新值。例如：

```
第一次读取：1000
其他事务修改并提交：900
第二次读取：900
```

因此 RC 可以避免脏读，但可能出现不可重复读。

**对于 REPEATABLE READ**

同一个事务中的连续快照读通常复用第一次快照读建立的 Read View。

```sql
START TRANSACTION;

SELECT balance FROM account WHERE id = 1;
-- 第一次快照读，建立 Read View

SELECT balance FROM account WHERE id = 1;
-- 通常复用原 Read View
```

即使其他事务在中间将余额修改成 900 并提交，当前事务第二次快照读通常仍然返回 1000。

```
第一次读取：1000
其他事务修改并提交：900
第二次读取：1000
```

因此实现了可重复读。

## MySQL 的日志

MySql 中的日志可以按所属层次分为三类：

```
MySQL 日志
├── InnoDB 事务日志
│   ├── Redo Log
│   └── Undo Log
│
├── MySQL Server 层日志
│   ├── Binlog
│   ├── Error Log
│   ├── General Query Log
│   ├── Slow Query Log
│   └── DDL Log
│
└── 复制相关日志
    └── Relay Log
```

日常开发和面试中，最重要的是：

> **Redo Log、Undo Log、Binlog。**

其中 Redo Log 和 Undo Log 属于 InnoDB，Binlog 属于 MySQL Server 层。

### Redo Log

Redo Log，即重做日志，主要用于：保证事务的持久性，并支持数据库崩溃恢复。

**为什么需要 Redo Log**

InnoDB 修改数据时，一般不会直接把磁盘中的数据页立即改掉，而是先把数据页加载到 Buffer Pool，在内存中完成修改。

```
磁盘数据页
    ↓
加载到 Buffer Pool
    ↓
修改内存中的数据页
    ↓
形成脏页
```

如果事务提交时，要求所有脏页立即写回磁盘，就会产生大量随机磁盘 I/O，性能较差。因此 InnoDB 使用 WAL（Write-Ahead Logging），即先写日志，再写数据页。

事务提交时，优先确保必要的 Redo Log 按配置写入磁盘；脏页可以由后台线程稍后异步刷入数据文件。数据库异常退出后，InnoDB 可以从最近的 Checkpoint 开始重放 Redo Log，恢复没有完整写入数据文件的修改。

**Redo Log 记录什么**

Redo Log 记录的是物理日志：数据页发生了哪些底层修改，崩溃后应该怎样重做。例如：

```sql
UPDATE account SET balance = 900 WHERE id = 1;
```

可以抽象理解为：将某个数据页中某个位置的内容修改为新值。所以 Redo Log 通常被称为偏物理日志或物理逻辑日志。它不是简单保存原始 SQL：

```sql
UPDATE account SET balance = 900 WHERE id = 1;
```

**Redo Log 的主要作用**

```
事务持久性
数据库崩溃恢复
允许数据脏页延迟刷盘
将随机写转化为更有利的顺序日志写
```

Redo Log 使用持续递增的 LSN 标识日志位置；日志不断追加，随着 Checkpoint 推进，旧的、已经不再需要的 Redo 空间可以被复用。

### Undo Log

Undo Log，即回滚日志，主要用于：事务回滚、MVCC 历史版本读取

**Undo Log 记录什么**

Undo Log 保存的是：如何撤销事务最近一次对聚簇索引记录的修改。

例如数据原来是：`balance = 1000`，执行：

```sql
UPDATE account SET balance = 900 WHERE id = 1;
```

Undo Log 中会保留足够的信息，以便把记录恢复为：`balance = 1000`。如果事务执行 ROLLBACK，InnoDB 就根据 Undo Log 逆向撤销修改。

**Undo 如何支持 MVCC**

Undo Log 不只是用于回滚，还用于构造数据的历史版本。假设一行数据被多次修改：

```
当前版本：balance = 700
    ↓
旧版本：balance = 800
    ↓
旧版本：balance = 900
    ↓
旧版本：balance = 1000
```

当前记录通过隐藏的回滚指针指向 Undo Log，形成版本链。普通快照读执行时：

```sql
SELECT balance FROM account  WHERE id = 1;
```

如果当前版本对该事务不可见，InnoDB 会沿着 Undo 版本链向前查找，直到找到符合 Read View 可见性规则的版本。因此：

```
Undo Log
├── ROLLBACK 时撤销修改
└── MVCC 时提供历史数据版本
```

官方文档也明确说明，一致性读取需要旧数据时，会从 Undo Log 记录中取得未修改的数据。

**Undo Log 何时删除**

事务提交后，Undo Log 不一定立即清理。如果其他事务仍然持有旧的 Read View，它们可能还需要读取旧版本，因此相应 Undo 记录不能删除。等没有事务再需要这些历史版本后，Purge 线程才会进行清理。这也是长事务可能造成问题的原因：

```
长事务持有旧 Read View
        ↓
历史版本不能清理
        ↓
Undo Log 堆积
        ↓
版本链变长
        ↓
空间和查询成本增加
```

### Binlog

Binlog，即 Binary Log，属于 MySQL Server 层。它不属于 InnoDB，因此与存储引擎层面的 Redo Log 不同。

Binlog 属于逻辑日志，记录描述数据库变更的事件，例如：创建表、修改表结构、插入数据、修改数据、删除数据。它主要用于：主从复制、基于时间点的数据恢复、审计或数据订阅。

官方文档将复制和基于备份的时间点恢复列为 Binlog 的两个核心用途。

## MySQL 调优

MySQL 中的 SQL 调优，指的是：通过分析 SQL 的执行过程，减少扫描数据量、磁盘 I/O、排序、临时表、锁等待和网络传输，从而降低 SQL 响应时间与数据库资源消耗。

它不是单纯“给字段加索引”，而是从 SQL 写法、索引设计、表结构、数据量、执行计划和并发事务等多个方面共同优化。

核心目标：让 MySQL 少扫描、少回表、少排序、少创建临时表、少加锁、少传输数据。

**SQL 执行慢的一般原因**

一条 SQL 执行慢，常见原因包括：

```
没有合适索引
索引失效
扫描数据量过大
回表次数过多
发生文件排序
创建磁盘临时表
JOIN 顺序或关联字段不合理
分页偏移量过大
一次返回数据过多
事务持锁时间过长
锁等待或死锁
数据库资源不足
```

所以 SQL 调优不是只看 SQL 本身，还要判断慢在哪里。

### SQL 调优的基本流程

通常按照下面的顺序进行：

```
发现慢 SQL
    ↓
分析执行计划
    ↓
判断扫描量、索引、排序、临时表、回表情况
    ↓
优化 SQL 或索引
    ↓
重新测试执行计划和实际耗时
    ↓
观察是否影响写入和其他查询
```

1. 找到慢 SQL

   **方式一：通过慢查询日志**

   MySQL 可以记录执行时间超过阈值的 SQL。

   常见参数：

   ```sql
   SHOW VARIABLES LIKE 'slow_query_log';
   SHOW VARIABLES LIKE 'long_query_time';
   SHOW VARIABLES LIKE 'slow_query_log_file';
   ```

   例如：

   ```sql
   SET GLOBAL slow_query_log = ON;
   SET GLOBAL long_query_time = 1;
   ```

   表示记录执行时间超过 1 秒的 SQL。

   不过慢查询日志只告诉你哪些 SQL 慢，不直接告诉你为什么慢。

   **方式二：通过应用监控**

   实际项目中还可以通过：

   ```
   APM
   数据库监控平台
   连接池监控
   接口耗时日志
   Performance Schema
   ```

   定位高频、高耗时 SQL。调优时不能只关注单次最慢的 SQL，还要关注：

   ```
   单次很慢的 SQL
   执行频率非常高的 SQL
   单次不慢但累计消耗很大的 SQL
   ```

   例如：

   ```
   SQL A：每次 5 秒，每天执行 10 次
   SQL B：每次 20 毫秒，每秒执行 5000 次
   ```

   SQL B 对数据库的总体压力可能更大。

2. 使用 EXPLAIN 分析执行计划

   例如：

   ```sql
   EXPLAIN SELECT * FROM user WHERE phone = '13800138000';
   ```

   重点关注这些字段：

   ```
   type
   possible_keys
   key
   key_len
   rows
   filtered
   Extra
   ```

   **EXPLAIN 中的重要字段**

   - type 表示 MySQL 查找数据的方式。

     常见性能大致从好到差：`system > const > eq_ref > ref > range > index > ALL`。

     const 通过主键或唯一索引查找一条记录：

     ```sql
     SELECT * FROM user WHERE id = 1;
     ```

     eq_ref JOIN 时，被驱动表通过主键或唯一索引精确匹配一条记录。

     ref 通过普通索引进行等值查询：

     ```sql
     SELECT * FROM user WHERE age = 20;
     ```

     range 通过索引范围查询：

     ```sql
     SELECT * FROM user WHERE age BETWEEN 20 AND 30;
     ```

     index 扫描整棵索引，即全索引扫描。虽然扫描的是索引，但仍然可能扫描大量数据。

     ALL 全表扫描，即逐行扫描整张表。`ALL` 通常需要重点关注，但并不是看到 `ALL` 就一定需要优化。如果表只有几十行，全表扫描可能比使用索引更快。

   - rows 和 filtered

     rows 表示优化器预计需要扫描的行数。

     例如 `rows = 1000000` 说明扫描量可能很大。SQL 调优最直接的目标之一就是减少 `rows`。

     filtered 表示经过当前条件过滤后，预计保留的数据比例。

     例如 `rows = 100000, filtered = 1%` 说明扫描 10 万行，最后可能只保留 1000 行。

     如果扫描量很大、过滤比例很低，通常说明索引设计不理想。

   - Extra 中常见信息

     Using index 表示使用了覆盖索引，查询所需数据可以直接从索引获得，不需要回表。一般是较好的现象。

     Using where 表示读取数据后还需要根据 `WHERE` 条件进行过滤。它本身不一定是问题。

     Using filesort 表示 MySQL 需要额外进行排序，不能直接利用索引顺序返回结果。例如：

     ```sql
     SELECT * FROM user WHERE status = 1 ORDER BY create_time;
     ```

     如果没有合适的联合索引，可能出现 `Using filesort`，`filesort` 并不一定真的在磁盘中排序，只是表示使用了 MySQL 的额外排序算法。

     Using temporary 表示 MySQL 使用了临时表。常见于：GROUP BY、DISTINCT、复杂 ORDER BY、UNION、复杂 JOIN，如果临时表过大并落盘，性能可能明显下降。

     Using index condition 表示使用了索引条件下推，即 ICP。MySQL 在索引层先过滤部分数据，减少回表数量，通常是有利的。

3. 索引层面优化

   - 建立合理索引

     假设查询：

     ```sql
     SELECT * FROM user WHERE phone = '13800138000';
     ```

     如果 `phone` 没有索引，可能全表扫描。可以建立索引：

     ```sql
     CREATE INDEX idx_phone ON user(phone);
     ```

     但索引不是越多越好。索引会带来：额外磁盘空间、INSERT 变慢、UPDATE 变慢、DELETE 变慢、优化器选择成本增加。因此应该为高频查询条件建立合理索引，而不是给所有字段都加索引。

   - 建立合理联合索引

     例如查询：

     ```sql
     SELECT id, create_time FROM orders WHERE user_id = 100 AND status = 1 ORDER BY create_time DESC;
     ```

     可以考虑联合索引：

     ```sql
     CREATE INDEX idx_user_status_time ON orders(user_id, status, create_time);
     ```

     该索引可以帮助完成：

     ```
     user_id 等值过滤
     status 等值过滤
     create_time 排序
     ```

     联合索引的字段顺序一般需要考虑：

     ```
     等值查询字段
     范围查询字段
     排序和分组字段
     字段区分度
     查询频率
     ```

     常见经验是：

     ```
     等值条件通常放前面
     范围条件通常放后面
     需要利用索引排序的字段应放在合适位置
     ```

     但不能机械地说“区分度最高的字段一定放最左边”，因为还要结合查询模式。

   - 索引失败的情况

     - 对索引列做运算或函数调用

       ```sql
       -- 索引失效
       SELECT * FROM users WHERE YEAR(birthday) = 1990;
       -- 优化后
       SELECT * FROM users WHERE birthday >= '1990-01-01' AND birthday < '1991-01-01';
       ```

     - 隐式类型转换

       ```sql
       -- phone 是 varchar 类型，传入数字会触发隐式转换
       SELECT * FROM users WHERE phone = 13800138000;  -- 索引失效
       SELECT * FROM users WHERE phone = '13800138000';  -- 正常走索引
       ```

     - OR 条件中有非索引字段

       ```sql
       -- 假设 name 有索引，age 没有
       SELECT * FROM users WHERE name = '张三' OR age = 25;  -- 全表扫描
       ```

     - 联合索引不满足最左匹配

       ```sql
       -- 索引是 (a, b, c)
       SELECT * FROM t WHERE b = 1;  -- 索引失效
       SELECT * FROM t WHERE a = 1 AND c = 3;  -- 只能用到 a
       ```

     - like 左侧通配符

       比如 `WHERE name LIKE '%XX'`，这种是无法使用上索引的。

     - 优化器的选择

       不是有索引 MySQL 就一定会选，它是基于成本来选择执行计划，有时候全表扫描可能比用二级索引更快。

4. SQL 层面优化

   - 禁止 `SELECT *`，只查必要字段，减少网络传输和内存
   - 避免 `%LIKE` 前缀模糊查询，`LIKE '%关键词'` 必然全表查询
   - 连表查询时，检查字段字符集是否一致，utf8 和 utf8mb4 的字段 JOIN 会导致隐式转换，索引直接废掉

5. 架构层面优化

   - 热点数据上 Redis 缓存，访问频率高但变化少的数据没必要每次都查库
   - 大表考虑分库分表，单表超过 2000 万行查询性能会明显下降
   - 读写分离，把查询压力分摊到从库

6. 业务层面优化

   - 少展示一些不必要的字段
   - 减少多表查询的情况
   - 将列表查询替换成分页分批查询等

## MySQL 的主从同步机制

MySQL 主从同步，也叫主从复制。更准确的术语是：

```
Source：源库，通常称主库
Replica：副本库，通常称从库
```

它的核心机制是：主库把已经提交的数据变更记录到 Binlog，从库拉取 Binlog 写入自己的 Relay Log，再由应用线程重放这些事件，从而得到与主库相同的数据。

因此，主从复制传输的主要是 **Binlog 事件**，不是直接复制数据文件，也不是传输 Redo Log。

**完整流程**

```
客户端在主库执行事务
        ↓
主库修改数据并写入 Binlog
        ↓
主库 Binlog Dump 线程发送 Binlog
        ↓
从库 I/O Receiver 线程接收
        ↓
写入从库 Relay Log
        ↓
从库 SQL Applier 线程读取 Relay Log
        ↓
重新执行数据变更
        ↓
从库数据逐渐追上主库
```

MySQL 复制主要涉及三类线程：

```
主库：Binlog Dump Thread  -  监听 binlog 变更，有新内容就推事件给从库
从库：Replication I/O Receiver Thread  -  拉取主库数据，把收到的 binlog 写进本地的 relay log
从库：Replication SQL Applier Thread  -  读 relay log，逐条执行 SQL 语句
```

从库也可以配置多个并行 Applier Worker，以并行应用事务、降低复制延迟。

**主库如何产生同步数据**

假设在主库执行：

```sql
START TRANSACTION;

UPDATE account SET balance = balance - 100 WHERE id = 1;

UPDATE account SET balance = balance + 100 WHERE id = 2;

COMMIT;
```

主库大致完成：

```
1. InnoDB 修改数据
2. 写入 Undo Log、Redo Log
3. 事务提交时写入 Binlog
4. Redo Log 和 Binlog 通过内部两阶段提交保持一致
5. 客户端收到提交结果
```

这里需要区分：

```
Redo Log
→ InnoDB 自己用于崩溃恢复

Binlog
→ Server 层用于复制和时间点恢复
```

主从同步使用的是 Binlog。对于事务表，事务中的 Binlog 事件会作为一个事务整体提交，从库也按照事务边界应用，而不是把一个事务任意拆成几个独立提交。

**主库：Binlog Dump Thread**

当从库连接主库后，主库会为它创建一个 Binlog Dump 线程。它的任务是：

```
1. 确定从库需要从哪个位置开始同步
2. 读取对应的 Binlog 事件
3. 通过网络把 Binlog 事件发送给从库
```

一台主库可以连接多个从库，通常会为不同的复制连接提供相应的发送线程。官方文档将它描述为主库向已连接从库发送 Binlog 内容的线程。

**从库：Replication I/O Receiver Thread**

从库执行 `START REPLICA;`，之后会启动复制接收线程，也就是常说的 I/O 线程。它负责：

```
1. 连接主库
2. 请求尚未接收的 Binlog
3. 接收主库发送的 Binlog 事件
4. 把事件写入本地 Relay Log
5. 记录自己读取到主库的哪个位置
```

因此，从库不是接收到事件后立即由同一个线程修改数据，而是先落入中继日志：

```
主库 Binlog
    ↓
网络传输
    ↓
从库 Relay Log
```

I/O 线程和应用线程相互分离：即使应用数据暂时较慢，I/O 线程仍可能继续接收主库日志。

**从库：Replication SQL Applier Thread**

从库的 SQL Applier 线程负责：

```
1. 读取 Relay Log
2. 获取其中的事务事件
3. 在从库执行对应的数据变更
4. 更新已执行位置
```

例如主库 Binlog 中记录 `将 account 表 id = 1 的 balance 从 1000 改为 900`，从库的应用线程便在本地执行相应修改。所以，从库的数据是否真正追上主库，主要取决于 Applier 执行到了哪里，而不只是 I/O 线程接收到了哪里。

需要区分两个进度：

```
接收进度 → 从库已经从主库取得多少 Binlog
应用进度 → 从库已经实际执行多少 Binlog
```

可能出现：

```
主库 Binlog：已发送到位置 10000
从库 Relay Log：已接收到位置 10000
从库数据：只应用到位置 8000
```

此时日志已经到达从库，但数据仍存在延迟。

### Biglog 的三种复制格式

主从同步发送的是 Binlog 事件，事件主要可以采用三种格式。

1. Statement Based Replication

   记录原始 SQL：

   ```sql
   UPDATE account SET balance = balance - 100 WHERE id = 1;
   ```

   从库重新执行相同 SQL。优点：

   ```sql
   日志通常较小
   可读性相对较好
   ```

   问题是某些依赖执行环境、执行顺序或非确定函数的 SQL，可能导致主从执行结果不同。

2. Row Based Replication

   记录具体哪些行发生了怎样的变化，例如：

   ```
   表：account
   主键：id = 1
   balance：1000 → 900
   ```

   从库按照行事件修改对应数据。它不是简单地重新运行原 SQL，因此复制结果通常更加确定。

3. Mixed Based Replication

   MySQL 根据语句特征，在 Statement 和 Row 之间选择。MySQL 官方将 Statement、Row 作为两种核心复制格式，同时支持 Mixed 格式。现代业务通常优先使用 Row 格式，因为它对复制一致性更有利。

### 三种复制模式

MySQL 支持异步、同步、半同步三种复制模式，区别在于主库什么时候给客户端返回响应。

**异步复制**

经典 MySQL 主从复制默认属于异步复制：主库事务提交后，主库返回客户端成功，但从库可能稍后才接收和执行。

主库提交事务时，不必等待从库确认已经收到或执行该事务。因此性能和可用性较高，但存在数据丢失风险：

```
主库已经提交事务
    ↓
事务尚未传输到从库
    ↓
主库突然宕机
    ↓
切换到从库
    ↓
从库缺少最近的部分事务
```

官方文档明确指出，异步复制下主库并不知道从库是否以及何时取得、处理事务；如果主库故障，已提交但尚未传输的事务可能不存在于任何从库。

因此，经典异步复制提供的通常是：最终一致性，而不是主从实时强一致。

**半同步复制**

半同步复制介于异步复制和完全同步复制之间。其基本流程是：

```
主库写入事务 Binlog
        ↓
将事件发送给从库
        ↓
至少一个从库接收事件
        ↓
从库写入 Relay Log 并刷盘
        ↓
从库返回 ACK
        ↓
主库向客户端返回事务成功
```

关键点是：半同步等待的是至少一个从库确认“已收到并持久化日志”，通常不是等待该事务已经在从库执行完成。

所以收到 ACK 时可能是：

```
从库 Relay Log 中已经有该事务
但 Applier 线程还没有把事务应用到数据表
```

半同步复制可以降低主库宕机时事务完全丢失的风险，但会增加至少一次网络往返延迟。若等待从库确认超时，MySQL 可以退化为异步复制；待半同步从库重新追上后，再恢复半同步模式。

### 主从延迟

**发生的原因**

主从延迟的本质是：主库产生 Binlog 的速度 > 从库接收或应用 Binlog 的速度

常见原因包括：

```
主库写入并发很高
从库 CPU、磁盘性能较差
大事务需要很长时间重放
从库并行复制能力不足
从库还承担大量查询
网络延迟或网络抖动
表缺少索引，导致从库执行更新较慢
锁等待或长事务阻塞应用线程
DDL 执行时间过长
```

尤其是大事务：

```sql
UPDATE orders SET status = 1 WHERE create_time < '2025-01-01';
```

主库可能经过一段时间后一次性提交该事务，从库也必须完整执行这个大事务，期间复制位置可能长时间无法推进。

**主从延迟会导致的问题**

假设采用读写分离：

```
写请求 → 主库
读请求 → 从库
```

客户端刚执行 `INSERT INTO orders(...);`，主库返回成功后立即查询：

```sql
SELECT * FROM orders WHERE id = ?;
```

如果查询被路由到从库，而对应 Binlog 尚未应用，就可能查不到刚插入的数据，这叫写后读不一致（Read-after-write inconsistency）。常见解决方式包括：

```
写入后的关键查询短时间内走主库
同一事务内读写都走主库
等待从库执行到指定 GTID
对强一致业务不使用普通异步从库读取
业务上容忍最终一致性
```

所以主从同步不能简单理解为：主库一提交，从库的数据就立即完全相同。

### 如果主库挂了，怎么把从库提升为主库？



### 总结

```
MySQL 主从同步
│
├── 主库
│   ├── 执行事务
│   ├── 写入 Binlog
│   └── Binlog Dump 线程发送日志
│
├── 从库接收
│   ├── I/O Receiver 线程接收 Binlog
│   └── 写入 Relay Log
│
├── 从库应用
│   ├── SQL Applier 读取 Relay Log
│   ├── 单线程或多线程重放事务
│   └── 修改从库数据
│
├── 定位方式
│   ├── Binlog 文件名 + Position
│   └── GTID
│
└── 同步模式
    ├── 异步：主库不等待从库
    ├── 半同步：等待至少一个从库确认收到并落盘
    └── 完全同步：经典 MySQL 主从复制通常不提供
```

## MySQL 中实现读写分离

MySQL 读写分离，是指：把写请求统一发送到主库，把部分读请求发送到从库，以分担主库压力、提高整体查询吞吐量。它通常建立在主从复制基础上。

```
写请求：INSERT、UPDATE、DELETE
                ↓
              主库
                ↓ Binlog 复制
              从库

         读请求：SELECT
                ↓
        主库或一个/多个从库
```

### 需要读写分离的原因

很多业务系统都有明显的“读多写少”特征，例如：商品查询很多，订单查询很多，用户信息查询很多，真正的新增、修改、删除相对较少。

如果所有请求都访问主库，主库既负责写入，又负责大量查询。主库的 CPU、磁盘 I/O、Buffer Pool 和连接数压力会比较大。

读写分离后，主库主要写操作，从库主要分担读操作。从而实现，提高读吞吐量，减轻主库压力，利用多个从库横向扩展查询能力。

> 还有一种实践操作就是，主库不建查询索引，从库建。索引是有维护成本的，每次写操作不光要改数据，还要更新所有相关的二级索引。读请求都走从库了，主库上那些查询索引就是累赘，删掉能提升写入性能。

**带来的优势与局限**

优势：提高查询吞吐量，降低主库查询压力，支持增加从库横向扩展读能力，从库可承担报表、统计和备份任务，故障时具备数据副本。

局限：

- 不能扩展写能力

  读写分离只是把读请求转移到从库，写请求仍然全部进入主库。如果系统瓶颈主要是写入，增加从库没有明显帮助。写压力过大时可能需要：

  ```
  分库分表
  业务拆分
  缓存
  批量写入
  异步化
  更高性能主库
  ```

- 存在复制延迟，这是最核心的问题

- 增加系统复杂度

  需要处理主从状态，请求路由，从库故障，复制延迟，事务绑定，故障切换，一致性要求。

- 从库不一定更快

  如果从库同时承担大量查询、备份、报表分析、数据导出、复制重放等，它的压力也可能很高。

- 主库故障不等于自动切换从库

  读写分离和高可用是两个不同问题。还需要主库故障检测，选举新主库，提升从库，修改复制拓扑，切换应用写入地址，防止旧主库继续写入。

### 读写分离的基本架构

例如：

```
                应用程序
                    ↓
              数据库代理/路由
             ↙              ↘
         写请求              读请求
           ↓                   ↓
         主库              从库1、从库2
           ↓
        Binlog 复制
           ↓
      从库1、从库2
```

常见规则：

```
INSERT → 主库
UPDATE → 主库
DELETE → 主库
DDL → 主库

普通 SELECT → 从库
强一致 SELECT → 主库
事务中的 SELECT → 通常主库
```

**不是所有 SELECT 都走从库**

下面这些 SELECT 通常应走主库。

- 事务中的查询

  ```sql
  START TRANSACTION;
  UPDATE product SET stock = stock - 1 WHERE id = 1;
  SELECT stock FROM product WHERE id = 1;
  COMMIT;
  ```

  必须保证读到本事务修改后的数据。

- 锁定读

  ```sql
  SELECT * FROM product WHERE id = 1 FOR UPDATE;
  SELECT * FROM product WHERE id = 1 FOR SHARE;
  ```

  这种查询后续通常伴随修改，而且需要锁定主库中的真实写入数据，所以必须走主库。

- 强一致查询

  例如：账户余额、库存、支付结果、订单创建结果、权限变更结果

- 使用临时状态或会话状态的查询

  某些 SQL 依赖当前连接状态，例如：临时表、用户变量、会话变量、刚执行的事务上下文。不能简单切换到另一台从库连接。

### 最大问题：主从延迟

MySQL 经典主从复制通常是异步的。也就是说，主库提交成功时，从库可能还没有执行对应事务。例如：

```
1. 用户在主库创建订单
2. 主库返回创建成功
3. 应用立即从从库查询订单
4. 从库尚未同步完成
5. 查询结果：订单不存在
```

这叫写后读不一致（Read-after-write inconsistency）。所以读写分离通常只能天然提供最终一致性，而不是实时强一致性。

**如何解决写后读不一致**

1. 写后立即读主库

   用户写入数据后的相关查询，短时间内继续访问主库。例如：

   ```
   创建订单
       ↓ 主库
   查询刚创建的订单
       ↓ 主库
   后续普通查询
       ↓ 从库
   ```

   这是最常见的方式。

2. 事务内所有操作都走主库

   例如：

   ```sql
   START TRANSACTION;
   
   UPDATE account
   SET balance = balance - 100
   WHERE id = 1;
   
   SELECT balance
   FROM account
   WHERE id = 1;
   
   COMMIT;
   ```

   事务中的查询必须读取本事务修改后的数据，通常不能随意路由到从库。因此一般规则是，一旦进入事务，整个事务绑定主库连接。

3. 强一致查询指定主库

   例如，支付结果，账户余额，库存扣减结果，权限状态，刚创建的数据。这些查询通常应该访问主库。而商品列表、历史日志、统计报表、推荐内容、非实时排行榜查询可以接受从库的短暂延迟：

4. 等待从库追上指定位置

   更严格的方式是

   ```
   写入主库
       ↓
   获得 Binlog Position 或 GTID
       ↓
   等待从库执行到该位置
       ↓
   再从从库读取
   ```

   这种方式一致性更强，但会增加等待时间和系统复杂度。

### 读请求如何在多个从库之间分配

如果存在多个从库：从库1、从库2、从库3。读请求可以通过负载均衡分发。常见策略包括：轮询、随机、加权轮询、最少连接、按延迟选择、按机房选择。

例如：

```
从库1 性能较高：权重 5
从库2 性能一般：权重 3
从库3 性能较低：权重 1
```

但不能只看机器性能，还要关注：复制延迟、连接数、CPU 使用率、磁盘压力、从库是否正常。如果某个从库延迟很高，代理应该暂时停止把实时查询发送给它。

### 读写分离与事务的关系

事务需要绑定到同一个数据库连接。假设：

```sql
START TRANSACTION;
UPDATE account SET balance = 900 WHERE id = 1;
SELECT balance FROM account WHERE id = 1;
COMMIT;
```

如果 `UPDATE` 走主库，而 `SELECT` 被路由到从库，就会破坏事务语义：从库看不到当前事务未提交的数据，不同连接不属于同一个事务。所以一般规则是：

```
非事务普通读 → 可以走从库
事务读写 → 全部绑定主库
写后强一致读 → 主库
```

### 读写分离的实现

读写分离的实现方式主要有三种。

**应用代码自行路由**

应用中配置两个数据源，主数据源和从数据源。根据业务决定访问哪个数据源。例如：

```java
@Service
public class OrderService {
    public void createOrder() {
        // 使用主库
    }
    public Order getOrderForUpdate(Long id) {
        // 使用主库
        return null;
    }
    public List<Order> listOrders() {
        // 使用从库
        return null;
    }
}
```

优点：业务控制精确，可以明确区分强一致和弱一致查询。

缺点：代码侵入性较强，需要自己管理数据源切换，事务处理较复杂，容易错误路由。

在 Spring 中通常会使用：

```
AbstractRoutingDataSource
AOP
自定义注解
```

实现动态数据源切换。

**数据库代理中间件**

应用只连接代理，由代理判断 SQL 类型并转发。

```
应用
  ↓
ProxySQL / MySQL Router / ShardingSphere-Proxy / MyCat
  ↓
主库、从库
```

代理可以根据 SQL 自动路由：写 SQL → 主库，读 SQL → 从库

优点：应用侵入较小，统一管理路由，可以做负载均衡、故障切换。

缺点：增加了一层网络和组件，代理自身需要高可用，复杂 SQL 和事务路由可能出错，运维复杂度增加。

主流中间件对比：

| 中间件               | 维护方      | 特点                                       | 适用场景       |
| -------------------- | ----------- | ------------------------------------------ | -------------- |
| MySQL Router         | Oracle 官方 | 轻量，配合 InnoDB Cluster 使用             | 官方技术栈用户 |
| ProxySQL             | 开源社区    | 功能强大，支持查询缓存、读写分离、负载均衡 | 高性能场景     |
| ShardingSphere-Proxy | Apache      | 支持分库分表 + 读写分离                    | 需要分片的场景 |
| MyCat                | 开源社区    | 国内用户多，文档丰富                       | 中小规模项目   |

ProxySQL 性能最好，单机能抗几十万 QPS，还支持查询缓存、连接池复用、SQL 防火墙。如果只做读写分离不涉及分库分表，ProxySQL 是首选。

**数据库驱动或框架路由**

某些数据库驱动、连接池或分库分表框架能够根据配置选择主库和从库。例如：

```
ShardingSphere-JDBC
某些云数据库读写分离连接地址
```

应用连接逻辑地址，由框架或云服务完成路由。

### 读写分离与缓存、分库分表的区别

**与缓存的区别**

读写分离：读请求仍然访问 MySQL，只是由从库承担。

缓存：部分读请求不访问 MySQL，直接读取 Redis 等缓存。

缓存通常能提供更高读性能，但会产生：缓存一致性、缓存穿透、缓存击穿、缓存雪崩等问题。

实际系统常见组合是：

```
热点读 → Redis
普通读 → MySQL 从库
强一致读写 → MySQL 主库
```

**与分库分表的区别**

读写分离：每个节点通常保存同一份数据，主库负责写，从库负责读，目标是扩展读能力。

分库分表：不同节点保存不同的数据分片，读写请求都根据分片键路由，目标是扩展数据容量和读写能力。

例如：

```
读写分离：主库和从库都有全部订单数据

分库分表：
订单 1～1000 在数据库 A
订单 1001～2000 在数据库 B
```

二者可以同时使用：

```
分片 A：1 主 2 从
分片 B：1 主 2 从
分片 C：1 主 2 从
```

## MySQL 的单点故障

MySQL 的单点故障（Single Point of Failure，SPOF），指的是：系统中某个关键组件只有一个实例，一旦它发生故障，整个数据库服务或某项核心功能就会不可用。

MySQL 系统中的单点并不只指数据库服务器。

### 常见的单点位置

1. 主库单点

   所有写请求都依赖唯一主库，主库宕机后无法写入。

2. 数据库代理单点

   所有请求都通过唯一代理。代理故障后，应用无法访问数据库集群。

3. 负载均衡器单点

   即使部署了多个代理，但它们前面只有一个负载均衡节点，这个负载均衡节点也可能成为单点。

4. 存储单点

   多台数据库服务器共用同一套存储设备。如果共享存储故障，所有数据库节点可能同时不可用。

5. 网络单点

   所有数据库连接都经过同一台交换机、同一条网络链路、同一个机房出口，网络设备故障后，数据库机器即使正常运行，也可能无法访问。

6. 机房或可用区单点

   主库和所有从库都部署在同一个机房。如果整个机房断电或网络中断，所有节点会同时失效。

7. 运维控制组件单点

   例如只有一个故障检测和切换组件：Orchestrator / MHA Manager / 集群管理节点。如果管理组件失效，可能无法自动完成故障转移。不过管理组件是否直接影响现有数据库读写，要看具体架构。

### 如何解决单点故障

1. 主从复制 + 读写分离

   主库负责处理写请求，从库处理读请求。主库挂了可以把从库提升为主库继续服务。这是最基础的方案，大部分公司都在用。

2. 实现自动故障转移

   常见方案包括：

   ```
   MySQL InnoDB Cluster
   MySQL Group Replication
   Orchestrator
   MHA
   云数据库高可用版
   ```

   它们可以在主节点故障时完成部分或全部操作：检测故障、选择新主库、提升从库、重建复制关系、通知或更新路由。

3. 对代理层做高可用

   代理至少部署多个实例，再通过：Keepalived + VIP、负载均衡器、服务发现、客户端多地址。避免代理自身成为单点。

4. 主备架构

   备库平时不对外服务，只是默默同步主库数据。主库挂了备库顶上，相比主从的区别是备库不分担读流量，但切换更简单。

## 分库分表（解决单机存储和写入瓶颈的最后手段，慎用）

分库分表，指的是：当单个 MySQL 实例或单张表的数据量、访问量、写入量过大时，把原本集中存放的数据拆分到多个数据库或多张表中，以分散存储和访问压力。

它解决的核心问题是：

```
单库容量过大
单表数据过多
单库读写压力过高
单机性能达到瓶颈
```

可以先记住：

```
分库：把数据拆到不同数据库
分表：把数据拆到不同数据表
```

**为什么要分库分表**

假设有一张订单表：

```sql
CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT,
    amount DECIMAL(10, 2),
    status INT,
    create_time DATETIME
);
```

随着业务增长，可能出现：

```
订单数量达到几亿甚至几十亿
索引体积非常大
查询扫描成本提高
索引树层级增加
备份、恢复时间变长
大批量更新和删除困难
单库 CPU、磁盘和连接数达到瓶颈
```

即使 SQL 和索引已经优化，单台服务器的资源仍然有上限：CPU 有上限，内存有上限，磁盘 I/O 有上限，网络带宽有上限，连接数有上限。这时就需要把数据和请求分散出去。

### 分库分表的四种常见形式

通常分为：垂直分库、垂直分表、水平分库、水平分表

其中：

- 垂直拆分：按照业务或字段拆。
- 水平拆分：按照数据行拆。

1. 垂直分库：按照业务模块，把原来同一个数据库中的表拆到不同数据库中。

   例如原来所有表都放在一个数据库：

   ```
   shop_db
   ├── user
   ├── user_address
   ├── product
   ├── category
   ├── orders
   ├── order_item
   └── payment
   ```

   可以按照业务拆分：

   ```
   user_db
   ├── user
   └── user_address
   
   product_db
   ├── product
   └── category
   
   order_db
   ├── orders
   └── order_item
   
   payment_db
   └── payment
   ```

   这就是垂直分库。微服务架构基本都是这么干的。

   优点：不同业务独立部署、降低单库压力、故障隔离更好、不同业务可以独立扩容、便于微服务划分。例如订单业务流量很高，可以单独扩容 `order_db`，不会直接影响用户库。

   缺点：原来在一个数据库中可以直接 JOIN：

   ```sql
   SELECT o.id, u.name
   FROM orders o
   JOIN user u ON o.user_id = u.id;
   ```

   垂直分库后，`orders` 和 `user` 位于不同数据库，跨库 JOIN 会变得困难。还会出现：跨库事务、跨库统计、数据一致性、服务之间调用、部署运维复杂度增加。

2. 垂直分表：把一张字段很多、单行数据很大的表，按照字段用途拆成多张表。

   例如用户表：

   ```sql
   CREATE TABLE user (
       id BIGINT PRIMARY KEY,
       username VARCHAR(50),
       phone VARCHAR(20),
       password VARCHAR(100),
       avatar TEXT,
       description TEXT,
       id_card_image TEXT,
       create_time DATETIME
   );
   ```

   可以拆成：

   ```
   user_base
   ├── id
   ├── username
   ├── phone
   ├── password
   └── create_time
   
   user_profile
   ├── user_id
   ├── avatar
   ├── description
   └── id_card_image
   ```

   常用的小字段放在主表，不常用的大字段放在扩展表。

   优点：减少单行数据大小、提高数据页有效利用率、提高 Buffer Pool 缓存命中率、普通查询不必读取大字段、降低表结构耦合。

   例如登录查询只需要：

   ```sql
   SELECT id, username, password FROM user_base WHERE phone = ?;
   ```

   不需要读取头像、简介等大字段。

   缺点：查询完整用户信息时，需要 JOIN 或多次查询：

   ```sql
   SELECT * FROM user_base b JOIN user_profile p ON b.id = p.user_id WHERE b.id = 1;
   ```

   因此垂直分表适合：字段很多，存在大量 TEXT、BLOB 等大字段，部分字段访问频率很低，冷热字段差异明显。

3. 水平分表：表结构不变，把同一张表中的不同行拆到多张表中。

   例如原来只有 `orders`，拆成：

   ```
   orders_0
   orders_1
   orders_2
   orders_3
   ```

   这些表结构完全相同，只是保存的数据不同。例如按照用户 ID 取模 `user_id % 4`。路由规则：

   ```
   user_id % 4 = 0 → orders_0
   user_id % 4 = 1 → orders_1
   user_id % 4 = 2 → orders_2
   user_id % 4 = 3 → orders_3
   ```

   例如：

   ```
   user_id = 1001
   1001 % 4 = 1 → 查询 orders_1
   ```

   这就是水平分表。

   优点：降低单表数据量，减小单表索引体积，提高单表查询和维护效率，降低大表 DDL、备份和归档成本。

   缺点：需要分片路由，跨表查询困难，分页、排序、聚合复杂，扩容迁移困难，全局唯一 ID 需要额外设计。

4. 水平分库：把同一种业务数据按照分片规则拆到多个数据库实例中。

   例如订单数据拆到：

   ```
   order_db_0
   order_db_1
   order_db_2
   order_db_3
   ```

   每个库中都有结构相同的订单表：

   ```
   order_db_0.orders
   order_db_1.orders
   order_db_2.orders
   order_db_3.orders
   ```

   仍然可以按照 `user_id % 4` 选择数据库。例如：

   ```
   user_id = 1001
   1001 % 4 = 1 → order_db_1.orders
   ```

   水平分库不仅降低单表数据量，还能分散：CPU 压力，磁盘 I/O，内存压力，数据库连接数，写入压力。

   因此，水平分表主要拆分单表数据量；水平分库还能拆分数据库实例的整体资源压力。

## 基础

### 数据库视图

视图是一张虚拟表，本身不存数据，每次查询时现场执行定义好的 SQL 去底层表里取数据。可以把它理解为一条起了名字的 SELECT 语句，查视图就等于执行那条 SQL。

用途就是：

- 封装复杂查询
- 控制数据访问权限
- 提供稳定的接口，底层表结构改了，只要调整视图定义，上层应用不用动。

### 数据库游标

游标是一种让程序逐行遍历查询结果集的机制，类似于编程语言里的迭代器。普通的 SELECT 语句一次性就把所有结果返回给客户端，但有时候结果集太大不适合一次性加载，或者需要每一行做复杂的逻辑判断，这时候游标就派上用场了。

## 数据库事务如何解决并发操作

### 示例

```java
@Override
@Transactional(rollbackFor = Exception.class)
public long addTeam(Team team, User loginUser) {
    
    ...
    
	// 7. 校验用户最多创建 5 个队伍
    // todo 有 bug，可能同时创建 100 个队伍
    QueryWrapper<Team> queryWrapper = new QueryWrapper<>();
    queryWrapper.eq("userId", userId);
    long hasTeamNum = this.count(queryWrapper);
    if (hasTeamNum >= 5) {
        throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户最多创建 5 个队伍");
    }
    // 8. 插入队伍信息到队伍表
    team.setId(null);
    team.setUserId(userId);
    boolean result = this.save(team);
    Long teamId = team.getId();
    if (!result || teamId == null) {
        throw new BusinessException(ErrorCode.PARAMS_ERROR, "创建队伍失败");
    }
    // 9. 插入用户  => 队伍关系到关系表
    UserTeam userTeam = new UserTeam();
    userTeam.setUserId(userId);
    userTeam.setTeamId(teamId);
    userTeam.setJoinTime(new Date());
    result = userTeamService.save(userTeam);
    if (!result) {
        throw new BusinessException(ErrorCode.PARAMS_ERROR, "创建队伍失败");
    }
    return teamId;
}
```

上述代码存在同一个用户短时间多次点击创建按钮，创建 100 个队伍的情况，远远超出最大队伍数量限制。

解决方案如下：

1. **添加数据库唯一索引**

   这是最简单粗暴但也最有效的方法。虽然逻辑上无法完全阻止插入，但可以在数据库层面拦截重复数据。

   但这道题是限制“数量”，不是限制“唯一性”，所以**唯一索引不适用**。

   唯一索引添加方式如下：

   ```sql
   ALTER TABLE user_team
   ADD UNIQUE INDEX idx_user_team_unique (userId, teamId);
   ```

   含义：`userId` 和 `teamId` 这两个字段合起来必须是唯一的。

2. **悲观锁（`SELECT ... FOR UPDATE`）**——推荐

   既然怕别人插队，那就把数据**锁住**。在查询数量的时候，直接锁住该行（或者整个表，但性能差），让其他请求排队。

   使用 MyBatis-Plus 的 `LambdaQueryWrapper` 配合自定义 SQL，或者直接用 JPA 的锁注解。但在 MP 中，最简单的是使用 **`updateWrapper` 强行加锁** 或者自定义 Mapper 方法。更通用的做法是使用 **`SELECT ... FOR UPDATE`**。

   改造方案（示例代码来自-伙伴匹配项目）：

   - 在 UserMapper.java 增加行锁方法（SELECT ... FOR UPDATE）：

     ```java
     @Select("SELECT id FROM `user` WHERE id = #{userId} FOR UPDATE")
     Long lockUserById(@Param("userId") Long userId);
     ```

   - 在 TeamServiceImpl.java 注入 UserMapper，并在 addTeam 里、count 之前执行：

     ```java
     Long lockedUserId = userMapper.lockUserById(userId);
     if (lockedUserId == null) {
         throw new BusinessException(ErrorCode.NOT_LOGIN);
     }
     ```

     保持 @Transactional 覆盖整个 addTeam（你现在已有），这样锁会在事务提交/回滚时释放；之后再做 count 和 save。

   - 给 `team.userId` 建索引（主键也可以）：

     ```sql
     CREATE INDEX idx_team_user_id ON team(userId);
     ```

   - 验证方式：同一账号并发 50~100 次创建队伍，请求结束后执行

     ```sql
     SELECT COUNT(*) FROM team WHERE userId = ?;
     ```

     结果应始终 <= 5。

   补充：这种方案只串行化“同一用户”的创建，不会影响不同用户并发。即数据库并不会锁住整张表，而是会锁定查询条件命中的**特定行**。

   - 锁定目标：`WHERE id = ?` 中的 `id` 是用户的主键。
   - 锁定效果：数据库只会对查询到的那一行用户记录加上排他锁。

   同一用户并发：

   - 用户 A 发起“请求 1”，锁定了 `user` 表中 `id=A` 的那一行。
   - 用户 A 发起“请求 2”，也想锁定 `id=A` 的那一行。
   - **结果**：“请求 2”会被阻塞，必须等待“请求 1”的事务结束（提交或回滚）释放锁之后，才能继续执行。这就实现了对**同一用户**操作的串行化。

   不同用户并发：

   - 用户 A 发起请求，锁定了 `user` 表中 `id=A` 的那一行。
   - 用户 B 发起请求，需要锁定 `user` 表中 `id=B` 的那一行。
   - **结果**：它们锁定的是完全不同的两行数据，互不干扰，可以**并行执行**。

3. **Redis 分布式锁**

   ```java
   // 使用 Redisson 等工具
   RLock lock = redissonClient.getLock("addTeamLock:" + userId);
   lock.lock();
   try {
       // 1. 查数量
       // 2. 判断
       // 3. 插入
   } finally {
       lock.unlock();
   }
   ```

   

   

   

   

   
