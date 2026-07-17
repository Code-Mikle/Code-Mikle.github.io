---
title: C++ const 与指针：从左向右读声明
description: 区分指向常量的指针、常指针，以及二者组合时的含义。
sidebar:
  order: 3
---

`const` 与指针的组合容易混淆，原因通常不是语法复杂，而是没有先区分“指针本身”和“指针指向的对象”。

## 指向常量的指针

```cpp
const int* ptr;
// 等价写法
int const* ptr;
```

不能通过 `ptr` 修改它指向的整数，但 `ptr` 自身可以重新指向其他地址。

```cpp
int first = 1;
int second = 2;
const int* ptr = &first;

ptr = &second; // 正确
// *ptr = 3;   // 错误
```

## 常指针

```cpp
int* const ptr = &value;
```

`ptr` 必须在声明时初始化，之后不能再保存其他地址，但可以修改它指向的对象。

```cpp
int value = 1;
int* const ptr = &value;

*ptr = 2;     // 正确
// ptr = ...; // 错误
```

## 指向常量的常指针

```cpp
const int* const ptr = &value;
```

此时地址和值都不能通过 `ptr` 改变。第一个 `const` 约束被指向对象，第二个 `const` 约束指针本身。

## 一个实用读法

从变量名开始向两侧读：

```cpp
const int* const ptr;
```

`ptr` 是一个 `const` 指针，它指向 `const int`。先确认离变量名最近的修饰，再确认指向的对象类型，通常比死记三种写法稳定。
