---
title: Latex入门级教程 
date: 2021-04-14 23:32:08 
categories: other 
abbrlink: LaTex 
tags: [LaTex,文章排版,论文]
cover: https://z3.ax1x.com/2021/05/28/2FXf0O.jpg
top_img: transparent
---

LaTex入门级教程，将文章的排版以代码的形式呈现，符合程序员的审美和工作习惯。

<!-- more -->

LaTex下载地址：[清华大学镜像源2021版](https://mirrors.tuna.tsinghua.edu.cn/CTAN/systems/texlive/Images/texlive2021.iso)

**群①：974338156（未满）**

### 1.Latex基本框架

```latex
% 导言区
\documentclass{article} % 支持book,report,letter
\title{My First Article}
\author{Xiner}
\date{\today}	%\today 取当前时间

% 正文区
\begin{document}
	\maketitle
	Content.
\end{document}
```

- Latex默认只支持**英文** ，要想使用中文，往下继续看哦！
- %相当于注释

![image-20210414164002106](https://i.loli.net/2021/04/14/piPL2VnatIRj1Or.png)

### 2.Latex中文处理方法

- 导入ctex包（自带，无需下载）

  我们在导言区，加入以下代码。

```latex
\usepackage{ctex}	% 加入中文包
```

- 编译器修改为 **XeLaTeX**  [我使用的是TeXworks，其他的软件类似]

![image-20210414164935933](https://i.loli.net/2021/04/14/cvk5YfAjEICJ69b.png)

 好的，现在我们可以插入中文啦！赶快来试试

![image-20210414165143476](https://i.loli.net/2021/04/14/QqOTgKDaReCucf7.png)

 大功告成，我溜了。。。QAQ

### 3.Latex字体字号设置

```latex
% 字体族设置 
\textrm{罗马Apple} - \textsf{无衬线Apple} -  \texttt{打字机Apple}

% 字体形状 
\textup{直立Apple} -  \textit{斜体Apple} -  \textsl{伪斜体Apple} -  \textsc{小型大写Apple}

% 中文字体
\songti{宋体} \kaishu{楷书}

% 字体大小
\tiny Hello
\scriptsize Hello
\footnotesize Hello
\small Hello
\normalsize Hello
\large Hello
\large Hello
\LARGE Hello
\huge Hello
\Huge Hello

% 中文字号设置
\zihao{5} 你好！
```

 效果如下

![image-20210414165740186](https://i.loli.net/2021/04/14/g7P6i9jWMCzXcKd.png)

### 4.Latex文档结构

- $\section$创建小结
- $\subsection$创建子小结
- 以此类推

```latex
	\section{引言}
	今年前面的这些日子，我利用上班之余的空挡时间，喜欢走走停停，寻山问水。或行走于溪谷，垂钓于江河；或漫步于山野，观草木泅渡于春秋。
	人生天地间，当坦然面对生活给你的一切，好比站在北极点上的时候，任意跨出的一步都是南方。风吹日晒，虽然皮肤黝黑了一点，却精神饱满活力充沛，就像充电宝一样，时时不忘记充电。
	\section{实验结果}
	\subsection{数据}
	\subsubsection{实验条件}
	\subsubsection{实验过程}
	\section{结论}
```

![image-20210414175458684](https://i.loli.net/2021/04/14/qnVdN91Dt3sybao.png)

- $\tableofcontentss$生成目录

```latex
	\tableofcontents
	\section{引言}
	\section{实验结果}
	\subsection{实验条件}
	\subsection{实验过程}
	\section{结论}
```

![image-20210414181714250](https://i.loli.net/2021/04/14/Xj1d5FGcPorqQiU.png)

### 5.Latex特殊字符

```latex
	\section{空格字符}
	Are you love me?
	
	\section{\LaTeX 控制符}
	\# \$ \% \{ \} \~{} \_{} \^{} \textbackslash

	\section{排版符号}
	\S \P \dag \ddag \copyright \pounds

	\section{\TeX 标志符号}
	\TeX{} \LaTeX{} \LaTeXe{}
	
	\section{引号}
	`Hello' ``Hello''

	\section{连字符}
	- -- ---

	\section{非英文字符}
	\oe \OE \ae \AE \aa \AA \o \O \l \L \ss \SS !`?`
```

![image-20210414203901605](https://i.loli.net/2021/04/14/D7w1mCLITy6OSpY.png)![image-20210414203915638](https://i.loli.net/2021/04/14/Sk36TzpiQJZdmgD.png)

### 6.Latex插图

- 导入graphicx包

  ```latex
  \usepackage{graphicx}  % 导包
  \graphicspath{{img/}}  % 设置图片路径
  ```

- 导入图片

  ```latex
  LaTex的插图:\\			% \\用来换行
  \includegraphics{xiao}		% 图片路径 img/xiao.eps
  ```

  ![image-20210414210419118](https://i.loli.net/2021/04/14/mwTZvHPJzEKsDq7.png)

- 可选参数

    - 缩放

      ```latex
      \includegraphics[scale=0.3]{xiao}  % 原图缩放原始30%
      ```

    - 高度、宽度

      ```latex
      \includegraphics[height=2cm]{xiao}   % 原图高度2cm
      \includegraphics[width=5cm]{xiao}    % 原图宽度5cm
      ```

    - 旋转

      ```latex
      \includegraphics[angle=45]{xiao}    % 原图顺时针旋转45°
      ```

### 7.Latex表格

```latex
	\begin{tabular}{ | l | c | c | c | r |}  % {填写对齐方式l、c、r} , | 代表显示列线
	\hline		% 显示行线
	姓名 & 高数 & 英语 & 计网 & 数据库 \\
	\hline
	Xiner & 100 & 100 & 100 & 100 \\
	\hline
	Hert & 85 & 90 & 74 & 44 \\
	\hline
 	Pop & 99 & 47 & 77 & 25 \\
	\hline
	\end{tabular}
```

![image-20210414211452222](https://i.loli.net/2021/04/14/ZKs3zvw4jHEnPAR.png)

### 8.Latex浮动体

 当我们一起使用图片和表格，可能是这样的。

```latex
	插图:\\			
	\includegraphics{peo}		% 图片
	成绩:
	\begin{tabular}{ | l | c | c | c | r |}  	% 表格
	\hline		
	姓名 & 高数 & 英语 & 计网 & 数据库 \\
	\hline
	Xiner & 100 & 100 & 100 & 100 \\
	\hline
	Hert & 85 & 90 & 74 & 44 \\
	\hline
 	Pop & 99 & 47 & 77 & 25 \\
	\hline
	\end{tabular}
```

![image-20210414212313141](https://i.loli.net/2021/04/14/dUyKPbDn3kuf6jW.png)

 可是想想平时做的试卷，是不是图片放在一起，文字放在一起呢？

 那么如何做呢，这就要用到神奇的**浮动体**。

```latex
	第一题:请问图片中的人物是谁？
	\begin{figure}					% 浮动体
		\centering  % 居中
		\includegraphics{peo}
		\caption{蜡笔小新}	% 插图标题
	\end{figure}

	第二题:谁的成绩最高？
	\begin{table}					% 浮动体
		\centering 
		\begin{tabular}{ | l | c | c | c | r |} 
		\hline
		姓名 & 高数 & 英语 & 计网 & 数据库 \\
		\hline
		Xiner & 100 & 100 & 100 & 100 \\
		\hline
		Hert & 85 & 90 & 74 & 44 \\
		\hline
 		Pop & 99 & 47 & 77 & 25 \\
		\hline
		\end{tabular}
		\caption{成绩单}		% 表格标题
	\end{table}
```

![image-20210414213158635](https://i.loli.net/2021/04/14/9xXFC8uMv6O3ncd.png)

 是不是有那味了？数学试卷的排版，图文并茂的数学题就是这么来的！

### 9.Latex数学公式初步

```latex
\section{上标}   
$7x^4 + 2x + 1 = 0$  $3x^{20} + x - 1 = 0$

\section{下标}
$O_2 , H_2 , a_1 , a_2 ,...,a_{100} $

\section{希腊字母}
$\alpha$ $\beta$ $\gamma$ $\epsilon$ $\pi$ $\Delta$ $\Theta$

\section{数学函数}
$\log$ $\sin$ $\cos$ $\arcsin$ $\arccos$ $\tan$ $\ln$ 
$\sin^2 + \cos^2 = 1$

\section{分式}
$\frac{x^2}{x^2+1}$

\section{行间公式}
$$7x^4 + 2x + 1 = 0$$
```

![image-20210414231759647](https://i.loli.net/2021/04/14/JMICsNqSGdXaDUe.png)![image-20210414231923054](https://i.loli.net/2021/04/14/EBVTit5FK39dnsO.png)

