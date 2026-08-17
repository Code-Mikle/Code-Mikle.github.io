---
title: Java 八股文
---

## 为什么使用 Java，优势是啥？

> Java 首先具有比较好的跨平台能力，通过 JVM 屏蔽底层操作系统差异。其次，Java 本身提供了完善的面向对象、异常、泛型和并发机制，同时 JVM 又提供了自动内存管理、GC、JIT 编译和成熟的性能诊断能力。
> 更重要的是，Java 的企业级生态非常成熟，比如 Spring、Spring Boot、MyBatis、Netty，以及完善的中间件和监控体系，所以在大型、高并发、长期维护的后端系统中，Java 在开发效率、性能、稳定性和可维护性之间取得了比较好的平衡。

Java 的核心优势可以概括为：

1. 跨平台

   Java 源代码先编译成字节码 `.class`，再由不同平台上的 JVM 执行，因此实现了 `Write Once, Run Anywhere`，也就是“一次编写，到处运行”。本质上不是 Java 程序天然跨平台，而是 JVM 屏蔽了不同操作系统和硬件之间的差异。

2. 完善的面向对象能力

   Java 是典型的面向对象语言，支持：封装、继承、多态、接口、抽象类。这套机制比较适合构建大型、复杂、多人协作的软件系统，代码的模块化、复用性和可维护性较好。

3. 自动内存管理

   Java 有 JVM 提供的垃圾回收机制 GC，不需要像 C/C++ 一样手动 `malloc/free` 或 `new/delete`。这带来两个好处：

   - 降低内存管理复杂度
   - 减少野指针、悬空指针、重复释放等问题

   当然，Java 仍然可能发生内存泄漏和 OOM，只是内存生命周期由 JVM 管理，而不是完全手工管理。

4. 生态非常成熟

   Java 最大的优势之一其实是生态。比如后端开发中常见的 Spring、Spring Boot、Spring Cloud、MyBatis、Hibernate、Netty、Maven、Gradle 等，以及大量中间件、数据库驱动、监控工具和企业级框架。所以 Java 很适合企业级应用，因为很多问题已经有成熟解决方案，而不是需要自己从零实现。

5. 并发能力强

   Java 从语言和 JDK 层面就提供了比较完整的并发支持，比如：`synchronized`、`volatile`、`Thread`、`Lock`、`AQS`、CAS、线程池、`ConcurrentHashMap`、`CompletableFuture` 等，这使得 Java 很适合开发高并发服务器和后端系统。

6. JVM 能力强

   Java 背后有 JVM，这其实是 Java 非常重要的竞争力。JVM 提供了：JIT 即时编译、GC、内存管理、类加载机制、运行时优化、性能监控、故障诊断等。Java 虽然不是直接编译成本地机器码，但 JVM 会在运行过程中根据热点代码进行 JIT 编译和优化，因此长期运行的服务性能通常比较稳定。

7. 安全性和健壮性较好

   Java 相比 C/C++，对很多危险操作做了限制，例如：没有显式指针运算、数组越界检查、强类型检查、异常机制、JVM 字节码验证、自动 GC 等。因此大型项目中更不容易因为底层内存操作错误导致系统崩溃。

8. 向后兼容性较好

   Java 非常重视兼容性。很多多年以前编写的 Java 程序，在新版本 JVM 上仍然可以运行。对于企业系统来说，这是非常重要的，因为企业系统通常生命周期很长，不可能因为语言升级就频繁重写。

## 基本类型与包装类型

Java 中的数据类型可以分成两大类：基本类型（Primitive Type）和引用类型（Reference Type）。包装类型本质上属于引用类型，只是专门用于“包装”基本类型。

基本类型与包装类型最为本质的差异就是：基本类型直接存数值，包装类型是对象。

基本类型有 4 种整型、2 种浮点类型、1 种用于表示 Unicode 编码的字符单元的字符类型 char 和 1 种用于表示真值的 boolean 类型。

| 基本类型  | 包装类型    | 大小                       | 范围           | 默认值     |
| --------- | ----------- | -------------------------- | -------------- | ---------- |
| `byte`    | `Byte`      | 1 字节                     | -128 ~ 127     | `0`        |
| `short`   | `Short`     | 2 字节                     | -32768 ~ 32767 | `0`        |
| `int`     | `Integer`   | 4 字节                     | 约 ±21 亿      | `0`        |
| `long`    | `Long`      | 8 字节                     | 约 ±922 亿亿   | `0L`       |
| `float`   | `Float`     | 4 字节                     | 约 ±3.4E38     | `0.0f`     |
| `double`  | `Double`    | 8 字节                     | 约 ±1.7E308    | `0.0d`     |
| `char`    | `Character` | 2 字节                     | Unicode 字符   | `'\u0000'` |
| `boolean` | `Boolean`   | JVM 规范未规定固定存储大小 | true/false     | `false`    |

最核心的区别，可以从下面几个角度理解。

**第一，基本类型直接表示值，包装类型是对象。**例如：

```
int a = 10;
Integer b = 10;
```

`a` 是基本类型值，而 `b` 是一个 `Integer` 对象的引用。因此 `Integer b = null;` 是合法的。但 `int a = null;` 是不合法的。这也是包装类型一个非常重要的作用：它可以表示“没有值”。例如数据库查询结果 `Integer age;`，如果数据库中的 `age` 是 `NULL`，可以用 `age = null;`，但如果使用 `int age;` 就无法直接表达数据库中的 `NULL`。

**第二，默认值不同。**作为成员变量时：

```java
class User {
    int age;
    Integer score;
}
```

如果没有赋值的话，`age = 0; score = null`。所以在业务代码中，如果 `0` 和“未设置”是两种不同含义，通常应该使用 `Integer`。例如：`age = 0` 可能表示年龄确实是 0。而 `age = null` 表示年龄未知或没有填写。

**第三，包装类型可以用于泛型，基本类型不可以。**这是非常重要的一点。

错误：

```
List<int> list;
```

正确：

```
List<Integer> list;
```

原因是 Java 泛型要求类型参数必须是引用类型，基本类型不是对象。因此集合中只能存包装类型：

```java
List<Integer> list = new ArrayList<>();
list.add(1);
list.add(2);
```

看起来存的是 `int`，实际上这里发生了自动装箱。

**第四，基本类型性能通常更高。**例如：

```java
int a = 10;
Integer b = 10;
```

基本类型通常不需要创建对象，也没有对象头等额外开销。而包装类型作为对象，会带来额外的：对象内存开销，引用开销，装箱 / 拆箱开销，GC 压力等。

例如一个非常大的数组：

```java
int[] nums = new int[1_000_000];
```

通常比：

```java
Integer[] nums = new Integer[1_000_000];
```

占用的内存少很多。

**第五，基本类型用 `==` 比较值，包装类型的 `==` 比较引用。**例如：

```java
int a = 1000;
int b = 1000;
System.out.println(a == b);
```

结果：`true`，因为比较的是数值。但是：

```java
Integer a = 1000;
Integer b = 1000;
System.out.println(a == b);
```

一般是 `false`，因为 `Integer` 是对象，`==` 比较的是两个引用是否指向同一个对象。正确比较包装类型的值应使用 `a.equals(b);`，例如：

```java
System.out.println(a.equals(b)); // true
```

不过这里还有一个非常经典的坑：Integer 缓存。例如：

```java
Integer a = 127;
Integer b = 127;
System.out.println(a == b);
```

结果通常是 `true`，但是：

```java
Integer a = 128;
Integer b = 128;
System.out.println(a == b);
```

结果通常是 `false`，这是因为 `Integer.valueOf()` 默认缓存了 `-128 ~ 127` 范围内的 `Integer` 对象。自动装箱：

```java
Integer a = 127;
```

本质上相当于：

```java
Integer a = Integer.valueOf(127);
```

而 `Integer.valueOf()` 会使用缓存。所以：

```java
Integer a = 127;
Integer b = 127;
```

两者拿到的是同一个缓存对象：

```
a ──┐
    ├──> Integer(127)
b ──┘
```

而 `128` 默认不在缓存范围内，所以会得到不同对象。因此实际开发中有一个明确规则：包装类型比较值，不要用 `==`，使用 `equals()`。

**第六，基本类型和包装类型之间存在自动装箱和拆箱。**

Java 5 以后支持自动装箱。例如：

```java
Integer a = 10;
```

编译器实际上会转换为：

```java
Integer a = Integer.valueOf(10);
```

这就是装箱，将 `int` 类型转换为 `Integer`，反过来：

```java
Integer a = 10;
int b = a;
```

相当于：

```java
int b = a.intValue();
```

这就是拆箱，将 `Integer` 类型转换为 `int`。这里有一个很常见的坑：空指针。例如：

```java
Integer a = null;
int b = a;
```

运行时会抛 NullPointerException，因为实际执行的是：

```java
int b = a.intValue();
```

而 `a == null`，所以发生空指针异常。这也是为什么数据库字段、DTO 字段使用包装类型时，要特别注意自动拆箱。例如：

```java
Integer count = null;
if (count > 0) {...}
```

看起来只是比较大小，实际上需要拆箱：

```java
count.intValue() > 0
```

于是直接 NPE（Null Pointer Exception）。

### 两者传参时的区别

基本类型和包装类型在传参时，本质上都是**值传递**，但传递的“值”的内容不同，这也直接决定了它们在方法内部能否影响外部数据。

当把基本类型（如 `int`、`double`）作为参数传递给方法时，传递的是该变量在栈内存中存储的**具体数值的副本**。在方法内部对参数的任何修改，都只会影响这个副本，**绝对不会影响**方法外部的原始变量。

当把包装类型（如 `Integer`、`Double`）作为参数传递时，传递的是**对象引用地址的副本**。虽然方法内部拿到了指向同一个堆内存对象的引用，但由于 Java 中的包装类（如 `Integer`）是**不可变对象（Immutable）**，你无法直接修改它内部的值。如果你在方法内部对参数重新赋值（例如 `num = 100`），实际上只是让这个副本引用指向了一个新的对象，**外部的原始引用依然指向原来的对象，不会受到任何影响**。

## String

从概念上讲，Java 字符串就是 Unicode 字符序列。例如，串“ Java\u2122” 由5个 Unicode 字符 J、a、v、a 和™。Java 没有内置的字符串类型，而是在标准 Java 类库中提供了一个预定义类，很自然地叫做 String。每个用双引号括起来的字符串都是 String 类的一个实例：

```java
String e = ""; // an empty string
String greeting = "Hello";
```

**字符串拼接**，例如：

```java
String s = "hello" + "world";
```

这种情况比较特殊。因为 `"hello"` 和 `"world"` 都是编译期常量，所以编译器可以直接优化为 `String s = "helloworld";`。因此：

