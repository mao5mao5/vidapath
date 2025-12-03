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
<div class="list-ontologies-wrapper content-wrapper">
  <b-loading :is-full-page="false" :active="loading" />

  <template v-if="!loading">
    <div class="box error" v-if="!ontologies">
      <h2> {{ $t('error') }} </h2>
      <p>{{ $t('unexpected-error-info-message') }}</p>
    </div>

    <div v-else class="panel">
      <p class="panel-heading">
        Term management
        <button class="button is-link" @click="creationModal = true" v-if="!currentUser.guestByNow">
          New Term-tree
        </button>
      </p>
      
      <div class="panel-block">
        <div class="search-block">
          <b-input
            size="is-small"
            v-model="searchString"
            type="search"
            icon="search"
            :placeholder="$t('search-placeholder')"
          />
        </div>
      </div>
      
      <div class="panel-block panel-main-content">
        <div v-if="filteredOntologies.length > 0" class="columns is-fullwidth">
          <div class="column is-one-third">
            <div class="panel">
              <div class="panel-block ontology-list">
                <a
                  v-for="ontology in filteredOntologies"
                  :key="ontology.id"
                  @click="selectOntology(ontology)"
                  class="panel-block"
                  :class="{'is-active': isSelected(ontology)}"
                >
                  <span class="panel-icon">
                    <i v-if="isSelected(ontology)" class="fas fa-caret-right" aria-hidden="true"></i>
                  </span>
                  {{ontology.name}}
                </a>
              </div>
            </div>
          </div>

          <div class="column">
            <div class="panel">
              <p class="panel-heading">
                {{selectedOntology ? selectedOntology.name : $t('not-found')}}
              </p>
              <div class="panel-block panel-main-content">
                <ontology-details
                  v-if="selectedOntology"
                  :ontology="selectedOntology"
                  @delete="deleteOntology()"
                  @rename="renameOntology"
                />
                <b-message type="is-danger" has-icon icon-size="is-small" v-else>
                  {{ $t('not-found-error') }}
                </b-message>
              </div>
            </div>
          </div>
        </div>
        
        <div v-else class="has-text-centered">
          <p class="has-text-grey">{{$t('no-matching-ontologies')}}</p>
        </div>
      </div>
    </div>

    <div class="box error" v-else>
      <div class="columns">
        <p class="column">{{$t('dont-have-access-to-any-ontology')}}</p>
        <p class="column has-text-right">
          <button class="button is-link" @click="creationModal = true" v-if="!currentUser.guestByNow">
            {{$t('new-ontology')}}
          </button>
        </p>
      </div>
    </div>
  </template>

  <add-ontology-modal :active.sync="creationModal" @newOntology="addOntology" />
</div>
</template>

<script>
import {get, sync} from '@/utils/store-helpers';
import {getWildcardRegexp} from '@/utils/string-utils';

import {OntologyCollection} from '@/api';
import OntologyDetails from './OntologyDetails';
import AddOntologyModal from './AddOntologyModal';

