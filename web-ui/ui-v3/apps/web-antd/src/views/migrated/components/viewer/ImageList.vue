<template>
  <div class="image-list">
    <div
      v-for="(imageWrapper, index) in images"
      :key="imageWrapper?.imageInstance?.id || index"
      class="image-list-item"
      :class="{ active: isActive(index) }"
      @click="selectImage(index)"
    >
      <div class="thumbnail">
        <img v-if="imageWrapper?.imageInstance?.thumbURL" :src="imageWrapper.imageInstance.thumbURL" alt="thumbnail" />
        <div v-else class="placeholder-thumbnail">
          <FileImageOutlined />
        </div>
      </div>
      <div class="details">
        <div class="filename">{{ imageWrapper?.imageInstance?.originalFilename || 'Unknown' }}</div>
      </div>
      <a-button class="delete" type="text" @click.stop="closeImage(index)">
        <CloseOutlined />
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FileImageOutlined, CloseOutlined } from '@ant-design/icons-vue';

// Props
const props = defineProps({
  images: {
    type: Object,
    required: true,
  },
  activeImage: {
    type: [String, Number],
    required: true,
  },
});

// Emits
const emit = defineEmits(['select-image', 'close-image']);

// Methods
const isActive = (index: string | number) => {
  return props.activeImage === index;
};

const selectImage = (index: string | number) => {
  emit('select-image', index);
};

const closeImage = (index: string | number) => {
  emit('close-image', index);
};
</script>

<style scoped>
.image-list {
  background-color: #041646;
  color: white;
  height: 100%;
  overflow-y: auto;
}

.image-list-item {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-bottom: 1px solid #2d3a67;
  cursor: pointer;
  transition: background-color 0.2s;
}

.image-list-item:hover {
  background-color: #2d3a67;
}

.image-list-item.active {
  background-color: #40a9ff;
  color: white;
}

.thumbnail {
  width: 40px;
  height: 40px;
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thumbnail img {
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
}

.placeholder-thumbnail {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f0f0f0;
  color: #999;
}

.details {
  flex: 1;
  min-width: 0;
}

.filename {
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.delete {
  margin-left: 0.5rem;
  color: white;
}
</style>