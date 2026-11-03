// IndexNow 主动推送脚本。
// 把站点全部网址提交给 IndexNow（Bing / Yandex 等共享），加速收录。
//
// 原理：IndexNow 要求网站根目录放一个「<key>.txt」文件、内容就是 key 本身，
// 用来证明你拥有这个域名；然后把网址 POST 给接口即可。
//
// 用法：
//   先 npm run build（生成 dist/sitemap-0.xml），再：
//   node scripts/indexnow.mjs
//
// 只推送有变化的页面也可以：node scripts/indexnow.mjs https://jichangdaquan.org/airports/youtu/ ...

import { readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const HOST = 'jichangdaquan.org';
const KEY = '0589b7fd244f0889d43717aff0088be4';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
// Bing 的 IndexNow 接口（提交到任一参与方都会共享给其它搜索引擎）
const ENDPOINT = 'https://api.indexnow.org/indexnow';

async function urlsFromSitemap() {
  const sitemapPath = resolve(__dirname, '../dist/sitemap-0.xml');
  let xml;
  try {
    xml = await readFile(sitemapPath, 'utf8');
  } catch {
    console.error('✗ 找不到 dist/sitemap-0.xml，请先运行 npm run build');
    process.exit(1);
  }
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

async function main() {
  // 命令行传了网址就只推这些，否则推 sitemap 全量
  const cliUrls = process.argv.slice(2).filter((a) => a.startsWith('http'));
  const urls = cliUrls.length > 0 ? cliUrls : await urlsFromSitemap();

  if (urls.length === 0) {
    console.error('✗ 没有可提交的网址');
    process.exit(1);
  }

  const body = {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  console.log(`→ 向 IndexNow 提交 ${urls.length} 个网址…`);
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });

  // IndexNow 返回码：200 OK / 202 Accepted 都算成功
  if (res.status === 200 || res.status === 202) {
    console.log(`✓ 提交成功（HTTP ${res.status}）。Bing 会在稍后抓取这些页面。`);
  } else {
    const text = await res.text().catch(() => '');
    console.error(`✗ 提交失败（HTTP ${res.status}）：${text}`);
    console.error('  常见原因：密钥文件还没上线（部署后才能访问 ' + KEY_LOCATION + '）、或域名不符。');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
