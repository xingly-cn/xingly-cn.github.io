---
title: SpringBoot - Mybatis注解版 
date: 2021-05-13 11:16:05 
tags: [Mybatis,数据库]
categories: java 
abbrlink: mybatis-zj 
cover: https://z3.ax1x.com/2021/05/28/2FLfv6.jpg
top_img: transparent
---

Mybatis 注解版 实现对数据库的增删改查。

<!-- more -->

### 1、数据库实体类

我们的数据库里有两张表`Department`、`Employee`员工部门，和员工信息。

并生成对应的get、set方法

```java
package com.xiner.mybatis07.bean;

public class Department {
    private Integer id;
    private String departmentName;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }
}
```

```java
package com.xiner.mybatis07.bean;



public class Employee {
    private Integer id;
    private String lastName;
    private Integer gender;
    private String email;
    private Integer dId;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Integer getGender() {
        return gender;
    }

    public void setGender(Integer gender) {
        this.gender = gender;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getdId() {
        return dId;
    }

    public void setdId(Integer dId) {
        this.dId = dId;
    }
}
```

### 2、Mapper层

编写一个接口`DepartmentMapper`，实现增删改查功能。

```java
package com.xiner.mybatis07.mapper;
import com.xiner.mybatis07.bean.Department;
import org.apache.ibatis.annotations.*;
// 这是操作数据库的Mapper

@Mapper
public interface DepartmentMapper {
    @Select("select * from department where id = #{id}")
    public Department getDeptById(Integer id);

    @Delete("delete from department where id = #{id}")
    public int deleteDeptById(Integer id);

    @Insert("insert into department(departmentName) values(#{departmentName})")
    public int insertDept(Department department);

    @Update("update department set departmentName = #{departmentName} where id = #{id}")
    public int updateDept(Department department);
}
```

### 3、Controller层

简化Service层，直接调用将Mapper注入

```java
 @Autowired
 DepartmentMapper departmentMapper;
```

直接将数据返回到页面。

```java
package com.xiner.mybatis07.controller;

import com.xiner.mybatis07.bean.Department;
import com.xiner.mybatis07.mapper.DepartmentMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DeptController {
    @Autowired
    DepartmentMapper departmentMapper;

    @GetMapping("/dept-select/{id}")
    public Department getDepartment(@PathVariable("id") Integer id){
        return departmentMapper.getDeptById(id);
    }

    @GetMapping("/dept-insert")
    public Department insertDepartment(Department department){
        departmentMapper.insertDept(department);
        return department;
    }

    @GetMapping("/dept-delete/{id}")
    public int deleteDepartment(@PathVariable("id") Integer id){
        return departmentMapper.deleteDeptById(id);
    }

    @GetMapping("/dept-update")
    public Department updateDepartment(Department department){
        departmentMapper.updateDept(department);
        return department;
    }

}
```

### 4、总结

![image-20210513115154246](https://i.loli.net/2021/05/13/jJxNlqgDBdaiLzA.png)