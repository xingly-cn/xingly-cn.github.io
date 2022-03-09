---
layout: post
title: Zookeeper实现
date: 2021-10-03 12:35:00
tags: [RPC,分布式锁,动态上下线监听]
categories: java
abbrlink: Zookeeper
top_img: transparent
cover: https://pic2.58cdn.com.cn/nowater/webim/big/n_v2a2fde27b716f4ad281032e1cd2a97fdc.jpg
---

# Zookeeper集群

## 集群操作

### 选举机制（面试重点）

- 第一次启动

假设这里有5台服务器，首先第1台启动，投1号一票；第2台启动，投2号一票，由于2号的`myid`大于1号的，所以1号的票转移给2号，此时2号两票；第三台启动，同样的2号的票转移给3号，此时3号三票（大于半数），选举完成3号成为leader，1，2号为follower；此时4号，5号启动更改状态为follower。



> 了解一下

SID :  服务器ID，与myid相同。

ZXID :  事务ID，标识服务器状态的改变。

Epoch ：Leader任期的代号，无Leader时同一轮投票的逻辑时钟相同，投完票增加。

总结：myid中间的节点，成为leader



- 第二次启动

> 什么时候会发生Leader选举？

1 ）、服务器第一次启动时

2 ）、服务器无法与Leader保持连接



> Leader选举时，会出现两种状态

1 ）、Leader存在，只是你没连上而已

​	机器试图选举时，会被告知当前Leader信息，直到与Leader连上为止，并状态同步。

2 ）、Leader确实挂了

​	假设5台服务器，SID分别为1、2、3、4、5，ZXID分别为8、8、8、7、7，此时3号为Leader。突然3和5号服务器挂掉，开始选举。此时存活的有1、2、4服务器，依次比较（Epoch，ZXIDI，SID）谁大谁当Leader。



### 集群启停脚本

> 要求：提前配好三台Linux免密登录，否则没有权限

```bash
#!/bin/bash

case $1 in
"start"){
        for i in zkServer1 zkServer2 zkServer3
        do
                echo ---------- zookeeper $i start ----------
                ssh $i "/opt/module/zookeeper-3.5.7/bin/zkServer.sh start"
        done
}
;;
"stop"){
        for i in zkServer1 zkServer2 zkServer3
        do
                echo ---------- zookeeper $i stop ----------
                ssh $i "/opt/module/zookeeper-3.5.7/bin/zkServer.sh stop"
        done
}
;;
"status"){
        for i in zkServer1 zkServer2 zkServer3
        do
                echo ---------- zookeeper $i status ----------
                ssh $i "/opt/module/zookeeper-3.5.7/bin/zkServer.sh status"
        done
}
;;
esac
```

使用方法

```bash
# 批量启动
zk.sh start
# 批量停止
zk.sh stop
# 批量状态查询
zk.sh status
```



> 再提供一个zoo.cfg配置集群分发删除脚本

```bash
#!/bin/bash

case $1 in
"sync"){
        for i in zkServer1 zkServer2 zkServer3
        do
                echo ---------- zookeeper $i zoo.cfg sync ----------
                ssh $i "cd conf文件夹路径 && wget zoo.cfg下载路径"
        done
}
;;
"delete"){
        for i in zkServer1 zkServer2 zkServer3
        do
                echo ---------- zookeeper $i zoo.cfg delete ----------
                ssh $i "cd conf文件夹路径 && rm -f zoo.cfg"
        done
}
esac
```

使用方法

```bash
# 批量删除zoo.cfg
tb.sh delete
# 批量更新zoo.cfg
tb.sh sync
```



## 客户端命令行操作

### 命令行语法

| 基本语法  | 功能描述                                                |
| --------- | ------------------------------------------------------- |
| help      | 显示所有命令                                            |
| ls path   | 查询当前znode子节点[可监听]，-w 子节点变化，-s 次级信息 |
| create    | 创建节点，-s 有序列，-e 临时                            |
| get path  | 获得节点值[可监听]，-w 节点内容变化，-s 次级信息        |
| set       | 设置节点的值                                            |
| stat      | 节点状态                                                |
| delete    | 删除节点                                                |
| deleteall | 递归删除节点                                            |

> 进入命令行

```bash
bin/zkCli.sh -server zkServer1:2181
```



