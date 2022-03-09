---
layout: post
title: 和大于等于target的最短子数组
date: 2021-08-10 13:54:53
tags: [滑动窗口,动态窗口]
categories: sf
abbrlink: 2VG8Kg
top_img: transparent
cover: https://img.asugar.cn/blog/leetcode.jpg
---

题目直达：[剑指 Offer II 008. 和大于等于 target 的最短子数组](https://leetcode-cn.com/problems/2VG8Kg/)

# 题目

给定一个含有 `n` 个正整数的数组和一个正整数 `target` **。**

找出该数组中满足其和 `≥ target` 的长度最小的 **连续子数组**`[numsl, numsl+1, ..., numsr-1, numsr]` ，并返回其长度**。**如果不存在符合条件的子数组，返回 `0` 。

**示例 1：**

```bash
输入：target = 7, nums = [2,3,1,2,4,3]
输出：2
解释：子数组 [4,3] 是该条件下的长度最小的子数组。
```

**示例 2：**

```
输入：target = 4, nums = [1,4,4]
输出：1
```

**示例 3：**

```
输入：target = 11, nums = [1,1,1,1,1,1,1,1]
输出：0
```

# 思路

这题是最经典的**动态窗口**问题，昨天写的那题是**窗口大小固定**不具有代表性，动态窗口大小才是万能的。下面给出标准模板：

```java
int left = 0, right = 0;
while (right < s.size()) {
    // 增大窗口
    window.add(s[right]);
    right++;
    while (窗口收缩条件) {
        // 缩小窗口
        window.remove(s[left]);
        left++;
    }
}
```
这题的思路是利用动态窗口，枚举`子数组和`大于等于`target`的子数组，每当触发`窗口收缩条件`更新子数组最小长度。

# 代码

```c++
class Solution {
public:
    int minSubArrayLen(int target, vector<int>& nums) {
        int left=0,right=0,res=0,len=nums.size()+1;
        while(right < nums.size()){
            // 增大窗口
            res += nums[right];
            right++;    
            while(res >= target){
                // 触发更新 - 最短长度
                len = min(len,right-left);
                //缩小窗口
                res -= nums[left];
                left++;
            }
        }
        return len>nums.size()?0:len;
    }
};
```

