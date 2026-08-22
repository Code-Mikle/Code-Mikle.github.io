---
title: Spring Cloud
---

## API 网关

API 网关可以理解为：客户端访问后端服务的统一入口。

在微服务架构里，客户端通常不直接访问每个服务，而是先经过 API Gateway。

```
客户端
   ↓
API Gateway
   ↓
 ┌────────┬────────┬────────┐
用户服务  订单服务  商品服务  支付服务
```

它的核心作用主要有这些：

| 作用     | 说明                                    |
| -------- | --------------------------------------- |
| 路由转发 | 根据 URL、Host、Header 等转发到不同服务 |
| 负载均衡 | 一个服务有多个实例时选择具体实例        |
| 身份认证 | JWT、Token、OAuth2 等统一认证           |
| 权限控制 | 判断用户是否允许访问某接口              |
| 限流     | 防止突发流量压垮后端                    |
| 熔断降级 | 后端异常时快速失败或返回兜底结果        |
| 日志监控 | 统一记录请求耗时、状态码、TraceId       |
| 跨域处理 | 统一处理 CORS                           |
| 请求改写 | 修改 Header、URL、参数等                |
| 协议转换 | 如 HTTP → RPC                           |

主要作用：

- 简化客户端调用

  客户端不用关心后端有多少个服务，每个服务都部署在哪儿，只要知道网关地址即可。

- 增强安全性

  所有请求先过网关，在这里可以做身份认证和权限校验。无需每个服务再写 JWT、OAuth2 这些认证逻辑了。后端服务的真实地址藏在网关后面，外面看不到，安全性更高。

- 流量管控

  网关是流量的必经之路，限流、熔断、降级这些保护措施在这一层做最合适。流量突增的时候先在网关挡住，保护后端服务不被打崩。



例如客户端请求：

```http
GET /api/orders/123
Authorization: Bearer xxx
```

网关可以执行：

```
请求进入
  ↓
校验 Token
  ↓
限流
  ↓
根据 /api/orders/** 查找路由
  ↓
从注册中心找到订单服务实例
  ↓
负载均衡选择实例
  ↓
转发请求
  ↓
订单服务返回结果
  ↓
网关返回客户端
```

典型架构：

```
                  注册中心
                     ↑
                     │
客户端 → API Gateway ─┼→ user-service
                     ├→ order-service
                     ├→ product-service
                     └→ payment-service
```

### 网关是怎么实现的？

最核心其实就是一个**反向代理 + 过滤器链**。

可以抽象成：

```
Request
  ↓
Filter 1：日志
  ↓
Filter 2：认证
  ↓
Filter 3：限流
  ↓
Filter 4：路由匹配
  ↓
目标服务
  ↓
Response
```

伪代码类似：

```java
public Response handle(Request request) {

    checkToken(request);
    checkRateLimit(request);
    Route route = findRoute(request);
    Server server = loadBalance(route);
    return forward(request, server);
}
```

实际网关通常会使用事件驱动、异步非阻塞模型，因为网关需要处理大量网络连接。

例如 Java 中常见的：

```
Spring Cloud Gateway
    ↓
Spring WebFlux
    ↓
Reactor
    ↓
Netty
```

而不是每个请求都简单对应一个阻塞线程。

### 路由是怎么实现的？

比如配置：

```
routes:
  - path: /api/user/**
    service: user-service


  - path: /api/order/**
    service: order-service
```

当请求 `/api/order/123`，网关匹配 `/api/order/**`，然后找到 `order-service`。

如果订单服务有多个实例：

```
10.0.0.1:8080
10.0.0.2:8080
10.0.0.3:8080
```

再通过负载均衡：轮询、随机、权重、最少连接选择其中一个。

### 限流通常怎么实现？

常见是令牌桶，例如：

```
桶容量：1000，每秒生成：100 token

请求到达
   ↓
有 token → 放行
没 token → 拒绝
```

分布式网关通常把限流状态放到 Redis。例如：

```
userId + API
IP + API
tenantId + API
```

分别做限流。

### 认证为什么适合放网关？

如果没有网关：

```
user-service     → 校验 JWT
order-service    → 校验 JWT
product-service  → 校验 JWT
payment-service  → 校验 JWT
```

重复很多。

有网关：

```
                 JWT 校验
                    ↓
客户端 → Gateway ─────────→ 微服务
```

网关认证后，可以把用户信息写入 Header：

```
X-User-Id: 10001
```

后面的服务直接使用。

不过涉及高安全要求时，后端服务通常仍应保留必要的授权校验，不能完全相信任意来源的 Header。

### 网关和 Nginx 有什么区别？

两者都可以做反向代理，但侧重点不同：

```
Nginx
→ 高性能反向代理
→ 静态资源
→ SSL
→ 负载均衡


API Gateway
→ 更偏业务 API 治理
→ 认证
→ 鉴权
→ 限流
→ 服务发现
→ 熔断
→ 动态路由
```

实际架构经常是：

```
Internet
   ↓
Nginx / LB
   ↓
API Gateway
   ↓
微服务集群
```

例如：

```
客户端
  ↓
Nginx
  ↓
Spring Cloud Gateway
  ↓
订单服务 / 用户服务 / 商品服务
```

一句话总结：

> **API 网关本质是微服务系统的统一反向代理入口，通过路由、过滤器和负载均衡将请求转发到具体服务，同时统一处理认证、鉴权、限流、熔断、日志和监控等横切能力。**