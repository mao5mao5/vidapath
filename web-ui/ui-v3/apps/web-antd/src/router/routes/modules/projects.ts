
import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      icon: 'lucide:list',
      order: 0,
      title: $t('page.projects.title'),
    },
    name: 'Projects',
    path: '/projects',
    component: () => import('#/views/projects/index.vue'),
  },
];

export default routes;
