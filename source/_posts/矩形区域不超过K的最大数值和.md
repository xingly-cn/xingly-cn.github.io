---
title: 矩形区域不超过K的最大数值和 
date: 2021-04-23 15:51:45 
tags: [前缀和,二分查找]
categories: sf 
abbrlink: maxSumSubmatrix 
cover: https://z3.ax1x.com/2021/05/28/2FXdmT.png
top_img: transparent
---

给你一个 m x n 的矩阵 matrix 和一个整数 k ，找出并返回矩阵内部矩形区域的不超过 k 的最大数值和。

<!-- more -->

#### [363. 矩形区域不超过 K 的最大数值和](https://leetcode-cn.com/problems/max-sum-of-rectangle-no-larger-than-k/)

![image.png](https://pic.leetcode-cn.com/1618906986-JMALHO-image.png)

### 代码

```c++
class Solution {
public:
    // 降低复杂度：m>n 先枚举上下 m<n 先枚举左右
    int maxSumSubmatrix(vector<vector<int>>& matrix, int k) {
        int ans = INT_MIN;
        int m = matrix.size() , n = matrix[0].size(); // m行n列
        for(int i=0;i<m;i++){   // 上边界
            vector<int> sum(n);
            for(int j=i;j<m;j++){   // 下边界
                for(int c=0;c<n;c++){   // 遍历 上->下 列和
                    sum[c]+=matrix[j][c];
                }
                set<int> q{0};    // 每次需要初始化;set内置二分查找
                int t=0;
                for(int v : sum){
                    t+=v;   // 右边界
                    auto temp=q.lower_bound(t-k);    // 左边界
                    if(temp!=q.end()) ans = max(ans,t-*temp);
                    q.insert(t);
                }
            }
        }
        return ans;
    }
};
```

### 思路

选择上边界和下边界，遍历上下边界间的前缀和

从左向右，增加列数找到第一个满足矩阵总和小于k的位置