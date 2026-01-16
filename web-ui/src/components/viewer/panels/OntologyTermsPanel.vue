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
  <div class="ontology-terms-panel-container">
    <h1>Image {{ $t('terms') }}</h1>

    <!-- 当图像没有本体时显示此部分 -->
    <div v-if="!hasOntologies" class="no-ontology-message">
      <p class="has-text-centered">
        <em>No terms</em>
      </p>
      <p class="has-text-centered mt-2">
        <button class="button is-small is-link" @click="openSelectOntologyModal">
          Add terms
        </button>
      </p>
    </div>
    <!-- 当图像有本体或者用户无权限时显示正常的本体树 -->
    <div class="ontology-panel">
      <!-- 显示图像的所有本体 -->
      <div v-for="currentOntology in imageOntologies" :key="currentOntology.id" class="ontology-container">
        <div class="ontology-header">
          <span class="ontology-title">{{ currentOntology.name }}</span>
          <button v-if="canManageProject" class="delete is-small" @click="removeOntologyFromImage(currentOntology.id)"
            title="Remove ontology from image" />
        </div>

        <div class="ontology-tree-wrapper">
          <div class="header-tree">
            <!-- <b-input v-model="searchStrings[currentOntology.id]" :placeholder="$t('search-placeholder')" size="is-small"
              expanded /> -->

            <div class="sidebar-tree">
              <div class="visibility">
                <i class="far fa-eye"></i>
              </div>
              <div class="opacity">{{ $t('opacity') }}</div>
            </div>
          </div>
          <ontology-tree :ontology="currentOntology" :allowSelection="false">
            <template #custom-sidebar="{ term }">
              <div class="sidebar-tree">
                <div class="visibility">
                  <b-checkbox v-if="term.id" size="is-small" :value="ontologyTerms[term.ontology][getTermsMapping(term.ontology)[term.id]].visible" @input="toggleTermVisibility(term)" />
                  <b-checkbox v-else size="is-small" v-model="displayNoTerm" />
                </div>

                <div class="opacity">
                  <input v-if="term.id" class="slider is-fullwidth is-small" step="0.05" min="0" max="1" type="range"
                    :value="ontologyTerms[term.ontology][getTermsMapping(term.ontology)[term.id]].opacity" @change="event => changeOpacity(term, event)"
                    @input="event => changeOpacity(term, event)">

                  <input v-else class="slider is-fullwidth is-small" step="0.05" min="0" max="1" type="range"
                    v-model="noTermOpacity">
                </div>
              </div>
            </template>
          </ontology-tree>
        </div>
      </div>
    </div>
    <div v-if="hasOntologies" class="has-text-right mt-2">
      <button class="button is-small is-link" @click="openSelectOntologyModal">
        Add terms
      </button>
    </div>

    <!-- 选择本体的模态框 -->
    <cytomine-modal :active="showSelectOntologyModal" title="Add terms to image"
      @close="showSelectOntologyModal = false">
      <b-message v-if="errorOntologies" type="is-danger" has-icon icon-size="is-small">
        <h2> {{ $t('error') }} </h2>
        <p> {{ $t('unexpected-error-info-message') }} </p>
      </b-message>
      <template v-else>
        <b-field label="Terms">
          <b-select v-model="selectedOntology" placeholder="Select terms by name" :disabled="loadingOntologies"
            :loading="loadingOntologies">
            <option :value="null">
              Select terms
            </option>
            <option v-for="ontology in availableOntologies" :value="ontology.id" :key="ontology.id"
              v-show="!isOntologyAlreadyAdded(ontology.id)">
              {{ ontology.name }}
            </option>
          </b-select>
        </b-field>
      </template>

      <template #footer>
        <button class="button" type="button" @click="showSelectOntologyModal = false" :disabled="savingOntology">
          {{ $t('button-cancel') }}
        </button>
        <button v-if="!errorOntologies && selectedOntology" class="button is-link"
          :class="{ 'is-loading': savingOntology }" :disabled="loadingOntologies || savingOntology"
          @click="addOntologyToImage">
          {{ $t('button-add') }}
        </button>
      </template>
    </cytomine-modal>
  </div>
