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

interface ColorsState {
  idImage: number;
  nbBitsPerSample: number;
  nbSamplesPerChannel: number;
  apparentChannels: any | null;
  gammaPerApparentChannel: boolean;
  invertedPerApparentChannel: boolean;
  histogramLogScale: boolean;
  intensitiesByMinMax: boolean;
  filter: any | null;
}

export const useColorsStore = defineStore('colors', {
  state: (): ColorsState => ({
    idImage: 0,
    nbBitsPerSample: 8,
    nbSamplesPerChannel: 1,
    apparentChannels: null,
    gammaPerApparentChannel: true,
    invertedPerApparentChannel: true,
    histogramLogScale: true,
    intensitiesByMinMax: true,
    filter: null
  }),

  actions: {
    setIdImage(id: number) {
      this.idImage = id;
    },

    setNbBitsPerSample(value: number) {
      this.nbBitsPerSample = value;
    },

    setNbSamplesPerChannel(value: number) {
      this.nbSamplesPerChannel = value;
    },

    setGammaPerApparentChannel(value: boolean) {
      this.gammaPerApparentChannel = value;
    },

    setInvertedPerApparentChannel(value: boolean) {
      this.invertedPerApparentChannel = value;
    },

    setHistogramLogScale(value: boolean) {
      this.histogramLogScale = value;
    },

    setIntensitiesByMinMax(value: boolean) {
      this.intensitiesByMinMax = value;
    },

    setFilter(filter: any | null) {
      this.filter = filter;
    }
  }
});