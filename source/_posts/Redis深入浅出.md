---
title: 玩转Redis深入浅出 
date: 2021-05-22 17:16:58 
tags: [redis,缓存]
abbrlink: redis 
categories: data 
cover: https://z3.ax1x.com/2021/05/28/2FLUCn.jpg
top_img: transparent
---

#### 启动Redis

```bash
redis-server      # 启动
redis-cli -p 6379 # 登陆
```

#### RedisKey基本命令

```bash
keys * # 查询所有
set [key] [value] # 添加一对键值
exists [key] # 键是否存在
move [key] [number] # 删除[number]个[key]
get [key] # 获取值
expire [key] [time] # 设置[key]过期时间[time]秒
ttl [key] # 查询[key]几秒后被删除
type [key] # 查询[key]类型
```

#### String

```bash
append [key] [value] # 往[key]后面添加[value]
strlen [key] # 获取[key]长度

incr [key] # [key]自增1
decr [key] # [key]自减1
incrby [key] [t] # [key]增加[t]
decrby [key] [t] # [key]减少[t]

getrange [key] [a] [b] # 获取[key]从[a,b]区间值，b=-1等于取到尾部
setrange [key] [a] [value] # 修改[key]从[a]开始后面的值为[value]

setex [key] [time] [value] # 设置[key][value]过期时间为[time]
setnx [key] [value] # 如果[key]不存在，则创建[key][value]
mset [key1] [value1] [key2] [value2] # 批量插入多个键值对
mget [key1] [key2] # 批量查询多个值
msetnx [key1] [value1] [key2] [value2] # [keyi]不存在，才批量创建（redis原子性）

set [key]:[id] {key1:value1,key2,value2} # 创建对象(JSON)
mset [key]:[id]:[key1] [value1] [key]:[id]:[key2] [value2] # 创建对象(第二种方法)

getset [key1] [value2] # [key1]存在先输出[value1]再修改为[value2]
```

#### List

在Redis里，List可以玩成、队列、栈、阻塞队列。很神奇的哦

所有的list命令前面都带上l

```bash
lpush [key] [value] # 将[value]左添加进[key]
rpush [key] [value] # 将[value]右添加进[key]
lset [key] [id] [value] # 往[key]的第[id]位置插入[value] (精准插入)
linsert [key] [before/after] [x] [value] # [key]中[x]位置[左/右]插入[value](参照插入)

lrange [key] [a] [b] # 查询[key]从[a,b]的值
lindex [key] [id] # 查询[key]第[id]个值
llen [key] # 查询列表[key]的长度

lpop [key] [n] # 删除[key]左边[n]个值
rpop [key] [n] # 删除[key]右边[n]个值
lrem [key] [n] [value] # 删除[key]中[n]个[value]值
ltrim [key] [a] [b] # 删除[key]中，不在区间[a,b]中的值

rpoplpush [key1] [key2] # 将[key1]的右边第一个移动到[key2]左边
```

#### Set

```bash
sadd [key] [value] # [key]插入[value]
sismember [key] [value] # 判断[key]中是否有[value]

smembers [key] # 获取[key]所有值
scard [key] # 获取[key]的个数

srem [key] [value] # 删除[key]中[value]值
srandmember [key] [n] # 随机抽选[key]中[n]个值
spop [key] # 随机删除[key]中的一个元素

smove [key1] [key2] [value1] # 移动[key1]中[value1]到[key2]中

sdiff [key1] [key2] # 获取[key1][key2]差集
sinter [key1] [key2] # 获取[key1][key2]交集
sunion [key1] [key2] # 获取[key1][key2]并集
```

#### Hash

```bash
hset [id] [key] [value] # [id]中插入键值对[key,vlaue]
hmset [id] [key1] [value1] [key2] [value2] # [id]中批量插入[key1,value1][key2,value2]

hget [id] [key] # 获取[id]中[key]的值
hmget [id] [key1] [key2] # 批量获取[id]中[key1]、[key2]的值
hgetall [id] # 获取所有[keyi][valuei]的值
hkeys [id] # 获取所有[keyi]的值
hvals [id] # 获取所有[valuei]的值
hlen [id] # 获取[id]有多少个键值对

hdel [id] [key] # 删除[id]中的[key]
hdelall [id] # 删除[id]中所有键值

hexists [id] [key] # 判断[id]中[key]是否存在

hincrby [id] [key] [n] # [id]中[key]增加n
hdecrby [id] [key] [n] # [id]中[key]减少n

hsetnx [id] [key] [value] # [id]中[key]不存在，则创建[key,value]
```

#### Zset

