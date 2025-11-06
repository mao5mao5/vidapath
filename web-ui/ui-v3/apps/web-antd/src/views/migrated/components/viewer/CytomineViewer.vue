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
  <div v-if="error" class="box error">
    <h2>{{ $t('error') }}</h2>
    <p>{{ $t('error-loading-image') }}</p>
    <p v-if="errorBadImageProject">{{ $t('error-loading-image-bad-project') }}</p>
  </div>
  <div v-else class="cytomine-viewer">
    <a-spin :spinning="loading">
      <a-layout v-if="!loading" style="height: 100%">
        <a-layout-sider v-model:collapsed="collapsed" collapsible>
          <image-list
            :images="viewerImages"
            :active-image="activeImage"
            @select-image="setActiveImage"
            @close-image="closeMap"
          />
        </a-layout-sider>
        <a-layout-content>
          <div class="maps-wrapper">
            <div
              v-for="(cell, i) in cells"
              :key="i"
              class="map-cell"
              :style="`height:${elementHeight}%; width:${elementWidth}%;`"
              :class="{ highlighted: cell && cell.highlighted }"
            >
              <cytomine-image
                v-if="cell && cell.image && cell.slices"
                :index="cell.index"
                :key="`${cell.index}-${cell.image.id}`"
                @close="closeMap(cell.index)"
              />
            </div>

            <image-selector />
          </div>
        </a-layout-content>
      </a-layout>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { message } from 'ant-design-vue';
// 使用正确的路径别名#
import { useViewerStore } from '#/store/modules/viewer';
import { useCurrentProjectStore } from '#/store/modules/current-project';
import CytomineImage from './CytomineImage.vue';
import ImageSelector from './ImageSelector.vue';
import ImageList from './ImageList.vue';

// Stores
const viewerStore = useViewerStore();
const currentProjectStore = useCurrentProjectStore();

// Router and route
const route = useRoute();
const router = useRouter();

// i18n
const { t } = useI18n();

// Reactive data
const error = ref(false);
const errorBadImageProject = ref(false);
const loading = ref(true);
const collapsed = ref(false);
const reloadInterval = ref<number | null>(null);

// Computed properties
const project = computed(() => currentProjectStore.project);
const idImages = computed(() => route.params.idImages?.split('-') || []);
const idSlices = computed(() => route.params.idSlices ? route.params.idSlices.split('-') : []);
const paramIdViewer = computed(() => route.query.viewer);
const viewer = computed(() => viewerStore);
const viewerImages = computed(() => viewer.value.images || {});
const activeImage = computed(() => viewer.value.activeImage);
const indexImages = computed(() => viewer.value ? Object.keys(viewerImages.value) : []);
const nbImages = computed(() => indexImages.value.length);
const nbHorizontalCells = computed(() => Math.ceil(Math.sqrt(nbImages.value)));
const nbVerticalCells = computed(() => nbHorizontalCells.value ? Math.ceil(nbImages.value / nbHorizontalCells.value) : 0);

const cells = computed(() => {
  let cellsArray = new Array(nbHorizontalCells.value * nbVerticalCells.value);
  for (let i = 0; i < nbImages.value; i++) {
    let index = indexImages.value[i];
    // 这里需要根据实际的image数据结构调整
    let image = viewerImages.value[index]?.imageInstance;
    let slices = viewerImages.value[index]?.activeSlices;
    let highlighted = viewerImages.value[index]?.view?.highlighted || false;
    cellsArray[i] = { index, image, slices, highlighted };
  }
  return cellsArray;
});

const elementHeight = computed(() => 100 / nbVerticalCells.value);
const elementWidth = computed(() => 100 / nbHorizontalCells.value);

// Methods
const setActiveImage = (index: number) => {
  viewerStore.setActiveImage(index);
};

const closeMap = (index: number) => {
  if (nbImages.value === 1) {
    // 在Pinia中不需要显式注销模块
    router.push(`/project/${route.params.idProject}`);
  } else {
    viewerStore.removeImageAtIndex(index);
  }
};

const findIdViewer = () => {
  // 简化实现，实际应该根据业务逻辑确定viewer ID
  return paramIdViewer.value || 'default';
};

const loadViewer = async () => {
  try {
    const idViewer = findIdViewer();
    currentProjectStore.setCurrentViewer(idViewer);
    
    // 注册图像模块
    idImages.value.forEach(() => {
      viewerStore.registerImage();
    });
    
    loading.value = false;
  } catch (err) {
    console.error(err);
    error.value = true;
    message.error(t('error-loading-image'));
  }
};

// Lifecycle
onMounted(async () => {
  await loadViewer();
  // 设置定时刷新
  reloadInterval.value = window.setInterval(() => {
    // 触发注解刷新事件
  }, 5000); // 简化处理，实际应该使用constants.VIEWER_ANNOTATIONS_REFRESH_INTERVAL
});

onUnmounted(() => {
  if (reloadInterval.value) {
    clearInterval(reloadInterval.value);
  }
});

// Watchers
watch(() => route, () => {
  // 路由变化时重新加载viewer
  loadViewer();
}, { deep: true });
</script>

<style scoped>
.cytomine-viewer {
  display: flex;
  height: 100%;
}

.maps-wrapper {
  display: flex;
  flex-wrap: wrap;
  height: 100%;
  width: 100%;
}

.map-cell {
  position: relative;
  border: 1px solid #ddd;
}

.map-cell.highlighted {
  border-color: #1890ff;
  box-shadow: 0 0 5px rgba(24, 144, 255, 0.3);
}

.box.error {
  padding: 2rem;
  text-align: center;
}

.box.error h2 {
  color: #ff4d4f;
  margin-bottom: 1rem;
}
</style>