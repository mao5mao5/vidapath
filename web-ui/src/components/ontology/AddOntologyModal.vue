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
<form @submit.prevent="createOntology()">
  <cytomine-modal :active="active" title="Create term-tree" @close="$emit('update:active', false)">
    <b-field :label="$t('name')" :type="{'is-danger': errors.has('name')}" :message="errors.first('name')">
      <b-input v-model="name" name="name" v-validate="'required'" />
    </b-field>

    <template #footer>
      <button class="button" type="button" @click="$emit('update:active', false)">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link" :disabled="errors.any()">
        {{$t('button-save')}}
      </button>
    </template>
  </cytomine-modal>
</form>
</template>

<script>
import {Ontology} from '@/api';
import CytomineModal from '@/components/utils/CytomineModal';

export default {
  name: 'add-ontology-modal',
  props: {
    active: Boolean
  },
  components: {CytomineModal},
  $_veeValidate: {validator: 'new'},
  data() {
    return {
      name: ''
    };
  },
  watch: {
    active(val) {
      if (val) {
        this.name = '';
      }
    }
  },
  methods: {
    async createOntology() {
      let result = await this.$validator.validateAll();
      if (!result) {
        return;
      }

      try {
        let ontology = await new Ontology({name: this.name}).save();
        this.$notify({type: 'success', text: this.$t('notif-success-ontology-creation')});
        this.$emit('newOntology', ontology);
        this.$emit('update:active', false);
      } catch (error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-ontology-creation')});
      }
    }
  }
};
</script>

<style lang="scss">
@import '../../assets/styles/dark-variables';

.add-ontology-modal .modal-card {
  background-color: $dark-bg-primary;
}

.add-ontology-modal .modal-card-head {
  background-color: $dark-bg-secondary;
  border-color: $dark-border-color;
}

.add-ontology-modal .modal-card-title {
  color: $dark-text-primary;
}

.add-ontology-modal .modal-card-body {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

.add-ontology-modal .modal-card-foot {
  background-color: $dark-bg-secondary;
  border-color: $dark-border-color;
}

.add-ontology-modal .input {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
  border-color: $dark-input-border;
}

.add-ontology-modal .input:focus {
  border-color: $dark-input-focus-border;
  box-shadow: 0 0 0 0.125em $dark-input-focus-shadow;
}

.add-ontology-modal .field-label {
  color: $dark-text-primary;
}

.add-ontology-modal .help.is-danger {
  color: #ff3860 !important;
}

.add-ontology-modal .button {
  background-color: $dark-button-bg;
  color: $dark-text-primary;
  border-color: $dark-button-border;
}

.add-ontology-modal .button:hover {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}

.add-ontology-modal .button.is-link {
  background-color: #3273dc;
  border-color: transparent;
  color: #fff;
}

.add-ontology-modal .button.is-link:hover {
  background-color: #2366d1;
}

.add-ontology-modal .button:disabled {
  background-color: $dark-button-bg;
  color: $dark-text-disabled;
  border-color: $dark-button-border;
  opacity: 0.5;
}
</style>