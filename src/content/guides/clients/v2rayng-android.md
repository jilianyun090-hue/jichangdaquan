---
title: "v2rayNG 教程（Android）"
description: "安卓上 v2rayNG 的下载安装、导入机场订阅、更新节点与开启代理，免费开源。"
category: "clients"
order: 3
tags: ["v2rayNG", "Android", "安卓"]
---

v2rayNG 是安卓上免费开源、最通用的客户端。偏好 Clash 内核的也可以用 FlClash。

## 1. 下载安装

去 v2rayNG 的 GitHub Releases 下载 APK（选 `arm64-v8a` 版本，适配绝大多数手机），直接安装。系统提示「未知来源」时允许安装即可。

## 2. 导入机场订阅

1. 复制机场的 **订阅链接**。
2. 打开 v2rayNG → 右上角「+」或左侧菜单「订阅设置」。
3. 选「从剪贴板导入」或手动添加，粘贴订阅链接 → 保存。
4. 回到主界面，点右上角三个点 →「更新订阅」拉取节点。

## 3. 选节点、开代理

- 节点列表里点选一个，点右下角圆形按钮启动，首次会请求 VPN 权限，允许。
- 底部状态变为已连接即生效。
- 想测延迟：菜单里有「测试全部配置真连接延迟」。

## 4. FlClash（Clash 内核备选）

如果机场给的是 Clash 订阅、或你更习惯 Clash：

1. 下载 FlClash APK 安装。
2. 「配置」→ 添加 → 粘贴订阅链接。
3. 选节点、开代理，用法和桌面 Clash 一致。

## 5. 常见问题

- **更新订阅失败**：换网络重试、确认链接有效、见 [订阅更新失败](/guide/troubleshooting/subscription-update-failed/)。
- **能连但慢**：见 [延迟低但速度慢](/guide/troubleshooting/slow-speed/)。
