import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  TIERS,
  BUDGET_BANDS,
  USE_CASES,
  LINES,
  PROTOCOLS,
  REGIONS,
  STREAMING,
  PAYMENTS,
  STATUSES,
  EVIDENCE_LEVELS,
  GUIDE_CATEGORY_SLUGS,
} from '../data/taxonomy';

// 机场数据集合。每个机场一个 .md 文件，frontmatter 即结构化数据。
// 价格/评分等「暂无核实」的字段一律可空，页面显示「待复测」。
const airports = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/airports' }),
  schema: z.object({
    name: z.string(),
    // 别名：用于站内搜索（有些机场有多个称呼）
    aliases: z.array(z.string()).default([]),
    // 推广注册链接（主）与备用链接。留空(null)表示「链接待补充」，卡片仍展示。
    affiliate_url: z.string().url().nullish(),
    backup_urls: z.array(z.string().url()).default([]),
    // true：走统一中转链接、按钮显示「官网注册」，不暴露具体地址（参考站新增、无自有邀请链接的机场）
    official_only: z.boolean().default(false),
    // Telegram 群组/频道
    telegram: z.string().url().optional(),

    // —— 分类标签 ——（空 YAML 键会解析为 null，用 nullish 同时接受 null/undefined）
    tier: z.enum(TIERS).nullish(),
    budget_band: z.enum(BUDGET_BANDS).nullish(),
    use_cases: z.array(z.enum(USE_CASES)).default([]),
    lines: z.array(z.enum(LINES)).default([]),
    protocols: z.array(z.enum(PROTOCOLS)).default([]),
    regions: z.array(z.enum(REGIONS)).default([]),
    streaming: z.array(z.enum(STREAMING)).default([]),
    payment: z.array(z.enum(PAYMENTS)).default([]),

    // —— 评价（可空，未核实则留空）——
    price_monthly_min: z.number().nullable().default(null),
    price_monthly_max: z.number().nullable().default(null),
    traffic_gb: z.number().nullable().default(null),
    rating: z.number().min(0).max(5).nullable().default(null),

    // —— 公信力 ——
    status: z.enum(STATUSES).default('正常'),
    evidence: z.enum(EVIDENCE_LEVELS).default('待复测'),
    verified_at: z.coerce.date().optional(),
    // 商业关系披露
    affiliate_relationship: z.string().default('本站链接为推广链接，可能获得返佣'),

    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    // 一句话简介
    summary: z.string().default(''),
    // 是否在首页精选
    featured: z.boolean().default(false),
    // 排序权重（越大越靠前）
    weight: z.number().default(0),
  }),
});

// 博客集合：教程 / 资讯 / 选购指南
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['教程', '资讯', '选购指南', '避坑']).default('教程'),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// 教程指南集合：按 mofa.gg 的知识库结构组织的原创教程
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(GUIDE_CATEGORY_SLUGS),
    // 板块内排序，越小越靠前
    order: z.number().default(100),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { airports, blog, guides };
