---
title: Java垃圾回收机制中如何判断对象需要回收？常见的GC回收算法有哪些？ 
date: 2021-07-15 12:34:51 
tags: [Java回收机制,GC算法]
categories: other 
abbrlink: garbage-collection-in-java-what-is-gc-and-how-it-works-in-the-jvm 
top_img: transparent
cover: https://www.freecodecamp.org/news/content/images/size/w2000/2021/01/GC.png
---

#### 什么是垃圾回收

垃圾回收（Garbage Collection，GC），顾名思义就是释放垃圾占用的空间，防止内存泄露。

有效的使用可以使用的内存，对内存堆中已经死亡的或者长时间没有使用的对象进行清除和回收。

#### 怎么定义垃圾

既然我们要做垃圾回收，首先我们得搞清楚垃圾的定义是什么，哪些内存是需要回收的。

#### 引用计数算法

引用计数算法（Reachability Counting）是通过在对象头中分配一个空间来保存该**对象被引用的次数（RC）**。

如果该对象被其它对象引用，则它的引用计数加1，如果删除对该对象的引用，那么它的引用计数就减1，

当该对象的引用计数为0时，那么该对象就会被回收。

```java
String m = new String("jack");
```

先创建一个字符串，这时候m引用"jack"，所以RC为1

<img src="https://mmbiz.qpic.cn/mmbiz_png/qdzZBE73hWsbhfAng9ibqfcbjrqgyRWqA0IN3crKpcmibhyypDpUSyq1G8awia1X1pAsB6VQVOAocEBUwOfRiaWoWQ/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1" height="100" align="left">

然后将 m 设置为 null，这时候"jack"的引用次数就等于0了，在引用计数算法中，意味着这块内容就需要被回收了。

<img src="https://mmbiz.qpic.cn/mmbiz_png/qdzZBE73hWsbhfAng9ibqfcbjrqgyRWqAp4xu2PFfmIzm1vPU7nqowJicHSwDdUZWiaPHSdT5EKUdhIsbTBRyZJKw/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1" height="100" align="left">

引用计数算法将垃圾回收**分摊到整个应用程序运行过程中**，监测到RC=0则回收这片内存。

因此，采用引用计数的垃圾收集**不属于**严格意义上的"Stop-The-World"的垃圾收集机制。

我们知道JVM的垃圾回收就是**"Stop-The-World"**的，那是什么原因导致我们最终放弃了引用计数算法呢？

看下面的例子。

```java
public class ReferenceCountingGC {

    public Object instance;
    public ReferenceCountingGC(String name){}
}

public static void testGC(){

    ReferenceCountingGC a = new ReferenceCountingGC("objA");
    ReferenceCountingGC b = new ReferenceCountingGC("objB");

    a.instance = b;
    b.instance = a;

    a = null;
    b = null;
}
```

1. 定义 2 个对象
2. 相互引用
3. 各自的引用置为null

<img src="https://mmbiz.qpic.cn/mmbiz_png/qdzZBE73hWsbhfAng9ibqfcbjrqgyRWqAxp8rh0Z7icLP0dkyZwoYxHRqQqX8bjHqfASaV8oPMpxv2qUvPqyHfFQ/640?wx_fmt=png" align="left">

我们可以看到，最后这 2 个对象已经不可能再被访问了，但**由于他们相互引用着对方**，

导致它们的**引用计数永远都不会为 0**，通过引用计数算法，也就永远无法通知 GC 收集器回收它们发送**内存泄漏**。

#### 可达性分析算法

可达性分析算法（Reachability Analysis）的基本思路是，通过一些被称为引用链（GC Roots）的对象作为起点从这些节点开始向下搜索，搜索走过的路径被称为（RC)，当一个对象到 GC Roots 没有任何引用链相连时**
（即从 GC Roots 节点到该节点不可达）**，则证明该对象是不可用的。

<img src="https://mmbiz.qpic.cn/mmbiz_png/qdzZBE73hWsbhfAng9ibqfcbjrqgyRWqAAQhD9PcPnUPX2KbibTuazA8ONDE4NZ94xzA3MVibZ3KfQyrH0JvTH5OA/640?wx_fmt=png" align="left">

通过可达性算法，成功解决了引用计数所无法解决的问题 **“循环依赖”**，只要你无法与 GC Root 建立直接或间接的连接，系统就会判定你为可回收对象。

