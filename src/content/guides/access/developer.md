---
title: "开发者访问 GitHub / Docker / 境外源"
description: "命令行走代理、GitHub 克隆慢、npm/pip/Docker 拉取失败的解决办法。"
category: "access"
order: 2
tags: ["GitHub", "开发", "命令行"]
---

开发者常遇到：浏览器能开 GitHub，但 `git clone`、`npm install`、`docker pull` 却超时。原因是命令行默认不走系统代理。

## 核心：让命令行走代理

两种方式二选一：

### 方式 A：开 TUN 模式（最省心）

打开 Clash 的 [TUN 模式](/guide/clients/clash-tun-mode/)，命令行流量会被自动接管，无需额外配置。

### 方式 B：给命令行单独设代理

假设 Clash 的混合端口是 `7897`（以你客户端实际端口为准）：

```bash
# 临时设置（当前终端有效）
export https_proxy=http://127.0.0.1:7897
export http_proxy=http://127.0.0.1:7897
```

Windows PowerShell：

```powershell
$env:https_proxy="http://127.0.0.1:7897"
$env:http_proxy="http://127.0.0.1:7897"
```

## 各工具单独配置

**Git（走代理克隆）**
```bash
git config --global http.proxy http://127.0.0.1:7897
# 取消：git config --global --unset http.proxy
```

**npm**
```bash
npm config set proxy http://127.0.0.1:7897
npm config set https-proxy http://127.0.0.1:7897
```

**Docker**：桌面版在设置里填 HTTP/HTTPS Proxy；拉镜像慢也可配国内镜像加速。

## 还是慢 / 失败

- 确认端口号对（Clash「设置」里看混合端口）。
- 换个稳定节点，优先专线。
- 大仓库克隆建议 `git clone --depth=1` 浅克隆。
