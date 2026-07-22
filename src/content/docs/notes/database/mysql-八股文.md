---
title: MySQL 数据库
sidebar:
  order: 5
---

## 数据库三大范式



## MySQL 的索引

MySQL 的索引，可以理解为数据库为表中数据建立的一种“快速查找结构”。

没有索引时，MySQL 查询数据通常需要从第一行开始逐行扫描，这叫全表扫描。建立索引后，MySQL 可以通过索引快速定位到目标记录，类似于通过书的目录直接找到某一页，而不是从头翻到尾。

例如有一张用户表：

```mysql
CREATE TABLE user (
    id BIGINT PRIMARY KEY,
    name VARCHAR(50),
    phone VARCHAR(20)
);
```

查询手机号：

```mysql
SELECT * FROM user WHERE phone = '13800138000';
```

如果 `phone` 没有索引，MySQL 可能需要检查表中的每一行。如果给 `phone` 建立索引：

```mysql
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

```mysql
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

```mysql
WHERE 条件查询
JOIN 关联查询
ORDER BY 排序
GROUP BY 分组
MIN()、MAX() 查询
```

例如：

```mysql
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

3. 可重复读

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

1. 快照读

   普通查询通常属于快照读：

   ```sql
   SELECT * FROM user WHERE id = 1;
   ```

   快照读通过 MVCC 读取符合当前事务可见性规则的数据版本，一般不会对记录加行锁。

2. 当前读

   当前读读取记录的最新版本，并对记录加锁。常见当前读：

   ```sql
   SELECT * FROM user WHERE id = 1 FOR UPDATE;
   SELECT * FROM user WHERE id = 1 FOR SHARE;
   UPDATE
   DELETE
   INSERT
   ```

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

## MySQL 的锁



## MySQL 的日志







## MySQL 调优





## MySQL 的主从同步机制







## 数据库事务如何解决并发操作

事务通过其四大特性（ACID）中的 **隔离性 (Isolation)** 来解决并发带来的问题，而不是消除并发本身。

事务的**隔离性**确保了多个事务并发执行时，它们之间互不干扰，每个事务都感觉不到有其他事务在同时执行。

数据库通过**锁机制**或**多版本并发控制 (MVCC)** 等技术来实现隔离性。为了在性能和数据一致性之间取得平衡，SQL 标准定义了四种**事务隔离级别**，级别越高，数据越安全，但并发性能越低。

MySQL 隔离级别一共 4 种，隔离性从低到高分别是：读未提交、读已提交、可重复读、串行化。[MySQL 中的事务隔离级别有哪些？ - 面试鸭 | 2026最新MySQL 面试题+详细答案解析](https://www.mianshiya.com/bank/1791003439968264194/question/1780933295492591617#heading-0)

<img src="D:\Code\Code-Mikle.github.io\src\content\docs\notes\database\assets\image-20260407191952407.png" alt="image-20260407191952407" style="zoom: 33%;" />

- 读未提交 (READ UNCOMMITTED)：事务A还能够看到事务B没有提交的事务，等于毫无隔离性而言。存在的典型问题就是脏读（当然也存在不可重复读和幻读），如果事务B回滚数据，那么事务A读到的就是脏数据。
- 读已提交 (READ COMMITTED)：事务A只能够看到事务B提交了的事务。解决了脏读问题，但存在不可重复读问题（以及幻读），如果事务A两次读取数据期间，事务B修改了数据，那么事务A两次读取的数据就是不一致的。
- 可重复读 (REPEATABLE READ)：事务A在读取数据时，始终看到的都是开始读取的数据的值，即使在此期间事务B修改了数据，也没有关系。但是存在幻读问题，如果在此期间事务B增加或删除了新的数据，那么事务A读取的数据行数就有变化。
- 串行化(SERIALIZABLE)：取消并发执行，事务A和事务B串行执行，只有前一个事务结束，后一个事务才可以执行。

**四种隔离级别与并发问题**

| 隔离级别 | 脏读 | 不可重复读 | 幻读 | 说明                                                         |
| -------- | ---- | ---------- | ---- | ------------------------------------------------------------ |
| 读未提交 | 允许 | 允许       | 允许 | 性能最高，但几乎不使用，因为数据极不安全。                   |
| 读已提交 | 禁止 | 允许       | 允许 | 大多数数据库的默认级别。能避免读到别的事务未提交的“脏”数据。 |
| 可重复读 | 禁止 | 禁止       | 允许 | MySQL 的默认级别。保证在同一个事务中多次读取同一数据的结果是一致的。 |
| 串行化   | 禁止 | 禁止       | 禁止 | 最严格的级别。强制事务串行执行，相当于排队，彻底避免并发问题，但性能最低。 |

**简单来说：**

- **脏读**：读到了别的事务还没提交的、可能回滚的“脏”数据。
- **不可重复读**：在同一个事务里，两次读取同一行数据，结果不一样（因为被别的事务修改了）。
- **幻读**：在同一个事务里，两次查询返回的记录条数不一样（因为被别的事务插入或删除了）。

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

   ```mysql
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

     ```mysql
     CREATE INDEX idx_team_user_id ON team(userId);
     ```

   - 验证方式：同一账号并发 50~100 次创建队伍，请求结束后执行

     ```mysql
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

   

   

   

   

   
