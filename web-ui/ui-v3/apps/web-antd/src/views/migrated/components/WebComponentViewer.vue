<template>
  <div class="web-component-viewer">
    <div class="close-button" @click="closeViewer">
      <span>×</span>
    </div>
    <div v-if="loading" class="loading">
      Loading Web Component...
    </div>
    <div v-else class="viewer-container">
      <!-- 这里将加载Vue 2构建的Web Component -->
      <cytomine-viewer 
        :id-project="projectId" 
        :id-images="imagesIds"
        :id-slices="slicesIds"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

// 获取路由参数和路由器
const route = useRoute();
const router = useRouter();

// 定义props
const projectId = route.params.idProject as string;
const imagesIds = route.params.idImages as string;
const slicesIds = route.params.idSlices as string || '';

// 定义响应式数据
const loading = ref(true);

// 关闭查看器并返回上一页
const closeViewer = () => {
  // 移除全屏类
  document.body.classList.remove('fullscreen-webcomponent');
  // 返回到前一个页面
  router.go(-1);
};

// 页面加载时隐藏导航栏
onMounted(() => {
  // 隐藏导航栏和侧边栏
  document.body.classList.add('fullscreen-webcomponent');
  
  // 检查Web Component是否已经定义
  if (customElements.get('cytomine-viewer')) {
    loading.value = false;
    console.log('Web Component already defined');
    return;
  }

  // 动态加载Web Component脚本
  const script = document.createElement('script');
  script.src = '/webcomponents/cytomine-viewer.min.js';
  script.onload = () => {
    console.log('Web Component loaded successfully');
    loading.value = false;
  };
  script.onerror = () => {
    console.error('Failed to load Web Component');
    loading.value = false;
  };
  document.head.appendChild(script);
  
  console.log('Web Component Viewer mounted');
  console.log('Project ID:', projectId);
  console.log('Images IDs:', imagesIds);
  console.log('Slices IDs:', slicesIds);
});

// 页面卸载时恢复导航栏
onUnmounted(() => {
  document.body.classList.remove('fullscreen-webcomponent');
});
</script>

<style scoped>
.web-component-viewer {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 1000;
  background: white;
}

.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  color: white;
  font-size: 24px;
  font-weight: bold;
  transition: background 0.3s;
}

.close-button:hover {
  background: rgba(0, 0, 0, 0.7);
}

.viewer-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.viewer-container cytomine-viewer {
  width: 100%;
  height: 100%;
  display: block;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  font-size: 18px;
  color: #666;
}
</style>

<style>
/* 全局样式，用于隐藏导航栏 */
.fullscreen-webcomponent .vben-layout-header,
.fullscreen-webcomponent .vben-layout-sider,
.fullscreen-webcomponent .vben-layout-footer {
  display: none !important;
}

.fullscreen-webcomponent .vben-layout-content {
  padding: 0 !important;
}

.fullscreen-webcomponent .vben-layout {
  height: 100vh !important;
}
</style>