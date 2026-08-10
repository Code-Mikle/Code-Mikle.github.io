---
title: Java 集合
---

Java 集合框架（Java Collections Framework，JCF）可以理解为：Java 为“批量存储和操作对象”提供的一整套容器体系。

它不仅包括各种集合类，还包括对应的接口、迭代器、排序和算法工具。

主要分为两大类 `Collection` 和 `Map`。

- `Collection` 存单个元素
- `Map` 存键值对

```
Collection
├── List
│   ├── ArrayList
│   ├── LinkedList
│   └── Vector
│
├── Set
│   ├── HashSet
│   ├── LinkedHashSet
│   └── TreeSet
│
└── Queue
    ├── PriorityQueue
    └── Deque

Map
├── HashMap
├── LinkedHashMap
├── TreeMap
├── Hashtable
└── ConcurrentHashMap
```

**为什么需要集合？**

如果只使用数组：

```java
User[] users = new User[10];
```

会有几个问题：长度固定，插入删除不方便，缺少丰富的数据操作能力，无法直接表达 Set、Queue、Map 等数据结构。

而集合：

```java
List<User> users = new ArrayList<>();
```

可以动态扩容，并且提供：

```
add()
remove()
contains()
size()
iterator()
```

等大量通用操作。所以集合框架本质上解决的是如何用统一、标准化的数据结构管理一批对象。







>其中真正需要深入掌握的，其实没有那么多。
>
>第一梯队：
>
>```
>ArrayList
>HashMap
>ConcurrentHashMap
>```
>
>第二梯队：
>
>```
>LinkedList
>HashSet
>TreeMap
>CopyOnWriteArrayList
>```
>
>尤其是 HashMap，建议完整掌握：
>
>```
>HashMap
>│
>├── 数据结构
>│   数组 + 链表 + 红黑树
>│
>├── put()
>│
>├── get()
>│
>├── hash()
>│
>├── 扩容
>│
>├── 链表树化
>│
>├── 为什么容量是 2^n
>│
>├── 为什么负载因子默认 0.75
>│
>├── 为什么线程不安全
>│
>└── JDK 7 与 JDK 8 的区别
>```
>
>最好做到能口述：
>
>> 一个 `put(k, v)` 从调用开始，到数据最终放进 HashMap 的全过程。
>
>这个能力比记零散结论重要很多。



![image-20260806162100608](./assets/image-20260806162100608.png)

## Collection

`Collection<E>` 表示一组元素。主要有三个子接口：`List`、`Set`、`Queue`。

### List

对比 ArrayList 和 LinkedList 的底层差异，以及在不同业务场景下（如高频读写、并发访问）该如何选型。

ArrayList 的扩容机制

`List` 的特点：有序、可重复、可以通过下标访问。

> 这里的“有序”是指：元素按照插入顺序或指定顺序保存。

例如：

```java
List<String> list = new ArrayList<>();

list.add("A");
list.add("B");
list.add("A");
```

结果 `[A, B, A]`，允许重复。并且：

```java
list.get(0);
```

可以通过索引访问。

常见实现：

```
List
├── ArrayList
├── LinkedList
└── Vector
```

其中最重要的是 `ArrayList`。

#### ArrayList

> ArrayList 是 List 的常用实现，底层使用 Object 数组保存元素，因此支持 O(1) 的随机下标访问。它内部维护 elementData 数组和 size，使用无参构造时现代 JDK 通常先使用空数组，第一次添加元素时再初始化默认容量。容量不足时会创建一个更大的数组，通常扩容到原容量的大约 1.5 倍，然后把原数组元素复制到新数组中，因此尾部 add 的均摊复杂度是 O(1)，但中间插入和删除因为需要移动元素，一般是 O(n)。ArrayList 允许重复和 null，但本身不是线程安全的。另外它的迭代器采用 fail-fast 机制，通过 modCount 检测遍历期间的结构性修改。

`ArrayList` 底层基于动态数组实现，支持按下标快速随机访问，并在容量不足时自动扩容。

特点：查询快增删慢，线程不安全，可以存 null。

> 对于读多写少的并发场景，可以考虑使用 CopyOnWriteArrayList。

例如：

```java
List<Integer> list = new ArrayList<>();

list.add("A");
list.add("B");
list.add("C");
```

表面上看容量可以不断增长，但底层实际上仍然是数组，只是 `ArrayList` 帮我们完成了扩容。

##### 数据结构

ArrayList 内部核心字段可以简化理解成：

```java
transient Object[] elementData;
private int size;
```

其中：

```
elementData → 真正存储元素的数组
size → 当前实际存放了多少个元素
```

例如：

```java
ArrayList<String> list = new ArrayList<>();

list.add("A");
list.add("B");
list.add("C");
```

这里必须区分两个概念：

```
size → 实际元素数量
capacity → 底层数组容量
```

比如：

```
size = 3
capacity = 10
```

完全正常。

所以 `list.size()` 返回的是实际元素数量，不是数组容量。

##### `add()`

```java
list.add("A");
```

大致过程：

```
add(element)
↓
检查底层数组容量够不够
↓
够 → elementData[size] = element

不够
→ 扩容
→ 再插入
↓
size++
```

尾部插入通常非常快。如果不触发扩容：

```
add(element)
→ 均摊 O(1)
```

之所以说“均摊”，是因为偶尔扩容需要复制整个数组。

##### `remove()`