```bash
zadd [id] [top] [value] # [id]中插入[value]其优先级为[top]
zadd [id] [top1] [value1] [top2] [value2] # 批量插入
zrange [id] [a] [b] # 获取[id]的[a,b]间的值

zrangebyscore [id] -inf +inf # [id]中的按[top]从小到大排序
zrangebyscore [id] -inf +inf withscores # [id]中的按[top]从小到大排序并带上[top]值
zrevrange [id] [a] [b] # [id]中[a,b]区间按[top]从大到小排序

zrem [id] [value] # 删除[id]中的[value]
zcard [id] # 获取[id]的个数
zcount [id] [a] [b] # 获取[id]在[a,b]之间的个数
```

#### Geospatial

其底层使用`Zset`实现，故相关命令可以参考它。

```bash
geoadd [key] [j] [w] [value] # [key]添加经度[j]维度[w]的城市[value]
geopos [key] [value1] [value2] # 查询[key]中多个城市[valuei]的经纬度
geodist [key] [value1] [value2] [dw] # 查询[key]中[value1]与[value2]的距离，单位[dw]
georadius [key] [j] [w] [r] [dw] # 查询[key]中以[j,w]为中心[r]为半径里的地址，单位[dw]
georadiusbymember [key] [value] [r] [dw] #查询[key]中以[value]为中心[r]为半径里的地址，单位[dw]
```

#### Hyperloglog

> 1、什么是基数？

 A{1,3,5,7,9} B{1,3,5,9,7}

 基数（不重复的元素个数） = 5 ，可以有误差！

> 2、基数统计算法

 可用于网页的UV、PV统计

```bash
pfadd [key] [value1] [value2] # [key]中添加[vlaue1][value2]元素
pfcount [key] # 查询[key]元素个数（自动去重）
pfmerge [key] [key1] [key2] # 将[key1][key2]合并到[key]中
```

#### Bitmaps

> 位存储，适用于两种状态

 统计用户信息，活跃，不活跃；登陆，未登录；

```bash
setbit [key] [id] [0/1] # [key]添加[id]的状态为[0/1]
getbit [key] [id] # 查询[key]中[id]的状态
bitcount [key] # 查询[key]中状态为1的数量
```

#### 事务

> Redis事务没有隔离级别的概率

 ==入队时并没有执行==，只有发起执行命令，才会执行！

> Redis单条命令是`原子性`的，事务不保证`原子性`。

Redis的事务：

- 开启事务（multi）
- 命令入队（命令）
- 执行事务（exec）

> 正常处理事务

```bash
127.0.0.1:6379> MULTI
OK
127.0.0.1:6379(TX)> set k1 v1
QUEUED
127.0.0.1:6379(TX)> set k2 v2
QUEUED
127.0.0.1:6379(TX)> get k2
QUEUED
127.0.0.1:6379(TX)> set k3 v3
QUEUED
127.0.0.1:6379(TX)> exec
1) OK
2) OK
3) "v2"
4) OK
```

> 放弃事务

 中途执行==discard==，则放弃整个队列。

```bash
127.0.0.1:6379> MULTI
OK
127.0.0.1:6379(TX)> set k1 v1
QUEUED
127.0.0.1:6379(TX)> DISCARD
OK
127.0.0.1:6379> get k1
(nil)
```

> 编译性异常（代码问题），事务中所有的命令不会执行

> 运行异常（1/0），语法错误等，其他命令正常运行，此条命令抛出异常



> 监控 Watch

乐观锁：无论什么都不加锁

- 获取version
- 更新时比较version

> Redis监视测试（乐观锁）

 正常情况

```bash
127.0.0.1:6379> set money 100
OK
127.0.0.1:6379> set out 0
OK
127.0.0.1:6379> WATCH money
OK
127.0.0.1:6379> MULTI
OK
127.0.0.1:6379(TX)> DECRBY money 20
QUEUED
127.0.0.1:6379(TX)> INCRBY out 20
QUEUED
127.0.0.1:6379(TX)> exec
1) (integer) 80
2) (integer) 20
```

 错误情况

```bash
127.0.0.1:6379> get money
"80"
127.0.0.1:6379> set money 1000
OK
```

```bash
127.0.0.1:6379> watch money
OK
127.0.0.1:6379> MULTI
OK
127.0.0.1:6379(TX)> DECRBY money 10
QUEUED
127.0.0.1:6379(TX)> INCRBY out 10	# 在这里我们用另一个线程修改了money为1000
QUEUED
127.0.0.1:6379(TX)> exec	# 检测到money被修改，此次事务执行失败
(nil)
```

 如果失败了，使用`unwatch`解锁，并重新加锁。
