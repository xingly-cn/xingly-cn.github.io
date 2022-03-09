---
title: SpringBoot-如何用好日志？ 
date: 2021-05-02 16:06:20 
tags: [SpringBoot,日志]
categories: java 
abbrlink: log-use 
cover: https://z3.ax1x.com/2021/05/28/2FLfv6.jpg
top_img: transparent
---

Springboot的SLF4j使用方法，深入浅出。

<!-- more -->

### 1. 如何写日志？

1. 1导包

```java
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
```

1. 2用法

```java
// 定义 日志记录器
Logger logger = LoggerFactory.getLogger(getClass());
@Test
void contextLoads() {	// 日志级别从低--->高
    logger.trace("跟踪轨迹");
    logger.debug("调试信息");
    logger.info("提示信息");
    logger.warn("警告信息");
    logger.error("错误信息");
}
```

1. 3输出

![image-20210502161059111](https://i.loli.net/2021/05/02/At5pg4WwVHoFzKm.png)

### 2. 调整日志级别

```properties
logging.level.com.xiner = trace
```

![image-20210502161422753](https://i.loli.net/2021/05/02/DNaYqRiG7k4n51M.png)

### 3. 日志输出

输出到当前目录，名为Spring.log

```properties
logging.file.name = 【这里可以加上绝对路径】/Spring.log
```

