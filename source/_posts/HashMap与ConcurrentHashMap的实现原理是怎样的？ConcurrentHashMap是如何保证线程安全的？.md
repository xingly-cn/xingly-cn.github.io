---
title: ConcurrentHashMap的实现原理是怎样的？ConcurrentHashMap是如何保证线程安全的？ 
date: 2021-07-16 09:09:01
tags: [HashMap,ConcurrentHashMap]
categories: other 
abbrlink: concurrenthashmap-in-java 
top_img: transparent
cover: https://www.baeldung.com/wp-content/uploads/2016/05/baeldung-rest-post-footer-main-1.2.0.jpg
---

#### ConcurrentHashMap线程安全

HashMap是使用频度非常高的一个K-V存储容器。在**多线程环境下**，使用**HashMap是不安全**
的，可能产生各种非期望的结果。关于HashMap线程安全问题，可参考另一篇文章：[深入解读HashMap线程安全性问题](https://www.asugar.cn/sugar/hashmap-safe.html)

针对HashMap在多线程环境下不安全这个问题，HashMap的作者认为这并不是bug，而是应该使用线程安全的HashMap。目前有如下一些方式可以获得线程安全的HashMap：

- Collections.synchronizedMap
- HashTable
- ConcurrentHashMap

其中，前两种方式由于**全局锁的问题**，存在**很严重的性能问题**。

PS：基于JDK1.8

#### JDK8 中 ConcurrentHashMap 的初始化

以无参数构造函数为例，来看一下 ConcurrentHashMap 类初始化的时候会做些什么。

```java
ConcurrentHashMap<String, String> map = new ConcurrentHashMap<>();
```

首先会执行静态代码块和初始化类变量。 主要会初始化以下这些类变量：

```java
// Unsafe mechanics
static {
    try {
        U = sun.misc.Unsafe.getUnsafe();
        Class<?> k = ConcurrentHashMap.class;
        SIZECTL = U.objectFieldOffset
            (k.getDeclaredField("sizeCtl"));
        TRANSFERINDEX = U.objectFieldOffset
            (k.getDeclaredField("transferIndex"));
        BASECOUNT = U.objectFieldOffset
            (k.getDeclaredField("baseCount"));
        CELLSBUSY = U.objectFieldOffset
            (k.getDeclaredField("cellsBusy"));
        Class<?> ck = CounterCell.class;
        CELLVALUE = U.objectFieldOffset
            (ck.getDeclaredField("value"));
        Class<?> ak = Node[].class;
        ABASE = U.arrayBaseOffset(ak);
        int scale = U.arrayIndexScale(ak);
        if ((scale & (scale - 1)) != 0)
            throw new Error("data type scale not a power of two");
        ASHIFT = 31 - Integer.numberOfLeadingZeros(scale);
    } catch (Exception e) {
        throw new Error(e);
    }
}
```

这里用到了Unsafe类，其中objectFieldOffset方法用于获取指定Field在内存中的偏移量。

#### 内部数据结构

```java
/**
 * hash表，在第一次put数据的时候才初始化，他的大小总是2的倍数。
 */
transient volatile Node<K,V>[] table;

/**
 * 用来存储一个键值对
 */
static class Node<K,V> implements Map.Entry<K,V> {
    final int hash;
    final K key;
    volatile V val;
    volatile Node<K,V> next;
}
```

这个结构可以通过下图描述出来

<img src="https://img.asugar.cn/blog/169f29dc77a0bccf.webp" alt="一枚方糖">

#### 线程安全的hash表初始化

由上文可知ConcurrentHashMap是用**table**这个**成员**变量来持有hash表的。

table的初始化采用了**延迟初始化策略**，他会在**第一次执行put**的时候**初始化table**。

- put方法源码如下

```java
public V put(K key, V value) {
    return putVal(key, value, false);
}

final V putVal(K key, V value, boolean onlyIfAbsent) {
    // 空指针抛出
    if (key == null || value == null) throw new NullPointerException();
    // 计算key的hash值
    int hash = spread(key.hashCode());
    int binCount = 0;
    for (Node<K,V>[] tab = table;;) {
        Node<K,V> f; int n, i, fh;
        // 如果table是空，初始化之
        if (tab == null || (n = tab.length) == 0)
            tab = initTable();
        // 省略...
    }
    // 省略...
}

```

- initTable源码如下

```java
private final Node<K,V>[] initTable() {
    Node<K,V>[] tab; int sc;
    // #1
    while ((tab = table) == null || tab.length == 0) {
        // sizeCtl的默认值是0，所以最先走到这的线程会进入到下面的else if判断中
        // #2
        if ((sc = sizeCtl) < 0)
            Thread.yield(); 
        // 也就是将成员变量sizeCtl的值改为-1
        // #3
        else if (U.compareAndSwapInt(this, SIZECTL, sc, -1)) {
            try {
                // 双重检查，原因会在下文分析
                // #4
                if ((tab = table) == null || tab.length == 0) {
                    int n = (sc > 0) ? sc : DEFAULT_CAPACITY; // 默认初始容量为16
                    @SuppressWarnings("unchecked")
                    Node<K,V>[] nt = (Node<K,V>[])new Node<?,?>[n];
                    // #5
                    table = tab = nt; // 创建hash表，并赋值给成员变量table
                    sc = n - (n >>> 2);
                }
            } finally {
                // #6
                sizeCtl = sc;
            }
            break;
        }
    }
    return tab;
}

```

当hash表中元素个数**超过 sizeCtl **时，**触发扩容**； 他的另一个作用类似于一个**标识**。例如，当他**等于-1**的时候，说明已经有某一线程**在执行hash表的初始化**；**小于-1**
的值表示某一线程正在对**hash表执行resize**。

这个方法首先判断**sizeCtl**是否小于0，如果小于0，直接将当前线程变为**就绪状态**的线程。

当**sizeCtl**大于等于0时，当前线程会尝试通过CAS的方式将sizeCtl的值修改为-1。修改失败的线程会进入下一轮循环，判断**sizeCtl**<0了，被yield住；修改成功的线程会继续执行下面的初始化代码。

**在new Node[]之前，要再检查一遍table是否为空**
，这里做双重检查的原因在于，如果另一个线程执行完#1代码后挂起，此时另一个初始化的线程执行完了#6的代码，此时sizeCtl是一个大于0的值，那么再切回这个线程执行的时候，是有可能重复初始化的。

然后初始化hash表，并重新计算sizeCtl的值，最终返回初始化好的hash表。

#### 线程安全的put

put操作可分为以下两类

- 当前hash表对应当前key的index上没有元素时
- 当前hash表对应当前key的index上已经存在元素时（hash碰撞）

##### hash表上没有元素时

```java
else if ((f = tabAt(tab, i = (n - 1) & hash)) == null) {
    if (casTabAt(tab, i, null,new Node<K,V>(hash, key, value, null))){
        break;  // no lock when adding to empty bin
	}
}
static final <K,V> Node<K,V> tabAt(Node<K,V>[] tab, int i) {
    return (Node<K,V>)U.getObjectVolatile(tab, ((long)i << ASHIFT) + ABASE);
}

static final <K,V> boolean casTabAt(Node<K,V>[] tab, int i,Node<K,V> c, Node<K,V> v){
    return U.compareAndSwapObject(tab, ((long)i << ASHIFT) + ABASE, c, v);
}
```

tabAt方法通过Unsafe.getObjectVolatile（）的方式获取数组对应index上的元素，getObjectVolatile作用于对应的内存偏移量。

如果获取的是空，尝试用cas的方式在数组的指定index上创建一个新的Node。

##### hash碰撞时

```java
else {
    V oldVal = null;
    // 锁f是在4.1中通过tabAt方法获取的
    // 也就是说，当发生hash碰撞时，会以链表的头结点作为锁
    synchronized (f) {
        // 这个检查的原因在于：
        // tab引用的是成员变量table，table在发生了rehash之后，原来index上的Node可能会变
        // 这里就是为了确保在put的过程中，没有收到rehash的影响，指定index上的Node仍然是f
        // 如果不是f，那这个锁就没有意义了
        if (tabAt(tab, i) == f) {
            // 确保put没有发生在扩容的过程中，fh=-1时表示正在扩容
            if (fh >= 0) {
                binCount = 1;
                for (Node<K,V> e = f;; ++binCount) {
                    K ek;
                    if (e.hash == hash &&((ek = e.key) == key ||(ek != null && key.equals(ek)))) {
                        oldVal = e.val;
                        if (!onlyIfAbsent) e.val = value;
                        break;
                    }
                    Node<K,V> pred = e;
                    if ((e = e.next) == null) {
                        // 在链表后面追加元素
                        pred.next = new Node<K,V>(hash, key,value, null);
                        break;
                    }
                }
            }
            else if (f instanceof TreeBin) {
                Node<K,V> p;
                binCount = 2;
                if ((p = ((TreeBin<K,V>)f).putTreeVal(hash, key,value)) != null) {
                    oldVal = p.val;
                    if (!onlyIfAbsent) p.val = value;
                }
            }
        }
    }
    if (binCount != 0) {
        // 如果链表长度超过8个，将链表转换为红黑树，与HashMap相同，相对于JDK7来说，优化了查找效率
        if (binCount >= TREEIFY_THRESHOLD) {
            treeifyBin(tab, i);
        }
        if (oldVal != null) return oldVal;
        break;
    }
}
```

JDK8中直接用链表的头节点做为锁，ConcurrentHashMap通过这个锁的方式，使**同一时间只有一个线程对某一链表执行put，解决了并发问题**。

#### 线程安全的扩容

put方法的最后一步是统计hash表中元素的个数，如果超过sizeCtl的值，触发扩容。

扩容的代码略长，这里不做展示

