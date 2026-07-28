---
title: Redis 八股文
---



## Redis 是什么

Redis（Remote Dictionary Server） 是一个基于内存的高性能 Key-Value 数据库，支持 String、Hash、List、Set、ZSet 等多种数据结构，并提供持久化、过期策略、主从复制、哨兵、集群等机制，通常用来做缓存、分布式锁、计数器、排行榜、会话存储、消息队列等。

**Redis 在 Java 后端中的常见用途**

- 缓存数据，减少 MySQL 压力。
- 分布式锁。例如秒杀接口，两个服务器同时请求，可以利用 Redis 只让一个请求获得锁，避免并发修改。实际 Spring Boot 项目一般用 Redisson。
- 计数器。Redis 的 `INCR` 是原子操作，非常适合统计浏览量、点赞数、访问次数、限流次数。
- 排行榜。利用 Redis 的 ZSet 来实现。
- Sesison 共享
- 消息队列，Redis 支持 `List`、`Pub/Sub`、`Stream` 都可以实现一定程度的消息通信，不过如果是复杂、可靠性要求高的消息队列场景，一般会使用 RabbitMQ、Kafka、RocketMQ。

## Redis 中常见的数据类型

Redis 常见的数据类型主要有五种：String、Hash、List、Set、ZSet。

1. **String** 最基本的类型，能存文本、数字、二进制、JSON等。比如：缓存用户会话、页面数据，分布式锁，计数器，验证码，Token等 
2. **Hash** 本质上是个键值对集合，特别适合存对象属性。它和直接用 String 存 JSON 的区别是，Hash 可以单独修改某个字段。
3. **List** 有序的字符串列表，底层是双向链表，支持两端操作。最常用的场景就是消息队列，LPUSH 生产消息，RPOP 消费消息，简单的生产者消费者模式就搞定了。不过真正复杂的消息队列场景通常更推荐 Redis Stream 或 RabbitMQ、Kafka、RocketMQ。
4. **Set** 是无序且元素不重复的集合，查找和去重（支持集合运算，交集、并集、差集）效率很高。适合做标签系统、记录某个页面的独立访客、共同关注等需要去重或集合运算的场景。
5. **ZSet（Sorted Set）** 跟 Set 类似，但每个元素都带一个 score 分数用来排序，底层用跳表实现。最典型的就是排行榜，比如游戏积分榜、热搜榜，按 score 排序后直接取 Top N。

以及几种常用的特殊数据类型。

1. **BitMap** 用位来存数据，每个 bit 只占 0 或 1，空间利用率极高。比如统计 1000 万用户的签到情况，每个用户只占 1 bit，总共才 1.2 MB。用 SETBIT 设置状态，GETBIT 读取状态。
2. **HyperLogLog** 概率性数据结构，专门用来估算基数。不管塞进去多少数据，固定只占 12 KB 内存，代价是有 0.81% 左右的误差。适合统计网站 UV 这种对精度要求不高但数据量巨大的场景。
3. **GEO** 用来存地理位置，支持经纬度存储和空间查询。底层其实是用 Zset 实现的，经纬度会被编码成 score。典型场景就是“附近的人”、外卖配送距离计算。
4. **Stream** 专门为消息队列设计的数据结构。相比 List 做队列，Stream 多了两个关键特性：自动生成全局唯一消息 ID，支持消费组模式。相比 Pub/Sub 最大的优势是消息可以持久化。消费者挂了重启还能继续消费。

### ZSet 的原理



## Redis 为什么这么快？

Redis 最大的特点是“快”。因为 MySQL 这类数据库的数据主要存储在磁盘上，而 Redis 的主要数据存储在内存中。内存访问速度远高于磁盘，所以 Redis 很适合放那些“访问频繁、又不希望每次都去查数据库”的数据。

Redis 快的核心原因就三个：纯内存操作、单线程 + IO 多路复用、高效的数据结构。

1. 内存 VS 磁盘

   访问一次内存大概 120 纳秒，访问一次 SSD 要 50-150 微秒，传统机械硬盘更慢，要 1-10 毫秒。内存比磁盘快了将近 1000 倍。Redis 把数据全放在内存中，除了持久化，基本不跟磁盘打交道。

2. 单线程 + IO 多路复用

   Redis 用单线程执行命令，避免了多线程带来的锁竞争、上下文切换、线程同步。网络 IO 用 epoll 等 I/O 多路复用机制，一个线程管理大量 socket 连接，哪个连接有数据就处理哪个，不用等待。

   > 注意：现代 Redis 并不是所有工作都单线程，Redis 6 以后网络 I/O 可以使用多线程，但核心命令执行仍主要采用串行模型。

