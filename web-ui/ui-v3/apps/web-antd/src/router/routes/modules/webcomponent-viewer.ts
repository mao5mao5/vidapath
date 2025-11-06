import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      title: $t('page.webComponentViewer.title'),
    },
    name: 'WebComponentViewer',
    path: '/webcomponent/viewer/:idProject/:idImages/:idSlices?',
    component: () => import('#/views/migrated/components/WebComponentViewer.vue'),
    props: true,
  },
];

export default routes;