那这样就引申出了另一个问题，**哪些属于 GC Root**。

**Java 内存区域**

在 Java 语言中，可作为 GC Root 的对象包括以下 4 种：

- 虚拟机栈（栈帧中的本地变量表）中引用的对象
- 方法区中类静态属性引用的对象
- 方法区中常量引用的对象
- 本地方法栈中 JNI（即一般说的 Native 方法）引用的对象

<img src="https://mmbiz.qpic.cn/mmbiz_png/qdzZBE73hWsbhfAng9ibqfcbjrqgyRWqAIY2OPh2sY2v2LSunkSSIKDbJJLibCA43u7xfNaNrwxUwINmZJG78w5g/640?wx_fmt=png"  align="left">

**虚拟机栈（栈帧中的本地变量表）中引用的对象**

此时的 s，即为 GC Root，当 s 置空时，localParameter 对象也断掉了与 GC Root 的引用链，将被回收。

```java
public class StackLocalParameter {
    public StackLocalParameter(String name){}
}

public static void testGC(){
    // s引用"localParameter"对象，此时s为GC Root
    StackLocalParameter s = new StackLocalParameter("localParameter");
    // 当s=null时，"localParameter"对象与s断开，将被回收
    s = null;
}
```

**方法区中类静态属性引用的对象**
s 为 GC Root，s 置为 null，经过 GC 后，s 所指向的 properties 对象由于无法与 GC Root 建立关系被回收。

而 m 作为类的静态属性，也属于 GC Root，parameter 对象依然与 GC root 建立着连接，所以此时 parameter 对象并不会被回收。

```java
public class MethodAreaStaicProperties {
    // 类静态属性
    public static MethodAreaStaicProperties m;
    public MethodAreaStaicProperties(String name){}
}

public static void testGC(){
    // s引用"properties"对象，此时s为GC Root
    MethodAreaStaicProperties s = new MethodAreaStaicProperties("properties");
    // s.m为类静态属性引用"parameter"对象，此时s.m也是一个GC Root
    s.m = new MethodAreaStaicProperties("parameter");
    // 当s=null时，"properties"对象与s断开，将被回收
    s = null;
    // 但是"parameter"对象仍然被s.m引用，所以不会被回收
}
```

**方法区中常量引用的对象**

m 即为方法区中的常量引用，也为 GC Root，s 置为 null 后，final 对象也不会因没有与 GC Root 建立联系而被回收。

```java
public class MethodAreaStaicProperties {
    // 常量引用的对象
    public static final MethodAreaStaicProperties m = MethodAreaStaicProperties("final");
    public MethodAreaStaicProperties(String name){}
}

public static void testGC(){
    // s引用"staticProperties"对象，此时s为GC Root
    MethodAreaStaicProperties s = new MethodAreaStaicProperties("staticProperties");
    // 当s=null时，"staticProperties"对象与s断开，将被回收
    s = null;
    // 但是"final"对象仍然被常量引用，所以不会被回收
}
```

**本地方法栈中引用的对象**

任何 Native 接口都会使用某种本地方法栈，实现的本地方法接口是使用 C 连接模型，那么本地方法栈就是 C 栈。

当线程调用 Java 方法时，虚拟机会创建一个新的栈帧并压入 Java 栈。然而当它调用的是本地方法时，虚拟机会保持 Java 栈不变，不再在线程的 Java 栈中压入新的栈帧。

虚拟机只是简单地动态连接并直接调用指定的本地方法。

#### 怎么回收垃圾

如何高效地进行垃圾回收？由于 Java 虚拟机规范并没有对如何实现垃圾收集器做出明确的规定，因此各个厂商的虚拟机可以采用不同的方式来实现垃圾收集器，这里我们讨论几种常见的垃圾收集算法的核心思想。

##### 标记清除算法

<img src="https://mmbiz.qpic.cn/mmbiz_png/qdzZBE73hWsbhfAng9ibqfcbjrqgyRWqAqw4L1tR4yv6Rkcdy3UFRGyQb7DLMxgBxPvXw1h2VFdwWWjo65cjWjA/640?wx_fmt=png" height="230" align="left">

标记清除算法（Mark-Sweep）是最基础的一种垃圾回收算法，它分为 2 部分

①**先把内存区域中的这些对象进行标记，哪些属于可回收标记出来**

②**然后把这些垃圾拎出来清理掉**

