---
title: Spring - Security用户认证 
date: 2021-06-09 21:31:54 
tags: [SpringBoot,SpringSecurity]
categories: java 
abbrlink: SpringSecurity02 
cover: https://z3.ax1x.com/2021/05/28/2FLfv6.jpg
top_img: transparent
---

### 设置用户名和密码

#### 1 ）、配置文件

```properties
spring.security.user.name=root	// 用户名
spring.security.user.password=constxin	 // 密码
```

![image-20210609220351611](https://i.loli.net/2021/06/09/q1POK8FwZfCsG54.png)

#### 2 ）、配置类

新建一个类，继承**WebSecurityConfigurerAdapter**，重写**configure**方法，设置用户名和密码，并对密码进行加密。

由于加密需要使用上一节的**PasswordEncoder**接口，故得将加入Bean中。但是接口不能new，所以new他的实现类**BCryptPasswordEncoder**加入容器。

```java
package com.constxin.security01.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        // 密码加密
        BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();
        String password = bCryptPasswordEncoder.encode("123456");
        // 设置用户名和密码
        auth.inMemoryAuthentication().withUser("constxin").password(password).roles("admin");
    }
    @Bean	// new出PasswordEncoder的实现类加入容器
    PasswordEncoder password(){
        return new BCryptPasswordEncoder();
    }
}
```

![image-20210609221626370](https://i.loli.net/2021/06/09/LKva1VrmWbg7p4u.png)

#### 3 ）、自定义编写实现类（常用）

1 ）、创建配置类，设置哪个使用UserDetailsService实现类

```java
package com.constxin.security01.Config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityConfig2 extends WebSecurityConfigurerAdapter {
	// 注入UserDetailsService
    @Autowired
    protected UserDetailsService userDetailsService;

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(password());
    }

    // 加密需要的对象
    @Bean
    PasswordEncoder password(){
        return new BCryptPasswordEncoder();
    }
}
```

2 ）、编写Service实现类，返回User对象（包括用户名密码和操作权限）

```java
package com.constxin.security01.Service;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

// 上文就是注入这里的Service，所以名称要相同
@Service("userDetailsService")
public class UserDetails implements UserDetailsService {
    @Override
    public org.springframework.security.core.userdetails.UserDetails loadUserByUsername(String s) throws UsernameNotFoundException {
		// 创建角色列表
        List<GrantedAuthority> auths = AuthorityUtils.commaSeparatedStringToAuthorityList("role");
        // 设置账号密码和角色
        return new User("xiner",new BCryptPasswordEncoder().encode("123456"),auths);

    }
}
```
