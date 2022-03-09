---
title: Jedis操作Redis 
date: 2021-05-23 13:52:20 
tags: [Jedis,Redis]
categories: java 
abbrlink: jedis 
cover: https://z3.ax1x.com/2021/05/28/2FLEHe.jpg
top_img: transparent
---

### 什么是Jedis？

 Redis官方推荐的Java连接开发工具

### 测试连接

#### 1、Maven导包

```xml
<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>3.2.0</version>
</dependency>
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.62</version>
</dependency>
```

#### 2、编码测试

1、检测是否连接成功、成功则输出`PONG`

```java
public static void main(String[] args) {
    Jedis jedis = new Jedis("127.0.0.1",6379);
    jedis.auth("123456");		//redis设置过密码
    System.out.println(jedis.ping());	
    jedis.close()
}
```

### 事务操作

```java
public static void main(String[] args) {
    // 连接
    Jedis jedis = new Jedis("127.0.0.1",6379);
    jedis.auth("123456");

    // 开始事务
    Transaction multi = jedis.multi();
    try {
        multi.set("name","xiao");
        multi.set("age","18");
        multi.exec();
    } catch (Exception e) {
        // 失败，则放弃事务
        multi.discard();
        e.printStackTrace();
    } finally {
        // 成功输出值，并断开连接
        System.out.println(jedis.get("name"));
        System.out.println(jedis.get("age"));
        jedis.close();
    }
}
```

### SpringBoot整合

说明：SpringBoot2.x后，原来的Jedis被替换成lettuce？这是为什么呢？

Jedis：采用直连，多个线程操作是不安全的，想要避免得使用连接池。BIO模式

leetuce：采用netty，实例可以多线程中共享，线程安全。减少线程数量。NIO模式

#### 整合步骤

1 ）、导入相关依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

2 ）、配置properties

```properties
# redis配置
spring.redis.host=127.0.0.1
spring.redis.port=6379
```

3 ）、测试类运行

```java
@SpringBootTest
class Redis02SpringbootApplicationTests {

    @Autowired
    RedisTemplate redisTemplate;	// 注入redis对象

    @Test
    void contextLoads() {
        redisTemplate.opsForValue().set("name","xiao");
        System.out.println(redisTemplate.opsForValue().get("name"));
    }
}
```

> 如果想传入对象，需要进行==序列化==！

#### RedisTemplate自定义配置

编写一个自己的RedisTemplate，实现了序列化。（直接拿来用，好舒服~）

```java
@Configuration
public class Redis02 {
    @Bean
    @ConditionalOnMissingBean(name = "redisTemplate")
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) throws UnknownHostException {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);
        // Json序列化
        Jackson2JsonRedisSerializer jackson2JsonRedisSerializer = new Jackson2JsonRedisSerializer(Object.class);
        ObjectMapper om = new ObjectMapper();
        om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
        om.enableDefaultTyping(ObjectMapper.DefaultTyping.NON_FINAL);
        jackson2JsonRedisSerializer.setObjectMapper(om);
        //String的序列化
        StringRedisSerializer stringRedisSerializer = new StringRedisSerializer();
        //key采用String序列化
        template.setKeySerializer(stringRedisSerializer);
        //hash的ekey采用String序列化
        template.setHashKeySerializer(stringRedisSerializer);
        //value采用Json序列化
        template.setHashValueSerializer(jackson2JsonRedisSerializer);
        //hash的value采用Json序列化
        template.setHashValueSerializer(jackson2JsonRedisSerializer);
        return template;
    }
}
```

#### Redis.conf详解

> 单位

