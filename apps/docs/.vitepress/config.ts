import {defineConfig} from 'vitepress';

export default defineConfig({
  title: 'Dye',
  description: '轻量级 2D 可视化渲染引擎',
  lang: 'zh-CN',
  base: '/dye/',

  ignoreDeadLinks: true,

  themeConfig: {
    nav: [
      {text: '指南', link: '/guide/getting-started'},
      {text: 'API', link: '/api/engine'},
      {
        text: '包参考',
        items: [
          {text: 'dye-core', link: '/packages/core'},
          {text: 'dye-bounding', link: '/packages/bounding'},
          {text: 'dye-path', link: '/packages/path'},
          {text: 'dye-shape', link: '/packages/shape'},
          {text: 'dye-ease', link: '/packages/ease'},
          {text: 'dye-curve', link: '/packages/curve'},
          {text: 'dye-interpolate', link: '/packages/interpolate'},
          {text: 'dye-canvas', link: '/packages/canvas'},
          {text: 'dye-svg', link: '/packages/svg'},
          {text: 'dye-gradient', link: '/packages/gradient'},
          {text: 'dye-dom', link: '/packages/dom'},
        ],
      },
      {text: 'Playground', link: '/playground'},
    ],

    sidebar: {
      '/guide/': [
        {
          text: '入门',
          items: [
            {text: '为什么选择 Dye', link: '/guide/why-dye'},
            {text: '快速开始', link: '/guide/getting-started'},
            {text: '核心概念', link: '/guide/concepts'},
            {text: '架构总览', link: '/guide/architecture'},
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            {text: 'App', link: '/api/engine'},
            {text: 'Scene & Node', link: '/api/scene'},
            {text: 'Shapes', link: '/api/shapes'},
            {text: 'Transforms', link: '/api/transforms'},
            {text: 'Events', link: '/api/events'},
            {text: 'Serialization', link: '/api/serialization'},
            {text: 'Plugin', link: '/api/plugin'},
          ],
        },
      ],
      '/packages/': [
        {
          text: '包参考',
          items: [
            {text: 'dye-core', link: '/packages/core'},
            {text: 'dye-bounding', link: '/packages/bounding'},
            {text: 'dye-path', link: '/packages/path'},
            {text: 'dye-shape', link: '/packages/shape'},
            {text: 'dye-ease', link: '/packages/ease'},
            {text: 'dye-curve', link: '/packages/curve'},
            {text: 'dye-interpolate', link: '/packages/interpolate'},
            {text: 'dye-canvas', link: '/packages/canvas'},
            {text: 'dye-svg', link: '/packages/svg'},
            {text: 'dye-gradient', link: '/packages/gradient'},
            {text: 'dye-dom', link: '/packages/dom'},
          ],
        },
      ],
    },

    socialLinks: [{icon: 'github', link: 'https://github.com/weiliang0121/dye'}],

    outline: {level: [2, 3]},
  },
});