</template>

<script>
import { get } from '@/utils/store-helpers';
import OntologyTree from '@/components/ontology/OntologyTree';
import CytomineModal from '@/components/utils/CytomineModal';
import { OntologyCollection, Project } from '@/api';
import { Select } from 'ol/interaction';

export default {
  name: 'ontology-terms-panel',
  components: { OntologyTree, CytomineModal },
  props: {
    index: String
  },
  data() {
    return {
      searchStrings: {}, // 为每个本体维护单独的搜索字符串

      // 选择本体相关的数据
      showSelectOntologyModal: false,
      loadingOntologies: true,
      errorOntologies: false,
      ontologies: null, // 所有可用的本体
      selectedOntology: null,
      savingOntology: false
    };
  },
  computed: {
    canManageProject() {
      return this.$store.getters['currentProject/canManageProject'];
    },
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    imageWrapper() {
      return this.$store.getters['currentProject/currentViewer'].images[this.index];
    },
    imageInstance() {
      return this.imageWrapper.imageInstance;
    },
    // 使用图像的本体而不是项目的本体
    imageOntologies() {
      return this.imageWrapper.ontologies || [];
    },
    hasOntologies() {
      return this.imageWrapper.ontologies.length > 0;
    },

    ontologyTerms() {
      return this.imageWrapper.style.ontologyTerms;
    },
    additionalNodes() {
      return [{ id: 0, name: this.$t('no-term') }];
    },
    displayNoTerm: {
      get() {
        return this.imageWrapper.style.displayNoTerm;
      },
      set(value) {
        this.$store.dispatch(this.imageModule + 'setDisplayNoTerm', value);
      }
    },
    noTermOpacity: {
      get() {
        return this.imageWrapper.style.noTermOpacity;
      },
      set(value) {
        this.$store.commit(this.imageModule + 'setNoTermOpacity', Number(value));
      }
    },
    // 计算属性：获取可添加的本体（排除已添加的）
    availableOntologies() {
      if (!this.ontologies) return [];
      return this.ontologies.filter(ont => !this.isOntologyAlreadyAdded(ont.id));
    },
    // 返回一个函数的计算属性
    getTermsMapping() {
      return (ontoId) => {
        let mapping = {};
        if (this.ontologyTerms && this.ontologyTerms[ontoId]) {
          this.ontologyTerms[ontoId].forEach((term, idx) => mapping[term.id] = idx);
        }
        return mapping;
      }
    }
  },
  watch: {
    showSelectOntologyModal: {
      handler: async function (val) {
        if (val) {
          if (this.loadingOntologies) { // 第一次打开模态框时加载本体列表
            try {
              this.ontologies = (await OntologyCollection.fetchAll({ light: true })).array;
              this.ontologies.sort((a, b) => a.name.localeCompare(b.name));
              this.loadingOntologies = false;
            } catch (error) {
              console.log(error);
              this.errorOntologies = true;
            }
          }

          // 重置选择
          this.selectedOntology = null;
          this.savingOntology = false;
        }
      }
    },
    // 监听图像本体变化，初始化每个本体的搜索字符串
    imageOntologies: {
      handler: function (newOntologies) {
        if (newOntologies) {
          newOntologies.forEach(ont => {
            if (!this.searchStrings[ont.id]) {
              this.$set(this.searchStrings, ont.id, ''); // 使用$set确保响应性
            }
          });
        }
      },
      immediate: true
    }
  },
  methods: {
    termsMapping(ontoId) {
      let mapping = {};
      if (this.ontologyTerms && this.ontologyTerms[ontoId]) {
        this.ontologyTerms[ontoId].forEach((term, idx) => mapping[term.id] = idx);
      }
      return mapping;
    },
    toggleTermVisibility(term) {
      let termsMapping = this.termsMapping(term.ontology);
      console.log('termsMapping', termsMapping[term.id]);
      this.$store.commit(this.imageModule + 'toggleOntologyTermVisibility', { ontoId: term.ontology, indexTerm: termsMapping[term.id] });
    },
    changeOpacity(term, event) {
      let opacity = Number(event.target.value);
      let termsMapping = this.termsMapping(term.ontology);
      console.log('termsMapping', termsMapping[term.id]);
      this.$store.commit(this.imageModule + 'setOntologyTermOpacity', { ontoId: term.ontology, indexTerm: termsMapping[term.id], opacity });
    },
    resetOpacities() {
      this.$store.commit(this.imageModule + 'resetTermOpacities');
    },

    openSelectOntologyModal() {
      this.showSelectOntologyModal = true;
    },

    isOntologyAlreadyAdded(ontologyId) {
      return this.imageOntologies.some(ont => ont.id === ontologyId);
    },

    async addOntologyToImage() {
      if (!this.selectedOntology) return;

      this.savingOntology = true;
      try {
        // 调用store action添加本体到图像
        await this.$store.dispatch(this.imageModule + 'addOntologyToImage', this.selectedOntology);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-add-ontology-to-image')
        });
      } catch (error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-add-ontology-to-image')
        });
      }
      this.savingOntology = false;
      this.showSelectOntologyModal = false;
      this.selectedOntology = null;
    },

    async removeOntologyFromImage(ontologyId) {
      if (!confirm(this.$t('confirm-remove-ontology-from-image'))) return;

      try {
        // 调用store action从图像中移除本体
        await this.$store.dispatch(this.imageModule + 'removeOntologyFromImage', ontologyId);
        // 重新获取本体列表
        await this.$store.dispatch('image/fetchImageOntologies');
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-remove-ontology-from-image')
        });
      } catch (error) {
        console.log(error);
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-remove-ontology-from-image')
        });
      }
    }
  }
};
</script>

