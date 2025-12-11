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
  <div class="card" :class="{ 'full-height-card': fullHeightCard }">
    <router-link class="card-image recent-image" :to="`/project/${idProject}/image/${idImage}`">
      <figure class="image is-5by3" :style="figureStyle">
      </figure>
    </router-link>
    <div class="card-content">
      <div class="content image-info">
        <div class="image-name">{{ image.instanceFilename || image.imageName }}</div>
        <div class="image-details">
          <div class="info-item" v-if="tissue">
            <span class="info-label">Tissue:</span>
            <span class="info-value">{{ tissue }}</span>
          </div>
          <div class="info-item" v-if="specimen">
            <span class="info-label">Specimen:</span>
            <span class="info-value">{{ specimen }}</span>
          </div>
          <div class="info-item" v-if="stain">
            <span class="info-label">Stain:</span>
            <span class="info-value">{{ stain }}</span>
          </div>
        </div>
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { changeImageUrlFormat } from '@/utils/image-utils';
import { get } from '@/utils/store-helpers';
import { appendShortTermToken } from '@/utils/token-utils.js';

export default {
  name: 'image-preview',
  props: {
    image: { type: Object },
    project: { type: Object, default: null },
    fullHeightCard: { type: Boolean, default: true },
    showProject: { type: Boolean, default: true },
    blindMode: { type: Boolean, default: false },
  },
  computed: {
    shortTermToken: get('currentUser/shortTermToken'),
    idImage() {
      return this.image.image || this.image.id; // if provided object is image consultation, image.image
    },
    idProject() {
      return (this.project) ? this.project.id : this.image.project;
    },
    isBlindMode() {
      return (this.project) ? this.project.blindMode : this.blindMode;
    },
    rawPreviewUrl() {
      return this.image.thumb || this.image.imageThumb;
    },
    previewUrl() {
      return changeImageUrlFormat(this.rawPreviewUrl);
    },
    figureStyle() {
      return { backgroundImage: `url("${appendShortTermToken(this.previewUrl, this.shortTermToken)}")` };
    },
    tissue() {
      // Return fixed value for now, can be made dynamic later
      return 'Breast';
    },
    specimen() {
      // Return fixed value for now, can be made dynamic later
      return 'Biopsy';
    },
    stain() {
      // Return fixed value for now, can be made dynamic later
      return 'H&E';
    }
  },
};
</script>

<style scoped lang="scss">
@import "../../assets/styles/dark-variables.scss";

.image {
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  position: relative;
  border-bottom: 1px solid $dark-border-color;
}

.card.full-height-card {
  height: 100%;
  background-color: $dark-bg-primary !important;
}

.card-content {
  padding: 0.5rem;
  overflow-wrap: break-word;
}

.card-content a {
  font-weight: 0.8em;
}

.blind-indication {
  font-size: 0.9em;
  text-transform: uppercase;
}

.image-info {
  color: white;
  font-size: 0.9rem;
}

.image-name {
  font-weight: bold;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-item {
  display: flex;
}

.info-label {
  font-weight: bold;
  margin-right: 5px;
  flex-shrink: 0;
}

.info-value {
  flex-grow: 1;
}
</style>