ArrayList 有两个很容易混淆的方法，按对象删除和按下标删除：

```java
remove(Object o)
remove(int index)
```

例如：

```java
List<Integer> list = new ArrayList<>(List.of(1, 2, 3));

list.remove(1); // 调用 remove(int index)，所以删除的是 下标 1，元素 2。删除后 list = [1, 3]
list.remove(Integer.valueOf(1)); // 调用 remove(Object)，所以删除的是元素 1。
```

##### `contains()`

```java
list.contains("Tom");
```

ArrayList 没有 HashMap 那种 hash 索引。只能从头开始，逐个 `equals()`，找到目标。所以：

```
contains
indexOf
lastIndexOf
```

通常都是 O(n)。例如：

```java
list.indexOf("Tom");
```

内部本质是遍历。所以 ArrayList 的“查询快”特指按下标随机访问快，不代表按内容搜索也快。

##### 扩容机制

下述方式可以指定初始容量：

```java
ArrayList<String> list = new ArrayList<>(100);
```

如果能够预估集合规模，指定合适的初始容量可以提高性能。

当数组容量不足时，通常扩容为原容量的 1.5 倍。核心计算逻辑长期以来类似：

```
newCapacity = oldCapacity + (oldCapacity >> 1);
```

注意因为整数右移，所以不一定严格等于数学上的 `×1.5`，可以理解成约扩容到原容量的 1.5 倍。

扩容的流程：

```
1. 创建一个更大的新数组
2. 把旧数组内容复制过去
3. elementData 指向新数组
4. 把新元素放进去
```

#### LinkedList

底层是双向链表，增删快查询慢，额外指针内存开销大。

每个节点保存：

```
prev
item
next
```

所以它没有数组那种连续存储空间。

注意：

“LinkedList 插入、删除一定比 ArrayList 快”是不准确的。如果你首先要通过下标：

```
list.remove(10000);
```

LinkedList 还要先花 `O(n)` 找到这个节点。所以整体不一定比 ArrayList 快。

实际开发中：大多数 List 场景优先使用 ArrayList，LinkedList 的使用频率明显更低。

#### Vector

老旧的线程安全类，所有方法都加了 `synchronized`，性能极差，在现代开发中已基本被淘汰。

#### 总结

| 对比             | ArrayList | LinkedList                                   |
| ---------------- | --------- | -------------------------------------------- |
| 底层结构         | 动态数组  | 双向链表                                     |
| `get(index)`     | O(1)      | O(n)                                         |
| 尾部添加         | 均摊 O(1) | O(1)                                         |
| 中间插入         | O(n)      | 找到节点后调整链接 O(1)，整体通常仍可能 O(n) |
| 中间删除         | O(n)      | 找到节点后调整链接 O(1)，整体通常仍可能 O(n) |
| 内存开销         | 较小      | 节点需要 prev/next                           |
| CPU Cache 友好性 | 较好      | 较差                                         |
| 实际使用频率     | 很高      | 相对较低                                     |

### Set

`Set` 的核心特点是元素不能重复。例如：

```java
Set<String> set = new HashSet<>();

set.add("A");
set.add("B");
set.add("A");
```

最终只有 `A` 和 `B`。常见实现：

```
Set
├── HashSet
├── LinkedHashSet
└── TreeSet
```

#### HashSet

`HashSet` 是最常用的 Set，底层是基于 HashMap 实现的。

特点：不允许重复、元素无需，查询、插入性能较好，允许 null，线程不安全。例如：

```java
Set<String> set = new HashSet<>();
set.add("A");
```

内部逻辑可以近似理解成：

```
map.put("A", PRESENT);
```

也就是说：

```
HashSet 元素
↓
HashMap 的 Key
```

而 HashMap 的 Key 本身不能重复，所以 HashSet 就自然实现了元素去重。因此 HashSet 的去重机制，本质上依赖 `hashCode()` 和 `equals()`。

这和前面 Object 类中的这两个方法直接关联。

#### LinkedHashSet

`LinkedHashSet` 可以理解成：在 HashSet 基础上用链表维护元素插入顺序。

例如：

```
Set<String> set = new LinkedHashSet<>();

set.add("C");
set.add("A");
set.add("B");
```

遍历时通常 `C A B`，即保持插入顺序。

所以：

```
HashSet
→ 只关注去重

LinkedHashSet
→ 去重 + 保留插入顺序
```

#### TreeSet

`TreeSet` 底层原理基于红黑树，不重复，元素按照大小自动排序，插入/删除/查询通常 O(log n)。

例如：

```
Set<Integer> set = new TreeSet<>();

set.add(5);
set.add(2);
set.add(8);
set.add(1);
```

遍历结果：`1 2 5 8`

排序依据可以来自：

```
Comparable
```

或者：

```
Comparator
```

例如：

```
new TreeSet<>(Comparator.comparing(User::getAge));
```

### Queue

`Queue` 表示队列。

最典型的是 FIFO（First In First Out，先进先出）。

常见操作：

```
offer()
poll()
peek()
```

例如：

```
Queue<String> queue = new LinkedList<>();

queue.offer("A");
queue.offer("B");

queue.poll(); // A
```

常见实现：

```
Queue
├── LinkedList
├── PriorityQueue
└── BlockingQueue 等
```

#### LinkedList

