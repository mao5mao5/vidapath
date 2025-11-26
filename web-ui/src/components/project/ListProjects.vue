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
  <div class="list-projects-wrapper content-wrapper">
    <b-loading :is-full-page="false" :active="loading" />
    <div class="box error" v-if="error">
      <h2> {{ $t('error') }} </h2>
      <p>{{ $t('unexpected-error-info-message') }}</p>
    </div>
    <div v-else-if="!loading" class="panel">
      <p class="panel-heading">
        {{ $t('case-management') }}
        <button v-if="!currentUser.guestByNow" class="button is-link" @click="creationModal = true">
          {{ $t('new-case') }}
        </button>
      </p>
      <div class="panel-block">
        <div class="search-block">
          <b-input class="search-projects" v-model="searchString" :placeholder="$t('search-placeholder')" type="search"
            icon="search" />
          <button class="button" @click="toggleFilterDisplay()">
            <span class="icon">
              <i class="fas fa-filter"></i>
            </span>
            <span>
              {{ filtersOpened ? $t('button-hide-filters') : $t('button-show-filters') }}
            </span>
            <span v-if="nbActiveFilters" class="nb-active-filters">
              {{ nbActiveFilters }}
            </span>
          </button>
        </div>

        <b-collapse :open="filtersOpened">
          <div class="filters">


            <div class="columns">
              <div class="column filter">
                <div class="filter-label">
                  {{ $t('my-role') }}
                </div>
                <div class="filter-body">
                  <cytomine-multiselect v-model="selectedRoles" :options="availableRoles" multiple
                    :searchable="false" />
                </div>
              </div>
              <div class="column filter">
                <div class="filter-label">
                  Patient ID
                </div>
                <div class="filter-body">
                  <b-input v-model="patientIdFilter" placeholder="Filter by patient ID" />
                </div>
              </div>

              <div class="column filter">
                <div class="filter-label">
                  Patient Name
                </div>
                <div class="filter-body">
                  <b-input v-model="patientNameFilter" placeholder="Filter by patient name" />
                </div>
              </div>

              <div class="column filter">
                <div class="filter-label">
                  Status
                </div>
                <div class="filter-body">
                  <cytomine-multiselect v-model="selectedStatuses" :options="availableStatuses" label="name"
                    track-by="id" :multiple="true" :allPlaceholder="'All statuses'" />
                </div>
              </div>
            </div>

            <div class="columns">
              <div class="column filter">
                <div class="filter-label">
                  Accession ID
                </div>
                <div class="filter-body">
                  <b-input v-model="accessionIdFilter" placeholder="Filter by accession ID" />
                </div>
              </div>

              <div class="column filter">
                <div class="filter-label">
                  Medical Record Number
                </div>
                <div class="filter-body">
                  <b-input v-model="medicalRecordNumberFilter" placeholder="Filter by MRN" />
                </div>
              </div>

              <div class="column filter">
                <div class="filter-label">
                  Tissue
                </div>
                <div class="filter-body">
                  <b-input v-model="tissueFilter" placeholder="Filter by tissue" />
                </div>
              </div>
              <div class="column filter">
                <div class="filter-label">
                  Specimen
                </div>
                <div class="filter-body">
                  <b-input v-model="specimenFilter" placeholder="Filter by specimen" />
                </div>
              </div>
            </div>
          </div>
        </b-collapse>

        <cytomine-table :collection="projectCollection" :is-empty="nbEmptyFilters > 0" class="table-projects"
          :currentPage.sync="currentPage" :perPage.sync="perPage" :openedDetailed.sync="openedDetails"
          :sort.sync="sortField" :order.sync="sortOrder" :revision="revision">
          <template #default="{ row: project }">
            <b-table-column field="currentUserRole" label="" centered width="1" sortable>
              <icon-project-member-role :is-manager="project.currentUserRoles.admin"
                :is-representative="project.currentUserRoles.representative" />
            </b-table-column>

            <!-- <b-table-column field="name" :label="$t('name')" sortable width="250">
            <a @click="openProject(project)">
              {{ project.name }}
            </a>
          </b-table-column>

          <b-table-column field="membersCount" :label="$t('members')" centered sortable width="150">
            {{ project.membersCount }}
          </b-table-column>

          <b-table-column field="numberOfImages" :label="$t('images')" centered sortable width="150">
             {{ project.numberOfImages }}
          </b-table-column>

          <b-table-column field="numberOfAnnotations" :label="$t('user-annotations')" centered sortable width="150">
             {{ project.numberOfAnnotations }}
          </b-table-column>

          <b-table-column field="numberOfReviewedAnnotations" :label="$t('reviewed-annotations')" centered sortable width="150">
            {{ project.numberOfReviewedAnnotations }}
          </b-table-column> -->

            <b-table-column field="patientId" :label="$t('patient-id')" centered sortable width="150">
              {{ project.patientId }}
            </b-table-column>

            <b-table-column field="patientName" :label="$t('patient-name')" centered sortable width="150">
              {{ project.patientName }}
            </b-table-column>

            <b-table-column field="patientAge" :label="$t('patient-age')" centered sortable width="150">
              {{ project.patientAge }}
            </b-table-column>

            <b-table-column field="patientSex" label="Gender" centered sortable width="150">
              {{ project.patientSex }}
            </b-table-column>

            <b-table-column field="accessionId" :label="$t('accession-id')" centered sortable width="150">
              {{ project.accessionId }}
            </b-table-column>

            <b-table-column field="status" :label="$t('status')" centered sortable width="150">
              <span :class="`status-${project.status?.toLowerCase().replace('_', '-')}`">
                {{ formatStatus(project.status) }}
              </span>
            </b-table-column>

            <b-table-column field="accessDate" :label="$t('access-date')" centered sortable width="180">
              {{ project.accessDate | moment('ll') }}
            </b-table-column>

            <b-table-column field="medicalRecordNumber" :label="$t('medical-record-number')" centered sortable
              width="150">
              {{ project.medicalRecordNumber }}
            </b-table-column>

            <b-table-column field="tissue" :label="$t('tissue')" centered sortable width="150">
              {{ project.tissue }}
            </b-table-column>

            <b-table-column field="specimen" :label="$t('specimen')" centered sortable width="150">
              {{ project.specimen }}
            </b-table-column>

            <b-table-column field="stain" label="Stain" centered sortable width="150">
              {{ project.stain }}
            </b-table-column>

            <!-- <b-table-column field="lastActivity" :label="$t('last-activity')" centered sortable width="180">
            {{ Number(project.lastActivity) | moment('ll') }}
          </b-table-column> -->

            <b-table-column label="Actions" centered width="150">
              <div class="buttons">
                <button class="button is-small is-link" @click="openAddImageModal(project)">
                  {{ $t('button-add-image') }}
                </button>
                <button class="button is-small is-link" @click="openProject(project)">
                  Open in viewer
                </button>
                <button class="button is-small is-info" @click="openShareModal(project)">
                  {{ $t('button-share') }}
                </button>
              </div>
            </b-table-column>
          </template>

          <template #detail="{ row: project }">
            <project-details :project="project" :excluded-properties="excludedProperties" editable
              @update="updateProject()" @delete="deleteProject(project)" />
          </template>

          <template #empty>
            <div class="content has-text-grey has-text-centered">
              <p>{{ $t('no-project') }}</p>
            </div>
          </template>
        </cytomine-table>

        <!-- <div class="legend">
          <h2>{{$t('legend')}}</h2>
          <p><icon-project-member-role /> : {{$t('contributor-icon-label')}}</p>
          <p><icon-project-member-role :is-manager="true" /> : {{$t('manager-icon-label')}}</p>
          <p><icon-project-member-role :is-manager="true" :is-representative="true" /> : {{$t('representative-icon-label')}}</p>
      </div> -->
      </div>
    </div>

    <add-project-modal :active.sync="creationModal" :ontologies="ontologies" />
    <add-image-modal :active.sync="addImageModal" :project="selectedProject" @addImage="updateProject()" />
    <share-project-modal :active.sync="shareProjectModal" :project="selectedProject" />
  </div>
