---
title: Shiro安全框架
date: 2021-07-18 14:28:30 
tags: [shiro,安全框架]
abbrlink: shiro
categories: java
cover: https://img.asugar.cn/blog/shiro.jpg
top_img: transparent
---

#### 引入

先弄三个页面，**index（登陆页面）**，**noauth（未认证页面）**，**success（后台页面）**。

对应的controller

```java
package com.asugar.shiro01.controller;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import javax.servlet.http.HttpServletResponse;

@Controller
public class TestController {
    /***
     * 首页映射
     * @return
     */
    @RequestMapping("/")
    public String index(){
        return "index";
    }

    /**
     * 后台映射
     * @return
     */
    @RequestMapping("/success")
    public String success(){
        return "success";
    }

    /**
     * 重定向到后台映射
     * @return
     */
    @RequestMapping("/login")
    public String login(){
        return "redirect:/success";
    }

    /**
     * 管理员测试
     * @return
     */
    @ResponseBody
    @RequestMapping("/admin/test")
    public String admintest(){
        return "管理员测试";
    }

    /**
     * 用户测试
     * @return
     */
    @ResponseBody
    @RequestMapping("/user/test")
    public String usertest(){
        return "用户测试";
    }

}

```

#### Shiro配置

**MyRealm类**实现用户身份验证，直接继承Realm重写方法，**此时是没有功能的**。

```java
package com.asugar.shiro01.config;
import org.apache.shiro.authc.AuthenticationException;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.realm.Realm;

/***
 * 重写Realm类 - 用户身份验证授权
 */
public class MyRealm implements Realm {

    @Override
    public String getName() {
        return null;
    }

    @Override
    public boolean supports(AuthenticationToken Token) {
        return false;
    }

    @Override
    public AuthenticationInfo getAuthenticationInfo(AuthenticationToken Token) throws AuthenticationException {
        return null;
    }
}
```

**ShiroConfig配置类**需要实现我们自己写的MyRealm

```java
package com.asugar.shiro01.config;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.realm.Realm;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.LinkedHashMap;

/**
 * 核心三个配置
 */
@Configuration
public class ShiroConfig {
    /**
     * 自己写的MyRealm配置注入Bean
     */
    @Bean
    public Realm myReal(){
        return new MyRealm();
    }

    /**
     * 用myReal生成的securityManager注入到Bean
     * @param myReal
     * @return
     */
    @Bean
    public SecurityManager securityManager(Realm myReal){
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager(myReal);
        return securityManager;
    }

    /**
     * 用securityManager生成的filter注入到Bean
     * @return
     */
    @Bean
    public ShiroFilterFactoryBean filter(SecurityManager securityManager){
        ShiroFilterFactoryBean filter = new ShiroFilterFactoryBean();
        filter.setSecurityManager(securityManager);
        filter.setLoginUrl("/");
        filter.setSuccessUrl("/success");
        filter.setUnauthorizedUrl("/noauth");
        LinkedHashMap<String,String> chain = new LinkedHashMap<>();
        chain.put("/login","anon");	//登陆请求，不拦截
        chain.put("/admin/**","authc");
        chain.put("/user/**","authc");
        chain.put("/**","authc");
        filter.setFilterChainDefinitionMap(chain);
        return filter;
    }
}

```

至此，所有页面都无法正常使用，应为没有登陆，都会被跳转到登录页面。

#### 身份认证

**MyRealm类**，上文中说了此时是没有功能的，现在我们来添加一个**身份验证功能**

```java
package com.asugar.shiro01.config;
import org.apache.shiro.authc.*;
import org.apache.shiro.realm.AuthenticatingRealm;
import org.apache.shiro.realm.Realm;

/***
 * 重写Realm类
 * Realm子类AuthenticatingRealm，完成身份验证
 */
public class MyRealm extends AuthenticatingRealm {

    /**
     * 身份认证
     * @param authenticationToken
     * @return
     * @throws AuthenticationException
     */
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken Token) throws AuthenticationException {
        // 获取用户身份令牌
        UsernamePasswordToken token = (UsernamePasswordToken)Token;
        // 获取用户登陆输入的账号,密码由shiro认证，不需要我们操作
        String username = token.getUsername();

        // 验证账号是否正确,实际应该从数据库中获取
        if(!"admin".equals(username) && !"lihua".equals(username)) {
            throw new UnknownAccountException("账号输入错误");
        }else if("lihua".equals(username)){
            throw new LockedAccountException("账号冻结");
        }
        // 返回密码验证对象
        String dbPassword="123456";
        return new SimpleAuthenticationInfo(username,dbPassword,this.getName());
    }
}

```