3. 高效的数据结构

   Redis 的数据结构都是为快而生的。String 底层是 SDS，O(1) 获取长度；Hash 小数据量用 listpack，数据量变大后转为 hashtable 保证 O(1) 查询；List 底层是 quicklist；Set 底层是 intset / hashtable；ZSet 用跳表，插入查询都是 O(logN)。

## 过期策略

> Redis 的过期策略采用惰性删除和定期删除相结合。惰性删除是在访问 key 时检查是否过期，过期则删除；定期删除则周期性抽取部分设置了过期时间的 key，删除其中已经过期的数据。这样可以在 CPU 消耗和内存占用之间取得平衡。

> key 已经过期了，什么时候把它删掉？

Redis 的过期策略主要就两种：惰性删除和定期删除。

Redis 实际上是把两种策略结合起来使用。

1. 惰性删除

   Redis 不会在 key 一过期就立即删除，而是等再次访问该 key 时，才检查它是否过期，过期了的话就顺手删掉，然后返回空。

   优点是不用额外占用 CPU 去检查是否存在过期的 key。

   缺点是如果一个 key 已经过期，但是以后再也没人访问，它就可能继续占用内存。

2. 定期删除

   为了解决惰性删除导致过期 key 长期占内存的问题，Redis 会定期检查一部分设置了过期时间的 key：定期抽取一批设了过期时间的 key 检查，发现过期的就删掉。

   注意，不是每隔一段时间扫描所有 key。因为如果 Redis 有几百万、几千万个 key，全量扫描会消耗大量 CPU。所以 Redis 采用的是定期随机抽查部分带过期时间的 key，并删除其中已经过期的 key。

## 内存淘汰策略

> Redis 在内存达到 `maxmemory` 后，会根据配置的内存淘汰策略删除部分 key。主要包括 `noeviction`、`volatile-*` 和 `allkeys-*` 三类。其中 volatile 只从设置了过期时间的 key 中淘汰，allkeys 从所有 key 中淘汰；具体可以按照 LRU、LFU、随机或者 TTL 等规则选择 key。实际作为缓存使用时，比较常见的是 `allkeys-lru` 或 `allkeys-lfu`。

> Redis 内存达到 `maxmemory` 上限时，但是还有很多 key 没过期，应该删谁？

如果过期策略中的惰性删除和定期删除都没能及时清理，内存还是涨到了 maxmemory 上限，这时候写入新数据会触发内存淘汰机制。

Redis 常见的内存淘汰策略可以分成 3 类。

**不淘汰**

`noeviction` 内存满了以后，不删除任何 key，新的写操作直接报错。适合不允许 Redis 自动删除数据的场景。

**只淘汰设置了过期时间的 key**

`volatile-random` 随机淘汰一个带过期时间的 key

`volatile-ttl` 优先淘汰剩余过期时间最短的 key

`volatile-lru` （lru，最近最少使用，least recently used）淘汰最近最少使用的 key

`volatile-lfu` （lfu，最少使用，least frequently used）淘汰使用频率最低的 key

**针对所有 key 淘汰**

`allkeys-random` 从所有 key 中随机淘汰

`allkeys-lru` 从所有 key 中淘汰最近最少使用的

`allkeys-lfu` 从所有 key 中淘汰访问频率最低的

**上述中 LRU 与 LFU 辨析**：

LRU 关注的这个 key 最近有没有被用过，LFU 关注的是这个 key 总体访问频率高不高。比如：

```
A：昨天访问了 10000 次，但今天没访问
B：今天刚访问 1 次
```

对于 LRU 来说，A 会被淘汰；对于 LFU 来说，B 会被淘汰。

LRU 存在的问题：如果某段时间有大量冷数据被批量扫描，会把真正的热数据挤出去。

LFU 就是为了解决 LRU 的这个问题，它统计访问频率而不是访问时间。但 LFU 也存在问题：如果某个 key 历史上被访问很多次，但现在已经不热了，它还是会一直占着内存。Redis 4.0 引入的 LFU 算法做了优化，访问计数会随时间衰减，不会出现“僵尸热点”的问题。

**实际生产环境选择**

