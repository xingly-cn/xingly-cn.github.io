---
title: SpringBoot - 全面接管MVC 
date: 2021-05-03 15:48:35 
tags: [SpringBoot,SpringMVC,自动配置]
categories: java 
abbrlink: SpringMVC-AutoConfig 
cover: https://z3.ax1x.com/2021/05/28/2FLfv6.jpg
top_img: transparent
---

SpringBoot 提供的 Spring MVC，实现全面接管。

<!--more-->

### 拓展SpringMVC

#### 视图映射

编写一个配置类（`@Configuration`）实现`视图映射`，是`WebMvcConfigurer`类型，不能标注`@EnableWebMvc`

```java
@Configuration
public class MyMvcConig implements WebMvcConfigurer {
    /**重写视图映射**/
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        //当访问/xiao ---> 跳转到 success.html
        registry.addViewController("/xiao").setViewName("success");
    }
}
```

原理：

 1 ）、WebMvcConfigurer是SpringMVC的自动配置类

 2 ）、容器中的所有配置类WebMvcConfigurer都会起作用（自动+拓展）

**总结：“拓展是既保留SpringMVC的所有自动配置，也能用自己拓展的功能。”**

### 全面接管SpringMVC

配置类中加入`@EnableWebMvc`，即禁用自动配置

添加后，你会**发现所有配置失效**，例如一些**静态资源（webjars）**等访问失败。

```java
@EnableWebMvc中有一个方法，检测到当容器中没有这个组件，自动配置类才生效
当添加了@EnableWebMvc后，组件添加到容器中，自动配置类不生效。
```

**总结：“接管仅保留自己拓展的功能，自动配置被禁用。”**

### 如何修改SpringBoot默认配置

1 ）、SpringBoot配置许多组件时，如果容器中有**用户配置的**，就使用用户的配置。没有则自动配置。

 有些组件可以有多个（ViewResolver），那么就是 用户配置 + 自动配置**组合使用**。

2 ）、SpringBoot中有许多xxxConfigurer帮助我们拓展，详情见拓展MVC。