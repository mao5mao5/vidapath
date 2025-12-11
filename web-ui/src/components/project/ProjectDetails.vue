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
  <b-message v-if="error" type="is-danger" has-icon icon-size="is-small" size="is-small">
    <h2> {{ $t('error') }} </h2>
    <p> {{ $t('unexpected-error-info-message') }} </p>
  </b-message>
  <div v-else>
    <table class="table">
      <b-loading :is-full-page="false" :active="loading" class="small" />
      <tbody v-if="!loading">
        <tr v-if="isPropDisplayed('imagesPreview')">
          <td class="prop-label">{{ $t('images') }}</td>
          <td class="prop-content">
            <list-images-preview :project="project" />
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{ $t('actions') }}</td>
          <td class="prop-content">
            <button class="button is-small" @click="showDetailModal = true" style="margin-right: 0.5rem;" >
              More details
            </button>
            <project-actions v-if="canManageProject" :project="project" @update="$emit('update', $event)"
              @delete="$emit('delete')"/>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="showDetailModal" class="modal is-active">
      <div class="modal-background" @click="showDetailModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Case details</p>
          <button class="delete" aria-label="close" @click="showDetailModal = false"></button>
        </header>
        <section class="modal-card-body">
          <table class="table is-fullwidth">
            <tbody>
              <!-- <tr v-if="currentAccount.isDeveloper">
                <td class="prop-label">{{ $t('id') }}</td>
                <td class="prop-content">{{ project.id }}</td>
              </tr>
              <tr>
                <td class="prop-label">{{ $t('name') }}</td>
                <td class="prop-content">
                  {{ project.name }}
                </td>
              </tr> -->
              <tr>
                <td class="prop-label">{{ $t('images') }}</td>
                <td class="prop-content">
                  <router-link :to="`/project/${project.id}/images`">{{ project.numberOfImages }}</router-link>
                </td>
              </tr>
              <tr>
                <td class="prop-label">{{ $t('members') }}</td>
                <td class="prop-content">
                  {{ members.length }}
                </td>
              </tr>
              <tr>
                <td class="prop-label">{{ $t('user-annotations') }}</td>
                <td class="prop-content">
                  <router-link :to="`/project/${project.id}/annotations?type=user`">
                    {{ project.numberOfAnnotations }}
                  </router-link>
                </td>
              </tr>
              <!-- <tr>
                <td class="prop-label">{{ $t('reviewed-annotations') }}</td>
                <td class="prop-content">
                  <router-link :to="`/project/${project.id}/annotations?type=reviewed`">
                    {{ project.numberOfReviewedAnnotations }}
                  </router-link>
                </td>
              </tr> -->
              <tr>
                <td class="prop-label">{{ $t('description') }}</td>
                <td class="prop-content">
                  <cytomine-description :object="project" :canEdit="canManageProject" />
                </td>
              </tr>
              <tr>
                <td class="prop-label">{{ $t('tags') }}</td>
                <td class="prop-content">
                  <cytomine-tags :object="project" :canEdit="canManageProject" />
                </td>
              </tr>
              <!-- <tr>
                <td class="prop-label">{{ $t('properties') }}</td>
                <td class="prop-content">
                  <cytomine-properties :object="project" :canEdit="canManageProject" />
                </td>
              </tr> -->
              <tr>
                <td class="prop-label">{{ $t('attached-files') }}</td>
                <td class="prop-content">
                  <attached-files :object="project" :canEdit="canManageProject" />
                </td>
              </tr>
              <!-- <tr>
                <td class="prop-label">{{ $t('ontology') }}</td>
                <td class="prop-content">
                  <router-link v-if="project.ontology" :to="`/ontology/${project.ontology}`">
                    {{ project.ontologyName }}
                  </router-link>
                  <em v-else>{{ $t('no-ontology') }}</em>
                </td>
              </tr> -->
              <tr>
                <td class="prop-label">{{ $t('created-on') }}</td>
                <td class="prop-content">
                  {{ Number(project.created) | moment('ll') }}
                </td>
              </tr>
              <!-- <tr>
                <td class="prop-label">{{ $t('creator') }}</td>
                <td class="prop-content">
                  <list-usernames :users="[creator]" :onlines="onlines" />
                </td>
              </tr>
              <tr>
                <td class="prop-label">{{ $t('representatives') }} ({{ representatives.length }})</td>
                <td class="prop-content">
                  <list-usernames :users="representatives" :onlines="onlines" />
                </td>
              </tr> -->
              <tr>
                <td class="prop-label">{{ $t('managers') }} ({{ managers.length }})</td>
                <td class="prop-content">
                  <list-usernames :users="managers" :onlines="onlines" />
                </td>
              </tr>
              <tr>
                <td class="prop-label">{{ $t('contributors') }} ({{ contributors.length }})</td>
                <td class="prop-content">
                  <list-usernames :users="contributors" :onlines="onlines" />
                </td>
              </tr>
            </tbody>
          </table>
        </section>
        <footer class="modal-card-foot" style="justify-content: flex-end;">
          <button class="button" @click="showDetailModal = false">{{ $t('button-close') }}</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { get } from '@/utils/store-helpers';

