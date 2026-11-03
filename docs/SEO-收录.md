# SEO 收录与 IndexNow 推送

## 一次性：提交 sitemap

网站上线后，到搜索引擎站长平台各提交**一次** sitemap 索引（只提交索引即可，子文件自动被抓）：

- **Bing**：[Bing Webmaster Tools](https://www.bing.com/webmasters) → 站点地图 → 提交 `https://jichangdaquan.org/sitemap-index.xml`
- **Google**：[Search Console](https://search.google.com/search-console) → 站点地图 → 提交 `https://jichangdaquan.org/sitemap-index.xml`

提交后状态从「处理中」变「成功」，发现网址数会涨到约 150，需几小时到几天。

## IndexNow 主动推送（Bing，加速收录）

IndexNow 让你**主动通知** Bing「这些页面更新了，快来抓」，比等爬虫快。

### 原理与前提

- 根目录有密钥文件：`public/0589b7fd244f0889d43717aff0088be4.txt`（内容就是密钥本身），
  部署后可访问 `https://jichangdaquan.org/0589b7fd244f0889d43717aff0088be4.txt`。
- **必须先部署上线**，密钥文件能被公网访问，推送才会成功。

### 用法

```bash
# 1. 先构建（生成最新 sitemap）
npm run build

# 2. 推送全站网址
npm run indexnow
```

只想推送**改动过的**几个页面（例如某机场补了专属链接后）：

```bash
node scripts/indexnow.mjs https://jichangdaquan.org/airports/youtu/ https://jichangdaquan.org/ranking/
```

返回 HTTP 200 或 202 即成功。

### 建议节奏

- 首次上线：`npm run indexnow` 推一次全量。
- 之后每次更新了内容（改机场数据、发博客），构建后再推一次，或只推改动的页面。
- 不用频繁重复推送相同未变化的页面。

### 换域名 / 换密钥时

改 `scripts/indexnow.mjs` 顶部的 `HOST`、`KEY`，并把 `public/` 下的密钥文件重命名为新 `<key>.txt`、内容同步为新 key。