### znode信息

```bash
[zookeeper]cZxid = 0x0
ctime = Thu Jan 01 08:00:00 CST 1970
mZxid = 0x0
mtime = Thu Jan 01 08:00:00 CST 1970
pZxid = 0x0
cversion = -1
dataVersion = 0
aclVersion = 0
ephemeralOwner = 0x0
dataLength = 0
numChildren = 1
```

1 ）czxid：创建节点的事务zxid

2 ）ctime：创建时间（毫秒）

3 ）mzxid：最后更新的事务zxid

4 ）mtime：自后修改的时间（毫秒）

5 ）pzxid：最后更新的子节点zxid

6 ）cversion：子节点变化号，修改次数

7 ）dataversion：数据变化号，修改次数

8 ）aclVersion：控制列表变化号

9 ）ephemeralOwner：若是临时节点，则是znode的session id，否则为0



### 节点类型（持久/短暂/有序号/无序号）

![image-20211001220638643](https://i.loli.net/2021/10/01/3L6czMnF1qxi5eW.png)

- 持久节点

  客户端与服务端断开后，节点不删除

- 短暂节点

  客户端与服务端断开后，节点删除

- 无序

  正常znode名称

- 有序

  原有znode名称后 + 顺序号

1 ）创建两个永久节点（不带序号）

```bash
# 创建
create /sanguo "diaochan"
create /sanguo/shuguo "liubei"
# 查询
get -s /sanguo
get -s /sanguo/shuguo
```

2 ）创建两个永久节点（带序号）

znode可以重名，因为顺序号+1不同

```bash
create -s /sanguo/weiguo/zhangliao "zhangliao"
```

3 ）创建一个临时节点（不带序号）

```bash
create -e /sanguo/wuguo "zhouyu"
```

4 ）创建一个临时节点（带序号）

```bash
create -e -s /sanguo/wuguo "zhouyu"
```

5 ）修改节点值

```bash
set /sanguo/weiguo "simayi"
```



### 监听器原理

![image-20211001223417543](https://i.loli.net/2021/10/01/GSpUo4y3P2XrxRu.png)

监听流程：

1. 有一个`main()`线程
2. `main`线程中创建zk客户端，创建`connect`和`listener`线程
3. 通过`connect`将`监听事件`发送给zk服务端
4. zk服务端将`监听事件`加入`监听器列表`
5. zk服务器监听到`数据或路径`变化，将消息发送给`listener`线程
6. `listener`线程调用`process()`方法



常见监听：

1. 监听节点数据变化，`get path [watch]`
2. 监听子节点增减变化，`ls path [watch]`



> 监听节点数据变化模拟

3号服务器上监听`get -w /sanguo`，1号服务器上修改`set /sanguo "xnx"`，3号命令行出现`WatchedEvent state:SyncConnected type:NodeDataChanged path:/sanguo`，成功监听。

TIP：==只能监听一次修改，如果想要再监听，需要重新注册监听==



> 监听节点数变化模拟

3号服务器上监听`ls -w /sanguo`，1号服务器上修改`create /sanguo/jin "simayi"`，3号命令行出现`WatchedEvent state:SyncConnected type:NodeChildrenChanged path:/sanguo`，成功监听。



### 节点删除与查看

1. 单个删除，`delete /sanguo/jin`

2. 递归删除，`deleteall /sanguo`
3. 查看节点状态，`stat /zookeeper`



## 客户端API操作

### pom依赖

```xml
junit
zookeeper
log4j-core
```



### 创建zkClient

```java
package com.sugar.zk;
import org.apache.zookeeper.WatchedEvent;
import org.apache.zookeeper.Watcher;
import org.apache.zookeeper.ZooKeeper;
import org.junit.Test;
import java.io.IOException;

public class zkClient {

    private String ip = "zkServer1:2181,zkServer2:2181,zkServer3:2181";
    private int sessionTimeout = 2000;
	private ZooKeeper zkClient;
    
    @Before
    public void init() throws IOException {

        zkClient = new ZooKeeper(ip, Timeout, new Watcher() {
            @Override
            public void process(WatchedEvent watchedEvent) {}
        });
    }
}
```



### 创建子节点

```java
	@Test
    public void create() throws InterruptedException, KeeperException {
        String node = zkClient.create("/xnx", "ss.avi".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);

    }
```



### 获取子节点并监听变化

```java
	@Test
    public void getChild() throws InterruptedException, KeeperException {
        List<String> children = zkClient.getChildren("/", true);
        for (String child : children) {
            System.out.println("child = " + child);
        }
        // 延时 For 持续监听
        Thread.sleep(Long.MAX_VALUE);
    }
```

想要持续监听，就在`zk客户端`的`process`回调方法里再次注册

```java
	@Override	
	public void process(WatchedEvent watchedEvent) {
		List<String> children = null;
		try {
            // 每次监听完，再次注册
        	children = zkClient.getChildren("/", true);
            // 打印节点情况
        	for (String child : children) {
				System.out.println("child = " + child);
			}
        } catch (KeeperException e) {
                  e.printStackTrace();
        } catch (InterruptedException e) {
                  e.printStackTrace();
        }
    }
```



### 判断Znode是否存在

```java
	@Test
    public void exist() throws InterruptedException, KeeperException {
        Stat exists = zkClient.exists("/wj", false);
        System.out.println(exists==null?"无":"有");
    }
```



## 客户端向服务器写数据

写数据有两种情况：①发送给Leader ②发送给follower

> 发送给Leader

![image-20211002210719383](https://i.loli.net/2021/10/02/qHyo4ngsuxDQfaw.png)

这里按3台服务器为例：

1. 客户端给Leader写数据
2. 客户端给`中间的follower`写数据
3. 中间follower应答
4. 由于已有2台服务器完成写（超过半数），可以`直接应答客服端`
5. 然后Leader再向剩余follower写数据，并做出回复



> 发送给follower

![image-20211002211448040](https://i.loli.net/2021/10/02/rzP3BTqbKjocgDk.png)

1.  客户端给follower写数据
2.  但是follower`无写权限`，将写请求转发给Leader
3.  Leader写完之后，向中间follower写数据
4.  中间follower应答
5.  由于已有2台服务器完成写（超过半数），告诉中间follower完成了
6.  中间follower告诉再应答客户端
7.  然后Leader再向剩余follower写数据，并做出回复



==这里会发现，5这时已有半数服务器完成写，为什么Leader不直接返回给客户端呢？==

eg. 客户端是与中间follower建立连接，所以Leader必须告诉中间的follower，再由它来转告客户端。



# 服务器动态上下线监听案例

## 需求

​	某分布式系统，主节点可以有多台，可以动态上下线，任意一台客户端都能实时感知主节点服务器的上下线。



## 需求分析

![image-20211002212516309](https://i.loli.net/2021/10/02/WHqO3bXkyhCZ1de.png)

​	三台服务器注册信息后，客户端来监听，如果有服务器下线，zk通知客户端XXX下线，客户端重新获取服务器列表，并注册监听。



## 具体实现

1 ）、创建/servers节点

​	`create /servers "main"`

2 ）、服务器向zk发起注册

```java
package com.sugar.case1;
import org.apache.zookeeper.*;
import java.io.IOException;

public class DistributeServer {

    private String ip = "zkServer1:2181,zkServer2:2181,zkServer3:2181";
    private int time = 2000;
    private ZooKeeper zk ;

    public static void main(String[] args) throws IOException, InterruptedException, KeeperException {
        DistributeServer server = new DistributeServer();
        // 1.获取zk
        server.getConnect();

        // 2.注册
        server.regist(args[0]);

        // 3.业务（睡觉）
        server.business();
    }

    //---------------------方法实现--------------------
    private void business() throws InterruptedException {
        Thread.sleep(Long.MAX_VALUE);
    }


    private void regist(String hostname) throws InterruptedException, KeeperException {
        String node = zk.create(/servers/" + hostname", hostname.getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);
        System.out.println(hostname + "已上线");
    }


    private void getConnect() throws IOException {
        zk = new ZooKeeper(ip, time, new Watcher() {
            @Override
            public void process(WatchedEvent watchedEvent) {
            }
        });
    }
}
```

3 ）、客户端监听

```java
package com.sugar.case1;
import org.apache.zookeeper.*;
import java.io.*;
import java.util.*;

public class DistributeClient {

    private String ip = "zkServer1:2181,zkServer2:2181,zkServer3:2181";
    private int time = 2000;
    private ZooKeeper zk ;

    public static void main(String[] args) throws IOException, InterruptedException, KeeperException {
        DistributeClient client = new DistributeClient();
        // 1.获取zk
        client.getConnect();

        // 2.监听 /servers 下面子节点变化
        client.getServerList();

        // 3.业务（睡觉）
        client.business();
    }

    private void business() throws InterruptedException {
        Thread.sleep(Long.MAX_VALUE);
    }

    private void getServerList() throws InterruptedException, KeeperException {
        // 获取servers下所有节点名称
        List<String> children = zk.getChildren("/servers", true);
        ArrayList<String> servers = new ArrayList<>();
        for (String child : children) {
            // 根据路径 获取所有节点的值
            byte[] data = zk.getData("/servers" + child, false, null);
            servers.add(new String(data));
        }
        // 打印
        System.out.println(servers);
    }

    private void getConnect() throws IOException {
        zk = new ZooKeeper(ip, time, new Watcher() {
            @Override
            // 回调继续监听
            public void process(WatchedEvent watchedEvent) {
                try {
                    getServerList();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } catch (KeeperException e) {
                    e.printStackTrace();
                }
            }
        });
    }
}
```



## 测试

1 ）、在Linux命令行操作增减服务器

1. 启动`DistributeClient`客户端
2. 在1号服务器的`/servers`目录创建 临时带序号节点
3. 观察idea控制台信息
4. 执行删除
5. 观察idea控制台信息

```bash
# 命令行创建
[zk: localhost:2181(CONNECTED) 17] create -e -s /servers/xnx1 "one"
Created /servers/xnx10000000001
[zk: localhost:2181(CONNECTED) 18] create -e -s /servers/xnx2 "twe"
Created /servers/xnx20000000002
[zk: localhost:2181(CONNECTED) 20] delete /servers/xnx20000000002

# IDEA控制台信息
[one]
[one, twe]
[one]
```



2 ）、在IDEA操作增减服务器

1. 启动`DistributeClient`客户端
2. 启动`DistributeServer`服务端

![image-20211002222037112](https://i.loli.net/2021/10/02/gusdMiQ2Keh1TEa.png)



# Zookeeper分布式锁案例

## 原生Zookeeper实现分布式锁

> 什么是分布式锁？

进程1在访问临界资源时，会获得锁，对该资源独占。其他进程无法访问，等进程1访问完释放锁，其他进程才可以获得锁。为了`分布式系统下多个进程有序的访问临界资源`。



### 需求分析

![image-20211002223413448](https://i.loli.net/2021/10/02/hOaP7tbBopULvXE.png)

1. 客户端访问资源，创建`lock`临时顺序节点
2. 判断自己是不是最小节点：是，得到锁；不是，对前一个节点监听
3. 获得锁，完成业务，释放节点，其他节点收到通知，重复第二步



### 具体实现

```java
package com.sugar.case2;
import org.apache.zookeeper.*;
import java.io.IOException;
import java.util.*;

public class DistributeLock {

    private String ip = "zkServer1:2181,zkServer2:2181,zkServer3:2181";
    private int time = 2000;
    private ZooKeeper zk ;

    private CountDownLatch connectLoatch = new CountDownLatch(1);
    private CountDownLatch waitLoatch = new CountDownLatch(1);
    private String waitPath;
    private String curNode;

    public DistributeLock() throws IOException, InterruptedException, KeeperException {
        // 1.获得ck
        zk = new ZooKeeper(ip, time, new Watcher() {
            @Override
            public void process(WatchedEvent watchedEvent) {
                // 已成功连接zk，释放connectLoatch
                if (watchedEvent.getState() == Event.KeeperState.SyncConnected) {
                    connectLoatch.countDown();
                }
                // 已成功监听waitLoatch,且当前节点被删除
                if (watchedEvent.getType() == Event.EventType.NodeDeleted && watchedEvent.getPath().equals(waitPath)) {
                    waitLoatch.countDown();
                }
            }
        });
        connectLoatch.await();  // 等待zk正常连接，才运行下面的

        // 2.判断根结点/locks存在
        Stat exists = zk.exists("/locks", false);
        if (exists == null){
            // 创建根结点
            zk.create("/locks", "locks".getBytes(), ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.PERSISTENT);
        }
    }

    public void lock() throws InterruptedException, KeeperException {
        // 创建临时序号节点
        curNode = zk.create("/locks/seq-", null, ZooDefs.Ids.OPEN_ACL_UNSAFE, CreateMode.EPHEMERAL_SEQUENTIAL);
        // 判断是否最小的，是获得锁，否监听前一个节点
        List<String> children = zk.getChildren("/locks", false);
        if (children.size() == 1) {
            return;
        }else {
            Collections.sort(children);
            // 获取当前节点名称
            String curNodeName = curNode.substring("/locks/".length());
            // 获取当前节点在children中的位置
            int pos = children.indexOf(curNodeName);
            // 判断大小
            if (pos == -1) {
                System.out.println("数据异常");
            }else if(pos == 0) {
                return;
            }else {
                // 监听前一个节点
                waitPath = "/locks/" + children.get(pos - 1);
                zk.getData(waitPath,true,null);
                // 这里是等待上一个节点释放锁，当前节点才能获得锁
                waitLoatch.await();
                // 走到这里说明当前节点获得到了锁，不理解多看几遍
                return;
            }
        }
    }

    public void unlock() throws InterruptedException, KeeperException {
        // 删除节点
        zk.delete(curNode,-1);
    }
}
```

### 测试

```java
线程1启动，获取到锁
线程1，释放锁
线程2启动，获取到锁
线程2，释放锁
```



## Curator框架实现分布式锁

1 ）、原生Java API开发存在的问题

1. 会话连接异步，需要自己处理。比如CountDownLatch
2. Watch需要重复注册
3. 开发复杂
4. 不支持多节点删除、创建，需要自己递归

2 ）、Curator专门解决分布式锁的框架，解决了Java API的问题



### 具体实现

```java
package com.sugar.case3;
import org.apache.curator.*;

public class CuratorLock {

    public static void main(String[] args) {
        // 创建锁1
        InterProcessMutex lock1 = new InterProcessMutex(getCurFranmeWork(), "/locks");

        // 创建锁2
        InterProcessMutex lock2 = new InterProcessMutex(getCurFranmeWork(), "/locks");

        // 线程1
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    lock1.acquire();
                    System.out.println("线程1获得锁");
                    lock1.acquire();
                    System.out.println("线程1再次获得锁");
                    Thread.sleep(3000);
                    lock1.release();
                    System.out.println("线程1释放锁");
                    lock1.release();
                    System.out.println("线程1再次释放锁");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }).start();

        // 线程2
        new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    lock2.acquire();
                    System.out.println("线程2获得锁");
                    lock2.acquire();
                    System.out.println("线程2再次获得锁");
                    Thread.sleep(3000);
                    lock2.release();
                    System.out.println("线程2释放锁");
                    lock2.release();
                    System.out.println("线程2再次释放锁");
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }).start();

    }

    private static CuratorFramework getCurFranmeWork() {
        // 连接失败，间隔3s重新连接，重复三次
        ExponentialBackoffRetry policy = new ExponentialBackoffRetry(3000, 3);
        CuratorFramework client = CuratorFrameworkFactory.builder()
                .connectString("zkServer1:2181,zkServer2:2181,zkServer3:2181")
                .connectionTimeoutMs(2000)
                .sessionTimeoutMs(2000)
                .retryPolicy(policy).build();
        // 启动客户端
        client.start();
        System.out.println("客户端启动");
        return client;
    }
}
```



### 测试

```java
线程1获得锁
线程1再次获得锁
线程1释放锁
线程1再次释放锁
线程2获得锁
线程2再次获得锁
线程2释放锁
线程2再次释放锁
```



# 企业面试真题（面试重点）

## 选举机制

半数机制，超过半数投票通过，则通过

（1）第一次启动

​	投票过半数，myid大的胜出

（2）第二次启动

​	Epoch > zxid > myid



## 生产集群安装多少台zk合适？

安装技术台

- 10台服务器，3台zk
- 20台服务器，5台zk
- 100台服务器，11台zk
- 200台服务器，11台zk

服务器台数多：好处，提高可靠性。坏处，提高通信延时



## 常用命令

ls、get、create、delete
