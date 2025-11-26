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
  <form @submit.prevent="createProject(); loading = true">
    <b-loading :active="loading" :is-full-page="false" />

    <template v-if="!loading">
      <cytomine-modal :active="active" title="Create Case" @close="$emit('update:active', false)">
        <!-- Patient Information Section -->
        <div class="section">
          <h2 class="subtitle section-title">{{ $t('patient-information') }}</h2>

          <b-field :label="$t('patient-id')" class="field-spacing">
            <b-input v-model="patientId" :placeholder="$t('patient-id')" />
          </b-field>

          <b-field :label="$t('patient-name')" class="field-spacing">
            <b-input v-model="patientName" :placeholder="$t('patient-name')" />
          </b-field>

          <b-field :label="$t('patient-age')" class="field-spacing">
            <b-input v-model="patientAge" type="number" :placeholder="$t('patient-age')" />
          </b-field>
        </div>

        <!-- Project Details Section -->
        <div class="section">
          <h2 class="subtitle section-title">{{ $t('case-details') }}</h2>

          <b-field :label="$t('accession-id')" class="field-spacing">
            <b-input v-model="accessionId" :placeholder="$t('accession-id')" />
          </b-field>

          <b-field :label="$t('medical-record-number')" class="field-spacing">
            <b-input v-model="medicalRecordNumber" :placeholder="$t('medical-record-number')" />
          </b-field>

          <b-field :label="$t('access-date')" class="field-spacing">
            <b-datepicker v-model="accessDate" :placeholder="$t('access-date')" icon="calendar-today"
              :mobile-native="true" expanded />
          </b-field>
        </div>

        <!-- Specimen Information Section -->
        <div class="section">
          <h2 class="subtitle section-title">{{ $t('specimen-information') }}</h2>

          <b-field :label="$t('tissue')" class="field-spacing">
            <b-input v-model="tissue" :placeholder="$t('tissue')" />
          </b-field>

          <b-field :label="$t('specimen')" class="field-spacing">
            <b-input v-model="specimen" :placeholder="$t('specimen')" />
          </b-field>

          <b-field :label="$t('patient-sex')" class="field-spacing">
            <b-input v-model="patientSex" :placeholder="$t('patient-sex')" />
          </b-field>

          <b-field :label="$t('stain')" class="field-spacing">
            <b-input v-model="stain" :placeholder="$t('stain')" />
          </b-field>
        </div>

        <!-- Project Type and Status -->
        <!-- <div class="section">
        <b-field :label="$t('project-type')" class="field-spacing">
          <b-select v-model="projectType" :placeholder="$t('select-project-type')" expanded>
            <option value="CLINICAL">{{$t('project-type-clinical')}}</option>
            <option value="RESEARCH">{{$t('project-type-research')}}</option>
          </b-select>
        </b-field>
        
        <b-field :label="$t('status')" class="field-spacing">
          <b-select v-model="projectStatus" :placeholder="$t('select-status')" expanded>
            <option value="NOT_READY">{{$t('status-not-ready')}}</option>
            <option value="READY">{{$t('status-ready')}}</option>
            <option value="REVIEWED">{{$t('status-reviewed')}}</option>
          </b-select>
        </b-field>
      </div> -->

        <template #footer>
          <button class="button" type="button" @click="$emit('update:active', false)">
            {{ $t('button-cancel') }}
          </button>
          <button class="button is-link" :disabled="errors.any()">
            {{ $t('button-save') }}
          </button>
        </template>
      </cytomine-modal>
    </template>
  </form>
</template>

<script>
import { Project, Ontology } from '@/api';

import CytomineModal from '@/components/utils/CytomineModal';

export default {
  name: 'add-project-modal',
  props: {
    active: Boolean,
    ontologies: Array
  },
  components: { CytomineModal },
  $_veeValidate: { validator: 'new' },
  data() {
    return {
      loading: false,
      name: '',
      ontology: 'NEW',
      selectedOntology: null,

      // 新增字段
      patientId: '',
      patientName: '',
      patientAge: null,
      accessionId: '',
      medicalRecordNumber: '',
      accessDate: null,
      tissue: '',
      specimen: '',
      patientSex: '',
      stain: '',
      projectType: 'CLINICAL',
      projectStatus: 'NOT_READY'
    };
  },
  watch: {
    active(val) {
      if (val) {
        this.name = '';
        this.ontology = 'NEW';
        this.selectedOntology = null;

        // 重置新增字段
        this.patientId = '';
        this.patientName = '';
        this.patientAge = null;
        this.accessionId = '';
        this.medicalRecordNumber = '';
        this.accessDate = null;
        this.tissue = '';
        this.specimen = '';
        this.patientSex = '';
        this.stain = '';
        this.projectType = 'CLINICAL';
        this.projectStatus = 'NOT_READY';
      }
    }
  },
  methods: {
    async createProject() {
      let result = await this.$validator.validateAll();
      if (!result) {
        return;
      }

      try {
        let idOntology;
        // if (this.ontology === 'NEW') {
        //   let ontology = await new Ontology({ name: this.name }).save();
        //   idOntology = ontology.id;
        // } else if (this.ontology === 'EXISTING') {
        //   idOntology = this.selectedOntology;
        // }

        // 创建项目时包含新字段
        let projectData = {
          name: this.accessionId,
          ontology: idOntology,
          patientId: this.patientId,
          patientName: this.patientName,
          patientAge: this.patientAge,
          accessionId: this.accessionId,
          medicalRecordNumber: this.medicalRecordNumber,
          accessDate: this.accessDate,
          tissue: this.tissue,
          specimen: this.specimen,
          patientSex: this.patientSex,
          stain: this.stain,
          type: this.projectType,
          status: this.projectStatus,
          isReadOnly: false,
          isRestricted:true,
        };

        let project = await new Project(projectData).save();

        this.loading = false;
        this.$notify({ type: 'success', text: "The case was successfully created"});
        this.$emit('update:active', false);
        // await this.$router.push(`/project/${project.id}/configuration`);
      } catch (error) {
        if (error.response.status === 409) {
          this.$notify({ type: 'error', text: this.$t('notif-error-project-already-exists') });
          this.loading = false;
        } else {
          this.$notify({ type: 'error', text: this.$t('notif-error-project-creation') });
          this.loading = false;
        }
      }
    }
  },
};
</script>

<style scoped lang="scss">
.section {
  padding: 1rem 1rem;
}
</style>