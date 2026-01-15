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
      <div class="panel-heading">
        <strong class="panel-heading-title">
          {{ $t('case-management') }}
        </strong>
      </div>
      <div class="panel-block">
        <div class="panel-heading-buttons" v-if="!$keycloak.hasTemporaryToken">
          <div class="buttons has-addons">
            <button class="button" :class="{ 'is-primary': all }" @click="all = true; revision++">
              All cases
            </button>
            <button class="button" :class="{ 'is-primary': !all }" @click="all = false; revision++">
              My cases
            </button>
          </div>
          <b-input class="search-input" v-model="searchString" placeholder="Search cases..." type="search"
            icon="search" />
          <button class="button" @click="toggleFilterDisplay()">
            <span class="icon">
              <i class="fas fa-filter"></i>
            </span>
            <span>
              {{ filtersOpened ? 'Hide filters' : 'Show filters' }}
            </span>
            <span v-if="nbActiveFilters" class="nb-active-filters">
              {{ nbActiveFilters }}
            </span>
          </button>
          <button class="button is-link" @click="creationModal = true">
            <span class="icon">
              <i class="fas fa-plus"></i>
            </span>
            <span>New case</span>
          </button>
          <button v-if="checkedProjects.length > 0" class="button is-info" @click="bulkShare">
            <span class="icon is-small">
              <i class="fas fa-share-alt"></i>
            </span>
            <span>Bulk share</span>
          </button>
          <button v-if="checkedProjects.length > 0" class="button is-warning" @click="bulkAssign">
            <span class="icon is-small">
              <i class="fas fa-user-tag"></i>
            </span>
            <span>Bulk assign</span>
          </button>
          <button v-if="checkedProjects.length > 0" class="button is-primary" @click="bulkRunAI">
            <span class="icon is-small">
              <i class="fas fa-robot"></i>
            </span>
            <span>Run AI</span>
          </button>
          <!-- <button v-if="checkedProjects.length > 0" class="button is-danger" @click="deleteSelectedProjects">
            <span class="icon is-small">
              <i class="fas fa-trash"></i>
            </span>
            <span>Delete</span>
          </button> -->
        </div>
        <b-collapse :open="filtersOpened">
          <div class="filters">
            <div class="columns">
              <!-- <div class="column filter">
                <div class="filter-label">
                  {{ $t('my-role') }}
                </div>
                <div class="filter-body">
                  <cytomine-multiselect v-model="selectedRoles" :options="availableRoles" multiple
                    :searchable="false" />
                </div>
              </div> -->
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
          :sort.sync="sortField" :order.sync="sortOrder" :revision="revision" :checkable="true"
          :checked-rows.sync="checkedProjects">
          <template #default="{ row: project }">
            <!-- <b-table-column field="currentUserRole" label="" centered width="1" sortable>
              <icon-project-member-role :is-manager="project.currentUserRoles.admin"
                :is-representative="project.currentUserRoles.representative" />
            </b-table-column> -->

            <!-- <b-table-column field="patientName" label="Name" centered sortable width="150">
              {{ project.patientName }}
            </b-table-column> -->

            <!-- <b-table-column field="patientAge" label="Age" centered sortable width="50">
              {{ project.patientAge }}
            </b-table-column>

            <b-table-column field="patientSex" label="Gender" centered sortable width="50">
              {{ project.patientSex }}
            </b-table-column> -->

            <b-table-column field="accessionId" :label="$t('accession-id')" centered sortable width="150">
              {{ project.accessionId }}
            </b-table-column>

            <b-table-column field="accessDate" :label="$t('access-date')" centered sortable width="120">
              {{ project.accessDate | moment('ll') }}
            </b-table-column>

            <b-table-column field="status" :label="$t('status')" centered sortable width="120">
              <span :class="`status-${project.status?.toLowerCase().replace('_', '-')}`">
                {{ formatStatus(project.status) }}
              </span>
            </b-table-column>

            <b-table-column field="patientId" :label="$t('patient-id')" centered sortable width="150">
              {{ project.patientId }}
            </b-table-column>

            <!-- <b-table-column field="medicalRecordNumber" label="MRN" centered sortable width="150">
              {{ project.medicalRecordNumber }}
            </b-table-column> -->

            <b-table-column field="numberOfImages" label="Slides" centered sortable width="50">
              {{ project.numberOfImages }}
            </b-table-column>

            <b-table-column field="tissue" :label="$t('tissue')" centered sortable width="120">
              {{ project.tissue }}
            </b-table-column>

            <b-table-column field="specimen" :label="$t('specimen')" centered sortable width="120">
              {{ project.specimen }}
            </b-table-column>

            <b-table-column field="stain" label="Stain" centered sortable width="120">
              {{ project.stain }}
            </b-table-column>

            <b-table-column field="currentUserRoles" label="Assign" centered width="120">
              <div v-if="editingProjectId === project.id" class="field">
                <b-dropdown v-model="projectRepresentatives[project.id]" multiple append-to-body>
                  <template #trigger="{ active }">
                    <b-button type="is-text" :icon-right="active ? 'angle-up' : 'angle-down'">
                      Select users
                    </b-button>
                  </template>

                  <b-dropdown-item v-for="user in allUsers" :key="user.id" :value="user.id">
                    <span>{{ user.name }}</span>
                  </b-dropdown-item>
                </b-dropdown>

                <div class="mt-2">
                  <button class="button is-primary is-small mr-1" @click="saveRepresentatives(project)">Save</button>
                  <button class="button is-small" @click="cancelEditing()">Cancel</button>
                </div>
              </div>

              <div v-else>
                <span v-if="project.currentUserRoles && project.currentUserRoles.representatives">
                  {{project.currentUserRoles.representatives.map(rep => rep.name).join(', ')}}
                </span>
                <span v-else class="has-text-grey">No representatives</span>

                <button class="button is-small ml-2" v-if="!$keycloak.hasTemporaryToken" @click="startEditing(project)">
                  <span class="icon is-small">
                    <i class="fas fa-edit"></i>
                  </span>
                </button>
              </div>
            </b-table-column>


            <b-table-column label="Actions" centered width="200">
              <div class="buttons">
                <button v-if="!$keycloak.hasTemporaryToken" class="button" @click="openAddImageModal(project)">
                  <span class="icon">
                    <i class="fas fa-plus"></i>
                  </span>
                  <!-- <span>{{ $t('button-add-image') }}</span> -->
                </button>
                <button class="button" @click="openProject(project)">
                  <span class="icon">
                    <i class="fas fa-eye"></i>
                  </span>
                  <!-- <span>Open viewer</span> -->
                </button>
                <button v-if="!$keycloak.hasTemporaryToken" class="button" @click="openShareModal(project)">
                  <span class="icon">
                    <i class="fas fa-share-alt"></i>
                  </span>
                  <!-- <span>{{ $t('button-share') }}</span> -->
                </button>
                <button v-if="!$keycloak.hasTemporaryToken" class="button" @click="runAIOnProject(project)">
                  <span class="icon">
                    <i class="fas fa-robot"></i>
                  </span>
                  <!-- <span>Run AI</span> -->
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
      </div>
    </div>

    <add-project-modal :active.sync="creationModal" :ontologies="ontologies" />
    <add-image-modal :active.sync="addImageModal" :project="selectedProject" @addImage="updateProject()" />
    <share-project-modal :active.sync="shareProjectModal" :project="selectedProject" :projects="selectedProjects" />

    <!-- Bulk Action Modal -->
    <div v-if="bulkActionModal" class="modal is-active">
      <div class="modal-background" @click="bulkActionModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Batch actions</p>
          <button class="delete" aria-label="close" @click="bulkActionModal = false"></button>
        </header>
        <section class="modal-card-body">
          <p>Please use the following batch action</p>
          <!-- 在这里可以添加批量操作选项 -->
          <div class="bulk-actions">
            <button class="button is-info" @click="bulkShare">
              <span class="icon is-small">
                <i class="fas fa-share-alt"></i>
              </span>
              <span>Share</span>
            </button>
            <button class="button is-warning" @click="bulkAssign">
              <span class="icon is-small">
                <i class="fas fa-user-tag"></i>
              </span>
              <span>Assign</span>
            </button>
            <button class="button is-primary" @click="bulkRunAI">
              <span class="icon is-small">
                <i class="fas fa-robot"></i>
              </span>
              <span>Run AI</span>
            </button>
            <button class="button is-danger" @click="deleteSelectedProjects">
              <span class="icon is-small">
                <i class="fas fa-trash"></i>
              </span>
              <span>Delete</span>
            </button>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="bulkActionModal = false">{{ $t('button-close') }}</button>
        </footer>
      </div>
    </div>

    <!-- Bulk Assign Modal -->
    <div v-if="assignToModal" class="modal is-active">
      <div class="modal-background" @click="assignToModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Assign users</p>
          <button class="delete" aria-label="close" @click="assignToModal = false"></button>
        </header>
        <section class="modal-card-body">
          <p>Assign users to {{ checkedProjects.length }} selected project(s)</p>

          <div class="field mt-4">
            <div class="control">
              <b-dropdown v-model="bulkRepresentatives" multiple>
                <template #trigger="{ active }">
                  <b-button type="is-text" :icon-right="active ? 'angle-up' : 'angle-down'"
                    expanded>
                    {{ bulkRepresentatives.length > 0 ? `${bulkRepresentatives.length} selected` : 'Select users' }}
                  </b-button>
                </template>

                <b-dropdown-item v-for="user in allUsers" :key="user.id" :value="user.id">
                  <span>{{ user.name }}</span>
                </b-dropdown-item>
              </b-dropdown>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="assignToModal = false">{{ $t('button-cancel') }}</button>
          <button class="button is-primary" @click="confirmBulkAssign" :disabled="bulkRepresentatives.length === 0">
            {{ $t('button-confirm') }}
          </button>
        </footer>
      </div>
    </div>

    <!-- AI Runner Selection Modal -->
    <div v-if="aiRunnerSelectionModal" class="modal is-active">
      <div class="modal-background" @click="aiRunnerSelectionModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Selet AI models</p>
          <button class="delete" aria-label="close" @click="aiRunnerSelectionModal = false"></button>
        </header>
        <section class="modal-card-body">
          <p>Please select an AI model to execute selected cases:</p>

          <div class="field">
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="selectedAIRunner">
                  <option value="">Please select</option>
                  <option v-for="runner in aiRunners" :key="runner.id" :value="runner">
                    {{ runner.name }} ({{ runner.runnerName }})
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="aiRunnerSelectionModal = false">{{ $t('button-cancel') }}</button>
          <button class="button is-primary" :disabled="!selectedAIRunner" @click="confirmRunAI">
            {{ $t('button-confirm') }}
          </button>
        </footer>
      </div>
    </div>

    <!-- Single Project AI Runner Selection Modal -->
    <div v-if="singleAIRunnerSelectionModal" class="modal is-active">
      <div class="modal-background" @click="singleAIRunnerSelectionModal = false"></div>
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">Selet AI models</p>
          <button class="delete" aria-label="close" @click="singleAIRunnerSelectionModal = false"></button>
        </header>
        <section class="modal-card-body">
          <p>Please select an AI model to execute this case:</p>

          <div class="field">
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="selectedSingleAIRunner">
                  <option value="">Please select</option>
                  <option v-for="runner in aiRunners" :key="runner.id" :value="runner">
                    {{ runner.name }} ({{ runner.runnerName }})
                  </option>
                </select>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="singleAIRunnerSelectionModal = false">{{ $t('button-cancel') }}</button>
          <button class="button is-primary" :disabled="!selectedSingleAIRunner" @click="confirmSingleRunAI">
            {{ $t('button-confirm') }}
          </button>
        </footer>
      </div>
    </div>
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

