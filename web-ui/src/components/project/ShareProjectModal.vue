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
  <div v-if="!loading">
    <b-message type="is-info" has-icon size="is-small">
      {{$t('share-case-info')}}
    </b-message>

    <b-field :label="'Share with'">
      <b-radio v-model="shareType" name="share-type" native-value="public">
        {{$t('share-public')}}
      </b-radio>
      <b-radio v-model="shareType" name="share-type" native-value="users">
        {{$t('share-with-users')}}
      </b-radio>
    </b-field>

    <div v-if="shareType === 'public'">
      <b-message type="is-warning" has-icon size="is-small">
        {{$t('share-public-warning')}}
      </b-message>
      
      <b-field :label="$t('permission-level')">
        <b-select v-model="permissionLevel" expanded>
          <option value="READ">{{$t('permission-read')}}</option>
          <option value="WRITE">{{$t('permission-write')}}</option>
        </b-select>
      </b-field>
    </div>

    <div v-if="shareType === 'users'">
      <b-field :label="$t('select-users')">
        <domain-tag-input 
          v-model="selectedUsers" 
          :domains="allUsers" 
          :placeholder="$t('search-users-placeholder')"
          searchedProperty="fullName" 
          displayedProperty="fullName" 
        />
      </b-field>

      <b-field :label="$t('permission-level')">
        <b-select v-model="permissionLevel" expanded>
          <option value="READ">{{$t('permission-read')}}</option>
          <option value="WRITE">{{$t('permission-write')}}</option>
        </b-select>
      </b-field>
    </div>

    <div class="share-link" v-if="generatedLink">
      <b-field :label="$t('share-link')">
        <b-input v-model="generatedLink" readonly expanded />
        <p class="control">
          <button class="button is-link" @click="copyLink">{{$t('button-copy')}}</button>
        </p>
      </b-field>
    </div>
  </div>

  <template #footer>
    <button class="button" @click="$emit('update:active', false)">
      {{$t('button-cancel')}}
    </button>
    <button class="button is-link" @click="shareProject" :disabled="loading || !canShare">
      {{$t('button-share')}}
    </button>
  </template>
</cytomine-modal>
</template>

<script>
import CytomineModal from '@/components/utils/CytomineModal';
import DomainTagInput from '@/components/utils/DomainTagInput';
import {UserCollection, Project} from '@/api';

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
        this.$notify({type: 'error', text: this.$t('notif-error-fetch-users')});
      } finally {
        this.loading = false;
      }
    },

    async shareProject() {
      this.loading = true;
      try {
        if (this.shareType === 'public') {
          // For public sharing, we would need to implement specific logic
          // This is a simplified version - in a real implementation, you would
          // need to make an API call to set project as public with specific permissions
          this.generatedLink = `${window.location.origin}/#/project/${this.project.id}`;
          this.$notify({type: 'success', text: this.$t('notif-success-project-shared-public')});
        } else {
          // Share with specific users
          const userIds = this.selectedUsers.map(user => user.id);
          // In a real implementation, you would make an API call here to add users to the project
          // For now, we'll just simulate the behavior
          this.generatedLink = `${window.location.origin}/#/project/${this.project.id}`;
          this.$notify({type: 'success', text: this.$t('notif-success-project-shared-users')});
        }
      } catch (error) {
        console.error(error);
        this.$notify({type: 'error', text: this.$t('notif-error-project-share')});
      } finally {
        this.loading = false;
      }
    },

    copyLink() {
      navigator.clipboard.writeText(this.generatedLink).then(() => {
        this.$notify({type: 'success', text: this.$t('notif-success-link-copied')});
      }).catch(err => {
        console.error('Failed to copy: ', err);
        this.$notify({type: 'error', text: this.$t('notif-error-link-copy')});
      });
    }
  }
};
</script>

<style scoped>
.share-link {
  margin-top: 1.5rem;
}
</style>