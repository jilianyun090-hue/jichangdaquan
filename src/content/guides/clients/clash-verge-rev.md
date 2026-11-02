---
title: "Clash Verge Rev 教程（Windows / macOS）"
description: "Clash Verge Rev 的下载安装、导入机场订阅、选节点、规则分流与 TUN 模式设置。"
category: "clients"
order: 1
tags: ["Clash", "Windows", "macOS"]
---

Clash Verge Rev 是目前 Windows / macOS 上最推荐的免费开源客户端，界面清爽、功能全。

## 1. 下载安装

去 Clash Verge Rev 的 GitHub Releases 页面下载：

- Windows：`*-x64-setup.exe`
- macOS（Apple 芯片）：`*-aarch64.dmg`；Intel 芯片选 `*-x64.dmg`

安装后首次打开，若系统提示未知来源，放行即可。

## 2. 导入机场订阅

1. 从机场后台复制 **订阅链接**。
2. 打开 Clash Verge Rev → 左侧「订阅」(Profiles)。
3. 顶部输入框粘贴订阅链接 → 点「导入」。
4. 导入成功后，点一下这个订阅卡片使其生效。

## 3. 选节点与代理模式

进入「代理」(Proxies) 页：

- **规则模式（Rule）**：国内直连、国外走代理，日常用这个。
- **全局模式（Global）**：所有流量都走代理。
- 点节点组，选一个延迟（Delay）低的节点。

页面顶部的开关打开后，系统代理即生效，浏览器就能科学上网了。

## 4. TUN 模式（让所有软件走代理）

浏览器之外的软件（如某些 App、命令行）默认不走系统代理。开启 **TUN 模式** 可接管全部流量：

- 在「设置」里打开 **TUN Mode**，首次会要求安装服务/授权。
- 详细说明见 [Clash TUN 模式详解](/guide/clients/clash-tun-mode/)。

## 5. 常见问题

- **导入失败**：检查订阅链接是否完整、机场是否正常、系统时间是否准确。
- **节点全是超时**：见 [节点全部 timeout](/guide/troubleshooting/nodes-all-timeout/)。
- **连上但打不开网页**：见 [连上但打不开](/guide/troubleshooting/connected-no-internet/)。

> 各版本界面略有差异，以你安装的最新版为准。
