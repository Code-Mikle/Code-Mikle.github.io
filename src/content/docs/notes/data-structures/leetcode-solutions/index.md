---
title: 算法题
---

数组/哈希：两数之和、三数之和、最长连续序列
双指针：接雨水、盛最多水、移动零
滑动窗口：无重复最长子串、最小覆盖子串
链表：反转、环、合并、相交
二叉树：遍历、深度、路径和、最近公共祖先
回溯：子集、排列、组合、括号生成
DP：爬楼梯、打家劫舍、最大子数组、最长递增子序列
图/堆：岛屿、课程表、TopK

第 1 阶段：数组/哈希/双指针
两数之和、字母异位词分组、最长连续序列、三数之和、移动零、盛最多水、接雨水

第 2 阶段：滑动窗口/栈/二分
无重复字符最长子串、最小覆盖子串、有效括号、搜索插入位置、旋转数组最小值

第 3 阶段：链表
反转链表、合并两个有序链表、环形链表、相交链表、k 个一组翻转链表、重排链表

第 4 阶段：二叉树
遍历、层序遍历、最大深度、路径总和、验证 BST、最近公共祖先、反转二叉树

第 5 阶段：回溯/DP
子集、组合、全排列、括号生成、爬楼梯、买卖股票、最大子数组、打家劫舍、路径总和、LIS、编辑距离

第 6 阶段：图/堆/手撕
岛屿数量、课程表、快速排序、第 K 大元素、TopK、LRU、DCL 单例、生产者消费者

```
LRU 缓存机制 1
反转链表 2
将两个无需有重列表合并成一个有序无重列表
两个无序列表，找到其中的重复数
快速排序
三数之和 1
无重复字符的最长子串
最大子数组 1
岛屿数量 1
非递归反转二叉树
数组中第 k 个元素 1
二叉树的层序遍历、前中后序遍历 1
合并区间 1
接雨水
k 个一组翻转链表
两数之和
全排列 1
有效括号 1
买卖股票的最佳时机
求矩阵从左上角走到右下角的路径总和 1
编辑距离
打家劫舍
字母异位词分组 1
搜索插入位置
轮转数组
旋转图像
寻找旋转排序数组中的最小值
重排链表 1
验证二叉搜索树
合并两个有序链表
设计模式/系统设计类手撕
线程安全单例模式（DCL）- 阿里几乎必考
生产者消费者模型
```

## 数组/哈希/双指针

### 两数之和

