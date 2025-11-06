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
import { useViewStore } from './view';

interface ImageSliceInstance {
  id: number;
  rank: number;
  channel: number;
  channelName: string;
  channelColor: string;
  zStack: number;
  time: number;
  [key: string]: any;
}

interface ImageGroup {
  id: number;
  group: number;
  [key: string]: any;
}

interface ImageInstance {
  id: number;
  baseImage: number;
  zoom: number;
  depth: number;
  duration: number;
  channels: number;
  physicalSizeX: number;
  physicalSizeY: number;
  physicalSizeZ: number;
  fps: number;
  width: number;
  height: number;
  [key: string]: any;
}

interface ImageState {
  imageInstance: ImageInstance | null;
  profile: any | null;
  imageGroupLink: ImageGroup | null;
  imageGroup: ImageGroup | null;
  sliceInstances: Record<number, ImageSliceInstance>;
  loadedSlicePages: number[];
  activeSlices: ImageSliceInstance[] | null;
  activePanel: string | null;
  routedAnnotation: any | null;
}

export const useImageStore = defineStore('image', {
  state: (): ImageState => ({
    imageInstance: null,
    profile: null,
    imageGroupLink: null,
    imageGroup: null,
    sliceInstances: {},
    loadedSlicePages: [],
    activeSlices: null,
    activePanel: null,
    routedAnnotation: null
  }),

  actions: {
    setImageInstance(image: any | null) {
      this.imageInstance = image;
    },

    setResolution(resolution: { x: number; y: number; z: number; t: number }) {
      if (this.imageInstance) {
        this.imageInstance.physicalSizeX = resolution.x;
        this.imageInstance.physicalSizeY = resolution.y;
        this.imageInstance.physicalSizeZ = resolution.z;
        this.imageInstance.fps = resolution.t;
      }
    },

    togglePanel(panel: string) {
      this.activePanel = this.activePanel === panel ? null : panel;
    },

    clearSliceInstances() {
      this.sliceInstances = {};
      this.loadedSlicePages = [];
    },

    setSliceInstances(slices: ImageSliceInstance[]) {
      const newSliceInstances = { ...this.sliceInstances };
      slices.forEach(slice => {
        newSliceInstances[slice.rank] = slice;
      });
      this.sliceInstances = newSliceInstances;
    },

    setLoadedSlicePage(page: number) {
      this.loadedSlicePages.push(page);
    },

    setActiveSlice(slice: ImageSliceInstance) {
      this.activeSlices = [slice];
    },

    setActiveSlices(slices: ImageSliceInstance[]) {
      this.activeSlices = slices;
    },

    setProfile(profile: any | null) {
      this.profile = profile;
    },

    setImageGroupLink(imageGroupLink: ImageGroup | null) {
      this.imageGroupLink = imageGroupLink;
    },

    setImageGroup(imageGroup: ImageGroup | null) {
      this.imageGroup = imageGroup;
    },

    setRoutedAnnotation(annotation: any | null) {
      this.routedAnnotation = annotation;
    },

    clearRoutedAnnotation() {
      this.routedAnnotation = null;
    },
    
    // 添加初始化方法
    async initialize(image: any, slices: any[]) {
      const clone = JSON.parse(JSON.stringify(image));
      this.setImageInstance(clone);
      
      const slicesClone = JSON.parse(JSON.stringify(slices));
      this.setActiveSlices(slicesClone);
      
      // 这里应该实现获取配置文件和图像组的逻辑
      // 暂时留空，需要相关依赖
    },
    
    // 添加刷新数据方法
    async refreshData() {
      // 这里应该实现刷新图像实例和活动切片的逻辑
      // 暂时留空，需要相关依赖
    },
    
    // 添加获取切片实例的方法
    async fetchSliceInstancesAround(rank: number, setActive: boolean = false) {
      // 这里应该实现获取切片实例的逻辑
      // 暂时留空，需要相关依赖
    }
  },
  
  // 添加嵌套store (模拟Vuex模块)
  // 在Pinia中，我们通过组合式store来实现模块化
  getters: {
    maxZoom: (state) => {
      if (!state.imageInstance) {
        return 0;
      }
      // 假设constants.DIGITAL_ZOOM_INCREMENT = 0 (简化处理)
      const increment = 0; // 实际应该从constants获取
      return state.imageInstance.zoom + increment;
    },
    
    maxRank: (state) => {
      if (!state.imageInstance) {
        return 0;
      }
      return state.imageInstance.depth * state.imageInstance.duration * state.imageInstance.channels;
    },
    
    imageGroupId: (state) => {
      if (!state.imageGroupLink) {
        return null;
      }
      return state.imageGroupLink.group;
    },
    
    channels: (state) => {
      // 按照channel索引排序返回通道信息
      const channels = Object.values(state.sliceInstances);
      const groupedChannels: Record<number, ImageSliceInstance[]> = {};
      
      // 按channel分组
      channels.forEach(slice => {
        if (!groupedChannels[slice.channel]) {
          groupedChannels[slice.channel] = [];
        }
        groupedChannels[slice.channel].push(slice);
      });
      
      // 提取每个通道的信息并排序
      return Object.values(groupedChannels)
        .map(slices => {
          const firstSlice = slices[0];
          return {
            index: firstSlice.channel,
            name: firstSlice.channelName,
            color: firstSlice.channelColor
          };
        })
        .sort((a, b) => a.index - b.index);
    }
  }
});