> LinkedList 底层使用双向链表实现，每个 Node 保存元素本身以及 prev 和 next 两个引用，同时 LinkedList 维护 first、last 和 size。因为直接保存了首尾节点，所以在链表头部和尾部插入、删除可以做到 O(1)；但通过下标访问元素时，需要从 first 或 last 开始遍历，因此 get(index) 是 O(n)。指定位置插入和删除虽然修改节点引用本身是 O(1)，但如果需要先通过 index 定位节点，整体仍然是 O(n)。LinkedList 同时实现 List 和 Deque，因此既可以作为列表，也可以作为队列或双端队列使用，但它本身不是线程安全的。

`LinkedList` 是 Java 集合中基于双向链表实现的 `List`，同时它还实现了 `Deque`，所以既可以当列表使用，也可以当队列、双端队列，甚至当栈使用。

`LinkedList` 底层是双向链表，随机访问慢，但在已经定位到节点的情况下，插入和删除只需要修改前后节点引用。不是线程安全的，可以存 null。

> 高并发队列场景通常应该直接使用专门的并发容器，比如：ConcurrentLinkedQueue、BlockingQueue

##### 数据结构

`LinkedList` 的核心不是数组，而是一组 Node 节点。可以简化理解为：

```java
class Node<E> {
    E item;
    Node<E> next;
    Node<E> prev;
}
```

每个节点保存三部分：

```
prev → 前一个节点
item → 当前元素
next → 后一个节点
```

`LinkedList` 内部还维护两个重要引用：

```java
Node<E> first;
Node<E> last;
```

分别指向：

```
first → 第一个节点
last → 最后一个节点
```

另外还有 `int size;` 记录元素数量。

`LinkedList` 特殊的一点是，实现了 `List<E>` 和 `Deque<E>` 两个接口。

```
Collection
├── List
│    └── LinkedList
│
└── Queue
     └── Deque
          └── LinkedList
```

所以：

```java
List<String> list = new LinkedList<>();

Deque<String> deque = new LinkedList<>();

Queue<String> queue = new LinkedList<>();
```

##### 方法

`add()`

```java
LinkedList<String> list = new LinkedList<>();

list.add("A");
list.add("B");
list.add("C");
```

默认 `add(E e)` 是在链表尾部添加。

因为 LinkedList 直接保存了 `last`，所以尾部添加不需要从头遍历。通常都是：O(1)。

`addFirst()`

```java
list.addFirst("X");
```

时间复杂度同样是 O(1)。

`get()`

`remove()` 分为按对象删除和按下标删除。

#### PriorityQueue

`PriorityQueue` 底层原理基于堆（Heap）不是简单按插入顺序出队，而是按元素大小出队。

例如：

```java
PriorityQueue<Integer> queue = new PriorityQueue<>();

queue.offer(5);
queue.offer(2);
queue.offer(8);

System.out.println(queue.poll());
```

结果是 `2`，因为默认按照自然顺序。

所以 PriorityQueue 常用于：

```
Top K
优先级任务
最小值 / 最大值快速获取
```



#### Deque

`Deque`：Double Ended Queue，双端队列。

允许：头部插入/删除、尾部插入/删除。

典型实现：ArrayDeque

例如：

```java
Deque<Integer> deque = new ArrayDeque<>();

deque.addFirst(1);
deque.addLast(2);
```

可以把它当队列或者栈使用。

现代 Java 中，如果需要栈结构，通常更推荐：

```java
Deque<Integer> stack = new ArrayDeque<>();
```

而不是旧的：

```java
Stack<Integer>
```



#### BlockingQueue



## Map

Map 存储的是 Key-Value 键值对。

例如：

```java
Map<Long, User> map = new HashMap<>();

map.put(1L, user1);
map.put(2L, user2);
```

结构：

```
1 → user1
2 → user2
```

Map 最核心的特点：Key 不能重复。

如果：

```
map.put(1L, user1);
map.put(1L, user2);
```

后面的 value 会覆盖前面的 value。

常见实现：

```
Map
├── HashMap
├── LinkedHashMap
├── TreeMap
├── Hashtable
└── ConcurrentHashMap
```

### HashMap

> JDK 8 之后 HashMap 底层采用数组、链表和红黑树实现。put 时首先对 Key 的 hashCode 做扰动得到 hash，然后通过 `(n - 1) & hash` 定位数组桶。如果桶为空就直接插入；如果桶中已有节点，则通过 hash 和 equals 判断 Key 是否相同，相同则覆盖 value，否则插入链表或红黑树。当单个桶中的链表达到树化条件且数组容量至少为 64 时，会转换为红黑树。HashMap 默认负载因子是 0.75，当 size 超过 threshold 时容量通常扩为原来的两倍。由于容量始终保持为 2 的幂，扩容后的节点只需要判断是留在原位置还是移动到 `原位置 + oldCapacity`。HashMap 本身不是线程安全的，并发场景一般使用 ConcurrentHashMap。

HashMap 是 Java 集合中最重要的数据结构之一，核心目标是根据 Key 的哈希值，尽可能在 O(1) 时间内完成 put、get、remove。

HashMap 不是线程安全的，因为 HashMap 本身并没有提供完整的并发同步机制，如果多个线程同时：

```
put
resize
修改链表 / 树
```

可能出现：数据覆盖、数据丢失、结构不一致、可见性问题等。并发场景通常使用 ConcurrentHashMap。

JDK 8 以后它的主要结构为：`数组 + 链表 + 红黑树`，链表和红黑树就是来辅助解决 hash 冲突的。

整体结构可以理解为：