[1. 两数之和 - 力扣（LeetCode）](https://leetcode.cn/problems/two-sum/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/4/27

**题目描述**

```
给定一个整数数组 nums 和一个整数目标值 target，请你在该数组中找出和为目标值 target 的那两个整数，并返回它们的数组下标。
你可以假设每种输入只会对应一个答案，并且你不能使用两次相同的元素。
你可以按任意顺序返回答案。

示例 1：
输入：nums = [2,7,11,15], target = 9
输出：[0,1]
解释：因为 nums[0] + nums[1] == 9 ，返回 [0, 1] 。

示例 2：
输入：nums = [3,2,4], target = 6
输出：[1,2]

示例 3：
输入：nums = [3,3], target = 6
输出：[0,1]
 
提示：
2 <= nums.length <= 10^4
-10^9 <= nums[i] <= 10^9
-10^9 <= target <= 10^9
只会存在一个有效答案
```

**题目解析**

解法一：直接的解法就是枚举数组中每一个数 x，寻找数组中是否存在 target - x。当在数组中遍历寻找 target - x 时，对于 x 之前的元素已经匹配过了，就不需要再匹配了，只需要在 x 之后的元素中寻找 target - x。这种方法的时间复杂度无疑是 $O(n^2)$，空间复杂度是 $O(n)$。

```java
public int[] twoSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) {
                return new int[]{i, j};
            }
        }
    }
    return new int[0]; // 返回长度为0的空整型数组
}
```

解法二：哈希表

法一的时间复杂度高的原因是寻找 target - x 的时间复杂度过高，那么如果有一种方法能够帮我们记录已经遍历的元素并快速命中，那么就可以将时间复杂度降到 $O(n)$。这种方法就是使用 hash 表。

```java
public int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> hashtable = new HashMap<Integer, Integer>();
    for (int i = 0; i < nums.length; i++) {
        if (hashtable.containsKey(target - nums[i])) {
            return new int[]{hashtable.get(target - nums[i]), i};
        }
        hashtable.put(nums[i], i);
    }
    return new int[0];
}
```

### 字母异位词分组

[49. 字母异位词分组 - 力扣（LeetCode）](https://leetcode.cn/problems/group-anagrams/description/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/4/27

**题目描述**

```
给你一个字符串数组，请你将 字母异位词（字母异位词是通过重新排列不同单词或短语的字母而形成的单词或短语，并使用所有原字母一次） 组合在一起。可以按任意顺序返回结果列表。

示例 1:
输入: strs = ["eat", "tea", "tan", "ate", "nat", "bat"]
输出: [["bat"],["nat","tan"],["ate","eat","tea"]]
解释：
在 strs 中没有字符串可以通过重新排列来形成 "bat"。
字符串 "nat" 和 "tan" 是字母异位词，因为它们可以重新排列以形成彼此。
字符串 "ate" ，"eat" 和 "tea" 是字母异位词，因为它们可以重新排列以形成彼此。

示例 2:
输入: strs = [""]
输出: [[""]]

示例 3:
输入: strs = ["a"]
输出: [["a"]]

提示：
1 <= strs.length <= 10^4
0 <= strs[i].length <= 100
strs[i] 仅包含小写字母
```

**题目解析**

> 这个题目我本以为我思考清楚了，就没有先写解析，而是直接开始写代码，写到一半就发现写错了，思路不对。因此，开发中写代码永远不是最重要的，思路才是。一定要先想清楚了，再开始写，正所谓磨刀不误砍柴工！

如果两个字符串是字母异位词，则对这两个字符串排序后，它们一定是相同的。那么就可以用一个 hash 表来存储，将排序后的 字符串 作为 key， value 为 `List<String>` 存储字母异位词。

```java
public List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<String, List<String>>();
    for (String str : strs) {
        char[] array = str.toCharArray();
        Arrays.sort(array);
        String key = new String(array);
        List<String> list = map.getOrDefault(key, new ArrayList<String>());
        list.add(str);
        map.put(key, list);
    }
    return new ArrayList<List<String>>(map.values());
}
```

### 找到字符串中所有字母异位词

[438. 找到字符串中所有字母异位词 - 力扣（LeetCode）](https://leetcode.cn/problems/find-all-anagrams-in-a-string/description/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/5/1

**题目描述**

```
给定两个字符串 s 和 p，找到 s 中所有 p 的异位词的子串，返回这些子串的起始索引。不考虑答案输出的顺序。

示例 1:
输入: s = "cbaebabacd", p = "abc"
输出: [0,6]
解释:
起始索引等于 0 的子串是 "cba", 它是 "abc" 的异位词。
起始索引等于 6 的子串是 "bac", 它是 "abc" 的异位词。

示例 2:
输入: s = "abab", p = "ab"
输出: [0,1,2]
解释:
起始索引等于 0 的子串是 "ab", 它是 "ab" 的异位词。
起始索引等于 1 的子串是 "ba", 它是 "ab" 的异位词。
起始索引等于 2 的子串是 "ab", 它是 "ab" 的异位词。

提示:
1 <= s.length, p.length <= 3 * 10^4
s 和 p 仅包含小写字母
```

**题目解析**

解法一：

就是窗口大小为 2 的滑动窗口，每次比较窗口中的子串与 p 是不是异位词即可，比较方式就是先对窗口内的子串排序，然后判断是否一样即可。

```java
public List<Integer> findAnagrams(String s, String p) {
    int L = 0, R = p.length() - 1;
    char[] pc = p.toCharArray();
    Arrays.sort(pc);
    String pOrder = new String(pc);
    List<Integer> res = new ArrayList<>();
    int n = s.length();
    while (R < n) {
        String sub = s.substring(L, R + 1);
        char[] c = sub.toCharArray();
        Arrays.sort(c);
        String sub_order = new String(c);
        if (sub_order.equals(pOrder)) {
            res.add(L);
        }
        L++;
        R++;
    }
    return res;
}
```

解法二：

滑动窗口 + 统计词频

### 最长连续列

[128. 最长连续序列 - 力扣（LeetCode）](https://leetcode.cn/problems/longest-consecutive-sequence/description/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/4/27

**题目描述**

```
给定一个未排序的整数数组 nums ，找出数字连续的最长序列（不要求序列元素在原数组中连续）的长度。
请你设计并实现时间复杂度为 O(n) 的算法解决此问题。

示例 1：
输入：nums = [100,4,200,1,3,2]
输出：4
解释：最长数字连续序列是 [1, 2, 3, 4]。它的长度为 4。

示例 2：
输入：nums = [0,3,7,2,5,8,4,6,0,1]
输出：9

示例 3：
输入：nums = [1,0,1,2]
输出：3
 

提示：
0 <= nums.length <= 10^5
-10^9 <= nums[i] <= 10^9
```

**题目解析**

该题目显然不能先使用快排排序处理，因为快排的时间复杂度是 $O(nlogn)$。

要寻找数组中存在的最长序列，其实就是寻找数组中各个连续序列的开头，然后取最长的即可。那么将数组 nums 放入 HashSet 中，然后依次遍历判断每个元素的是不是开头即可，即判断 num - 1 是否存在与 HashSet 中，如果存在，那么跳过遍历下一个数组；如果不存在，那么该元素就是连续序列的头元素，使用 while 判断以该元素开头的后续元素是否存在，然后记录连续序列的长度。

```java
public int longestConsecutive(int[] nums) {
        Set<Integer> num_set = new HashSet<Integer>();
        for (int num : nums) {
            num_set.add(num);
        }

        int longestStreak = 0;

        for (int num : num_set) {
            if (!num_set.contains(num - 1)) {
                int currentNum = num;
                int currentStreak = 1;
                while(num_set.contains(currentNum + 1)) {
                    currentNum += 1;
                    currentStreak += 1;
                }
                longestStreak = Math.max(longestStreak, currentStreak);
            }
        }
        return longestStreak;
    }
```

### 三数之和

[15. 三数之和 - 力扣（LeetCode）](https://leetcode.cn/problems/3sum/description/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/5/1

**题目描述**

```
给你一个整数数组 nums ，判断是否存在三元组 [nums[i], nums[j], nums[k]] 满足 i != j、i != k 且 j != k ，同时还满足 nums[i] + nums[j] + nums[k] == 0 。请你返回所有和为 0 且不重复的三元组。
注意：答案中不可以包含重复的三元组。

示例 1：
输入：nums = [-1,0,1,2,-1,-4]
输出：[[-1,-1,2],[-1,0,1]]
解释：
nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0 。
nums[1] + nums[2] + nums[4] = 0 + 1 + (-1) = 0 。
nums[0] + nums[3] + nums[4] = (-1) + 2 + (-1) = 0 。
不同的三元组是 [-1,0,1] 和 [-1,-1,2] 。
注意，输出的顺序和三元组的顺序并不重要。

示例 2：
输入：nums = [0,1,1]
输出：[]
解释：唯一可能的三元组和不为 0 。

示例 3：
输入：nums = [0,0,0]
输出：[[0,0,0]]
解释：唯一可能的三元组和为 0 。
 

提示：
3 <= nums.length <= 3000
-10^5 <= nums[i] <= 10^5
```

**题目解析**

如果使用暴力解法，那么时间复杂度为 $O(N^3)$。

先对数组 nums 排序，时间复杂度为 $O(n log n)$。

定义三个指针 k、i、j。固定 k，双指针 i 和 j 分别设在数组索引两端 (k, len(nums))；双指针 i 和 j 交替向中间移动，记录对于每个固定指针 k 的所有满足 nums[k] + nums[i] + nums[j] = 0 的 i，j 组合：

- 当 nums[k] > 0 时，直接跳出循环，因为 nums[j] >= nums[i] >= nums[k]，即 3 个元素都大于 0，在此固定指针 k 之后不可能再找到结果了

- 当 k>0 且 nums[k] == nums[k - 1] 时，跳过该元素 nums[k]。因为已经将 nums[k - 1] 的所有组合加入到结果中，本次双指针搜索只会得到重复的组合
- i，j 分设在数组索引 (k, len(nums)) 两端，当 i < j 时循环计算 s = nums[k] + nums[i] + nums[j]，并按照以下规则执行双指针移动：
  - 当 s < 0 时，i += 1 并跳过所有重复的 nums[i]
  - 当 s > 0 时，j -= 1 并跳过所有重复的 nums[j]
  - 当 s = 0 时，记录组合 [k, i , j] 到 res，执行 i += 1 和 j -= 1 并跳过所有重复的 nums[i] 和 nums[j]，防止记录到重复组合。

```java
public List<List<Integer>> threeSum(int[] nums) {
    Arrays.sort(nums);
    List<List<Integer>> res = new ArrayList<>();
    for (int k = 0; k < nums.length - 2; k++) {
        if (nums[k] > 0) break;
        if (k > 0 && nums[k] == nums[k - 1]) continue;
        int i = k + 1, j = nums.length - 1;
        while (i < j) {
            int sum = nums[k] + nums[i] + nums[j];
            if (sum == 0) {
                res.add(new ArrayList<Integer>(Arrays.asList(nums[k], nums[i], nums[j])));
                while(i < j && nums[i] == nums[++i]);
                while(i < j && nums[j] == nums[--j]);
            } else if (sum < 0) {
                while(i < j && nums[i] == nums[++i]);
            } else if (sum > 0) {
                while(i < j && nums[j] == nums[--j]);
            }
        }

    }
    return res;
}
```

### 移动零

[283. 移动零 - 力扣（LeetCode）](https://leetcode.cn/problems/move-zeroes/description/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/5/1

**题目描述**

```
给定一个数组 nums，编写一个函数将所有 0 移动到数组的末尾，同时保持非零元素的相对顺序。
请注意，必须在不复制数组的情况下原地对数组进行操作。

示例 1:
输入: nums = [0,1,0,3,12]
输出: [1,3,12,0,0]

示例 2:
输入: nums = [0]
输出: [0]

提示:
1 <= nums.length <= 10^4
-2^31 <= nums[i] <= 2^31 - 1
进阶：你能尽量减少完成的操作次数吗？
```

**题目解析**

两个指针 L 和 R，左指针指向已经处理好的左边的序列的尾部，右指针指向待处理序列的头部。R 不断向右移动每次指向非零数，则将该数与 L 左指针指向的数进行交换，同时左指针右移。

```java
public void moveZeroes(int[] nums) {
    int L = 0, R = 0;
    while (R < nums.length) {
        if (nums[R] != 0) {
            int temp = nums[R];
            nums[R] = nums[L];
            nums[L] = temp;
            L++;
        }
        R++;
    }
}
```

### 盛最多水的容器

[11. 盛最多水的容器 - 力扣（LeetCode）](https://leetcode.cn/problems/container-with-most-water/description/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/5/1

**题目描述**

```
给定一个长度为 n 的整数数组 height 。有 n 条垂线，第 i 条线的两个端点是 (i, 0) 和 (i, height[i]) 。
找出其中的两条线，使得它们与 x 轴共同构成的容器可以容纳最多的水。
返回容器可以储存的最大水量。
说明：你不能倾斜容器。
```

<img src="D:\Code\Code-Mikle.github.io\src\content\docs\notes\data-structures\leetcode-solutions\assets\image-20260501122335764.png" alt="image-20260501122335764" style="zoom:67%;" />

![](/images/data-structures/leetcode-solutions/image-20260501122335764.png)

```
提示：
n == height.length
2 <= n <= 10^5
0 <= height[i] <= 10^4
```

**题目解析**

使用两个指针 L 和 R，初始值分别为 0 和 nums.length - 1，也就是 L 和 R 分别表示容器的左右两个边，因为容器的容量是由最短的那个边决定的。因此，我们需要改变最短的那个边，也就是把 L 或 R 指向的边短的哪个指针移动一个位置。

```java
public int maxArea(int[] height) {
    int L = 0, R = height.length - 1;
    int res = 0;
    while (L < R) {
        res = Math.max(Math.min(height[L], height[R]) * (R - L), res);
        if (height[L] <= height[R]) {
            L++;
        } else {
            R--;
        }
    }
    return res;
}
```

### 接雨水（暂时跳过）

[42. 接雨水 - 力扣（LeetCode）](https://leetcode.cn/problems/trapping-rain-water/description/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/5/1

**题目描述**

```
给定 n 个非负整数表示每个宽度为 1 的柱子的高度图，计算按此排列的柱子，下雨之后能接多少雨水。
```

<img src="D:\Code\Code-Mikle.github.io\src\content\docs\notes\data-structures\leetcode-solutions\assets\image-20260501140129855.png" alt="image-20260501140129855" style="zoom:67%;" />

```
提示：
n == height.length
1 <= n <= 2 * 10^4
0 <= height[i] <= 10^5
```

**题目解析**



### 轮转数组（未完）

[189. 轮转数组 - 力扣（LeetCode）](https://leetcode.cn/problems/rotate-array/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/5/8

**题目描述**

```
给定一个整数数组 nums，将数组中的元素向右轮转 k 个位置，其中 k 是非负数。

示例 1:
输入: nums = [1,2,3,4,5,6,7], k = 3
输出: [5,6,7,1,2,3,4]
解释:
向右轮转 1 步: [7,1,2,3,4,5,6]
向右轮转 2 步: [6,7,1,2,3,4,5]
向右轮转 3 步: [5,6,7,1,2,3,4]

示例 2:
输入：nums = [-1,-100,3,99], k = 2
输出：[3,99,-1,-100]
解释: 
向右轮转 1 步: [99,-1,-100,3]
向右轮转 2 步: [3,99,-1,-100]
 

提示：
1 <= nums.length <= 10^5
-2^31 <= nums[i] <= 2^31 - 1
0 <= k <= 10^5

进阶：
尽可能想出更多的解决方案，至少有 三种 不同的方法可以解决这个问题。
你可以使用空间复杂度为 O(1) 的 原地 算法解决这个问题吗？
```

**题目解析**

法一：不可取

整个数组每次向右移动一位，移动 k 次即可。时间复杂度 `O(n^2)`，空间复杂度 `O(1)`。

```java
public void rotate(int[] nums, int k) {
    k %= nums.length;
    for (int i = 0; i < k; i++) {
        int tmp = nums[nums.length - 1];
        for (int j = nums.length - 1; j > 0; j--) {
            nums[j] = nums[j - 1];
        }
        nums[0] = tmp;
    }
}
```

上述方法会超时。

法二：

使用一个与 nums 同样大小的数组 nums_rotate，存放轮转后的位置，然后将 nums_rotate 的数据拷贝给 nums 即可。时间复杂度 `O(n)`，空间复杂度 `n`。

```java
public void rotate(int[] nums, int k) {
    int n = nums.length;
    int[] newArr = new int[n];
    for (int i = 0; i < n; i++) {
        newArr[(i + k) % n] = nums[i];
    }
    System.arraycopy(newArr, 0, nums, 0, n);
}
```

法三：

假设原数组是 `[1, 2, 3, 4, 5, 6, 7]`，`k=3`

旋转后的数组是 `[7, 6, 5, 4, 3, 2, 1]`

反转前 k 个，`[]`

### 合并区间

[56. 合并区间 - 力扣（LeetCode）](https://leetcode.cn/problems/merge-intervals/description/?envType=study-plan-v2&envId=top-100-liked)

**时间：**2026/3/14

**题目描述**

```
以数组 intervals 表示若干个区间的集合，其中单个区间为 intervals[i] = [starti, endi] 。请你合并所有重叠的区间，并返回 一个不重叠的区间数组，该数组需恰好覆盖输入中的所有区间 。

示例 1：
输入：intervals = [[1,3],[2,6],[8,10],[15,18]]
输出：[[1,6],[8,10],[15,18]]
解释：区间 [1,3] 和 [2,6] 重叠, 将它们合并为 [1,6].

示例 2：
输入：intervals = [[1,4],[4,5]]
输出：[[1,5]]
解释：区间 [1,4] 和 [4,5] 可被视为重叠区间。

示例 3：
输入：intervals = [[4,7],[1,4]]
输出：[[1,7]]
解释：区间 [1,4] 和 [4,7] 可被视为重叠区间。

提示：
1 <= intervals.length <= 10^4
intervals[i].length == 2
0 <= start_{i} <= end_{i} <= 10^4
```

**题目解析**

用数组`merge`存储最终的答案。

首先按照区间的左端点升序排序，那么在排完序的列表中，可以合并的区间一定是相邻的。然后将第一个区间加入`merge`数组中，并按照顺序依次考虑之后的每个区间：

- 如果当前区间的左端点在数组`merge`中最后一个区间的右端点之后，那么它们不会重合，可以将当前区间直接放入`merge`数组末尾；
- 否则，它们重合，取`max(当前区间的右端点, merge数组最后一个区间的右端点)`来更新`merge`数组最后一个区间的右端点的值。

版本一：

```java
class Solution {
    public int[][] merge(int[][] intervals) {
        if (intervals.length == 0) {
            return new int[0][2];  // 创建一个长度为 0 的二维数组，但显式声明第二维长度为 2。
        }
        Arrays.sort(intervals, new Comparator<int[]>() {
            public int compare(int[] interval1, int[] interval2) {
                return interval1[0] - interval2[0];
            }
        });
        List<int[]> merged = new ArrayList<int[]>();
        for (int i = 0; i < intervals.length; ++i) {
            int L = intervals[i][0], R = intervals[i][1];
            if (merged.size() == 0 || merged.get(merged.size() - 1)[1] < L) {
                merged.add(new int[]{L, R});
            } else {
                merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], R);
            }
        }
        return merged.toArray(new int[merged.size()][]);
    }
}
```

版本二：

```java
class Solution {
    public int[][] merge(int[][] intervals) {
        Arrays.sort(intervals, (p, q) -> p[0] - q[0]); // 按照左端点从小到大排序
        List<int[]> ans = new ArrayList<>();
        for (int[] p : intervals) {
            int m = ans.size();
            if (m > 0 && p[0] <= ans.get(m - 1)[1]) { // 可以合并
                ans.get(m - 1)[1] = Math.max(ans.get(m - 1)[1], p[1]); // 更新右端点最大值
            } else { // 不相交，无法合并
                ans.add(p); // 新的合并区间
            }
        }
        return ans.toArray(new int[ans.size()][]);
    }
}
```

上述代码中的 return 语句为什么不直接返回 ans？

因为要求返回：`int[][]`（一个二维数组）。`ans` 是一个 `List<int[]>`（一个列表，里面装着数组）。在 Java 中，`List` 和 `Array` 是两种完全不同的数据结构，它们不能直接互换或自动转换。

因此需要通过`ans.toArray(new int[ans.size()][])`转换类型。

- **创建新空间**：它在堆内存中开辟了一块新的、连续的内存空间，专门用于存放原生数组 (`int[][]`)。
- **复制数据**：它将 `List` 中存储的每一个 `int[]` 引用的地址，逐个复制到新的数组中。

### 和为 k 的子数组

[560. 和为 K 的子数组 - 力扣（LeetCode）](https://leetcode.cn/problems/subarray-sum-equals-k/description/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/5/1

**题目描述**

```
给你一个整数数组 nums 和一个整数 k ，请你统计并返回该数组中和为 k 的子数组的个数。
子数组是数组中元素的连续非空序列。

示例 1：
输入：nums = [1,1,1], k = 2
输出：2

示例 2：
输入：nums = [1,2,3], k = 3
输出：2
 
提示：
1 <= nums.length <= 2 * 10^4
-1000 <= nums[i] <= 1000
-10^7 <= k <= 10^7
```

**题目解析**

解法一：暴力解法

因为找的是数组中的连续非空序列，那么将每个元素可视为该序列的起点，然后依次加上后面的元素，若和等于 k，那么子数组的个数加 1。然后，选择 nums 中的下一个元素作为起点，依次继续求和。

```java
public int subarraySum(int[] nums, int k) {
    int count = 0;
    for (int start = 0; start < nums.length; ++start) {
        int sum = 0;
        for (int cur = start; cur < nums.length; cur++) {
            sum += nums[cur];
            if (sum == k) {
                count++;
            }
        }
    }
    return count;
}
```

解法二：前缀和 + 哈希表

前缀和指的是对于一个数组 nums = [1, 2, 3, 4]，它的前缀和数组为 [1,  3, 6, 10]。即数组序列的前 n 项和。

定义 `pre[i]` 为 `[0..i]` 里所有数的和，则 `pre[i]` 可以由 `pre[i−1]` 递推而来，即：`pre[i]=pre[i−1]+nums[i]`
那么 `[j..i] 这个子数组和为 k` 这个条件我们可以转化为 `pre[i]−pre[j−1]==k`
简单移项可得符合条件的下标 `j` 需要满足 `pre[j−1]==pre[i]−k`。所以我们考虑以 `i` 结尾的和为 `k` 的连续子数组个数时只要统计有多少个前缀和为 `pre[i]−k` 的 `pre[j]` 即可。

用哈希表的 key 来存储前缀和的值，用 value 来存储对应的前缀和出现的次数。

简单来说，就是 我们现在已经知道当前遍历到的数对应的前缀和是 `pre[i]`，那么用 `pre[i]-k` 就是我们要找的满足条件的前缀和，这样的前缀和只需要通过查阅哈希表即可获得。

```java
public class Solution {
    public int subarraySum(int[] nums, int k) {
        int count = 0, pre = 0;
        HashMap < Integer, Integer > mp = new HashMap < > ();
        mp.put(0, 1);
        for (int i = 0; i < nums.length; i++) {
            pre += nums[i];
            if (mp.containsKey(pre - k)) {
                count += mp.get(pre - k);
            }
            mp.put(pre, mp.getOrDefault(pre, 0) + 1);
        }
        return count;
    }
}
```

### 对角线遍历

[数组和字符串 - LeetBook - 力扣（LeetCode）全球极客挚爱的技术成长平台](https://leetcode.cn/leetbook/read/array-and-string/cuxq3/)

**时间：**2026/4/10

**题目描述**

```
给你一个大小为 m x n 的矩阵 mat ，请以对角线遍历的顺序，用一个数组返回这个矩阵中的所有元素
```

<img src="D:\Code\Code-Mikle.github.io\src\content\docs\notes\data-structures\leetcode-solutions\assets\diag1-grid.jpg" alt="img" style="zoom:67%;" />

```
输入：mat = [[1,2,3],[4,5,6],[7,8,9]]
输出：[1,2,4,7,5,3,6,8,9]

提示：
m == mat.length
n == mat[i].length
1 <= m, n <= 10^{4}
1 <= m * n <= 10^{4}
-10^{5} <= mat[i][j] <= 10^{5}
```

**题目解析**

矩阵按照对角线进行遍历，矩阵的行数为 m，列数为 n。对于一个矩阵总共有 m+n-1 条对角线。

假设对角线从上到下的编号为 $i \in [0, m+n-1]$。

- 当 i 为偶数时，第 i 条对角线的走向是从下往上遍历；
- 当 i 为奇数时，第 i 条对角线的走向是从上往下遍历。

当第 i 条对角线从下往上遍历时，行索引减 1，列索引加 1，直到矩阵的边缘为止

- 当 $i < m$ 时，对角线遍历的起始点位置为 (i, 0)；
- 当 $i \ge m$ 时，对角线遍历的起始点位置为 (m-1, i - m + 1)；

当第 i 条对角线从上往下遍历时，行索引加 1，列索引减 1，直到矩阵的边缘为止

- 当 $i < n$ 时，对角线遍历的起始点位置为 (0, i)；
- 当 $i \le n$ 时，对角线遍历的起始点位置为 ( i - n + 1, n-1)；

```java
public int[] findDiagonalOrder(int[][] mat) {
    int m = mat.length;
    int n = mat[0].length;
    int[] res = new int[m * n];
    int pos = 0;
    for (int i = 0; i < m + n - 1; i++) {
        if (i % 2 == 1) {
            int x = i < n ? 0 : i - n + 1;
            int y = i < n ? i : n - 1;
            while (x < m && y >= 0) {
                res[pos] = mat[x][y];
                pos++;
                x++;
                y--;
            }
        } else {
            int x = i < m ? i : m - 1;
            int y = i < m ? 0 : i - m + 1;
            while (x >= 0 && y < n) {
                res[pos] = mat[x][y];
                pos++;
                x--;
                y++;
            }
        }
    }
    return res;
}
```

### 零矩阵

[数组和字符串 - LeetBook - 力扣（LeetCode）全球极客挚爱的技术成长平台](https://leetcode.cn/leetbook/read/array-and-string/ciekh/)

**时间：**2026/4/10

**题目描述**

```
编写一种算法，若 M × N 矩阵中某个元素为 0，则将其所在的行与列清零。

示例 1：
输入：
[
  [1,1,1],
  [1,0,1],
  [1,1,1]
]
输出：
[
  [1,0,1],
  [0,0,0],
  [1,0,1]
]

示例 2：
输入：
[
  [0,1,2,0],
  [3,4,5,2],
  [1,3,1,5]
]
输出：
[
  [0,0,0,0],
  [0,4,5,0],
  [0,3,1,0]
]
```

**题目解析**

用 List 数组存储所有的元素为0的坐标，然后依次处理。

也可以用两个 boolean 数组分别记录列和行上是否存在 0 元素。

```java
public void setZeroes(int[][] matrix) {   
    if (matrix.length == 0) return;          
    boolean[] row = new boolean[matrix.length];
    boolean[] col = null;

    if (matrix[0].length != 0) {
        col = new boolean[matrix[0].length];
    }

    for (int i = 0; i < matrix.length; i++) {
        for (int j = 0; j < matrix[0].length; j++) {
            if (matrix[i][j] == 0) {
                row[i] = true;
                col[j] = true;
            }
        }
    }

    for (int i = 0; i < matrix.length; i++) {
        for (int j = 0; j < matrix[0].length; j++) {
            if (row[i] || col[j]) {
                matrix[i][j] = 0;
            }
        }
    }
}
```

上述解法的空间复杂度是 O(m+n)，时间复杂度是 O(mn)。

还有一种解法是用 matrix 的第一列和第一行来作为 flag 记录该行或者该列是否含有 0 元素，如果某列含有 0 元素，那么就将对应的第一行的对应的下标元素置为 0。

### 旋转数组

[数组和字符串 - LeetBook - 力扣（LeetCode）全球极客挚爱的技术成长平台](https://leetcode.cn/leetbook/read/array-and-string/clpgd/)

**时间：**2016/3/17

**题目描述**

```
给你一幅由 N × N 矩阵表示的图像，其中每个像素的大小为 4 字节。请你设计一种算法，将图像旋转 90 度。
不占用额外内存空间能否做到？

示例 1：
给定 matrix = 
[
  [1,2,3],
  [4,5,6],
  [7,8,9]
],

原地旋转输入矩阵，使其变为:
[
  [7,4,1],
  [8,5,2],
  [9,6,3]
]

示例 2：
给定 matrix =
[
  [ 5, 1, 9,11],
  [ 2, 4, 8,10],
  [13, 3, 6, 7],
  [15,14,12,16]
], 

原地旋转输入矩阵，使其变为:
[
  [15,13, 2, 5],
  [14, 3, 4, 1],
  [12, 6, 8, 9],
  [16, 7,10,11]
]
```

**题目解析**

观察旋转前后的矩阵，会发现一个规律，就是变化后的矩阵是将原矩阵的列的顺序反转，然后再取转置的结果。

```java
public void rotate(int[][] matrix) {
        int temp = 0;

        int[] swap_idx = null;
        for (int i = 0, j = matrix.length - 1; i < matrix.length / 2; i++, j--) {
            swap_idx = matrix[i];
            matrix[i] = matrix[j];
            matrix[j] = swap_idx;
        }

        for (int i = 0; i < matrix.length; i++) {
            for (int j = i + 1; j < matrix.length; j++) {
                temp = matrix[i][j];
                matrix[i][j] = matrix[j][i];
                matrix[j][i] = temp;
            }
        }
    }
```

### 寻找数组的中心索引

[数组和字符串 - LeetBook - 力扣（LeetCode）全球极客挚爱的技术成长平台](https://leetcode.cn/leetbook/read/array-and-string/yf47s/)

**时间：**2026/3/12

**题目描述**

```text
给你一个整数数组 nums ，请计算数组的 中心下标 。
数组 中心下标 是数组的一个下标，其左侧所有元素相加的和等于右侧所有元素相加的和。
如果中心下标位于数组最左端，那么左侧数之和视为 0 ，因为在下标的左侧不存在元素。这一点对于中心下标位于数组最右端同样适用。
如果数组有多个中心下标，应该返回 最靠近左边 的那一个。如果数组不存在中心下标，返回 -1 。

示例 1：
输入：nums = [1, 7, 3, 6, 5, 6]
输出：3
解释：
中心下标是 3 。
左侧数之和 sum = nums[0] + nums[1] + nums[2] = 1 + 7 + 3 = 11 ，
右侧数之和 sum = nums[4] + nums[5] = 5 + 6 = 11 ，二者相等。

示例 2：
输入：nums = [1, 2, 3]
输出：-1
解释：
数组中不存在满足此条件的中心下标。

示例 3：
输入：nums = [2, 1, -1] 
输出：0
解释：
中心下标是 0 。
左侧数之和 sum = 0 ，（下标 0 左侧不存在元素），
右侧数之和 sum = nums[1] + nums[2] = 1 + -1 = 0 。
```

**题目解析**

num_i 为当前指向的数组下标，num_l 为 num_i 左边所有元素之和，num_r 为 num_i 右边所有元素之和。

num_i 依次向后遍历，如果 num_l == num_r，则找到中心下标；否则，中心下标不存在。 

```java
class Solution {
    public int pivotIndex(int[] nums) {
        int length = nums.length;
        int L_Sum = 0, R_Sum = 0;
        for (int num : nums) {
            R_Sum += num;
        }

        for (int i = 0; i < length;) {
            R_Sum -= nums[i];
            if (L_Sum == R_Sum) {
                return i;
            } else {
                L_Sum += nums[i];
                i++;
            }
        }

        return -1;
    }
}
```

题解版：

```java
class Solution {
    public int pivotIndex(int[] nums) {
        int sumLeft = 0, sumRight = Arrays.stream(nums).sum();
        for (int i = 0; i < nums.length; i++) {
            sumRight -= nums[i];
            // 若左侧元素和等于右侧元素和，返回中心下标 i
            if (sumLeft == sumRight)
                return i;
            sumLeft += nums[i];
        }
        return -1;
    }
}
```

### 搜索插入位置

[数组和字符串 - LeetBook - 力扣（LeetCode）全球极客挚爱的技术成长平台](https://leetcode.cn/leetbook/read/array-and-string/cxqdh/)

**时间：**2026/3/13

**题目描述**

```
给定一个排序数组和一个目标值，在数组中找到目标值，并返回其索引。如果目标值不存在于数组中，返回它将会被按顺序插入的位置。

示例 1:
输入: nums = [1,3,5,6], target = 5
输出: 2

示例 2:
输入: nums = [1,3,5,6], target = 2
输出: 1

示例 3:
输入: nums = [1,3,5,6], target = 7
输出: 4

提示:
1 <= nums.length <= 10^4
-10^4 <= nums[i] <= 10^4
nums 为无重复元素的升序排列数组
-10^4 <= target <= 10^4
```

**题目解析**

该题目考察的就是二分查找算法。

left、mid、right 分别表示搜索范围最左边的下标、left + right / 2、搜索范围最右边的下标。

```java
class Solution {
    public int searchInsert(int[] nums, int target) {
        int left = 0, right = nums.length - 1, mid = 0;
        while (left <= right) {
            mid = left + (right - left) / 2;
            if (target < nums[mid]) {
                right = mid - 1;
            } else if (target > nums[mid]) {
                left = mid + 1;
            } else {
                return mid;
            }
        }
        return left;
    }
}
```

上述代码还需优化。首先，标准的二分查找算法如下所示：

```java
// 模板一：左闭右闭区间 [left, right]
// 最通用，逻辑直观。当 left == right 时，区间内仍有一个元素需要检查。
public int binarySearch(int[] nums, int target) {
    int left = 0;
    int right = nums.length - 1; // 定义右边界为有效索引

    while (left <= right) { // 当 left > right 时，区间为空，结束
        // 防止 (left + right) 整数溢出，推荐写法
        int mid = left + (right - left) / 2; 

        if (nums[mid] == target) {
            return mid; // 找到目标，返回索引
        } else if (nums[mid] < target) {
            left = mid + 1; // 目标在右半部分，排除 mid
        } else {
            right = mid - 1; // 目标在左半部分，排除 mid
        }
    }
    
    return -1; // 未找到
}

// 左闭右开区间 [left, right)
// 处理范围问题、插入位置问题时非常自然（因为 right 指向的是“下一个”位置）。
public int binarySearch(int[] nums, int target) {
    int left = 0;
    int right = nums.length; // 定义右边界为 length (无效索引)

    while (left < right) { // 当 left == right 时，区间为空
        int mid = left + (right - left) / 2;

        if (nums[mid] == target) {
            return mid;
        } else if (nums[mid] < target) {
            left = mid + 1; 
        } else {
            right = mid; // 注意这里不需要 -1，因为 right 本身就是开区间
        }
    }
    
    return -1; // 未找到
}
```

## 滑动窗口/栈/二分

### 无重复字符的最长子串

滑动窗口

[3. 无重复字符的最长子串 - 力扣（LeetCode）](https://leetcode.cn/problems/longest-substring-without-repeating-characters/description/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/5/1

**题目描述**

```
给定一个字符串 s ，请你找出其中不含有重复字符的最长子串的长度。

示例 1:
输入: s = "abcabcbb"
输出: 3 
解释: 因为无重复字符的最长子串是 "abc"，所以其长度为 3。注意 "bca" 和 "cab" 也是正确答案。

示例 2:
输入: s = "bbbbb"
输出: 1
解释: 因为无重复字符的最长子串是 "b"，所以其长度为 1。

示例 3:
输入: s = "pwwkew"
输出: 3
解释: 因为无重复字符的最长子串是 "wke"，所以其长度为 3。
     请注意，你的答案必须是 子串 的长度，"pwke" 是一个子序列，不是子串。
 
提示：
0 <= s.length <= 5 * 10^4
s 由英文字母、数字、符号和空格组成
```

**题目解析**

使用滑动窗口即可解决该问题，定义两个指针分别为 L 和 R，分别指向滑动窗口的左右边界，即左边界就是子串的开始位置，有边界就是子串的结尾位置。定义 HashMap  occ 来判断是否存在重复字符。定义 res 存放最长子串的长度。

初始时，L 和 R 都指向 0；遍历字符串：

- 如果 R 指向的元素，occ 中没有，那么将该元素放入 occ 中，然后 R++
- 如果 R 指向的元素，occ 中存在，那么 res = max(R - L, res)，并移除 set 最前面的元素，然后 L++，R++

```java
public int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> occ = new HashMap<>();
    int n = s.length();
    int L = 0, R = 0;
    int res = 0;
    while (R < n) {
        char a = s.charAt(R);
        if (occ.containsKey(a) && occ.get(a) >= L) {
            int idx = occ.remove(a);
            L = idx + 1;
        }

        occ.put(a, R);
        res = Math.max(R - L + 1, res);
        R++;

    }
    return res;
}
```

### 滑动窗口最大值（暂时跳过）

[239. 滑动窗口最大值 - 力扣（LeetCode）](https://leetcode.cn/problems/sliding-window-maximum/description/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/5/2

**题目描述**

```
给你一个整数数组 nums，有一个大小为 k 的滑动窗口从数组的最左侧移动到数组的最右侧。你只可以看到在滑动窗口内的 k 个数字。滑动窗口每次只向右移动一位。返回滑动窗口中的最大值。

示例 1：
输入：nums = [1,3,-1,-3,5,3,6,7], k = 3
输出：[3,3,5,5,6,7]
解释：
滑动窗口的位置                最大值
---------------               -----
[1  3  -1] -3  5  3  6  7       3
 1 [3  -1  -3] 5  3  6  7       3
 1  3 [-1  -3  5] 3  6  7       5
 1  3  -1 [-3  5  3] 6  7       5
 1  3  -1  -3 [5  3  6] 7       6
 1  3  -1  -3  5 [3  6  7]      7

示例 2：
输入：nums = [1], k = 1
输出：[1]
 

提示：
1 <= nums.length <= 10^5
-10^4 <= nums[i] <= 10^4
1 <= k <= nums.length
```

**题目解析**



## 链表



## 二叉树



## 回溯/DP

### 最大子数组和

[53. 最大子数组和 - 力扣（LeetCode）](https://leetcode.cn/problems/maximum-subarray/?envType=study-plan-v2&envId=top-100-liked)

时间：2026/5/2

**题目描述**

```
给你一个整数数组 nums，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。
子数组(子数组是数组中非空的连续元素序列)是数组中的一个连续部分。

示例 1：
输入：nums = [-2,1,-3,4,-1,2,1,-5,4]
输出：6
解释：连续子数组 [4,-1,2,1] 的和最大，为 6。

示例 2：
输入：nums = [1]
输出：1

示例 3：
输入：nums = [5,4,-1,7,8]
输出：23
 
提示：
1 <= nums.length <= 10^5
-10^4 <= nums[i] <= 10^4
进阶：如果你已经实现复杂度为 O(n) 的解法，尝试使用更为精妙的 分治法 求解。
```

**题目解析**

求具有最大和的连续子数组，即求以 `nums[i]` 结尾的最大和连续子数组，那么我们可以将以 `nums[i]` 结尾的最大和连续子数组的结果记为 `dp[i]`。状态转移方程可以记为 `dp[i] = max(nums[i], dp[i-1] + nums[i])`。初始值为 `nums[0]`。

```java
public int maxSubArray(int[] nums) {
    int n = nums.length;

    int pre = nums[0];
    int res = nums[0];

    for (int i = 1; i < n; i++) {
        pre = Math.max(nums[i], pre + nums[i]);
        res = Math.max(res, pre);
    }

    return res;
}
```

是否可以去掉上述代码中的 `res = Math.max(res, pre);`？

不可以。因为 `pre` 表示的是以当前 `nums[i]` 结尾的最大连续子数组和，而 `res` 表示的是整个数组中任意连续子数组的最大和。





## 图/堆/手撕







## 专题补充

### 动态规划

动态规划，英文是 **Dynamic Programming，简称 DP**。在 Java 算法题里，它不是某个具体语法，而是一种**解决问题的思想**。

核心就是：把一个大问题拆成很多小问题，先求小问题的答案，再用小问题的答案推出大问题的答案。

**什么时候考虑使用动态规划？**

满足以下两点就可以考虑动态规划了。

- 问题可以拆分为子问题

  比如斐波那契数列：

  ```
  f(1) = 1
  f(2) = 1
  f(3) = f(2) + f(1)
  f(4) = f(3) + f(2)
  f(5) = f(4) + f(3)
  ```

  要求 `f(5)`，需要先知道 `f(4)` 和 `f(3)`。

  这就是大问题依赖小问题。

- 子问题会重复出现

  比如递归求斐波那契：

  ```
  f(5)
  = f(4) + f(3)
  = f(3) + f(2) + f(2) + f(1)
  ```

  你会发现 `f(3)`、`f(2)` 会被反复计算。

  动态规划的做法就是：把已经算过的结果存起来，后面直接用。

**解题四步**

- **定义 dp 数组含义**

  示例如下：

  ```
  dp[i] 表示走到第 i 阶楼梯的方法数
  
  dp[i] 表示以 nums[i] 结尾的最大子数组和
  
  dp[i][j] 表示字符串 s 的前 i 个字符和字符串 t 的前 j 个字符的某种状态
  ```

- 写状态转移方程

  当前状态怎么由之前的状态推出来

  例如爬楼梯问题：

  每次可以爬 1 阶或 2 阶。

  要到第 i 阶，只可能从：

  ```
  第 i - 1 阶爬 1 阶上来
  第 i - 2 阶爬 2 阶上来
  ```

  所以：

  ```
  dp[i] = dp[i - 1] + dp[i - 2]
  ```

- **初始化**

  比如：

  ```
  dp[1] = 1
  dp[2] = 2
  ```

  因为：

  ```
  到第 1 阶：1 种方法
  到第 2 阶：2 种方法
  ```

- **确定遍历顺序**

  一般是一维 DP 从左到右：

  ```java
  for (int i = 2; i <= n; i++) {
      ...
  }
  ```

  二维 DP 通常是双层循环：

  ```java
  for (int i = 1; i <= m; i++) {
      for (int j = 1; j <= n; j++) {
          ...
      }
  }
  ```


### 数组

```java
// 多个变量赋值
int a = 0, b = 1; // 不支持 int a, b = 0, 1;

// 一维数组
// 静态初始化
int[] numbers = {1, 2, 3, 4, 5};
// 动态初始化
int[] scores = new int[5];
// 动态初始化并赋值
int[] data = new int[]{1, 2, 3, 4, 5};

// 二维数组
// 静态初始化
int[][] p = {{1, 2, 3}, {4, 5, 6}};
// 动态初始化
int[][] p = new int[2][3];
// 动态初始化并赋值
int[][] p = new int[][]{
                {1, 2, 3},
                {4, 5, 6},
                {7, 8, 9}
        };


// 遍历数组
// 传统 for
for (int i = 0; i < nums.length; i++) {...}
// 增强 for
for (int num : nums) {...}
```