```java
String a = "hello" + "world";
String b = "helloworld";
System.out.println(a == b);
```

通常是 `true`，因为编译阶段已经完成字符串拼接。但是：

```java
String a = "hello";
String b = a + "world";
String c = "helloworld";
```

这里 `b == c` 通常是 `false`。因为 `a` 是变量，拼接需要在运行期完成。

> 频繁拼接为什么不建议使用 String？
>
> 因为 String 是不可变对象。比如：
>
> ```java
> String s = "";
> for (int i = 0; i < 10000; i++) { s += i; }
> ```
>
> 每一次 `s += i;` 都可能产生新的字符串对象。会创建大量临时对象，导致：内存开销、GC 压力、性能下降等。所以频繁拼接字符串应该使用 `StringBuilder`，例如：
>
> ```java
> StringBuilder sb = new StringBuilder();
> 
> for (int i = 0; i < 10000; i++) {
>       sb.append(i);
> }
> 
> String result = sb.toString();
> ```

### String 是不可变对象

所谓不可变，就是 `String` 对象一旦创建，它所表示的字符串内容就不能再修改。例如：

```java
String s = "hello";
s = s + " world";
```

看起来像是修改了 `s`，实际上不是修改原来的 `"hello"`。实际过程更接近：

```
"hello"        原 String 对象
"hello world"  新 String 对象
s 的引用从："hello" 变成："hello world"
```

也就是说，发生变化的是引用 `s`，不是原来的 `String` 对象。在现代 JDK 中，`String` 内部大致维护的是一个数组，例如当前 JDK 实现中使用类似：

```java
private final byte[] value;
```

早期 JDK 则主要使用：

```java
private final char[] value;
```

`final` 保证这个引用初始化以后不能重新指向另一个数组，再配合 `String` 本身对内部数据的封装，实现不可变性。

**String 为什么要设计成不可变**

主要有如下几个原因：

**第一，字符串常量池需要不可变。**

JVM 在堆里专门开辟了一块区域存字符串常量，相同内容的字符串只存一份。例如：

```java
String a = "hello";
String b = "hello";
```

`a` 和 `b` 可以共同指向字符串常量池中的同一个 `"hello"` 对象：

```
a ──┐
    ├──> "hello"
b ──┘
```

如果 `String` 可以修改 `a 修改成 "world"`，那么 `b` 看到的内容也可能被改变，这显然不可接受。所以常量池对象能够安全共享，一个重要前提就是 “String 不可变”。

**第二，保证线程安全。**

不可变对象天然比较适合多线程共享。多个线程同时访问：

```java
String s = "hello";
```

因为没有线程能够修改 `s` 所引用 String 对象的内部内容，所以不需要额外加锁。

**第三，适合作为 HashMap 的 key。**例如：

```java
Map<String, Object> map = new HashMap<>();
map.put("user", user);
```

HashMap 根据 `hashCode → bucket` 定位 key。如果 String 可以修改：

```
原来："user" hashCode = X
修改后："admin" hashCode = Y
```

对象已经放在根据 `X` 定位的位置，但是现在它的 hashCode 变成 `Y`，HashMap 就可能再也找不到它。String 不可变，因此字符串内容不变，hashCode 不变，适合作为 HashMap key。

**第四，安全性更高。**

String 经常用来表示：数据库连接地址、URL、文件路径、用户名、网络地址、Class 名称等。如果 String 可以被随意修改，会带来很多安全问题。

### String 常量池

Java 为了避免创建大量重复字符串，引入了字符串常量池。例如：

```java
String a = "hello";
String b = "hello";
```

第一次执行：`String a = "hello";`，JVM 会先检查字符串常量池中是否存在 `"hello"`。如果不存在，然后把 `a ─────> "hello"` 加入常量池。

第二次：`String b = "hello";`，发现常量池已经存在 `"hello"`，直接复用：

```
a ──┐
    ├──> "hello"
b ──┘
```

因此 `System.out.println(a == b);` 结果是 `true`。因为 `a` 和 `b` 指向同一个对象。

### new String() 的区别

例如：

```java
String a = "hello";
String b = new String("hello");
```

这时候执行 `a == b` 的结果是 `false`。因为 `a` 指向字符串常量池，而 `new String("hello")` 会显式创建一个新的 String 对象：

```
Heap

String("hello")
     ↑
     b
```

所以 a 指向的是常量池中的 `"hello"`，b 指向的是 new 出来的 String 对象。但是它们的内容相同，因此 `a.equals(b)` 返回 `true`，所以这里必须区分：

```
== 比较引用是否指向同一个对象
equals() 比较字符串内容是否相同
```

> 注：`Object` 默认的 `equals()` 本质上仍然是比较引用。但 `String` 重写了 `equals()` 方法。因此实际开发中，比较字符串内容应该使用 `equals()`，不要使用 `==`。

**new String("abc") 创建几个对象？**

例如：

```java
String s = new String("abc");
```

不能简单固定回答“两个”。准确说法应该是：

如果字符串常量池中原本不存在 `"abc"`，可能涉及：1）常量池中的 "abc"；2）new 创建的 String 对象。所以通常说创建两个相关对象。但如果 `"abc"` 已经存在于字符串常量池中，那么 `new String("abc")` 只需要再 new 一个 String 对象。因此最多涉及两个对象，具体取决于字符串常量池中是否已经存在该字面量。

### intern() 方法

`String.intern()` 的作用可以理解为获取字符串常量池中与当前字符串内容相同的字符串引用。

例如：

```java
String a = new String("hello");
String b = a.intern();
String c = "hello";
```

通常：

```java
System.out.println(a == c); // false
System.out.println(b == c); // true
```

因为：

```
a → 中 new 出来的 String

b ──┐
    ├──> String Pool 中的 "hello"
c ──┘
```

### String、StringBuffer 和 StringBuilder 的区别

String 是不可变的，底层的 char 数组被 final 修饰。每次拼接、替换都会生成新对象，原来那个不会变。

StringBuffer 和 StringBuilder 都是可变的，底层用一个可扩容的数组存字符。区别在于 StringBuffer 的方法都加了 synchronized，是线程安全的；StringBuilder 没加锁，单线程下性能更好。

| 类型            | 是否可变 | 线程安全 | 性能                |
| --------------- | -------- | -------- | ------------------- |
| `String`        | 不可变   | 是       | 频繁修改较低        |
| `StringBuilder` | 可变     | 否       | 最高                |
| `StringBuffer`  | 可变     | 是       | 比 StringBuilder 低 |

实际选型：

- 字符串基本不变或者只是少量拼接，使用 String；
- 多线程环境下要频繁修改字符串，用 StringBuffer；
- 单线程下大量拼接操作，用 StringBuilder。

**StringBuffer**

当拼接的字符串长度超过了当前 `byte[]` 的容量时，底层会触发扩容。默认情况下，新容量会扩展为**原容量的 2 倍 + 2**。扩容的本质是调用 `Arrays.copyOf()` 创建一个新的、更大的数组，并将旧数据拷贝过去。

它的核心方法（如 `append()`、`insert()`、`delete()`）都加上了 **`synchronized`** 关键字。这意味着在多线程环境下，同一时刻只能有一个线程操作同一个 `StringBuffer` 对象，保证了数据的一致性，但代价是**性能较低**。

**StringBuilder**

当拼接的字符串长度超过了当前 `byte[]` 的容量时，底层会触发扩容。默认情况下，新容量会扩展为**原容量的 2 倍 + 2**。扩容的本质是调用 `Arrays.copyOf()` 创建一个新的、更大的数组，并将旧数据拷贝过去。

它的方法**没有**加 `synchronized`。在单线程环境下，它省去了加锁和释放锁的开销，因此**性能非常高**。

## 面向对象

面向对象（Object-Oriented Programming，OOP）本质上是一种程序设计思想：把现实世界中的事物抽象成“对象”，通过对象之间的协作来完成业务逻辑。比如开发一个电商系统，可以把用户、商品、订单、购物车、支付都抽象成对象。对象内部包含两类东西：

```
属性：对象有什么
行为：对象能做什么
```

类（class) 是构造对象的模板或蓝图。由类构造（construct) 对象的过程称为创建类的实例（instance)。

### 类

一个类可以同时继承抽象类和实现接口吗？

可以。Java 允许一个类继承一个抽象类的同时实现多个接口。这也是 Java 解决单继承限制的常用手段，核心代码复用放抽象类里，额外的能力通过接口来补充。

### 封装（Encapsulation）

**封装（encapsulation, 有时称为数据隐藏）**是与对象有关的一个重要概念。从形式上看，封装不过是将数据和行为组合在一个包中，并对对象的使用者隐藏了数据的实现方式。对象中的数据称为实例域（instance field)，操纵数据的过程称为方法（method)。对于每个特定的类实例（对象）都有一组特定的实例域值。这些值的集合就是这个对象的当前状态（state)。 无论何时，只要向对象发送一个消息，它的状态就有可能发生改变。

实现封装的关键在于绝对不能让类中的方法直接地访问其他类的实例域。程序仅通过对象的方法与对象数据进行交互。封装给对象赋予了“黑盒” 特征，这是提高重用性和可靠性的关键。这意味着一个类可以全面地改变存储数据的方式，只要仍旧使用同样的方法操作数据，其他对象就不会知道或介意所发生的变化。

对上述的总结就是，封装的核心思想是隐藏对象内部实现细节，只对外暴露必要的接口。

**Java 中四种访问修饰符的级别**

| 修饰符                  | 当前类 | 同一个包 | 子类（不同包） | 任意位置（全局） |
| ----------------------- | ------ | -------- | -------------- | ---------------- |
| `private`               | ✅      | ❌        | ❌              | ❌                |
| `default`（不写即默认） | ✅      | ✅        | ❌              | ❌                |
| `protected`             | ✅      | ✅        | ✅              | ❌                |
| `public`                | ✅      | ✅        | ✅              | ✅                |

注意：`protected` 允许不同包的子类访问父类的成员，但有一个严格的限制：子类只能通过继承的方式来访问，不能通过创建父类对象来访问。

### 继承（Inheritance）

继承表示：子类可以复用父类已有的属性和行为。

**重载与重写**

| 对比项   | 重载 Overload - 编译期多态，静态绑定 | 重写 Override - 运行期多态，动态绑定 |
| -------- | ------------------------------------ | ------------------------------------ |
| 发生位置 | 同一个类中                           | 父类与子类之间                       |
| 方法名   | 必须相同                             | 必须相同                             |
| 参数列表 | 必须不同                             | 必须相同                             |
| 返回值   | 可以不同，但不能只靠返回值区分       | 相同或协变返回类型                   |
| 访问权限 | 无特殊限制                           | 子类不能缩小权限                     |
| 异常     | 无特殊限制                           | 不能抛出更宽的受检异常               |
| 绑定时机 | 编译期                               | 运行期                               |
| 多态类型 | 静态多态                             | 动态多态                             |