1. 大多数业务场景直接用 allkeys-lru 就行，简单粗暴有效。
2. 如果业务有明确的热点数据，比如电商的爆款商品、社交平台的热门帖子，用 allkeys-lfu 更合适。
3. 如果 Redis 里村的数据分为两类，一类是缓存数据设了过期时间，另一类是持久化数据没设过期时间，那就用 volatile-lru，这样只淘汰缓存数据，持久化数据不会被误删。
4. noeviction 一般用在 Redis 当消息队列的场景，数据丢了可能造成业务异常，宁可写入失败也不能丢数据。

## Redis 的持久化机制 RDB、AOF

> Redis 提供 RDB 和 AOF 两种持久化机制。RDB 会定期生成内存数据快照，文件较小、恢复较快，但可能丢失两次快照之间的数据；AOF 会记录每次写命令，数据安全性更高，但文件较大，恢复速度相对较慢。Redis 还支持将两者结合，即混合持久化策略，通过 RDB 保存基础数据、AOF 保存增量操作，在恢复速度和数据安全性之间取得平衡。

Redis 作为内存数据库，为了防止宕机导致数据全部丢失，提供了把内存中的数据保存到磁盘的机制，使 Redis 重启后能够恢复数据。

Redis 主要提供了 **RDB** 和 **AOF** 两种持久化方式，以及结合两者优势的**混合持久化**。

**RDB（Redis Database）** - 快照持久化

RDB 会在某个时间点，把 Redis 内存中的全部数据生成一份快照文件，默认文件名通常是 dump.rdb。

优点：恢复速度快，文件体积小，适合做备份和灾难恢复，大数据量下的恢复速度通常也比纯 AOF 更快。

缺点：它只保存某个时间点的数据，如果两次快照之间 Redis 宕机，就可能丢失这段时间的数据。生成快照时还需要执行 `fork()`，数据量较大时可能造成短暂延迟和额外内存压力。

**AOF（Append Only File）** - 日志持久化

AOF 不直接定期保存完整数据，而是记录 Redis 执行过的写命令。默认文件通常类似 appendonly.aof。

AOF 的写回策略：

- always 每个写命令执行后都同步到磁盘，数据最安全，但性能最差。每次写操作都要等磁盘。

  设置为 always 不确保一定不丢数据。因为 Redis 是先执行命令再写 AOF，如果命令执行完，AOF 还没写进去 Redis 就挂了，这条命令就丢了。

- everysec（默认推荐）每秒同步一次，最多丢失 1 秒的数据，在性能和安全之间取得了很好的平衡。

- no 由操作系统决定何时同步，性能最好，但 Redis 挂了可能丢比较多数据。

优点：数据丢失更少，数据恢复更加完整。

缺点：文件通常比 RDB 大，写入磁盘的开销更高，恢复时需要重放所有命令。

AOF 重写：AOF 持续记录命令，文件会越来越大。例如：

```sql
SET count 1
SET count 2
SET count 3
SET count 4
```

恢复最终状态其实只需要：

```sql
SET count 4
```

因此 Redis 会执行 AOF 重写，根据当前数据状态生成更精简的 AOF，而不是简单复制旧文件。重写可以通过 `BGREWRITEAOF` 触发。重写过程中 Redis 仍然可以继续接收写操作，完成后再安全切换到新文件。

**混合持久化**

混合持久化结合了 RDB 和 AOF 的优点。在 AOF 重写时，先将当前内存数据以 RDB 的格式写入 AOF 文件的开头，然后将重写期间的增量写命令以 AOF 格式追加到文件末尾。

优点：重启时先快速加载 RDB 部分，再重放少量的 AOF 增量命令，既保证了极快的恢复速度，又实现了极高的数据安全性。

### 生产环境配置持久化

大多数场景用混合持久化，兼顾恢复速度和数据安全。everysec 的 AOF 写回策略够用了，最多丢 1 秒数据。同时配合定时 RDB 备份做异地容灾，比如每天凌晨低峰期做一次全量 RDB 传到 OSS。对数据安全性要求极高的场景才考虑 always，但要评估性能影响。

### 为什么 Redis 不使用 WAL 而是 AOF？

> Redis 并不是完全没有使用类似 WAL 的思想，AOF 本质上也是一种逻辑重做日志。但传统 WAL 主要用于解决磁盘数据页和内存脏页之间的一致性问题，而 Redis 的数据主体在内存中，没有持续原地更新的磁盘数据页。因此 Redis 直接记录写命令，并在重启时重放命令重建内存数据，这种 AOF 机制实现更简单，也不依赖具体的底层数据结构。