</template>

<script>
import CytomineTable from '@/components/utils/CytomineTable';
import CytomineMultiselect from '@/components/form/CytomineMultiselect';
import CytomineSlider from '@/components/form/CytomineSlider';
import ProjectDetails from './ProjectDetails';
import AddProjectModal from './AddProjectModal';
import ShareProjectModal from './ShareProjectModal';

import { get, sync, syncBoundsFilter, syncMultiselectFilter } from '@/utils/store-helpers';

import { ImageInstanceCollection, ProjectCollection, OntologyCollection, TagCollection } from '@/api';
import IconProjectMemberRole from '@/components/icons/IconProjectMemberRole';
import AddImageModal from '@/components/image/AddImageModal.vue';
export default {
  name: 'list-projects',
  components: {
    IconProjectMemberRole,
    CytomineTable,
    ProjectDetails,
    AddProjectModal,
    ShareProjectModal,
    AddImageModal,
    CytomineMultiselect,
    CytomineSlider
  },
  data() {
    return {
      loading: true,
      error: false,

      projects: [],
      ontologies: [],
      availableTags: [],

      contributorLabel: this.$t('contributor'),
      managerLabel: this.$t('manager'),

      creationModal: false,
      addImageModal: false,
      shareProjectModal: false,
      selectedProject: null,

      excludedProperties: [
        'name',
        'membersCount',
        'numberOfImages',
        'numberOfAnnotations',
        'numberOfReviewedAnnotations',
        'lastActivity',
        'patientId',
        'patientName',
        'patientAge',
        'accessionId',
        'status',
        'accessDate',
        'medicalRecordNumber',
        'tissue',
        'specimen'
      ],
      maxNbMembers: 10,
      maxNbImages: 10,
      maxNbUserAnnotations: 100,
      maxNbReviewedAnnotations: 100,

      // 新增的过滤字段
      patientIdFilter: '',
      patientNameFilter: '',
      accessionIdFilter: '',
      medicalRecordNumberFilter: '',
      tissueFilter: '',
      specimenFilter: '',
      selectedStatuses: [],

      revision: 0
    };
  },
  computed: {
    currentUser: get('currentUser/user'),

    searchString: sync('listProjects/searchString', { debounce: 500 }),
    filtersOpened: sync('listProjects/filtersOpened'),

    availableRoles() {
      return [this.contributorLabel, this.managerLabel];
    },
    availableOntologies() {
      return [{ id: 'null', name: this.$t('no-ontology') }, ...this.ontologies];
    },
    availableStatuses() {
      return [
        { id: 'NOT_READY', name: this.$t('status-not-ready') },
        { id: 'READY', name: this.$t('status-ready') },
        { id: 'REVIEWED', name: this.$t('status-reviewed') }
      ];
    },

    querySearchTags() {
      return this.$route.query.tags;
    },
    selectedOntologies: syncMultiselectFilter('listProjects', 'selectedOntologies', 'availableOntologies'),
    selectedRoles: syncMultiselectFilter('listProjects', 'selectedRoles', 'availableRoles'),
    selectedTags: syncMultiselectFilter('listProjects', 'selectedTags', 'availableTags'),
    boundsMembers: syncBoundsFilter('listProjects', 'boundsMembers', 'maxNbMembers'),
    boundsImages: syncBoundsFilter('listProjects', 'boundsImages', 'maxNbImages'),
    boundsUserAnnotations: syncBoundsFilter('listProjects', 'boundsUserAnnotations', 'maxNbUserAnnotations'),
    boundsReviewedAnnotations: syncBoundsFilter('listProjects', 'boundsReviewedAnnotations', 'maxNbReviewedAnnotations'),

    nbActiveFilters() {
      return this.$store.getters['listProjects/nbActiveFilters'];
    },
    nbEmptyFilters() {
      return this.$store.getters['listProjects/nbEmptyFilters'];
    },

    selectedOntologiesIds() {
      return this.selectedOntologies.map(ontology => ontology.id);
    },
    selectedStatusesIds() {
      return this.selectedStatuses.map(status => status.id);
    },

    boundsFilters() {
      return [
        { prop: 'numberOfImages', bounds: this.boundsImages, max: this.maxNbImages },
        { prop: 'membersCount', bounds: this.boundsMembers, max: this.maxNbMembers },
        { prop: 'numberOfAnnotations', bounds: this.boundsUserAnnotations, max: this.maxNbUserAnnotations },
        { prop: 'numberOfReviewedAnnotations', bounds: this.boundsReviewedAnnotations, max: this.maxNbReviewedAnnotations },
      ];
    },

    projectCollection() {
      let collection = new ProjectCollection({
        withMembersCount: true,
        withLastActivity: true,
        withCurrentUserRoles: true,
        withPatientId: true,
        withPatientName: true,
        withPatientAge: true,
        withAccessionId: true,
        withStatus: true,
        withAccessDate: true,
        withMedicalRecordNumber: true,
        withTissue: true,
        withSpecimen: true
      });
      if (this.selectedOntologiesIds.length > 0 && this.selectedOntologiesIds.length < this.availableOntologies.length) {
        collection['ontology'] = {
          in: this.selectedOntologiesIds.join()
        };
      }
      if (this.selectedRoles.length > 0) {
        collection['currentUserRole'] = {
          in: this.selectedRoles.join().toLowerCase()
        };
      }
      if (this.searchString) {
        collection['patientName'] = {
          ilike: encodeURIComponent(this.searchString)
        };
      }
      if (this.selectedTags.length > 0 && this.selectedTags.length < this.availableTags.length) {
        collection['tag'] = {
          in: this.selectedTags.map(t => t.id).join()
        };
      }

      // 添加新的过滤条件
      if (this.patientIdFilter) {
        collection['patientId'] = {
          ilike: encodeURIComponent(this.patientIdFilter)
        };
      }
      if (this.patientNameFilter) {
        collection['patientName'] = {
          ilike: encodeURIComponent(this.patientNameFilter)
        };
      }
      if (this.accessionIdFilter) {
        collection['accessionId'] = {
          ilike: encodeURIComponent(this.accessionIdFilter)
        };
      }
      if (this.medicalRecordNumberFilter) {
        collection['medicalRecordNumber'] = {
          ilike: encodeURIComponent(this.medicalRecordNumberFilter)
        };
      }
      if (this.tissueFilter) {
        collection['tissue'] = {
          ilike: encodeURIComponent(this.tissueFilter)
        };
      }
      if (this.specimenFilter) {
        collection['specimen'] = {
          ilike: encodeURIComponent(this.specimenFilter)
        };
      }
      if (this.selectedStatusesIds.length > 0) {
        collection['status'] = {
          in: this.selectedStatusesIds.join()
        };
      }

      for (let { prop, bounds, max } of this.boundsFilters) {
        collection[prop] = {};
        if (bounds[1] !== max) {
          // if max bounds is the max possible value, do not set the filter in the request
          // so that if an event (ex: algo creates an annotation) happens between the bounds request and the query request
          // the image will not be skipped from the result
          collection[prop] = {
            lte: bounds[1]
          };
        }
        if (bounds[0] > 0) {
          collection[prop]['gte'] = bounds[0];
        }
      }
      return collection;
    },
    currentPage: sync('listProjects/currentPage'),
    perPage: sync('listProjects/perPage'),
    sortField: sync('listProjects/sortField'),
    sortOrder: sync('listProjects/sortOrder'),
    openedDetails: sync('listProjects/openedDetails')
  },
  watch: {
    revision() {
      this.fetchOntologies();
      this.fetchMaxFilters();
    },
    querySearchTags(values) {
      if (values) {
        this.selectedTags = [];
        let queriedTags = this.availableTags.filter(tag => values.split(',').includes(tag.name));
        if (queriedTags) {
          this.selectedTags = queriedTags;
        }
      }
    },
    patientIdFilter() {
      this.revision++;
    },
    patientNameFilter() {
      this.revision++;
    },
    accessionIdFilter() {
      this.revision++;
    },
    medicalRecordNumberFilter() {
      this.revision++;
    },
    tissueFilter() {
      this.revision++;
    },
    specimenFilter() {
      this.revision++;
    },
    selectedStatuses: {
      handler() {
        this.revision++;
      },
      deep: true
    }
  },
  methods: {
    async fetchOntologies() {
      let ontologies = (await OntologyCollection.fetchAll({ light: true })).array;
      ontologies.sort((a, b) => a.name.localeCompare(b.name));
      this.ontologies = ontologies;
    },
    async fetchMaxFilters() {
      let stats = await ProjectCollection.fetchBounds({ withMembersCount: true });

      this.maxNbMembers = Math.max(10, stats.members.max);
      this.maxNbImages = Math.max(10, stats.numberOfImages.max);
      this.maxNbUserAnnotations = Math.max(100, stats.numberOfAnnotations.max);
      this.maxNbReviewedAnnotations = Math.max(100, stats.numberOfReviewedAnnotations.max);
    },
    async fetchTags() {
      this.availableTags = [{ id: 'null', name: this.$t('no-tag') }, ...(await TagCollection.fetchAll()).array];
    },
    toggleFilterDisplay() {
      this.filtersOpened = !this.filtersOpened;
    },
    updateProject() {
      this.revision++;
    },
    async deleteProject(projectToDelete) {
      try {
        await projectToDelete.delete();
        this.revision++;
        this.$notify({
          type: 'success',
          text: this.$t('notif-success-project-deletion', { projectName: projectToDelete.name })
        });
      } catch (error) {
        this.$notify({
          type: 'error',
          text: this.$t('notif-error-project-deletion', { projectName: projectToDelete.name })
        });
        return;
      }
    },

    updateProject() {
      this.revision++;
    },

    async openProject(project) {
      try {
        // 获取项目的第一张图片
        const imageCollection = new ImageInstanceCollection({
          filterKey: 'project',
          filterValue: project.id,
          sort: 'id',
          order: 'asc',
          max: 1
        });

        const images = await imageCollection.fetchPage(0);
        if (images.array.length > 0) {
          const firstImage = images.array[0];
          // 跳转到Viewer并显示第一张图片
          this.$router.push(`/project/${project.id}/image/${firstImage.id}`);
        } else {
          // 如果项目中没有图片，则只跳转到项目页面
          this.$router.push(`/project/${project.id}`);
        }
      } catch (error) {
        console.error('Error fetching first image:', error);
        // 出错时仍然跳转到项目页面
        this.$router.push(`/project/${project.id}`);
      }
    },
    formatStatus(status) {
      switch (status) {
        case 'NOT_READY':
          return this.$t('status-not-ready');
        case 'READY':
          return this.$t('status-ready');
        case 'REVIEWED':
          return this.$t('status-reviewed');
        default:
          return status;
      }
    },

    openAddImageModal(project) {
      this.selectedProject = project;
      this.addImageModal = true;
    },

    openShareModal(project) {
      this.selectedProject = project;
      this.shareProjectModal = true;
    },

    updateProject() {
      this.revision++;
    },

    resetFilters() {
      // 重置搜索字符串
      this.searchString = '';

      // 重置选择的过滤器
      this.selectedOntologies = [];
      this.selectedRoles = [];
      this.selectedTags = [];
      this.selectedStatuses = [];

      // 重置滑块过滤器
      this.boundsMembers = [0, this.maxNbMembers];
      this.boundsImages = [0, this.maxNbImages];
      this.boundsUserAnnotations = [0, this.maxNbUserAnnotations];
      this.boundsReviewedAnnotations = [0, this.maxNbReviewedAnnotations];

      // 重置新的文本过滤字段
      this.patientIdFilter = '';
      this.patientNameFilter = '';
      this.accessionIdFilter = '';
      this.medicalRecordNumberFilter = '';
      this.tissueFilter = '';
      this.specimenFilter = '';

      // 触发重新查询
      this.revision++;
    }
  },
  async created() {
    try {
      await Promise.all([
        this.fetchOntologies(),
        this.fetchMaxFilters(),
        this.fetchTags()
      ]);
    } catch (error) {
      console.log(error);
      this.error = true;
    }
    if (this.$route.query.tags) {
      let queriedTags = this.availableTags.filter(tag => this.$route.query.tags.split(',').includes(tag.name));
      if (queriedTags) {
        this.selectedTags = queriedTags;
      }
    }

    this.loading = false;
  }
};
</script>