**为什么 Java 不支持多重继承？**

Java 不支持多继承，因为为了避免多继承带来的菱形继承问题。菱形继承指的是，假设类 A 有一个方法 `doSomething()`，B 和 C 都继承了 A，并各自重写了这个方法，然后 D 同时继承 B 和 C。那么当调用 `D.doSomething()` 时，到底该执行 B 的版本，还是 C 的版本？就产生了歧义。

### 多态性（Polymorphism）

多态可以理解为：同一个引用类型，在运行时可以表现出不同的对象行为。

### 抽象（Abstraction）

抽象是：从复杂对象中提取共同、本质的特征，而忽略不重要的实现细节。

Java 主要通过两种方式实现抽象：**抽象类** 和 **接口**。

它们的共同目标都是：先定义“应该具备什么能力”，把具体“怎么实现”交给子类或实现类。

但两者承担的角色不同：抽象类更偏向“父类模板”，接口更偏向“能力规范”。

#### 抽象类（Abstract Class）

就是将一批具有共同逻辑的、代码可以复用的类的公共部分给抽取封装为一个新的类。

抽象类使用 `abstract` 修饰：

```java
public abstract class Animal {
    public abstract void speak();
}
```

这里 `public abstract void speak();` 只有方法声明，没有方法体，因此叫抽象方法。

子类继承抽象类后，需要实现抽象方法：

```java
public class Dog extends Animal {
    @Override
    public void speak() {
        System.out.println("汪汪");
    }
}
```

然后：

```java
Animal animal = new Dog();
animal.speak();
```

输出：`汪汪`。

**抽象类的特点**：

1. 抽象类不能实例化

2. 构造函数

   抽象类可以有构造方法。但抽象类的构造函数不是给自己用的，抽象类本身不能被实例化。它的构造函数是给子类调用的，子类构造的时候会先调父类的构造函数。一般用来初始化抽象类中定义的成员变量，或做一些通用的校验逻辑。

3. 成员变量

   抽象类可以拥有：实例变量，静态变量，常量，以及 private / protected / public 字段。

4. 成员方法

   抽象类可以有抽象方法（定义规范，子类实现），也可以有普通方法（提供公共实现，子类复用）。有抽象方法的类必须是抽象类，抽象类不一定有抽象方法。

   > 即使没有写抽象方法，该类也可以声明为 `abstract`，目的是为了不让外部直接创建这个类的对象。
   >
   > 抽象方法不可以是 `private`、`static` 或 `final`，因为抽象方法的目的就是让子类重写。

5. 继承

   一个子类只能继承一个直接父类，无论这个父类是不是抽象类。

   如果该子类，把父类的所有抽象方法都实现了，那该子类就可以是普通类。

   如果该子类，只实现了父类一部分的抽象方法，那该子类就还得声明为抽象类。

#### 接口（Interface）

接口主要解决的问题是：一批可能完全不同的类，需要遵守相同的一套行为规范。

也即，接口主要用来定义某一类对象应该具备什么能力。例如：

```java
public interface Flyable {
    void fly();
}
```

实现类：

```java
public class Bird implements Flyable {
    @Override
    public void fly() {
        System.out.println("鸟在飞");
    }
}
```

使用：

```java
Flyable flyable = new Bird();
flyable.fly();
```

这里表达的是：Bird 是一种具体对象。Flyable 表示：“具备飞行能力”。所以接口特别适合描述“能力”。比如：

```
Comparable → 可以比较
Runnable → 可以运行
Serializable → 可以序列化
Closeable → 可以关闭
```

这也是为什么接口经常以 `-able` 结尾。

**接口的特点**：

1. 没有构造函数

2. 成员变量

   接口的成员变量默认是 `public static final`。因为接口设计初衷就是定义行为契约，不是用来存状态的。变量设成 final 就是常量，不会变；设成 static 是因为接口不能实例化，只能通过类名访问；设成 public 是因为接口就是给别人用的，没必要藏着。

3. 成员方法：抽象方法、`default` 方法、静态方法、私有方法

   接口的成员方法默认是  `public abstract`。

   但是 Java 8 引入了 `default` 方法：

   ```java
   public interface Flyable {
       void fly();
       default void land() { ... }
   }
   
   Bird bird = new Bird();  // Bird implements Flyable
   bird.fly();
   bird.land();
   ```

   实现类可以直接继承 `land()` 方法，也可以重写该方法。

   > 那么为什么要增加 `default` 方法？
   >
   > 核心原因是为了在不破坏已有实现类的情况下扩展接口。假设以前一个接口有几百个实现类，如果该接口增加新的方法，所有实现类就都得实现该方法，也就是都要全部修改。而 `default` 就是提供默认方法，实现类不用强制实现该方法。

   接口也可以定义静态方法：

   ```java
   public interface Flyable {
       static void test() { ... }
   }
   
   Flyable.test();
   ```

   Java 9 引入了 `private` 方法：

   ```java
   public interface Flyable {
       private void check() { ... }
   }
   ```

   引入私有方法主要是解决代码复用问题。如果多个 default 方法有重复逻辑，以前只能复制粘贴，现在可以抽到私有方法里统一调用。 

4. 实现

   接口可以被多实现。

5. 继承

   接口本身也可以继承接口，例如：

   ```java
   interface Animal {
       void eat();
   }
   interface Flyable {
       void fly();
   }
   ```

   一个接口甚至可以多继承接口：

   ```java
   interface FlyingAnimal extends Animal, Flyable {...}
   ```

**Java 为什么同时需要接口和抽象类？**

例如：

```java
class Bird extends Animal
        implements Flyable, Runnable {
}
```

一个 Bird：

```
是什么？→ Animal

具备什么能力？
→ Flyable
→ Runnable
```

这正好体现抽象类和接口的分工。

#### 接口与抽象类的区别

1. 设计动机

   接口的涉及是自上而下的。我们知晓某一行为，于是基于这些行为约束定义了接口，一些类需要有这些行为，因此实现对应的接口。

   抽象类的涉及是自下而上的。我们写了很多类，发现它们之间有共性，有很多代码可以复用。因此将公共逻辑封装成一个抽象类，减少代码冗余。

2. 方法实现

   接口中的方法默认是 `public abstract`，但在 Java 8 之后可以设置 `default` 方法和静态方法。Java 9 之后可以设置 `private` 方法。抽象类可以包含 `abstract` 方法和具体方法，允许子类继承并重写抽象类中的方法实现。

   > Java 8 接口引入 `default` 目的是：
   >
   > 以前，给接口增加一个新方法，所有实现类都得改代码补上实现，维护成本很高。有了 default 后，接口可以提供默认实现，老代码不用动就能兼容新方法。
   >
   > Java 9 接口引入 `private` 目的是：
   >
   > 私有方法主要是解决代码复用问题。如果多个 default 方法有重复逻辑，以前只能复制粘贴，现在可以抽到私有方法里统一调用。 

3. 构造函数和成员变量

   接口不能包含构造函数，接口中的成员变量默认为 `public static final`，也就是常量。抽象类可以包含构造函数，成员变量可以有不同的访问修饰符，如 `private`、`protected`、`public`，并且可以不是常量。

4. 多继承

   抽象类只能单继承，接口可以有多个实现。

**开发时的选择原则**：

- 如果只是定义一组行为规范，不涉及状态和实现细节，优先用接口。比如：Comparable、Serializable、Runnable 这些都是典型的接口使用场景。
- 如果有公共代码需要复用，比如模板方法模式里的骨架逻辑，用抽象类更合适。比如：AbstractList、AbstractMap 这些都是抽象类的经典应用。
- 如果一个类需要具备多种能力，只能用接口。因为 Java 不支持多继承，比如一个类既要能排序又要能序列化，只能同时实现 Comparable 和 Serializable 两个接口。

### 内部类

Java 内部类（Inner Class）就是定义在另一个类内部的类。它的主要作用是把“只服务于某个类”的类型封装在这个类内部，同时内部类还可以方便地访问外部类成员，包括私有成员。

```java
class Outer {
    private int x = 10;
    class Inner {
        void print() { System.out.println(x); }
    }
}
```

Java 内部类主要分为四种：**成员内部类、静态内部类、局部内部类**和**匿名内部类**。

**成员内部类**

成员内部类就是直接定义在外部类的成员位置，并且没有 `static` 修饰。

```java
class Outer {
    private int x = 10;

    class Inner {
        void print() {
            System.out.println(x);
        }
    }
}
```

可以直接访问外部类的成员，包括 `private` 成员，这里即使 `x` 是 `private`，`Inner` 仍然可以访问。这是因为成员内部类与外部类之间存在非常紧密的关联。

创建成员内部类对象时，必须先有外部类对象：

```java
Outer outer = new Outer();
Outer.Inner inner = outer.new Inner();
```

因为成员内部类对象实际上依赖一个外部类实例。可以理解成：成员内部类内部实际上持有一个指向外部类对象的引用。所以它可以直接访问：`x`，本质上类似于：`Outer.this.x`。例如：

```java
class Outer {
    int x = 10;
    
    class Inner {
        int x = 20;
    
        void test() {
            int x = 30;
            System.out.println(x);            // 30  x → 当前方法局部变量
            System.out.println(this.x);       // 20  this.x → 当前内部类对象
            System.out.println(Outer.this.x); // 10  Outer.this.x → 外部类对象
        }
    }
    
    public void createInner() {
        Inner inner = new Inner();
        inner.test();
    }
}
```

成员内部类还有一个重要特点：普通成员内部类中不能随意声明静态成员。因为它依赖外部类实例。

不过现代 Java 对这一限制有所放宽，因此面试时不要机械背“成员内部类绝对不能有 static 成员”；核心应理解为：非静态成员内部类本身依赖外部类实例，而静态嵌套类不依赖。

**静态内部类**

使用 `static` 修饰：

```java
class Outer {
    private static int x = 10;

    static class Inner {
        void test() {
            System.out.println(x);
        }
    }
    
    public static void createInner() {
        Inner inner = new Inner();
        inner.display();
    }
}
```

只能访问外部类的静态成员。它本质上就是顶级类，可以独立于外部类使用，主要用来表明类结构和命名空间。比如：HashMap 的 Node、Entry 就是典型的静态内部类。

静态内部类最大的区别是：不依赖外部类实例。

因此创建对象：

```java
Outer.Inner inner = new Outer.Inner();
```

不需要：

