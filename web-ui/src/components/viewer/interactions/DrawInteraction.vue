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
  <vl-layer-vector>
    <vl-source-vector :ident="drawSourceName" ref="olSourceDrawTarget" />
  </vl-layer-vector>

  <vl-interaction-draw
    v-if="nbActiveLayers > 0 || drawCorrection"
    ref="olDrawInteraction"
    :source="drawSourceName"
    :type="drawType"
    :max-points="drawMaxPoints"
    :freehand="drawFreehand"
    :freehand-condition="undefined"
    :geometry-function="drawGeometryFunction"
    @drawend="drawEndHandler"
  />
</div>
</template>

<script>
import {get} from '@/utils/store-helpers';

import Polygon, {fromCircle as polygonFromCircle} from 'ol/geom/Polygon';
import WKT from 'ol/format/WKT';

import {Annotation, AnnotationType, Cytomine} from '@/api';
import {Action} from '@/utils/annotation-utils.js';
import {updateAnnotationLinkProperties} from '@/utils/annotation-utils';

export default {
  name: 'draw-interaction',
  props: {
    index: String
  },
  data() {
    return {
      format: new WKT()
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    rotation() {
      return this.imageWrapper.view.rotation;
    },
    termsToAssociate() {
      return this.imageWrapper.draw.termsNewAnnots;
    },
    tracksToAssociate() {
      return this.imageWrapper.draw.tracksNewAnnots;
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    imageGroupId() {
      return this.$store.getters[this.imageModule + 'imageGroupId'];
    },
    slice() {
      // Cannot draw on multiple slices at same time
      return (this.imageWrapper.activeSlices) ? this.imageWrapper.activeSlices[0] : null;
    },
    activeTool() {
      return this.imageWrapper.draw.activeTool;
    },
    activeEditTool() {
      return this.imageWrapper.draw.activeEditTool;
    },
    selectedFeature() {
      return this.$store.getters[this.imageModule + 'selectedFeature'];
    },
    drawMaxPoints() {
      if (this.activeTool === 'line') {
        return 2;
      }
      return undefined;
    },

    drawType() {
      switch (this.activeTool) {
        case 'point':
          return 'Point';
        case 'line':
        case 'freehand-line':
          return 'LineString';
        case 'magic-wand':
        case 'rectangle':
        case 'circle':
          return 'Circle';
        case 'polygon':
        case 'freehand-polygon':
        case 'select': // correct mode
          return 'Polygon';
        default:
          return ''; // Should not happen
      }
    },
    drawCorrection() {
      return this.activeTool === 'select';
    },
    drawFreehand() {
      return this.activeTool === 'freehand-polygon' || this.activeTool === 'freehand-line' || this.drawCorrection;
    },
    drawGeometryFunction() {
      if (!['magic-wand', 'rectangle'].includes(this.activeTool)) {
        return;
      }

      return (coordinates, geometry) => {
        let rotatedCoords = this.rotateCoords(coordinates, this.rotation);

        let [firstCorner, thirdCorner] = rotatedCoords;
        let secondCorner = [thirdCorner[0], firstCorner[1]];
        let fourthCorner = [firstCorner[0], thirdCorner[1]];

        let rotatedBoxCoordinates = [firstCorner, secondCorner, thirdCorner, fourthCorner, firstCorner];
        let boxCoordinates = [this.rotateCoords(rotatedBoxCoordinates, -this.rotation)];

        if (geometry) {
          geometry.setCoordinates(boxCoordinates);
        } else {
          geometry = new Polygon(boxCoordinates);
        }
        return geometry;
      };
    },
    layers() {
      return this.imageWrapper.layers.selectedLayers || [];
    },
    activeLayers() {
      return this.layers.filter(layer => layer.drawOn);
    },
    nbActiveLayers() {
      return this.activeLayers.length;
    },
    drawSourceName() {
      return `draw-target-${this.index}`;
    }
  },

  watch: {
    activeTool() {
      this.$refs.olDrawInteraction.scheduleRecreate();
    }
  },

  methods: {
    rotateCoords(coords, theta) {
      let cosTheta = Math.cos(theta);
      let sinTheta = Math.sin(theta);
      return coords.map(([x, y]) => [x * cosTheta + y * sinTheta, -x * sinTheta + y * cosTheta]);
    },

    clearDrawnFeatures() {
      this.$refs.olSourceDrawTarget.clear(true);
    },

    async drawEndHandler({feature}) {
      if (this.drawCorrection) {
        await this.endCorrection(feature);
      } else if (this.nbActiveLayers > 0) {
        await this.endDraw(feature);
      }

      this.clearDrawnFeatures();
    },

    async endDraw(drawnFeature) {
      // 为临时注释生成唯一ID
      const tempId = 'temp_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
      
      // 创建临时的注释对象，用于立即显示
      let tempAnnot = new Annotation({
        id: tempId,
        location: this.getWktLocation(drawnFeature),
        image: this.image.id,
        slice: this.slice.id,
        user: this.activeLayers[0].id,
        term: this.termsToAssociate,
        track: this.tracksToAssociate
      });
      
      // 添加状态标识
      tempAnnot.isTemporary = true;
      tempAnnot.isSaving = true;

      // 立即在画布上显示注释，提升用户体验
      this.$eventBus.$emit('addAnnotation', tempAnnot);
      this.$eventBus.$emit('selectAnnotation', {index: this.index, annot: tempAnnot});
      // 切换回选择工具
      this.$store.dispatch(this.imageModule + 'activateTool', 'select');
      
      // 清除绘制的临时图形
      this.clearDrawnFeatures();

      // 在后台异步保存到服务器
      this.activeLayers.forEach(async (layer, idx) => {
        console.log('Saving annotation', layer);
        let annot = new Annotation({
          location: this.getWktLocation(drawnFeature),
          image: this.image.id,
          slice: this.slice.id,
          user: layer.id,
          term: this.termsToAssociate,
          track: this.tracksToAssociate
        });

        try {
          await annot.save();
          annot.userByTerm = this.termsToAssociate.map(term => ({term, user: [this.currentUser.id]}));
          annot.imageGroup = this.imageGroupId;
          updateAnnotationLinkProperties(annot);
          
          // 发送事件替换临时注释
          this.$eventBus.$emit('replaceTemporaryAnnotation', {
            tempId: tempId,
            savedAnnot: annot
          });
          
          if (idx === this.nbActiveLayers - 1) {
            // 确保最后一个图层的注释被选中
            this.$eventBus.$emit('selectAnnotation', {index: this.index, annot});
          }

          this.$store.commit(this.imageModule + 'addAction', {annot, type: Action.CREATE});
        } catch (err) {
          console.log(err);
          // 通知注释保存失败，更新UI状态
          this.$eventBus.$emit('annotationSaveFailed', {
            tempId: tempId,
            annot: annot, // 传递原始注释用于重试
            error: err
          });
          this.$notify({type: 'error', text: this.$t('notif-error-annotation-creation')});
        }

        // SAM处理保持不变
        if (this.activeTool === 'magic-wand') {
          try {
            const annotationId = annot.id;
            const annotation = (await Cytomine.instance.api.post(`annotations/${annotationId}/refine`)).data;

            this.$eventBus.$emit('editAnnotation', annotation);
            this.$eventBus.$emit('reloadAnnotationCrop', annotation);
            this.$notify({type: 'success', text: 'Successful SAM Processing !'});
          } catch (error) {
            console.error(error);
            this.$notify({type: 'error', text: 'Error in SAM Processing.'});
          }
        }
      });
    },

    // 添加重试保存方法
    async retrySaveAnnotation(annot) {
      try {
        // 显示重试中状态
        annot.isSaving = true;
        annot.saveFailed = false;
        this.$eventBus.$emit('editAnnotation', annot);
        
        // 重新保存注释
        await annot.save();
        
        // 更新注释信息
        annot.userByTerm = this.termsToAssociate.map(term => ({term, user: [this.currentUser.id]}));
        annot.imageGroup = this.imageGroupId;
        updateAnnotationLinkProperties(annot);
        
        // 发送事件替换临时注释
        this.$eventBus.$emit('replaceTemporaryAnnotation', {
          tempId: annot.id,
          savedAnnot: annot
        });
        
        this.$store.commit(this.imageModule + 'addAction', {annot, type: Action.CREATE});
        this.$notify({type: 'success', text: this.$t('notif-success-annotation-creation')});
      } catch (err) {
        console.log(err);
        // 保存失败，更新状态
        annot.isSaving = false;
        annot.saveFailed = true;
        this.$eventBus.$emit('editAnnotation', annot);
        this.$notify({type: 'error', text: this.$t('notif-error-annotation-creation')});
      }
    },

    async endCorrection(feature) {
      if (!this.selectedFeature) {
        return;
      }

      try {
        let annot = this.selectedFeature.properties.annot;
        let correctedAnnot = await Annotation.correctAnnotations({
          location: this.getWktLocation(feature),
          review: annot.type === AnnotationType.REVIEWED,
          remove: (this.activeEditTool === 'correct-remove'),
          annotation: annot.id
        });
        if (correctedAnnot) {
          correctedAnnot.userByTerm = annot.userByTerm; // copy terms from initial annot
          correctedAnnot.track = annot.track;
          correctedAnnot.annotationTrack = annot.annotationTrack;
          correctedAnnot.group = annot.group;
          correctedAnnot.annotationLink = annot.annotationLink;
          correctedAnnot.imageGroup = annot.imageGroup;
          this.$store.commit(this.imageModule + 'addAction', {annot: correctedAnnot, type: Action.UPDATE});
          this.$eventBus.$emit('editAnnotation', correctedAnnot);
          this.$eventBus.$emit('reloadAnnotationCrop', annot);
        }
      } catch (err) {
        console.log(err);
        this.$notify({type: 'error', text: this.$t('notif-error-annotation-correction')});
      }
    },

    getWktLocation(feature) {
      // transform circle to circular polygon
      let geometry = feature.getGeometry();
      if (geometry.getType() === 'Circle') {
        feature.setGeometry(polygonFromCircle(geometry));
      }
      return this.format.writeFeature(feature);
    },
  }
};
</script>
