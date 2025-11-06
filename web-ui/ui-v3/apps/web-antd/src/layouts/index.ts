import type { Component } from 'vue';

import { $t } from '#/locales';

const BasicLayout = () => import('./basic.vue');
const AuthPageLayout = () => import('./auth.vue');

const IFrameView = () => import('@vben/layouts').then((m) => m.IFrameView);

const layouts: Component[] = [];

// 动态导入所有布局文件
const modules = import.meta.glob('./*/*.vue', { eager: true }) as Record<
  string,
  { default: Component }
>;

Object.keys(modules).forEach((key) => {
  layouts.push(modules[key].default);
});

export { AuthPageLayout, BasicLayout, IFrameView };
export default layouts;