```java
Outer outer = new Outer();
```

对比一下：

```
成员内部类：
Outer outer = new Outer();
Outer.Inner inner = outer.new Inner();

静态内部类：
Outer.Inner inner = new Outer.Inner();
```

这是两者最核心的区别。静态内部类没有隐式的 `Outer.this` 引用。因此它不能直接访问外部类的普通实例成员：

```java
class Outer {
    private int x = 10;

    static class Inner {
        void test() {
            // System.out.println(x); // 错误
        }
    }
}
```

但是可以访问静态成员：

```java
class Outer {
    private static int x = 10;

    static class Inner {
        void test() {
            System.out.println(x);
        }
    }
}
```

所以：

```
成员内部类
→ 依赖外部类对象
→ 可以直接访问实例成员

静态内部类
→ 不依赖外部类对象
→ 不能直接访问外部类实例成员
```

实际开发中，如果内部类不需要访问外部类实例状态，一般更推荐使用静态内部类，因为不会额外持有外部类实例引用。这还能减少某些不必要的对象生命周期耦合。

**局部内部类**（实际开发中用的比较少）

局部内部类定义在方法内部：

```java
class Outer {

    void test() {
        class Inner {
            void print() {
                System.out.println("hello");
            }
        }

        Inner inner = new Inner();
        inner.print();
    }
}
```

它有点类似于局部变量：只在当前作用域内（这个方法内）有效。它可以访问外部类的成员，也能访问方法中的局部变量，但这个局部变量必须是 final 或者 effectively final 的。方法外部不能使用：`Inner inner;`。因为 `Inner` 只存在于 `test()` 的作用域中。

> effectively final 是 JDK 8 引入的。意思是如果一个局部变量在声明时没有加 `final` 关键字，但在初始化之后，**再也没有被重新赋值过**，那么编译器就会认为它是“事实上的 final”（effectively final）。

局部内部类可以访问外部类成员：

```java
class Outer {
    private int x = 10;

    void test() {
        class Inner {
            void print() {
                System.out.println(x);
            }
        }
    }
}
```

也可以访问方法中的局部变量，但这个变量必须是：`final` 或者 `effectively final`。例如：

```java
void test() {
    int x = 10;

    class Inner {
        void print() {
            System.out.println(x);
        }
    }
}
```

虽然 `int x = 10;` 没有显式写 `final`，但只要之后不修改 `x`，它就是 effectively final。这种情况可以使用。但如果：

```java
void test() {
    int x = 10;
    x = 20;

    class Inner {
        void print() {
            System.out.println(x); // 编译错误
        }
    }
}
```

就不行。

为什么局部变量必须 effectively final？

核心原因是：方法执行结束以后，局部变量原本应该随着栈帧销毁，但内部类对象可能仍然存活。例如：

```java
Runnable test() {
    int x = 10;

    return new Runnable() {
        @Override
        public void run() {
            System.out.println(x);
        }
    };
}
```

`test()` 执行结束以后，x 所在的栈帧已经销毁，但是返回的对象仍然可以继续使用。因此编译器实际上会把需要使用的变量值捕获到内部对象中。

为了避免方法中的 x 和内部对象保存的 x 发生语义不一致，所以 Java 要求这个变量不能继续修改。

**匿名内部类**

匿名内部类就是没有名字的内部类。在创建对象的时候直接定义，用得最多的场景就是实现接口或继承抽象类，比如各种回调、监听器。例如：

```java
interface Animal {
    void speak();
}
```

正常写法：

```java
class Dog implements Animal {
    @Override
    public void speak() {
        System.out.println("wang");
    }
}
```

然后 `Animal animal = new Dog();`，如果这个实现只使用一次，就可以写成匿名内部类：

```java
Animal animal = new Animal() {
    @Override
    public void speak() {
        System.out.println("wang");
    }
};
```

注意 `new Animal() { ... }` 不是在创建一个 `Animal` 接口对象。接口本身当然不能实例化。真正含义是：创建一个匿名类，这个匿名类实现 Animal，然后创建这个匿名类的对象。

可以理解成编译器帮你做了：

```java
class Xxx implements Animal {
    @Override
    public void speak() {
        System.out.println("wang");
    }
}
```

然后 `new Xxx();` 只不过这个类没有显式名字。匿名内部类也可以继承普通类：

```java
class Animal {
    void speak() {}
}
```

然后：

```java
Animal animal = new Animal() {
    @Override
    void speak() {
        System.out.println("Dog");
    }
};
```

匿名内部类非常适合：只使用一次的简单实现。

## Object

> `Object` 是 Java 所有类的根类，所有引用类型最终都直接或间接继承 Object。它定义了一些所有对象共有的基础能力，例如 `getClass()` 获取运行时类型，`equals()` 和 `hashCode()` 负责对象相等性和哈希语义，`toString()` 返回对象的字符串描述，`clone()` 用于对象复制，以及 `wait()`、`notify()`、`notifyAll()` 用于基于对象 Monitor 的线程通信。其中 Object 默认的 `equals()` 本质上使用 `==` 比较对象引用，如果业务上需要按内容判断相等，就需要重写 equals，并且必须同时保证相等对象拥有相同的 hashCode。

Object 类是 Java 中所有类的根类。除了基本类型，所有类都继承自它。

它定义的方法可以分成三大类：对象通用操作、线程操作、对象声明周期。

对象通用操作：

1. `getClass()` 获取对象运行时真正的类型。

2. `toString()` 输出对象的可读描述，方便日志记录和调试。

   Object 默认实现产生的字符串大致是 `类的全限定名@哈希值的十六进制表示`，例如：`com.demo.User@7a81197d`。一般都会重写该方法。

3. `equals()` Object 默认的 equals 比较两个引用是否指向同一个对象。因此一般都会重写这个类，以比较属性内容。

   关于重写 `equals()` 需要满足以下几个原则：

   - 自反性：

     ```java
     x.equals(x) == true
     ```

   - 对称性

     ```java
     x.equals(y)
     ```

     如果为 true，则 `y.equals(x)` 也必须为 true。

   - 传递性

     如果：

     ```java
     x.equals(y) == true
     y.equals(z) == true
     ```

     那么，`x.equals(z) == true`。

   - 一致性

     只要参与比较的数据没有变化，多次调用结果应该一致。

   - 非空性

     ```java
     x.equals(null)
     ```

     应该返回 false，而不是抛异常。

4. `hashCode()` 返回对象的哈希值。

   注意：如果两个对象的 equals 相同，那么哈希值一定相同；如果两个对象的哈希值相同，equals 不一定相同。前提是：重写 `equals()` 时，也同时重写了 `hashCode()`。

   > `hashCode()` 重写指的就是根据类的成员变量来计算 hash 值。

5. `clone()` 创建当前对象的一个副本。对于该方法 Object 默认的拷贝方式是浅拷贝。

   > 浅拷贝与深拷贝？
   >
   > 浅拷贝就是引用还是指向同一个；深拷贝就是引用指向各自的。

线程操作：

1. `wait()` 用于线程间通信。分为：
   - `wait()`
   - `wait(long timeout)`
   - `wait(long timeout, int nanos)`
2. `notify()` 唤醒正在这个对象 Monitor 上等待的一个线程。
3. `notifyAll()` 唤醒所有正在这个对象 Monitor 上等待的线程。

关于 `wait()` 和 `notify()` 使用：

这两者必须在持有对象监视器锁的情况下调用，也就是在 synchronized 块里。

```java
// 生产者消费者示例
class Buffer {
    private final Queue<Integer> queue = new LinkedList<>();
    private final int capacity = 10;
    
    public synchronized void produce(int item) throws InterruptedException {
        while (queue.size() == capacity) {
            wait();  // 队列满了，等待消费者消费
        }
        queue.offer(item);
        notifyAll();  // 通知消费者可以消费了
    }
    
    public synchronized int consume() throws InterruptedException {
        while (queue.isEmpty()) {
            wait();  // 队列空了，等待生产者生产
        }
        int item = queue.poll();
        notifyAll();  // 通知生产者可以生产了
        return item;
    }
}
```

对象生命周期：

- `finalize()`

  Object 曾经定义：

  ```java
  protected void finalize() throws Throwable
  ```

  过去设计为：对象被 GC 回收之前，给对象一个执行清理逻辑的机会。但这个机制存在很多问题：

  ```
  执行时间不可预测
  性能差
  可能导致对象复活
  资源释放不可靠
  增加 GC 复杂度
  ```

  因此 `finalize()` 已经被废弃，并且不应该再用于资源释放。

## 泛型（Generics）

Java 泛型是一种参数化类型机制，允许把类型作为参数传递给类、接口和方法。

泛型主要用于在编译期提供类型安全检查，编译器能在写代码的时候就发现类型不匹配，不用得到程序运行时才发现，从而抛 ClassCastException。同时减少手动强制类型转换，例如 `List<String>` 可以保证集合中只能按照 String 类型使用元素。

下述是一个没有泛型的示例：

```java
class Box {
    private Object value;
    public void set(Object value) {
        this.value = value;
    }
    public Object get() {
        return value;
    }
}
```

使用：

```java
Box box = new Box();
box.set("hello");
String value = (String) box.get();
```

因为 `get()` 返回 `Object`，所以需要手动强转类型。而且 `box.set(100);` 时，编译器也不会阻止报错。

总之，泛型带来了：

1. 类型安全：编译器检查类型匹配
2. 消除强转：取出元素时编译器自动插入类型转换代码，不用手动 cast
3. 代码复用：一个泛型类可以处理多种类型，不用为每种类型写一份代码

**Java 的泛型是伪泛型**

### 泛型使用

泛型的使用包括：泛型类、泛型方法、泛型接口。

**泛型类**

定义：

```java
class Box<T> {

    private T value;

    public void set(T value) { this.value = value; }

    public T get() { return value; }
}
```

使用：

```java
Box<String> stringBox = new Box<>();
stringBox.set("hello");

Box<Integer> integerBox = new Box<>();
integerBox.set(100);
```

常见命名约定：

```
T → Type
E → Element
K → Key
V → Value
N → Number
R → Result
```

**泛型方法**

方法自己声明类型参数，而不是依赖类上的泛型参数。例如：

```java
public <T> T getFirst(T[] array) {
    return array[0];
}
```

注意 `<T>` 必须写在返回类型前面。结构是：

```java
public <T> T getFirst(T[] array)
        ↑  ↑
    声明T  返回类型
```

调用：

```java
String[] names = {"Tom", "Jack"};
String name = getFirst(names);
```

编译器可以自动推断 `T = String`，也可以：

```java
Integer[] nums = {1, 2, 3};
Integer num = getFirst(nums);
```

**泛型接口**