<style scoped lang="scss">
@import '../../assets/styles/dark-variables';

.panel-block {
  padding-top: 0.8em;
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

.search-block {
  display: flex;
}

.legend {
  margin-top: 0.8rem;
  margin-bottom: 1rem;
  border-radius: 10px;
  padding: 1rem 1.5em;
  background: $dark-bg-tertiary;
  color: $dark-text-primary;
}

.legend p:not(:last-child) {
  margin-bottom: 0.4em;
}

/* 暗黑模式下的过滤器区域 */
.filters {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

.filter-label {
  color: $dark-text-primary;
}

.status-not-ready {
  background-color: pink;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.status-ready {
  background-color: orange;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.status-reviewed {
  background-color: darkgreen;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

/* 暗黑模式下的表格样式 */
:deep(.table) {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

:deep(.table tr) {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

:deep(.table tr:hover) {
  background-color: $dark-bg-hover;
}

:deep(.table th) {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

:deep(.table td) {
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

/* 暗黑模式下的分页控件 */
:deep(.pagination) {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
}

:deep(.pagination .button) {
  background-color: $dark-button-bg;
  color: $dark-text-primary;
  border-color: $dark-button-border;
}

:deep(.pagination .button:hover) {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}

:deep(.pagination .button[disabled]) {
  background-color: $dark-bg-tertiary;
  color: $dark-text-disabled;
  border-color: $dark-border-color;
}

/* 暗黑模式下的输入框 */
:deep(.input) {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
  border-color: $dark-input-border;
}

:deep(.input::placeholder) {
  color: $dark-text-disabled;
}

:deep(.input:focus) {
  border-color: $dark-input-focus-border;
  box-shadow: 0 0 0 0.2rem $dark-input-focus-shadow;
}

/* 暗黑模式下的按钮 */
:deep(.button) {
  background-color: $dark-button-bg;
  color: $dark-text-primary;
  border-color: $dark-button-border;
}

:deep(.button:hover) {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}

:deep(.button.is-link) {
  background-color: $dark-button-bg;
  color: $dark-text-primary;
  border-color: $dark-button-border;
}

:deep(.button.is-link:hover) {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}

:deep(.button.is-small) {
  background-color: $dark-button-bg;
  color: $dark-text-primary;
  border-color: $dark-button-border;
}

:deep(.button.is-small:hover) {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}

/* 暗黑模式下的多选框 */
:deep(.multiselect) {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
  border-color: $dark-input-border;
}

:deep(.multiselect:focus) {
  border-color: $dark-input-focus-border;
  box-shadow: 0 0 0 0.2rem $dark-input-focus-shadow;
}

:deep(.multiselect__tags) {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
  border-color: $dark-input-border;
}

:deep(.multiselect__input) {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
}

:deep(.multiselect__input::placeholder) {
  color: $dark-text-disabled;
}

:deep(.multiselect__content) {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

:deep(.multiselect__element) {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
}

:deep(.multiselect__element:hover) {
  background-color: $dark-bg-hover;
}

:deep(.multiselect__option) {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
}

:deep(.multiselect__option:hover) {
  background-color: $dark-bg-hover;
}

:deep(.multiselect__option--selected) {
  background-color: $dark-button-bg;
  color: $dark-text-primary;
}

:deep(.multiselect__option--selected:hover) {
  background-color: $dark-button-hover-bg;
}

/* 暗黑模式下的滑块 */
:deep(.slider) {
  background-color: $dark-bg-tertiary;
}

:deep(.slider .slider-track) {
  background-color: $dark-bg-panel;
}

:deep(.slider .slider-fill) {
  background-color: $dark-button-bg;
}

:deep(.slider .slider-thumb) {
  background-color: $dark-text-primary;
  border-color: $dark-button-border;
}

:deep(.slider .slider-thumb:hover) {
  background-color: $dark-text-primary;
  border-color: $dark-button-hover-border;
}

/* 暗黑模式下的折叠面板 */
:deep(.collapse) {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

:deep(.collapse .collapse-trigger) {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

:deep(.collapse .collapse-content) {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

/* 暗黑模式下的加载动画 */
:deep(.loading) {
  background-color: rgba(30, 30, 30, 0.7);
  color: $dark-text-primary;
}

/* 暗黑模式下的错误提示框 */
.box.error {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

/* 暗黑模式下的链接 */
:deep(a) {
  color: $dark-text-primary;
}

:deep(a:hover) {
  color: #cccccc;
}

:deep(a.button) {
  background-color: $dark-button-bg;
  color: $dark-text-primary;
  border-color: $dark-button-border;
}

:deep(a.button:hover) {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}

.buttons {
  display: flex;
  gap: 0.5rem;
}
</style>

<style lang="scss">
@import '../../assets/styles/dark-variables';

.search-projects {
  max-width: 25em;
  margin-right: 1em;
}

.table-projects {
  margin-top: 1rem;
}

.list-projects-wrapper td,
.list-projects-wrapper th {
  vertical-align: middle !important;
}

/* 暗黑模式下的表格全局样式 */
.table-projects :deep(.table) {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

.table-projects :deep(.table tr) {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

.table-projects :deep(.table tr:hover) {
  background-color: $dark-bg-hover;
}

.table-projects :deep(.table th) {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

.table-projects :deep(.table td) {
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

/* 暗黑模式下滚动条样式 */
.list-projects-wrapper::-webkit-scrollbar,
.panel-block::-webkit-scrollbar,
.filters::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.list-projects-wrapper::-webkit-scrollbar-track,
.panel-block::-webkit-scrollbar-track,
.filters::-webkit-scrollbar-track {
  background: $dark-scrollbar-track;
}

.list-projects-wrapper::-webkit-scrollbar-thumb,
.panel-block::-webkit-scrollbar-thumb,
.filters::-webkit-scrollbar-thumb {
  background: $dark-scrollbar-thumb;
  border-radius: 4px;
}

.list-projects-wrapper::-webkit-scrollbar-thumb:hover,
.panel-block::-webkit-scrollbar-thumb:hover,
.filters::-webkit-scrollbar-thumb:hover {
  background: $dark-scrollbar-thumb-hover;
}
</style>
