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
      <!-- <b-message type="is-info" has-icon size="is-small" class="element-spacing">
        Share the case with specific users or make it publicly accessible.
      </b-message> -->

      <!-- <div class="form-section element-spacing">
        <b-field :label="'Share with'" class="field-spacing">
          <b-radio v-model="shareType" name="share-type" native-value="public" class="radio-spacing">
            Public
          </b-radio>
          <b-radio v-model="shareType" name="share-type" native-value="users" class="radio-spacing">
            Assign to users
          </b-radio>
        </b-field>
      </div> -->

      <div v-if="shareType === 'public'" class="form-section element-spacing">
        <!-- <b-message type="is-warning" has-icon size="is-small" class="element-spacing">
          Warning: Making the case public will grant access to all users in the system.
        </b-message> -->



        <!-- 添加过期时间选项 -->
        <div class="form-section element-spacing">
          <b-field :label="'Expiration time'" class="field-spacing">
            <b-select v-model="expirationTime" expanded>
              <option value="5">In 5 hours</option>
              <option value="24">In 1 day</option>
              <option value="72">In 3 days</option>
              <option value="168">In 1 week</option>
              <option value="720">In 1 month</option>
            </b-select>
          </b-field>
        </div>
      </div>

      <!-- <div v-if="shareType === 'users'" class="form-section element-spacing">
        <b-field :label="'Select users'" class="field-spacing">
          <domain-tag-input v-model="selectedUsers" :domains="allUsers" :placeholder="'Search users...'"
            searchedProperty="fullName" displayedProperty="fullName" />
        </b-field>
      </div> -->

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
import { UserCollection, Project, Cytomine, ImageInstanceCollection } from '@/api';

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
      shareType: 'public', // 'public' or 'users'
      expirationTime: '24', // 过期时间选项
      selectedUsers: [],
      allUsers: [],
      generatedLink: ''
    };
  },
  computed: {
    canShare() {
      // Check if there are any images in the project (requires imageInstances to be populated)
      // Since we can't make API calls in computed properties, we'll rely on the shareProject method
      // to check for images when the button is clicked.
      if (this.shareType === 'users') {
        return this.selectedUsers.length > 0;
      }
      return true;
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
        this.expirationTime = '24'; // 重置过期时间选项
      }
    }
  },
  methods: {
    resetForm() {
      this.shareType = 'public';
      this.expirationTime = '24'; // 重置过期时间选项
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
        // 首先获取项目的第一张图像
        let firstImage = null;
        try {
          const imageCollection = new ImageInstanceCollection({
            filterKey: 'project',
            filterValue: this.project.id,
            sort: 'id',
            order: 'asc',
            max: 1
          });

          const images = await imageCollection.fetchPage(0);
          if (images.array.length > 0) {
            firstImage = images.array[0];
          } else {
            this.$notify({ type: 'error', text: 'No images found in this project. Cannot generate share link.' });
            return;
          }
        } catch (error) {
          console.error('Error fetching images:', error);
          this.$notify({ type: 'error', text: 'Failed to fetch project images.' });
          return;
        }

        if (this.shareType === 'public') {
          // For public sharing, add all users to the project as regular members
          try {
            // 调用后端API生成临时访问令牌
            const response = await Cytomine.instance.api.post(`/project/${this.project.id}/temporary_access_token.json`, {
              expirationHours: parseInt(this.expirationTime)
            });

            const token = response.data.tokenKey;
            this.generatedLink = `${window.location.origin}/#/project/${this.project.id}/image/${firstImage.id}`
          } catch (error) {
            console.error('Error generating temporary access token:', error);
            this.$notify({ type: 'error', text: 'Failed to generate temporary access token.' });
          }
          this.$notify({ type: 'success', text: 'Case shared publicly successfully.' });
        } else {
          // Share with specific users
          const userIds = this.selectedUsers.map(user => user.id);

          // WRITE permission means manager role
          await this.project.addUsers(userIds);
          // Then promote them to managers
          for (const userId of userIds) {
            await this.project.addAdmin(userId);
          }

          this.generatedLink = `${window.location.origin}/#/project/${this.project.id}/image/${firstImage.id}`;
          this.$notify({ type: 'success', text: 'Case shared with selected users successfully.' });
        }

        // 如果设置了过期时间，则生成临时访问令牌
        if (this.expirationTime !== 'never') {
          try {
            // 调用后端API生成临时访问令牌
            const response = await Cytomine.instance.api.post(`/project/${this.project.id}/temporary_access_token.json`, {
              expirationHours: parseInt(this.expirationTime)
            });

            const token = response.data.tokenKey;
            this.generatedLink += `?access_token=${token}`;
          } catch (error) {
            console.error('Error generating temporary access token:', error);
            this.$notify({ type: 'error', text: 'Failed to generate temporary access token.' });
          }
        }

        navigator.clipboard.writeText(this.generatedLink).then(() => {
          this.$notify({ type: 'success', text: 'Link copied to clipboard.' });
        }).catch(err => {
          console.error('Failed to copy: ', err);
          this.$notify({ type: 'error', text: 'Failed to copy link.' });
        });
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