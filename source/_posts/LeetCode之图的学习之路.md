---
layout: post
title: LeetCode - 图的学习之路（一）
date: 2021-08-24 19:10:29
tags: [图,方糖算法,并查集]
categories: sf
abbrlink: leetcode-graph-union-find
top_img: transparent
cover: https://s3.bmp.ovh/imgs/2021/08/d5c18e804aeb5128.png
---

## 并查集（ Union Find ）

如果给你一些顶点(下图)，并且告诉你每个顶点的连接关系，你如何才能快速的找出两个顶点是否具有`连通性`呢？此时我们就需要机智的「并查集」数据结构。当他们的`父节点`相同，则判断他们之间`连通`。

![5. Connected.png](https://i.loli.net/2021/08/24/dfI9wJPi4WjblxN.png)

`「并查集」的主要作用是用来解决网络中的连通性`。这里的「网络」可以是计算机的网络，也可以是人际关系的网络等等。

**「并查集」的两个重要函数**

- `find` 函数：找到给定顶点的根结点（父节点）。

- `union` 函数：合并两个顶点，并将他们的根结点（父节点）保持一致。

**「并查集」的两个实现方式**

- Quick Find 实现方式：它指的是实现「并查集」时，`find` 函数时间复杂度很低为O(1)，但对应的 `union` 函数就需要承担更多的责任，它的时间复杂度为 O(N)。

- Quick Union 实现方式：它指的是实现「并查集」时，相对于 Quick Find 的实现方式，我们通过降低 `union` 函数的职责来提高它的效率，但同时，我们也增加了 `find` 函数的职责。

### Quick Find（可忽略）

- `union` 也就是多了一步，遍历数组。（`只可意会不可言传`）

<video id="video" width="600" height="300" controls="" preload="none">
<source id="mp4" src="https://img.asugar.cn/asugar/graph/Quick%20Find.mp4" type="video/mp4">
</video>

```c++
// Variable
vector<int> root;

// Default
void init(int n) {
	root.resize(n);
	for (int i = 0; i < n; i++) {
		root[i] = i;
	}	
}

// Quick Find
int find(int x) {
	return root[x];
}

// Union
void merge(int x, int y) {
	int X = find(x);
	int Y = find(y);
	if (X != Y) {
		for (int &i : root) {
			if (i == Y) i = X;	
		}
	}
}

// Connect
bool connect(int x, int y) {
	return find(x) == find(y);
}
```

### Quick Union（常规模板）

- `Quick Union`比`Quick Find`更高效

**为什么`Quick Union`比`Quick Find`更高效？**

- 因为`Quick Find`的`union`函数时间复杂度**一定**是O(N)
- 而`Quick Union`的时间复杂度**最坏情况**才是O(N)

<video id="video" width="600" height="300" controls="" preload="none">
<source id="mp4" src="https://img.asugar.cn/asugar/graph/Quick%20Union.mp4" type="video/mp4">
</video>


```c++
// Variable
vector<int> root;

// Default
void init(int n) {
    root.resize(n);
    for (int i = 0; i < n; i++) {
        root[i] = i;
    }
}

// Find
int find(int x) {
    return x==root[x]?x:find(root[x]);
}

// Quick Union
void merge(int x, int y){
    int X = find(x);
    int Y = find(y);
    if (X != Y) {
        root[Y] = X;
    }
}

// Connect
bool connect(int x, int y){
    return find(x) == find(y);
}
```

---

> 从这里开始才是重点

### 合并优化的「并查集」

![1625376674-jbKgQh-5. A Line Graph](https://i.loli.net/2021/08/24/mIh8x3V9NZnLXOp.png)

上面学了两种并查集，但它们都有一个很大的缺点，这个缺点就是通过 `union` 函数连接之后，可能所有顶点连成一条线。这就是我们 `find` 函数在最坏的情况下的样子。那么我们有办法解决吗？

这里的「秩」指的是顶点的`高度`。每次 `union` 两个顶点的时候，将`「秩」大的作为根结点`，这样就避免了所有顶点连成一条线。

<video id="video" width="600" height="300" controls="" preload="none">
<source id="mp4" src="https://img.asugar.cn/asugar/graph/Quick%20Union%20By%20Height.mp4" type="video/mp4">
</video>

```c++
vector<int> root,height;

void init(int n) {	// 初始化高度
	root.resize(n);
	height.resize(n);
	for (int i = 0; i < n; i++) {
		root[i] = i;
		height[i] = 1;	// 初始化节点高度为1
	}
}

// 合并优化
void merge(int x, int y) {
	int X = find(x);
	int Y = find(y);
	if (X != Y) {	// 根据高度选择谁为根结点
		if(height[X] > height[Y]) root[Y] = X;
		else if(height[X] < height[Y]) root[X] = Y;
		else {
			root[Y] = X;
			height[X] += 1;
		}
	}
}
```

### 路径压缩的「并查集」

- 其实就修改了`find`函数，本来是`find(root[x]);`改成`root[x] = find(root[x]);`

```c++
// 剩下的与Quick Union一样
// Find 路径压缩 
int find(int x) {
    return x==root[x]?x:root[x] = find(root[x]); 	// 只修改了这个地方
}
```

### 基于路径压缩的按秩合并优化的「并查集」（标准模板）

```c++
vector<int> root,height;

void init(int n){		// 初始化
    root.resize(n);
    root.resize(n);
    for (int i = 0; i < n; i++){
        root[i] = i;
        height[i] = 1;
    }
}

int find(int x){		// 路径压缩
    return x==root[x]?x:root[x]=find(root[x]);
}

void merge(int x, int y){		// 合并优化
    int rootX = find(x);
    int rootY = find(y);
    if (rootX != rootY){
        if (height[rootX] > height[rootY]){
            root[rootY] = rootX;
        }
        else if (height[rootX] < height[rootY]){
            root[rootX] = rootY;
        }
        else{
            root[rootY] = rootX;
            height[rootX] += 1;
        }
    }
}
```
