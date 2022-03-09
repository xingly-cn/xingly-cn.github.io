---
title: SpringBoot - 登录&拦截器 
date: 2021-05-04 21:38:30 
tags: [SpringBoot,拦截器]
abbrlink: login-stem 
categories: java 
cover: https://z3.ax1x.com/2021/05/28/2FLfv6.jpg
top_img: transparent
---

登陆实现，以及遇到的一些常规问题解决。如表单重复提交，未登录访问等。

<!-- more-->

#### **1 ）、登陆前的操作**

 假设这里有一个Form表单，Post请求方式，提交后跳转到 `后端Controller层的/login方法`

来验证是否账户密码正确。[未连数据库]

```html
<form th:href="@{/login}" method="post">
   <button type="submit">Sign in</button>
</form>
```

 编写Controller的 login方法：如果账户不为空且密码为123456即登陆成功，令其跳转到dashboard.html

否则跳回登陆页面。

```java
@Controller
public class loginController {
    @PostMapping("/login")
    public String login(@RequestParam("username") String username, @RequestParam("password") String password, Map<String,Object> mp){
        if(StringUtils.isEmpty(username) && "123456".equals(password)){
            return "dashboard";
        }else{
            mp.put("error","账号或密码错误！");			// 登陆失败告知，用于前端获取错误信息
            return "login";
        }
    }
}
```

#### **2 ）、防止表单重复提交（F5)**

 重定向可以有效地解决表单重复提交问题。

在前面我们讲过，拓展MVC的视图映射功能，增加一个`/dash.html`跳转到`登陆成功后的dashboard页面`

```java
registry.addViewController(("/dash.html")).setViewName("dashboard");
```

然后更改Controller的login方法，改成重定向到`/dash.html`，然后`/dash.html`会跳转到目标页面`dashboard`

```java
return "redirect:/dash.html";   // 原先是dashboard
```

#### **3 ）、防止用户未登录直接访问**

 现在问题又来了，上文说到我们为了`防止表单提交`，采用重定向解决。用`/dash.html`中转跳到`dashboard`，见下图。

![登陆实现+拦截器](https://i.loli.net/2021/05/04/2se7hdUn9gVGlC4.png)

 我们清晰地发现，如果用户直接`调用/main`，就直接重定向到`dashboard`，那么我们的登陆验证就失效了！

**解决方案**：我们可以用将用户`登陆成功`的信息（账号密码），存入session中，再从后台调用拦截器登录检查获取session。如果没有获取到信息，则说明是用户直接访问`/main`实现的进入`dashboard`
，所以我们得拦截操作。反之，用户是经过`login`方法正常登陆进入`dashboard`。

1. 登录成功后，当用户名写入session

   ```java
   public String login(@RequestParam("username") String username, @RequestParam("password") String password, Map<String,Object> mp, HttpSession httpSession){
       if(!StringUtils.isEmpty(username) && "123456".equals(password)){
           httpSession.setAttribute("data",username);		// 这里实现的
           return "redirect:/dash.html";  
       }else{
           mp.put("error","账号或密码错误！");
           return "login";
       }
   }
   ```

2. 拓展MVC功能，拦截器

   ```java
   public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
       Object data = request.getSession().getAttribute("data");
       if(data != null){
           // 已登录，放行
           return true;
       }else {
           // 未登录，返回登录页
           request.setAttribute("error","请登录后操作！");
           request.getRequestDispatcher("/index.html").forward(request, response);
           return false;
       }
   }
   ```

   3.实现这个拦截器，除了`登录页面及请求`，其他的一律经过拦截器审查。

   ```java
   @Override
   public void addInterceptors(InterceptorRegistry registry) {
       registry.addInterceptor(new loginHandlerInterceptor()).addPathPatterns("/**").excludePathPatterns("/index.html","/","/login");
   }
   ```