例如：

```java
interface Repository<T> {
    void save(T data);
    T findById(Long id);
}
```

实现时可以指定具体类型：

```java
class UserRepository implements Repository<User> {
    @Override
    public void save(User data) { ... }
    @Override
    public User findById(Long id) { return null; }
}
```

也可以让实现类继续保持泛型：

```java
class RepositoryImpl<T> implements Repository<T> {
    @Override
    public void save(T data) { ... }
    @Override
    public T findById(Long id) { return null; }
}
```

### 泛型上下界限定符

用来限制泛型参数的类型范围。

首先看一个示例，`List<Integer>` 为什么不是 `List<Number>` 的子类？

这是泛型中非常重要的一点。我们知道 `Integer extends Number`，所以 `Number n = Integer.valueOf(10);` 完全没问题。但下面不成立：

```java
List<Integer> integers = new ArrayList<>();

List<Number> numbers = integers; // 编译错误
```

也就是说：`Integer` 是 `Number` 的子类，但是 `List<Integer>` 不是 `List<Number>` 的子类。

为什么？

假设 Java 允许：

```java
List<Number> numbers = integers;
```

那么因为 `numbers` 是 `List<Number>`，你就可以：

```java
numbers.add(new Double(3.14)); // 因为 numbers 的类型是 List<Number>，编译器认为往里面塞 Double 是完全合法的

// 你明明创建的是一个 integers，现在里面却混进了一个 Double！
// 当你用 integers 取出元素时，编译器以为它是 Integer，直接强转：
Integer i = integers.get(0); // 运行时直接抛出 ClassCastException！
```

也就是说 `3.14` 是 `Double`，也是 `Number`。但原来的 `integers` 实际上是 `List<Integer>`，于是里面出现了一个 `Double`。类型系统就被破坏了。所以为了避免这种隐患，Java 泛型默认是不变（Invariant）。

> 那么你可能会问，为什么数组可以，但泛型却不可以？（历史包袱）
>
> 例如，`Integer[]` 为什么可以是 `Number[]` 的子类？
>
> ```java
> Integer[] intArray = new Integer[10];
> Number[] numArray = intArray; // 这在 Java 中是合法的！
> ```
>
> 这是因为 Java 的**数组是协变的（Covariant）**。但这其实是 Java 早期设计的一个**历史遗留缺陷**。如果你接着往 `numArray` 里塞一个 `Double`，同样会在运行时抛出 `ArrayStoreException`。
>
> Java 的设计者在引入泛型时吸取了数组的教训，决定**不再重蹈覆辙**，因此将泛型设计为“不可变的”，宁可牺牲一点灵活性，也要在编译期就保证绝对的类型安全。

这也是为什么要引入通配符。就能够解决上述“既能装 Integer，又能装 Number”的容器需求。

`?` 叫通配符，表示某种未知类型。例如：

```java
List<?> list;
```

它可以接收：

```java
List<String>
List<Integer>
List<User>
```

但是 `list.add("hello");` 不允许。因为编译器只知道这是某种 List，但不知道具体是 `List<String>` 还是 `List<Integer>`，所以无法保证放进去的类型正确。

`? extends T` 叫上界限定符，表示类型必须是 T 或 T 的子类，主要用于读取场景。因为你知道拿出来的东西至少是个 T，所以读取安全；但你不知道具体是哪个子类，所以没法往里塞东西。

`? super T` 叫下界限定符，表示类型必须是 T 或 T 的父类，主要用于写入场景。因为容器中装的是 T 的父类，你往里塞 T 肯定没问题；但读出来的时候只能当 Object 用，因为不确定具体类型。

```java
// 上界：只读不写
public void process(List<? extends Number> list) {
    Number num = list.get(0);  // 读取安全，返回 Number 或其子类
    // list.add(1);            // 编译错误，不能往里加东西
}

// 下界：只写不读
public void addToList(List<? super Integer> list) {
    list.add(1);               // 写入安全，Integer 肯定能放进去
    // Integer v = list.get(0); // 编译错误，读出来只能当 Object
}
```

**泛型参数还可以多重约束**

泛型参数还可以同时受到多个约束：

```java
<T extends Number & Comparable<T>>
```

表示 T 必须是 `Number` 的子类，以及 T 同时实现 `Comparable<T>`。例如：

```java
public <T extends Number & Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) > 0 ? a : b;
}
```

需要注意：如果同时有类和接口，类必须写在最前面。例如：

```java
<T extends Number & Comparable<T> & Serializable>
```

**PECS 原则**

PECS 是 “Producer Extends，Consumer Super” 的缩写，意思是，如果一个容器是数据生产者，你主要从里面读取，那么用 `? extends T`；如果一个容器是数据消费者，你主要向里面写数据，那么用 `? super T`。例如：

```java
public static <T> void copy(
        List<? super T> dest,
        List<? extends T> src
) { ... }
```

这里：

```
src
→ 提供数据
→ Producer
→ extends

dest
→ 接收数据
→ Consumer
→ super
```

这正是 JDK `Collections.copy()` 一类 API 的典型设计思想。

**协变和逆变**

上界限定符实现的是协变，下界限定符实现的是逆变。

**协变**就是子类型可以替换父类型。`List<Dog>` 可以赋值给 `List<? extends Animal>`，因为 Dog 是 Animal 的子类，类型方向是一致的。

```java
List<? extends Animal> animals = new ArrayList<Dog>();

List<Animal> animals = new ArrayList<Dog>(); // 编译错误
```

**逆变**正好反过来，父类型可以替换子类型。`List<Animal>` 可以赋值给 `List<? super Dog>`，因为 Animal 是 Dog 的父类，类型方向是相反的。

```java
List<? super Dog> dogs = new ArrayList<Animal>(); 
```

`? super Dog` 表示  `dogs` 可以接收 `Dog` 类及其父类。

### 类型擦除

泛型擦除就是 Java 编译器在编译阶段把所有泛型信息都抹掉的过程。你代码里写的 `List<String>`、`Map<Integer, User>` 这些泛型编译成 class 文件后全变成 `List`、`Map`，泛型参数被替换成它的上界，没写上界就默认是 `Object`。例如：

```java
class Box<T> {
    private T value;
    public T get() {
        return value;
    }
}
```

经过编译后，泛型信息会被擦除。如果 `T` 没有限定，大致会被擦成：

```java
class Box {
    private Object value;
    public Object get() {
        return value;
    }
}
```

如果 `<T extends Number>`，那么会擦除为它的上界 `Number`。例如：

```java
// 擦除前
class Box<T extends Number> {
    T value;
}

// 擦除后
class Box {
    Number value;
}
```

所以 Java 泛型主要是在编译阶段提供类型安全检查。到了 JVM 运行时，很多泛型类型信息已经被擦除了。

**类型擦除带来的限制**

1. 不能 `new T()`

   因为运行时，`T` 已经被擦除了，JVM 根本不知道该创建什么类型。（如果确实需要，可以传入 `Class<T>`、构造器或工厂）

2. 不能创建泛型数组

   同上。

3. 不能直接用基本类型作为泛型参数

   以 `ArrayList<T>` 为例，如果你传入 `ArrayList<int>`，类型擦除后，发现 `int` 并不属于 `Object` 的子类，所以编译报错。

4. 不能使用 `instanceof` 判断具体泛型类型

   以 `if (obj instanceof List<String>) {...}` 为例，运行时只有 `List`，没有 `List<String>`，所以这个检查没法做。

5. 泛型类型的静态成员共享

   ```java
   public class Box<T> {
       public static int count = 0;
   }
   ```

   不管泛型参数是啥，编译后都是同一个 Box 类，静态成员自然是共享的。

**为什么说 Java 是伪泛型？**

因为：

```java
List<String>
List<Integer>
```

在 Java 源代码阶段看起来是两种不同类型。但运行时：

```java
List<String> a = new ArrayList<>();
List<Integer> b = new ArrayList<>();
System.out.println(a.getClass() == b.getClass());
```

结果：`true`，它们运行时都是：`ArrayList`。JVM 并没有生成：

```java
ArrayList<String>
ArrayList<Integer>
```

两个不同的类。

因此经常说 Java 泛型是通过编译器 + 类型擦除实现的伪泛型。这里的“伪”不是说它没用，而是说泛型参数不是像某些语言那样完整保留成不同的运行时类型实例。

那么之所以这样在运行时要擦除类型信息，原因是 Java 5 引入泛型的时候，线上已经跑着无数 Java 1.5 及更早版本的应用了。如果泛型在运行时也保留类型信息，意味着 JVM 要大改，老代码全得重新编译，这推广成本太高了。所以 Java 团队选了个折中方案：编译期做类型检查和约束，检查完就把泛型信息擦掉。这样生成的字节码和以前的格式一样，老 JVM 能跑，老代码也不用改。代价就是 Java 的泛型是伪泛型，运行时类型信息就丢了。

**类型擦除与桥接方法？**

这是泛型比较深入的一个点。假设：

```java
class Parent<T> {
    public T get() {
        return null;
    }
}
```

子类：

```java
class Child extends Parent<String> {
    @Override
    public String get() {
        return "hello";
    }
}
```

类型擦除以后，父类实际上类似：

```java
class Parent {
    public Object get() {
        return null;
    }
}
```

而子类：

```java
public String get()
```

看起来方法签名已经不一样了。为了维持多态，编译器会生成一个桥接方法，大致：

```java
public Object get() {
    return get();
}
```

真正调用 String 版本。这个方法叫：Bridge Method，桥接方法。它是 Java 泛型类型擦除和多态能够兼容的重要机制。

**类型擦除后为什么反射还能拿到泛型类型？？？**

## 异常

> Java 的异常体系以 `Throwable` 为根类，下面主要分为 `Error` 和 `Exception`。Error 通常表示 JVM 或运行环境的严重错误，例如 OOM 和 StackOverflow，一般不作为普通业务异常处理；Exception 表示程序运行过程中可以处理的异常，又分为 Checked Exception 和 RuntimeException。Checked Exception 会在编译阶段被检查，必须通过 catch 或 throws 处理，而 RuntimeException 属于非受检异常，编译器不会强制处理。Java 通过 try-catch-finally、throw 和 throws 完成异常捕获、抛出和传播。在实际项目中通常还会定义继承 RuntimeException 的业务异常，并配合全局异常处理器统一处理。

Java 的异常（Exception）机制是 Java 语言中用于**处理程序运行时出现的非正常错误**的核心机制。它的核心思想是：**将错误处理代码与正常业务代码分离**，从而提高代码的健壮性和可读性。

Java 异常体系的整体结构如下：

