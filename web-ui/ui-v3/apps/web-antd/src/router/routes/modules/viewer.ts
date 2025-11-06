import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    meta: {
      title: $t('page.viewer.title'),
    },
    name: 'Viewer',
    path: '/viewer/:idProject/:idImages/:idSlices?',
    component: () => import('#/views/migrated/components/viewer/CytomineViewer.vue'),
    props: true,
  },
];

export default routes;