```
Node[]
│
├── bucket 0
│
├── bucket 1 → Node → Node
│
├── bucket 2
│
└── bucket 3
            ↓
          红黑树
```

其中数组中的每个位置叫一个 bucket（桶）。

#### 核心数据结构

HashMap 内部主要维护一个：

```java
Node<K,V>[] table;
```

Node 可以简化理解成：

```java
static class Node<K,V> {
    final int hash;
    final K key;
    V value;
    Node<K,V> next;
}
```

每个 Node 保存：

```
hash
key
value
next
```

所以如果多个 Key 落到同一个数组位置，就通过 `next` 形成链表。JDK 8 以后，当链表达到一定条件时会转成红黑树。

![image-20260806164640785](./assets/image-20260806164640785.png)

#### 方法

##### `put` 操作

```java
map.put("Tom", 18);
```

核心流程可以记成：

```
Key
↓
计算 Key 的 hash 值
↓
根据 hash 值用 (table.length-1) & hash 算出应该存放的数组下标
↓
判断桶是否为空？
│
├── 是 → 直接放进去
│
└── 否
     ↓
   Key 是否相同？
     │
     ├── 是 → 覆盖 value
     │
     └── 否
          ↓
        链表 / 红黑树查找
          ↓
        找不到相同 Key
          ↓
        新增节点
          ↓
        判断是否树化
↓
size++
↓
判断是否需要扩容
```

##### `get` 操作

例如，`map.get("Tom");`，流程：

```
根据 key 计算 hash
↓
根据 hash 计算数组下标
↓
table[index]
↓
检查第一个节点
↓
hash + equals
↓
如果不是
↓
链表遍历 / 红黑树查询
↓
找到返回 value
↓
找不到返回 null
```

所以平均情况下时间复杂度是 O(1)。但如果哈希冲突严重，全部变成链表，时间复杂度就是 O(n)。将链表转换为红黑树之后可以改善到 O(log n)。

**Hash 是怎样判断两个 key 是同一个 key 的？**

并不是只是判断 hash 是否一样。核心逻辑类似：

```java
if (node.hash == hash && (node.key == key || key.equals(node.key))) {
    // 同一个 key
}
```

大致经过：

```
1. hash 是否相同
2. 引用是否相同
3. equals 是否相同
```

所以 HashMap 查找一个 Key 的过程是：

```
hashCode()
↓
找到桶
↓
equals()
↓
确定具体 Key
```

这就解释了为什么使用自定义对象作为 HashMap Key 时，重写 equals() 通常必须同时重写 hashCode()。

如果 `a.equals(b) == true`，但 `a.hashCode() != b.hashCode()`，它们可能被分配到完全不同的 bucket。HashMap 甚至没有机会执行 equals。

#### 扩容机制

HashMap 有两个很重要的参数：`capacity` 和 `loadFactor`，其中默认负载因子-`loadFactor` 是 0.75。

> 默认负载因子选择 0.75，这是典型的空间与时间折中。如果 loadFactor 太小，空间浪费严重、扩容次数增加；如果 loadFactor 太大，数组接近满了再扩容，哈希冲突增加、链表 / 红黑树增加、查询性能下降。所以，0.75 是一个经验值。

当数组用了 75% 就会触发自动扩容，阈值计算方式为 `threshold = capacity * loadFactor`。

假设容量是 `16`，那么 `threshold = 16 × 0.75 = 12`，当元素数量超过阈值时，就需要扩容。每次扩容到原来的 2 倍。把数组大小翻倍，然后把所有数据重新算位置放到新数组里，这个操作叫做 rehash，比较耗性能，所以初始化时最好给个预估容量。

**为什么 Hash 容量必须是 2 的幂？**

要根据 hash 计算数组下标，本应该计算 `hash % 数组.length` ，即对数组长度取模。但是 CPU 计算取模（`%`）运算非常慢，而位与（`&`）运算极快。

因此，想要去将取模运算转换为位与运算，思路就是只需要将 `数组长度 - 1` 转换为二进制后与 hash 值 `&` 一下即可，然后只保留数组长度的二进制值，这样就取模运算的结果一致。

但是存在一个问题，比如数组长度是 `nums.length = 10`，减1后对应的二进制是 `0000 1001`，那么无论怎样的 hash 值与该二进制进行 `&` 操作，中间的两个 bit 位都用不上，从而一些数组位置很难甚至无法被使用，这样就会导致 hash 分布不均，增加哈希冲突。

因此，hash 容量的值必须是 2 的幂。比如 `capacity = 16`，那么：

```
capacity - 1 = 15
             = 0000 1111
```

所以 HashMap 使用 2 的幂作为容量，主要是为了利用位运算快速定位桶，同时让 hash 尽可能均匀分布。

**rehashing 细节**

在 jdk 1.7 时，扩容后就是每一个元素重新利用 hash 计算索引位置然后一个一个搬迁过去。

在 jdk 1.8 做了优化：

```
原容量 16 -> 16 - 1 = 15 -> 0000 1111
扩容后 32 -> 32 - 1 = 31 -> 0001 1111

原下标 hash & (16 - 1)
扩容后 hash & (32 - 1)

实际只需要多判断一位即可：
如果多的那一位是 1，那么说明需要搬迁到新位置，新位置的下标就是原下标 + 16；
如果是 0，那么说明吃不到扩容后数组的上界，那就还是在原位置，不需要搬迁。
```