```
Throwable
├── Error
│
└── Exception
    ├── RuntimeException
    │   ├── NullPointerException
    │   ├── ArithmeticException
    │   ├── ClassCastException
    │   ├── IndexOutOfBoundsException
    │   └── IllegalArgumentException
    │
    └── 其他 Exception
        ├── IOException
        ├── SQLException
        └── ClassNotFoundException
```

Exception 和 Error 都是 Throwable 类的直接子类，只有继承了 Throwable 的对象才能被 throw 和 catch。

Exception 代表程序运行过程中可以预料、可以恢复的异常情况，属于业务逻辑范畴，应该也能够被合理处理，比如：IOException、NullPointerException 等。Exception 又分为 Checked Exception 和 Unchecked Exception：

- Checked Exception（受检异常）：指的编译器强制要求你处理的异常。继承自 Exception 但不继承 RuntimeException，编译时必须显式处理，要么 try-catch 要么 throws 声明抛出，比如 IOException、SQLException。常见原因：外部资源、IO、数据库等。

  ```java
  // 比如这个就可能抛 FileNotFoundException
  FileInputStream input = new FileInputStream("test.txt");
  
  // 所以处理方式就是两种：
  // 第一种：捕获
  try {
      FileInputStream input = new FileInputStream("test.txt");
  } catch (FileNotFoundException e) {
      e.printStackTrace();
  }
  // 第二种：继续向上抛
  public void test() throws FileNotFoundException {
      FileInputStream input = new FileInputStream("test.txt");
  }
  ```

- Unchecked Exception（非受检异常）：指的是 RuntimeException 及其子类。编译器不强制要求捕获，代码可以正常编译，但运行时可能会抛出，比如：NullPointerException、IndexOutOfBoundsException。常见原因：编程逻辑、非法参数等。

  ```java
  // 比如这个可以正常编译，但运行时会抛出 NullPointerException
  String s = null;
  System.out.println(s.length());
  ```

Error 代表 JVM 本身或系统环境的严重错误，程序通常无法恢复，出现后往往意味着进程需要终止或重启，比如：OutOfMemoryError、StackOverflowError 等。

### try-catch

最基本的异常处理方式：

```java
try {
    // 可能出现异常的代码
} catch (Exception e) {
    // 异常处理
}
```

多个 catch 的情况：

可以针对不同的异常做不同的处理。

```java
try {
    // 代码
} catch (NullPointerException e) {
    // 空指针处理
} catch (IOException e) {
    // IO 异常处理
} catch (Exception e) {
    // 其他异常
}
```

注意：这里需要遵守一个原则就是子类异常必须写在父类异常前面。这一点很好理解，如果父类异常写在前面，那么所有异常都被父类异常给捕获了，针对不同的异常做不同的处理的目的就达不到了。

### finally

无论是否发生异常，都需要执行的逻辑。

> 那么 finally 一定会执行吗？
>
> `finally` 会执行，但不是绝对“一定”。例如：
>
> ```java
> try {
>     return;
> } finally {
>     System.out.println("finally");
> }
> ```
>
> 即使 try 中 `return`，finally 还是会执行。但有一些情况可能不执行，比如：`System.exit(0);` 直接终止 JVM
>
> ```java
> try {
>     System.exit(0);
> } finally {
>     System.out.println("不会执行");
> }
> ```
>
> 或者 JVM 被强制终止、机器掉电等。
>
> 因此，正常 JVM 执行流程中 finally 基本都会执行，即使 try/catch 中发生 return，但 JVM 被直接终止等情况下 finally 可能无法执行。

例如：

```java
try {
    // 使用资源
} catch (Exception e) {
    // 异常处理
} finally {
    // 释放资源
}
```

常见用途：关闭文件、关闭网络连接、释放锁、清理资源。例如：

```java
FileInputStream input = null;
try {
    input = new FileInputStream("a.txt");
} catch (IOException e) {
    e.printStackTrace();
} finally {
    if (input != null) {
        try {
            input.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
```

不过现在 Java 7 以后对资源管理通常更推荐 try-with-resources。

```java
try (
    FileInputStream input = new FileInputStream("test.txt")
) {
    // 使用 input
} catch (IOException e) {
    e.printStackTrace();
}
```

执行完后，input 自动 close()。不需要手动在 finally 中关闭资源。

对文件流、数据库连接等资源，优先使用 try-with-resources。

**finally 中的其他注意事项**

- finally 中不要 return。例如：

  ```java
  public int test() {
      try {
          return 1;
      } finally {
          return 2;
      }
  }
  ```

  最终返回 2，因为 finally 中的 `return` 会覆盖 try 中的 `return`。如果 try 中通过 throw 抛出异常，也有可能被 finally 中的 return 覆盖。

### throw

主动抛出一个异常对象。例如：

```java
if (age < 0) {
    throw new IllegalArgumentException("年龄不能小于 0");
}
```

注意：throw 后面跟的是异常对象，且一次只能抛出一个对象。

### throws

当前方法不处理这个异常，把异常继续交给调用者。例如：

```java
public void readFile() throws IOException {
    FileInputStream input =
            new FileInputStream("test.txt");
}
```

调用者：

```java
public void test() {
    try {
        readFile();
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

注意：throws 后面跟的是异常类型，可以声明多个类型抛出。

### 异常传播机制

假设：

```java
public void A() { B(); }
public void B() { C(); }
public void C() { int x = 10 / 0; }
```

调用链是：`A() → B() → C() → ArithmeticException`。

如果发生异常，C 不处理，则向 B 传播；B 不处理，则向 A 传播；A 不处理，则向 JVM 传播。最终线程终止并打印异常堆栈。

所以异常传播机制是：从当前方法沿调用栈不断向调用方查找匹配的异常处理器。

**异常堆栈**

出现异常时我们经常看到：

```
Exception in thread "main"
java.lang.NullPointerException
    at com.demo.UserService.save(UserService.java:20)
    at com.demo.Controller.test(Controller.java:15)
    at com.demo.Main.main(Main.java:10)
```

这就是异常堆栈。它记录异常发生时的方法调用链。例如：

```
Main.main()
↓
Controller.test()
↓
UserService.save()
↓
NPE
```

排查问题时通常从异常类型和最靠近业务代码的栈帧开始看。

### 异常使用注意事项

1. 异常捕获不要太宽泛

   软件工程是一门协作的艺术，代码要让别人一眼看出你想捕获什么。如果什么异常都用 Exception 接着，别的开发同事根本看不出这段代码实际想捕获啥，而且还会把本该往上抛的异常给吞了。

2. 异常要尽早处理

   越早处理，堆栈信息越少，否则只会增加排查难度。

3. 别把异常吞了

   捕获了异常既不抛出也不写日志，线上出了 bug 就会莫名其妙找不到任何出错信息。对于喜欢 catch 后用 e.printStackTrace()，这个方法输出的是标准错误流，在分布式系统中根本找不到 stacktrace。最好的做法是输出到日志系统里，方便排查。

4. try-catch 范围能小则小

   只在必要的代码段使用 try-catch。因为 try-catch 本身的性能开销几乎可以忽略，但是被包裹的代码可能会影响 JVM 对代码的优化，比如指令重排序。

5. 别用异常来控制程序流程

   能用 if/else 判断的就别用异常。异常比条件语句低效得多，条件语句由 CPU 分支预测优化，而且每个实例化一个 Exception 都会对栈进行快照，这是个比较重的操作，数量多了开销就大了。

6. 别在 finally 中处理返回值或直接 return

   可能会覆盖 try 中的 return 或者屏蔽异常。

### 自定义异常

实际业务中经常自定义异常类。自定义异常类通常可以继承 Exception 或 RuntimeException。如果继承 Exception，那么自定义异常类就属于 Checked Exception，调用方编译时必须处理。如果继承 RuntimeException，那么自定义异常就属于 Unchecked Exception，不必强制编译时处理。

例如：

```java
// 定义自定义异常
public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}

// 使用
if (user == null) {
    throw new BusinessException("用户不存在");
}
```

可以继续增加错误码：

```java
public class BusinessException extends RuntimeException {
    private final Integer code;
    
    public BusinessException(Integer code, String message) {
        super(message);
        this.code = code;
    }
    
    public Integer getCode() { return code; }
}

// 使用
throw new BusinessException(10001, "用户不存在");
```

在 Spring 项目中，再通过 `@RestControllerAdvice` 统一处理：

```java
@ExceptionHandler(BusinessException.class)
public Result<?> handle(BusinessException e) {
    return Result.fail(e.getCode(), e.getMessage());
}
```

整个流程：Service 层捕获异常，然后 throw BusinessException。Controll 层的全局异常处理器捕获 BusinessException 异常，处理后转换为统一响应，返回给前端。

这就是企业项目中异常非常典型的使用方式。

## 反射

> Java 反射是一种运行时动态获取和操作类信息的机制。JVM 加载类以后会产生对应的 `Class` 对象，通过这个对象可以在运行期间获取类的构造方法、字段、方法和注解等信息，并通过 `Constructor` 创建对象、通过 `Field` 读写属性、通过 `Method.invoke()` 动态调用方法。反射最大的价值是降低代码对具体类型的硬编码依赖，因此 Spring IOC、AOP、MyBatis、动态代理等框架都大量使用反射。不过反射也存在额外性能开销、降低编译期类型安全、可能破坏封装以及代码可读性下降等问题。

Java 反射（Reflection）能够在程序运行期间，动态获取一个类的信息，并且动态地创建对象、访问字段、调用方法。

正常情况下，我们写 Java 代码时，在编译阶段就已经知道要操作什么类、调用什么方法：

```java
UserService userService = new UserService();
userService.save();
```

这里编译器很清楚知道类是 `UserService`，方法是 `save()`。而反射允许我们在运行时才知道这些信息。例如：

```java
String className = "com.demo.UserService";
```

程序运行到这里后，再根据字符串找到 `UserService` 类，然后：

```
获取 Class 对象
↓
创建 UserService 对象
↓
找到 save 方法
↓
调用 save()
```

这就是反射最核心的能力。

### 为什么需要反射

先考虑一个问题。假设我们写一个框架，需要创建用户指定的类。用户在配置文件中写：

```
service=com.demo.UserService
```

框架代码编写的时候根本不知道未来用户到底会配置哪个类，所以不可能提前写：

```java
new UserService();
```

这时候就可以通过反射来创建对象：

```java
String className = 配置文件读取;
Class<?> clazz = Class.forName(className);
Object object = clazz.getDeclaredConstructor().newInstance();
```

于是类名可以由配置决定，而不是在代码里写死。这就是反射最大的设计价值：降低程序对具体类型的硬编码依赖，让程序具备运行时动态性。

Spring、MyBatis、JUnit 等框架大量使用反射，本质上都与这个特点有关。

### Class 对象

Class 对象是反射的核心，理解反射，首先必须理解：

```java
java.lang.Class
```

JVM 加载一个类以后，会在运行时维护这个类的类型信息，并且可以通过一个 `Class` 对象访问这些信息。例如：

```java
class User {
    private String name;
    public void sayHello() {
        System.out.println("hello");
    }
}
```

类加载之后，可以理解成 JVM 中存在：

```
User.class
   ↓