​    ![image-20210524174101048](https://i.loli.net/2021/05/24/gDVhWIy6fKcljsz.png)

对大小写不敏感。

> 包含

![image-20210524180009487](https://i.loli.net/2021/05/24/LS9Y5BlTFfJjzCU.png)

可以包含多个配置文件。

> 网络

```bash
bind 127.0.0.1 	# 绑定的IP。想让别的IP访问，在这里添加即可
protected-mode yes  # 保护模式
port 6379	# 端口号
```

> 通用配置

```bash
daemonize yes	# 以守护进程运行，默认是NO，需要开启成YES
pidfile /var/run/redis_6379.pid		# 以后台运行，我们需要指定一个pid文件
loglevel notice		# 日志级别
logfile ""	 # 生成日志文件位置名
databases 16	# 默认有16个数据库
always-show-logo no		# 是否显示logo
```

> 快照

持久化，在规定的时间，执行了多少次操作，会持久化到文件 `.rdb`，`.aof`。

Redis是内存数据库，如果没有持久化，断电数据则失去。

```bash
# 如果900s内，至少有1个key修改，持久化操作
save 900 1
# 如果60s内，至少有100个key修改，持久化操作
save 300 100
# 如果60s内，至少有1000个key修改，持久化操作
save 60 10000

stop-writes-on-bgsave-error yes	  # 持久化出错，是否继续工作
rdbcompression yes	 # 是否压缩rdb文件,需要消耗CPU资源
rdbchecksum yes	  # 保存文件时，进行错误校验
dir ./	  # rdb文件保存目录
```

> 复制，看下一节的==主从复制==

> 安全

可以设置redis的密码，默认没有密码

```bash
config get requirepass	 # 查看redis密码
config set requirepass "123456"	 # 设置redis密码
auth 123456	  # 密码登陆
```

> 客户端

```bash
maxclients 10000	# 最大连接客户端数量
maxmemory <bytes>	# 最大内存
maxmemory-policy noeviction	   # 内存满了，处理策略
```

> Append ONLY 模式 aof

```bash
appendonly no	# 默认不开始aof模式，默认使用rdb持久化，够用了
appendfilename "appendonly.aof"	   # 持久化文件名

# appendfsync always	# 每次修改都同步
appendfsync everysec	# 每秒同步一次，可能会丢失这1s的数据！
# appendfsync no		# 不同步，由操作系统同步，速度最快
```

`AOF`具体配置，在下面会讲。

#### Redis持久化

##### RDB

Redis是内存数据库，不保存到硬盘，那么服务器进程退出、断电等，数据就会消失。所以Redis提供了持久化功能。

> 1、什么是RDB？

![image-20210524195444394](https://i.loli.net/2021/05/24/4xLIpNRowcyTJOq.png)

在指定时间间隔内将内存中的数据写入磁盘，恢复时是将快照文件直接读入内存。

Redis会创建（fork）一个子进程来持久化，子进程会将数据写入临时文件，等持久化结束，再用这个临时文件替换上次持久化好的文件。整个过程中，主进程是不进行IO操作的，所以保证了极高的性能。如果需要大规模数据恢复，且对数据恢复的完整性不太敏感，则RDB方式比AOF方式更加高效。`RDB缺点是最后一次持久化后的数据可能会丢失`
。

RDB保存的文件叫做 `dump.rdb`

![image-20210524200640287](https://i.loli.net/2021/05/24/MLxvZGXhaJYuSil.png)

![image-20210524200622269](https://i.loli.net/2021/05/24/gp4fFHsVEtlQiBT.png)

> 2、触发机制

1、save规则满足，会自动触发rdb规则

2、执行flushall，也会触发rdb规则

3、退出redis，也会触发rdb规则

备份就会自动生成dump.rdb文件

> 3、如何恢复rdb文件？

1、只需把rdb文件放到redis启动目录，redis启动时会自动检查dump.rdb文件恢复

2、查看存放目录

```bash
127.0.0.1:6379> config get dir
1) "dir"
2) "/usr/local/redis"
```

> 4、优缺点

优点：

1、适合大规模数据恢复

2、对数据完整性不敏感

缺点：

1、需要一定的时间间隔，如果意外宕机，最后一组修改的数据就没了

2、fork进程，会占用一定的内存

##### AOF

将我们的所有命令全部记录下来，恢复时就把这个文件全部执行一遍。

> 1、什么是AOF？

![image-20210524211217219](https://i.loli.net/2021/05/24/iuMjm9hBK42XxwN.png)

以日志的形式记录每个写操作，将Redis执行过程所有指令记录下来==（读操作不记录）==，只许追加不许改写，换言之，redis启动时根据日志文件，将命令全部执行一遍来完成恢复。

RDB保存的文件叫做 `appendonly.aof`

如果这个日志文件有错误，redis是无法启动的，需要用`redis-check-aof --fix`修复这个日志文件。

> 2、优缺点

优点：

1、每一次修改都同步，文件完整性更好

2、每一秒同步，可能会丢失一秒的数据

3、从不同步，效率最高

缺点：

1、相对于数据文件，文件大小：aof >> rdb，修复速度慢于rdb

2、aof运行效率比rdb慢，故redis默认是选择rdb

#### Redis发布订阅

发布订阅（pub/sub）是一种消息通信模式。Redis可订阅任意数量的频道。

订阅/发布消息图：

![image-20210524215001162](https://i.loli.net/2021/05/24/lHvb6QoxAYK3sJd.png)

> 1、演示

订阅端：

```bash
127.0.0.1:6379> SUBSCRIBE xin	# 订阅频道 xin
Reading messages... (press Ctrl-C to quit)
1) "subscribe"
2) "xin"
3) (integer) 1
1) "message"
2) "xin"			# 来自频道 xin
3) "hello,xiao"		# 获得的消息
1) "message"
2) "xin"			# 来自频道 xin
3) "redis"			# 获得的消息
```

发布端：

```bash
127.0.0.1:6379> PUBLISH xin "hello,xiao"   # 发布消息
(integer) 1
127.0.0.1:6379> PUBLISH xin "redis"		   # 发布消息
(integer) 1
```

> 2、使用场景

1、实时消息系统

2、实时聊天

3、订阅，关注系统

稍微复杂的场景我们使用 消息中间件MQ。

#### Redis主从复制

> 概念

主从复制，将一台Redis服务器的数据，复制到其他服务器。前者称为主节点，后者称为从节点；

数据复制是单向的，只能由主节点到从节点。主节点以写为主，从节点以读为主。

默认情况下，每台Redis服务器都是主节点；一个主节点可以有多个从节点，但从节点只能有一个主节点。

主从复制的作用：

1、数据冗余：实现数据的热备份，是持久化之外的一种数据冗余方式

2、故障恢复：主节点出问题，可以由从节点提供服务，实际上是服务的冗余

3、负载均衡：配合实现读写分离，主节点来写，从节点来读，分担服务器负载。尤其在写少读多的场景，通过多个从节点分担读负载，可以大大提高Redis服务器的并发量

4、高可用基石：主从复制是哨兵和集群实施的基础

一般来说，要将Redis运用于项目中，只是用一台Redis是万万不能的，原因如下：

1、结构上，单个Redis服务器会发生单点故障，而且一个服务器处理所有的请求，压力较大。

2、容量上，单个Redis服务器内容有限，一般来说单台Redis服务器最大使用内存不超过20G

电商网站上的商品。一般都是一次上传，无数次浏览的，也就是“多读少写”

对于这种场景，我们可以使用这种架构

![image-20210524234705030](https://i.loli.net/2021/05/24/LCorv8W3AJEMgnP.png)

主从复制，读写分离！ 80%的情况都是在读，读压力转移到从机，减少主服务器压力。