export default {
  name: 'list-ontologies',
  components: {
    OntologyDetails,
    AddOntologyModal
  },
  data() {
    return {
      loading: true,
      ontologies: null,
      selectedOntology: null,
      creationModal: false
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    idTargetOntology() {
      return Number(this.$route.params.idOntology) || this.$store.state.ontologies.selectedOntology;
    },
    filteredOntologies() {
      if (this.searchString.length > 0) {
        let regexp = getWildcardRegexp(this.searchString);
        return this.ontologies.filter(ontology => regexp.test(ontology.name));
      }
      return this.ontologies;
    },
    searchString: sync('ontologies/searchString')
  },
  watch: {
    idTargetOntology() {
      if (!this.idTargetOntology) {
        this.selectedOntology = this.ontologies && this.ontologies.length > 0 ? this.ontologies[0] : null;
        return;
      }
      if (this.selectedOntology && this.selectedOntology.id === this.idTargetOntology) {
        return;
      }
      this.selectTargetOntology();
    },
    selectedOntology(ontology) {
      if (ontology) {
        this.$store.commit('ontologies/setSelectedOntology', ontology.id);
      }
    }
  },
  methods: {
    selectOntology(ontology) {
      this.selectedOntology = ontology;
      // this.$router.push(`/ontology/${this.selectedOntology.id}`);
    },
    selectTargetOntology() {
      this.selectedOntology = this.ontologies.find(ontology => ontology.id === this.idTargetOntology);
    },
    isSelected(ontology) {
      return this.selectedOntology && this.selectedOntology.id === ontology.id;
    },
    sortOntologies() {
      this.ontologies.sort((a, b) => a.name.localeCompare(b.name));
    },
    addOntology(ontology) {
      this.ontologies.push(ontology);
      this.sortOntologies();
      this.selectedOntology = ontology;
    },
    renameOntology(newName) {
      this.selectedOntology.name = newName;
      this.sortOntologies();
    },
    async deleteOntology() {
      let index = this.ontologies.findIndex(ontology => ontology.id === this.selectedOntology.id);
      try {
        await this.selectedOntology.delete();
        this.ontologies.splice(index, 1);
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-ontology-deletion', {name: this.selectedOntology.name})
        });
        this.selectedOntology = this.ontologies.length > 0 ? this.ontologies[0] : null;
      } catch (error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-ontology-deletion')});
      }
    }
  },
  async created() {
    try {
      this.ontologies = (await OntologyCollection.fetchAll({light: true})).array;
    } catch (error) {
      console.log(error);
      this.loading = false;
      return;
    }
    this.sortOntologies();

    if (this.idTargetOntology) {
      this.selectTargetOntology();
    } else if (this.ontologies && this.ontologies.length > 0) {
      this.selectedOntology = this.ontologies[0];
    }

    this.loading = false;
  }
};
</script>

<style scoped>
.list-ontologies-wrapper.content-wrapper {
  height: 100%;
}

.panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-block {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-icon {
  font-size: 1.2em;
}

.panel-main-content {
  overflow: auto;
  flex-grow: 1;
}

.ontology-list {
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow-y: auto;
}

.columns.is-fullwidth {
  width: 100%;
}

.box.error .columns {
  align-items: center;
}
</style>

<style lang="scss">
@import '../../assets/styles/dark-variables';

.list-ontologies-wrapper {
  color: $dark-text-primary;
}

.list-ontologies-wrapper .panel {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

.list-ontologies-wrapper .panel-heading {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

.list-ontologies-wrapper .panel-block {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

.list-ontologies-wrapper .panel-block:not(:last-child) {
  border-color: $dark-border-color;
}

.list-ontologies-wrapper .panel-block.ontology-list {
  padding: 0;
}

.list-ontologies-wrapper .panel-block a.panel-block {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

.list-ontologies-wrapper .panel-block a.panel-block:hover {
  background-color: $dark-bg-hover;
}

.list-ontologies-wrapper .panel-block a.panel-block.is-active {
  background-color: $dark-bg-active;
}

.list-ontologies-wrapper .button {
  background-color: $dark-button-bg;
  color: $dark-text-primary;
  border-color: $dark-button-border;
}

.list-ontologies-wrapper .button:hover {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}

.list-ontologies-wrapper .button.is-link {
  background-color: #3273dc;
  border-color: transparent;
  color: #fff;
}

.list-ontologies-wrapper .input {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
  border-color: $dark-input-border;
}

.list-ontologies-wrapper .input:focus {
  border-color: $dark-input-focus-border;
  box-shadow: 0 0 0 0.125em $dark-input-focus-shadow;
}

.list-ontologies-wrapper .box {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

.list-ontologies-wrapper .box.error {
  background-color: #a94442;
}

.list-ontologies-wrapper .message-body {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

/* 暗黑模式下滚动条样式 */
.list-ontologies-wrapper::-webkit-scrollbar,
.panel-block::-webkit-scrollbar,
.ontology-list::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.list-ontologies-wrapper::-webkit-scrollbar-track,
.panel-block::-webkit-scrollbar-track,
.ontology-list::-webkit-scrollbar-track {
  background: $dark-scrollbar-track;
}

.list-ontologies-wrapper::-webkit-scrollbar-thumb,
.panel-block::-webkit-scrollbar-thumb,
.ontology-list::-webkit-scrollbar-thumb {
  background: $dark-scrollbar-thumb;
  border-radius: 4px;
}

.list-ontologies-wrapper::-webkit-scrollbar-thumb:hover,
.panel-block::-webkit-scrollbar-thumb:hover,
.ontology-list::-webkit-scrollbar-thumb:hover {
  background: $dark-scrollbar-thumb-hover;
}

.has-text-grey {
  color: $dark-text-disabled !important;
}
</style>