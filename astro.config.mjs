// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// 站点正式域名。部署到 Cloudflare Pages 后，这里就是你的域名。
export default defineConfig({
  site: 'https://jichangdaquan.org',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // 生成 /airports/xxx/index.html 形式的路径，SEO 更友好
    format: 'directory',
  },
});
