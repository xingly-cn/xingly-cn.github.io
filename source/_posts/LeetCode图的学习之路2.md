---
layout: post
title: LeetCode - 图的学习之路（二）
date: 2021-08-26 16:41:01
tags: [图,方糖算法,最短路径]
categories: sf
abbrlink: short-path
top_img: transparent
cover: https://img.asugar.cn/asugar/graph/rquf35.png
---

# 单源最短路径

- 「Dijkstra 」只能解决加权有向图的权重为非负数的「单源最短路径」问题。
- 「Bellman-Ford 」能解决加权有向图中包含权重为负数的「单源最短路径」问题。

## 朴素Dijkstra （邻接矩阵）

配套题目：[743.网络延迟时间](https://leetcode-cn.com/problems/network-delay-time/)

```c++
const int INF = INT_MAX / 2;
// 初始化：邻接矩阵、距离、标记
vector<vector<int>> mp(n,vector<int>(n,INF));   
vector<int> dist(n,INF);   					
vector<int> vis(n);   					

/* 根据题目给的数据，转化成邻接矩阵（适合稠密图） */

// 起点
dist[k-1] = 0;

// dijkstra
for(int i=0; i<n; i++) {   
    // 找到距离最小，且没访问的点
    int x = -1;
    for(int y=0; y<n; y++) {
        if(!vis[y] && (x==-1 || dist[y] < dist[x])) x=y;
    }
    vis[x] = true;
    for(int y=0; y<n; y++) {
        dist[y] = min(dist[y],dist[x] + mp[x][y]);
    }
}

/* 根据题目要求，操作dist[x]=y数组(起点到x的最短 */

```

## Bellman Ford（类 & 邻接表）

配套题目：[743.网络延迟时间](https://leetcode-cn.com/problems/network-delay-time/)

- 定理一：在`N` 个顶点的「非负权环图」中，两点之间的最短路径最多经过 `N-1` 条边
- 定理二：`「负权环」`没有最短路径。

待定
