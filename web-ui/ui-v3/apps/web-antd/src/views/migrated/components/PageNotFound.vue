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

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import { ArrowLeftOutlined } from '@ant-design/icons-vue';
import { Button } from 'ant-design-vue';

defineOptions({
  name: 'PageNotFound',
});

const { t } = useI18n();
const router = useRouter();

function goBack() {
  router.go(-1);
}

function goHome() {
  router.push('/');
}
</script>

<template>
  <div class="flex size-full flex-col items-center justify-center">
    <h1 class="text-foreground mb-8 text-2xl md:text-3xl">
      {{ t('page-not-found') }}
    </h1>
    <div class="flex gap-4">
      <Button @click="goBack">
        <ArrowLeftOutlined class="mr-2" />
        {{ t('common.back') }}
      </Button>
      <Button type="primary" @click="goHome">
        {{ t('common.home') }}
      </Button>
    </div>
  </div>
</template>

<style scoped>
h1 {
  padding: 2rem;
  font-size: 1.5rem !important;
}
</style>