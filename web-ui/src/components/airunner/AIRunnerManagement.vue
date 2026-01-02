<template>
  <div class="content-wrapper">
    <b-loading :is-full-page="false" :active="loading" />
    <div class="panel" v-if="!loading">
      <div class="panel-heading">
        <strong style="font-size: 1.2em; color: #fff;">
          AI algorithm management
        </strong>
      </div>

      <div class="panel-block">
        <div class="level-right">
          <button class="button" @click="openAddModal">
            <span class="icon">
              <i class="fas fa-plus"></i>
            </span>
            <span>Add AI algorithm runner</span>
          </button>
        </div>
        <div class="columns is-multiline">
          <div class="column is-one-third" v-for="airunner in airunners" :key="airunner.id">
            <div class="card airunner-card">
              <header class="card-header">
                <p class="card-header-title">
                  {{ airunner.name }}
                </p>
              </header>
              <div class="card-content">
                <div class="content">
                  <p><strong>Runner Name:</strong> {{ airunner.runnerName }}</p>
                  <p><strong>Address:</strong> {{ airunner.runnerAddress }}</p>
                  <p v-if="airunner.description">
                    <strong>Description:</strong> {{ airunner.description }}
                  </p>
                  <p><strong>Created:</strong> {{ formatDate(airunner.created) }}</p>
                  <p><strong>Updated:</strong> {{ formatDate(airunner.updated) }}</p>
                </div>
              </div>
              <footer class="card-footer">
                <a class="card-footer-item" @click="openEditModal(airunner)">
                  <b-icon icon="pencil" size="is-small"></b-icon>&nbsp;Edit
                </a>
                <a class="card-footer-item" @click="fetchRunnerInfo(airunner)">
                  <b-icon icon="sync" size="is-small"></b-icon>&nbsp;Sync
                </a>
                <a class="card-footer-item" @click="confirmDelete(airunner)">
                  <b-icon icon="delete" size="is-small"></b-icon>&nbsp;Delete
                </a>
              </footer>
            </div>
          </div>
        </div>

        <div v-if="airunners.length === 0" class="has-text-centered">
          <p class="subtitle is-5">No AI Runners found.</p>
          <b-button class="button is-primary mt-3" @click="openAddModal" icon-left="plus">
            Add your first AI Runner
          </b-button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <b-modal :active="isModalActive" has-modal-card @close="closeModal">
      <div class="modal-card" style="width: 400px">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ isEditMode ? 'Edit AI Runner' : 'Add AI Runner' }}</p>
          <button class="delete" @click="closeModal" aria-label="close"></button>
        </header>
        <section class="modal-card-body">
          <b-field label="Name">
            <b-input v-model="form.name" placeholder="Enter AI Runner name" required></b-input>
          </b-field>

          <b-field label="Runner Name">
            <b-input v-model="form.runnerName" placeholder="Enter runner display name" required></b-input>
          </b-field>

          <b-field label="Runner Address">
            <b-input v-model="form.runnerAddress" placeholder="Enter runner address (e.g., http://localhost:8080)"
              required></b-input>
          </b-field>

          <b-field label="Description">
            <b-input v-model="form.description" type="textarea" placeholder="Enter description (optional)"></b-input>
          </b-field>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-primary" @click="saveAIRunner" :disabled="!isFormValid">
            {{ isEditMode ? 'Update' : 'Create' }}
          </button>
          <button class="button" @click="closeModal">Cancel</button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
import { AIRunner } from '@/api/index.js';

export default {
  name: 'airunner-management',
  data() {
    return {
      loading: true,
      airunners: [],
      isModalActive: false,
      isEditMode: false,
      form: {
        id: null,
        name: '',
        runnerName: '',
        runnerAddress: '',
        description: ''
      }
    };
  },
  computed: {
    isFormValid() {
      return this.form.name.trim() !== '' &&
        this.form.runnerName.trim() !== '' &&
        this.form.runnerAddress.trim() !== '';
    }
  },
  async mounted() {
    await this.fetchAIRunners();
  },
  methods: {
    async fetchAIRunners() {
      try {
        this.loading = true;
        this.airunners = await AIRunner.fetchAll();
      } catch (error) {
        console.error('Error fetching AI Runners:', error);
        this.$notify({
          type: 'error',
          text: 'Failed to fetch AI Runners'
        });
        this.airunners = [];
      } finally {
        this.loading = false;
      }
    },
    openAddModal() {
      this.isEditMode = false;
      this.form = {
        id: null,
        name: '',
        runnerName: '',
        runnerAddress: '',
        description: ''
      };
      this.isModalActive = true;
    },
    openEditModal(airunner) {
      this.isEditMode = true;
      this.form = {
        id: airunner.id,
        name: airunner.name,
        runnerName: airunner.runnerName,
        runnerAddress: airunner.runnerAddress,
        description: airunner.description || ''
      };
      this.isModalActive = true;
    },
    closeModal() {
      this.isModalActive = false;
    },
    async saveAIRunner() {
      if (!this.isFormValid) return;

      try {
        let airunner;
        if (this.isEditMode) {
          // Update existing AI Runner
          airunner = new AIRunner(this.form);
          await airunner.save();
          this.$notify({
            type: 'success',
            text: 'AI Runner updated successfully'
          });
        } else {
          // Create new AI Runner
          airunner = new AIRunner(this.form);
          await airunner.save();
          this.$notify({
            type: 'success',
            text: 'AI Runner created successfully'
          });
        }

        this.closeModal();
        await this.fetchAIRunners();
      } catch (error) {
        console.error('Error saving AI Runner:', error);
        this.$notify({
          type: 'error',
          text: `Failed to ${this.isEditMode ? 'update' : 'create'} AI Runner`
        });
      }
    },
    async fetchRunnerInfo(airunner) {
      try {
        const runner = new AIRunner(airunner);
        await runner.fetchRunnerInfo();
        this.$notify({
          type: 'success',
          text: 'AI Runner info synced successfully'
        });
        await this.fetchAIRunners();
      } catch (error) {
        console.error('Error syncing AI Runner info:', error);
        this.$notify({
          type: 'error',
          text: 'Failed to sync AI Runner info'
        });
      }
    },
    confirmDelete(airunner) {
      this.$buefy.dialog.confirm({
        title: 'Delete AI Runner',
        message: `Are you sure you want to delete <b>${airunner.name}</b>? This action cannot be undone.`,
        confirmText: 'Delete',
        type: 'is-danger',
        hasIcon: true,
        onConfirm: () => this.deleteAIRunner(airunner)
      });
    },
    async deleteAIRunner(airunner) {
      try {
        await airunner.delete();
        this.$notify({
          type: 'success',
          text: 'AI Runner deleted successfully'
        });
        await this.fetchAIRunners();
      } catch (error) {
        console.error('Error deleting AI Runner:', error);
        this.$notify({
          type: 'error',
          text: 'Failed to delete AI Runner'
        });
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      // Handle both timestamp and ISO string formats
      const date = typeof dateString === 'number' ? new Date(dateString) : new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleString();
    }
  }
};
</script>

<style scoped lang="scss">
@import '../../assets/styles/dark-variables';

.airunner-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: $dark-bg-secondary;
  border: 1px solid $dark-border-color;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.airunner-card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2);
}

