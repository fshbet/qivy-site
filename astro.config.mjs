// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://qivy.in',
  trailingSlash: 'always',

  integrations: [
    sitemap({
      // Drafts and future-dated articles are excluded from the build, so they
      // never reach the sitemap. 404 is not a real page.
      filter: (page) => !page.includes('/404'),
    }),
  ],

  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: false,
    },
  },

  build: {
    // One directory per route, so URLs end in a trailing slash and GitHub
    // Pages serves them without a redirect.
    format: 'directory',
  },
});
