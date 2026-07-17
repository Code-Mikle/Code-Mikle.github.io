---
title: 多态与虚函数：运行时绑定的基本模型
description: 从基类指针、虚函数和虚析构函数理解 C++ 运行时多态。
sidebar:
  order: 4
---

C++ 运行时多态的核心，是通过基类接口操作派生类对象，并在运行阶段决定调用哪个函数实现。

## 基本条件

通常需要同时满足：

1. 存在继承关系；
2. 基类成员函数使用 `virtual`；
3. 派生类覆盖该函数；
4. 通过基类指针或引用调用。

```cpp
class Shape {
public:
    virtual double area() const = 0;
    virtual ~Shape() = default;
};

class Circle final : public Shape {
public:
    explicit Circle(double radius) : radius_(radius) {}

    double area() const override {
        return 3.1415926 * radius_ * radius_;
    }

private:
    double radius_;
};
```

当 `Shape&` 实际引用一个 `Circle` 对象时，调用 `area()` 会进入 `Circle::area()`。

## 为什么析构函数也要是 virtual

如果对象可能通过基类指针释放，基类析构函数必须是虚函数，否则派生类析构过程可能不会完整执行。

```cpp
std::unique_ptr<Shape> shape = std::make_unique<Circle>(2.0);
```

这里 `Shape` 的虚析构函数保证 `Circle` 被正确销毁。

## override 的作用

`override` 不改变运行机制，但能让编译器检查函数是否真的覆盖了基类虚函数。参数类型、`const` 或引用限定符不一致时，编译器会立即报错，因此应该优先使用。
