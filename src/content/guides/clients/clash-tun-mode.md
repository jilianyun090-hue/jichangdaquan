---
title: "Clash TUN 模式详解：让所有软件走代理"
description: "TUN 模式是什么、和系统代理的区别、什么时候需要开、开启后断网怎么办。"
category: "clients"
order: 4
tags: ["TUN", "Clash", "进阶"]
---

默认的「系统代理」只能接管听话的软件（浏览器等）。TUN 模式能接管几乎所有流量。

## 系统代理 vs TUN 模式

| | 系统代理 | TUN 模式 |
|---|---|---|
| 原理 | 设置系统 HTTP/SOCKS 代理 | 创建虚拟网卡接管全部流量 |
| 覆盖范围 | 遵守代理设置的软件 | 几乎所有软件 |
| 需要权限 | 否 | 需要管理员 / 安装服务 |
| 适合 | 日常浏览 | 命令行、游戏、不认代理的 App |

## 什么时候需要开 TUN

- 用 `git`、`npm`、`pip` 等命令行工具连不上 GitHub / 境外源。
- 某些桌面软件 / 游戏不走系统代理。
- 想要「全局接管」省心。

## 怎么开

Clash Verge Rev：设置里打开 **TUN Mode**，首次会要求安装系统服务 / 授予权限，照提示点同意。

## 开启后断网怎么办

这是常见坑，通常是以下原因：

1. **DNS 配置问题** → 在设置里启用 Clash 的 DNS，或检查「DNS」开关。
2. **系统代理和 TUN 同时开冲突** → 一般保留 TUN、关掉系统代理试试。
3. **规则没放行国内流量** → 换一个完善的规则集。

详细排查见 [TUN 开启后断网](/guide/troubleshooting/connected-no-internet/) 与 [DNS 泄露与异常](/guide/troubleshooting/dns-leak/)。