<style scoped lang="scss">
@import '../../../assets/styles/dark-variables';

.ontology-terms-panel-container {
  width: auto !important;
}

.ontology-panel {
  display: flex;
}

.ontology-container {
  margin-right: 1em;
  border: 1px solid $dark-border-color;
  border-radius: 4px;
  padding: 0.5em;
  width: 22rem;
}

.ontology-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5em;
  border-bottom: 1px solid $dark-border-color;
}

.ontology-title {
  font-weight: bold;
  font-size: 1.1em;
}

.ontology-tree-wrapper {
  max-height: 17em;
  overflow: auto;
  margin-bottom: 0.4em !important;
}

.no-ontology-message {
  padding: 1em;
  border: 1px dashed $dark-border-color;
  border-radius: 4px;
  margin-bottom: 1em;
}

input[type="range"].slider {
  margin: 0;
  padding: 0;
}

.header-tree {
  display: flex;
  justify-content: right;
  position: sticky;
  top: 0;
  z-index: 5;
  padding-bottom: 0.3em;
  background: transparent;
  border: 2px solid $dark-border-color;
  border-width: 0 0 2px !important;
}

.header-tree .opacity {
  text-align: center;
  text-transform: uppercase;
  font-size: 0.8em;
}

.sidebar-tree {
  padding-right: 0.4em;
  display: flex;
  align-items: center;
}

.visibility {
  width: 2.8em;
  height: 2.1em;
  display: flex;
  justify-content: center;
}

.header-tree .visibility {
  height: auto;
}

.opacity {
  width: 6em;
  display: block;
}

::v-deep .checkbox .control-label {
  padding: 0 !important;
}

::v-deep .ontology-tree .sl-vue-tree-node-item,
::v-deep .ontology-tree .no-result {
  line-height: 2;
  font-size: 0.9em;
}
</style>