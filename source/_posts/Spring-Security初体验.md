---
title: Spring - Security初体验 
date: 2021-06-09 21:31:54 
tags: [SpringBoot,SpringSecurity]
categories: java 
abbrlink: SpringSecurity01 
cover: https://z3.ax1x.com/2021/05/28/2FLfv6.jpg
top_img: transparent
---

### 入门案例

引入SpringSecurity依赖

```java
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

编写一个Controller测试

```java
package com.constxin.security01.Controller;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/test")
public class TestController {

    @GetMapping("hello")
    public String hello(){
        return "hello 权限管理";
    }
}
```

当我们访问**localhost:8080/test/hello**，会跳转到**localhost:8080/login**要求登陆后才可以访问。

默认用户名：**user**，默认密码：控制台随机生成。登陆成功后，页面访问成功。

### 基本原理

#### 典型过滤器

SpringSecurity 本质是一个**过滤器链**

代码底层流程：重点是这三个过滤器

- FilterSecurityInterceptor：方法级权限过滤器，基本位于过滤链**底部**

- ExceptionTranslationFilter：异常过滤器，处理认证授权过程中的**异常**

- UsernamePasswordAuthenticationFilter：对**/login**的POST请求拦截，校验用户名密码

#### 典型接口

- UserDetailsService：查询数据库用户名和密码的过程
- PasswordEncode：密码加密

源码剖析，暂无。