所以，JDK 8 扩容时不需要完整地重新计算 `hash % newCapacity`。

#### 哈希冲突及解决

例如：

```
map.put(key1, value1);
map.put(key2, value2);
```

如果：

```
index(key1) = 5
index(key2) = 5
```

就产生哈希冲突。JDK 8 中通过：`链表 + 红黑树` 解决。例如：

```
table[5]
   ↓
Node(key1)
   ↓
Node(key2)
   ↓
Node(key3)
```

这种方式称为链地址法。

同时，如果同一个下标下的链表超过 8 个节点且数组长度大于等于 64，这个时候长链表就会导致性能下降，因此就将链表转成红黑树（即，树化），查找速度从 O(n) 变成了 O(logn)。

> 如果链表长度很长，但数组长度还不到 64，那么还是优先扩容。因为数组太小时发生冲突，很可能只是容量不足。扩容可能自然解决问题，没有必要马上引入结构更加复杂的红黑树。

但是树化的过程不是单向的，而是可逆的。如果当树中节点减少到少于 6 时，可以重新转换成链表。

为什么不都选用 8？留了个缓冲区间，避免在临界点反复产生结构抖动，即链表转树、树转链表。

**为什么 JDK 1.8 引入红黑树？**

Jdk 1.8 引入红黑树是为了解决哈希冲突严重时查找性能退化的问题。jdk 1.7 及以前，HashMap 用链表处理冲突，一旦冲突多了，链表变长，查找复杂度从 O(1) 退化成 O(n)。更严重的是攻击者可以故意构造大量哈希冲突的 key，让 HashMap 变成一条超长链表，查询直接卡死，这就是所谓的哈希碰撞攻击。

jdk 1.8 的做法是，正常情况还是链表，但链表长度达到 8 且数组长度达到 64 时，自动转成红黑树，查到复杂度降到 O(logn)。反过来，红黑树节点数降到 6 以下时，又退化为链表。

**为什么不全用红黑树？**

红黑树节点占用的内存是链表节点的两倍。TreeNode 要额外存父节点、左右节点、颜色标记这些字段，而链表节点只需要一个 next 指针。

在大多数场景下，HashMap 的冲突都很少，链表长度普遍在 1-3 之间。这时候用红黑树纯粹是浪费内存，遍历三四个节点的链表，性能跟红黑树查找没什么区别。所以 JDK 的设计是，默认使用链表，只有在真正需要时才升级为红黑树。

HashMap 里的红黑树还有个特殊处理：节点同时保留了链表的 next 指针，这样在遍历整个 HashMap 时，还是可以像遍历链表一样顺序访问，不用做中序遍历。

### LinkedHashMap

LinkedHashMap 可以理解成：HashMap + 双向链表维护顺序。

因此它可以保证：插入顺序

或者配置成：访问顺序

这也是它可以被用来实现 LRU 缓存的重要原因。

### TreeMap

TreeMap 和 TreeSet 类似，底层主要基于：红黑树。

它的特点：Key 自动排序，查找 / 插入 / 删除通常 O(log n)

例如：

```
Map<Integer, String> map = new TreeMap<>();

map.put(5, "A");
map.put(1, "B");
map.put(3, "C");
```

遍历：`1 3 5`

### Hashtable

> Hashtable 是 Java 早期提供的线程安全 Map 实现，底层经典实现主要采用数组加链表解决哈希冲突。它通过对 put、get、remove 等主要操作使用 synchronized 来保证线程安全，因此并发控制粒度比较粗，多线程访问时容易产生较大的锁竞争。Hashtable 不允许 null key 和 null value。相比之下，HashMap 不保证线程安全但性能更好，而 ConcurrentHashMap 通过 CAS、volatile 和更细粒度的同步机制实现更高的并发性能，因此现代并发场景一般优先使用 ConcurrentHashMap，Hashtable 主要存在于一些历史代码中。

Hashtable 是比较早期的线程安全 `Map` 实现，目的就是为了解决多个线程操作同一个 Map 时，要保证数据结构安全。和 HashMap 的一个经典区别：

```
Hashtable → 主要方法使用 synchronized 对整个 Hashtable 加锁，因此并发粒度比较粗，线程安全
HashMap → 线程不安全
```

另外：

```
HashMap → 可以有 null key、null value
Hashtable → 不允许 null key、null value
```

> `Hashtable` 之所以不允许 null key 和 null value 的原因是避免 `get()` 返回 null 时产生语义歧义。例如：
>
> ```java
> V value = map.get("Tom");
> ```
>
> 结果是 null。如果允许 null value，那么可能有两种情况：
>
> ```
> 情况一：Tom 不存在
> 情况二：Tom 存在，但是 Value = null
> ```
>
> Hashtable 直接禁止 null，就让：
>
> ```
> get(key) == null
> ```
>
> 可以明确表示不存在对应映射，这点和 ConcurrentHashMap 不允许 null 的设计有相似之处。

但是现在并发场景通常不会推荐 Hashtable，而使用 ConcurrentHashMap。

```java
Map<String, Integer> map = new Hashtable<>();

map.put("Tom", 18);
map.put("Jack", 20);

Integer age = map.get("Tom");
```

#### 数据结构

经典的 Hashtable 实现主要是 `数组 + 链表`，可以理解成：

```
table[]
│
├── [0]
├── [1] → Entry → Entry
├── [2]
├── [3] → Entry
└── [4] → Entry → Entry → Entry
```

