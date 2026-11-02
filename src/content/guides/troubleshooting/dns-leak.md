---
title: "DNS 泄露与解析异常修复"
description: "什么是 DNS 泄露、为什么会导致打不开网站或隐私泄露，以及怎么修。"
category: "troubleshooting"
order: 4
tags: ["DNS", "泄露", "排障"]
---

DNS 问题会同时造成两类后果：打不开网站，以及隐私泄露（真实位置被看到）。

## 什么是 DNS 泄露

你以为流量都走了代理，但 **域名解析（DNS 查询）** 却走了本地运营商的 DNS。结果：

- 解析被污染 → 打不开或打开到错误页面。
- 运营商看得到你在查哪些域名 → 隐私泄露。

## 怎么检测

用 DNS 泄露检测网站（搜 "DNS leak test"），看显示的 DNS 服务器是不是你节点所在地区的。若显示你本地运营商，就是泄露了。

## 怎么修

### 1. 启用客户端的 DNS 接管

Clash 系客户端在设置里打开 **DNS** 功能，让 Clash 统一处理解析。TUN 模式下尤其必须开。

### 2. 用可信 DNS

把 DNS 指向可信的加密 DNS（如 DoH），避免污染。多数客户端规则集已内置合理 DNS 配置。

### 3. 关掉系统 / 浏览器的额外 DNS

- 浏览器的「安全 DNS / DoH」可能绕过代理，关掉。
- 系统里手动设过公共 DNS 的，排查是否和代理冲突。

### 4. 刷新 DNS 缓存

- Windows：`ipconfig /flushdns`
- macOS：`sudo dscacheutil -flushcache`

修好后重新做一次泄露检测确认。相关问题见 [连上但打不开网页](/guide/troubleshooting/connected-no-internet/)。
