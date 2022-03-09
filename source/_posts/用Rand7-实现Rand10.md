---
layout: post
title: 用Rand7()实现Rand10()
date: 2021-09-05 20:37:47
tags: [概率论,方糖算法]
categories: sf
abbrlink: implement-rand10-using-rand7
top_img: transparent
cover: https://img.asugar.cn/asugar/sf.jpg
---

## 题目直达：[470. 用 Rand7() 实现 Rand10()](https://leetcode-cn.com/problems/implement-rand10-using-rand7/)

# 题目

已有方法 `rand7` 可生成 1 到 7 范围内的均匀随机整数，试写一个方法 `rand10` 生成 1 到 10 范围内的均匀随机整数。不要使用系统的 `Math.random()` 方法。

**示例 1:**

```
输入: 1
输出: [7]
```

**示例 2:**

```
输入: 2
输出: [8,4]
```

**示例 3:**

```
输入: 3
输出: [8,1,10]
```

# 思路

- 公式一：`(rand_X - 1) × Y + rand_Y ==> 可以等概率的生成[1, X*Y]范围的随机数`
- 公式二：`rand_N中N是x的倍数，那么rand_N就可以实现rand_x`

回归本题，要想实现`rand_10`就得实现`rand_N且N是大于10的倍数`，然后通过`rand_N % 10 + 1`实现

通过公式一我们可以实现`rand_49`

```c++
(rand_7 - 1) x 7 + rand_7 = rand_49
```

但是他不是`10`的倍数啊！！！，我们采用`拒绝采样`,如果采样结果不在范围内，那我们就抛弃他：

```c++
class Solution extends SolBase {
    public int rand10() {
        while(true) {
            int num = (rand7() - 1) * 7 + rand7(); // 等概率生成[1,49]范围的随机数
            if(num <= 40) return num % 10 + 1; // 拒绝采样，并返回[1,10]范围的随机数
        }
    }
}
```

我们还可以进行优化，我没看到懂QAQ

```c++
class Solution extends SolBase {
    public int rand10() {
        while(true) {
            int a = rand7();
            int b = rand7();
            int num = (a-1)*7 + b; // rand 49
            if(num <= 40) return num % 10 + 1; // 拒绝采样
            
            a = num - 40; // rand 9
            b = rand7();
            num = (a-1)*7 + b; // rand 63
            if(num <= 60) return num % 10 + 1;
            
            a = num - 60; // rand 3
            b = rand7();
            num = (a-1)*7 + b; // rand 21
            if(num <= 20) return num % 10 + 1;
        }
    }
}
```

# 总结

主要记两个公式
