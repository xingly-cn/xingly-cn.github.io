---
title: SpringBoot - Druid&数据源监控 
date: 2021-05-11 21:48:20 
tags: [jdbc,数据库,监控]
categories: java 
abbrlink: druid 
cover: https://z3.ax1x.com/2021/05/28/2FLfv6.jpg
top_img: transparent
---

Druid - 数据源监控 & 操作数据库

<!-- more-->

### 1、配置文件

```yaml
spring:
  datasource:
    username: root
    password: 123456
    url: jdbc:mysql://121.89.163.136:3306/hello
    driver-class-name: com.mysql.cj.jdbc.Driver
    type: com.alibaba.druid.pool.DruidDataSource

    initialSize: 5
    minIdle: 5
    maxActive: 20
    maxWait: 60000
    timeBetweenEvictionRunsMillis: 60000
    minEvictableIdleTimeMillis: 300000
    validationQuery: SELECT 1 FROM DUAL
    testWhileIdle: true
    testOnBorrow: false
    testOnReturn: false
    poolPreparedStatements: true
    #   配置监控统计拦截的filters，去掉后监控界面sql无法统计，'wall'用于防火墙
    filters: stat,wall,log4j
    maxPoolPreparedStatementPerConnectionSize: 20
    useGlobalDataSourceStat: true
    connectionProperties: druid.stat.mergeSql=true;druid.stat.slowSqlMillis=500
```

配置完成后，编写Druid配置类。

### 2、配置类

1 ）、将配置文件注入数据源

```java
// 注入mysql的配置
@ConfigurationProperties(prefix = "spring.datasource")
@Bean
public DataSource druid(){
    return new DruidDataSource();
}
```

2 ）、配置Druid监控

- 配置管理后台的Servlet

  这里是注册了一个视图容器，映射`/druid/*`请求

  此外，容器中可以添加一些初始化参数（Map类型）

```java
@Bean
public ServletRegistrationBean statViewServlet(){
    ServletRegistrationBean bean = new ServletRegistrationBean(new StatViewServlet(), "/druid/*");
    Map<String,String> initParams = new HashMap<>();
    initParams.put("loginUsername","admin");
    initParams.put("loginPassword","123456");
    bean.setInitParameters(initParams);
    return bean;
}
```

- 配置监控的Filter

  注册一个Filter，同样可以添加一些初始化参数（Map类型）

```java
@Bean
public FilterRegistrationBean webStatFilter(){
    FilterRegistrationBean bean = new FilterRegistrationBean();
    bean.setFilter(new WebStatFilter());

    Map<String,String> initParams = new HashMap<>();
    initParams.put("exclusions","*.js,*.css,/druid/*");
    bean.setInitParameters(initParams);

    bean.setUrlPatterns(Arrays.asList("/*"));
    return bean;
}
```

### 3、后台

经过上面的步骤，已经可以通过`127.0.0.1:8080/druid`进入后台页面了。

![image-20210511220639543](https://i.loli.net/2021/05/11/QkAGYaHe4h8mvUi.png)

![image-20210511220655980](https://i.loli.net/2021/05/11/EVO257PMpD4gWvt.png)

