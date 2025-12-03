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
<form @submit.prevent="save()">
  <cytomine-modal-card :title="$t(term ? 'update-term' : 'create-term')" class="term-modal">
    <b-field :label="$t('name')" :type="{'is-danger': errors.has('name')}" :message="errors.first('name')">
      <b-input v-model="name" name="name" v-validate="'required'" />
    </b-field>

    <sketch-picker v-model="color" :presetColors="presetColors" />

    <template #footer>
      <button class="button" type="button" @click="$parent.close()">
        {{$t('button-cancel')}}
      </button>
      <button class="button is-link" :disabled="errors.any()">
        {{$t('button-save')}}
      </button>
    </template>
  </cytomine-modal-card>
</form>
</template>

<script>
import {Term} from '@/api';
import {Sketch} from 'vue-color';
import CytomineModalCard from '@/components/utils/CytomineModalCard';

export default {
  name: 'term-modal',
  props: {
    term: Object,
    ontology: Object
  },
  components: {
    'sketch-picker': Sketch,
    CytomineModalCard
  },
  $_veeValidate: {validator: 'new'},
  data() {
    return {
      name: '',
      color: null
    };
  },
  computed: {
    presetColors() {
      return [
        '#F44E3B',
        '#FB9E00',
        '#FCDC00',
        '#68BC00',
        '#16A5A5',
        '#009CE0',
        '#7B10D8',
        '#F06292',
        '#000',
        '#777',
        '#FFF'
      ];
    }
  },
  methods: {
    randomColor() {
      return '#' + (Math.random().toString(16) + '0000000').slice(2, 8);
    },
    async save() {
      let result = await this.$validator.validateAll();
      if (!result) {
        return;
      }

      if (this.term) {
        this.update();
      } else {
        this.create();
      }
    },
    async create() {
      try {
        let term = await new Term({name: this.name, color: this.color.hex, ontology: this.ontology.id}).save();
        this.$notify({type: 'success', text: this.$t('notif-success-term-creation')});
        this.$emit('newTerm', term);
        this.$parent.close();
      } catch (error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-term-creation')});
      }
    },
    async update() {
      let term = new Term(this.term);
      term.color = this.color.hex;
      term.name = this.name;
      try {
        await term.save();
        this.$notify({type: 'success', text: this.$t('notif-success-term-update')});
        this.$emit('updateTerm', term);
        this.$parent.close();
      } catch (error) {
        console.log(error);
        this.$notify({type: 'error', text: this.$t('notif-error-term-update')});
      }
    }
  },
  created() {
    this.name = this.term ? this.term.name : '';
    this.color = {hex: this.term ? this.term.color : this.randomColor()};
  }
};
</script>

<style>
.term-modal .vc-sketch {
  width: auto;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
}

.term-modal .vc-sketch-active-color {
  box-shadow: inset 0 0 0 1px rgba(10, 10, 10, 0.1);
}

.term-modal .vc-sketch-saturation-wrap {
  padding-bottom: 15vh;
}

/* hide alpha channel */
.term-modal .vc-sketch-field--single:last-child {
  display: none;
}
/* --- */

.term-modal .vc-sketch-sliders {
  display: flex;
  align-items: center;
}

.term-modal .vc-sketch-hue-wrap {
  flex-grow: 1;
}

.term-modal .vc-sketch-alpha-wrap {
  display: none;
}

.term-modal .modal-card {
  background-color: #1e1e1e;
}

.term-modal .modal-card-head {
  background-color: #2d2d2d;
  border-color: #3a3a3a;
}

.term-modal .modal-card-title {
  color: #ffffff;
}

.term-modal .modal-card-body {
  background-color: #1e1e1e;
  color: #ffffff;
}

.term-modal .modal-card-foot {
  background-color: #2d2d2d;
  border-color: #3a3a3a;
}

.term-modal .input {
  background-color: #2d2d2d;
  color: #ffffff;
  border-color: #555;
}

.term-modal .input:focus {
  border-color: #6899d0;
  box-shadow: 0 0 0 0.125em rgba(104, 153, 208, 0.25);
}

.term-modal .field-label {
  color: #ffffff;
}

.term-modal .help.is-danger {
  color: #ff3860 !important;
}

.term-modal .button {
  background-color: #3a3a3a;
  color: #ffffff;
  border-color: #555;
}

.term-modal .button:hover {
  background-color: #4d4d4d;
  border-color: #666;
}

.term-modal .button.is-link {
  background-color: #3273dc;
  border-color: transparent;
  color: #fff;
}

.term-modal .button.is-link:hover {
  background-color: #2366d1;
}

.term-modal .button:disabled {
  background-color: #3a3a3a;
  color: #aaa;
  border-color: #555;
  opacity: 0.5;
}

/* 暗色主题的 Sketch Picker */
.term-modal .vc-sketch {
  background-color: #2d2d2d;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.term-modal .vc-sketch-saturation-wrap,
.term-modal .vc-sketch-controls,
.term-modal .vc-sketch-sliders,
.term-modal .vc-sketch-fields {
  background-color: #2d2d2d;
}

.term-modal .vc-sketch-presets {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.term-modal .vc-sketch-color-wrap {
  background-color: #1e1e1e;
  border-radius: 3px;
}

.term-modal .vc-sketch-active-color {
  border-radius: 3px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.term-modal .vc-input__label {
  color: #ffffff;
}

.term-modal .vc-input__input {
  background-color: #1e1e1e;
  color: #ffffff;
  border: 1px solid #555;
  border-radius: 3px;
}

.term-modal .vc-input__input:focus {
  border-color: #6899d0;
  box-shadow: 0 0 0 0.125em rgba(104, 153, 208, 0.25);
}

.term-modal .vc-sketch-field--single div {
  color: #ffffff;
}
</style>