Redis 选择记录写命令的 AOF，而不是记录数据页修改的传统 WAL，主要因为 Redis 和磁盘数据库的存储模型不同。

1. WAL 主要解决“内存页和磁盘页不一致”

   以 InnoDB 为例，真正的数据最终保存在磁盘的数据页中。执行更新时，不会立刻把整个数据页刷盘，而是：

   ```
   修改 Buffer Pool 中的数据页
           ↓
   先持久化 redo log
           ↓
   以后再把脏页刷入磁盘
   ```

   这里必须遵守 redo log 先落盘，数据页后落盘。这就是 Write-Ahead Logging。

   假设数据页还没刷盘，数据库就宕机了，可以通过 redo log 重新修改磁盘数据页。但 Redis 不一样，Redis 的主数据在内存，磁盘上没有一套持续原地更新的数据页。Redis 宕机后，整个内存数据都消失了，重启时直接根据持久化文件重新构建内存数据库即可。

   因此 Redis 没有：磁盘数据页，脏页，页刷盘顺序，redo log 与数据页一致性。也就不需要照搬 InnoDB 那种 WAL 机制。

2. AOF 记录命令，更符合 Redis 的模型

   Redis 执行：

   ```sql
   SET name Mike
   INCR count
   HSET user:1 age 20
   ```

   AOF 就记录这些写命令。重启时重新执行：读取 AOF，重新执行写命令，重建内存数据。这比记录底层内存变化简单得多。假设 Redis 使用传统的底层 WAL，就可能需要记录：

   ```
   哈希表哪个桶发生变化
   跳表哪个节点发生变化
   quicklist 哪个节点发生变化
   某段内存修改了哪些字节
   ```

   这样会带来很多问题：

   - 日志与 Redis 底层数据结构强耦合；
   - 内存地址在重启后没有意义；
   - Redis 版本升级或底层编码变化后，旧日志难以重放；
   - 日志生成和恢复逻辑复杂。

   而记录命令：

   ```sql
   ZADD ranking 100 user1
   ```

   不需要关心 ZSet 当前底层使用的是 listpack 还是跳表。重启时 Redis 按当前版本的数据结构重新执行即可。

3. AOF 是逻辑日志，兼容性更好

   传统 WAL 常记录比较底层的物理变化，例如：第 10 个数据页、偏移量 200、修改为某些字节。AOF 记录的是更高层的业务操作：

   ```sql
   SET key value
   SADD users user1
   ZADD ranking 100 user1
   ```

   因此 AOF 有几个明显优点：容易生成、容易重放、容易检查、容易修复、不依赖内存地址、不强依赖底层编码。AOF 使用 Redis 协议格式记录命令，这也使恢复过程可以复用 Redis 本身的命令执行能力。

## 缓存穿透、击穿、雪崩

> 缓存穿透是请求不存在的数据，导致每次请求都访问数据库；缓存击穿是某个热点 key 失效，大量请求同时访问数据库；缓存雪崩是大量 key 同时过期或者 Redis 整体故障，导致大量请求集中进入数据库。对应可以通过缓存空值或布隆过滤器、互斥锁或逻辑过期、随机 TTL 和 Redis 高可用等方式解决。

这三个概念都是缓存失效导致请求打到数据库的场景，区别在于失效的原因和范围不同：

**缓存穿透**

请求查询的数据，在 Redis 和数据库中都不存在。例如不断请求不存在的商品：

```http
GET /product/999999999
```

由于数据库中没有数据，所以无法正常写入缓存。之后相同请求仍然会绕过 Redis，直接访问数据库。大量恶意请求可能导致数据库压力过大。

解决方案：

- 入口校验：参数合法性检查放在最前面，ID 小于 0 直接拒绝，格式不对直接返回。

- 缓存空值：数据库查询不到时，也在 Redis 中缓存一个空值，并设置较短的过期时间，之后相同请求直接从 Redis 返回空结果。缺点是可能产生大量无效 key。

- 布隆过滤器（Bloom Filter）：在查询 Redis 和数据库之前，先判断数据是否可能存在

  ```
  请求
   ↓
  布隆过滤器
   ↓
  确定不存在 → 直接返回
  可能存在   → 查询 Redis
  ```

  布隆过滤器的特点是：如果判断为不存在，那么一定不存在；如果判断为存在，那么可能存在。因此它可以拦截绝大多数非法 key。

**缓存击穿**