我们发现**MyRealm类**是通过账号密码进行**身份验证**的，那么这个账号密码从哪里来？

我们得从controller中获得前台传来的账号密码

```java
	/**
     * 登陆成功重定向到后台
     * @return
     */
    @RequestMapping("/login")
    public String login(String username,String password){
        // 获取当前用户对象
        Subject subject = SecurityUtils.getSubject();
        // 如果用户已经登录,直接跳转后台,不用再身份认证
        if(subject.isAuthenticated()) return "redirect:/success";
        // 生成一个包含用户账号密码的token
        UsernamePasswordToken token = new UsernamePasswordToken(username,password);
        // 身份验证
        subject.login(token);
        return "redirect:/success";
    }
```

#### Shiro登陆退出

设置访问**/logout**退出登录，不用再写controller，直接在拦截器里有自带的。

```java
	/**
     * 用securityManager生成的filter注入到Bean
     * @return
     */
    @Bean
    public ShiroFilterFactoryBean filter(SecurityManager securityManager){
        ShiroFilterFactoryBean filter = new ShiroFilterFactoryBean();
        filter.setSecurityManager(securityManager);
        filter.setLoginUrl("/");
        filter.setSuccessUrl("/success");
        filter.setUnauthorizedUrl("/noauth");
        LinkedHashMap<String,String> chain = new LinkedHashMap<>();
        chain.put("/logout","logout");		// 这里实现退出登录
        chain.put("/login","anon");
        chain.put("/admin/**","authc");
        chain.put("/user/**","authc");
        chain.put("/**","authc");
        filter.setFilterChainDefinitionMap(chain);
        return filter;
    }	
```

#### 密码加密1

这里是指从前端传来的密码，被后端加密。

- MD5加密

```java
	public static void main(String[] args) {
        String password = "123456";
        // md5加密
        Object obj = new SimpleHash("MD5",password);
        System.out.printf("md5:"+ obj);
    }
```

- MD5加盐

```java
	public static void main(String[] args) {
        String password = "123456";
        String salt = "#$%$$^";
        // md5加盐加密
        Object obj = new SimpleHash("MD5",password,salt);
        System.out.printf("md5加盐:"+ obj);
    }
```

#### 页面引入Js

使用Thymeleaf引入

```html
<script th:src="@{/js/jquery.js}"></script>
<script th:src="@{/js/jquery.md5.js}"></script>
```

同时不要忘记在**ShiroConfig**，放行<b>/js/**</b>目录下的所有js文件哦

```java
chain.put("/js/**","anon");
```

#### 密码加密2

在**密码加密1**中，前端的密码是没加密，被后端加密，所以中途被截获还是不安全。不如直接在前端加密后再传给后端，省去后端加密同时也保证了安全。

```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <script th:src="@{/js/jquery.js}"></script>
    <script th:src="@{/js/jquery.md5.js}"></script>
</head>
<body>
    <form action="login" method="post" id="loginform">
        账号：<input type="text" name="username"><br>
        密码：<input type="text" id="password"><br>
        MD5: <input type="text" id="md5password" name="password"><br>
        <input type="button" id="loginbtn" value="登陆">
    </form>
<script>
    $(function (){
        $("#loginbtn").bind("click",function (){
            var password = $("#password").val();
            $("#md5password").val($.md5(password));
            $("#loginform").submit();
        })
    })
</script>
</body>
</html>
```

#### 随机盐加密

写一个controller，生成一个随机盐

```java
    /**
     * 获得一个随机盐值
     * @return
     */
    @ResponseBody
    @PostMapping("/getSalt")
    public String getRandSalt(HttpSession session){
        String uuid = UUID.randomUUID().toString();
        String randSalt = DigestUtils.md5DigestAsHex(uuid.getBytes());
        session.setAttribute("randSalt",randSalt);	// 把盐值通过session传入后端
        return randSalt;
    }
