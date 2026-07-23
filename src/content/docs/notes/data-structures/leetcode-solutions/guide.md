---
title: 刷题指南
---

[数据结构和算法学习路线 | 26 年最新零基础到精通一条龙（万人收藏⭐️） - 2026 全栈编程学习路线汇总：AI/Java/Go/前端（保姆级） - 编程导航教程](https://www.codefather.cn/course/1789189862986850306/section/1789191067892948993)

[【LeetCode】力扣刷题攻略路线推荐！适合新手小白入门~（含各类题目序号）_力扣刷题顺序-CSDN博客](https://blog.csdn.net/2201_75299492/article/details/136405782)

首先，应该清楚数据结构和算法所涉及的知识体系，这样在后续刷题的过程中才不会迷茫。

# 知识体系

## 时间复杂度排序

```
O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(n³) < O(2ⁿ) < O(n!)
```

| 排序算法     | 平均时间复杂度 | 最坏时间复杂度 | 最好时间复杂度 | 空间复杂度 | 稳定性 |
| ------------ | -------------- | -------------- | -------------- | ---------- | ------ |
| 冒泡排序     | O(n²)          | O(n²)          | O(n)           | O(1)       | 稳定   |
| 直接选择排序 | O(n²)          | O(n²)          | O(n²)          | O(1)       | 不稳定 |
| 直接插入排序 | O(n²)          | O(n²)          | O(n)           | O(1)       | 稳定   |
| 快速排序     | O(nlogn)       | O(n²)          | O(nlogn)       | O(logn)    | 不稳定 |
| 堆排序       | O(nlogn)       | O(nlogn)       | O(nlogn)       | O(1)       | 不稳定 |
| 希尔排序     | 取决于增量序列 | 取决于增量序列 | O(n)           | O(1)       | 不稳定 |
| 归并排序     | O(nlogn)       | O(nlogn)       | O(nlogn)       | O(n)       | 稳定   |
| 计数排序     | O(n+k)         | O(n+k)         | O(n+k)         | O(n+k)     | 稳定   |
| 基数排序     | O(d(n+k))      | O(d(n+k))      | O(d(n+k))      | O(n+k)     | 稳定   |

## 数据结构

- 线性结构
  - 数组（字符串）
  - 链表（单向链表、双向链表、循环链表）
  - 栈
  - 队列（普通队列、双端队列）
- 散列结构
  - 集合
  - 映射
  - BitMap
- 树
  - 二叉树
  - 二叉查找树
  - 多叉树
  - 前缀树
  - 堆（小顶堆、大顶堆）
- 图
  - 最短路径
  - 并查集
  - 最小生成树
  - 拓扑排序

## 算法

- 排序算法
  - 冒泡排序、快速排序、插入排序、希尔排序
  - 选择排序、堆排序、归并排序
  - 技术排序、桶排序、基数排序
- 查找算法
  - 有序表查找（二分查找）
  - 线性表查找
  - 树结构查找
  - 散列表查找
- 经典算法思想
  - 贪心算法
  - 分治算法
  - 动态规划
  - 递归
  - 回溯
  - 枚举
- 搜索算法
  - 深度优先搜索（DFS）
  - 广度优先搜索（BFS）
- 字符串匹配
  - KMP 算法
  - 前缀树
- 位运算

## 复杂度分析

- 时间复杂度
- 空间复杂度

# 推荐资源

## 入门

- 73dl《算法图解》[阿里云盘分享](https://www.aliyundrive.com/s/MFSC8TP7ANB)
- 73dl《大话数据结构》[阿里云盘分享](https://www.aliyundrive.com/s/MFSC8TP7ANB)

## 基础

1. 算法基础理论和复杂度分析
   - [数据结构与算法基础（青岛大学-王卓）_哔哩哔哩_bilibili](https://www.bilibili.com/video/BV1nJ411V7bd/) 看前几节就可以了
2. 数组和字符串
   - [力扣](https://leetcode.cn/leetbook/detail/array-and-string/)
3. 链表
   - [力扣 (LeetCode) 全球极客挚爱的技术成长平台](https://leetcode.cn/leetbook/detail/linked-list/)
4. 队列 & 栈
   - [力扣](https://leetcode.cn/leetbook/detail/queue-stack/)
5. 哈希表
   - [力扣 (LeetCode) 全球极客挚爱的技术成长平台](https://leetcode.cn/leetbook/detail/hash-table/)
6. 查找表类算法
   - [力扣 (LeetCode) 全球极客挚爱的技术成长平台](https://leetcode.cn/leetbook/detail/all-about-lockup-table/)
7. 二分查找
   - [力扣](https://leetcode.cn/leetbook/detail/binary-search/)
8. 二叉树
   - [力扣 (LeetCode) 全球极客挚爱的技术成长平台](https://leetcode.cn/leetbook/detail/data-structure-binary-tree/)
9. 二叉搜索树
   - [力扣](https://leetcode.cn/leetbook/detail/introduction-to-data-structure-binary-search-tree/)
10. 前缀树
    - [力扣 (LeetCode) 全球极客挚爱的技术成长平台](https://leetcode.cn/leetbook/detail/trie/)
11. N叉树
    - [力扣 (LeetCode) 全球极客挚爱的技术成长平台](https://leetcode.cn/leetbook/detail/n-ary-tree/)
12. 数组类算法
    - [力扣](https://leetcode.cn/leetbook/detail/all-about-array/)
13. 初级算法
    - [初级算法 - LeetBook - 力扣（LeetCode）全球极客挚爱的技术成长平台](https://leetcode.cn/leetbook/detail/top-interview-questions-easy/)
14. 中级算法
    - [力扣](https://leetcode.cn/leetbook/detail/top-interview-questions-medium/)

## 推荐刷题顺序

1. 先按照上述知识点去leetcode刷题
2. 然后去刷[🔥 LeetCode 热题 HOT 100 ](https://leetcode.cn/problem-list/2cktkvj/)
3. 建议刷题量最好在 200 道以上，每天 2-3 道，坚持 2 个月，整理好代码定期复习，不让去刷过多的冷门题和 hard 题。
4. 巩固强化：刷完 leetcode 经典题目后，可以去刷刷 《剑指 Offer》或者《剑指 Offer 面试精装版》

## 推荐的刷题平台

- [力扣 (LeetCode) 全球极客挚爱的技术成长平台](https://leetcode.cn/) 最推荐、最主流的算法刷题平台
- [首页 - 洛谷 | 计算机科学教育新生态](https://www.luogu.com.cn/) 适合算法竞赛

## 推荐题单

- [🔥 LeetCode 热题 HOT 100 ](https://leetcode.cn/problem-list/2cktkvj/)

- [LeetCode 精选算法 200 题](https://leetcode.cn/problem-list/qg88wci/)
- [LeetCode 算法高频面试题汇总](https://leetcode.cn/leetbook/detail/top-interview-questions/)

# 面试前冲刺

1. 刷热门题目：建议刷 LeetCode 热门题目，有时间还可以阅读 《剑指 Offer》、《剑指 Offer 专项突破版》、《程序员代码面试指南》等，或许会碰到面试原题。
2. 刷公司真题：可以刷意向公司的[企业面试|笔试真题](https://www.nowcoder.com/exam/company?questionJobId=10&subTabName=written_page)，难度比较大，多多练习即可。
3. 复习算法知识：面试前一定要系统复习一遍常见算法的时间复杂度、空间复杂度、适用场景等。
4. 准备手写代码：面试时可能需要现场手写代码，提前练习。（如快排、二分查找、DFS/BFS 等）
5. 多看真实面经：[ 面经分享，程序员编程学习交流社区](https://www.codefather.cn/job/experience)，了解不同公司对算法的考察重点。

## 面试考察的形式

算法面试主要有以下几种形式：

1. 手写算法题：给定题目，现场编写代码（最常见）
2. 口述思路：描述如何用算法解决某个问题
3. 算法优化：给一个低效的算法，让你优化
4. 复杂度分析：分析算法的时间和空间复杂度
5. 数据结构设计：设计一个数据结构来满足特定需求

## 面试题库

- [大厂算法真题面试题 - 面试鸭 | 2026最新企业真题+详细答案解析](https://www.mianshiya.com/bank/1814979506750275585)
- [回溯面试题 - 面试鸭 | 2026最新企业真题+详细答案解析](https://www.mianshiya.com/bank/1824426864626651137) 还有好多，比如[Trie](https://www.mianshiya.com/bank/1824426867738824705)、[图](https://www.mianshiya.com/bank/1824426868414107650)、前缀、后缀和、[字符串](https://www.mianshiya.com/bank/1824426873728290818)、[树](https://www.mianshiya.com/bank/1824426876085489665)、[栈](https://www.mianshiya.com/bank/1824426881391284225)、位运算、差分、数学、[动态规划](https://www.mianshiya.com/bank/1824426891520528386)、遍历、[贪心](https://www.mianshiya.com/bank/1824426900836077569)、[滑动窗口](https://www.mianshiya.com/bank/1824426904673865730)、[排序](https://www.mianshiya.com/bank/1824426906175426561)、[双指针](https://www.mianshiya.com/bank/1824426908549402626)、[链表](https://www.mianshiya.com/bank/1824426910944350209)、[二分法](https://www.mianshiya.com/bank/1824426914979270658)、[并查集](https://www.mianshiya.com/bank/1824426917294526466)等。注：⚠️⚠️⚠️这些专题都需要直接搜索才可以看到，在主页是没有展示的。