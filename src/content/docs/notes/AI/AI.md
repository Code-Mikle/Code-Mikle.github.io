---
title: AI
---

什么是 CoT，作用是啥 

什么是 ReAct，它为什么能够更好地做工具调用

ReAct 和 Plan-Execute-Replan 的区别，以及使用场景

单 Agent 和多 Agent 分别适合什么场景

LLM 的底层基础架构是什么，训练的大致过程

Self-Attention 的作用

什么是召回（Recall）

Function Call、Skill、MCP 的区别

Prompt 如何写的？

Skills 与 Rules 的区别？

怎么解决幻觉？

设计 Agent 的时候怎么能在保证效果的前提下减少 Token 消耗

大模型调参中温度和 TopK 怎么理解？



## Skill





## MCP













## Agent

谈谈对 Agent 的理解，Agent 完整涉及包含哪几个关键环节？

Agent 记忆该怎么做？什么时候需要保存记忆？什么时候读取记忆，读取多少长度的记忆？

Agent 开发有哪几种执行模式，是否了解？

如何解决 Agent 意图识别不准的问题？





### ReAct



### Reflexion



### Agent 框架



### A2A 协议







## RAG

RAG 的类型



**Embedding 技术早都用于推荐、搜索系统等领域，那么目前的 RAG 底层也是向量匹配，无非是用于 LLM 来增强 context？**

RAG 并没有发明 Embedding 或向量检索。Embedding 和向量匹配早已大量应用于推荐系统、搜索系统等领域。RAG 本质上是把这些成熟的信息检索技术接到 LLM 前面，把检索到的信息作为上下文，从而增强 LLM 的生成能力。

甚至可以进一步说，RAG 真正的新东西并不是“向量数据库”，而是：

```
传统 Information Retrieval
            +
        LLM Generation
```

这也是为什么你之前说：

> “RAG 技术一直演进，但核心还是文档切分、向量化、相似度计算。”

这个判断对经典 Dense RAG 是基本成立的。

不过到了 Agentic RAG / Modular RAG / Graph RAG，核心逐渐从：

```
怎么把文档检索出来
```

变成：

```
什么时候检索
检索什么
去哪个数据源
用什么检索方式
是否需要二次检索
如何判断证据够不够
```

### RAG 流程



### 向量数据库



### RAG 结果评测

RAG 线上经常遇到哪些问题，怎么解决



### RAG 处理文档



### RAG 与模型微调的区别？





## 框架

### LangChain

LanguageChain 是一个专门用来开发大语言模型应用的框架，核心就是把 LLM 的能力和外部工具、数据源穿起来。

六大核心组件如下：

1. Models
2. Prompt Templates
3. Memory
4. Chains
5. Agents
6. Tools



**什么时候使用 human-in-the-loop？**

下述以 SyncUp 中的创建/删除队伍为例说明：

| 维度                     | 方案 1：Draft/PendingAction | 方案 2：LangChain4j HITL      |
| ------------------------ | --------------------------- | ----------------------------- |
| 适合场景                 | 单次创建、修改、删除        | 多步骤 Agent 工作流           |
| 系统复杂度               | 较低                        | 较高                          |
| 是否需要保存 Agent 状态  | 不需要                      | 通常需要                      |
| 用户等待期间是否占用线程 | 不需要                      | 取决于实现                    |
| 与业务系统耦合           | 主要在业务层                | 业务层与 Agent 编排层都会涉及 |
| 审计、幂等和权限控制     | 容易实现                    | 仍需额外实现                  |
| 暂停后继续执行后续步骤   | 较弱，但通常不需要          | 强                            |
| 当前 SyncUp 是否需要     | 需要                        | 暂时没有必要                  |

对于“创建一个队伍”来说，确认完成后只需要调用一次 `TeamApplicationService.createTeam()`，后面没有必须由 Agent 继续完成的工作流，因此 HITL 带来的 checkpoint、恢复、AgenticScope 管理价值不大。