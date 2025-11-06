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
  <div>
    <div v-show="imageSelectorEnabled" class="image-selector-wrapper">
      <a-spin :spinning="loading">
        <div class="header">
          <div>
            <a-input
              v-model:value="searchString"
              class="search-images"
              :placeholder="$t('search-placeholder')"
              @input="debounceSearchString"
            >
              <template #prefix>
                <SearchOutlined />
              </template>
            </a-input>
            
            <div class="filter">
              <div class="filter-label">
                {{ $t('tags') }}
              </div>
              <div class="filter-body">
                <!-- 简化处理，实际应使用多选组件 -->
                <a-select
                  v-model:value="selectedTags"
                  mode="multiple"
                  :placeholder="$t('all')"
                  style="width: 100%"
                >
                  <a-select-option v-for="tag in availableTags" :key="tag.id" :value="tag.id">
                    {{ tag.name }}
                  </a-select-option>
                </a-select>
              </div>

              <div class="filter-label">
                {{ $t('image-groups') }}
              </div>
              <div class="filter-body">
                <a-select
                  v-model:value="selectedImageGroups"
                  mode="multiple"
                  :placeholder="$t('all-image-groups')"
                  style="width: 100%"
                >
                  <a-select-option v-for="group in availableImageGroups" :key="group.id" :value="group.id">
                    {{ group.name }}
                  </a-select-option>
                </a-select>
              </div>
            </div>
          </div>

          <a-button type="text" class="delete" @click="imageSelectorEnabled = false">
            <CloseOutlined />
          </a-button>
        </div>
        
        <div class="body">
          <div class="images-container">
            <div v-if="filteredImages.length === 0" class="no-images">
              {{ $t('no-images-found') }}
            </div>
            
            <div 
              v-else 
              v-for="image in filteredImages" 
              :key="image.id" 
              class="image-item"
              @click="selectImage(image)"
            >
              <div class="image-thumbnail">
                <img v-if="image.thumbURL" :src="image.thumbURL" :alt="image.originalFilename" />
                <div v-else class="placeholder">
                  <FileImageOutlined />
                </div>
              </div>
              <div class="image-details">
                <div class="filename">{{ image.originalFilename }}</div>
                <div class="dimensions">{{ image.width }} × {{ image.height }}</div>
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { SearchOutlined, CloseOutlined, FileImageOutlined } from '@ant-design/icons-vue';
import { useViewerStore } from '#/store/modules/viewer';

// Stores
const viewerStore = useViewerStore();

// i18n
const { t } = useI18n();

// Reactive data
const loading = ref(false);
const imageSelectorEnabled = computed({
  get: () => viewerStore.imageSelector,
  set: (value) => viewerStore.setImageSelector(value)
});
const searchString = ref('');
const selectedTags = ref<number[]>([]);
const selectedImageGroups = ref<number[]>([]);
const availableTags = ref<{id: number, name: string}[]>([]);
const availableImageGroups = ref<{id: number, name: string}[]>([]);
const allImages = ref<any[]>([]);

// Computed properties
const filteredImages = computed(() => {
  // 简化过滤逻辑
  let result = allImages.value;
  
  if (searchString.value) {
    const searchLower = searchString.value.toLowerCase();
    result = result.filter(image => 
      image.originalFilename.toLowerCase().includes(searchLower)
    );
  }
  
  if (selectedTags.value.length > 0) {
    result = result.filter(image => 
      image.tags && image.tags.some((tag: any) => selectedTags.value.includes(tag.id))
    );
  }
  
  if (selectedImageGroups.value.length > 0) {
    result = result.filter(image => 
      image.imageGroup && selectedImageGroups.value.includes(image.imageGroup.id)
    );
  }
  
  return result;
});

// Methods
const debounceSearchString = () => {
  // 简化防抖处理
  console.log('Search string changed:', searchString.value);
};

const selectImage = (image: any) => {
  // 选择图像的处理
  console.log('Selected image:', image);
  imageSelectorEnabled.value = false;
};

// Lifecycle
onMounted(() => {
  // 初始化数据
  // 模拟加载数据
  setTimeout(() => {
    allImages.value = [
      { id: 1, originalFilename: 'sample1.tif', width: 1024, height: 768, thumbURL: '' },
      { id: 2, originalFilename: 'sample2.tif', width: 2048, height: 1536, thumbURL: '' },
      { id: 3, originalFilename: 'sample3.tif', width: 512, height: 512, thumbURL: '' }
    ];
    
    availableTags.value = [
      { id: 1, name: '病理' },
      { id: 2, name: 'HE染色' },
      { id: 3, name: '免疫组化' }
    ];
    
    availableImageGroups.value = [
      { id: 1, name: '肺癌研究' },
      { id: 2, name: '乳腺癌研究' }
    ];
  }, 500);
});

// Watchers
watch(imageSelectorEnabled, (newValue) => {
  if (newValue) {
    // 显示图像选择器时的处理
    console.log('Image selector enabled');
  }
});
</script>

<style scoped>
.image-selector-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  z-index: 1000;
  display: flex;
  flex-direction: column;
}

.header {
  padding: 1rem;
  border-bottom: 1px solid #ddd;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.search-images {
  margin-bottom: 1rem;
}

.filter {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.5rem;
  align-items: center;
}

.filter-label {
  font-weight: bold;
}

.body {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

.images-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.image-item {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.5rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.image-item:hover {
  border-color: #1890ff;
}

.image-thumbnail {
  width: 100%;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.image-thumbnail img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.placeholder {
  font-size: 2rem;
  color: #ccc;
}

.image-details {
  text-align: center;
}

.filename {
  font-weight: bold;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dimensions {
  font-size: 0.8rem;
  color: #666;
}

.no-images {
  text-align: center;
  padding: 2rem;
  color: #999;
}
</style>