```

使用ajax获取**/getSalt**接口的随机盐，对密码md5加盐加密

```html
<script>
    $(function (){
        $("#loginbtn").bind("click",function (){
            $.post("/getSalt","",function (data){
                var password = $("#password").val();
                // 密码md5加密一次，与数据库匹配
                password = $.md5(password);
                // 密码随机盐加密，后台用这个盐对数据库的密码进行盐加密，与前端传入的对比即可
                $("#md5password").val($.md5(data+password));
                $("#loginform").submit();
            },"text")
        })
    })
</script>
```

```java
/***
 * 重写Realm类
 * Realm子类AuthenticatingRealm，完成身份验证
 */
public class MyRealm extends AuthenticatingRealm {

    /**
     * 身份认证
     * @param authenticationToken
     * @return
     * @throws AuthenticationException
     */
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken Token) throws AuthenticationException {
        // 获取用户身份令牌
        UsernamePasswordToken token = (UsernamePasswordToken)Token;
        // 获取用户登陆输入的账号,密码由shiro认证，不需要我们操作
        String username = token.getUsername();

        // 验证账号是否正确,实际应该从数据库中获取
        if(!"admin".equals(username) && !"lihua".equals(username)) {
            throw new UnknownAccountException("账号输入错误");
        }else if("lihua".equals(username)){
            throw new LockedAccountException("账号冻结");
        }
        //得到前台调用/getSalt接口获取的随机盐
        Subject subject = SecurityUtils.getSubject();
        String  randSalt = (String)subject.getSession().getAttribute("randSalt");
        // 返回密码验证对象,随机盐 + 数据库密码（md5） 再经过md5加密，与前台传来的密码匹配
        String dbPassword= "e10adc3949ba59abbe56e057f20f883e";
        dbPassword = new SimpleHash("MD5",dbPassword,randSalt).toString();
        return new SimpleAuthenticationInfo(username,dbPassword,this.getName());
    }
}

```

#### 角色分配

**AuthorizingRealm**比**AuthenticatingRealm**多一个权限控制，所以这里替换一下。

逻辑：**shiro每次判断请求都会执行这个方法，判断当前对象是否有权限访问，所以会重复访问数据库获取权限数据，那我们可以获取完权限后把信息存入session中，但是这样不能得到实时权限，所以当用户权限被更新，需要重新登录**

```java
/***
 * 重写Realm类
 * Realm子类AuthenticatingRealm，完成身份认证
 * Realm子类AuthorizingRealm，完成身份认证和权限分配
 */
public class MyRealm extends AuthorizingRealm {
    /**
     * 身份认证
     * @param authenticationToken
     * @return
     * @throws AuthenticationException
     */
    protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken Token) throws AuthenticationException {
        // 获取用户身份令牌
        UsernamePasswordToken token = (UsernamePasswordToken)Token;
        // 获取用户登陆输入的账号,密码由shiro认证，不需要我们操作
        String username = token.getUsername();

        // 验证账号是否正确,实际应该从数据库中获取
        if(!"admin".equals(username) && !"lihua".equals(username)) {
            throw new UnknownAccountException("账号输入错误");
        }else if("lihua".equals(username)){
            throw new LockedAccountException("账号冻结");
        }
        //得到前台调用/getSalt接口获取的随机盐
        Subject subject = SecurityUtils.getSubject();
        String  randSalt = (String)subject.getSession().getAttribute("randSalt");
        // 返回密码验证对象,随机盐 + 数据库密码（md5） 再经过md5加密，与前台传来的密码匹配
        String dbPassword= "e10adc3949ba59abbe56e057f20f883e";
        dbPassword = new SimpleHash("MD5",dbPassword,randSalt).toString();
        return new SimpleAuthenticationInfo(username,dbPassword,this.getName());
    }

    /**
     * 用户授权
     * @param principalCollection
     * @return
     */
    @Override
    protected AuthorizationInfo doGetAuthorizationInfo(PrincipalCollection principalCollection) {
        // 获取触发权限验证的账号
        String  username = (String) principalCollection.getPrimaryPrincipal();
        // 存放用户角色的set集合
        Set<String> roles = new HashSet<>();
        if("admin".equals(username)) {
            roles.add("admin");
            roles.add("user");
        }else if("lisi".equals(username)){
            roles.add("user");
        }
        // 设置用户角色
        SimpleAuthorizationInfo Info = new SimpleAuthorizationInfo(roles);
        return Info;
    }
}

```

#### 资源分配

是指某些资源只有特定角色可以访问，是角色分配的逆操作。

暂时不需要。

记录：Video-P14

 