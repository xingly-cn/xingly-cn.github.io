---
title: SpringBoot - Thymeleaf语法 
date: 2021-05-03 10:51:12 
tags: [SpringBoot,thymeleaf]
categories: java 
abbrlink: use-thymeleaf 
cover: https://z3.ax1x.com/2021/05/28/2FLfv6.jpg
top_img: transparent
---

Thymeleaf是Spring boot推荐使用的模版引擎，直接以html显示，前后端可以很好的分离。

<!-- more-->

### 1.代码提示

添加下方代码，使thymeleaf支持代码提示

```html
<html xmlns:th="http://www.thymeleaf.org">
```

### 2.获取数据

已经在后端定义了一个Map，并添加了数据

我们尝试从**前端**获取这里的数据

```java
// 前端获取这里的数据Map
@RequestMapping("/getMap")
public String success(List<Object> list){
    // 前端可以直接获取这里的Map
    mp.put("hello","xiner");
    // 跳转到templates里的getMap.html
    return "getMap";	
}
```

前端写法：

```html
<h1>获取后端的数据List</h1>
<div th:text="${hello}">
```

前端输出：

![image-20210503110905398](https://i.loli.net/2021/05/03/qAohK9CFLsG7Sxj.png)

### 3.语法规则

- th:任意html属性 --->        替换原生属性值

#### 3.1常用th属性**

1）th:text：文本替换；

2）th:utext：支持html的文本替换。

3）th:value：属性赋值

4）th:each：遍历循环元素

5）th:if：判断条件，类似的还有th:unless，th:switch，th:case

6）th:insert：代码块引入，类似的th:replace，th:include，用于代码块提取的场景

7）th:fragment：定义代码块，方便被th:insert引用

8）th:object：声明变量，一般和*{}一起配合使用，达到偷懒的效果。

9）th:attr：设置标签属性，多个属性可以用逗号分隔

#### 3.2标准表达式

`${...}` 变量表达式，Variable Expressions

`@{...}` 链接表达式，Link URL Expressions

`#{...}` 消息表达式，Message Expressions

`~{...}` 代码块表达式，Fragment Expressions

`*{...}` 选择变量表达式，Selection Variable Expressions