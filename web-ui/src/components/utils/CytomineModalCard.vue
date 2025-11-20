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
<div class="modal-card">
  <header class="modal-card-head">
    <p class="modal-card-title">{{title}}</p>
    <slot name="controls"></slot>
  </header>
  <section class="modal-card-body">
    <slot></slot>
  </section>
  <footer class="modal-card-foot" v-if="footer">
    <slot name="footer">
      <button class="button" type="button" @click="$emit('close')">
        {{$t('button-close')}}
      </button>
    </slot>
  </footer>
</div>
</template>

<script>
export default {
  name: 'cytomine-modal-card',
  props: {
    title: String,
    footer: {type: Boolean, default: true}
  }
};
</script>

<style scoped lang="scss">
@import '../../assets/styles/dark-variables.scss';

.modal-card {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.modal-card-head {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-bottom: 1px solid $dark-border-color;
  padding: 1rem;
}

.modal-card-title {
  color: $dark-text-primary;
  font-size: 1.25rem;
  font-weight: 600;
}

.modal-card-body {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
  padding: 0.5rem;
  overflow-y: auto;
  overflow-x: hidden;
}

.modal-card-foot {
  background-color: $dark-bg-secondary;
  border-top: 1px solid $dark-border-color;
  padding: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

.button {
  background-color: $dark-button-bg;
  color: $dark-text-primary;
  border: 1px solid $dark-button-border;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.button:hover {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}

.button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style>
