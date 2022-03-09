---
title: SpringBoot - 页面国际化 
date: 2021-05-03 18:59:44 
tags: [SpringBoot,国际化]
categories: java 
abbrlink: internation 
cover: https://z3.ax1x.com/2021/05/28/2FLfv6.jpg
top_img: transparent
---

根据**地理位置**为页面适配**国际化语言**。

<!--more-->

### 国际化

1 ）、编写国际化配置文件

![image-20210503190957289](https://i.loli.net/2021/05/03/y3j85HdJhqbZRgD.png)

```properties
login.password=密码
login.remember=记住我
login.sign=登入
login.tip=请登陆
login.username=用户名
```

在配置文件中添加 国际化文件路径

```properties
spring.messages.basename=language.login
```

2 ）、页面获取国际化值

使用**thymeleaf语法**，替换原来的内容

```html
th:text="#{login.tip}"
```

Tip：行间语法使用 **[[语法]]**

此时已经完成，根据浏览器地理位置，自动选择相应的语言。

3 ）、自定义切换语言

页面加入两个按钮（中文，English），点击谁显示谁。

1. 首先，我们让浏览器地址携带国际化值

```html
<a class="btn btn-sm" th:href="@{/index.html(l='zh_CN')}">中文</a>
<a class="btn btn-sm" th:href="@{/index.html(l='en_US')}">English</a>
```

2. 重写区域解析器LocaleResolver

写一个类MyLocaleResolver，接口LocaleResolver。从HttpServletRequest对象中获取参数

并对参数用“_”分块

```java
public class MyLocaleResolver implements LocaleResolver {
    @Override
    public Locale resolveLocale(HttpServletRequest httpServletRequest) {
        Locale locale = Locale.getDefault();
        String l = httpServletRequest.getParameter("l");
        if(StringUtils.isEmpty(l)){
            String[] data = l.split("_");
            locale = new Locale(data[0],data[1]);
        }
        return locale;
    }
    
    @Override
    public void setLocale(HttpServletRequest httpServletRequest, HttpServletResponse httpServletResponse, Locale locale) {

    }
}
```

3. 然后将他加入到容器中

```java
@Bean
public LocaleResolver localeResolver(){
    return new MyLocaleResolver();
}
```