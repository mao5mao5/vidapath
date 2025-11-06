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

import { defineStore } from 'pinia';
import { useImageStore } from './image';

interface ViewerState {
  links: number[][];
  linkMode: string;
  imageSelector: boolean;
  activeImage: number;
  indexNextImage: number;
  copiedAnnot: any | null;
  copiedAnnotImageInstance: any | null;
  // 添加images状态来跟踪已注册的图像模块
  images: Record<number, any>;
}

export const useViewerStore = defineStore('viewer', {
  state: (): ViewerState => ({
    links: [],
    linkMode: 'ABSOLUTE',
    imageSelector: false,
    activeImage: 0,
    indexNextImage: 0,
    copiedAnnot: null,
    copiedAnnotImageInstance: null,
    images: {}
  }),

  actions: {
    setImageSelector(value: boolean) {
      this.imageSelector = value;
    },

    addImage() {
      this.imageSelector = false;
      this.activeImage = this.indexNextImage;
      this.indexNextImage++;
    },

    registerImage() {
      this.indexNextImage++;
    },

    setActiveImage(index: number) {
      this.activeImage = index;
    },

    setCopiedAnnot(annot: any | null) {
      this.copiedAnnot = annot;
    },

    setCopiedAnnotImageInstance(image: any | null) {
      this.copiedAnnotImageInstance = image;
    },

    setLinkMode(mode: string) {
      this.linkMode = mode;
    },

    // ----- View links

    createLinkGroup(indexes: number[]) {
      this.links.push(indexes);
    },

    linkImageToGroup(payload: { indexGroup: number; indexImage: number }) {
      this.links[payload.indexGroup].push(payload.indexImage);
    },

    mergeLinkGroups(indexes: number[]) {
      this.links[indexes[0]].push(...this.links[indexes[1]]);
      this.links.splice(indexes[1], 1);
    },

    unlinkImage(payload: { indexGroup?: number; indexImage: number }) {
      let links = this.links;
      let indexGroup = payload.indexGroup;
      
      if (!indexGroup) { // if group not specified, find the group of the provided image
        indexGroup = links.findIndex(group => group.includes(payload.indexImage));
        if (indexGroup === -1) {
          return;
        }
      }

      let group = links[indexGroup];
      let indexWithinGroup = group.findIndex(idx => idx === payload.indexImage);
      group.splice(indexWithinGroup, 1);
      if (group.length === 1) { // if group no longer contains several images, delete it
        links.splice(indexGroup, 1);
      }
    },

    // 动态模块注册和通信机制
    registerImageModule(index: number) {
      // 在Pinia中，我们不需要显式注册模块
      // 而是直接创建对应的store实例
      const imageStore = useImageStore(`${index}`); // 为每个图像创建唯一标识的store实例
      this.images = { ...this.images, [index]: imageStore };
    },

    unregisterImageModule(index: number) {
      // 在Pinia中，我们不需要显式注销模块
      // 可以通过删除引用实现
      const { [index]: _, ...rest } = this.images;
      this.images = rest;
    },

    async addImageWithModule(image: any, slices: any[], annot: any = null) {
      let index = this.indexNextImage;
      this.addImage(); // 更新viewer状态
      this.registerImageModule(index); // 注册图像模块
      
      // 获取对应图像的store实例
      const imageStore = this.images[index];
      
      if (annot) {
        imageStore.setRoutedAnnotation(annot);
      }
      
      // 初始化图像store
      // 这里需要实现initialize逻辑，暂时简化处理
      imageStore.setImageInstance(image);
      imageStore.setActiveSlices(slices);
      
      return index;
    },

    setImageResolution(idImage: number, resolution: { x: number; y: number; z: number; t: number }) {
      // 在所有图像模块中查找匹配的图像并设置分辨率
      Object.values(this.images).forEach(imageStore => {
        if (imageStore.imageInstance && imageStore.imageInstance.id === idImage) {
          imageStore.setResolution(resolution);
        }
      });
    },

    addTermToAllImages(term: any) {
      // 为所有图像模块添加术语
      Object.values(this.images).forEach(imageStore => {
        // 这里需要根据实际image store的实现来添加术语
        // 暂时留空，需要image store支持对应功能
      });
    },

    refreshTracksForImage(idImage: number) {
      // 刷新指定图像的轨迹数据
      Object.values(this.images).forEach(imageStore => {
        if (imageStore.imageInstance && imageStore.imageInstance.id === idImage) {
          // 这里需要根据实际image store的实现来刷新轨迹
          // 暂时留空，需要image store支持对应功能
        }
      });
    },

    setCenterForImage(index: number, center: [number, number]) {
      const relative = this.linkMode === 'RELATIVE';
      
      // 获取参考图像
      const refImageStore = this.images[index];
      if (!refImageStore) return;
      
      const increments = refImageStore.view.center.map((val: number, i: number) => center[i] - val);
      const refZoom = refImageStore.imageInstance.zoom - refImageStore.view.zoom;

      // 更新链接图像的中心点
      const indexesToUpdate = this.getLinkedIndexes(index);
      indexesToUpdate.forEach((idx: number) => {
        const imageStore = this.images[idx];
        if (!imageStore) return;

        // 计算旋转图像的平移量
        const u = Math.cos(imageStore.view.rotation) * increments[0] - Math.sin(imageStore.view.rotation) * increments[1];
        const v = Math.cos(imageStore.view.rotation) * increments[1] + Math.sin(imageStore.view.rotation) * increments[0];

        // 计算绝对模式下的新中心点
        let newCenter = [
          imageStore.view.center[0] + u,
          imageStore.view.center[1] + v
        ];

        // 计算相对模式下的新中心点
        if (relative) {
          const diffZoom = imageStore.imageInstance.zoom - imageStore.view.zoom - refZoom;
          const zoomFactor = Math.pow(2, diffZoom);
          newCenter = [
            imageStore.view.center[0] + u * zoomFactor,
            imageStore.view.center[1] + v * zoomFactor
          ];
        }
        
        // 更新图像中心点
        imageStore.view.setCenter(newCenter);
      });
    },

    setZoomForImage(index: number, zoom: number) {
      const relative = this.linkMode === 'RELATIVE';
      const refImageStore = this.images[index];
      if (!refImageStore) return;
      
      const zoomIncrement = zoom - refImageStore.view.zoom;
      
      // 更新链接图像的缩放级别
      const indexesToUpdate = this.getLinkedIndexes(index);
      indexesToUpdate.forEach((idx: number) => {
        const imageStore = this.images[idx];
        if (!imageStore) return;
        
        const newZoom = relative ? (imageStore.view.zoom + zoomIncrement) : zoom;
        imageStore.view.setZoom(newZoom);
      });
    },

    setRotationForImage(index: number, rotation: number) {
      const relative = this.linkMode === 'RELATIVE';
      const refImageStore = this.images[index];
      if (!refImageStore) return;
      
      const rotationInc = rotation - refImageStore.view.rotation + 2 * Math.PI;
      
      // 更新链接图像的旋转角度
      const indexesToUpdate = this.getLinkedIndexes(index);
      indexesToUpdate.forEach((idx: number) => {
        const imageStore = this.images[idx];
        if (!imageStore) return;
        
        const newRotation = relative ? (imageStore.view.rotation + rotationInc) % (2 * Math.PI) : rotation;
        imageStore.view.setRotation(newRotation);
      });
    },

    setScaleLineCollapsedForImage(index: number, collapsed: boolean) {
      const imageStore = this.images[index];
      if (imageStore) {
        imageStore.view.setScaleLineCollapsed(collapsed);
      }
    },

    async refreshAllImageData() {
      // 刷新所有图像数据
      const promises = Object.keys(this.images).map(async (index) => {
        const imageStore = this.images[Number(index)];
        // 这里需要实现实际的刷新逻辑
        // 暂时留空，需要image store支持对应功能
      });
      
      await Promise.all(promises);
    },

    removeImageAtIndex(index: number) {
      this.unlinkImage({ indexImage: index });
      this.unregisterImageModule(index);
    }
  },
  
  getters: {
    getLinkedIndexes: (state) => (index: number) => {
      // 查找与提供索引链接的所有索引（如果图像未链接，则只返回其索引）
      return state.links.find(group => group.includes(index)) || [index];
    },
    
    pathModule: (state) => {
      // 在Pinia中，我们不需要像Vuex那样获取模块命名空间
      // 这里返回一个模拟的路径
      return ['projects', 'projectId', 'viewers', 'viewerId'];
    },
    
    pathImageModule: (_, getters) => (index: number) => {
      return [...getters.pathModule, 'images', index.toString()];
    }
  }
});