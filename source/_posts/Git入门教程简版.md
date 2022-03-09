---
layout: post
title: 5h打通Git
date: 2021-08-07 12:31:08
tags: [git]
categories: other
abbrlink: 5hour-git
top_img: transparent
cover: https://i.loli.net/2021/08/07/jR7klLbtYUarGzV.png
---

## Git常用命令

| 命令                                 | 作用           |
| :----------------------------------- | -------------- |
| git config --global user.name 用户名 | 设置用户签名   |
| git config --global user.email 邮箱  | 设置用户签名   |
| git init                             | 初始化本地库   |
| git status                           | 查看本地库状态 |
| git add 文件名                       | 添加暂存区     |
| git commit -m "日志信息" 文件名      | 提交本地库     |
| git reflog                           | 查看历史记录   |
| git reset --hard 版本号              | 版本穿梭       |

### 初始化本地库

```bash
git init
```

### 查看本地库状态

1、首次查看（工作区没有任何文件）

```bash
$ git status
On branch master
No commits yet
nothing to commit (create/copy files and use "git add" to track)
```

2、新增文件（hello.txt）

```bash
$ vim hello.txt
hello asugar！
```

3、再次查看（检测到未追踪文件）

```bash
$ git status
On branch master
No commits yet
Untracked files:
(use "git add <file>..." to include in what will be committed)
	hello.txt
```

### 添加暂存区

1、添加暂存区

```bash
$ git add hello.txt
```

 2、查看状态（检测到暂存区有新文件）

```bash
$ git status
On branch master
No commits yet
Changes to be committed:
(use "git rm --cached <file>..." to unstage)
	new file:   hello.txt
```

### 提交本地库

1、提交本地库

```bash
$ git commit -m "First" hello.txt
[master (root-commit) 0c25030] First
1 file changed, 1 insertion(+)
create mode 100644 hello.txt
```

2、查看状态（没有文件需要提交），刚才已经提交到本地库了

```bash
$ git status
On branch master
nothing to commit, working tree clean
```

### 修改文件

1、修改文件（hello.txt）

```bash
$ vim hello.txt
hello asugar 2
```

2、查看状态（工作区有文件被修改）

```bash
$ git status
On branch master
Changes not staged for commit:
(use "git add <file>..." to update what will be committed)
(use "git restore <file>..." to discard changes in working directory)
	modified:   hello.txt
```

3、将修改的文件再次添加暂存区

```bash
$ git add hello.txt
warning: LF will be replaced by CRLF in hello.txt.
The file will have its original line endings in your working directory
```

4、 查看状态（工作区的修改添加到了暂存区）

```bash
$ git status
On branch master
Changes to be committed:
(use "git restore --staged <file>..." to unstage)
	modified:   hello.txt
```

5、再次提交到本地库

```bash
$ git commit -m "Second" hello.txt
warning: LF will be replaced by CRLF in hello.txt.
The file will have its original line endings in your working directory
[master aad0033] Second
1 file changed, 1 insertion(+), 1 deletion(-)
```

### 历史版本

1、查看版本信息

```bash
# 查看版本信息
$ git reflog
aad0033 (HEAD -> master) HEAD@{0}: commit: Second
0c25030 HEAD@{1}: commit (initial): First

# 查看详细版本信息
$ git log
commit aad003348d81400cfd992f948c3b0eacbe9a8f70 (HEAD -> master)
Author: asugar <xingly@88.com>
Date:   Sat Aug 7 13:29:37 2021 +0800
    Second

commit 0c250302315518e52b59bb66a2697ce385ecd33a
Author: asugar <xingly@88.com>
Date:   Sat Aug 7 13:23:11 2021 +0800
    First
```

2、版本穿梭