某一个访问量特别高的热点 key 突然过期，大量请求同时涌进来，全部访问数据库。比如秒杀商品的缓存刚好过期，几万请求一下子打到数据库，数据库可能瞬间承受很大压力。

解决方案：

- 互斥锁：只有一个线程允许查询数据库和重建缓存，其他线程等待或稍后重试。

- 逻辑过期：key 本身不设置物理过期时间，而是在 value 中保存一个逻辑过期时间：

  ```json
  {
    "data": {
      "id": 1001,
      "name": "商品"
    },
    "expireTime": "2026-07-28 12:00:00"
  }
  ```

  发现逻辑过期后：先返回旧数据，然后后台线程重建缓存。

  这种方案不会让请求直接打到数据库，但短时间内可能返回旧数据。

  > 对于 “key 本身不设置物理过期时间，而是在 value 中保存一个逻辑过期时间” 的解析：
  >
  > 热点 key 不设置物理过期，是为了保证缓存永远命中；保存逻辑过期时间，是为了让系统知道数据什么时候已经陈旧，并触发异步更新。

- 热点 key 不设置过期时间：对于极少数长期热点数据，可以不设置过期时间，在数据修改时主动更新或删除缓存。

  > 删除更简单，下次请求回自动重建。更新的话要注意并发问题，可能出现数据库和缓存不一致。另外后台线程也要定期刷新，防止因为某些原因导致缓存一直是旧数据。

**缓存雪崩**

缓存雪崩是大量缓存同时失效，导致大量请求一起访问数据库。常见原因为：

- 大量 key 同时过期：例如系统启动时，给一批商品统一设置 30 分钟过期，30 分钟后大量 key 同时过期，大量请求进入数据库，数据库压力骤增。
- Redis 服务整体挂掉：Redis 宕机，网络故障，Redis 集群异常，连接池耗尽等。

解决方案：

- 对于大量 key 同时过期：给过期时间增加随机值，采用`基础过期时间 + 随机时间`，这样 key 会分散过期。比如：`30 分钟 + 0～10 分钟随机值`。

- 对于Redis 整体不可用，需要在架构层面解决：

  1）Redis 高可用：主从 + 哨兵，或者 Redis Cluster，挂一个节点不影响整体服务。

  2）本地缓存兜底：用 Caffeine 或 Guava Cache 做一层本地缓存，Redis 挂了还能顶一阵。

  3）服务熔断与降级：用 Sentinel 或 Hystrix 发现数据库压力过大直接熔断，返回默认值或错误提示，保住系统不崩。

  4）缓存预热：系统启动后或发布后，主动把热点数据加载到缓存，避免冷启动时大量请求穿透。

## Redis 中的 Lua 脚本

Redis 的 Lua 脚本，就是把多个 Redis 命令写成一段 Lua 代码，然后交给 Redis 一次性执行。

Lua 脚本的核心特点：

- 原子性：Lua 脚本的所有命令在执行过程中是原子性的，因此把多个 Redis 操作组合成一个原子操作，执行期间不会被其他客户端命令插入，避免了并发修改带来的问题。

  > 注意：Lua 脚本本身不具备原子性，但 Redis 是单线程执行命令的，它把整个 Lua 脚本当成一个命令来跑，执行期间不处理任何其他请求，也就使得执行过程中不会被其他命令打断，好像有了原子性。

- 减少网络往返次数：通过在服务器端执行脚本，减少了客户端和服务器之间的网络往返次数，提高了性能。

- 复杂操作：可以在 Lua 脚本中执行复杂的逻辑，比如批量更新、条件更新等，超过了单个 Redis 命令的能力。

### 为什么需要 Lua 脚本

假设要实现“库存大于 0 才扣减库存”。如果在 Java 中分两步执行：

```
读取库存
↓
判断库存 > 0
↓
扣减库存
```

对应命令：

```
GET stock
DECR stock
```

并发时可能出现问题：

```
线程 A 读取库存：1
线程 B 读取库存：1

线程 A 扣减：库存变成 0
线程 B 扣减：库存变成 -1
```

因为 `GET` 和 `DECR` 虽然各自是原子的，但两个命令组合起来不是原子的。使用 Lua 脚本：

```lua
local stock = tonumber(redis.call('GET', KEYS[1]))

if stock > 0 then
    return redis.call('DECR', KEYS[1])
else
    return -1
end
```

Redis 会把整段脚本作为一个整体执行（读取库存 + 判断库存 + 扣减库存）。执行期间不会有其他命令插入，因此不会超卖。