import { ImageInstanceCollection, ProjectCollection, OntologyCollection, TagCollection, AIRunner, AIAlgorithmJob, UserCollection, Project, ProjectRepresentative, ProjectRepresentativeCollection } from '@/api';
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
      allUsers: [],
      all: true,

      contributorLabel: this.$t('contributor'),
      managerLabel: this.$t('manager'),

      creationModal: false,
      addImageModal: false,
      shareProjectModal: false,
      assignToModal: false,
      bulkActionModal: false,
      aiRunnerSelectionModal: false,
      singleAIRunnerSelectionModal: false,
      selectedProject: null,
      selectedProjects: [], // 用于批量操作的项目数组
      projectToRunAI: null,

      checkedProjects: [],

      // 编辑代表用户的属性
      editingProjectId: null,
      projectRepresentatives: {}, // 存储每个项目的代表用户

      // 批量分配代表用户属性
      bulkRepresentatives: [],

      // AI Runners
      aiRunners: [],
      selectedAIRunner: null,
      selectedSingleAIRunner: null,

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
        withSpecimen: true,
        all: this.all
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
    async fetchAIRunners() {
      // 导入AIRunner
      this.aiRunners = await AIRunner.fetchAll();
    },

    async fetchAllUsers() {
      try {
        this.allUsers = (await UserCollection.fetchAll()).array;
      } catch (error) {
        console.error('Error fetching users:', error);
        this.$notify({ type: 'error', text: 'Failed to fetch users.' });
      }
    },

    toggleFilterDisplay() {
      this.filtersOpened = !this.filtersOpened;
    },

    async startEditing(project) {
      // 开始编辑项目代表用户
      this.editingProjectId = project.id;

      // 初始化该项目的代表用户列表
      if (project.currentUserRoles && project.currentUserRoles.representatives) {

        // 获取当前项目的所有代表用户
        const currentRepresentatives = await ProjectRepresentativeCollection.fetchAll({
          filterKey: 'project',
          filterValue: project.id
        });

        const currentRepresentativeUsers = currentRepresentatives.array || [];
        const currentRepresentativeIds = currentRepresentativeUsers.map(rep => rep.user);
        this.$set(this.projectRepresentatives, project.id, currentRepresentativeIds);
      } else {
        this.$set(this.projectRepresentatives, project.id, []);
      }

      console.log('projectRepresentatives:', this.projectRepresentatives);
    },

    cancelEditing() {
      // 取消编辑
      this.editingProjectId = null;
      // this.$delete(this.projectRepresentatives, project.id);
    },

    async saveRepresentatives(project) {
      // 保存项目代表用户
      try {
        // 获取当前项目的所有代表用户
        const currentRepresentatives = await ProjectRepresentativeCollection.fetchAll({
          filterKey: 'project',
          filterValue: project.id
        });

        const currentRepresentativeUsers = currentRepresentatives.array || [];
        const currentRepresentativeIds = currentRepresentativeUsers.map(rep => rep.user);

        // 获取用户选择的代表用户
        const selectedRepresentatives = this.projectRepresentatives[project.id] || [];

        // 找出需要删除的代表用户（在current中但不在selected中的）
        const toRemove = currentRepresentativeIds.filter(
          id => !selectedRepresentatives.includes(id)
        );

        console.log('toRemove:', toRemove);

        // 找出需要添加的代表用户（在selected中但不在current中的）
        const toAdd = selectedRepresentatives.filter(
          id => !currentRepresentativeIds.includes(id)
        );

        console.log('toAdd:', toAdd);

        await project.addUsers(toAdd);

        // 添加新的代表用户
        for (const id of toAdd) {
          const newRep = new ProjectRepresentative({
            project: project.id,
            user: id
          });
          await project.addAdmin(id);
          await newRep.save();
        }

        // 删除不再需要的代表用户
        for (const id of toRemove) {
          await project.deleteAdmin(id);
          await ProjectRepresentative.delete(0, project.id, id);
        }

        // 更新本地数据
        this.revision++;

        // 结束编辑状态
        this.editingProjectId = null;

        this.$notify({
          type: 'success',
          text: 'Users assigned successfully.'
        });
      } catch (error) {
        console.error('Error updating users:', error);
        this.$notify({
          type: 'error',
          text: 'Failed to update users.'
        });
      }
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
          if (this.$keycloak.hasTemporaryToken) {
            this.$router.push(`/project/${project.id}/image/${firstImage.id}?access_token=${this.$keycloak.temporaryToken}`);
          }
          else {
            this.$router.push(`/project/${project.id}/image/${firstImage.id}`);
          }

        } else {
          this.$notify({ type: 'error', text: 'The case does not have any images. Please add images before opening.' });
        }
      } catch (error) {
        å
        console.error('Error fetching first image:', error);
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
    },
    deleteSelectedProjects() {
      this.$buefy.dialog.confirm({
        title: this.$t('delete-multiple-projects'),
        message: this.$t('delete-multiple-projects-confirm-message', { count: this.checkedProjects.length }),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: async () => {
          try {
            // 执行批量删除
            const promises = this.checkedProjects.map(project => project.delete());
            await Promise.all(promises);

            // 清空选中项并刷新列表
            this.checkedProjects = [];
            this.bulkActionModal = false;
            this.updateProject();

            this.$notify({
              type: 'success',
              text: this.$t('notif-success-multiple-projects-deletion', { count: this.checkedProjects.length })
            });
          } catch (error) {
            this.$notify({
              type: 'error',
              text: this.$t('notif-error-multiple-projects-deletion')
            });
          }
        }
      });
    },

    bulkShare() {
      // 批量分享功能
      if (this.checkedProjects.length === 0) {
        this.$buefy.toast.open({
          message: 'Please select at least one project to share.',
          type: 'is-warning'
        });
        return;
      }

      // 设置要批量分享的项目
      this.selectedProjects = this.checkedProjects;
      this.shareProjectModal = true;
    },

    bulkAssign() {
      // 批量分配功能
      if (this.checkedProjects.length === 0) {
        this.$buefy.toast.open({
          message: 'Please select at least one project to assign.',
          type: 'is-warning'
        });
        return;
      }

      this.assignToModal = true;
      // 默认清空之前的选择
      this.bulkRepresentatives = [];
    },

    bulkRunAI() {
      // 批量运行AI功能
      if (this.aiRunners.length === 0) {
        this.$buefy.toast.open({
          message: this.$t('no-ai-runners-available'),
          type: 'is-danger'
        });
        return;
      }

      this.aiRunnerSelectionModal = true;
    },

    runAIOnProject(project) {
      // 单个项目运行AI功能
      if (this.aiRunners.length === 0) {
        this.$buefy.toast.open({
          message: this.$t('no-ai-runners-available'),
          type: 'is-danger'
        });
        return;
      }

      this.projectToRunAI = project;
      this.singleAIRunnerSelectionModal = true;
    },

    async confirmBulkAssign() {
      try {
        // 为每个选中的项目设置代表用户
        const assignPromises = this.checkedProjects.map(async (project) => {
          // 获取当前项目的所有代表用户
          const currentRepresentatives = await ProjectRepresentativeCollection.fetchAll({
            filterKey: 'project',
            filterValue: project.id
          });

          const currentRepresentativeUsers = currentRepresentatives.array || [];
          const currentRepresentativeIds = currentRepresentativeUsers.map(rep => rep.user);

          // 找出需要删除的代表用户（在current中但不在bulk中的）
          const toRemove = currentRepresentativeIds.filter(
            id => !this.bulkRepresentatives.includes(id)
          );

          // 找出需要添加的代表用户（在bulk中但不在current中的）
          const toAdd = this.bulkRepresentatives.filter(
            id => !currentRepresentativeIds.includes(id)
          );

          await project.addUsers(toAdd);
          // 添加新的代表用户
          for (const id of toAdd) {
            const newRep = new ProjectRepresentative({
              project: project.id,
              user: id
            });
            await project.addAdmin(id);
            await newRep.save();
          }

          // 删除不再需要的代表用户
          for (const id of toRemove) {
            await project.deleteAdmin(id);
            await ProjectRepresentative.delete(0, project.id, id);
          }
        });

        // 等待所有项目完成代表用户设置
        await Promise.all(assignPromises);

        // 关闭模态框
        this.assignToModal = false;

        this.$notify({
          type: 'success',
          text: `Successfully assigned users to ${this.checkedProjects.length} project(s).`
        });

        // 刷新项目列表
        this.revision++;

        // 清空选择
        this.checkedProjects = [];
        this.bulkRepresentatives = [];
      } catch (error) {
        console.error('Error assigning users:', error);
        this.$notify({
          type: 'error',
          text: 'Failed to assign users.'
        });
      }
    },

    async confirmRunAI() {
      if (!this.selectedAIRunner) {
        this.$buefy.toast.open({
          message: this.$t('please-select-an-ai-runner'),
          type: 'is-danger'
        });
        return;
      }

      this.$buefy.dialog.confirm({
        title: `Confirm whether to run the ${this.selectedAIRunner.name} algorithm`,
        message: 'This run will be in the background, so don\'t need to wait for.',
        type: 'is-primary',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: async () => {
          try {
            // 关闭模态框
            this.aiRunnerSelectionModal = false;
            this.bulkActionModal = false;

            // 为每个选中的项目运行AI算法
            const runPromises = this.checkedProjects.map(async (project) => {
              const requestData = {
                airunnerId: this.selectedAIRunner.id,
                projectId: project.id
              };

              // 调用API运行AI算法
              await AIAlgorithmJob.runAlgorithm(requestData);
            });

            // 等待所有项目开始运行AI算法
            await Promise.all(runPromises);

            this.$buefy.toast.open({
              message: this.$t('bulk-ai-processing-started'),
              type: 'is-success'
            });

            console.log('Started AI processing on projects:', this.checkedProjects, 'with runner:', this.selectedAIRunner);

            // 清空选择
            this.checkedProjects = [];
            this.selectedAIRunner = null;
          } catch (error) {
            this.$buefy.toast.open({
              message: "Failed to run the AI algorithm.",
              type: 'is-danger'
            });
            console.error('AI processing failed:', error);
          }
        }
      });
    },

    async confirmSingleRunAI() {
      if (!this.selectedSingleAIRunner) {
        this.$buefy.toast.open({
          message: this.$t('please-select-an-ai-runner'),
          type: 'is-danger'
        });
        return;
      }

      this.$buefy.dialog.confirm({
        title: `Confirm whether to run the ${this.selectedSingleAIRunner.name} algorithm`,
        message: 'This run will be in the background, so don\'t need to wait for.',
        type: 'is-primary',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: async () => {
          try {
            // 关闭模态框
            this.singleAIRunnerSelectionModal = false;

            // 为单个项目运行AI算法
            const requestData = {
              airunnerId: this.selectedSingleAIRunner.id,
              projectId: this.projectToRunAI.id
            };

            // 调用API运行AI算法
            await AIAlgorithmJob.runAlgorithm(requestData);

            this.$buefy.toast.open({
              message: this.$t('single-ai-processing-started'),
              type: 'is-success'
            });

            console.log('Started AI processing on project:', this.projectToRunAI, 'with runner:', this.selectedSingleAIRunner);

            // 清空选择
            this.projectToRunAI = null;
            this.selectedSingleAIRunner = null;
          } catch (error) {
            this.$buefy.toast.open({
              message: "Failed to run the AI algorithm.",
              type: 'is-danger'
            });
            console.error('AI processing failed:', error);
          }
        }
      });
    },
  },
  async created() {
    try {
      await Promise.all([
        this.fetchOntologies(),
        this.fetchMaxFilters(),
        this.fetchTags(),
        this.fetchAIRunners(),
        this.fetchAllUsers()
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

.panel-heading-buttons {
  display: flex;
  padding-right: 0.5rem;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 0;
}

.panel-heading-title {
  font-size: 1.2em;
  color: $dark-text-primary;
}

.buttons:not(:last-child){
  margin-bottom: 0;
}

.search-block {
  display: flex;
}

.status-not-ready {
  background-color: $dark-button-danger-bg;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.status-ready {
  background-color: #D08770; // Nord Aurora Orange
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.status-reviewed {
  background-color: #A3BE8C; // Nord Aurora Green
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold;
}

.buttons {
  display: flex;
  justify-content: center;
  margin-right: 5px;
}

.bulk-actions {
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  margin-right: 5px;

  .button {
    flex: 1;
    min-width: 120px;
    margin-right: 5px;
  }
}

.table-projects {
  margin-top: 1rem;
}
</style>
