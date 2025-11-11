<template>
  <div class="annotations-container">
    <a-collapse :bordered="false" class="dark-collapse">
      <a-collapse-panel key="1" header="Annotation Details" class="dark-panel">
        <template #extra>
          <a-icon type="close" @click="handleClick" />
        </template>
        <annotation-details-container v-if="isPanelDisplayed('annotation-main')" 
          class="dark-content"
          :index="index"
          @select="selectAnnotation" 
          @centerView="centerView({ annot: $event, sameView: true })" 
          @addTerm="addTerm"
          @addTrack="addTrack" 
          @updateTermsOrTracks="updateTermsOrTracks" 
          @updateProperties="updateProperties"
          @delete="handleDeletion" />
      </a-collapse-panel>
      <a-collapse-panel key="2" header="Annotations List" class="dark-panel">
        <template #extra>
          <a-icon type="close" @click="handleClick" />
        </template>
        <annotations-list
          class="dark-content"
          :index="index" @select="selectAnnotation" @centerView="centerView"
          @addTerm="addTerm" @addTrack="addTrack" @updateTermsOrTracks="updateTermsOrTracks"
          @updateProperties="updateProperties" @delete="handleDeletion" />
      </a-collapse-panel>
    </a-collapse>
    <similar-annotation v-if="showSimilarAnnotations" :image="image" :index="index" @select="selectAnnotation"
      @updateTermsOrTracks="updateTermsOrTracks" />
  </div>
</template>

<script>
import { get } from '@/utils/store-helpers';
import { Action, updateTermProperties, updateTrackProperties } from '@/utils/annotation-utils.js';

import WKT from 'ol/format/WKT';

import AnnotationsList from './AnnotationsList';
import AnnotationDetailsContainer from './AnnotationDetailsContainer';
import SimilarAnnotation from '@/components/annotations/SimilarAnnotation';
import { listAnnotationsInGroup, updateAnnotationLinkProperties } from '@/utils/annotation-utils';

import { Annotation } from '@/api';

export default {
  name: 'AnnotationsContainer',
  props: {
    index: String,
  },
  data() {
    return {
      format: new WKT(),
    };
  },
  components: {
    AnnotationsList,
    AnnotationDetailsContainer,
    SimilarAnnotation,
  },
  computed: {
    configUI: get('currentProject/configUI'),
    viewerModule() {
      return this.$store.getters['currentProject/currentViewerModule'];
    },
    viewerWrapper() {
      return this.$store.getters['currentProject/currentViewer'];
    },
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    image() {
      return this.imageWrapper.imageInstance;
    },
    imageGroupId() {
      return this.$store.getters[this.imageModule + 'imageGroupId'];
    },
    copiedAnnot: {
      get() {
        return this.viewerWrapper.copiedAnnot;
      },
      set(annot) {
        this.$store.commit(this.viewerModule + 'setCopiedAnnot', annot);
      }
    },
    showSimilarAnnotations() {
      return this.imageWrapper.selectedFeatures.showSimilarAnnotations;
    },
  },
  methods: {
    isPanelDisplayed(panel) {
      return this.configUI[`project-explore-${panel}`];
    },

    addTerm(term) {
      this.$store.dispatch(this.viewerModule + 'addTerm', term);
    },

    addTrack(track) {
      this.$store.dispatch(this.viewerModule + 'refreshTracks', { idImage: track.image });
    },

    async updateTermsOrTracks(annot) {
      let updatedAnnot = await annot.clone().fetch();
      updatedAnnot.imageGroup = this.imageGroupId;
      await updateTermProperties(updatedAnnot);
      await updateTrackProperties(updatedAnnot);
      await updateAnnotationLinkProperties(updatedAnnot);

      this.$eventBus.$emit('editAnnotation', updatedAnnot);
      this.$store.commit(this.imageModule + 'changeAnnotSelectedFeature', { indexFeature: 0, annot: updatedAnnot });
    },

    updateProperties() {
      this.$store.dispatch(this.imageModule + 'refreshProperties', this.index);
    },

    async handleDeletion(annot) {
      this.$store.commit(this.imageModule + 'addAction', { annot: annot, type: Action.DELETE });

      if (annot.group) {
        let editedAnnots = [];
        if (annot.annotationLink.length === 2) {
          // If there were 2 links, the group has been deleted by backend
          let otherId = annot.annotationLink.filter(al => al.annotation !== annot.id)[0].annotation;
          let other = await Annotation.fetch(otherId);
          other.imageGroup = annot.imageGroup;
          await updateTermProperties(other);
          await updateTrackProperties(other);
          await updateAnnotationLinkProperties(other);

          editedAnnots = [other];
        } else {
          editedAnnots = await listAnnotationsInGroup(annot.project, annot.group);
        }
        editedAnnots.forEach(a => {
          this.$eventBus.$emit('editAnnotation', a);
          if (this.copiedAnnot && a.id === this.copiedAnnot.id) {
            let copiedAnnot = this.copiedAnnot.clone();
            copiedAnnot.annotationLink = a.annotationLink;
            copiedAnnot.group = a.group;
            this.copiedAnnot = copiedAnnot;
          }
        });
      }

      this.$eventBus.$emit('deleteAnnotation', annot);
    },

    selectAnnotation({ annot, options }) {
      let index = (options.trySameView) ? this.index : null;
      this.$eventBus.$emit('selectAnnotation', { index, annot, center: true });

      if (this.image.id !== annot.image) {
        this.$store.commit(this.imageModule + 'clearSimilarAnnotations');
      }
    },

    centerView({ annot, sameView = false }) {
      if (sameView) {
        this.$emit('centerView', annot);
      } else {
        this.$eventBus.$emit('selectAnnotation', { index: null, annot, center: true });
      }
    }
  },
  beforeDestroy() {
    this.$store.commit(this.imageModule + 'setShowSimilarAnnotations', false);
  },
};
</script>

<style scoped>
.annotations-container {
  background-color: #1e1e1e;
  color: #ffffff;
}

.dark-collapse {
  background-color: #1e1e1e;
}

.dark-collapse :deep(.ant-collapse-header) {
  background-color: #2d2d2d;
  color: #ffffff;
  border-radius: 4px 4px 0 0;
}

.dark-panel {
  background-color: #1e1e1e;
  border: 1px solid #3a3a3a;
  margin-bottom: 1px;
}

.dark-panel :deep(.ant-collapse-content) {
  background-color: #1e1e1e;
  border: 1px solid #3a3a3a;
  border-top: 0;
}

.dark-content {
  background-color: #1e1e1e;
  color: #ffffff;
}

.annotations-container :deep(.ant-collapse-content-box) {
  padding: 0;
}

/* 深色模式滚动条样式 */
.dark-content::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.dark-content::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.dark-content::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.dark-content::-webkit-scrollbar-thumb:hover {
  background: #777;
}

/* 深色模式下的图标颜色 */
.dark-collapse :deep(.anticon) {
  color: #ffffff;
}

/* 深色模式下的按钮 */
.dark-collapse :deep(.ant-btn) {
  background-color: #3a3a3a;
  border-color: #555;
  color: #ffffff;
}

.dark-collapse :deep(.ant-btn:hover) {
  background-color: #4d4d4d;
  border-color: #666;
  color: #ffffff;
}

/* 确保折叠面板标题文字为白色 */
.dark-collapse :deep(.ant-collapse-header) {
  color: #ffffff !important;
}
</style>