### 如何执行 Lua 脚本

Redis 使用 `EVAL` 命令执行脚本：

```lua
EVAL "return redis.call('GET', KEYS[1])" 1 stock
```

参数含义：

```
EVAL
脚本内容
key 的数量
KEYS[1]
其他普通参数
```

例如：

```
EVAL "return redis.call('SET', KEYS[1], ARGV[1])" 1 name Mike
```

在脚本中：

```
KEYS[1] -- name
ARGV[1] -- Mike
```

最终相当于：

```
SET name Mike
```

约定上：

```
KEYS：Redis key
ARGV：普通参数
```

不要把 key 直接写死在脚本里，应通过 `KEYS` 传入。

### 常见应用场景

**分布式锁安全解锁**

加锁时保存一个唯一标识：

```sql
SET lock:order uuid123 NX PX 30000
```

释放锁时必须先判断锁是不是自己的，再删除。这两个操作必须原子执行：

```lua
if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
else
    return 0
end
```

否则可能发生误删其他线程锁的问题。

**库存扣减**

```lua
local stock = tonumber(redis.call('GET', KEYS[1]) or '-1')

if stock <= 0 then
    return 0
end

redis.call('DECR', KEYS[1])
return 1
```

**限流**

例如同一用户一分钟内最多访问 100 次：

```lua
local count = redis.call('INCR', KEYS[1])

if count == 1 then
    redis.call('EXPIRE', KEYS[1], ARGV[1])
end

if count > tonumber(ARGV[2]) then
    return 0
end

return 1
```

脚本保证 `INCR` 和首次设置过期时间的逻辑整体执行。

### EVALSHA

如果每次用 `EVAL` 发送长脚本会占用大量网络带宽。因此 EVALSHA 的作用是为了避免重复传输脚本。

所以整个流程是这样的：

1. 第一次用 `SCRIPT LOAD` 或 `EVAL` 把脚本发给 Redis，Redis 把它缓存起来并返回 SHA1。
2. 之后每次执行，客户端只需要发 `EVALSHA <sha1>` + 参数，Redis 拿着这个 SHA1 去缓存里找到对应的脚本直接执行。

这样做的核心目的就是**省带宽**。一个 Lua 脚本可能几百字节甚至更长，但 SHA1 只有 40 个字符。在高并发场景下，这个优化效果非常明显。

不过有一个细节要注意：`EVALSHA` 如果找不到对应的脚本缓存（比如 Redis 重启了、或者脚本被手动清除了），会返回一个 `NOSCRIPT` 错误。所以实际开发中，客户端一般会做一个**降级处理**：先尝试 `EVALSHA`，如果报 `NOSCRIPT`，就回退到用 `EVAL` 重新发送完整脚本。Redisson 等主流客户端库内部都是这么处理的。

## Redis 中的分布式锁

Redis 分布式锁，就是利用 Redis 让多个进程、多个服务实例在同一时间只能有一个获得某个资源的操作权限。

例如订单服务部署了三台：

```
服务 A ─┐
服务 B ─┼→ 修改订单 1001
服务 C ─┘
```

Java 的 `synchronized` 只能约束同一个 JVM，无法协调不同服务器，因此需要分布式锁。

**加锁基础实现：SET NX EX**

```
1. 客户端执行 SET lock_key uuid EX 30 NX
2. Redis 检查 lock_key 是否存在
3. 不存在则设置成功，返回 OK，加锁成功
4. 已存在则返回 null，加锁失败
```

加锁推荐使用一条原子命令：

```sql
SET lock:order:1001 uuid-123 NX PX 30000
```

参数含义：

```
NX：key 不存在时才设置
PX：设置毫秒级过期时间
30000：锁 30 秒后自动过期
uuid-123：锁持有者的唯一标识
```

执行结果：1）返回 `OK`，加锁成功；2）返回空，锁已经被其他线程占用。

必须在一条 `SET` 命令中同时完成加锁和设置过期时间，不能拆成：

```sql
SETNX lock:key value
EXPIRE lock:key 30
```

因为如果 `SETNX` 成功后服务宕机，`EXPIRE` 没执行，锁就可能永远不释放。（`SETNX` 和 `EXPIRE` 都是 Redis 2.6.12 之前的，分开执行无法保证原子性。后续版本 `SET` 命令支持 `NX`、`EX`、`PX` 参数，一条命令搞定加锁和设置时间。）

