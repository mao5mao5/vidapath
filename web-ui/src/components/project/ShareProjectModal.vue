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
  <cytomine-modal :active="active" :title="'Share Case'" @close="$emit('update:active', false)">
    <b-loading :is-full-page="false" :active="loading" />
    <div v-if="!loading" class="share-project-modal">
      <b-message type="is-info" has-icon size="is-small" class="element-spacing">
        Share the case with specific users or make it publicly accessible.
      </b-message>

      <div class="form-section element-spacing">
        <b-field :label="'Share with'" class="field-spacing">
          <b-radio v-model="shareType" name="share-type" native-value="public" class="radio-spacing">
            Public (all users)
          </b-radio>
          <b-radio v-model="shareType" name="share-type" native-value="users" class="radio-spacing">
            Specific users
          </b-radio>
        </b-field>
      </div>

      <div v-if="shareType === 'public'" class="form-section element-spacing">
        <b-message type="is-warning" has-icon size="is-small" class="element-spacing">
          Warning: Making the case public will grant access to all users in the system.
        </b-message>

        <b-field :label="'Permission level'" class="field-spacing">
          <b-select v-model="permissionLevel" expanded>
            <option value="READ">Annotation only on their layer</option>
            <!-- When sharing publicly, only READ permission is allowed -->
          </b-select>
        </b-field>
      </div>

      <div v-if="shareType === 'users'" class="form-section element-spacing">
        <b-field :label="'Select users'" class="field-spacing">
          <domain-tag-input v-model="selectedUsers" :domains="allUsers" :placeholder="'Search users...'"
            searchedProperty="fullName" displayedProperty="fullName" />
        </b-field>

        <b-field :label="'Permission level'" class="field-spacing">
          <b-select v-model="permissionLevel" expanded>
            <option value="READ">Annotation only on their layer</option>
            <option value="WRITE">Annotation on all layers</option>
          </b-select>
        </b-field>
      </div>

      <div class="share-link element-spacing" v-if="generatedLink">
        <b-field :label="'Share link'" class="field-spacing">
          <b-input v-model="generatedLink" readonly expanded class="share-link-input" />
          <p class="control">
            <button class="button is-link" @click="copyLink">Copy</button>
          </p>
        </b-field>
      </div>
    </div>

    <template #footer>
      <button class="button" @click="$emit('update:active', false)">
        Close
      </button>
      <button class="button is-link" @click="shareProject" :disabled="loading || !canShare">
        Share
      </button>
    </template>
  </cytomine-modal>
</template>

<script>
import CytomineModal from '@/components/utils/CytomineModal';
import DomainTagInput from '@/components/utils/DomainTagInput';
import { UserCollection, Project } from '@/api';

export default {
  name: 'share-project-modal',
  props: {
    active: Boolean,
    project: Object
  },
  components: {
    CytomineModal,
    DomainTagInput
  },
  data() {
    return {
      loading: false,
      shareType: 'users', // 'public' or 'users'
      permissionLevel: 'READ', // 'READ' or 'WRITE'
      selectedUsers: [],
      allUsers: [],
      generatedLink: ''
    };
  },
  computed: {
    canShare() {
      if (this.shareType === 'public') {
        return true;
      } else {
        return this.selectedUsers.length > 0;
      }
    }
  },
  watch: {
    active(val) {
      if (val) {
        this.resetForm();
        this.loadUsers();
      } else {
        this.generatedLink = '';
      }
    },
    shareType(newVal) {
      // Reset permission level when changing share type
      // For public sharing, only READ permission is allowed
      if (newVal === 'public') {
        this.permissionLevel = 'READ';
      }
    }
  },
  methods: {
    resetForm() {
      this.shareType = 'users';
      this.permissionLevel = 'READ';
      this.selectedUsers = [];
      this.generatedLink = '';
    },

    async loadUsers() {
      this.loading = true;
      try {
        this.allUsers = (await UserCollection.fetchAll()).array;
      } catch (error) {
        console.error(error);
        this.$notify({ type: 'error', text: 'Failed to fetch users.' });
      } finally {
        this.loading = false;
      }
    },

    async shareProject() {
      this.loading = true;
      try {
        if (this.shareType === 'public') {
          // For public sharing, add all users to the project as regular members
          const userIds = this.allUsers.map(user => user.id);
          await this.project.addUsers(userIds);
          this.generatedLink = `${window.location.origin}/#/project/${this.project.id}`;
          this.$notify({ type: 'success', text: 'Project shared publicly successfully.' });
        } else {
          // Share with specific users
          const userIds = this.selectedUsers.map(user => user.id);

          // Add users to the project based on permission level
          if (this.permissionLevel === 'WRITE') {
            // WRITE permission means manager role
            await this.project.addUsers(userIds);
            // Then promote them to managers
            for (const userId of userIds) {
              await this.project.addAdmin(userId);
            }
          } else {
            // READ permission means contributor role
            await this.project.addUsers(userIds);
          }

          this.generatedLink = `${window.location.origin}/#/project/${this.project.id}`;
          this.$notify({ type: 'success', text: 'Project shared with selected users successfully.' });

          navigator.clipboard.writeText(this.generatedLink).then(() => {
            this.$notify({ type: 'success', text: 'Link copied to clipboard.' });
          }).catch(err => {
            console.error('Failed to copy: ', err);
            this.$notify({ type: 'error', text: 'Failed to copy link.' });
          });
        }
      } catch (error) {
        console.error(error);
        this.$notify({ type: 'error', text: 'Failed to share project.' });
      } finally {
        this.loading = false;
      }
    },

    copyLink() {
      navigator.clipboard.writeText(this.generatedLink).then(() => {
        this.$notify({ type: 'success', text: 'Link copied to clipboard.' });
      }).catch(err => {
        console.error('Failed to copy: ', err);
        this.$notify({ type: 'error', text: 'Failed to copy link.' });
      });
    }
  }
};
</script>

