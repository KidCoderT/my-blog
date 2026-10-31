---
title: Quick Notes
description: small theories and ideas
date: 31-10-2026
tags:
  - maths
  - notes
---

Small ideas that don't fit in a full cheatsheet. Newest at the bottom.

## Cauchy–Schwarz inequality

_31-10-2026_

### What the dot product actually is

Take two vectors $u$ and $v$. The dot product is

$$
u \cdot v = |u|\,|v|\cos\theta
$$

where $\theta$ is the angle between them. But what does that _look_ like?

![[cosine-demonstration.png|Vector u at angle theta to v, with u's shadow on v marked in red as u cos theta]]

Shine a light straight down onto $v$. The **shadow** of $u$ on $v$ is the red bit. It's just the adjacent side of the triangle (CAH from SOH CAH TOA):

$$
\text{shadow} = \text{A} = \text{H}\cos\theta = |u|\cos\theta
$$

So the dot product is:

$$
u \cdot v = \underbrace{|u|\cos\theta}_{\text{shadow of } u \text{ on } v} \times \underbrace{|v|}_{\text{length of } v}
$$

That's the whole thing. **How much of $u$ points along $v$, scaled up by how long $v$ is.**

- If $v$ is a unit vector ($|v| = 1$), the dot product _is_ just the shadow length.
- Same direction ($\theta = 0$): the shadow is all of $u$, so $u \cdot v = |u|\,|v|$. As big as it gets.
- Perpendicular ($\theta = 90°$): no shadow at all, so $u \cdot v = 0$.
- Pointing away ($\theta > 90°$): the shadow lands behind, so $u \cdot v$ is negative.

### The inequality

Look at the picture again. The shadow can **never** be longer than $u$ itself. The adjacent side of a right triangle is never longer than the hypotenuse:

$$
\big|\,|u|\cos\theta\,\big| \le |u|
$$

Same thing in algebra: $-1 \le \cos\theta \le 1$, so $\cos^2\theta \le 1$. Square the dot product:

$$
\begin{aligned}
(u \cdot v)^2 &= |u|^2\,|v|^2\cos^2\theta \\
&\le |u|^2\,|v|^2
\end{aligned}
$$

That's **Cauchy–Schwarz**:

$$
(u \cdot v)^2 \le |u|^2\,|v|^2 \qquad \text{or, square-rooted,} \qquad |u \cdot v| \le |u|\,|v|
$$

It's an **equal** sign only when $\cos\theta = \pm 1$, i.e. $u$ and $v$ lie on the same line (one is a multiple of the other).

### Back to plain numbers

Now vectors don't have to be 2D $(x, y)$. They can be 3D $(x, y, z)$, or 4D $(x, y, z, w)$... basically any length. Write them as lists of real numbers:

$$
u = (a_1, a_2, \dots, a_n), \qquad v = (b_1, b_2, \dots, b_n)
$$

In components, the dot product and length are just sums:

$$
u \cdot v = \sum_{i=1}^n a_i b_i, \qquad |u|^2 = \sum_{i=1}^n a_i^2, \qquad |v|^2 = \sum_{i=1}^n b_i^2
$$

Plug those into $(u \cdot v)^2 \le |u|^2\,|v|^2$ and the vectors disappear. What's left is a fact about **any** real numbers:

$$
\left(\sum_{i=1}^n a_i b_i\right)^2 \le \left(\sum_{i=1}^n a_i^2\right)\left(\sum_{i=1}^n b_i^2\right)
$$

> Careful: the square goes on the **whole sum** on the left, $\left(\sum a_i b_i\right)^2$, not on each term.

So a geometry fact (shadows are shorter than the thing) turns into an algebra fact about lists of numbers. That's all we are doing!

**Why it's useful**: pick a clever $b$. With $b = (1, 1, \dots, 1)$:

$$
(a_1 + a_2 + \cdots + a_n)^2 \le n\,(a_1^2 + a_2^2 + \cdots + a_n^2)
$$

For two numbers that's $(a + b)^2 \le 2(a^2 + b^2)$. Free inequality!