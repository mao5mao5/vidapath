<!-- Copyright (c) 2009-2022. Authors: see NOTICE file.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.-->


<template>
  <div id="app" class="wrapper">
    <notifications position="top center" width="30%" :max="5">
      <template #body="props">
        <div class="notification vue-notification" :class="props.item.type">
          <button class="delete" @click="props.close"></button>
          <strong class="notification-title">
            {{ props.item.title }}
          </strong>
          <div class="notification-content" v-html="props.item.text"></div>
        </div>
      </template>
    </notifications>

    <template v-if="!loading">
      <div class="box error" v-if="communicationError">
        <h2>
          {{ $t('communication-error') }}
        </h2>
        {{ $t('core-cannot-be-reached') }}
      </div>

      <template v-else-if="currentUser || $keycloak.hasTemporaryToken">
        <cytomine-navbar />
        <div class="bottom">
          <keep-alive include="cytomine-storage">
            <router-view />
          </keep-alive>
        </div>
      </template>
    </template>
  </div>
</template>

<script>
import axios from 'axios';
import ifvisible from 'ifvisible';
ifvisible.setIdleDuration(constants.IDLE_DURATION);

import { Cytomine } from '@/api';
import constants from '@/utils/constants.js';
import { get } from '@/utils/store-helpers';
import { updateToken } from '@/utils/token-utils';
import { changeLanguageMixin } from '@/lang.js';

import CytomineNavbar from '@/components/navbar/CytomineNavbar.vue';

export default {
  name: 'app',
  components: {
    CytomineNavbar,
  },
  mixins: [
    changeLanguageMixin,
  ],
  data() {
    return {
      communicationError: false,
      loading: true,
      timeout: null,
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    currentAccount: get('currentUser/account'),
    project: get('currentProject/project')
  },
  watch: {
    $route() {
      // Invoke refresh token if needed when route changes.
      updateToken();
    },
  },
  methods: {
    wakeup: async function () {
      if (!ifvisible.now()) {
        return;
      }
      await updateToken();
      await this.ping();
    },
    async ping() {
      if (!ifvisible.now()) {
        return; // window not visible or inactive user => stop pinging
      }
      try {
        // 对于临时访问令牌用户，跳过ping操作
        if (this.$keycloak.hasTemporaryToken) {
          if (!this.currentUser) {
            await this.fetchUser();
          }
          this.setTemporaryAccount();
          this.loading = false;
          // return;
        }

        // TODO IAM - still needed ?
        // await Cytomine.instance.ping(this.project ? this.project.id : null);
        if (!this.currentUser) {
          await this.fetchUser();
        }
        if (!this.currentAccount) {
          await this.fetchAccount();
        }
        this.communicationError = false;
      } catch (error) {
        console.log(error);
        this.communicationError = error.toString().indexOf('401') === -1;
      }

      clearTimeout(this.timeout);
      this.timeout = setTimeout(this.ping, constants.PING_INTERVAL);
    },
    async fetchUser() {
      await this.$store.dispatch('currentUser/fetchUser');
    },

    async fetchAccount() {
      await this.$store.dispatch('currentUser/fetchAccount');
      if (this.currentAccount) {
        this.changeLanguage(this.currentAccount.locale);
      }
    },

    createTemporaryAccount() {
      return {
        id: 0,
        user: 0,
        firstname: 'Temporary',
        lastname: 'User',
        email: 'temporary@example.com',
        locale: 'en',
        clone: function () {
          return Object.assign({}, this);
        }
      };
    },

    setTemporaryAccount() {
      const tempAccount = this.createTemporaryAccount();
      this.$store.commit('currentUser/setAccount', tempAccount);
    }
  },
  async created() {
    let settings;
    await axios
      .get('configuration.json')
      .then(response => (settings = response.data));

    for (let i in settings) {
      if (Object.prototype.hasOwnProperty.call(constants, i)
        || i.includes('_NAMESPACE') || i.includes('_VERSION') || i.includes('_ENABLED')) {
        constants[i] = settings[i];
      }
    }
    Object.freeze(constants);
    // 为临时访问令牌用户创建特殊的认证头拦截器
    const authorizationHeaderInterceptor = async config => {
      // 如果是临时访问令牌用户，在URL中添加临时令牌作为查询参数
      if (this.$keycloak.hasTemporaryToken) {
        const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
        const accessToken = urlParams.get('access_token');

        if (accessToken) {
          // 将临时令牌作为查询参数添加到URL中
          config.params = config.params || {};
          config.params.access_token = accessToken;

          this.$store.commit('currentUser/setShortTermToken', accessToken);
        }
        return config;
      }

      // 对于正常用户，使用原有的认证逻辑
      const token = await updateToken();

      config.headers = config.headers || {};

      if (token !== null) {
        this.$store.commit('currentUser/setShortTermToken', token);
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    };
    new Cytomine(
      window.location.origin,
      '/api/', `/iam/realms/${this.$keycloak.realm}`,
      authorizationHeaderInterceptor
    );

    await this.ping();
    this.loading = false;
    ifvisible.on('wakeup', this.wakeup);
  }
};
</script>

<style lang="scss">
@import './assets/styles/main.scss';
</style>