Class<User> 对象
   │
   ├── 类名
   ├── 父类
   ├── 接口
   ├── 字段信息
   ├── 方法信息
   ├── 构造方法
   └── 注解信息
```

所以反射的入口基本都是先获得 `Class` 对象。

**获取 Class 对象的方式**

主要有三种常见方式：

```java
// 类名.class：编译阶段已经知道 User 类
Class<?> clazz = User.class;  

// 对象实例.getClass()：已经有对象，想知道它的实际运行时类型。
User user = new User();
Class<?> clazz = user.getClass();

// 通过 Class.forName() 全限定类名，这是反射中特别重要的方式
Class<?> clazz = Class.forName("com.demo.User");
// 这种意味着类名可以来自：配置文件、数据库、网络、注解等，因此框架可以在运行时动态确定类型
```

### 反射可以做什么

反射主要可以完成：

```
1. 获取类的信息
2. 创建对象
3. 获取并操作字段
4. 获取并调用方法
5. 获取构造方法
6. 获取注解
```

对应的核心 API：

```
Class
Constructor
Field
Method
Annotation
```

1. 获取类的基本信息

   例如：

   ```java
   Class<?> clazz = User.class;
   ```

   获取类名 `clazz.getName();` 得到 `com.demo.User`。

   获取简单类名 `clazz.getSimpleName();` 得到 `User`。

   获取父类：

   ```java
   Class<?> superclass = clazz.getSuperclass();
   ```

   获取实现的接口：

   ```java
   Class<?>[] interfaces = clazz.getInterfaces();
   ```

   还可以判断：

   ```java
   clazz.isInterface();
   clazz.isEnum();
   clazz.isAnnotation();
   clazz.isArray();
   ```

   所以通过 `Class`，基本可以知道一个类型的完整结构。

2. 通过反射创建对象

   以前常见写法：

   ```java
   Object obj = clazz.newInstance();
   ```

   这个 API 已经不推荐使用。现在通常：

   ```java
   User user = User.class.getDeclaredConstructor().newInstance();
   ```

   完整过程：

   ```java
   Class<User> clazz = User.class;
   Constructor<User> constructor = clazz.getDeclaredConstructor();
   User user = constructor.newInstance();
   ```

   如果构造方法有参数：

   ```
   class User {
       private String name;
       public User(String name) {
           this.name = name;
       }
   }
   ```

   可以：

   ```java
   Constructor<User> constructor = User.class.getDeclaredConstructor(String.class);
   User user = constructor.newInstance("Tom");
   ```

   可以看到：

   ```
   正常创建：new User("Tom")
   反射创建：先获取 Class，然后获取 Constructor，最后再 newInstance()
   ```

3. 通过反射获取、修改字段

   假设：

   ```java
   class User {
       public int age;
       private String name;
   }
   ```

   获取字段：

   ```java
   Field field = User.class.getDeclaredField("name");
   ```

   注意：`getField()` 与 `getDeclaredField()` 有区别。

   - `getField()`：主要获取 public 字段，包括继承来的 public 字段。

   - `getDeclaredField()`：获取当前类声明的字段，不限制 private/protected/public，但不负责把父类声明字段一起返回。

   类似的 `getFields()` 与 `getDeclaredFields()` 也是这个区别。

   修改字段：

   ```java
   Field field = User.class.getDeclaredField("name");
   field.setAccessible(true); // 表示关闭 Java 语言层面的访问检查
   field.set(user, "Tom");
   ```

   > 不过现代 Java 模块系统下，对某些 JDK 或未开放模块的深度反射会受到更严格限制，所以不能简单理解成“任何 private 都绝对能强行访问”。

4. 通过反射获取、调用方法

   假设：

   ```java
   class UserService {
       public void save() {
           System.out.println("save");
       }
       private String getName(String prefix) {
           return prefix + "Tom";
       }
   }
   ```

   获取方法：

   ```java
   Method method = UserService.class.getDeclaredMethod("getName", String.class);
   ```

   这里不仅要传方法名，还需要传参数类型列表。因为 Java 支持方法重载。例如：

   ```
   test(int x)
   test(String x)
   ```

   只告诉反射 `test` 是不够的。必须说明你要哪个方法：

   ```java
   getDeclaredMethod("test", int.class);
   // 或者
   getDeclaredMethod("test", String.class);
   ```

   调用方法：

   ```java
   UserService service = new UserService();
   Method method = UserService.class.getDeclaredMethod("getName", String.class);
   method.setAccessible(true);
   Object result = method.invoke(service, "User:");
   System.out.println(result);
   ```

5. 反射获取注解

   这也是 Spring 特别重要的应用。例如我们定义：

   ```java
   @Retention(RetentionPolicy.RUNTIME)
   @Target(ElementType.TYPE)
   public @interface Component { ... }
   ```

   然后：

   ```java
   @Component
   public class UserService { ... }
   ```

   运行时：

   ```java
   Class<UserService> clazz = UserService.class;
   Component annotation = clazz.getAnnotation(Component.class);
   ```

   就可以判断：

   ```
   if (annotation != null) {
       System.out.println("这是一个 Component");
   }
   ```

   所以框架可以：扫描 Class，发现 `@Component`，创建对象，放进 IOC 容器。这就是 Spring IOC 的一个核心基础。

### 反射在框架中的应用

**Spring 中为什么需要反射？**

Spring 里面大量机制都离不开反射。例如：

```java
@Component
public class UserService { ... }
```

Spring 需要知道这个类有没有 `@Component`？通过反射读取注解。然后：

```java
@Autowired
private UserRepository repository;
```

Spring 需要找到 `repository 字段`，即使它是 `private` 也需要完成依赖注入。于是可以通过：先获取 Class 对象，然后获取 `UserService` 的 `repository` 字段，最后反射赋值。

类似 `field.set(bean, dependency);`，再比如：

```java
@Transactional
public void save() { ... }
```

Spring AOP 需要获取方法及注解信息：`method + @Transactional`，然后决定是否创建代理。因此你可以把 Spring 和反射之间的关系理解成：

```
Spring
│
├── IOC
│   ├── 扫描类
│   ├── 创建 Bean
│   └── 属性注入
│
├── AOP
│   └── 获取方法信息
│
├── @Autowired
│   └── Field 反射
│
├── @Component
│   └── Annotation 反射
│
└── @Transactional
    └── Method + Annotation
```

**MyBatis 中反射的使用**

比如：

```java
User user = mapper.selectById(1);
```

数据库返回：

```
id = 1
name = Tom
age = 20
```

MyBatis 最终要把这些数据填到：

```java
class User {
    private Long id;
    private String name;
    private Integer age;
}
```

里面。它需要找到 User 类，创建 User 对象，找到字段或 Setter，然后设置值。本质上也大量依赖反射。

### 反射的优缺点

**优点**：

- 灵活性高。可以在运行时决定加载哪个类，调用哪个方法，创建哪个对象；
- 降低耦合。框架不用写死，框架只需要如何加载，如何实例化，如何调用的机制。而具体使用哪个类由用户决定。

**缺点**：

- 性能开销大

  直接调用方法，JVM 编译或就是几条固定的机器指令，地址都定死在那儿。而反射调用需要：

  1）每次调用都要做安全检查，验证调用者有没有权限访问目标成员；

  2）参数要装箱拆箱，invoke 方法签名是 Object 类型，基本类型得包一层；

  3）JIT 编译器很难对反射调用做内联优化，因为目标方法运行时才确定；

  不过现代 JVM 对反射有很多优化，所以不能简单说反射一定慢几十倍。

- 破坏封装性。比如 `private` 反射可以获取；

- 编译器安全性下降。正常来说在编译期间，如果方法不对就报错。而反射只有在运行期间才会发现错误；

- 可读性和维护性下降。反射代码通常比较晦涩，且编译器无法在编译期进行类型检查。

## 注解

Java 中的注解原理

\- 元注解   - 注解 + 反射   - Spring 为什么大量使用注解



## 序列化

\- Serializable   - transient   - serialVersionUID

序列化就是将 Java 对象转换为二进制字节流的过程。

反序列化就是将二进制字节流转换为 Java 对象的过程。

## Java 8 新特性

\- Lambda   - Stream   - Optional   - 函数式接口

1. 元空间替代了永久代，永久代回收效率太低，加上 HotSpot 要和 JRockit 合并，JRockit 压根就没有永久代，所以干脆去掉了。
2. Lambda 表达式，用 `(参数) -> 表达式` 语法实现代码块传递，告别匿名内部类的冗长写法。
3. 函数式接口，只有一个抽象方法的接口，比如：`Predicate`、`Function`、`Consumer` 是 Lambda 的载体。
4. 新的日期事件 API，`LocalDate`、`LocalDateTime` 这些不可变类，替代了线程不安全的 Date 和 Calendar。
5. 接口默认方法和静态方法，允许接口用 `default` 关键字定义方法实现，解决接口扩展时的兼容问题。
6. Stream 流式接口，声明式处理集合数据，链式调用实现过滤、映射、排序，还支持 `parallelStream` 并行处理。
7. Optional 类，封装可能为 null 的值，提供 `orElse`、`ifPresent` 等方法优雅处理 null 值，减少 NPE。
8. 新增了 `CompletableFuture`、`StampedLock` 等并发实现类。

## 代理

用一个示例说明代理，假设有一个接口：

```java
public interface UserService {
    void save();
}
```

真实实现：

```java
public class UserServiceImpl implements UserService {
    @Override
    public void save() {
        System.out.println("保存用户");
    }
}
```

如果直接调用：

```java
UserService service = new UserServiceImpl();
service.save();
```

流程就是：调用者实例化 `UserServiceImpl`，然后调用 `save()` 方法。现在需求变了：调用 `save()` 之前打印日志，调用完成后统计耗时。

最直接的方法当然是修改：

```java
public void save() {
    System.out.println("开始记录日志");

    // 业务逻辑
    System.out.println("保存用户");

    System.out.println("结束记录日志");
}
```

但这样就把业务逻辑和日志逻辑耦合在一起了。更好的方案是加一个代理：调用者发起请求，请求先到代理对象，代理对象执行前置日志操作，然后调用真实对象的方法，真实对象返回结果后，代理对象再执行后置日志操作，最后把结果返回给调用方。

代理对象负责额外逻辑，真正业务还是交给 `UserServiceImpl`。这就是代理模式。

Java 中代理主要有两种：**静态代理**和**动态代理**。

静态代理需要自己手写一个代理类；动态代理是 JVM 在运行时帮你生成代理类的字节码。

### 静态代理

静态代理是在写代码的时候就把代理类写好。例如：

```java
public class UserServiceProxy implements UserService {
    private final UserService target;