每个 Entry 大致保存：

```
hash
key
value
next
```

类似：

```java
class Entry<K, V> {
    int hash;
    K key;
    V value;
    Entry<K, V> next;
}
```

发生 Hash 冲突时，通过链表解决：

```
table[index]
     ↓
Entry A
     ↓
Entry B
     ↓
Entry C
```

所以基本思想和早期 HashMap 很接近：

```
Key
↓
hash
↓
计算桶位置
↓
数组 bucket
↓
链表解决冲突
```

#### `put()` - 线程安全

```java
map.put("Tom", 18);
```

大致过程：

```java
put(key, value)
↓
检查 key / value
↓
计算 hash
↓
根据 hash 计算 bucket 下标
↓
遍历对应链表
↓
是否存在相同 Key？
│
├── 是 → 更新 Value
│
└── 否 → 新增 Entry
↓
判断是否需要扩容
```

由于 `put()` 本身进行了同步，因此同一时刻，一般只有一个线程进入 `Hashtable.put()`。从而保证内部结构不会被多个线程同时修改。

#### `get()` - 线程安全

### ConcurrentHashMap

> ConcurrentHashMap 是 Java 中面向并发场景的线程安全 Map。JDK 8 以后它取消了 JDK 7 的 Segment 分段锁，底层改为数组、链表和红黑树结构。执行 put 时，如果目标桶为空，就通过 CAS 插入；如果桶已经存在节点，则主要通过 synchronized 锁住当前桶的首节点，在桶内完成更新，因此锁粒度比锁整个 Map 更细。get 操作主要依赖 volatile 保证可见性，通常不需要加互斥锁。发生严重 hash 冲突时链表可以树化为红黑树；扩容时使用 ForwardingNode 等机制，并允许多个线程协作迁移数据。此外，元素数量采用类似 LongAdder 的分散计数思想减少竞争。ConcurrentHashMap 不允许 null key 和 null value，并提供 putIfAbsent、computeIfAbsent 等原子复合操作。

`ConcurrentHashMap` 可以理解为：为高并发场景设计的线程安全版 HashMap。

它解决的核心问题是：多个线程同时对 Map 做 `put/get/remove` 时，既要保证线程安全，又不能像早期 `Hashtable` 那样把整个 Map 几乎都锁住。

在面试中一般重点讨论两个版本：

```
JDK 7 → Segment 分段锁

JDK 8+
→ Node 数组 + 链表/红黑树
→ CAS + synchronized
```

现在重点掌握 JDK 8+。

> 为什么 ConcurrentHashMap 不允许 null key 和 null value？
>
> HashMap：`map.put(null, null);` 可以。
>
> ConcurrentHashMap：
>
> ```java
> map.put(null, value);
> map.put(key, null);
> ```
>
> 不允许，会抛 NullPointerException。
>
> 为什么？
>
> 核心原因是并发语义容易产生歧义。例如：
>
> ```java
> V value = map.get(key);
> ```
>
> 返回 null。如果 ConcurrentHashMap 允许 null value，你无法可靠判断：
>
> ```
> 情况 1：这个 key 根本不存在
> 情况 2：这个 key 存在，但 value 本来就是 null
> ```
>
> 单线程 HashMap 还可以通过 `map.containsKey(key)` 继续判断。但并发情况下：
>
> ```
> 线程 A：get(key) → null
> 线程 B：删除 / 插入 key
> 线程 A：containsKey(key)
> ```
>
> 两个操作之间 Map 状态可能已经发生变化。因此 ConcurrentHashMap 直接规定 key 和 value 都不允许为 null。这样 `get(key) == null` 就可以明确表示：当前没有映射到非 null value 的该 key。



**为什么需要 ConcurrentHashMap？**

因为普通 `HashMap`：

```java
Map<String, Integer> map = new HashMap<>();
```

不是线程安全的。多个线程同时：

```java
map.put("A", 1);
map.put("B", 2);
```

可能发生数据覆盖、结构竞争、可见性等并发问题。最简单的办法似乎是：

```java
synchronized (map) {
    map.put(key, value);
}
```

但这样：

```
线程 A 修改 key1 -> 整个 Map 被锁
线程 B 即使修改完全不同的 key2 -> 也只能等待
```

并发性能就很差。而 `ConcurrentHashMap` 的设计目标就是：不锁整个 Map，而是尽可能只同步真正发生竞争的局部位置。

#### 数据结构

JDK 8 的 `ConcurrentHashMap` 和 `HashMap` 的结构比较接近：`数组 + 链表 + 红黑树`，大致：

```
table[]
│
├── [0]
├── [1] → Node → Node
├── [2]
├── [3] → TreeBin
│          ├── TreeNode
│          └── TreeNode
└── [4]
```

核心数组：

```java
transient volatile Node<K,V>[] table;
```

Node 可以简化理解为：

```java
static class Node<K,V> {
    final int hash;
    final K key;
    volatile V val;
    volatile Node<K,V> next;
}
```

这里已经可以看到几个并发设计：

```java
table → volatile
val   → volatile
next  → volatile
```

用于保证一定程度的内存可见性。

但要注意 ConcurrentHashMap 的线程安全并不是简单靠 volatile 实现的。真正核心是：CAS + synchronized + volatile + 协作式扩容。

**CAS**

CAS 是 Compare And Swap（比较并交换），也叫 Compare And Set。它是一种典型的无锁并发原语，Java 中大量用于实现原子类、并发容器、AQS 等机制。

