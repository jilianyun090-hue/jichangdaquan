// 机场数据生成脚本。
// 作用：把下面的清单批量生成为 src/content/airports/*.md。
// 只录入「名称 + 注册链接 + 备用链接」等已知信息；价格/流量/线路/评分等
// 一律留空、证据等级标「待复测」，绝不编造。后续核实后再逐个补字段。
//
// 用法：  npm run gen:airports
// 已存在的文件不会覆盖（除非设置 OVERWRITE=1），方便你改过的数据不被重置。

import { mkdir, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../src/content/airports');
const OVERWRITE = process.env.OVERWRITE === '1';

// 去重说明：
//  - 极连云：两个 jlyvipaff 域名，合并为主链接 + 备用链接。
//  - 速界：speed-world.cc 与 speedworldaff.com 同名同邀请码，合并保留两个链接。
//  - firefly / 无忧链接：同域名 fireflyaff，不同邀请码与名称，分别保留。
const AIRPORTS = [
  { name: '极连云', slug: 'jilianyun', url: 'https://haozevpn.jlyvipaff.com/#/?code=hBq1VTw4', backups: ['https://vipmjj01.jlyvipaff.com/#/?code=hBq1VTw4'] },
  { name: '大哥云', slug: 'dageyun', url: 'https://aff02.dgy02.com/#/register?code=T0q7hXMH' },
  { name: '龙猫云', slug: 'longmaoyun', url: 'https://inv05.lmaff01.cc/register?aff=fQgKL9YC' },
  { name: '飞鸟', slug: 'feiniao', url: 'https://fbinv02.fbaff.cc/auth/register?code=tKfsJoVl' },
  { name: '光速云', slug: 'guangsuyun', url: 'https://kjlq01.gsyvipaff.cc/#/?code=b1OTkTeL' },
  { name: '花云', slug: 'huayun', url: 'https://api-flowercloud.com/aff.php?aff=16018' },
  { name: '光年梯', slug: 'guangnianti', url: 'https://gnt001.gntvipaff.cc/#/?code=j1ufpE44' },
  { name: '星岛梦', slug: 'xingdaomeng', url: 'https://wuyou202001.xdmvipaff.cc/#/?code=olWCiAhj' },
  { name: '全球云', slug: 'quanqiuyun', url: 'https://haozevpn.gcvipaff.cc/#/?code=WRQJc2v4' },
  { name: '奈云', slug: 'naiyun', url: 'https://www.anyaff.cc?path=register&code=A612DB2z' },
  { name: '隐云', slug: 'yinyun', url: 'https://wkacc.xyz/?code=711d7afb' },
  { name: '山海机场', slug: 'shanhai', url: 'https://shanhai.sbs/#/register?code=qVTbPfWP' },
  { name: 'Lizione', slug: 'lizione', url: 'https://lizione.vip/#/register?code=Wmf3jYMy' },
  { name: 'Edge-X', slug: 'edge-x', url: 'https://edge-invite.com/#/register?code=73ienU2h' },
  { name: '青云梯', slug: 'qingyunti', url: 'https://a09.qytaff02.cc/register?aff=FSYW2vrc' },
  { name: '寰宇云', slug: 'huanyuyun', url: 'https://vip3.huanyuyunbest.com/#/register?code=K6h5VWw2' },
  { name: '瞬云', slug: 'shunyun', url: 'https://ddd.jichang.best/#/register?code=o4I4kToe' },
  { name: '哆啦A梦', slug: 'doraemon', url: 'https://store.yyds2-doraemon.site/login/register?invite_code=5VxQMw0k' },
  { name: '飞猫云', slug: 'feimaoyun', url: 'https://flycat.flycatvipaff.cc/#/?code=1arEKHqh' },
  { name: '极速云', slug: 'jisuyun', url: 'https://tg.sintotgch.com/#/register?code=RENHYxqv' },
  { name: '迅达VPN', slug: 'xunda', url: 'https://rcyt.ascsgg.com/register?code=lfITU4zy' },
  { name: '可达加速器', slug: 'keda', url: 'https://1.mkd997.com/?page=register&code=5KnBzRqS' },
  { name: '唯兔云', slug: 'weituyun', url: 'https://haoze.v2yunvipaff.com/#/?code=trJG2874' },
  { name: 'U1S1', slug: 'u1s1', url: 'https://haoze.vipaff.cc/#/?code=TV9ROgLG' },
  { name: '山水云', slug: 'shanshuiyun', url: 'https://ss2.byvvcsx.com/#/register?code=jkziWeb8', telegram: 'https://t.me/ssy5999' },
  { name: '秒秒云', slug: 'miaomiaoyun', url: 'https://141.11.77.26/#/register?code=g3bq7bpK', telegram: 'https://t.me/mmy7777' },
  { name: '边界云加速器', slug: 'bianjieyun', url: 'https://www.lvpn.cc/r/6UQDZT', note: '优惠券 zevpn' },
  { name: '速界', slug: 'sujie', url: 'https://calvior.speed-world.cc/#/register?code=r7IOqoY7', backups: ['https://everett7623.speedworldaff.com/#/register?code=r7IOqoY7'] },
  { name: '锦云', slug: 'jinyun', url: 'https://216.236.63.115/#/register?code=BIGc8qrQ' },
  { name: '影子VPN', slug: 'yingzi', url: 'https://www.yingzi01.com/register?code=X7XPN1cS' },
  { name: 'Runway Cloud', slug: 'runway-cloud', url: 'https://sxzofrnamc.runwayhz.com/#/register?code=A63zaSvx' },
  { name: '99吧', slug: '99ba', url: 'https://99vpn.bar/#/register?code=Uni7IOJh' },
  { name: '可信云', slug: 'kexinyun', url: 'https://haibing822.kosingaff.com/#/register?code=zcjBlIde' },
  { name: '快狸', slug: 'kuaili', url: 'https://yyo649929.kuailiaff.com/#/register?code=G56QwHto' },
  { name: '边缘节点', slug: 'bianyuanjiedian', url: 'https://zoio.edgenovaaff.cc/#/register?code=Oy1wZvzJ' },
  { name: 'Lumina', slug: 'lumina', url: 'https://luminak.net/?token=lumina#/register?code=dCgHyjFi' },
  { name: '二猫云', slug: 'ermaoyun', url: 'https://august.ermaoaff.com/#/register?code=EDo6hBTI' },
  { name: '极速cloud', slug: 'jisu-cloud', url: 'https://august.jsjc456789.com' },
  { name: 'NICE加速', slug: 'nice', url: 'https://web.nicecc.cc/#/register?code=7nNS5xdG' },
  { name: '微风网络', slug: 'weifeng', url: 'https://vip01.breezenetaff.com/#/?code=JxFsshSn' },
  { name: '灵猫', slug: 'lingmao', url: 'https://haozevpn.civetaff.com/#/?code=1pboeliL' },
  { name: '无忧链接', slug: 'wuyou', url: 'https://haozevpn.fireflyaff.com/#/?code=XQ4fNPfi' },
  { name: 'Firefly', slug: 'firefly', url: 'http://haozevpn.fireflyaff.com/#/?code=t1Xo1DdU' },
  { name: '跨界云', slug: 'kuajieyun', url: 'https://haozevpn.kuajieaff.com/#/?code=dp4EdOAa' },
  { name: '云图', slug: 'yuntu', url: 'https://super.ytjcok.org/#/register?code=qPHQtI9a' },
  { name: '熊猫', slug: 'xiongmao', url: 'https://cl888.cailudl.com:9999/#/register?code=kBhb2LlC' },
  { name: '鲤云', slug: 'liyun', url: 'https://ly888.liydl.com:8888/#/register?code=NQtRyXxd' },
  { name: '9云', slug: '9yun', url: 'https://daoyi.jiuyyq.com' },
  { name: '鲲鹏加速', slug: 'kunpeng', url: 'https://kunpengjiasu.com/#/register?code=QAo8sMhc' },
  { name: '环球梯', slug: 'huanqiuti', url: 'https://haozevpn01.huanqiutiaff.com/#/?code=2xpedcFa' },
  { name: '榴莲云', slug: 'liulianyun', url: 'https://haibing01.liulianyunaff.com/#/?code=0lnqSPF9' },
  { name: '闪电鼠', slug: 'shandianshu', url: 'https://haozevpn.shandianshuaff.com/#/?code=htqQLwdu' },
  { name: '大佬云', slug: 'dalaoyun', url: 'https://haozevpn01.dalaoyunaff.com/#/?code=xA9jCleY' },
  { name: '神行加速', slug: 'shenxing', url: 'https://haozevpn01.shenxingaff.com/#/?code=c2XNz7jn' },
  { name: '云界线', slug: 'yunjiexian', url: 'https://yiyige163.yunjiexianaff.com/#/?code=oetFP4xi' },
  { name: '浪网', slug: 'langwang', url: 'http://haozevpn.wavenetaff.com/#/?code=DsIhwoFs' },
];

function yamlList(arr) {
  if (!arr || arr.length === 0) return '[]';
  return '\n' + arr.map((x) => `  - ${JSON.stringify(x)}`).join('\n');
}

function toMarkdown(a) {
  const lines = [];
  lines.push('---');
  lines.push(`name: ${JSON.stringify(a.name)}`);
  lines.push(`aliases: ${yamlList(a.aliases || [])}`);
  lines.push(`affiliate_url: ${JSON.stringify(a.url)}`);
  lines.push(`backup_urls: ${yamlList(a.backups || [])}`);
  if (a.telegram) lines.push(`telegram: ${JSON.stringify(a.telegram)}`);
  // 分类留空，待后续核实填写
  lines.push('tier:');
  lines.push('budget_band:');
  lines.push('use_cases: []');
  lines.push('lines: []');
  lines.push('protocols: []');
  lines.push('regions: []');
  lines.push('streaming: []');
  lines.push('payment: []');
  // 评价留空
  lines.push('price_monthly_min: null');
  lines.push('price_monthly_max: null');
  lines.push('traffic_gb: null');
  lines.push('rating: null');
  // 公信力
  lines.push('status: "正常"');
  lines.push('evidence: "待复测"');
  lines.push('affiliate_relationship: "本站链接为推广链接，可能获得返佣"');
  lines.push('pros: []');
  lines.push('cons: []');
  lines.push(`summary: ${JSON.stringify(a.note ? `${a.name}（${a.note}）。数据待复测，请以官网为准。` : `${a.name}。数据待复测，请以官网为准。`)}`);
  lines.push('featured: false');
  lines.push('weight: 0');
  lines.push('---');
  lines.push('');
  lines.push(`## ${a.name}`);
  lines.push('');
  lines.push('> ⚠️ 本页数据尚未独立核实（证据等级：待复测）。价格、流量、线路、解锁能力等以机场官网为准，请勿仅凭本页信息直接年付。');
  lines.push('');
  lines.push('### 简介');
  lines.push('');
  lines.push('_待补充。_');
  lines.push('');
  lines.push('### 套餐与价格');
  lines.push('');
  lines.push('_待复测。_');
  lines.push('');
  lines.push('### 优缺点');
  lines.push('');
  lines.push('_待复测。_');
  lines.push('');
  return lines.join('\n');
}

async function exists(p) {
  try {
    await access(p, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  let created = 0;
  let skipped = 0;
  const seen = new Set();
  for (const a of AIRPORTS) {
    if (seen.has(a.slug)) {
      console.warn(`⚠️  重复 slug: ${a.slug}（已跳过）`);
      continue;
    }
    seen.add(a.slug);
    const file = resolve(OUT_DIR, `${a.slug}.md`);
    if (!OVERWRITE && (await exists(file))) {
      skipped++;
      continue;
    }
    await writeFile(file, toMarkdown(a), 'utf8');
    created++;
  }
  console.log(`✅ 生成完成：新建 ${created}，跳过已存在 ${skipped}，共 ${seen.size} 个机场。`);
  if (skipped > 0 && !OVERWRITE) {
    console.log('   （如需覆盖已存在文件，运行：OVERWRITE=1 npm run gen:airports）');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
