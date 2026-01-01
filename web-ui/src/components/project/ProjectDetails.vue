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
          <td class="prop-label">Slides</td>
          <td class="prop-content">
            <list-images-preview :project="project" />
          </td>
        </tr>
        <tr>
          <td class="prop-label">{{ $t('actions') }}</td>
          <td class="prop-content">
            <button class="button" @click="showDetailModal = true" style="margin-right: 0.5rem;" >
              Case detail
            </button>
            <button class="button" v-if="!$keycloak.hasTemporaryToken" @click="showPatientInfoModal = true" style="margin-right: 0.5rem;">
              Patient information
            </button>
            <button class="button" v-if="!$keycloak.hasTemporaryToken" @click="showEditPatientInfoModal = true" style="margin-right: 0.5rem;">
              Edit
            </button>
            <!-- <project-actions v-if="canManageProject" :project="project" @update="$emit('update', $event)"
              @delete="$emit('delete')"/> -->
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
                <td class="prop-label">Slides</td>
                <td class="prop-content">
                  <router-link :to="`/project/${project.id}/images`">{{ project.numberOfImages }}</router-link>
                </td>
              </tr>
              <!-- <tr>
                <td class="prop-label">{{ $t('members') }}</td>
                <td class="prop-content">
                  {{ members.length }}
                </td>
              </tr> -->
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
              </tr> -->
              <tr>
                <td class="prop-label">Assigned users ({{ representatives.length }})</td>
                <td class="prop-content">
                  <list-usernames :users="representatives" :onlines="onlines" />
                </td>
              </tr>
              <!-- <tr>
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
              </tr> -->
            </tbody>
          </table>
        </section>
        <footer class="modal-card-foot" style="justify-content: flex-end;">
          <button class="button" @click="showDetailModal = false">{{ $t('button-close') }}</button>
        </footer>
      </div>
    </div>

    <div v-if="showPatientInfoModal" class="modal is-active">
      <div class="modal-background" @click="showPatientInfoModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Patient Information</p>
          <button class="delete" aria-label="close" @click="showPatientInfoModal = false"></button>
        </header>
        <section class="modal-card-body">
          <table class="table is-fullwidth">
            <tbody>
              <tr>
                <td class="prop-label">Patient ID</td>
                <td class="prop-content">{{ project.patientId || 'N/A' }}</td>
              </tr>
              <tr>
                <td class="prop-label">Patient Name</td>
                <td class="prop-content">{{ project.patientName || 'N/A' }}</td>
              </tr>
              <tr>
                <td class="prop-label">Patient Age</td>
                <td class="prop-content">{{ project.patientAge || 'N/A' }}</td>
              </tr>
              <tr>
                <td class="prop-label">Gender</td>
                <td class="prop-content">{{ project.patientSex || 'N/A' }}</td>
              </tr>
              <tr>
                <td class="prop-label">MRN</td>
                <td class="prop-content">{{ project.medicalRecordNumber || 'N/A' }}</td>
              </tr>
            </tbody>
          </table>
        </section>
        <footer class="modal-card-foot" style="justify-content: flex-end;">
          <button class="button" @click="showPatientInfoModal = false">{{ $t('button-close') }}</button>
        </footer>
      </div>
    </div>

    <!-- Edit Patient Information Modal -->
    <div v-if="showEditPatientInfoModal" class="modal is-active">
      <div class="modal-background" @click="showEditPatientInfoModal = false"></div>
      <div class="modal-card" style="max-height: 90vh; overflow: auto;">
        <header class="modal-card-head">
          <p class="modal-card-title">Edit Patient Information</p>
          <button class="delete" aria-label="close" @click="showEditPatientInfoModal = false"></button>
        </header>
        <section class="modal-card-body">
          <b-field :label="$t('accession-id')">
            <b-input v-model="editingProject.accessionId" :placeholder="$t('accession-id')" />
          </b-field>

          <b-field :label="$t('access-date')">
            <b-datepicker v-model="editingProject.accessDate" :placeholder="$t('access-date')" icon="calendar-today"
              :mobile-native="true" />
          </b-field>

          <b-field :label="$t('status')">
            <b-select v-model="editingProject.status" :placeholder="$t('select-status')" expanded>
              <option value="NOT_READY">{{$t('status-not-ready')}}</option>
              <option value="READY">{{$t('status-ready')}}</option>
              <option value="REVIEWED">{{$t('status-reviewed')}}</option>
            </b-select>
          </b-field>

          <b-field :label="$t('patient-id')">
            <b-input v-model="editingProject.patientId" :placeholder="$t('patient-id')" />
          </b-field>

          <b-field :label="$t('tissue')">
            <b-input v-model="editingProject.tissue" :placeholder="$t('tissue')" />
          </b-field>

          <b-field :label="$t('specimen')">
            <b-input v-model="editingProject.specimen" :placeholder="$t('specimen')" />
          </b-field>

          <b-field label="Stain">
            <b-input v-model="editingProject.stain" :placeholder="$t('stain')" />
          </b-field>
        </section>
        <footer class="modal-card-foot" style="justify-content: flex-end;">
          <button class="button" @click="showEditPatientInfoModal = false">{{ $t('button-cancel') }}</button>
          <button class="button is-primary" @click="savePatientInfo">Save</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import { get } from '@/utils/store-helpers';
import { Project } from '@/api';

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
      showPatientInfoModal: false,
      showEditPatientInfoModal: false,

      creator: null,
      managers: [],
      members: [],
      onlines: [],
      representatives: [],
      
      // 用于编辑患者信息的数据
      editingProject: {
        accessionId: '',
        accessDate: null,
        status: '',
        patientId: '',
        tissue: '',
        specimen: '',
        stain: ''
      }
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

    // 初始化编辑项目数据
    initializeEditingProject() {
      this.editingProject = {
        accessionId: this.project.accessionId || '',
        accessDate: this.project.accessDate ? new Date(this.project.accessDate) : null,
        status: this.project.status || '',
        patientId: this.project.patientId || '',
        tissue: this.project.tissue || '',
        specimen: this.project.specimen || '',
        stain: this.project.stain || ''
      };
    },

    // 保存患者信息
    async savePatientInfo() {
      try {
        // 创建一个新对象，包含需要更新的字段
        const updatedData = {
          accessionId: this.editingProject.accessionId,
          accessDate: this.editingProject.accessDate,
          status: this.editingProject.status,
          patientId: this.editingProject.patientId,
          tissue: this.editingProject.tissue,
          specimen: this.editingProject.specimen,
          stain: this.editingProject.stain
        };

        // 创建一个新的Project实例，包含当前项目的数据和更新的数据
        const projectToUpdate = {
          ...this.project,
          ...updatedData
        };

        // 使用update方法更新项目
        const updatedProject = await new Project(projectToUpdate).update();

        // 刷新父组件
        this.$emit('update', updatedProject);

        // 关闭模态框
        this.showEditPatientInfoModal = false;

        this.$notify({
          type: 'success',
          text: 'Patient information updated successfully.'
        });
      } catch (error) {
        console.error('Error updating patient information:', error);
        this.$notify({
          type: 'error',
          text: 'Failed to update patient information.'
        });
      }
    }

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
  },
  
  // 在组件更新时初始化编辑数据
  watch: {
    project: {
      handler() {
        if (this.project) {
          this.initializeEditingProject();
        }
      },
      immediate: true
    }
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
  min-width: 400px;
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