核心思想是：修改变量之前，先判断它的值是不是我之前看到的那个值；如果是，就更新，如果不是，说明被其他线程改过，本次更新失败。

比如现在有一个共享变量：

```java
int value = 10;
```

线程 A 想把它修改成 `11`。CAS 操作逻辑上可以表示成：

```java
CAS(value, 10, 11);
```

这里有三个值：

```
V：当前内存中的值
A：Expected Value，期望值
B：New Value，要修改成的新值
```

CAS 做的事情就是：

```java
if (V == A) {
    V = B;
    return true;
} else {
    return false;
}
```

也就是：

```
当前值 == 期望值？
├── 是 → 更新成新值，成功
└── 否 → 不修改，失败
```

关键在于 “比较 + 修改”这两个动作由 CPU 保证是一个原子操作。因此不会发生比较完之后、修改之前，被另一个线程插进来的问题。

**为什么 JDK 8 不用 Segment 了？**

JDK 7 中，ConcurrentHashMap 使用：

```
ConcurrentHashMap
│
├── Segment 0
│    └── HashEntry[]
│
├── Segment 1
│    └── HashEntry[]
│
└── ...
```

每个 Segment 类似：

```java
class Segment extends ReentrantLock
```

即 `Segment` 本质上类似一把独立的锁。所以可以理解成：Map 被划分成多个段，不同线程操作不同 Segment，可以并发；不同线程操作同一个 Segment，需要竞争同一把锁。这就是分段锁。JDK 8 取消了 Segment。结构变成：

```
table[] -> 直接对具体桶进行并发控制
```

锁粒度进一步细化到桶级别附近。所以：

```
JDK 7 → Segment 级别
JDK 8 → bucket / bin 级别
```

这是两个版本最核心的区别之一。

#### 方法

##### `put` 操作

```java
map.put("Tom", 18);
```

JDK 8 ConcurrentHashMap 的核心流程可以概括成：

```
计算 hash
↓
table 是否初始化？
├── 否 → 初始化
└── 是
↓
根据 hash 找桶
↓
桶为空？
├── 是
│    ↓
│   CAS 直接插入
│
└── 否
     ↓
   是否正在扩容？
   ├── 是 → 协助扩容
   └── 否
        ↓
      synchronized 锁当前桶首节点
        ↓
      链表 / 红黑树中查找
        ↓
      相同 key → 覆盖
      不同 key → 插入
↓
更新元素数量
↓
判断是否需要扩容
```

这里最重要的是理解：空桶使用 CAS，发生冲突的桶才使用 synchronized。

**桶为空，用 CAS 直接插入**

假设：

```
table[index] == null
```

ConcurrentHashMap 不会马上 `synchronized (...)`，而是通过 CAS：如果 `table[index]` 还是 null -> 把新 Node 放进去。

可以抽象成：

```
CAS(table[index], null, newNode);
```

CAS 的含义：只有当当前位置仍然是我刚才看到的那个旧值时，才执行更新。

例如两个线程：

```
table[5] = null
```

线程 A 和 B 同时想插入。

```
线程 A：CAS(null → NodeA) 成功
线程 B：CAS(null → NodeB) 失败
```

B 失败后重新检查当前桶，而不是把 A 的数据覆盖掉。所以无竞争的空桶插入可以不用加锁。

**桶不为空，使用 synchronized**

如果：

```
table[index] != null
```

说明已经发生 hash 冲突。例如：

```
table[5]
   ↓
Node A
   ↓
Node B
```

这时候需要修改链表或者红黑树结构。ConcurrentHashMap 会对当前 bin 的首节点加锁，逻辑上类似：

```java
synchronized (f) {
    // 再次确认 f 仍然是当前桶首节点

    // 遍历链表 / 红黑树

    // 插入或者更新
}
```

注意：它不是锁整个 ConcurrentHashMap，而主要是锁当前发生竞争的桶。例如：

```
线程 A 修改 table[3]
线程 B 修改 table[100]
```

两者通常可以并行。但是：

```
线程 A 修改 table[3]
线程 B 也修改 table[3]
```

才会竞争。所以并发性能比整个 Map 一把大锁要好得多。

**为什么 JDK 8 又开始使用 synchronized？**

很多人有一个误区：synchronized 性能差，所以 ConcurrentHashMap 应该完全不用 synchronized。

这是不对的。现代 JVM 对 `synchronized` 做了大量优化，而且这里锁的不是整个 Map，只是局部桶。所以 JDK 8 的思路是：

```
没有竞争 → CAS
存在局部结构修改 → synchronized
```

这是一种非常合理的组合。因此 JDK 8 ConcurrentHashMap 的经典概括就是：CAS + synchronized。

##### `get` 操作

`get` 操作需要加锁，因为该操作完全依赖 volatile 语义来保证线程安全，读取时能拿到最新的数据，不会有并发问题。

例如：

```java
V value = map.get(key);
```

get 的过程大致：

```
计算 hash
↓
找到 bucket
↓
检查第一个节点
↓
链表 / 红黑树查找
↓
返回 value
```

通常不需要加 `synchronized`。

为什么？因为 ConcurrentHashMap 通过 `volatile` 等机制保证关键数据的可见性，例如节点中的：

```java
volatile V val;
volatile Node<K,V> next;
```

所以读操作主要通过 volatile 可见性完成，而不需要互斥锁。这也是 ConcurrentHashMap 性能高的重要原因。可以记：