> 如果不设置锁的过期时间，假设某个线程 A 获得锁后直接宕机了，没有设置过期时间的话，其他线程将永远无法获得该锁，其他服务全都干等着。设置过期时间后，即使服务宕机，Redis 也会自动释放锁。

**释放锁实现：Lua 脚本**

```
1. 客户端执行 Lua 脚本
2. GET lock_key 获取当前值
3. 判断值是否等于自己的 uuid
4. 相等则 DEL lock_key，解锁成功
5. 不相等则返回 0，说明锁不是自己的
```

判断锁值和删除锁必须是原子操作：

```lua
if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
else
    return 0
end
```

执行逻辑：如果锁值等于当前线程的唯一标识，则删除锁。如果锁值不相等，则不处理。

不能在 Java 中分两次执行：

```java
if (uuid.equals(redis.get(lockKey))) {
    redis.del(lockKey);
}
```

因为 `GET` 和 `DEL` 之间，锁可能已经过期并被其他线程重新获得。

## Redisson

Redisson 是一个基于 Redis 的 Java 客户端。它不仅仅是对 `GET`、`SET` 等 Redis 命令进行封装，而是把 Redis 中的数据和功能封装成 Java 程序员熟悉的对象和接口。官方将其定位为 Redis、Valkey 的 Java 客户端和实时数据平台。例如：

```
Redis 数据结构          Redisson 对象

String            →    RBucket
Hash              →    RMap
List              →    RList
Set               →    RSet
Sorted Set        →    RScoredSortedSet
```

它还提供了一些 Redis 原生并没有直接提供的高级分布式对象：

```
RLock              可重入锁
RFairLock          公平锁
RReadWriteLock     读写锁
RFencedLock        带 fencing token 的锁
RSemaphore         信号量
RCountDownLatch    分布式倒计时器
RAtomicLong        分布式原子变量
RBloomFilter       布隆过滤器
RRateLimiter       限流器        
......
```

**可重入**

同一个线程可以重复获得同一把锁：

```java
lock.lock(); // 第一次，加锁计数为 1
lock.lock(); // 第二次，加锁计数为 2

lock.unlock(); // 计数减为 1，锁还没释放
lock.unlock(); // 计数减为 0，真正释放
```

这可以避免同一个线程中的嵌套方法调用发生死锁：

```java
public void methodA() {
    lock.lock();
    try {
        methodB();
    } finally {
        lock.unlock();
    }
}

public void methodB() {
    lock.lock();
    try {
        // 业务
    } finally {
        lock.unlock();
    }
}
```

### 为什么需要 Redisson

如果直接使用 `RedisTemplate` 实现分布式锁，需要自己处理很多细节：

```
SET NX PX 原子加锁
生成锁的唯一标识
判断锁归属
Lua 脚本安全解锁
锁的自动续期
锁的可重入
等待锁的线程如何唤醒
异常退出后的锁释放
```

Redisson 已经封装了这些逻辑。例如自己使用 Redis 命令加锁：

```sql
SET lock:order:1 uuid NX PX 30000
```

解锁还要执行 Lua 脚本：

```lua
if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
else
    return 0
end
```

使用 Redisson 后，可以直接按照 Java `Lock` 的方式操作：

```java
RLock lock = redissonClient.getLock("lock:order:1");

lock.lock();

try {
    // 执行业务
} finally {
    lock.unlock();
}
```

Redisson 的 `RLock` 实现了 Java 的 `Lock` 接口，并支持分布式可重入锁；等待锁的客户端可以通过 Redis Pub/Sub 接收锁释放通知。

### Redisson 的核心特点

**Java 风格的 API**

Redisson 尽量使用 Java 程序员熟悉的接口，例如分布式 Map：

```java
RMap<String, User> userMap =
        redissonClient.getMap("users");

userMap.put("1001", user);

User result = userMap.get("1001");
```

从 Java 代码来看，它很像：

```java
Map<String, User>
```

但数据实际存储在 Redis 中，因此不同服务实例可以共享这份数据。Redisson 官方提供了数十种基于 Redis 或 Valkey 的分布式对象和服务。

**支持同步和异步编程**

Redisson 提供多种客户端接口：

```
RedissonClient           同步接口
RedissonReactiveClient   Reactor 响应式接口
RedissonRxClient         RxJava 接口
```

例如同步调用：

```java
RBucket<String> bucket =
        redissonClient.getBucket("name");

bucket.set("Mike");
```

异步调用：

```java
RFuture<Void> future = bucket.setAsync("Mike");
```

