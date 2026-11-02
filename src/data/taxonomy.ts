// 统一分类体系 —— 综合 ffqla / gate-rank / mofa.gg / huanghaiwan 四个参考站归纳。
// 机场数据的所有标签都应来自这里，保证筛选项和展示一致。

/** 等级：机场的资历与口碑定位 */
export const TIERS = ['老牌', '优质', '稳定', '新秀'] as const;
export type Tier = (typeof TIERS)[number];

/** 预算档位：按月付价格分 5 档 */
export const BUDGET_BANDS = [
  '¥10以下',
  '¥10-20',
  '¥20-30',
  '¥30-50',
  '¥50以上',
] as const;
export type BudgetBand = (typeof BUDGET_BANDS)[number];

/** 用途场景 */
export const USE_CASES = [
  'AI/ChatGPT',
  '流媒体',
  '游戏加速',
  '日常主力',
  '外贸办公',
  '低价备用',
] as const;
export type UseCase = (typeof USE_CASES)[number];

/** 线路类型 */
export const LINES = [
  'IEPL',
  'IPLC',
  'CN2 GIA',
  'BGP',
  '中转',
  'Hysteria2',
  '直连',
] as const;
export type Line = (typeof LINES)[number];

/** 协议 */
export const PROTOCOLS = [
  'Shadowsocks',
  'VMess',
  'VLESS',
  'Trojan',
  'Hysteria2',
  'TUIC',
  'AnyTLS',
] as const;
export type Protocol = (typeof PROTOCOLS)[number];

/** 常见节点地区 */
export const REGIONS = [
  '香港',
  '台湾',
  '日本',
  '新加坡',
  '美国',
  '韩国',
  '英国',
  '德国',
  '土耳其',
  '马来西亚',
  '阿根廷',
] as const;
export type Region = (typeof REGIONS)[number];

/** 流媒体与 AI 服务解锁 */
export const STREAMING = [
  'Netflix',
  'Disney+',
  'ChatGPT',
  'YouTube',
  'HBO Max',
  'TikTok',
  'Spotify',
] as const;
export type Streaming = (typeof STREAMING)[number];

/** 支付方式 */
export const PAYMENTS = [
  '支付宝',
  '微信',
  'USDT',
  '信用卡',
  'PayPal',
  '银联',
] as const;
export type Payment = (typeof PAYMENTS)[number];

/** 运营状态 */
export const STATUSES = ['正常', '异常', '停运', '跑路'] as const;
export type Status = (typeof STATUSES)[number];

/**
 * 证据等级 —— 借鉴 mofa.gg，是本站公信力的核心。
 * 默认一律「待复测」，经独立核实后才升级，绝不编造数据。
 */
export const EVIDENCE_LEVELS = ['实测', '公开信息整理', '待复测'] as const;
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];

/** 榜单落地页定义：best/[case] */
export const BEST_PAGES = [
  { slug: 'chatgpt', title: 'ChatGPT / AI 机场推荐', useCase: 'AI/ChatGPT' },
  { slug: 'netflix', title: 'Netflix 流媒体解锁机场推荐', useCase: '流媒体' },
  { slug: 'cheap', title: '便宜机场推荐（低价备用）', useCase: '低价备用' },
  { slug: 'game', title: '游戏加速机场推荐', useCase: '游戏加速' },
  { slug: 'office', title: '外贸办公稳定机场推荐', useCase: '外贸办公' },
] as const;

/** 状态对应的展示样式 */
export const STATUS_STYLE: Record<Status, { label: string; cls: string }> = {
  正常: { label: '正常运营', cls: 'bg-green-100 text-green-700' },
  异常: { label: '反馈异常', cls: 'bg-amber-100 text-amber-700' },
  停运: { label: '已停运', cls: 'bg-gray-200 text-gray-600' },
  跑路: { label: '已跑路', cls: 'bg-red-100 text-red-700' },
};

/** 证据等级对应的展示样式 */
export const EVIDENCE_STYLE: Record<EvidenceLevel, { cls: string }> = {
  实测: { cls: 'bg-blue-100 text-blue-700' },
  公开信息整理: { cls: 'bg-indigo-100 text-indigo-700' },
  待复测: { cls: 'bg-gray-100 text-gray-500' },
};

// —— 教程指南板块（参考 mofa.gg 的知识库结构，内容本站原创）——
export const GUIDE_CATEGORIES = [
  {
    slug: 'getting-started',
    name: '入门',
    desc: '第一次用机场？从这里开始：选方案、买订阅、装客户端。',
    icon: '🚀',
  },
  {
    slug: 'clients',
    name: '客户端教程',
    desc: 'Windows / macOS / iOS / Android 各平台客户端的安装与订阅导入。',
    icon: '📱',
  },
  {
    slug: 'concepts',
    name: '基础概念',
    desc: '线路、协议、测速、名词解释，搞懂机场背后的原理。',
    icon: '📚',
  },
  {
    slug: 'access',
    name: '爱访问',
    desc: '怎么访问 Google、YouTube、GitHub 等常用海外网站。',
    icon: '🌐',
  },
  {
    slug: 'streaming',
    name: '流媒体解锁',
    desc: 'Netflix、Disney+、YouTube Premium、ChatGPT 的解锁与使用。',
    icon: '🎬',
  },
  {
    slug: 'troubleshooting',
    name: '故障排查',
    desc: '连不上、打不开、速度慢、ChatGPT 403……对症解决。',
    icon: '🛠️',
  },
] as const;

export type GuideCategorySlug = (typeof GUIDE_CATEGORIES)[number]['slug'];

export const GUIDE_CATEGORY_SLUGS = GUIDE_CATEGORIES.map((c) => c.slug) as [
  GuideCategorySlug,
  ...GuideCategorySlug[],
];

export function guideCategoryName(slug: string): string {
  return GUIDE_CATEGORIES.find((c) => c.slug === slug)?.name ?? slug;
}
