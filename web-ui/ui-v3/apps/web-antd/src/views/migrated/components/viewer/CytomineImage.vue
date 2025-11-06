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
  <div ref="container" class="map-container" @click="isActiveImage = true">
    <a-spin :spinning="loading">
      <template v-if="!loading && zoom !== null">
        <div class="map-placeholder">
          <!-- 简化的地图占位符 -->
          <div class="map-content">
            <h3>Image Viewer Placeholder</h3>
            <p>Image ID: {{ image?.id }}</p>
            <p>Zoom: {{ zoom }}</p>
            <p>Center: {{ center }}</p>
          </div>
        </div>
      </template>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
// 使用正确的路径别名#
import { useImageStore } from '#/store/modules/image';
import { useViewStore } from '#/store/modules/view';

// Props
const props = defineProps({
  index: {
    type: Number,
    required: true
  }
});

// Stores
const imageStore = useImageStore(`${props.index}`);
const viewStore = useViewStore(`${props.index}`);

// Router and route
const route = useRoute();

// i18n
const { t } = useI18n();

// Reactive data
const loading = ref(true);
const container = ref<HTMLElement | null>(null);
const projectedMousePosition = ref<[number, number]>([0, 0]);
const document = ref<Document | null>(null);

// Computed properties
const image = computed(() => imageStore.imageInstance);
const center = computed({
  get: () => viewStore.center,
  set: (value) => viewStore.setCenter(value)
});
const zoom = computed({
  get: () => viewStore.zoom,
  set: (value) => viewStore.setZoom(value)
});
const rotation = computed({
  get: () => viewStore.rotation,
  set: (value) => viewStore.setRotation(value)
});
const maxZoom = computed(() => {
  if (!image.value) return 0;
  return image.value.zoom || 0;
});
const extent = computed(() => {
  if (!image.value) return [0, 0, 0, 0];
  return [0, 0, image.value.width || 0, image.value.height || 0];
});
const imageSize = computed(() => {
  if (!image.value) return [0, 0];
  return [image.value.width || 0, image.value.height || 0];
});
const tileSize = computed(() => 256); // 默认瓦片大小
const projectionName = computed(() => `image-${image.value?.id || 0}`);
const baseLayerURL = computed(() => {
  if (!image.value) return '';
  return `/api/imageInstance/${image.value.id}/tiles`;
});

const isActiveImage = computed({
  get: () => true, // 简化处理
  set: (value) => {
    // 处理激活图像逻辑
  }
});

// Methods
const tileLoadFunction = (imageTile: any, src: string) => {
  // 简化的瓦片加载函数
  console.log('Loading tile from:', src);
};

const viewMounted = () => {
  // 视图挂载后的处理
  console.log('View mounted');
};

const addOverviewMap = () => {
  // 添加概览图
  console.log('Adding overview map');
};

const setBaseSource = () => {
  // 设置基础图层源
  console.log('Setting base source');
};

const updateKeyboardInteractions = () => {
  // 更新键盘交互
  document.value = window.document;
};

// Lifecycle
onMounted(async () => {
  // 初始化组件
  updateKeyboardInteractions();
  
  // 模拟加载过程
  setTimeout(() => {
    loading.value = false;
  }, 1000);
});

// Watchers
watch(() => route, () => {
  // 路由变化时的处理
}, { deep: true });
</script>

<style scoped>
.map-container {
  width: 100%;
  height: 100%;
  position: relative;
  border: 1px solid #ddd;
  background-color: #f5f5f5;
}

.map-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.map-content {
  text-align: center;
  color: #666;
}

.map-content h3 {
  margin-bottom: 1rem;
  color: #333;
}
</style>