import ListImagesPreview from '@/components/image/ListImagesPreview';
import ListUsernames from '@/components/user/ListUsernames';
import ProjectActions from './ProjectActions';
import CytomineDescription from '@/components/description/CytomineDescription';
import CytomineProperties from '@/components/property/CytomineProperties';
import CytomineTags from '@/components/tag/CytomineTags';
import AttachedFiles from '@/components/attached-file/AttachedFiles';

export default {
  name: 'project-details',
  components: {
    ListImagesPreview,
    ListUsernames,
    ProjectActions,
    CytomineDescription,
    CytomineProperties,
    CytomineTags,
    AttachedFiles
  },
  props: {
    project: { type: Object },
    excludedProperties: { type: Array, default: () => [] },
    editable: { type: Boolean, default: false }
  },
  data() {
    return {
      loading: true,
      error: false,
      showDetailModal: false,

      creator: null,
      managers: [],
      members: [],
      onlines: [],
      representatives: []
    };
  },
  computed: {
    currentUser: get('currentUser/user'),
    currentAccount: get('currentUser/account'),
    blindMode() {
      return ((this.project || {}).blindMode) || false;
    },
    canManageProject() {
      return this.editable && (this.currentUser.adminByNow || this.managersIds.includes(this.currentUser.id));
    },
    managersIds() {
      return this.managers.map(manager => manager.id);
    },
    contributors() {
      return this.members.filter(member => !this.managersIds.includes(member.id));
    }
  },
  methods: {
    async fetchCreator() {
      this.creator = await this.project.fetchCreator();
    },
    async fetchManagers() {
      this.managers = (await this.project.fetchAdministrators()).array;
    },
    async fetchRepresentatives() {
      this.representatives = (await this.project.fetchRepresentatives()).array;
    },
    async fetchMembers() {
      this.members = (await this.project.fetchUsers()).array;
    },
    async fetchOnlines() {
      this.onlines = await this.project.fetchConnectedUsers();
    },

    isPropDisplayed(prop) {
      return !this.excludedProperties.includes(prop);
    },

    deleteProject() {
      this.$buefy.dialog.confirm({
        title: this.$t('delete-project'),
        message: this.$t('delete-project-confirmation-message', { projectName: this.project.name }),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.$emit('delete')
      });
    },

  },
  async created() {
    try {
      await Promise.all([
        this.fetchCreator(),
        this.fetchManagers(),
        this.fetchRepresentatives(),
        this.fetchMembers(),
        this.fetchOnlines()
      ]);
    } catch (error) {
      console.log(error);
      this.error = true;
    }
    this.loading = false;
  }
};
</script>

<style scoped lang="scss">
@import '../../assets/styles/dark-variables.scss';

.table {
  background: none;
  position: relative;
  height: 3em;
}

td.prop-label {
  white-space: nowrap;
  font-weight: 600;
  width: 5%;
}

td.prop-content {
  display: flex;
  width: 100%;
}

.prop-label {
  font-weight: bold;
}

.modal-card {
  max-width: 800px;
  width: auto;
  margin: 0 auto;
}

.modal-card-head {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-bottom: 1px solid $dark-border-color;
}

.modal-card-body {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
  max-height: 70vh;
}

.modal-card-foot {
  background-color: $dark-bg-secondary;
  border-top: 1px solid $dark-border-color;
}

.modal-card-title {
  color: $dark-text-primary;
}

.modal-card-foot button {
  background-color: $dark-button-bg;
  border-color: $dark-button-border;
  color: $dark-text-primary;
}

.modal-card-foot button:hover {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}
</style>