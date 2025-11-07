/*
* Copyright (c) 2009-2022. Authors: see NOTICE file.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import Vue from 'vue';
import wrap from '@vue/web-component-wrapper';

// 引入Viewer组件
import CytomineViewer from './components/viewer/CytomineViewer.vue';

// 引入必要的插件和配置
import Keycloak from './keycloak';
import VueRouter from 'vue-router';
// eslint-disable-next-line no-unused-vars
import i18n from './lang.js';
// eslint-disable-next-line no-unused-vars
import store from './store/store.js';
import Buefy from 'buefy';
import Antd from 'ant-design-vue';
// eslint-disable-next-line no-unused-vars
import VeeValidate from 'vee-validate';
import Notifications from 'vue-notification';
import VTooltip from 'v-tooltip';
import VueMoment from 'vue-moment';

// 注册插件
Vue.use(Keycloak);
Vue.use(VueRouter);
Vue.use(Buefy, {defaultIconPack: 'fas'});
Vue.use(Antd);
Vue.use(VeeValidate, {
  i18nRootKey: 'validations',
  i18n,
  inject: false
});
Vue.use(Notifications);
Vue.use(VTooltip);
Vue.use(VueMoment);

// 包装组件为Web Component
const WrappedComponent = wrap(Vue, CytomineViewer);

// 定义Web Component
customElements.define('cytomine-viewer', WrappedComponent);