就像上图一样，清理掉的垃圾就变成未使用的内存区域，等待被再次使用。

这逻辑再清晰不过了，并且也很好操作，**但它存在一个很大的问题，那就是内存碎片**。

上图中中等方块的假设是 2M，小一些的是 1M，大一些的是 4M。等我们回收完，内存就会切成了很多段。我们知道开辟内存空间时，需要的是连续的内存区域，这时候我们需要一个 2M 的内存区域，其中有 2 个 1M
是没法用的。这样就导致，其实我们本身还有这么多的内存的，但却用不了。

##### 复制算法

<img src="https://mmbiz.qpic.cn/mmbiz_png/qdzZBE73hWsbhfAng9ibqfcbjrqgyRWqAnQkibGXSoJtwnzvd1Pkoob1UnKrzeO0mWIeiaTic5c3kbQQDNIOS8Nrqw/640?wx_fmt=png" height="220" align="left">

复制算法（Copying）是在标记清除算法上演化而来，**解决**标记清除算法的**内存碎片**问题。它将**可用内存按容量划分为大小相等的两块，每次只使用其中的一块**
。当这一块的内存用完了，就将还存活着的对象复制到另外一块上面，然后再把已使用过的内存空间一次清理掉。保证了内存的连续可用，内存分配时也就不用考虑内存碎片等复杂情况，逻辑清晰，运行高效。

上面的图很清楚，也很明显的暴露了另一个问题，合着我这 140 平的大三房，只能当 70 平米的小两房来使？代价实在太高。

##### 标记整理算法

<img src="https://mmbiz.qpic.cn/mmbiz_png/qdzZBE73hWsbhfAng9ibqfcbjrqgyRWqArIX79znu7TTzkm6EVBp0UAesxQ4AwibiaPDMOQ0wxFWa394ywshe8nuQ/640?wx_fmt=png" height="280" align="left">

标记整理算法（Mark-Compact）标记过程仍然与 **标记清除算法** 一样，但后续步骤不是**直接对可回收对象进行清理**，而是让所有存活的对象都向一端移动，再清理掉端边界以外的内存区域。

标记整理算法：①解决了标记清除算法内存碎片的问题 ②也规避了复制算法只能利用一半内存区域的弊端。看起来很美好，但从上图可以看到，它对**内存变动更频繁**，**需要整理所有存活对象的引用地址**，在效率上比复制算法要**差**很多。

##### 分代收集算法

严格来说是融合上述 3 种基础的算法思想，针对不同情况采用不同的回收算法。**按照对象存活周期划分为几块**

一般是把 Java 堆分为**新生代**和**老年代**，这样就可以根据各个年代的特点采用最适当的回收算法。

- 在新生代中，每次垃圾收集时都发现有大批对象死去，只有少量存活，那就选用复制算法。

- 在老年代中因为对象存活率高、没有额外空间进行分配，就必须使用标记清理或者标记整理算法来进行回收。

So，另一个问题来了，那内存区域到底被分为哪几块，每一块又有什么特别适合什么算法呢？

#### 内存模型与回收策略

<img src="https://mmbiz.qpic.cn/mmbiz_png/qdzZBE73hWsbhfAng9ibqfcbjrqgyRWqAKiaJ2U75SGYwQhs2tuNbXtu8KIpaUsBOaHRKXf7esuuFoMjELFxibIVg/640?wx_fmt=png" height="275" align="left">

Java 堆（Java Heap）是 JVM 所管理的内存中最大的一块，堆又是垃圾收集器管理的主要区域，这里我们主要分析一下 Java 堆的结构。

Java 堆主要分为 2 个区域 ，新生代与老年代，其中新生代又分 Eden 区和 Survivor 区，其中 Survivor 区又分 From 和 To 2 个区。可能这时候大家会有疑问，为什么需要 Survivor 区，为什么
Survivor 还要分 2 个区。不着急，我们从头到尾，看看对象到底是怎么来的，而它又是怎么没的。

##### Eden 区

- 通常对象在Eden分配，空间不足则Minor GC，存活的对象会进入From区，若From区不够，进入Old区

IBM 公司的专业研究表明，有将近 98% 的对象是死亡贼快，所以大多数情况下，对象会在新生代 Eden 区中进行分配，当 Eden 区没有足够空间进行分配时，虚拟机会发起一次 Minor GC，Minor GC 相比 Major GC
更频繁，回收速度也更快。