    public UserServiceProxy(UserService target) {
        this.target = target;
    }
    @Override
    public void save() {
        System.out.println("方法开始");
        target.save();
        System.out.println("方法结束");
    }
}
```

使用：

```java
UserService target = new UserServiceImpl();
UserService proxy = new UserServiceProxy(target);
proxy.save();
```

这叫静态代理。问题是，如果有：

```
UserService
OrderService
ProductService
PayService
...
```

就可能需要：

```
UserServiceProxy
OrderServiceProxy
ProductServiceProxy
PayServiceProxy
...
```

大量代理类，维护成本很高。所以产生了动态代理。动态代理最大的特点就是：代理类不需要开发者提前手写，而是在程序运行过程中动态生成。

### 动态代理

动态代理主要有两种需要掌握：**JDK 动态代理**和 **CGLIB 动态代理**。

Java 的动态代理（Dynamic Proxy）本质上是：在程序运行期间，动态生成一个代理对象，由代理对象代替目标对象接收方法调用，并在调用目标方法前后插入额外逻辑。

它最常见的用途就是：

- 日志
- 权限校验
- 性能统计
- RPC
- Spring 中的事务和 AOP

**JDK 动态代理**

Java 原生提供了一套 JDK 动态代理机制，基于接口，代理类必须实现至少一个接口，通过 `Proxy.newProxyInstance()` 生成代理对象，底层靠反射调用目标方法。

核心类是：

```java
java.lang.reflect.Proxy
java.lang.reflect.InvocationHandler
```

来看一个完整例子。接口：

```java
public interface UserService {
    void save();
}
```

实现类：

```java
public class UserServiceImpl implements UserService {
    @Override
    public void save() {
        System.out.println("保存用户");
    }
}
```

然后定义代理逻辑：

```java
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class LogInvocationHandler implements InvocationHandler {

    private final Object target;

    public LogInvocationHandler(Object target) {
        this.target = target;
    }

    @Override
    public Object invoke(
            Object proxy,
            Method method,
            Object[] args
    ) throws Throwable {

        System.out.println("方法执行前");

        Object result = method.invoke(target, args);

        System.out.println("方法执行后");

        return result;
    }
}
```

然后创建代理对象：

```java
UserService target = new UserServiceImpl();

UserService proxy = (UserService) Proxy.newProxyInstance(
        target.getClass().getClassLoader(),
        target.getClass().getInterfaces(),
        new LogInvocationHandler(target)
);
```

调用 `proxy.save();`，输出 方法执行前、保存用户、方法执行后。

注意这里非常关键：`proxy.save();`。你表面上调用的是：`save()`，但实际上会先进入：

```
InvocationHandler.invoke()
```

然后 `invoke()` 再通过反射执行真正的：

```
target.save()
```

因此整个调用链是：

```
proxy.save()
    ↓
InvocationHandler.invoke()
    ↓
method.invoke(target, args)
    ↓
UserServiceImpl.save()
```

这就是 JDK 动态代理最核心的原理。

`Proxy.newProxyInstance()` 有三个参数：

```java
Proxy.newProxyInstance(
    ClassLoader loader,
    Class<?>[] interfaces,
    InvocationHandler h
)
```

分别表示：

```
ClassLoader → 用哪个类加载器加载动态生成的代理类
interfaces → 代理类需要实现哪些接口
InvocationHandler → 方法被调用以后交给谁处理
```

**CGLIB 代理**

CGLIB 基于 ASM 字节码生成工具，通过继承目标类生成子类来实现代理，所以不需要接口，但 final 类和 final 方法没法代理。

下述是一个完整示例（该实例仅用于理解流程，因为从 Java 9 开始有模块系统，JDK 21 默认不允许普通第三方库反射打开 `java.lang.ClassLoader#defineClass`），假设目标类没有实现任何接口：

```java
public class UserService {
    public void save() {
        System.out.println("保存用户");
    }

    public String getUser(String name) {
        System.out.println("查询用户：" + name);
        return "User: " + name;
    }
}
```

然后定义 CGLIB 的方法拦截器：

```java
import net.sf.cglib.proxy.MethodInterceptor;
import net.sf.cglib.proxy.MethodProxy;
import java.lang.reflect.Method;
public class LogMethodInterceptor implements MethodInterceptor {

    /**
     * proxy      CGLIB 生成的代理对象
     * method     当前被调用的方法
     * args       方法参数
     * methodProxy CGLIB 对方法的封装
     */
    @Override
    public Object intercept(
            Object proxy,
            Method method,
            Object[] args,
            MethodProxy methodProxy
    ) throws Throwable {
        System.out.println("方法执行前：" + method.getName());
        // 调用父类，也就是真正目标类的方法
        Object result = methodProxy.invokeSuper(proxy, args);
        System.out.println("方法执行后：" + method.getName());
        return result;
    }
}
```

然后创建代理对象：

```java
import net.sf.cglib.proxy.Enhancer;
public class CglibDemo {
    public static void main(String[] args) {
        // 1. 创建 Enhancer
        Enhancer enhancer = new Enhancer();
        // 2. 设置需要代理的目标类
        enhancer.setSuperclass(UserService.class);
        // 3. 设置方法拦截器
        enhancer.setCallback(new LogMethodInterceptor());
        // 4. 创建代理对象
        UserService proxy = (UserService) enhancer.create();
        // 5. 通过代理对象调用方法
        proxy.save();

        System.out.println("--------------");
        String result = proxy.getUser("Tom");
        System.out.println("返回值：" + result);
    }
}
```

执行结果类似：

```
方法执行前：save
保存用户
方法执行后：save

--------------

方法执行前：getUser
查询用户：Tom
方法执行后：getUser
返回值：User: Tom
```

整个调用链可以理解成：

```
proxy.save()
     ↓
CGLIB 动态生成的 UserService 子类
     ↓
MethodInterceptor.intercept()
     ↓
执行增强逻辑
     ↓
methodProxy.invokeSuper(proxy, args)
     ↓
UserService.save()
     ↓
执行增强逻辑
```

**注意，CGLIB 不能代理 final 类**，因为它是通过继承实现的，而 Java 不允许继承 final 类，所以目标类（被代理类）不能是 `final`。同时，对于被代理的类中存在的 final 方法，CGLIB 也不能够对该 final 方法进行重写增强。以及，被代理类的 private 方法也不能被重写增强。

**两种动态代理方式的区别**

| JDK 动态代理                  | CGLIB                  |
| ----------------------------- | ---------------------- |
| 基于接口                      | 基于继承               |
| 动态实现接口                  | 动态生成子类           |
| 需要接口                      | 不强制需要接口         |
| `Proxy` + `InvocationHandler` | 字节码增强             |
| 不能代理接口之外的方法        | 可以代理普通可重写方法 |



## Java 中 final、finally 和 finalize 的区别？





## BIO、NIO、AIO

BIO、NIO、AIO 是 Java 里三种不同的 I/O 模型，核心区别在于线程在等待数据时的行为。

1. BIO

   同步阻塞模型，线程发起 read 调用后就卡在那儿，数据没来之前啥也干不了。一个连接配一个线程，1000 个连接就得开 1000 个线程，线程切换开销直接把 CPU 拖垮。

   适用于连接数少、短连接，比如：传统 Web 应用。

2. NIO

   同步非阻塞模型，线程可以先去干别的，通过 Selector 轮询哪些 Channel 有数据可读。一个线程能管几千个连接，Netty、Tomcat 的 NIO 模式都是这个套路。

   适用于高并发、长连接，比如：Netty、Tomcat。

3. AIO

   异步非阻塞模型，发起读请求后直接返回，操作系统把数据拷贝完了再通过回调通知你。但 Linux 下 AIO 支持一般，实际生产环境用得不多。极少使用。

### Channel

传统 I/O 是单向的，InputStream 只能读、OutputStream 只能写。要实现双向通信，必须要同时持有两个流对象。

Channel 是 Java NIO 里的核心组件，支持双向传输，即一个通道既能读也能写，不用分别写一个输入流和一个输出流。

常用的 Channel 有如下几种：

1. `FileChannel`

   专门用来读写文件，支持内存映射和零拷贝。Kafka、RocketMQ 底层就靠它来实现高性能磁盘读写。

2. `SocketChannel`

   TCP 客户端通道，连上服务器后用它收发数据。

3. `ServerSocketChannel`

   TCP 服务端通道，负责监听接口、接收新连接，每接收一个连接就生成一个 `SocketChannel`。

4. `DatagramChannel`

   UDP 通道，不需要建立连接，直接发数据。

### Selector

Selector 是 Java NIO 里实现 I/O 多路复用的核心组件，一个线程通过 Selector 就能同时监听成百上千个 Channel 的读写事件，不用给每个连接开一个线程。



## 建议

> 我建议这四部分不要平均投入精力，可以大致按照：
>
> ```
> Java 基础       15%
> 集合            20%
> 并发            35%
> JVM             30%
> ```
>
> 对于 Java 后端面试，真正拉开差距的一般是：
>
> ```
> HashMap
> ConcurrentHashMap
> 
> volatile
> synchronized
> CAS
> AQS
> ReentrantLock
> ThreadLocal
> 线程池
> 
> JMM
> 对象创建
> 类加载
> GC
> G1
> JVM 排障
> ```
>
> 复习方式上，我建议我们后面继续采用一种固定模式。每个主题按照五层来讲：
>
> ```
> ① 它是什么
> ↓
> ② 为什么需要它
> ↓
> ③ 如何使用
> ↓
> ④ 底层是怎么实现的
> ↓
> ⑤ 面试会怎么继续追问
> ```
>
> 例如复习 `volatile`：
>
> ```
> volatile 是什么？
> ↓
> 解决什么问题？
> ↓
> 为什么能保证可见性？
> ↓
> 为什么不能保证原子性？
> ↓
> 内存屏障是什么？
> ↓
> volatile 和 synchronized 有什么区别？
> ↓
> 单例模式为什么需要 volatile？
> ```
>
> 这样最后形成的不是一堆孤立知识点，而是一张能够连续回答追问的知识网络。
>
> 如果按这个路线开始，我建议第一站直接从 **Java 基础中的「==、equals、hashCode」** 开始，然后自然衔接到 `HashMap`，整体会比较顺。
