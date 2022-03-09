---
layout: post
title: 消息中间件 RabbitMQ
date: 2021-07-22 14:20:41
tags: [消息队列,RabbitMQ]
categories: java
abbrlink: RabbitMQ
top_img: transparent
cover: https://img-blog.csdnimg.cn/img_convert/281b42448a5ec7c455373d82191e4231.png
---

![消息队列](https://i.loli.net/2021/07/22/aCZ5uHprPI1Yvek.png)

配套资源：[消息队列RabbitMQ.pdf 一枚方糖提供镜像](http://pan.xingly.cn/s/vktx)

### Hello World

​	在本教程的这一部分中，我们将用 Java 编写两个程序。发送单个消息的生产者和接收消息并打印出来的消费者。我们将介绍 Java API 中的一些细节。

​	在下图中，**P**是我们的生产者，**C**是我们的消费者。中间的框是一个队列-RabbitMQ 代表使用者保留的消息缓冲区。

![Snipaste_2021-07-22_14-25-42](https://i.loli.net/2021/07/22/rLAzEfD1YXnRCcp.png)

#### 创建开发环境

```xml
<!--rabbitmq客户端-->
<dependency>
    <groupId>com.rabbitmq</groupId>
    <artifactId>amqp-client</artifactId>
    <version>5.8.0</version>
</dependency>
<!--操作文件流-->
<dependency>
    <groupId>commons-io</groupId>
    <artifactId>commons-io</artifactId>
    <version>2.6</version>
</dependency>
```

#### 生产者代码

```java
package com.asugar.one;
import com.rabbitmq.client.*;
/**
 * 生产者：发消息
 */
public class Producer {
    // 队列名称
    public static final String QUEUE_NAME = "HelloQueue";

    public static void main(String[] args) throws Exception {
        // 创建工厂
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("175.27.243.243");  // 设置IP
        factory.setUsername("admin");   // 设置用户名
        factory.setPassword("123456");  // 设置密码
        
        // 创建连接
        Connection connection = factory.newConnection();
        
        // 创建频道
        Channel channel = connection.createChannel();
        
        // 创建队列
        // 队列名,持久化,消息共享,自动删除,其他参数
        channel.queueDeclare(QUEUE_NAME,false,false,false,null);
        
        // 发消息
        // 交换机,路由Key值,其他参数,发送的消息(二进制)
        String msg = "Hello World";
        channel.basicPublish("",QUEUE_NAME,null,msg.getBytes());
        System.out.println("消息发送完毕！");
        
        // 关闭连接
        channel.close();
        connection.close();
    }
}

```

#### 消费者

```java
package com.asugar.one;
import com.rabbitmq.client.*;
/**
 * 消费者：接收消息
 */
public class Consumer {
    // 队列名称
    public static final String QUEUE_NAME = "HelloQueue";

    public static void main(String[] args) throws Exception {
        // 创建工厂
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("175.27.243.34");  // 设置IP
        factory.setUsername("admin");   // 设置用户名
        factory.setPassword("123456");  // 设置密码
        
        // 创建连接
        Connection connection = factory.newConnection();
        
        // 创建频道
        Channel channel = connection.createChannel();
        
        // 接收消息回调（成功）
        DeliverCallback deliverCallback = (consumerTag,message) -> {
            System.out.println("message = " + new String(message.getBody()));
        };
        
        // 取消消息回调（失败）
        CancelCallback cancelCallback = consumerTag -> {
            System.out.println("取出消息中断");
        };
        
        // 接收消息
        // 消费哪个队列,消费成功应答,消费成功回调,消费失败回调
        channel.basicConsume(QUEUE_NAME,true,deliverCallback,cancelCallback);
        // 关闭连接
        channel.close();
        connection.close();
    }
}
```

### Work Queues

工作队列的主要思想是**避免立即执行资源密集型任务**，而不得不等待它完成。我们把任务封装为消息并将其发送到队列。在后台运行的工作进程将弹出任务并最终执行作业。当有多个工作线程时，这些工作线程将一起处理这些任务。

#### 轮训分发消息

​	这个案例我们启动**两个消费者，一个生产者**，看他们如何工作。

​	轮训的意思是生产者发送了大量消息，两个消费者**轮流**处理，你一个我一个。

##### 抽取工具类

在**Hello World**中，生产者消费者线程都需要设置**重复的连接信息**，我们可以抽取出来封装成工具类。简化操作。

```java
package com.asugar.one.utils;
import com.rabbitmq.client.*;
/**
 * RabbitMQ工具类
 */
public class RabbitMqUtils {
    // 获取一个频道
    public static Channel getChannel() throws Exception {
        // 创建工厂
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost("175.27.243.243");  // 设置IP
        factory.setUsername("admin");   // 设置用户名
        factory.setPassword("123456");  // 设置密码
        // 创建连接
        Connection connection = factory.newConnection();
        // 创建频道
        Channel channel = connection.createChannel();
        return channel;
    }
}
```

##### 启动两个消费者线程

​	IDEA支持多线程运行，我们分别修改**消费者①号等待接受消息**运行一次，**消费者②号等待接受消息**再运行一次，就是两个线程消费者线程。

```java
package com.asugar.two;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;
/**
 * 消费者
 */
public class work1 {
    // 队列名称
    public static final String QUEUE_NAME = "HelloQueue";

    public static void main(String[] args) throws Exception{
        // 获取频道
        Channel channel = RabbitMqUtils.getChannel();
        
        // 接收成功回调
        DeliverCallback deliverCallback = (consumerTag,message) -> {
            System.out.println("message = " + new String(message.getBody()));
        };
        
        // 取消消息回调
        CancelCallback cancelCallback = (consumerTag) -> {
            System.out.println("消息接受中断");
        };
        
        // 接收消息
        System.out.println("消费者①号等待接受消息......");
        channel.basicConsume(QUEUE_NAME,true,deliverCallback,cancelCallback);
    }
}
```

##### 启动一个生产者线程

```java
package com.asugar.two;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;
import java.util.Scanner;
/**
 * 生产者
 */
public class task1 {
    // 队列名称
    public static final String QUEUE_NAME = "HelloQueue";

    public static void main(String[] args) throws Exception{
        // 获取频道
        Channel channel = RabbitMqUtils.getChannel();
        
        // 创建队列
        channel.queueDeclare(QUEUE_NAME,false,false,false,null);
        
        // 从控制台读取message
        Scanner scanner = new Scanner(System.in);
        while(scanner.hasNext()){
            String message = scanner.next();
            // 发送消息
            channel.basicPublish("",QUEUE_NAME,null,message.getBytes());
            System.out.println("发送完成------>" + message);
        }
    }
}
```

##### 结果展示

通过程序执行发现生产者总共发送 4 个消息，消费者 1 和消费者 2 分别分得两个消息，并且是按照有序的一个接收一次消息。

![轮训分发](https://i.loli.net/2021/07/22/pi3Bz7xuFyMfUkO.png)

#### 消息应答

##### 概念

​	消费者完成一个任务可能需要一段时间，如果其中一个消费者处理一个长的任务并仅只完成了部分突然它挂掉了，会发生什么情况？消息丢失

​	为了保证消息发送不丢失，引入消息应答机制，只有当**消费者接受消息并处理消息后**，会告诉RabbitMQ，可以把队列的消息删除了。

##### 自动应答

​	消息发送后立即被认为传送成功，需要在**高吞吐和数据传输安全做权衡**。一方面，**如果消息在被接收之前，消费者连接关闭，那么消息就丢失了**。另一方面是**没有对传递的消息数量进行限制**，当然消费者可能接收太多来不及处理，导致消息积压，最终内存耗尽，消费者线程被OS杀死。

##### 消息应答方法

- Channel.basicAck(肯定确认)  RabbitMQ 知道该消息并且成功处理，可以删除

- Channel.basicNack(否定确认)  

- Channel.basicReject(否定确认)  相比上面少一个参数，不处理该消息直接拒绝，可以删除

##### Multiple的解释

​	手动应答好处是可以批量应答，减少网络堵塞。

![Multiple](https://i.loli.net/2021/07/22/SJOPI54VYtjGEgN.png)

​	比如 channel 上有传送 tag 的消息 **5,6,7,8**，当前tag为8

![Multiple-true-or-fasle](https://i.loli.net/2021/07/22/wUMpsqmZaHkQJxr.png)

##### 消息自动重新入队

​	如果消费者由于某些原因失去连接(其通道已关闭，连接已关闭或 TCP 连接丢失)，导致消息未发送 ACK 确认，RabbitMQ 将了解到消息未完全处理，并将对其重新排队。如果此时有其他消费者可以处理，它将很快将其重新分发给另一个消费者。这样，即使某个消费者偶尔死亡，也可以确保不会丢失任何消息。

![消息重新入队](https://i.loli.net/2021/07/22/zXWkjHs3ZvPupRa.png)

##### 消息手动应答代码

​	默认消息采用的是自动应答，所以我们要想实现消息消费过程中不丢失，需要把自动应答改为手动应答，**消费者**在上面代码的基础上增加下面画红色部分代码。

![手动应答代码](https://i.loli.net/2021/07/22/xyTf5qSMdPD4sl9.png)

生产者

```java
package com.asugar.three;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;
import java.util.Scanner;
/**
 * 生产者
 */
public class producer {
    // 队列名称
    public static final String QUEUE_NAME = "AckQueue";

    public static void main(String[] args) throws Exception{
        // 获取频道
        Channel channel = RabbitMqUtils.getChannel();
        
        // 创建队列
        channel.queueDeclare(QUEUE_NAME,false,false,false,null);
        
        // 从控制台读取message
        Scanner scanner = new Scanner(System.in);
        while(scanner.hasNext()){
            String message = scanner.next();
            // 发送消息
            channel.basicPublish("",QUEUE_NAME,null,message.getBytes());
            System.out.println("生产者发送------>" + message);
        }
    }
}
```

消费者①号

```java
package com.asugar.three;
import com.asugar.utils.RabbitMqUtils;
import com.asugar.utils.SleepUtils;
import com.rabbitmq.client.*;
/**
 * 消费者①号
 * 手动应答
 */
public class custmer {
    // 队列名称
    public static final String QUEUE_NAME = "AckQueue";

    public static void main(String[] args) throws Exception{
        // 获取频道
        Channel channel = RabbitMqUtils.getChannel();
        System.out.println("消费者①号接受消息------>处理时间短");
        
        // 接收成功回调
        DeliverCallback deliverCallback = (consumerTag, message) -> {
            // 沉睡1s 模拟处理消息需要1s
            SleepUtils.sleep(1);
            System.out.println("message = " + new String(message.getBody()));
            
            // 手动应答
            channel.basicAck(message.getEnvelope().getDeliveryTag(),false);
        };
        
        // 取消消息回调
        CancelCallback cancelCallback = (consumerTag) -> {
            System.out.println("消息接受中断");
        };
        
        // 接受消息
        channel.basicConsume(QUEUE_NAME,false,deliverCallback,cancelCallback);
    }
}
```

消费者②号

```java
package com.asugar.three;
import com.asugar.utils.RabbitMqUtils;
import com.asugar.utils.SleepUtils;
import com.rabbitmq.client.*;
/**
 * 消费者②号
 * 手动应答
 */
public class custmer2 {
    // 队列名称
    public static final String QUEUE_NAME = "AckQueue";

    public static void main(String[] args) throws Exception{
        // 获取频道
        Channel channel = RabbitMqUtils.getChannel();
        System.out.println("消费者②号接受消息------>处理时间短");
        
        // 接收成功回调
        DeliverCallback deliverCallback = (consumerTag, message) -> {
            // 沉睡1s 模拟处理消息需要1s
            SleepUtils.sleep(30);
            System.out.println("message = " + new String(message.getBody()));
            
            // 手动应答
            channel.basicAck(message.getEnvelope().getDeliveryTag(),false);
        };
        
        // 取消消息回调
        CancelCallback cancelCallback = (consumerTag) -> {
            System.out.println("消息接受中断");
        };
        
        // 接受消息
        channel.basicConsume(QUEUE_NAME,false,deliverCallback,cancelCallback);
    }
}
```

##### 手动应答效果

生成发送消息aa，bb，cc，dd，消费者接收顺序应该是C1，C2，C1，C2，但是假如C2处理时间较长还没接收到dd，突然遭遇不测，那么消息会交给C1处理，不会丢失。

![手动应答](https://i.loli.net/2021/07/22/JgE6dim71XVYthw.png)

#### RabbitMQ 持久化

##### 概念

​	刚刚我们已经看到了如何处理任务不丢失的情况，但是如何保障当 RabbitMQ 服务停掉以后生产者发送过来的消息不丢失。默认情况下 RabbitMQ 退出或由于某种原因崩溃时，原来的队列和消息会清空，除非告知它不要这样做。确保消息不会丢失需要做两件事：**我们需要将队列和消息都持久化**。

##### 队列实现持久化

​	将第二个参数修改为**true**，代表队列持久化。

```java
// 创建队列
channel.queueDeclare(QUEUE_NAME,true,false,false,null);
```

![持久化](https://i.loli.net/2021/07/22/MWZDLThnCGu42X8.png)

​	这个时候即使重启 RabbitMQ 队列也依然存在。

##### 消息实现持久化

​	将第三个参数改为**MessageProperties.PERSISTENT_TEXT_PLAIN**，代表消息持久化。

```java
// 发送消息
channel.basicPublish("",QUEUE_NAME,MessageProperties.PERSISTENT_TEXT_PLAIN,message.getBytes());
```

​	**将消息标记为持久化并不能完全保证不会丢失消息**。尽管它告诉 RabbitMQ 将消息保存到磁盘，但是这里依然存在当消息刚准备存储在磁盘的时候，但是还没有存储完，消息还在缓存的一个间隔点。此时并没有真正写入磁盘。

##### 不公平分发

​	在最开始的时候我们学习到 RabbitMQ 分发消息采用的**轮训分发**，但是在某种场景下这种策略并不是很好，比方说有两个消费者在处理任务，其中有个消费者①处理任务的速度非常快，而另外一个消费者②处理速度却很慢，这个时候我们还是采用轮训分发，消费者①大部分时间是空闲，而处理慢的消费者②一直在干活，这种分配方式在这种情况下其实就不太好，但是 RabbitMQ 并不知道这种情况它依然很公平的进行分发。

​	为了避免这种情况，我们可以设置参数 **channel.basicQos(1)**;

##### 预取值

​	**限制缓冲区的大小，以避免缓冲区里面无限制接受的未确认消息的问题，规定信道上允许未确认消息的最大数量**。

![image-20210722200743442](https://i.loli.net/2021/07/22/KgoQdySG4MeP6qz.png)

### 发布确认

#### 发布确认原理

​	**为了更安全的持久化**

​	如果消息和队列是持久化的，那么确认消息会在消息写入磁盘后发出，告诉生产者。

​	如果不是持久化，那确认消息到达目标队列后发出，告诉生产者。

#### 发布确认策略

##### 开启发布确认

​	发布确认默认是没有开启的，如果要开启需要用频道调用方法 **confirmSelect**。

```java
// 开启发布确认
channel.confirmSelect();
```

##### 单个确认发布

​	这是一种简单的确认方式，它是一种**同步确认发布**的方式，也就是发布一个消息之后只有它被确认发布，后续的消息才能继续发布。waitForConfirmsOrDie(long)这个方法只有在消息被确认的时候才返回，如果在指定时间范围内这个消息没有被确认那么它将抛出异常。

​	 最大的缺点就是：**发布速度特别的慢**，因为如果没有确认发布的消息就会阻塞所有后续消息的发布，这种方式最多提供**百条/S**发布消息的吞吐量。

```java
package com.asugar.four;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;
import java.util.UUID;
/**
 * 发布确认模式，各模式消耗的时间
 * 单个确认
 * 批量确认
 * 异步批量确认
 */
public class ConfirmMsg {
    // 发送消息数量
    public static final int MsgCount = 1000;

    public static void main(String[] args) throws Exception{
        // 单个确认
        ConfirmMsg.publishMsgIndividually(); //消耗时间------>11761 ms
    }

    // 单个确认方法
    public static void publishMsgIndividually() throws Exception{
        // 获取频道
        Channel channel = RabbitMqUtils.getChannel();
        
        // 创建队列
        String QUEUE_NAME = UUID.randomUUID().toString();
        channel.queueDeclare(QUEUE_NAME,false,false,false,null);
        
        // 开启发布确认
        channel.confirmSelect();
        
        // 记录开始时间
        long begin = System.currentTimeMillis();
        
        // 发消息
        for (int i = 0; i < MsgCount; i++) {
            String message = i + "";
            channel.basicPublish("",QUEUE_NAME,null,message.getBytes());
            // 单个确认
            boolean flag = channel.waitForConfirms();
            if(flag) System.out.println("消息发送成功");
        }
        
        // 记录结束时间
        long end = System.currentTimeMillis();
        
        // 单个确认模式消耗时间
        System.out.println("单个确认模式消耗时间------>"+(end-begin));
    }
}
```

##### 批量确认发布

​	先发布一批消息然后一起确认可以极大地**提高吞吐量**，当然这种方式的缺点就是:**当发生故障导致发布出现问题时，不知道是哪个消息出现问题了，我们必须将整个批处理保存在内存中，以记录重要的信息而后重新发布消息**。

```java
package com.asugar.four;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;
import java.util.UUID;

/**
 * 发布确认模式，各模式消耗的时间
 * 单个确认
 * 批量确认
 * 异步批量确认
 */
public class ConfirmMsg {
    // 发送消息数量
    public static final int MsgCount = 1000;

    public static void main(String[] args) throws Exception{
        // 批量确认
        ConfirmMsg.publishMsgBatch(); // 消耗时间------>252 ms
    }

    // 批量确认方法
    public static void publishMsgBatch() throws Exception{
        // 获取频道
        Channel channel = RabbitMqUtils.getChannel();
        
        // 队列
        String QUEUE_NAME = UUID.randomUUID().toString();
        channel.queueDeclare(QUEUE_NAME,false,false,false,null);
        
        // 开启发布确认
        channel.confirmSelect();
        
        // 记录开始时间
        long begin = System.currentTimeMillis();
        for (int i = 1; i <= MsgCount; i++) {
            String message = i + "";
            channel.basicPublish("",QUEUE_NAME,null,message.getBytes());
            // 批量确认,每隔100条确认一次
            if(i%100==0) {
                boolean flag = channel.waitForConfirms();
                if(flag) System.out.println("消息发送成功");
            }
        }
        
        // 记录结束时间
        long end = System.currentTimeMillis();
        
        // 批量确认模式消耗时间
        System.out.println("批量确认模式消耗时间------>"+(end-begin));
    }
}
```

##### 异步确认发布

​	异步确认虽然逻辑比上两个要复杂，但是性价比最高，无论是可靠性还是效率都没得说， 他是利用**回调函数来达到消息可靠性传递的**。

​	异步：生产者只管往死里发消息，至于成不成功不需要你管，**稍后**会有人（**回调函数**）告诉你哪些发送成功、失败。

![异步确认](https://i.loli.net/2021/07/23/BQxFMYOhkEse7HA.png)

```java
package com.asugar.four;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;
import java.util.UUID;

/**
 * 发布确认模式，各模式消耗的时间
 * 单个确认
 * 批量确认
 * 异步批量确认
 */
public class ConfirmMsg {
    // 发送消息数量
    public static final int MsgCount = 1000;

    public static void main(String[] args) throws Exception{
        // 异步批量确认
        ConfirmMsg.publishMsgAsync(); // 消耗时间------>73 ms
    }

    // 异步批量确认方法
    public static void publishMsgAsync() throws Exception{
        
        // 获取频道
        Channel channel = RabbitMqUtils.getChannel();
        
        // 队列
        String QUEUE_NAME = UUID.randomUUID().toString();
        channel.queueDeclare(QUEUE_NAME,false,false,false,null);
        
        // 开启发布确认
        channel.confirmSelect();
        
        // 记录开始时间
        long begin = System.currentTimeMillis();
        
        // 成功回调
        ConfirmCallback ackCallback = (deliveryTag,multiple)->{
            System.out.println("已确认的消息------>"+deliveryTag);
        };
        // 失败回调
        ConfirmCallback nackCallback = (deliveryTag,multiple)->{
            System.out.println("未确认的消息------>"+deliveryTag);
        };
        
        // 发消息前 - 监听哪些消息发送成功、失败 - 两个回调函数
        channel.addConfirmListener(ackCallback,nackCallback);
        
        // 发消息
        for (int i = 0; i < MsgCount; i++) {
            String message = i + "";
            channel.basicPublish("",QUEUE_NAME,null,message.getBytes());
        }
        
        // 记录结束时间
        long end = System.currentTimeMillis();
        
        // 异步批量批量确认消耗时间
        System.out.println("异步批量确认消耗时间------>"+(end-begin));
    }
}
```

##### 处理异步未确认消息

​	最好的解决方案就是把未确认的消息放到一个基于内存的能被发布线程访问的队列， 比如说用 ConcurrentLinkedQueue 这个队列在 confirm callbacks 与发布线程之间进行消息的传递。

```java
package com.asugar.four;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;
import java.util.UUID;
import java.util.concurrent.ConcurrentNavigableMap;
import java.util.concurrent.ConcurrentSkipListMap;

/**
 * 发布确认模式，各模式消耗的时间
 * 单个确认
 * 批量确认
 * 异步批量确认
 */
public class ConfirmMsg {
    // 发送消息数量
    public static final int MsgCount = 1000;

    public static void main(String[] args) throws Exception{
        ConfirmMsg.publishMsgAsync(); // 消耗时间------>73 ms
    }

    // 异步批量确认方法
    public static void publishMsgAsync() throws Exception{
        // 获取频道
        Channel channel = RabbitMqUtils.getChannel();
        
        // 队列
        String QUEUE_NAME = UUID.randomUUID().toString();
        channel.queueDeclare(QUEUE_NAME,false,false,false,null);
        
        // 开启发布确认
        channel.confirmSelect();
        
        /**
         * 线程安全有序的HashMap 适用于高并发
         * bin存储所有消息
         */
        ConcurrentSkipListMap<Long,String> bin = new ConcurrentSkipListMap<>();
        
        // 记录开始时间
        long begin = System.currentTimeMillis();
        
        // 成功回调
        ConfirmCallback ackCallback = (deliveryTag,multiple)->{
            System.out.println("已确认的消息------>"+deliveryTag);
            /**
             * 删除已确认消息
             */
            if(multiple){   // 批量删除
                ConcurrentNavigableMap<Long, String> confirmed = bin.headMap(deliveryTag);
                confirmed.clear();
            }else bin.remove(deliveryTag);  // 删除单个
        };
        
        // 失败回调
        ConfirmCallback nackCallback = (deliveryTag,multiple)->{
            /**
             * 打印未确认消息
             */
            String unconfirm = bin.get(deliveryTag);
            System.out.println("未确认的消息 = " + unconfirm);

        };
        
        // 发消息前 - 监听哪些消息发送成功、失败 - 两个回调函数
        channel.addConfirmListener(ackCallback,nackCallback);
        
        // 发消息
        for (int i = 0; i < MsgCount; i++) {
            String message = i + "";
            channel.basicPublish("",QUEUE_NAME,null,message.getBytes());
            /**
             * 记录所有消息记录
             */
            bin.put(channel.getNextPublishSeqNo(),message);
        }
        
        // 记录结束时间
        long end = System.currentTimeMillis();
        
        // 异步批量批量确认消耗时间
        System.out.println("异步批量确认消耗时间------>"+(end-begin));
    }
}
```

##### 三种发布方式速度对比

- 单独发布消息

  同步等待确认，简单，但吞吐量非常有限。 

- 批量发布消息

  批量同步等待确认，合理的吞吐量，一旦出现问题但很难推断出是哪条消息出现了问题。 

- 异步处理

  最佳性能和资源使用，在出现错误的情况下可以很好地控制，但是实现起来稍微难些

![1000条消息-速度对比](https://i.loli.net/2021/07/23/BZU9citg6uVTL73.png)

### 交换机

​	在上面一部分，我们知道消费者间是竞争关系，只能被一个消费者获取。那我们将消息传给多个消费者该怎么办？这种模式称为 **发布/订阅**。

​	为了说明这种模式，我们将构建一个日志系统。它将由1个生产者，2消费者组成。生产者发送消息，消费者①接收到消息后把日志存储在磁盘，消费者②接收到消息后把消息打印在屏幕上。实现了生产者发送的消息，两个消费者都可以获取到。

#### Exchanges

##### Exchanges 概念

​	RabbitMQ 消息传递模型的核心思想是: **生产者发送的消息从不会直接发送到队列**。

​	相反，**生产者只能将消息发送到交换机**，交换机工作的内容非常简单，一方面它接收来自生产者的消息，另一方面将它们推入队列。交换机必须确切知道如何处理收到的消息。①把这些消息放到特定队列②把他们到许多队列③丢弃它们。这就的由交换机的类型来决定。

##### Exchanges 的类型

- 直接(direct)，主题(topic) ，标题(headers) ， 扇出(fanout)

##### 默认交换机

​	前面部分我们对Exchange一无所知，但仍然能够将消息发送到队列。之前能实现的原因是因为我们使用的是**默认交换机**，我们通过空字符串**""**进行标识。

```java
channel.basicPublish("",QUEUE_NAME,null,message.getBytes());
```

​	第一个参数是交换机的名称。空字符串表示默认交换机：消息能路由发送到队列中其实是由 **routingKey**绑定 key 指定的，如果它存在的话。

#### 临时队列

​	队列的名称至关重要，我们需要指定我们的消费者去消费哪个队列的消息。

​	临时队列的特点：①随机队列名称 ②断开消费者连接自动删除

​	创建临时队列的方法：

```java
String queueName = channel.queueDeclare().getQueue();
```

#### 绑定

​	绑定其实是 exchange 和 queue 之间的桥梁，它告诉我们 exchange 和哪个队列进行绑定。（exchange 将消息推送给哪个queue ）

#### Fanout

##### Fanout 介绍

​	Fanout 这种类型非常简单。它是将接收到的所有消息广播到它知道的所有队列中。系统中默认有一些交换机类型。

| Name               | Type    | Features | Message rate in | Message rate out |      |
| :----------------- | :------ | :------- | :-------------- | :--------------- | :--- |
| (AMQP default)     | direct  | D        | 0.00/s          | 0.00/s           |      |
| amq.direct         | direct  | D        |                 |                  |      |
| amq.fanout         | fanout  | D        |                 |                  |      |
| amq.headers        | headers | D        |                 |                  |      |
| amq.match          | headers | D        |                 |                  |      |
| amq.rabbitmq.trace | topic   | D I      |                 |                  |      |
| amq.topic          | topic   | D        |                 |                  |      |

##### Fanout 实战

生产者

```java
package com.asugar.five;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;
import java.util.Scanner;
/**
 * 生产者
 */
public class Send {
    //  交换机名称
    public static final String EXCHANGE_NAME = "logs";

    public static void main(String[] args) throws Exception{
        Channel channel = RabbitMqUtils.getChannel();
        // 创建交换机
        channel.exchangeDeclare(EXCHANGE_NAME,"fanout");
        // 从控制台发送消息
        Scanner scanner = new Scanner(System.in);
        while(scanner.hasNext()){
            String msg = scanner.next();
            channel.basicPublish(EXCHANGE_NAME,"asugar",null,msg.getBytes());
            System.out.println("发布消息------>" + msg);
        }
    }
}
```

消费者①

```java
package com.asugar.five;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;
/**
 * 消费者①
 */
public class Recieve1 {
    //  交换机名称
    public static final String EXCHANGE_NAME = "logs";

    public static void main(String[] args) throws Exception{
        Channel channel = RabbitMqUtils.getChannel();
        // 创建交换机
        channel.exchangeDeclare(EXCHANGE_NAME,"fanout");
        // 创建临时队列
        String queue1 = channel.queueDeclare().getQueue();
        // 队列绑定交换机
        channel.queueBind(queue1,EXCHANGE_NAME,"asugar");
        System.out.println("消费者①消息打印屏幕,等待接受消息......");
        // 成功接受回调
        DeliverCallback deliverCallback = (consumerTag,message) -> {
            System.out.println("成功接受------>"+new String(message.getBody()));
        };
        // 接受失败回调
        CancelCallback cancelCallback = consumerTag -> {
            System.out.println("接受失败------>"+consumerTag);
        };
        channel.basicConsume(queue1,true,deliverCallback,cancelCallback);
    }
}
```

消费者②

```java
package com.asugar.five;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;
/**
 * 消费者②
 */
public class Recieve2 {
    //  交换机名称
    public static final String EXCHANGE_NAME = "logs";

    public static void main(String[] args) throws Exception{
        Channel channel = RabbitMqUtils.getChannel();
        // 创建交换机
        channel.exchangeDeclare(EXCHANGE_NAME,"fanout");
        // 创建临时队列
        String queue2 = channel.queueDeclare().getQueue();
        // 队列绑定交换机
        channel.queueBind(queue2,EXCHANGE_NAME,"asugar");
        System.out.println("消费者②消息保存本地,等待接受消息......");
        // 成功接受回调
        DeliverCallback deliverCallback = (consumerTag, message) -> {
            System.out.println("成功接受------>"+new String(message.getBody()));
        };
        // 接受失败回调
        CancelCallback cancelCallback = consumerTag -> {
            System.out.println("接受失败------>"+consumerTag);
        };
        channel.basicConsume(queue2,true,deliverCallback,cancelCallback);
    }
}
```

#### Direct

##### Direct 介绍

​	这种类型的工作方式是，消息只去到它绑定的 routingKey 队列中去。

![direct](https://i.loli.net/2021/07/23/fGv1MyTPaHEeYp6.png)

​	在上面这张图中，我们可以看到 X 绑定了两个队列，绑定类型是 direct。队列Q1 绑定键为 orange， 队列 Q2 绑定键有两个:一个绑定键为 black，另一个绑定键为 green

​	在这种绑定情况下，生产者发布消息到 exchange 上，绑定键为 orange 的消息会被发布到队列 Q1。绑定键为 blackgreen 和的消息会被发布到队列 Q2，其他消息类型的消息将被丢弃。

##### 多重绑定

![多重绑定](https://i.loli.net/2021/07/23/5PQDesKo2cMhVrG.png)

​	当然如果 exchange 的绑定类型是direct，但是它绑定的多个队列的 key 如果都相同，在这种情况下虽然绑定类型是 direct 但是它表现的就和 fanout 有点类似了，就跟广播差不多，如上图所示。

##### Direct 实战

生产者

```java
package com.asugar.six;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;
import java.util.Scanner;
public class Producer {
    public static final String EXCHANGE_NAME = "direct_logs";
    public static void main(String[] args) throws Exception{
        Channel channel = RabbitMqUtils.getChannel();
        Scanner scanner = new Scanner(System.in);
        while (scanner.hasNext()){
            String msg = scanner.next();
            String routingKey = "";
            if(msg.equals("info") || msg.equals("warning")) routingKey = "info";
            if(msg.equals("error")) routingKey = "error";
            channel.basicPublish(EXCHANGE_NAME,routingKey,null,msg.getBytes());
            System.out.println("生产者发出------>"+msg);
        }
    }
}
```

消费者①

```java
package com.asugar.six;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;

public class Custmer1 {
    public static final String EXCHANGE_NAME = "direct_logs";
    public static void main(String[] args) throws Exception{
        Channel channel = RabbitMqUtils.getChannel();
        channel.exchangeDeclare(EXCHANGE_NAME,"direct");
        channel.queueDeclare("console",false,false,false,null);
        // 多重绑定
        channel.queueBind("console",EXCHANGE_NAME,"info");
        channel.queueBind("console",EXCHANGE_NAME,"warning");
        DeliverCallback deliverCallback = (consumerTag, message) -> {
            System.out.println("消费者①成功接受------>"+new String(message.getBody()));
        };
        CancelCallback cancelCallback = consumerTag -> {
            System.out.println("接受失败------>"+consumerTag);
        };
        channel.basicConsume("console",true,deliverCallback,cancelCallback);
    }
}
```

消费者②

```java
package com.asugar.six;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;

public class Custmer2 {
    public static final String EXCHANGE_NAME = "direct_logs";
    public static void main(String[] args) throws Exception{
        Channel channel = RabbitMqUtils.getChannel();
        channel.exchangeDeclare(EXCHANGE_NAME,"direct");
        channel.queueDeclare("disk",false,false,false,null);
        channel.queueBind("disk",EXCHANGE_NAME,"error");
        DeliverCallback deliverCallback = (consumerTag, message) -> {
            System.out.println("消费者②成功接受------>"+new String(message.getBody()));
        };
        CancelCallback cancelCallback = consumerTag -> {
            System.out.println("接受失败------>"+consumerTag);
        };
        channel.basicConsume("disk",true,deliverCallback,cancelCallback);
    }
}
```

#### Topics

​	我们想接收的日志类型有 info.base 和 info.advantage，某个队列只想 info.base 的消息，那这个时候direct 就办不到了。这个时候就只能使用 topic 类型

##### Topics 要求

​	发送到 topic 交换机的消息的**routing_key **不能随意写，必须满足一定的要求，它必须是一个**单词列表**，以点号分隔开。这些单词可以是任意单词，比如说："stock.usd.nyse", "nyse.vmw", "quick.orange.rabbit"这种类型的。当然这个单词列表最多不能超过 255 个字节。

- ***：可以代替一个单词 **

- **#：可以替代零个或多个单词**

##### Topics 匹配案例

​	Q1-->绑定的是：中间带 orange 带 3 个单词的字符串(*.orange.*)

​	Q2-->绑定的是：最后一个单词是 rabbit 的 3 个单词(*.*.rabbit)，第一个单词是 lazy 的多个单词(lazy.#)

![Topic匹配](https://i.loli.net/2021/07/23/TxlViHk4u3NjrzC.png)

​	**队列绑定键是#,那么这个队列将接收所有数据，就有点像 fanout 了 **

​	**队列绑定键当中没有#和*出现，那么该队列绑定类型就是 direct 了**

##### Topics 实战

​	为了简单，所有代码放一起了。

```java
package com.asugar.seven;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.Channel;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
/**
 * 生产者
 */
public class producer {
    public static final String EXCHANGE_NAME = "topic_logs";

    public static void main(String[] args) throws Exception{
        Channel channel = RabbitMqUtils.getChannel();
        Map<String,String> bindingKeyMap = new HashMap<>();
        bindingKeyMap.put("quick.orange.rabbit","被队列 Q1Q2 接收到");
        bindingKeyMap.put("lazy.orange.elephant","被队列 Q1Q2 接收到");
        bindingKeyMap.put("quick.orange.fox","被队列 Q1 接收到");
        bindingKeyMap.put("lazy.brown.fox","被队列 Q2 接收到");
        bindingKeyMap.put("lazy.pink.rabbit","虽然满足两个绑定但只被队列 Q2 接收一次");
        bindingKeyMap.put("quick.brown.fox","不匹配任何绑定不会被任何队列接收到会被丢弃");
        bindingKeyMap.put("quick.orange.male.rabbit","是四个单词不匹配任何绑定会被丢弃");
        bindingKeyMap.put("lazy.orange.male.rabbit","是四个单词但匹配 Q2");
        for (Map.Entry<String, String> bindingKeyEntry: bindingKeyMap.entrySet()){
            String bindingKey = bindingKeyEntry.getKey();
            String message = bindingKeyEntry.getValue();
            channel.basicPublish(EXCHANGE_NAME,bindingKey, null, (bindingKey+"  "+message).getBytes("UTF-8"));
            System.out.println("生产者发出------>" + message);
        }
    }
}

/**
 * 消费者①
 */
package com.asugar.seven;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.CancelCallback;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.DeliverCallback;

public class custmer1 {
    public static final String EXCHANGE_NAME = "topic_logs";

    public static void main(String[] args) throws Exception{
        Channel channel = RabbitMqUtils.getChannel();
        channel.exchangeDeclare(EXCHANGE_NAME,"topic");
        channel.queueDeclare("Q1",false,false,false,null);
        channel.queueBind("Q1",EXCHANGE_NAME,"*.orange.*");
        System.out.println("Q1等待接受消息......");
        DeliverCallback deliverCallback = (consumerTag, message) -> {
            System.out.println("Q1成功接受------>"+new String(message.getBody()));
        };
        CancelCallback cancelCallback = consumerTag -> {
            System.out.println("接受失败------>"+consumerTag);
        };
        channel.basicConsume("Q1",true,deliverCallback,cancelCallback);
    }
}

/**
 * 消费者②
 */
package com.asugar.seven;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.CancelCallback;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.DeliverCallback;

public class custmer2 {
    public static final String EXCHANGE_NAME = "topic_logs";

    public static void main(String[] args) throws Exception{
        Channel channel = RabbitMqUtils.getChannel();
        channel.exchangeDeclare(EXCHANGE_NAME,"topic");
        channel.queueDeclare("Q2",false,false,false,null);
        channel.queueBind("Q2",EXCHANGE_NAME,"*.*.rabbit");
        channel.queueBind("Q2",EXCHANGE_NAME,"lazy.#");

        System.out.println("Q2等待接受消息......");
        DeliverCallback deliverCallback = (consumerTag, message) -> {
            System.out.println("Q2成功接受------>"+new String(message.getBody()));
        };

        CancelCallback cancelCallback = consumerTag -> {
            System.out.println("接受失败------>"+consumerTag);
        };

        channel.basicConsume("Q2",true,deliverCallback,cancelCallback);
    }
}

```

### 死信队列

#### 死信的概念

​	**queue 中的某些消息无法被消费**，这样的消息如果没有后续的处理，就变成了死信，有死信自然就有了死信队列。

​	应用场景：用户商城下单后指定时间内未支付，则自动失效。

#### 死信的来源

- 消息 TTL 过期

- 队列达到最大长度(队列满了，无法再添加数据到 mq 中)

- 消息被拒绝(basic.reject 或 basic.nack)并且 requeue=false

#### 死信的实战

##### 实战架构图

![死信](https://i.loli.net/2021/07/23/Ai3J8v9V2CDQzIq.png)

##### 消息TTL过期

​	生产者，发送的消息TTL=10s

```java
package com.asugar.eight;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;

public class send {
    // 普通交换机
    public static final String NORMAL_NAME = "normal_exchange";

    public static void main(String[] args) throws Exception{
        Channel channel = RabbitMqUtils.getChannel();
        // 设置ttl时间
        AMQP.BasicProperties properties = new AMQP.BasicProperties().builder().expiration("10000").build();
        // 发消息
        for(int i=1 ;i <= 1000000 ;i++){
            String message = "asugar" + i;
            channel.basicPublish(NORMAL_NAME,"zhangsan",properties,message.getBytes());
        }
    }
}

```

​	消费者①，当这个消费者①挂掉，会有死信队列接管，由另一个消费者②处理

```java
package com.asugar.eight;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;
import java.util.HashMap;
import java.util.Map;

public class recieve1 {
    // 普通交换机
    public static final String NORMAL_NAME = "normal_exchange";
    // 死信交换机
    public static final String DEAD_NAME = "dead_exchange";
    // 普通队列
    public static final String NORMAL_QUEUE = "normal_queue";
    // 死信队列
    public static final String DEAD_QUQUQ = "dead_queue";

    public static void main(String[] args) throws Exception{
        Channel channel = RabbitMqUtils.getChannel();
        // 创建普通和死信交换机
        channel.exchangeDeclare(NORMAL_NAME,"direct");
        channel.exchangeDeclare(DEAD_NAME,"direct");
        // 创建普通队列
        Map<String,Object> arguments = new HashMap<>();     // 参数
        arguments.put("x-dead-letter-exchange",DEAD_NAME);  // 正常队列设置死信交换机
        arguments.put("x-dead-letter-routing-key","lisi");  // 设置死信routingkey
        channel.queueDeclare(NORMAL_QUEUE,false,false,false,arguments);

        // 创建死信队列
        channel.queueDeclare(DEAD_QUQUQ,false,false,false,null);
        // 普通队列绑定普通交换机
        channel.queueBind(NORMAL_QUEUE,NORMAL_NAME,"zhangsan");
        // 死信队列绑定死信交换机
        channel.queueBind(DEAD_QUQUQ,DEAD_NAME,"lisi");

        System.out.println("消费者①等待接受消息......");

        // 成功接受回调
        DeliverCallback deliverCallback = (consumerTag, message) -> {
            System.out.println("消费者①成功------>"+new String(message.getBody()));
        };
        // 接受失败回调
        CancelCallback cancelCallback = consumerTag -> {
            System.out.println("消费者①失败------>"+consumerTag);
        };

        channel.basicConsume(NORMAL_QUEUE,true,deliverCallback,cancelCallback);

    }
}
```

​	消费者②

```java
package com.asugar.eight;
import com.asugar.utils.RabbitMqUtils;
import com.rabbitmq.client.*;

public class recieve2 {
    // 死信队列
    public static final String DEAD_QUQUQ = "dead_queue";

    public static void main(String[] args) throws Exception{
        Channel channel = RabbitMqUtils.getChannel();
        System.out.println("消费者②等待接受消息......");

        // 成功接受回调
        DeliverCallback deliverCallback = (consumerTag, message) -> {
            System.out.println("消费者②成功------>"+new String(message.getBody()));
        };
        // 接受失败回调
        CancelCallback cancelCallback = consumerTag -> {
            System.out.println("消费者②失败------>"+consumerTag);
        };
        channel.basicConsume(DEAD_QUQUQ,true,deliverCallback,cancelCallback);
    }
}
```

先启动消费者①（创建相关交换机，队列以及相关绑定），再关闭。启动生产者发送10条消息，当消息超过TTL时间，会被死信交换机接管，转发到死信队列。此时启动消费者②，可以正常处理死信消息。

![TTL-1](https://i.loli.net/2021/07/23/VBCXuObipyelPnL.png)

![TTL-2](https://i.loli.net/2021/07/23/cVsDZCpOmrNQahH.png)

##### 队列达到最大长度

​	消费者①添加一个参数

```java
arguments.put("x-max-length",6);  // 设置正常队列的长度
```

![队列达到最大长度](https://i.loli.net/2021/07/23/D2LRC3fMIyd9eVv.png)

##### 消息被拒

​	消费者①的成功回调，改为手动确认，指定拒绝"info5"消息

```java
// 成功接受回调
DeliverCallback deliverCallback = (consumerTag, message) -> {
    String msg = new String(message.getBody());
    if(msg.equals("info5")){
        System.out.println(msg+"被消费者①拒收！");
        channel.basicReject(message.getEnvelope().getDeliveryTag(),false);
    }else{
        System.out.println("消费者①成功------>"+msg);
        channel.basicAck(message.getEnvelope().getDeliveryTag(),false);
    }
};

// 接收消息 - 手动应答
channel.basicConsume(NORMAL_QUEUE,false,deliverCallback,cancelCallback);
```

### 延迟队列

#### 延迟队列概念

​	延时队列内部是**有序**的，最重要的特性就体现在它的延时属性上，延时队列中的元素是希望在指定时间到了**以后或之前**取出和处理。

#### 延迟队列使用场景

- 订单在十分钟之内未支付则自动取消 

- 新创建的店铺，如果在十天内都没有上传过商品，则自动发送消息提醒。

- 用户注册成功后，如果三天内没有登陆则进行短信提醒。 

- 用户发起退款，如果三天内没有得到处理则通知相关运营人员。 

- 预定会议后，需要在预定的时间点前十分钟通知各个与会人员参加会议

#### 消息设置TTL

![TTL](https://i.loli.net/2021/07/25/Qangh9rvNmtWkjX.png)

#### 队列设置TTL

![TTL-2](https://i.loli.net/2021/07/25/HrqAIEXPxp6Je3f.png)

#### 两者的区别

​	如果设置了队列的 TTL 属性，那么一旦消息过期，就会被队列丢弃(如果配置了死信队列被丢到死信队列中)，而第二种方式，消息即使过期，也不一定会被马上丢弃，因为消息是否过期是在即将投递到消费者之前判定的，如果当前队列有严重的消息积压情况，则已过期的消息也许还能存活较长时间。

#### 整合 SpringBoot

##### 添加依赖

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>fastjson</artifactId>
    <version>1.2.62</version>
</dependency>
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.amqp</groupId>
    <artifactId>spring-rabbit-test</artifactId>
</dependency>
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger2</artifactId>
    <version>2.9.2</version>
</dependency>
<dependency>
    <groupId>io.springfox</groupId>
    <artifactId>springfox-swagger-ui</artifactId>
    <version>2.9.2</version>
</dependency>
```

##### 配置Swagger

```java
package com.asugar.rabbitmq.config;
import org.springframework.context.annotation.*;
import springfox.documentation.*;
@Configuration
@EnableSwagger2
public class SwaggerConfig {
    @Bean
    public Docket webApiConfig(){
        return new Docket(DocumentationType.SWAGGER_2)
            .groupName("webApi")
            .apiInfo(webApiInfo())
            .select()
            .build();
    }
    private ApiInfo webApiInfo(){
        return new ApiInfoBuilder()
                .title("rabbitmq 接口文档")
                .description("本文档描述了 rabbitmq 微服务接口定义")
                .version("1.0")
                .contact(new Contact("一枚方糖","https://asugar.cn","987599519@qq.com")).build();
    }
}
```

#### 队列TTL

##### 代码架构图

​	创建两个队列 QA 和 QB，两者队列 TTL 分别设置为 10S 和 40S，然后在创建一个交换机 X 和死信交 换机 Y，它们的类型都是direct，创建一个死信队列 QD，它们的绑定关系如下：

![延迟队列](https://i.loli.net/2021/07/25/wWpdKZaI7Jb6NFh.png)

##### 配置文件类代码

```java
package com.asugar.rabbitmq.config;
/**
 * TTL队列 配置文件类代码
 */
@Configuration
public class TtlQueueConfig {
    // 普通交换机名称
    public static final String X_EXCHANGE = "X";
    // 死信交换机名称
    public static final String DEAD_Y_EXCHANGE = "Y";
    // 普通队列名称
    public static final String QueueA = "QA";
    public static final String QueueB = "QB";
    // 死信队列名称
    public static final String Dead_Queue_D = "QD";

    // 创建x交换机
    @Bean("xExchange")
    public DirectExchange xExchange(){
        return new DirectExchange(X_EXCHANGE);
    }

    // 创建y交换机
    @Bean("yExchange")
    public DirectExchange yExchange(){
        return new DirectExchange(DEAD_Y_EXCHANGE);
    }

    // 创建普通队列A  TTL = 10
    @Bean("QueueA")
    public Queue QueueA(){
        Map<String,Object> arguments = new HashMap<>(3);
        arguments.put("x-dead-letter-exchange",DEAD_Y_EXCHANGE); // 死信交换机
        arguments.put("x-dead-letter-routing-key","YD");   // 死信routingkey
        arguments.put("x-message-ttl",10000);   // 设置ttl
        return QueueBuilder.durable(QueueA).withArguments(arguments).build();
    }

    // 创建普通队列B  TTL = 10
    @Bean("QueueB")
    public Queue QueueB(){
        Map<String,Object> arguments = new HashMap<>(3);
        arguments.put("x-dead-letter-exchange",DEAD_Y_EXCHANGE); // 死信交换机
        arguments.put("x-dead-letter-routing-key","YD");   // 死信routingkey
        arguments.put("x-message-ttl",40000);   // 设置ttl
        return QueueBuilder.durable(QueueB).withArguments(arguments).build();
    }

    // 创建死信队列D
    @Bean("QueueD")
    public Queue QueueD(){
        return QueueBuilder.durable(Dead_Queue_D).build();
    }

    // QueueA绑定X交换机
    @Bean
    public Binding QueueA_BindingX(@Qualifier("QueueA") Queue QueueA, @Qualifier("yExchange") DirectExchange yExchange){
        return BindingBuilder.bind(QueueA).to(yExchange).with("XA");
    }

    // QueueB绑定X交换机
    @Bean
    public Binding QueueB_BindingX(@Qualifier("QueueB") Queue QueueB, @Qualifier("xExchange") DirectExchange xExchange){
        return BindingBuilder.bind(QueueB).to(xExchange).with("XB");
    }

    // QueueD绑定Y交换机
    @Bean
    public Binding QueueD_BindingY(@Qualifier("QueueD") Queue QueueD, @Qualifier("xExchange") DirectExchange xExchange){
        return BindingBuilder.bind(QueueD).to(xExchange).with("YD");
    }
    
}
```

##### 生产者

```java
 @GetMapping("sendMsg/{msg}")
public void sendMsg(@PathVariable String msg){
	log.info("当前时间：{},发送{}---->给两个队列",new Date().toString(),msg);
	rabbitTemplate.convertAndSend("X","XA","TTL=10--->"+msg);
	rabbitTemplate.convertAndSend("X","XB","TTL=40--->"+msg);
}
```

##### 消费者

```java
@RabbitListener(queues = "QD")
public void receiveMsg(Message message, Channel channel) throws Exception{
	String msg = new String(message.getBody());
	log.info("当前时间：{},收到消息------>{}",new Date().toString(),msg);
}
```

​	第一条消息在 10S 后变成了死信消息，然后被消费者消费掉，第二条消息在 40S 之后变成了死信消息， 然后被消费掉，这样一个延时队列就打造完成了。 

​	不过，如果这样使用的话，岂不是每增加一个新的时间需求，就要新增一个队列，这里只有 10S 和 40S 两个时间选项，如果需要一个小时后处理，那么就需要增加TTL 为一个小时的队列，如果是预定会议室然后提前通知这样的场景，岂不是要增加无数个队列才能满足需求？

#### 延迟队列优化（消息TTL）

##### 代码架构图

​	在这里新增了一个队列 QC,绑定关系如下,该队列不设置TTL时间。

![TTL-3](https://ftp.bmp.ovh/imgs/2021/07/8ff14bdeff0a4bb9.png)

​	把延迟放到生产者生产的时候，而不是发送后。这样任何时长的延迟经过QC都可以满足要求。

##### 配置文件类代码

```java
// 创建普通队列C
@Bean("QueueC")
public Queue QueueC(){
    Map<String,Object> arguments = new HashMap<>(2);
    arguments.put("x-dead-letter-exchange",DEAD_Y_EXCHANGE); // 死信交换机
    arguments.put("x-dead-letter-routing-key","YD");   // 死信routingkey
    return QueueBuilder.durable(QueueC).withArguments(arguments).build();
}

// QueueC绑定X交换机
    @Bean
    public Binding QueueC_BindingX(@Qualifier("QueueC") Queue QueueC, @Qualifier("xExchange") DirectExchange xExchange){
        return BindingBuilder.bind(QueueC).to(xExchange).with("XC");
    }
```

##### 生产者

```java
@GetMapping("sendExpirationMsg/{msg}/{ttl}")
public void sendExpirationMsg(@PathVariable String msg,@PathVariable  String ttl){
    log.info("当前时间：{},发送{}---->给队列C---->并延迟{}s",new Date().toString(),msg,ttl);
    rabbitTemplate.convertAndSend("X","XC",msg,message -> {
        // 设置延迟时间
        message.getMessageProperties().setExpiration(ttl);
        return message;
    });
}
```

​	**消息TTL会导致消息不会按时死亡**，因为**RabbitMQ 只会检查第一个消息是否过期**，如果过期则丢到死信队列， 如果第一个消息的延时时长很长，而第二个消息的延时时长很短，第二个消息并不会优先得到执行。

#### Rabbitmq 插件实现延迟队列

​	如果不能实现在**消息粒度**上的 TTL，并使其在设置的TTL 时间**及时死亡**，就无法设计成一个通用的延时队列。那如何解决呢，接下来我们就去解决该问题。

##### 安装延时队列插件

​	进入RabbitMQ 的安装目录下的 plgins 目录，执行下面命令让该插件生效，然后重启RabbitMQ

​	插件移动--->   **/usr/lib/rabbitmq/lib/rabbitmq_server-3.8.8/plugins** 

​	执行--->  **rabbitmq-plugins enable rabbitmq_delayed_message_exchange**

##### 代码架构图

![插件](https://i.loli.net/2021/07/25/vhnwp8lUyrOKtiZ.png)

##### 配置文件类代码

```java
package com.asugar.rabbitmq.config;
/**
 * 基于插件的延迟交换机
 */
@Configuration
public class DelayeQueueConfig {
    public static final String DELAYE_Queue = "DELAYE_Queue";
    public static final String DELAYE_EXCHANGE = "DELAYE_EXCHANGE";
    public static final String RoutingKey = "XX";

    @Bean
    public Queue delayeQueue(){
        return new Queue(DELAYE_Queue);
    }

    @Bean
    public CustomExchange delayeExchange(){
        Map<String,Object> arguments = new HashMap<>();
        arguments.put("x-delayed-type","direct");
        return new CustomExchange(DELAYE_EXCHANGE,"x-delayed-message",true,false,arguments);
    }

    @Bean
    public Binding delayeQueueBindingExchange(@Qualifier("delayeQueue") Queue queue, @Qualifier("delayeExchange") CustomExchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with(RoutingKey).noargs();
    }
}
```



##### 生产者

```java
@GetMapping("sendDelayMsg/{msg}/{delayTime}")
    public void sendDelayMsg(@PathVariable String msg,@PathVariable Integer delayTime){
        log.info("当前时间：{},发送{}---->给队列C---->并延迟{}s",new Date().toString(),msg,delayTime);
        rabbitTemplate.convertAndSend("DELAYE_EXCHANGE","XX",msg,message -> {
            message.getMessageProperties().setDelay(delayTime);
            return message;
        });
    }
```

##### 消费者

```java
@RabbitListener(queues = "DELAYE_Queue")
public void receiveMsg(Message message, Channel channel) throws Exception{
    String msg = new String(message.getBody());
    log.info("当前时间：{},收到消息------>内容{}",new Date().toString(),msg);
}
```

#### 总结

​	RabbitMQ 的特性：消息可靠发送、消息可靠投递、死信队列来保障消息至少被消费一次以及未被正 确处理的消息不会被丢弃，集群，可以很好的解决单点故障问题。

### 发布确认高级

​	生产环境遇到极端情况，集群挂掉，RabbitMQ 重启期间生产者消息投递失败，消息丢失，需要手动恢复。

#### 发布确认 SpringBoot

##### 确认机制

​	生产者发送的消息，交换机某种原因接受不到时，**缓存**需要定时将未成功消息重新投递。

![确认机制](https://i.loli.net/2021/07/25/UzWyGRg3d2tcxu7.png)

![架构图](https://i.loli.net/2021/07/25/l6s9AQPLCWf8eIM.png)

##### 配置文件

```java
package com.asugar.rabbitmq.config;
/**
 * 发布确认高级
 */
@Configuration
public class ConfirmConfig {

    public static final String Confirm_Exchange = "asugar";
    public static final String Confim_Queue = "asugarQueue";
    public static final String Routing_key = "hello";

    @Bean
    public DirectExchange ConfirmExchange(){
        return new DirectExchange(Confirm_Exchange);
    }

    @Bean
    public Queue ConfirmQueue(){
        return QueueBuilder.durable(Confim_Queue).build();
    }

    @Bean
    public Binding QueueBindingExchange(@Qualifier("ConfirmQueue") Queue queue,@Qualifier("ConfirmExchange") DirectExchange exchange){
        return BindingBuilder.bind(queue).to(exchange).with("hello");
    }

}
```

##### 生产者

```java
@GetMapping("/sendConfirm/{msg}")
public void sendCofirm(@PathVariable String msg){
    rabbitTemplate.convertAndSend("asugar","hello",msg);
    log.info("发送--->"+msg);
}
```

##### 回调接口

```java
package com.asugar.rabbitmq.config;
/**
 * 交换机回调接口
 */
@Slf4j
@Component
public class MyCallBack implements RabbitTemplate.ConfirmCallback {
    @Autowired
    private RabbitTemplate rabbitTemplate;
    // 注入
    @PostConstruct  // 其他注解完成，它才运行
    public void init(){
        rabbitTemplate.setConfirmCallback(this);
    }

    // 交换机确认回调 方法
    @Override
    public void confirm(CorrelationData correlationData, boolean b, String s) {
        String Id = correlationData == null ? "" : correlationData.getId();
        if(b){
            log.info("发送成功!--->ID = "+Id);
        }else{
            log.info("发送失败!--->ID = "+Id+" 原因是"+s);
        }
    }
}
```

##### 消费者

```java
@RabbitListener(queues = "asugarQueue")
public void recieveConfirmMsg(Message message){
    log.info("收到消息--->"+new String(message.getBody()));
}
```

总结：**如果消息无法到达交换机，会提示错误。如果消息到了交换机没有到队列，那么消息会被丢弃。**

#### 回退消息

##### Mandatory 参数 

​	**在仅开启了生产者确认机制的情况下，交换机接收到消息后，会直接给消息生产者发送确认消息，如果发现该消息不可路由（未到达队列），那么消息会被直接丢弃，此时生产者是不知道消息被丢弃这个事件的**。那么如何让无法被路由的消息帮我想办法处理一下？最起码通知我一声，我好自己处理啊。通过设置 mandatory 参数可以在当消息传递过程中不可达目的地时将消息返回给生产者。



##### 回调函数

```java
package com.asugar.rabbitmq.config;
/**
 * 交换机回调接口
 */
@Slf4j
@Component
public class MyCallBack implements
RabbitTemplate.ConfirmCallback,RabbitTemplate.ReturnsCallback {

    @Autowired
    private RabbitTemplate rabbitTemplate;
    // 注入
    @PostConstruct  // 其他注解完成，它才运行
    public void init(){

        rabbitTemplate.setReturnsCallback(this);
    }

    // 路由不可达 返回给生产者
    @Override
    public void returnedMessage(ReturnedMessage returnedMessage) {
        log.info("消息{},被交换机{}退回，原因{}，路由key是{}"
                ,new String(returnedMessage.getMessage().getBody())
                ,returnedMessage.getExchange(),returnedMessage.getReplyText(),returnedMessage.getRoutingKey());
    }
}
```

#### 备份交换机

​	回退消息相当于提醒你哪些没有路由成功，具体投递得手动处理很麻烦。可以备份交换机，当有不可路由消息出现，转发到备份交换机，采取**Fannot**模式将所有消息投递到与其绑定的队列。备份交换机在绑定一个队列处理这些消息，还可以建立报警队列。

![备份交换机](https://i.loli.net/2021/07/25/urnTsGI9lbP5mDY.png)

##### 修改配置类

```java
package com.asugar.rabbitmq.config;
/**
 * 发布确认高级
 */
@Configuration
public class ConfirmConfig {

    public static final String Confirm_Exchange = "asugar";
    public static final String Confim_Queue = "asugarQueue";
    public static final String Routing_key = "hello";
    // 备份交换机
    public static final String Back_Exchange = "backup";
    public static final String Backup_Queue = "BackupQueue";
    public static final String Warning_Queue = "WarningQueue";

    @Bean
    public DirectExchange ConfirmExchange(){
        // 确认交换机 将不可达消息转发给备份交换机
        return ExchangeBuilder.directExchange(Confirm_Exchange).durable(true).withArgument("alternate-exchange",Back_Exchange).build();
    }

    // 备份交换机
    @Bean
    public FanoutExchange backuExchange(){
        return new FanoutExchange(Back_Exchange);
    }

    @Bean
    public Queue BackupQueue(){
        return QueueBuilder.durable(Backup_Queue).build();
    }

    @Bean
    public Queue WarningQueue(){
        return QueueBuilder.durable(Warning_Queue).build();
    }

    @Bean
    public Binding BackupQueueBindingBackupExchange(@Qualifier("BackupQueue") Queue queue,@Qualifier("backuExchange") FanoutExchange exchange){
        return BindingBuilder.bind(queue).to(exchange);
    }

    @Bean
    public Binding WarningQueueBindingBackupExchange(@Qualifier("WarningQueue") Queue queue,@Qualifier("backuExchange") FanoutExchange exchange){
        return BindingBuilder.bind(queue).to(exchange);
    }

}
```

##### 结果分析

​	mandatory 参数与备份交换机可以一起使用的时候，如果两者同时开启，消息究竟何去何从？谁优先 级高，经过上面结果显示答案是**备份交换机优先级高**。

### RabbitMQ 其他知识点

#### 幂等性

##### 消费重复消费

​	消费者在消费 MQ 中的消息时，MQ 已把消息发送给消费者，消费者在给MQ **返回 ack 时网络中断**， 故 MQ 未收到确认信息，该条消息会重新发给其他的消费者，或者在网络重连后再次发送给该消费者，但实际上该消费者已成功消费了该条消息，**造成消费者消费了重复的消息**。

##### 解决思路

​	使用全局ID，每次消费时用ID判断该消息是否已经消费过。

##### 消费端的幂等性保障

​	业界主流的幂等性有两种操作:a. 唯一 ID+指纹码机制,利用数据库主键去重, b.利用 redis 的原子性去实现

##### 唯一ID+指纹码机制

​	指纹码:我们的一些规则或者时间戳加别的服务给到的唯一信息码,但是一定要保证唯一性。优势就是实现简单就一个拼接，然后查询判断是否重复；劣势就是在高并发时，如果是单个数据库就会有写入性能瓶颈当然也可以采用分库分表提升性能，但也不是我们最推荐的方式。

##### Redis 原子性 

​	利用 redis 执行 setnx 命令，天然具有幂等性。从而实现不重复消费

#### 优先级队列

##### 使用场景

​	在我们系统中有一个**订单催付的场景**，商城下单后设定时间内未付款会推送一个提示。客户分为大客户和小客户，大客户的订单优先处理。采用RabbitMQ，检测是大客户给一个高优先级，否则默认优先级。

##### 如何添加

​	控制台添加

![优先级](https://i.loli.net/2021/07/26/InGqfE3MaUOzAdF.png)

​	代码修改

```java
// 生产者创建队列加上优先级
Map<String ,Object> argument = new HashMap<>();
argument.put("x-max-priority",10);
channel.queueDeclare(QUEUE_NAME,false,false,false,argument);

// 发送的消息加上优先级
AMQP.BasicProperties properties = new AMQP.BasicProperties().builder().priority(5).build();
channel.basicPublish("",QUEUE_NAME,properties,msg.getBytes());
```

#### 惰性队列

##### 使用场景

​	惰性队列会尽可能的将消息存入**磁盘**中。当MQ中堆积了几百万数据，而消费者宕机了，那么这些数据占用很大的内存，存入磁盘就解决了内存问题。

##### 两种模式

​	**default**和**lazy**

```java
// 创建队列是加上参数
Map<String, Object> args = new HashMap<String, Object>();
args.put("x-queue-mode", "lazy");
channel.queueDeclare("myqueue", false, false, false, args);
```

​	在发送1百万条消息，每条消息占 1KB 的情况下，普通队列占用内存是 1.2GB，而惰性队列仅仅占用 1.5MB

### RabbitMQ 集群

#### clustering

##### 为什么用集群

​	RabbitMQ 服务器遇到内存崩溃、机器掉电或者主板故障等情况怎么办？服务器需要1s处理10万条消息，而单台RabbitMQ 每秒1000条，难道要买高配置的服务器？搭建集群才是王道。

##### 搭建步骤

1. 修改3台机器的主机名称，**vim /etc/hostname**，分别改成node1、node2、node3

![image-20210726172537464](https://i.loli.net/2021/07/26/qcwQpldYM6EnWsV.png)

2. 确保各个节点的 cookie 文件使用的是同一个值

   在 node1 上执行远程操作命令

   ```bash
   scp /var/lib/rabbitmq/.erlang.cookie root@node2:/var/lib/rabbitmq/.erlang.cookie
   scp /var/lib/rabbitmq/.erlang.cookie root@node3:/var/lib/rabbitmq/.erlang.cookie
   ```

3. 三台主机都重启 **rabbitmq-server -detached**

4. 在节点 2 、3执行

   ```bash
   rabbitmqctl stop_app
   rabbitmqctl reset
   rabbitmqctl join_cluster rabbit@node1
   rabbitmqctl start_app
   ```