.card-header {
  background-color: $dark-bg-secondary;
  border-bottom: 1px solid $dark-border-color;
}

.card-header-title {
  color: $dark-text-primary;
  background-color: $dark-bg-secondary;
}

.card-content {
  flex-grow: 1;
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

.content {
  color: $dark-text-primary;
}

.content strong {
  color: $dark-text-primary;
}

.card-footer {
  background-color: $dark-bg-secondary;
  border-top: 1px solid $dark-border-color;
}

.card-footer-item {
  color: $dark-text-primary;
  background-color: $dark-bg-secondary;
  border-color: $dark-border-color;
  cursor: pointer;
}

.card-footer-item:hover {
  background-color: $dark-bg-hover;
}

.title {
  color: $dark-text-primary;
}

.level {
  background-color: $dark-bg-primary;
}

.level-left .title {
  color: $dark-text-primary;
}

.button {
  background-color: $dark-button-bg;
  border-color: $dark-button-border;
  color: $dark-text-primary;
}

.button:hover {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}

.button.is-primary {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
}

.button.is-primary:hover {
  background-color: #338fef;
  border-color: #338fef;
}

.has-text-centered .subtitle {
  color: $dark-text-primary;
}

.modal-card-head {
  background-color: $dark-bg-secondary;
  border-bottom: 1px solid $dark-border-color;
}

.modal-card-title {
  color: $dark-text-primary;
}

.modal-card-body {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

.modal-card-foot {
  background-color: $dark-bg-secondary;
  border-top: 1px solid $dark-border-color;
}

.field {
  margin-bottom: 1rem;
}

.label {
  color: $dark-text-primary;
}

.control .input {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
  border-color: $dark-input-border;
}

.control .input:focus {
  border-color: $dark-input-focus-border;
  box-shadow: 0 0 0 0.2rem $dark-input-focus-shadow;
}

.control .textarea {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
  border-color: $dark-input-border;
}

.control .textarea:focus {
  border-color: $dark-input-focus-border;
  box-shadow: 0 0 0 0.2rem $dark-input-focus-shadow;
}

.delete:before,
.delete:after {
  background-color: $dark-text-primary;
}

.delete:hover:before,
.delete:hover:after {
  background-color: #cccccc;
}

/* Panel-specific styles to match Storage component */
.panel {
  background-color: $dark-bg-primary;
  border: 1px solid $dark-border-color;
  border-radius: 6px;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.panel-heading {
  background-color: $dark-bg-secondary;
  border-bottom: 1px solid $dark-border-color;
  border-radius: 6px 6px 0 0;
  padding: 0.75em 1em;
  font-weight: 600;
  font-size: 1.1em;
  color: $dark-text-primary;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-block {
  background-color: $dark-bg-primary;
  padding: 1.5em;
  color: $dark-text-primary;
}

.columns {
  width: 100%;
  margin-top: 1rem;
}

.column {
  color: $dark-text-primary;
}

.subtitle {
  color: $dark-text-primary;
}

/* Card styles within panel */
.card {
  background-color: $dark-bg-secondary;
  border: 1px solid $dark-border-color;
  border-radius: 6px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.card:hover {
  border-color: #409eff;
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.2);
}

.card-header {
  background-color: $dark-bg-tertiary;
  border-bottom: 1px solid $dark-border-color;
  padding: 0.75rem;
}

.card-header-title {
  color: $dark-text-primary;
  font-weight: 600;
}

.card-content {
  padding: 1.5rem;
}

.card-footer {
  background-color: $dark-bg-tertiary;
  border-top: 1px solid $dark-border-color;
}

.card-footer-item {
  color: $dark-text-primary;
  border-right: 1px solid $dark-border-color;
}

.card-footer-item:last-child {
  border-right: none;
}

.card-footer-item:hover {
  background-color: $dark-bg-hover;
}

/* Column layout for cards */
.columns.is-multiline {
  display: flex;
  flex-wrap: wrap;
}

.column.is-one-third {
  flex: 0 0 33.3333%;
  max-width: 33.3333%;
  padding: 0.75rem;
}

@media screen and (max-width: 768px) {
  .column.is-one-third {
    flex: 0 0 100%;
    max-width: 100%;
  }
}
</style>