<style scoped lang="scss">
@import '../../assets/styles/dark-variables';

.share-project-modal {
  padding: 1.5rem;
}

.form-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid $dark-border-color;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.element-spacing {
  margin-bottom: 1.25rem;
}

.field-spacing {
  margin-bottom: 1rem;
}

.radio-spacing {
  margin-right: 1.5rem;
  margin-left: 1.5rem;
}

.field-label {
  font-weight: 600;
  color: $dark-text-primary;
  margin-bottom: 0.5rem;
}

.share-link {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid $dark-border-color;
}

.share-link-input {
  background-color: #2d2d2d !important;
  color: $dark-text-primary;
  border-color: $dark-input-border;
}

.input[readonly] {
  background-color: #2d2d2d !important;
}

.share-link-input::placeholder {
  color: $dark-text-disabled;
}

.share-link-input:focus {
  border-color: $dark-input-focus-border;
  box-shadow: 0 0 0 0.2rem $dark-input-focus-shadow;
}

/* 暗黑模式下的消息框样式 */
:deep(.message) {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-color: $dark-border-color;
}

:deep(.message.is-info) {
  background-color: rgba(64, 158, 255, 0.1);
  border-color: rgba(64, 158, 255, 0.5);
}

:deep(.message.is-warning) {
  background-color: rgba(255, 193, 7, 0.1);
  border-color: rgba(255, 193, 7, 0.5);
}

/* 暗黑模式下的单选按钮样式 */
:deep(.radio) {
  color: $dark-text-primary;
}

:deep(.radio input[type="radio"]) {
  background-color: $dark-input-bg;
  border-color: $dark-input-border;
}

:deep(.radio input[type="radio"]:checked) {
  background-color: $dark-button-bg;
  border-color: $dark-button-border;
}

/* 暗黑模式下的选择框样式 */
:deep(.select) {
  width: 100%;
}

:deep(.select select) {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
  border-color: $dark-input-border;
}

:deep(.select select:focus) {
  border-color: $dark-input-focus-border;
  box-shadow: 0 0 0 0.2rem $dark-input-focus-shadow;
}

:deep(.select:not(.is-multiple):not(.is-loading)::after) {
  border-color: $dark-text-primary;
}

/* 暗黑模式下的标签输入框样式 */
:deep(.taginput) {
  background-color: $dark-input-bg;
  border-color: $dark-input-border;
}

:deep(.taginput-container) {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
}

:deep(.taginput-container .tag) {
  background-color: $dark-button-bg;
  color: $dark-text-primary;
}

/* 暗黑模式下的输入框样式 */
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

/* 暗黑模式下的按钮样式 */
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

/* 暗黑模式下的控制按钮 */
:deep(.control .button) {
  background-color: $dark-button-bg;
  color: $dark-text-primary;
  border-color: $dark-button-border;
}

:deep(.control .button:hover) {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}
</style>