```bash
# 找到版本号
$ git reflog
aad0033 (HEAD -> master) HEAD@{0}: commit: Second
0c25030 HEAD@{1}: commit (initial): First

# 切换第一次提交的版本
$ git reset --hard 0c25030
HEAD is now at 0c25030 First

# 查看版本信息 - 成功切换了
$ git reflog
0c25030 (HEAD -> master) HEAD@{0}: reset: moving to 0c25030
aad0033 HEAD@{1}: commit: Second
0c25030 (HEAD -> master) HEAD@{2}: commit (initial): First

# 查看hello.txt文件
$ cat hello.txt
hello asugar
```

## Git分支操作

| 命令名称            | 作用                   |
| ------------------- | ---------------------- |
| git branch          | 创建分支               |
| git branch -v       | 查看分支               |
| git checkout 分支名 | 切换分支               |
| git merge 分支名    | 指定分支合并到当前分支 |

### 查看分支

```bash
$ git branch -v
* master 0c25030 First
```

### 创建分支

```bash
# 创建分支
$ git branch hot-fix

# 查看分支
$ git branch -v
  hot-fix 0c25030 First
* master  0c25030 First
```

### 切换分支

1、切换到hot-fix分支，并修改hello.txt文件

```bash
# 切换到hot-fix分支
$ git checkout hot-fix

# 修改hello.txt
$ vim hello.txt
hello asugar hot-fix

# 提交暂存区和本地库
$ git add hello.txt
$ git commit -m "hot-fix" hello.txt

# 切换回master分支,hello.txt没有被改变
$ git checkout master
$ cat hello.txt
hello asugar
```

### 合并分支

```bash
# 将hot-fix分支合并到master
$ git merge hot-fix

# hello.txt被改变
$ cat hello.txt
hello asugar hot-fix
```

### 产生冲突

​	两个分支在==同一个文件的同一个位置==有两套不同的修改，Git无法决定使用哪一个，必须==人为决定==。

1、模拟产生冲突

```bash
# 修改hello.txt（master分支）
$ vim hello.txt
hello asugar
master test

# 提交暂存区和本地库（master分支）
$ git add hello.txt
$ git commit -m "master test" hello.txt

### 切换到hot-fix分支 ### 
git checkout hot-fix

# 修改hello.txt（hot-fix分支）
$ vim hello.txt
hello asugar
hot-fix test

# 提交暂存区和本地库（hot-fix分支）
$ git add hello.txt
$ git commit -m "hot-fix test" hello.txt

# 此时两个分支都对hello.txt进行了修改
```

2、进行合并

```bash
# hot-fix合并到master分支
$ git merge hot-fix
Auto-merging hello.txt
CONFLICT (content): Merge conflict in hello.txt
Automatic merge failed; fix conflicts and then commit the result.

# 提示合并失败
```

### 解决冲突

1、编辑冲突的文件，删除特殊符号，决定要使用的内容

2、提交本地库==不需要加上文件名==

```bash
# 编辑冲突文件
$ vim hello.txt
hello asugar	# 相同内容
<<<<<<< HEAD
master test		# master分支内容
=======
hot-fix test	# hot-fix分支内容
>>>>>>> hot-fix

# 想保存啥，留下啥
hello asugar
master test
hot-fix test

# 添加暂存区
$ git add hello.txt

# 提交本地库
$ git commit -m "merge master/hot-fix"

# 查看hello.txt
$ cat hello.txt
hello asugar
master test
hot-fix test
```

## GitHub 操作

| 命令名称                           | 作用                                 |
| ---------------------------------- | ------------------------------------ |
| git remote -v                      | 查看当前所有远程地址别名             |
| git remote add                     | 添加别名                             |
| git push 别名 分支                 | 本地推送远程仓库                     |
| git clone 远程地址                 | 远程仓库克隆本地                     |
| git pull 远程库地址别名 远程分支名 | 远程仓库的最新分支拉取与本地分支合并 |

### SSH免密登录

1、生成公钥私钥

2、家目录下，复制 id_rsa.pub 文件内容，登录 GitHub，点击头像→Settings→SSH

```bash
$ ssh-keygen -t rsa -C xiaoheikeji@vip.qq.com
```