通过 Minor GC 之后，Eden 会被清空，Eden 区中绝大部分对象会被回收，而那些无需回收的存活对象，将会进到 Survivor 的 From 区（若 From 区不够，则直接进入To区，若To区不够，进入Old区）。

##### Survivor 区

Survivor 区相当于是 Eden 区和 Old 区的一个缓冲，类似于我们交通灯中的黄灯。Survivor 又分为 2 个区，一个是 From 区，一个是 To 区。每次执行 Minor GC，会将 Eden 区和 From
存活的对象放到 Survivor 的 To 区（如果 To 区不够，则直接进入 Old 区）。

##### 为啥需要？

不就是新生代到老年代么，直接 Eden 到 Old 不好了吗，为啥要这么复杂。想想如果没有 Survivor 区，Eden 区每进行一次 Minor GC，存活的对象就会被送到老年代，老年代很快就会被填满。而有很多对象虽然一次 Minor
GC 没有消灭，但其实也并不会蹦跶多久，或许第二次，第三次就需要被清除。这时候移入老年区，很明显不是一个明智的决定。

所以，Survivor 的存在意义就是减少被送到老年代的对象，进而减少 Major GC 的发生。Survivor 的**预筛**选保证，只有**经历 16 次 Minor GC 还能在新生代中存活的对象，才会被送到老年代。**

##### 为啥需要俩？

设置两个 Survivor 区最大的好处就是解决内存碎片化。

我们先假设一下，Survivor 如果只有一个区域会怎样。Minor GC 执行后，Eden 区被清空了，存活的对象放到了 Survivor 区，而之前 Survivor
区中的对象，可能也有一些是需要被清除的。问题来了，这时候我们怎么清除它们？在这种场景下，我们只能标记清除，而我们知道标记清除最大的问题就是内存碎片，在新生代这种经常会消亡的区域，采用标记清除必然会让内存产生严重的碎片化。因为
Survivor 有 2 个区域，所以每次 Minor GC，会将之前 Eden 区和 From 区中的存活对象复制到 To 区域。第二次 Minor GC 时，From 与 To 职责兑换，这时候会将 Eden 区和 To
区中的存活对象再复制到 From 区域，以此反复。

这种机制最大的好处就是，整个过程中，**永远有一个 Survivor space 是空的，另一个非空的 Survivor space 是无碎片的。**

那么，Survivor 为什么不分更多块呢？比方说分成三个、四个、五个? 显然，如果 Survivor 区再细分下去，每一块的空间就会比较小，容易导致 Survivor 区满，两块 Survivor 区可能是经过权衡之后的最佳方案。

##### Old 区

老年代占据着 2/3 的堆内存空间，只有在 Major GC 的时候才会进行清理，每次 GC 都会触发 “Stop-The-World”。内存越大，STW
的时间也越长，所以内存也不仅仅是越大就越好。由于复制算法在对象存活率较高的老年代会进行很多次的复制操作，效率很低，所以**老年代这里采用的是标记整理算法。**

除了上述所说，在内存担保机制下，无法安置的对象会直接进到老年代，以下几种情况也会进入老年代。

**大对象**

大对象指需要大量连续内存空间的对象，这部分对象不管是不是 “朝生夕死”，都会直接进到老年代。这样做主要是为了避免在 Eden 区及 2 个 Survivor 区之间**发生大量的内存复制。**

**长期存活对象**

虚拟机给每个对象定义了一个年龄（Age）计数器。正常情况下对象会不断的在 Survivor 的 From 区与 To 区之间移动，对象在 Survivor 区中每经历一次 Minor GC，年龄就增加 1 岁。当年龄增加到 15
岁时，这时候就会被转移到老年代。当然，这里的 15，JVM 也支持进行特殊设置。

**动态对象年龄**

虚拟机并不重视要求对象年龄必须到 15 岁，才会放入老年区，如果 Survivor 空间中相同年龄所有对象大小的总合大于 Survivor 空间的一半，年龄大于等于该年龄的对象就可以直接进去老年区，无需等你 “成年”。

这其实有点类似于负载均衡，轮询是负载均衡的一种，保证每台机器都分得同样的请求。看似很均衡，但每台机的硬件不通，健康状况不同，我们还可以基于每台机接受的请求数，或每台机的响应时间等，来调整我们的负载均衡算法。

本文部分内容参考自书籍：《深入理解 Java 虚拟机》。