```
get → 基本无锁
put → CAS + 局部 synchronized
```

#### 扩容机制

HashMap 扩容时是一个线程将旧 table 迁移到新 table。而 ConcurrentHashMap 更复杂，因为可能有多个线程同时操作。

JDK 8 的一个重要设计是多个线程可以共同参与扩容。也就是：

```
Thread A ─┐
Thread B ─┼── 帮忙迁移旧 table
Thread C ─┘
```

而不是只让一个线程搬完整张表，这叫协作式扩容。

**ForwardingNode 是什么**

扩容过程中会出现一个特殊节点：

```
ForwardingNode
```

它可以理解成一个标记：这个桶已经迁移到新 table 了。

例如：

```
旧 table[5]
↓
ForwardingNode
↓
nextTable
```

如果线程执行 put 时发现当前位置是 ForwardingNode：说明当前正在 resize，即这个桶已经开始迁移了，线程可以参与帮助扩容。get 的时候如果遇到迁移节点，也可以继续到新表中查找。

因此扩容过程中并不是整个 ConcurrentHashMap 停下来全部扩完后，再继续提供服务。而是允许扩容和部分正常访问并发进行。

这是 ConcurrentHashMap 设计中非常重要的一点。

**树化**

和 HashMap 类似，当某个桶冲突严重时，链表达到树化条件，则将链表转换为红黑树。相关阈值同样包括：`TREEIFY_THRESHOLD = 8` 和 `MIN_TREEIFY_CAPACITY = 64`。也就是说通常需要 `桶节点数量达到树化阈值 + table 容量至少 64`，否则优先扩容。

原因和 HashMap 一样：如果当前数组太小，冲突很可能是容量不足导致的，扩容比直接树化更合适。

**ConcurrentHashMap 的红黑树**

ConcurrentHashMap 中树化后的桶会使用一个重要结构：`TreeBin`，大致：

```
table[index]
     ↓
   TreeBin
     ↓
 红黑树节点
```

为什么还需要 TreeBin？

因为这里不仅是红黑树数据结构，还要处理并发读/写、树结构调整。因此需要额外的并发控制。

所以不要简单认为 ConcurrentHashMap 红黑树 = HashMap 红黑树完全一样，结构思想类似，但并发控制更加复杂。

### 总结

```
              Map
               │
       ┌───────┼─────────────┐
       ↓       ↓             ↓
    HashMap Hashtable ConcurrentHashMap
       │       │             │
       │       │             │
   非线程安全  线程安全       线程安全
              │             │
          粗粒度同步      细粒度并发
              │             │
          老旧方案        现代并发方案
```



## 各集合的有序、排序、重复

“有序”通常指：是否保留某种稳定的遍历顺序，例如插入顺序。

“排序”指：是否按照大小、Comparator 等规则排列。

例如：

| 集合          | 可重复     | 保持插入顺序 | 自动排序 |
| ------------- | ---------- | ------------ | -------- |
| ArrayList     | 是         | 是           | 否       |
| HashSet       | 否         | 否           | 否       |
| LinkedHashSet | 否         | 是           | 否       |
| TreeSet       | 否         | 按排序顺序   | 是       |
| HashMap       | Key 不重复 | 否           | 否       |
| LinkedHashMap | Key 不重复 | 是           | 否       |
| TreeMap       | Key 不重复 | 按排序顺序   | 是       |

所以不要笼统地说 TreeSet 是“有序的”。更准确的是 TreeSet 按比较规则维护排序顺序。

## Collection 与 Collections

这是高频面试题。

`Collection`：java.util.Collection，是集合体系的顶层接口之一。

例如：

```
List
Set
Queue
```

都属于 Collection 体系。而：

```
java.util.Collections
```

是操作集合的工具类。

里面有很多静态方法：

```
Collections.sort(list);
Collections.reverse(list);
Collections.shuffle(list);
Collections.max(list);
Collections.min(list);
```

所以：

```
Collection
→ 接口

Collections
→ 工具类
```

## Iterable 和 Iterator

Collection 又和 Iterable 有关。

整体关系：

```
Iterable
   ↑
Collection
   ↑
List / Set / Queue
```

Iterable 提供：

```
iterator()
```

得到：

```
Iterator
```

例如：

```
Iterator<String> iterator = list.iterator();

while (iterator.hasNext()) {
    String value = iterator.next();
}
```

而：

```
for (String value : list) {
}
```

增强 for 循环底层也和 Iterator 密切相关。

后面还会涉及：

```
fail-fast
ConcurrentModificationException
```

这也是集合的重要面试点。

## 开发中如何选

实际开发可以先这样判断：

```
需要 Key-Value？
│
├── 是 → Map
│       ├── 普通场景 → HashMap
│       ├── 保持插入顺序 → LinkedHashMap
│       ├── Key 排序 → TreeMap
│       └── 并发场景 → ConcurrentHashMap
│
└── 否 → Collection
        │
        ├── 允许重复？
        │
        ├── 是 → List
        │       └── 通常 ArrayList
        │
        └── 否 → Set
                ├── 普通去重 → HashSet
                ├── 保留插入顺序 → LinkedHashSet
                └── 排序 → TreeSet
```

如果需要 FIFO：

```
Queue
```

如果需要优先级：

```
PriorityQueue
```

如果需要栈 / 双端队列：

```
ArrayDeque
```



