// 机场数据生成脚本。
// 作用：把下面的清单批量生成为 src/content/airports/*.md。
//
// 数据来源（2026-11，公开信息整理，非本站独立实测）：
//   - clash-jichang.com/airport/   （价格/流量/线路/解锁，最全）
//   - gate-rank.com/rankings/all   （价格/支付，交叉验证）
//   - huanghaiwan.com 机场榜单      （价格/状态/跑路信息）
// 三站未收录的机场，字段留空、证据标「待复测」，绝不编造。
// 价格以各站标注的最低月付（或年付折算）为准，购买前请以官网实时价复核。
//
// 用法：  npm run gen:airports            （不覆盖已存在文件）
//         OVERWRITE=1 npm run gen:airports （覆盖重建，填入最新数据）

import { mkdir, writeFile, access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../src/content/airports');
const OVERWRITE = process.env.OVERWRITE === '1';

// 价格档位：根据最低月付价归档
function bandOf(price) {
  if (price == null) return null;
  if (price < 10) return '¥10以下';
  if (price < 20) return '¥10-20';
  if (price < 30) return '¥20-30';
  if (price < 50) return '¥30-50';
  return '¥50以上';
}

// 字段说明：
//  price = 最低月付价（元，年付已折算）；gb = 月流量；
//  lines/streaming/payment/use_cases 取枚举值（见 src/data/taxonomy.ts）；
//  status: 正常/异常/停运/跑路；evidence: 公开信息整理/待复测；
//  source: 数据来源备注。无数据的机场只给 name/url。
const AIRPORTS = [
  { name: '极连云', slug: 'jilianyun', url: 'https://haozevpn.jlyvipaff.com/#/?code=hBq1VTw4', backups: ['https://vipmjj01.jlyvipaff.com/#/?code=hBq1VTw4'],
    price: 8, gb: 60, lines: ['IEPL'], protocols: ['Trojan', 'Shadowsocks'], streaming: ['Netflix', 'YouTube', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang' },
  { name: '大哥云', slug: 'dageyun', url: 'https://aff02.dgy02.com/#/register?code=T0q7hXMH',
    price: 19.9, gb: 100, lines: ['IPLC'], streaming: ['Netflix', 'YouTube'], use_cases: ['流媒体', '日常主力'], source: 'clash-jichang' },
  { name: '龙猫云', slug: 'longmaoyun', url: 'https://inv05.lmaff01.cc/register?aff=fQgKL9YC',
    status: '跑路', source: 'huanghaiwan: 确认跑路' },
  { name: '飞鸟', slug: 'feiniao', url: 'https://fbinv02.fbaff.cc/auth/register?code=tKfsJoVl',
    price: 15, gb: 100, lines: ['IEPL', '中转'], status: '异常', use_cases: ['日常主力'], source: 'huanghaiwan: 降级/大面积断连' },
  { name: '光速云', slug: 'guangsuyun', url: 'https://kjlq01.gsyvipaff.cc/#/?code=b1OTkTeL',
    price: 8.25, gb: 59, lines: ['IEPL'], streaming: ['Netflix', 'Disney+', 'YouTube', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang' },
  { name: '花云', slug: 'huayun', url: 'https://api-flowercloud.com/aff.php?aff=16018',
    price: 39, gb: 150, lines: ['BGP'], streaming: ['Netflix', 'Disney+', 'TikTok', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang (Lite 月付)' },
  { name: '光年梯', slug: 'guangnianti', url: 'https://gnt001.gntvipaff.cc/#/?code=j1ufpE44',
    price: 7.5, gb: 50, lines: ['IPLC'], protocols: ['Shadowsocks'], streaming: ['Netflix', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clash-jichang (年付折算)' },
  { name: '星岛梦', slug: 'xingdaomeng', url: 'https://wuyou202001.xdmvipaff.cc/#/?code=olWCiAhj',
    price: 16, gb: 100, lines: ['IEPL', 'IPLC'], protocols: ['Trojan', 'Shadowsocks'], streaming: ['Netflix', 'Disney+', 'YouTube', 'ChatGPT', 'TikTok'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang' },
  { name: '全球云', slug: 'quanqiuyun', url: 'https://haozevpn.gcvipaff.cc/#/?code=WRQJc2v4',
    price: 20, gb: 120, lines: ['BGP'], streaming: ['ChatGPT'], use_cases: ['AI/ChatGPT', '游戏加速'], source: 'clash-jichang (游戏/4K/8K 优化)' },
  { name: '奈云', slug: 'naiyun', url: 'https://www.anyaff.cc?path=register&code=A612DB2z',
    status: '跑路', source: 'clash-jichang: 2026年6月倒闭跑路' },
  { name: '隐云', slug: 'yinyun', url: 'https://wkacc.xyz/?code=711d7afb',
    status: '异常', source: 'clash-jichang: 极高跑路风险预警，与奈云共用平台' },
  { name: '山海机场', slug: 'shanhai', url: 'https://shanhai.sbs/#/register?code=qVTbPfWP',
    price: 3, gb: 128, lines: ['中转', '直连'], streaming: ['Netflix', 'ChatGPT'], use_cases: ['低价备用', '流媒体'], source: 'clash-jichang' },
  { name: 'Lizione', slug: 'lizione', url: 'https://lizione.vip/#/register?code=Wmf3jYMy',
    price: 10, gb: 100, lines: ['中转'], streaming: ['Netflix', 'Disney+', 'YouTube', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang' },
  { name: 'Edge-X', slug: 'edge-x', url: 'https://edge-invite.com/#/register?code=73ienU2h',
    price: 16.8, gb: 100, lines: ['IEPL'], streaming: ['Netflix', 'Disney+', 'YouTube', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang' },
  { name: '青云梯', slug: 'qingyunti', url: 'https://a09.qytaff02.cc/register?aff=FSYW2vrc',
    price: 8, gb: 60, lines: ['IPLC'], streaming: ['Netflix', 'Disney+', 'TikTok'], use_cases: ['流媒体', '低价备用'], source: 'clash-jichang (年付折算)' },
  { name: '寰宇云', slug: 'huanyuyun', url: 'https://vip3.huanyuyunbest.com/#/register?code=K6h5VWw2',
    price: 18, gb: 60, lines: ['IEPL', '直连'], streaming: ['Netflix', 'Disney+', 'ChatGPT', 'TikTok'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'gate-rank / clash-jichang' },
  { name: '瞬云', slug: 'shunyun', url: 'https://ddd.jichang.best/#/register?code=o4I4kToe',
    price: 8.25, gb: 59, lines: ['直连'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang (年付折算)' },
  { name: '哆啦A梦', slug: 'doraemon', url: 'https://store.yyds2-doraemon.site/login/register?invite_code=5VxQMw0k',
    price: 10, gb: 100, lines: ['中转'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang' },
  { name: '飞猫云', slug: 'feimaoyun', url: 'https://flycat.flycatvipaff.cc/#/?code=1arEKHqh',
    price: 7, gb: 50, lines: ['IPLC'], streaming: ['Netflix', 'Disney+', 'ChatGPT', 'TikTok'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clash-jichang (学生年付)' },
  { name: '极速云', slug: 'jisuyun', url: 'https://tg.sintotgch.com/#/register?code=RENHYxqv',
    price: 8.25, gb: 800, lines: ['中转'], streaming: ['ChatGPT', 'Netflix'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clash-jichang (年付折算)' },
  { name: '迅达VPN', slug: 'xunda', url: 'https://rcyt.ascsgg.com/register?code=lfITU4zy',
    price: 15, gb: 150, lines: ['BGP'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '外贸办公'], source: 'clash-jichang' },
  { name: '可达加速器', slug: 'keda', url: 'https://1.mkd997.com/?page=register&code=5KnBzRqS',
    price: 10, gb: 100, streaming: ['Netflix'], use_cases: ['日常主力'], source: 'clash-jichang (SD-WAN)' },
  { name: '唯兔云', slug: 'weituyun', url: 'https://haoze.v2yunvipaff.com/#/?code=trJG2874',
    price: 14.9, gb: 45, lines: ['IPLC'], use_cases: ['日常主力'], source: 'jichangz / tizidaren' },
  { name: 'U1S1', slug: 'u1s1', url: 'https://haoze.vipaff.cc/#/?code=TV9ROgLG',
    price: 8, gb: 60, lines: ['IPLC'], use_cases: ['低价备用'], source: 'tizidaren (年付折算)' },
  { name: '山水云', slug: 'shanshuiyun', url: 'https://ss2.byvvcsx.com/#/register?code=jkziWeb8', telegram: 'https://t.me/ssy5999',
    price: 14.99, gb: 100, lines: ['中转', '直连'], streaming: ['ChatGPT', 'TikTok', 'Netflix', 'Disney+'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang' },
  { name: '秒秒云', slug: 'miaomiaoyun', url: 'https://141.11.77.26/#/register?code=g3bq7bpK', telegram: 'https://t.me/mmy7777',
    price: 14, gb: 128, lines: ['中转'], streaming: ['ChatGPT', 'TikTok'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang' },
  { name: '边界云加速器', slug: 'bianjieyun', url: 'https://www.lvpn.cc/r/6UQDZT', note: '优惠券 zevpn',
    price: 12.33, gb: 50, lines: ['IEPL'], streaming: ['Netflix'], use_cases: ['流媒体'], source: 'clash-jichang (年付折算)' },
  { name: '速界', slug: 'sujie', url: 'https://calvior.speed-world.cc/#/register?code=r7IOqoY7', backups: ['https://everett7623.speedworldaff.com/#/register?code=r7IOqoY7'],
    price: 7.5, gb: 50, streaming: ['ChatGPT'], use_cases: ['AI/ChatGPT', '低价备用'], source: 'clash-jichang (年付折算)' },
  { name: '锦云', slug: 'jinyun', url: 'https://216.236.63.115/#/register?code=BIGc8qrQ',
    price: 6, gb: 50, streaming: ['Netflix', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clash-jichang / gate-rank' },
  { name: '影子VPN', slug: 'yingzi', url: 'https://www.yingzi01.com/register?code=X7XPN1cS',
    price: 18.8, gb: 150, lines: ['IEPL'], streaming: ['Netflix', 'Disney+', 'TikTok', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang' },
  { name: 'Runway Cloud', slug: 'runway-cloud', url: 'https://sxzofrnamc.runwayhz.com/#/register?code=A63zaSvx' },
  { name: '99吧', slug: '99ba', url: 'https://99vpn.bar/#/register?code=Uni7IOJh',
    price: 7.5, gb: 66, protocols: ['Shadowsocks'], streaming: ['ChatGPT'], use_cases: ['AI/ChatGPT', '低价备用'], source: 'clash-jichang (年付折算)' },
  { name: '可信云', slug: 'kexinyun', url: 'https://haibing822.kosingaff.com/#/register?code=zcjBlIde',
    price: 8, gb: 60, lines: ['IEPL'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clash-jichang (年付折算)' },
  { name: '快狸', slug: 'kuaili', url: 'https://yyo649929.kuailiaff.com/#/register?code=G56QwHto',
    price: 10, gb: 30, lines: ['IEPL'], streaming: ['Netflix', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang (年付折算)' },
  { name: '边缘节点', slug: 'bianyuanjiedian', url: 'https://zoio.edgenovaaff.cc/#/register?code=Oy1wZvzJ',
    price: 9, gb: 45, lines: ['中转'], streaming: ['ChatGPT'], use_cases: ['AI/ChatGPT', '低价备用'], source: 'clash-jichang (年付折算)' },
  { name: 'Lumina', slug: 'lumina', url: 'https://luminak.net/?token=lumina#/register?code=dCgHyjFi',
    price: 10, gb: 200, lines: ['Hysteria2', '中转'], protocols: ['Hysteria2', 'AnyTLS'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang' },
  { name: '二猫云', slug: 'ermaoyun', url: 'https://august.ermaoaff.com/#/register?code=EDo6hBTI',
    price: 20, gb: 60, lines: ['IEPL', '中转', '直连'], streaming: ['Netflix', 'Disney+', 'ChatGPT', 'YouTube'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'jichangz (实测)' },
  { name: '极速cloud', slug: 'jisu-cloud', url: 'https://august.jsjc456789.com',
    price: 8.9, gb: 100, streaming: ['Netflix', 'Disney+', 'YouTube', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clash-jichang (三网优化)' },
  { name: 'NICE加速', slug: 'nice', url: 'https://web.nicecc.cc/#/register?code=7nNS5xdG',
    price: 10, gb: 40, lines: ['IEPL'], streaming: ['ChatGPT'], use_cases: ['AI/ChatGPT'], source: 'clash-jichang (AI 专线)' },
  { name: '微风网络', slug: 'weifeng', url: 'https://vip01.breezenetaff.com/#/?code=JxFsshSn',
    price: 11.42, gb: 100, lines: ['IPLC', 'BGP'], streaming: ['Netflix'], use_cases: ['流媒体', '日常主力'], source: 'jichangz / tizidaren (年付折算)' },
  { name: '灵猫', slug: 'lingmao', url: 'https://haozevpn.civetaff.com/#/?code=1pboeliL',
    price: 7, gb: 45, lines: ['IPLC'], streaming: ['Netflix', 'HBO Max', 'Disney+', 'ChatGPT', 'TikTok'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clash-jichang (85元/年)' },
  { name: '无忧链接', slug: 'wuyou', url: 'https://haozevpn.fireflyaff.com/#/?code=XQ4fNPfi',
    price: 6.58, gb: 40, lines: ['IPLC'], streaming: ['Netflix'], use_cases: ['流媒体', '低价备用'], source: 'jichangz / tizidaren (年付折算)' },
  { name: 'Firefly', slug: 'firefly', url: 'http://haozevpn.fireflyaff.com/#/?code=t1Xo1DdU',
    price: 8, gb: 60, lines: ['IPLC'], streaming: ['Netflix', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'tizidaren (ChatGPT/Netflix 实测可用)' },
  { name: '跨界云', slug: 'kuajieyun', url: 'https://haozevpn.kuajieaff.com/#/?code=dp4EdOAa',
    price: 8, gb: 60, lines: ['IPLC'], use_cases: ['低价备用'], source: 'tizidaren (年付折算)' },
  { name: '云图', slug: 'yuntu', url: 'https://super.ytjcok.org/#/register?code=qPHQtI9a',
    price: 20, gb: 150, lines: ['IEPL'], streaming: ['Netflix', 'Disney+', 'YouTube', 'ChatGPT', 'TikTok'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang / gate-rank (金融级专线 1 倍率)' },
  { name: '熊猫', slug: 'xiongmao', url: 'https://cl888.cailudl.com:9999/#/register?code=kBhb2LlC',
    price: 4.8, gb: 50, use_cases: ['低价备用'], source: 'gate-rank' },
  { name: '鲤云', slug: 'liyun', url: 'https://ly888.liydl.com:8888/#/register?code=NQtRyXxd',
    price: 4, gb: 50, use_cases: ['低价备用'], source: 'gate-rank' },
  { name: '9云', slug: '9yun', url: 'https://daoyi.jiuyyq.com',
    price: 6, gb: 150, lines: ['中转'], protocols: ['VLESS'], streaming: ['Netflix', 'YouTube', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clash-jichang / gate-rank' },
  { name: '鲲鹏加速', slug: 'kunpeng', url: 'https://kunpengjiasu.com/#/register?code=QAo8sMhc',
    price: 12, gb: 99, streaming: ['ChatGPT', 'Netflix', 'YouTube', 'Disney+'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clash-jichang (全球原生 1.0 倍率)' },
  { name: '环球梯', slug: 'huanqiuti', url: 'https://haozevpn01.huanqiutiaff.com/#/?code=2xpedcFa',
    price: 14, lines: ['BGP'], use_cases: ['日常主力'], source: 'tizizhan (节点丰富/不限设备)' },
  { name: '榴莲云', slug: 'liulianyun', url: 'https://haibing01.liulianyunaff.com/#/?code=0lnqSPF9',
    price: 10, lines: ['BGP'], use_cases: ['低价备用'], source: 'tizizhan (低门槛月付/入门)' },
  { name: '闪电鼠', slug: 'shandianshu', url: 'https://haozevpn.shandianshuaff.com/#/?code=htqQLwdu',
    price: 8.8, lines: ['BGP'], use_cases: ['低价备用'], source: 'tizizhan (超平价/备用首选)' },
  { name: '大佬云', slug: 'dalaoyun', url: 'https://haozevpn01.dalaoyunaff.com/#/?code=xA9jCleY',
    price: 22, lines: ['IPLC'], use_cases: ['外贸办公', '日常主力'], source: 'tizizhan (商务办公/防跑路保障)' },
  { name: '神行加速', slug: 'shenxing', url: 'https://haozevpn01.shenxingaff.com/#/?code=c2XNz7jn',
    price: 15, lines: ['BGP'], streaming: ['Netflix', 'YouTube'], use_cases: ['流媒体'], source: 'tizizhan (YouTube 8K/Netflix 解锁)' },
  { name: '云界线', slug: 'yunjiexian', url: 'https://yiyige163.yunjiexianaff.com/#/?code=oetFP4xi',
    price: 18, lines: ['IEPL'], streaming: ['ChatGPT'], use_cases: ['AI/ChatGPT', '外贸办公'], source: 'tizizhan (ChatGPT无阻/高稳定性)' },
  { name: '浪网', slug: 'langwang', url: 'http://haozevpn.wavenetaff.com/#/?code=DsIhwoFs' },

  // —— 参考站新增机场（无自有邀请链接，统一走中转「官网注册」）——
  // 来源：clashxiazai / gptvpnhelper / tuijianvpn / clashx.pro（公开信息整理，价格取最低月付/起价）
  { name: '悠兔', slug: 'youtu', price: 20, gb: 100, lines: ['IEPL', '中转'], streaming: ['Netflix', 'Disney+', 'HBO Max', 'TikTok', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashxiazai / clashx.pro' },
  { name: 'WgetCloud', slug: 'wgetcloud', price: 69, lines: ['IEPL', 'BGP'], protocols: ['Trojan', 'Shadowsocks'], streaming: ['Netflix', 'HBO Max', 'Disney+', 'TikTok', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '外贸办公'], source: 'clashxiazai / gptvpnhelper' },
  { name: 'SSRDOG', slug: 'ssrdog', price: 25, gb: 150, lines: ['IPLC', 'IEPL'], streaming: ['Netflix', 'HBO Max', 'Disney+', 'TikTok', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashxiazai / clashx.pro' },
  { name: 'Boost Net', slug: 'boostnet', price: 39, gb: 200, lines: ['IEPL'], protocols: ['AnyTLS'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashxiazai / gptvpnhelper' },
  { name: 'SS-ID', slug: 'ss-id', price: 20, gb: 100, lines: ['IEPL'], streaming: ['Netflix', 'Disney+', 'TikTok', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: '鹿语云', slug: 'luyuyun', price: 19, lines: ['IEPL'], streaming: ['Netflix', 'HBO Max', 'Disney+', 'TikTok', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashxiazai' },
  { name: '一云梯', slug: 'yiyunti', price: 15, gb: 100, lines: ['IPLC'], protocols: ['Trojan'], streaming: ['Netflix', 'HBO Max', 'Disney+', 'YouTube'], use_cases: ['流媒体'], source: 'clashxiazai / clashx.pro' },
  { name: 'SpeedCAT闪电猫', slug: 'speedcat', price: 19, gb: 100, lines: ['IPLC'], streaming: ['Netflix', 'HBO Max', 'Disney+', 'YouTube', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashxiazai / clashx.pro' },
  { name: 'Riolu精灵学院', slug: 'riolu', price: 8, gb: 30, lines: ['中转', '直连'], streaming: ['Netflix', 'Disney+'], use_cases: ['流媒体', '低价备用'], source: 'clashxiazai / clashx.pro' },
  { name: '蓝帆云', slug: 'lanfanyun', price: 9.9, gb: 50, lines: ['中转', 'IPLC'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clashxiazai / clashx.pro' },
  { name: '扬帆云', slug: 'yangfanyun', price: 15.99, lines: ['IPLC'], protocols: ['VMess'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashxiazai' },
  { name: 'TNTCloud', slug: 'tntcloud', price: 20, gb: 110, lines: ['IPLC'], protocols: ['Trojan'], streaming: ['Netflix', 'Disney+', 'HBO Max', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'gptvpnhelper / clashx.pro' },
  { name: '银河云', slug: 'yinheyun', price: 18, gb: 100, lines: ['IEPL'], protocols: ['Trojan'], streaming: ['Netflix', 'Disney+', 'YouTube', 'TikTok'], use_cases: ['流媒体'], source: 'gptvpnhelper / clashx.pro' },
  { name: 'TAG', slug: 'tag', price: 61.67, gb: 500, lines: ['IEPL'], protocols: ['Shadowsocks'], streaming: ['Netflix', 'HBO Max', 'Disney+', 'Spotify'], use_cases: ['流媒体', '外贸办公'], source: 'gptvpnhelper / clashx.pro (季付折算)' },
  { name: 'Nexitally', slug: 'nexitally', price: 123, gb: 500, lines: ['BGP'], streaming: ['TikTok'], use_cases: ['外贸办公', '游戏加速'], source: 'clashx.pro (独享IP/直播)' },
  { name: 'Allblue', slug: 'allblue', price: 16.75, gb: 100, lines: ['IPLC'], streaming: ['Netflix', 'Disney+', 'YouTube', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: 'Mikasa', slug: 'mikasa', price: 15, gb: 100, lines: ['IPLC'], use_cases: ['日常主力'], source: 'clashx.pro' },
  { name: 'Tolink', slug: 'tolink', price: 16.75, gb: 100, lines: ['IEPL'], use_cases: ['日常主力'], source: 'clashx.pro' },
  { name: 'Gatern', slug: 'gatern', price: 24, gb: 120, lines: ['IPLC'], use_cases: ['日常主力'], source: 'clashx.pro' },
  { name: 'CyberGuard', slug: 'cyberguard', price: 18, gb: 100, lines: ['IEPL', 'IPLC', '中转'], streaming: ['Netflix', 'Disney+', 'HBO Max', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'gptvpnhelper / clashx.pro' },
  { name: '夜煞云', slug: 'yeshayun', price: 10, gb: 138, lines: ['中转', 'IPLC'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clashx.pro' },
  { name: 'SkyLinX', slug: 'skylinx', price: 8, gb: 50, lines: ['直连'], protocols: ['AnyTLS'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clashx.pro' },
  { name: '椰皮加速', slug: 'yepi', price: 14.9, gb: 150, lines: ['IEPL'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: 'FATCAT肥猫云', slug: 'fatcat', price: 20, gb: 120, lines: ['IEPL'], streaming: ['Netflix', 'Disney+', 'TikTok', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: 'YkkCloud', slug: 'ykkcloud', price: 14, gb: 150, lines: ['IEPL', 'IPLC'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clashx.pro (奈飞免登录)' },
  { name: '守候网络', slug: 'shouhou', price: 15, gb: 88, lines: ['中转', 'IPLC'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: '小鸡快跑', slug: 'xiaojikuaipao', price: 15, gb: 100, lines: ['IPLC'], streaming: ['Netflix', 'Disney+', 'TikTok', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: '库洛米', slug: 'kuromi', price: 32, gb: 50, streaming: ['Netflix', 'Disney+', 'TikTok', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: 'Coffee Cloud咖啡云', slug: 'coffeecloud', price: 10, gb: 130, lines: ['中转', 'IEPL'], streaming: ['ChatGPT'], use_cases: ['AI/ChatGPT', '低价备用'], source: 'clashx.pro' },
  { name: 'COCODUCK小黄鸭', slug: 'cocoduck', price: 15, gb: 150, lines: ['中转'], protocols: ['VLESS'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: 'Fastlink', slug: 'fastlink', price: 20, gb: 100, lines: ['IPLC'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: 'MESL', slug: 'mesl', price: 50, gb: 200, lines: ['IEPL'], streaming: ['ChatGPT'], use_cases: ['AI/ChatGPT', '外贸办公'], source: 'clashx.pro / huanghaiwan' },
  { name: '闪狐云', slug: 'shanhuyun', price: 20, gb: 120, lines: ['BGP', 'IPLC'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: 'Web3VPN', slug: 'web3vpn', price: 25, gb: 200, lines: ['中转', 'IPLC'], streaming: ['Netflix', 'Disney+'], use_cases: ['流媒体'], source: 'clashx.pro' },
  { name: 'Fliggy Cloud飞天猪', slug: 'fliggy', price: 20, gb: 200, lines: ['IPLC'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: '疾风云', slug: 'jifengyun', price: 11.9, gb: 50, lines: ['中转', 'IPLC'], streaming: ['Netflix', 'Disney+', 'TikTok', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clashx.pro' },
  { name: '次元链接', slug: 'ciyuan', price: 18.8, gb: 108, lines: ['IEPL'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: '阿拉丁', slug: 'aladdin', price: 18, gb: 388, lines: ['中转'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: 'AMY机场', slug: 'amy', price: 57.75, gb: 300, lines: ['IEPL'], streaming: ['Netflix', 'Disney+'], use_cases: ['流媒体', '外贸办公'], source: 'clashx.pro' },
  { name: 'Anyland', slug: 'anyland', price: 11.8, gb: 100, lines: ['中转', 'IEPL'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clashx.pro' },
  { name: '小蜜蜂', slug: 'xiaomifeng', price: 20, gb: 120, lines: ['IPLC'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: 'InfiniPort', slug: 'infiniport', price: 8, gb: 64, lines: ['中转'], use_cases: ['低价备用'], source: 'clashx.pro' },
  { name: '贝贝云', slug: 'beibeiyun', price: 9.9, gb: 80, lines: ['中转'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clashx.pro' },
  { name: '小旋风', slug: 'xiaoxuanfeng', price: 20, gb: 110, lines: ['IPLC'], streaming: ['Netflix', 'Disney+', 'TikTok', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: 'Nyxen', slug: 'nyxen', price: 10, gb: 120, lines: ['IEPL', '中转'], streaming: ['ChatGPT'], use_cases: ['AI/ChatGPT', '低价备用'], source: 'clashx.pro' },
  { name: '速云梯', slug: 'suyunti', price: 11.9, gb: 100, lines: ['中转', 'IPLC'], streaming: ['ChatGPT'], use_cases: ['AI/ChatGPT', '低价备用'], source: 'clashx.pro' },
  { name: '蛋挞云', slug: 'danta', price: 7, gb: 99, lines: ['中转'], streaming: ['TikTok', 'ChatGPT'], use_cases: ['AI/ChatGPT', '低价备用'], source: 'clashx.pro' },
  { name: '尔湾云', slug: 'erwan', price: 13.9, gb: 50, lines: ['中转', 'IPLC'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT'], source: 'clashx.pro' },
  { name: '白月光', slug: 'baiyueguang', price: 15, gb: 100, lines: ['IEPL'], streaming: ['ChatGPT'], use_cases: ['AI/ChatGPT'], source: 'clashx.pro' },
  { name: '飞机云', slug: 'feijiyun', price: 15.9, gb: 80, lines: ['中转', 'IPLC'], use_cases: ['日常主力'], source: 'clashx.pro' },
  { name: 'XXAI', slug: 'xxai', price: 16.9, gb: 100, lines: ['中转', 'IPLC', 'IEPL'], streaming: ['ChatGPT'], use_cases: ['AI/ChatGPT'], source: 'clashx.pro' },
  { name: '泡泡狗', slug: 'paopaogou', price: 14, gb: 88, lines: ['IEPL'], streaming: ['Netflix', 'Disney+', 'ChatGPT'], use_cases: ['流媒体', 'AI/ChatGPT', '低价备用'], source: 'clashx.pro' },
];

function yamlList(arr) {
  if (!arr || arr.length === 0) return '[]';
  return '\n' + arr.map((x) => `  - ${JSON.stringify(x)}`).join('\n');
}

// 线路类型的通俗说明
const LINE_DESC = {
  IEPL: 'IEPL 国际以太网专线，不过公网拥堵段，晚高峰稳定',
  IPLC: 'IPLC 国际私用租赁专线，同样绕开公网，稳定性好',
  'CN2 GIA': 'CN2 GIA 电信精品网，公网线路里的优质选择，性价比高',
  BGP: 'BGP 多线智能路由，常见且价格友好',
  中转: '境内中转到境外落地，价格低，质量取决于运营商',
  Hysteria2: 'Hysteria2 抗丢包协议，弱网环境表现更好',
  直连: '直连节点，延迟低、链路简单',
};

// 用途场景的通俗说明
const USE_DESC = {
  'AI/ChatGPT': '访问 ChatGPT、Claude 等 AI 服务',
  流媒体: '观看 Netflix、Disney+ 等流媒体',
  游戏加速: '游戏加速、降低延迟',
  日常主力: '日常浏览、办公主力使用',
  外贸办公: '外贸、跨境办公稳定连接',
  低价备用: '低价备用、轻度使用',
};

// 价格档位的一句话定位
function bandComment(price) {
  if (price == null) return '';
  if (price < 10) return '属于低价入门档，适合预算有限或作备用线路';
  if (price < 20) return '属于主流性价比档，价格和体验较均衡';
  if (price < 30) return '属于中端档，通常线路和解锁更稳定';
  if (price < 50) return '属于中高端档，多为专线、面向稳定需求';
  return '属于高端档，面向商务、高稳定或独享需求';
}

function toMarkdown(a) {
  const hasData = a.price != null || a.status === '跑路' || a.status === '停运' || a.status === '异常';
  const band = bandOf(a.price);
  const evidence = hasData ? '公开信息整理' : '待复测';
  const status = a.status || '正常';

  // 新增机场（无自有邀请链接）统一走中转链接，按钮显示「官网注册」
  const GENERIC_URL = 'https://jichang-go.org/go.php';
  const officialOnly = !a.url;
  const url = a.url || GENERIC_URL;

  const lines = [];
  lines.push('---');
  lines.push(`name: ${JSON.stringify(a.name)}`);
  lines.push(`aliases: ${yamlList(a.aliases || [])}`);
  lines.push(`affiliate_url: ${JSON.stringify(url)}`);
  lines.push(`backup_urls: ${yamlList(a.backups || [])}`);
  lines.push(`official_only: ${officialOnly}`);
  if (a.telegram) lines.push(`telegram: ${JSON.stringify(a.telegram)}`);
  lines.push('tier:');
  lines.push(band ? `budget_band: ${JSON.stringify(band)}` : 'budget_band:');
  lines.push(`use_cases: ${yamlList(a.use_cases || [])}`);
  lines.push(`lines: ${yamlList(a.lines || [])}`);
  lines.push(`protocols: ${yamlList(a.protocols || [])}`);
  lines.push('regions: []');
  lines.push(`streaming: ${yamlList(a.streaming || [])}`);
  lines.push(`payment: ${yamlList(a.payment || [])}`);
  lines.push(`price_monthly_min: ${a.price != null ? a.price : 'null'}`);
  lines.push('price_monthly_max: null');
  lines.push(`traffic_gb: ${a.gb != null ? a.gb : 'null'}`);
  lines.push('rating: null');
  lines.push(`status: ${JSON.stringify(status)}`);
  lines.push(`evidence: ${JSON.stringify(evidence)}`);
  if (hasData) lines.push('verified_at: 2026-11-02');
  lines.push('affiliate_relationship: "本站链接为推广链接，可能获得返佣"');
  lines.push('pros: []');
  lines.push('cons: []');
  // 简介
  let summary;
  if (a.status === '跑路') summary = `${a.name}已被标记为跑路，请勿充值。`;
  else if (a.status === '异常') summary = `${a.name}近期有异常反馈，建议只买月付、谨慎长约。`;
  else if (a.price != null) {
    const parts = [`${a.name}，月付 ¥${a.price} 起`];
    if (a.gb) parts.push(`${a.gb}GB/月`);
    if (a.lines && a.lines.length) parts.push(a.lines.join('/'));
    summary = parts.join('，') + '。数据为公开信息整理，以官网为准。';
  } else summary = `${a.name}。数据待复测，请以官网为准。`;
  lines.push(`summary: ${JSON.stringify(summary)}`);
  lines.push('featured: false');
  lines.push(`weight: ${a.price != null ? 10 : 0}`);
  lines.push('---');
  lines.push('');
  lines.push(`## ${a.name}`);
  lines.push('');
  if (a.status === '跑路' || a.status === '停运') {
    lines.push(`> ⛔ ${a.name} 已被标记为「${a.status}」，请勿充值，谨防损失。信息来源：${a.source || '公开渠道'}。`);
  } else if (a.status === '异常') {
    lines.push(`> ⚠️ ${a.name} 近期收到异常反馈（${a.source || '公开渠道'}）。节点可能仍可用，但建议只买月付、避免长约。`);
  } else if (hasData) {
    lines.push(`> ℹ️ 本页数据为公开信息整理（来源：${a.source || '公开渠道'}，${'2026-11'}），非本站独立实测。价格、流量、解锁能力以机场官网实时信息为准。`);
  } else {
    lines.push('> ⚠️ 本页数据尚未独立核实（证据等级：待复测）。各项信息以机场官网为准，请勿仅凭本页直接年付。');
  }
  lines.push('');

  // 跑路/停运机场：正文只做风险说明，不写推荐内容
  if (a.status === '跑路' || a.status === '停运') {
    lines.push(`### ${a.name}还能用吗？`);
    lines.push('');
    lines.push(`根据${a.source || '公开渠道'}信息，${a.name} 已被标记为「${a.status}」。这意味着节点可能已无法连接、后台无法登录或官方失联。**请勿再充值或续费**，避免资金损失。`);
    lines.push('');
    lines.push('如果你正在找替代，可到 [机场排名](/ranking/) 或 [机场列表](/airports/) 按价格和需求重新筛选，优先选运营时间长、支持月付试用的机场。怎么识别跑路信号见 [机场避坑指南](/blog/avoid-scam-airports/)。');
    lines.push('');
    return lines.join('\n');
  }

  if (hasData && a.price != null) {
    // —— 概况 ——
    lines.push(`### ${a.name}怎么样？`);
    lines.push('');
    const introParts = [`${a.name} 最低月付 ¥${a.price} 起`];
    if (a.gb) introParts.push(`每月 ${a.gb}GB 流量`);
    if (a.lines && a.lines.length) introParts.push(`采用 ${a.lines.join('、')} 线路`);
    let intro = introParts.join('，') + '。';
    const bc = bandComment(a.price);
    if (bc) intro += `价格上 ${bc}。`;
    if (a.status === '异常') intro += `不过近期有异常反馈（${a.source || '公开渠道'}），建议只买月付、谨慎长约。`;
    lines.push(intro);
    lines.push('');
    lines.push('| 项目 | 信息 |');
    lines.push('| --- | --- |');
    lines.push(`| 最低月付 | ¥${a.price} 起 |`);
    if (a.gb) lines.push(`| 月流量 | ${a.gb} GB |`);
    if (a.lines && a.lines.length) lines.push(`| 线路类型 | ${a.lines.join('、')} |`);
    if (a.protocols && a.protocols.length) lines.push(`| 协议 | ${a.protocols.join('、')} |`);
    if (a.streaming && a.streaming.length) lines.push(`| 流媒体/AI 解锁 | ${a.streaming.join('、')} |`);
    lines.push(`| 价格档位 | ${band} |`);
    lines.push('');

    // —— 线路说明 ——
    if (a.lines && a.lines.length) {
      lines.push('### 线路与稳定性');
      lines.push('');
      a.lines.forEach((l) => {
        if (LINE_DESC[l]) lines.push(`- **${l}**：${LINE_DESC[l]}。`);
      });
      lines.push('');
      lines.push('线路类型直接影响晚高峰是否卡顿，专线（IEPL/IPLC）通常比公网中转更稳。线路科普见 [线路类型详解](/guide/concepts/route/)。');
      lines.push('');
    }

    // —— 解锁能力 ——
    if (a.streaming && a.streaming.length) {
      lines.push('### 流媒体与 AI 解锁');
      lines.push('');
      lines.push(`据公开信息，${a.name} 支持解锁 ${a.streaming.join('、')}。`);
      if (a.streaming.includes('Netflix')) lines.push('看 Netflix 的使用要点见 [Netflix 解锁教程](/guide/streaming/netflix/)。');
      if (a.streaming.includes('ChatGPT')) lines.push('用 ChatGPT 的节点选择见 [ChatGPT 访问教程](/guide/streaming/chatgpt/)。');
      lines.push('');
      lines.push('解锁能力随节点和平台策略变化，请以实际测试为准。');
      lines.push('');
    }

    // —— 适合人群 ——
    if (a.use_cases && a.use_cases.length) {
      lines.push('### 适合人群');
      lines.push('');
      a.use_cases.forEach((u) => {
        if (USE_DESC[u]) lines.push(`- ${USE_DESC[u]}`);
      });
      lines.push('');
    }

    // —— 套餐与价格 ——
    lines.push(`### ${a.name}多少钱？`);
    lines.push('');
    lines.push(
      `${a.name} 最低月付 ¥${a.price} 起${a.gb ? `，含 ${a.gb}GB/月流量` : ''}。更高档位通常提供更多流量和设备数。具体套餐、年付优惠以官网结算页为准 —— 点击上方「${officialOnly ? '前往官网注册' : '前往注册'}」查看最新价格。`,
    );
    lines.push('');
    lines.push('> 建议：新手先买月付试用，确认晚高峰稳定、解锁符合需求后，再考虑季付/年付，避免踩坑。');
    lines.push('');
  } else {
    // 待复测机场
    lines.push(`### ${a.name}怎么样？`);
    lines.push('');
    lines.push(`${a.name} 目前本站尚未收集到公开的价格与线路数据（证据等级：待复测）。详细套餐、线路、解锁能力请以 ${a.name} 官网为准，可点击上方按钮前往查看。`);
    lines.push('');
    lines.push('选购前建议参考 [机场选购指南](/blog/airport-buying-guide/)，并优先在 [机场排名](/ranking/) 里选已有数据、运营稳定的机场。');
    lines.push('');
  }

  // —— 相关推荐（内链）——
  lines.push('### 相关推荐');
  lines.push('');
  lines.push('- [机场排名与排行榜](/ranking/)');
  lines.push('- [梯子 / 翻墙 VPN 推荐](/vpn-recommend/)');
  lines.push('- [全部机场列表与筛选](/airports/)');
  if (a.use_cases && a.use_cases.includes('AI/ChatGPT')) lines.push('- [ChatGPT / AI 机场榜单](/best/chatgpt/)');
  if (a.use_cases && a.use_cases.includes('流媒体')) lines.push('- [Netflix 流媒体机场榜单](/best/netflix/)');
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
  const withData = AIRPORTS.filter((a) => a.price != null || a.status !== undefined).length;
  console.log(`✅ 生成完成：写入 ${created}，跳过 ${skipped}，共 ${seen.size} 个机场，其中 ${withData} 个有公开数据。`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