Redisson 的底层客户端基于 Netty，并提供同步、异步和响应式调用方式。

**支持多种 Redis 部署方式**

Redisson 可以连接多种 Redis 部署结构，例如：

```
单机模式
主从模式
哨兵模式
Redis Cluster
复制模式
代理模式
```

因此应用从 Redis 单机迁移到 Sentinel 或 Cluster 时，可以继续使用 Redisson 的上层 API。

### Redisson 与 RedisTemplate 的区别

| 对比项       | RedisTemplate       | Redisson               |
| ------------ | ------------------- | ---------------------- |
| 定位         | Redis 命令操作工具  | 分布式对象和服务框架   |
| API 风格     | 操作 Redis 数据类型 | Java 集合、并发工具    |
| 普通缓存     | 适合                | 也支持                 |
| 分布式锁     | 通常需要自行封装    | 直接使用 `RLock`       |
| 自动续期     | 需要自行实现        | 提供看门狗机制         |
| 可重入锁     | 需要自行实现        | 原生支持               |
| 分布式限流器 | 需要自行实现        | 提供 `RRateLimiter`    |
| 分布式集合   | 封装程度较低        | 提供 `RMap`、`RSet` 等 |

### 看门狗（Wachdog）机制

> Redisson 的看门狗机制用于解决业务执行时间超过锁过期时间的问题。当获取锁时没有显式指定 `leaseTime`，Redisson 会给锁设置一个默认过期时间，并在后台周期性续期。只要持锁客户端仍正常运行且锁没有释放，就会持续延长锁的 TTL；业务完成并解锁后停止续期。如果客户端宕机，看门狗无法继续续期，锁会在 TTL 到期后由 Redis 自动删除。

Redisson 的看门狗（Watchdog）机制，本质上是一个**分布式锁的“自动续命”系统**。它完美解决了分布式锁中“过期时间难以精确预估”的核心痛点。

在实际的后端系统设计中，锁的过期时间往往面临两难：设得太短，业务没跑完锁就失效了，引发并发问题；设得太长，一旦持锁节点宕机，锁长时间不释放，又会导致死锁。 看门狗机制正是为了打破这个僵局而生的。

**看门狗机制的工作流程**

使用 Redisson 获取锁时，如果没有指定固定的 `leaseTime`：

```java
RLock lock = redissonClient.getLock("lock:order:1001");

lock.lock();

try {
    processOrder();
} finally {
    lock.unlock();
}
```

Redisson 会：

```
获取锁
  ↓
给锁设置初始过期时间
  ↓
启动后台续期任务
  ↓
持锁线程还在持有锁？
 ├─ 是：重新延长锁的过期时间
 └─ 否：停止续期
```

默认的看门狗超时时间是 30 秒，可以通过 `lockWatchdogTimeout` 修改。只要持锁的 Redisson 实例仍然正常运行并且锁没有释放，Redisson 就会周期性延长该锁的过期时间。因此，业务即使执行 1 分钟，只要续期正常，锁也不会在第 30 秒自动失效。

**看门狗机制的触发条件**

关键在于是否指定了 `leaseTime`。

- 没有指定 leaseTime → 开启看门狗续期

  `lock.lock();` 或 `lock.tryLock(3, TimeUnit.SECONDS);` 这里的 3 秒表示最多等待 3 秒获取锁，不是锁的持有时间。获取成功后，Redisson 使用看门狗自动续期，直到主动 unlock。

- 指定了 leaseTime → 固定时间自动释放，不开启看门狗

  `lock.tryLock(3, 30, TimeUnit.SECONDS);` 含义是最多等待 3 秒，锁最多持有 30 秒。由于已经明确指定锁在 30 秒后释放，因此不会使用看门狗自动续期；时间到后锁会自动释放，即使业务仍然没有执行完成。

## RedLock

如果 Redis 是主从架构，主节点宕机且锁还没同步到从节点时，从节点晋升为主节点后，其他进程可能会再次获取到同一把锁，导致锁失效。

为了解决这个问题，Redis 作者提出了 **RedLock 算法**（一种多节点分布式锁算法）：在多个完全独立的 Redis 节点上同时加锁，只有当**超过半数**的节点加锁成功，才认为获取锁成功。



## Redis 中如何保证缓存与数据库的数据一致性





## Redis 的哨兵机制



## Redis 主从复制



## Redis Cluster



## Redis 性能瓶颈时如何处理？



## Redis 事务与关系型数据库书库的主要区别是什么？

