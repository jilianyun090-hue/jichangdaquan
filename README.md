# 机场大全 jichangdaquan.org

机场（VPN/代理订阅服务）推荐整合站。收录市面主流机场，支持按**价格、用途、线路、流媒体解锁、支付方式**多维筛选。基于 [Astro](https://astro.build) + Tailwind CSS，静态输出，部署到 Cloudflare Pages。

## 核心原则

**不编造数据。** 所有机场的价格、流量、线路、评分等字段，未经独立核实一律留空并标注证据等级「待复测」，页面明确提示以官网为准。借鉴 mofa.gg 的「实测 / 公开信息整理 / 待复测」三级证据体系建立公信力。

## 本地开发

```bash
npm install
npm run dev
```

打开 http://localhost:4321 预览。

```bash
npm run build     # 构建到 dist/
npm run preview   # 本地预览构建结果
```

## 目录结构

```
src/
├── content/
│   ├── config.ts          # 机场 + 博客的数据 schema（Zod 校验）
│   ├── airports/*.md       # 每个机场一个文件，frontmatter 即数据
│   └── blog/*.md           # 博客文章
├── data/taxonomy.ts        # 统一分类标签定义（改标签从这里改）
├── layouts/Base.astro      # SEO / OG / JSON-LD
├── components/             # Header / Footer / AirportCard / FilterTable
└── pages/
    ├── index.astro         # 首页（筛选对比）
    ├── airports/           # 列表 + 每个机场详情页
    ├── best/[case].astro   # 榜单落地页（chatgpt/netflix/cheap/game/office）
    └── blog/               # 博客
```

## 如何维护机场数据

### 补充 / 修改某个机场

直接编辑 `src/content/airports/<slug>.md` 的 frontmatter。核实数据后：

- 填入 `price_monthly_min` / `lines` / `streaming` / `regions` 等字段；
- 把 `evidence` 从 `待复测` 改为 `公开信息整理` 或 `实测`；
- 填 `verified_at: 2025-11-03`（最后核实日期）；
- 跑路/停运的机场把 `status` 改为 `停运` 或 `跑路`。

可选标签的取值范围见 `src/data/taxonomy.ts`，填错会在构建时报错（Zod 校验）。

### 新增机场

把机场加进 `scripts/gen-airports.mjs` 的 `AIRPORTS` 数组，然后：

```bash
npm run gen:airports
```

已存在的文件不会被覆盖。需要重置全部为模板：`OVERWRITE=1 npm run gen:airports`。

### 新增博客

在 `src/content/blog/` 新建 `.md`，按现有文章的 frontmatter 格式写即可。

## 部署到 Cloudflare Pages

1. 把本项目推到 GitHub。
2. Cloudflare Dashboard → Workers & Pages → Create → Pages → 连接 GitHub 仓库。
3. 构建配置：
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. 部署后在 Pages 项目的「自定义域」绑定 `jichangdaquan.org`。
5. `astro.config.mjs` 里的 `site` 已设为 `https://jichangdaquan.org`，sitemap 和 canonical 都会用它。

## 免责声明

本站为信息聚合导航站，收录信息来自公开渠道，部分链接为推广链接可能获得返佣。请在遵守所在地区法律法规的前提下使用，本站不对任何第三方服务负责。
