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

interface ViewState {
  zoom: number | null;
  center: [number, number];
  rotation: number;
  digitalZoom: boolean;
  overviewCollapsed: boolean;
  highlighted: boolean;
  scaleLineCollapsed: boolean;
}

export const useViewStore = defineStore('view', {
  state: (): ViewState => ({
    zoom: null, // will be initialized to appropriate value (depending on container size) in CytomineImage
    center: [0, 0],
    rotation: 0,
    digitalZoom: false,
    overviewCollapsed: false,
    highlighted: false,
    scaleLineCollapsed: false,
  }),

  actions: {
    setCenter(center: [number, number]) {
      this.center = center;
    },

    setZoom(zoom: number | null) {
      this.zoom = zoom;
    },

    setRotation(rotation: number) {
      this.rotation = rotation;
    },

    setDigitalZoom(digitalZoom: boolean) {
      this.digitalZoom = digitalZoom;
    },

    setOverviewCollapsed(value: boolean) {
      this.overviewCollapsed = value;
    },

    setScaleLineCollapsed(value: boolean) {
      this.scaleLineCollapsed = value;
    },

    setHighlighted(value: boolean) {
      this.highlighted = value;
    }
  },
  
  getters: {
    // 可以添加视图相关的计算属性
    isRotated: (state) => {
      return state.rotation !== 0;
    },
    
    isZoomed: (state) => {
      return state.zoom !== null && state.zoom > 0;
    }
  }
});