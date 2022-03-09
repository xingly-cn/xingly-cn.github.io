---
title: SpringBoot-@ConfigProperties与@Value区别 
date: 2021-05-02 11:00:59 
tags: [SpringBoot,配置文件]
categories: java 
abbrlink: ConfigProperties-Value 
cover: https://z3.ax1x.com/2021/05/28/2FLfv6.jpg
top_img: transparent
---

带你分辨 @ConfigProperties 与 @Value区别

<!--more -->

### @Value

#### 1. 如何使用

![image-20210502152235139](https://i.loli.net/2021/05/02/LmFs9EwfkdlHGUz.png)

在变量上方，@Value（内容）即可注入

```java
// 读取的是properties配置文件
@Value("${person.MyName}")
private String MyName;
@Value("#{18*1}")
private Integer age;
@Value("true")
private boolean isBoos;
```

#### 2. 输出结果

![image-20210502152530603](https://i.loli.net/2021/05/02/TrbKIx9XCWantmL.png)

### @ConfigProperties 与 @Value区别

|                             | @ConfigProperties |  @Value  |
| :-------------------------- | :---------------: | :------: |
| 功能                        |     批量注入      | 单个注入 |
| 松散绑定                    |       支持        |  不支持  |
| Spring表达式                |      不支持       |   支持   |
| JSR303数据校验              |       支持        |  不支持  |
| 复杂类型封装（Map，List等） |       支持        |  不支持  |

#### 使用建议

- 某个业务中需要获取配置文件的某个值，则用@Value
- 专门编写了Bean和配置文件映射，则用@ConfigProperties，一次完成