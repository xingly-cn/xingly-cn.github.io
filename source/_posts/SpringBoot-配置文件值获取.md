---
title: SpringBoot - 配置文件值获取 
date: 2021-05-01 19:29:53 
tags: [SpringBoot,配置文件]
categories: java 
abbrlink: SpringBoot-Config 
cover: https://z3.ax1x.com/2021/05/28/2FLfv6.jpg
top_img: transparent
---

@ConfigurationProperties配置文件值获取

<!-- more -->

### 初体验

首先创建一个bean，里面定义一些类

然后用**配置文件**给这些类**赋值**并打印查看效果

![image-20210501190939889](https://i.loli.net/2021/05/01/YeoGVL6gmu9qWPy.png)

### 配置文件写值

配置文件里写入以下代码

```yaml
person:
  MyName: Xiner
  age: 18
  isBoss: true
  birth: 2021/12/12
  mp: {k1: v1,k2: v2}
  lists:
    - 学习
    - SpringBoot
  dog:
    Dname: 小狗
    age: 66

```

类加上如下代码

```java
@Component
// 此类使用配置文件中的person
@ConfigurationProperties(prefix = "person")
```

![image-20210501192428448](https://i.loli.net/2021/05/01/LTFeaRzf6PmBAlw.png)

### 测试输出

![image-20210501192611953](https://i.loli.net/2021/05/01/BC3tzZNSsTgxQrW.png)

测试成功，类成功输出值

![image-20210501192704309](https://i.loli.net/2021/05/01/bcmZj17gvOrDkw6.png)

