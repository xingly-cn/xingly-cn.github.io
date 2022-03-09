---
title: Python - 爬虫实战 
date: 2021-05-19 11:18:10 
tags: [Python,爬虫]
abbrlink: python-spider 
categories: python 
cover: https://z3.ax1x.com/2021/05/28/2FL2CR.jpg
top_img: transparent
---

因疫情数据源更新，导致提取json数据格式错误，无法进行下一步。

#### 1、BeautifulSoup对象的find方法

1 ）、标签名查找

```python
# 查找标题
title = soup.find('title')

# 查找a标签
a = soup.find('a')

# 查找所有a标签
a_all = soup.find_all('a')
```

2 ）、属性查找

```python
# 查找id=link1的标签
link1 = soup.find(id='link1')

# 查找id=link1的标签(另一种方法)
link1_ = soup.find(attrs={'id':'link1'})
```

3 ）、文本查找

```python
# 查找文本内容
text = soup.find(text='Elsie')
```

#### 2、获取各国疫情数据

```python
from bs4 import BeautifulSoup
import requests

# 数据源
url = 'http://ncov.dxy.cn/ncovh5/view/pneumonia'

# 请求 获取首页内容
res = requests.get(url)
home_page = res.content.decode()

# 提取数据
soup = BeautifulSoup(home_page,'lxml')
script = soup.find(id='getListByCountryTypeService2true')
print(script.contents)
```

#### 3、正则表达式

![image-20210519114431473](https://i.loli.net/2021/05/19/WItEi3vouqh2kmx.png)

​    `练习：https://regex101.com/ `

#### 4、re.findall()方法

1 ）、`re.findall(pattern,string,flag=0)`

 扫描整个string与pattern匹配的`列表`

```python
# 返回匹配的结果列表
res = re.findall('\d','hello1world2')
print(res)

# flag作用
res = re.findall('a.bc','a\nbc',re.DOTALL)	# 有了DOTALL,"."可以匹配任意字符
print(res)

# 分组
res = re.findall('a(.+)bc','alalalabc')	# a后bc前，返回区间的数据
print(res)
```

#### 5、正则r原串使用

```python
# 不使用r原串,一个转义符，需要写四次
res = re.findall('a\\\\nbc','a\\nbc')
print(res)

# 使用r原串,消除转义符带来的影响
res = re.findall(r'a\\nbc','a\\nbc')
print(res)
```

#### 6、提取疫情json数据

```python
import re
from bs4 import BeautifulSoup
import  requests

# 数据源
url = 'https://ncov.dxy.cn/ncovh5/view/pneumonia'

# 请求 获取首页内容
res = requests.get(url)
home_page = res.content.decode('utf-8')

# 提取数据
soup = BeautifulSoup(home_page,'lxml')
script = soup.find(id='getListByCountryTypeService2true')

# 正则提取json数据
json = re.findall(r'{"id":8731889.+":""}',str(script.contents))[0]
print(json)
```

#### 7、JSON与Python互转

1 ）、json ---> python

![image-20210519202538347](https://i.loli.net/2021/05/19/1kBFpqboNuEZVcn.png)

2 ）、python ---> json

![image-20210519202957396](https://i.loli.net/2021/05/19/uliw4cO1C3nUEAI.png)

```python
import json
data = '''
{
    "employees": [
        {
            "firstName": "中国",
            "lastName": "Gates"
        },
        {
            "firstName": "George",
            "lastName": "Bush"
        },
        {
            "firstName": "Thomas",
            "lastName": "Carter"
        }
    ]
}
'''

# json ---> python

json_str = json.loads(data)
print(json_str)

# python ---> json
python_str = json.dumps(json_str,ensure_ascii=False)
print(python_str)
```

