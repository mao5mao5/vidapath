<template>
  <div class="content-wrapper">
    <b-loading :is-full-page="false" :active="loading" />
    <div class="panel" v-if="!loading">
      <div class="panel-heading">
        <strong class="panel-title">
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

.panel-title {
  font-size: 1.2em;
  color: $dark-text-primary;
}

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

.level-right {
  margin-bottom: 1rem;
}
</style>