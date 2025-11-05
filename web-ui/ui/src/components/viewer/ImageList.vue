<template>
  <div class="image-list">
    <div
      v-for="(imageWrapper, index) in images"
      :key="imageWrapper.imageInstance.id"
      class="image-list-item"
      :class="{ active: isActive(index) }"
      @click="selectImage(index)"
    >
     <a-card :bordered="false">
       <div class="thumbnail">
        <img :src="imageWrapper.imageInstance.thumbURL" alt="thumbnail" />
      </div>
      <div class="details">
        <div class="filename">{{ imageWrapper.imageInstance.originalFilename }}</div>
      </div>
      <button class="delete" @click.stop="closeImage(index)"></button>
    </a-card>

    </div>
  </div>
</template>

<script>
import { Card } from 'ant-design-vue';

export default {
  name: 'ImageList',
  props: {
    images: {
      type: Object,
      required: true,
    },
    activeImage: {
      type: String,
      required: true,
    },
  },
  methods: {
    isActive(index) {
      return this.activeImage === index;
    },
    selectImage(index) {
      this.$emit('select-image', index);
    },
    closeImage(index) {
      this.$emit('close-image', index);
    },
  },
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
  padding: 10px;
  cursor: pointer;
  border-bottom: 1px solid #031340;
  transition: background-color 0.2s;
}

.image-list-item:hover {
  background-color: #1E3A8A;
}

.image-list-item.active {
  background-color: #2563EB;
}

.thumbnail {
  width: 64px;
  height: 64px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  overflow: hidden;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details {
  flex-grow: 1;
}

.filename {
  font-weight: 600;
}

.delete {
  background-color: transparent;
  border: none;
  color: white;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.delete:hover {
  opacity: 1;
}
</style>
