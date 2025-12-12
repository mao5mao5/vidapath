<template>
  <div class="pathology-viewer dark-theme">
    <div class="panel">

      <!-- Title -->
      <div class="panel-title" @click="toggle('whole')">
        <span>WHOLE IMAGE RESULTS</span>
        <span class="arrow" :class="{ open: visible.whole }">▶</span>
      </div>

      <!-- Whole Image Body -->
      <div v-if="visible.whole" class="panel-body">

        <!-- Run Algorithm Controls -->
        <div class="run-algorithm-controls">
          <div class="select is-fullwidth">
            <select v-model="selectedAIRunner" :disabled="loadingRunners">
              <option value="">Select AI Runner</option>
              <option v-for="runner in aiRunners" :key="runner.id" :value="runner">
                {{ runner.name }}
              </option>
            </select>
          </div>
                
          <button class="button is-primary" @click="runAlgorithm" :disabled="!selectedAIRunner || loadingRunners">
            <span class="icon is-small">
              <i class="fas fa-play"></i>
            </span>
            <span>Run AI Algorithm</span>
          </button>
        </div>

        <!-- Switch -->
        <div class="switch-row">
          <label class="switch">
            <input type="checkbox" v-model="showOnImage">
            <span class="slider"></span>
          </label>
          <span class="label">Show the results on the image</span>
        </div>

        <!-- Stats list -->
        <div class="item" v-for="item in items" :key="item.label">
          <div class="left">
            <input v-if="item.type === 'checkbox'" type="checkbox" v-model="item.checked" />

            <span class="dot" :style="{ background: item.color }"></span>
            <span>{{ item.label }}</span>
          </div>

          <div class="right">
            <span>{{ item.count }}</span>
            <span v-if="item.percent !== null">{{ item.percent }}%</span>
          </div>
        </div>

        <div class="grade">Overall grade for the image:
          <strong style="color: orange;">Grade 3</strong>
        </div>
        <div class="grade">Mitosis density in invasive carcinoma:
          <strong style="color: orange;">6.3 / mm²</strong>
        </div>
      </div>

      <!-- REGIONS OF INTEREST -->
      <div class="panel-title" @click="toggle('regions')">
        <span>REGIONS OF INTEREST ({{ regions.length }})</span>
        <span class="arrow" :class="{ open: visible.regions }">▶</span>
      </div>

      <div v-if="visible.regions" class="panel-body">
        <div class="item" v-for="region in regions" :key="region.id">
          <div class="left">
            <span class="dot" :style="{ background: region.color }"></span>
            <span>{{ region.label }}</span>
          </div>
          <div class="right">{{ region.value }}</div>
        </div>
      </div>

      <!-- MITOTIC COUNT -->
      <div class="panel-title" @click="toggle('mitosis')">
        <span>MITOTIC COUNT (10 HPF)</span>
        <span class="arrow" :class="{ open: visible.mitosis }">▶</span>
      </div>

      <div v-if="visible.mitosis" class="panel-body">

        <div class="item">
          <div class="left">Number of mitoses in 10 HPFs</div>
          <div class="right">32</div>
        </div>

        <div class="item">
          <div class="left">Mitotic rate</div>
          <div class="right">Score 3</div>
        </div>

        <a class="link" @click="showAllHPFResults">Show all HPF results</a>
      </div>

      <!-- REPORT -->
      <div class="panel-title" @click="toggle('report')">
        <span>REPORT</span>
        <span class="arrow" :class="{ open: visible.report }">▶</span>
      </div>

      <div v-if="visible.report" class="panel-body">
        <div class="report-content">
          <p v-for="line in reportLines" :key="line">{{ line }}</p>
        </div>
      </div>

    </div>
  </div>
  
  <!-- AI Runner Selection Modal -->
  <!-- <div v-if="showAIRunnerModal" class="modal is-active">
    <div class="modal-background" @click="showAIRunnerModal = false"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Select AI Runner</p>
        <button class="delete" aria-label="close" @click="showAIRunnerModal = false"></button>
      </header>
      <section class="modal-card-body">
        <p>Select an AI Runner to process this image:</p>
        
        <div class="field">
          <label class="label">AI Runner</label>
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
      <footer class="modal-card-foot" style="justify-content: flex-end;">
        <button class="button" @click="showAIRunnerModal = false">Cancel</button>
        <button class="button is-primary" 
                :disabled="!selectedAIRunner" 
                @click="confirmRunAlgorithm">
          Confirm
        </button>
      </footer>
    </div>
  </div> -->
</template>


<script>
import {AIRunner, AIAlgorithmJob } from '@/api';
export default {
  props: {
    project: Object,
    index: String,
  },
  data() {
    return {
      visible: {
        whole: true,
        regions: false,
        mitosis: false,
        report: false
      },
      showOnImage: false,
      
      // AI Runner相关数据
      showAIRunnerModal: false,
      aiRunners: [],
      selectedAIRunner: null,
      
      items: [
        { label: "Invasive carcinoma", count: 18.8, percent: 18.8, color: "#1E88E5", type: "checkbox", checked: true },
        { label: "DCIS", count: "<0.5", percent: 0.5, color: "#00ACC1", type: "checkbox", checked: true },
        { label: "Mitosis", count: 200, percent: null, color: "#E53935", type: "checkbox", checked: true },
        { label: "Tubule", count: 0.9, percent: 0.9, color: "#8BC34A", type: "dot" },
        { label: "Pleomorphism score 1 nuclei", count: 2.1, percent: 2.1, color: "#FFEB3B", type: "checkbox", checked: false },
        { label: "Pleomorphism score 2 nuclei", count: 94.9, percent: 94.9, color: "#FF9800", type: "checkbox", checked: true },
        { label: "Pleomorphism score 3 nuclei", count: 3.0, percent: 3.0, color: "#F44336", type: "checkbox", checked: false },
      ],
      
      regions: [
        // 示例数据，实际应该从props或API获取
        { id: 1, label: "Region 1", value: "Invasive carcinoma", color: "#1E88E5" },
        { id: 2, label: "Region 2", value: "DCIS", color: "#00ACC1" }
      ],
      
      reportLines: [
        "This is a preliminary AI-generated report.",
        "Invasive carcinoma detected in 18.8% of the tissue.",
        "Overall tumor grade assessed as Grade 3.",
        "High mitotic activity observed (6.3 mitoses/mm²).",
        "Recommend consultation with pathologist for final diagnosis."
      ]
    };
  },

  computed: {
    // 计算Mitotic Rate
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
  },
  methods: {
    toggle(key) {
      this.visible[key] = !this.visible[key];
    },
    
    showAllHPFResults() {
      // 实现显示所有HPF结果的逻辑
      console.log("Showing all HPF results");
      alert("to be implemented");
    },
    
    async fetchAIRunners() {
      try {
        // 导入AIRunner并获取所有可用的AI Runner
        this.aiRunners = await AIRunner.fetchAll();
        console.log("Fetched AI runners:", this.aiRunners);
      } catch (error) {
        console.error('Failed to fetch AI runners:', error);
        this.$buefy.toast.open({
          message: 'Failed to load AI runners',
          type: 'is-danger'
        });
      }
    },
    
    runAlgorithm() {
      if (!this.selectedAIRunner) {
        this.$buefy.toast.open({
          message: 'Please select an AI runner',
          type: 'is-danger'
        });
        return;
      }
      
      this.$buefy.dialog.confirm({
        title: 'Confirm AI Processing',
        message: `Are you sure you want to run the AI algorithm "${this.selectedAIRunner.name}" on this image?`,
        type: 'is-primary',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        onConfirm: async () => {
          try {
            // 构造请求数据
            const requestData = {
              airunnerId: this.selectedAIRunner.id,
              projectId: parseInt(this.project.id),
              imageId: parseInt(this.imageId),
              // 注意：parameters字段需要根据实际情况填充
            };
            
            // 调用API运行AI算法
            await AIAlgorithmJob.runAlgorithm(requestData);
            
            this.$buefy.toast.open({
              message: 'AI processing started successfully',
              type: 'is-success'
            });
            
            console.log('Started AI processing with runner:', this.selectedAIRunner);
            
            // 清空选择
            this.selectedAIRunner = null;
          } catch (error) {
            this.$buefy.toast.open({
              message: 'Failed to start AI processing',
              type: 'is-danger'
            });
            console.error('AI processing failed:', error);
          }
        }
      });
    }
  },
  
  async mounted() {
    // 组件挂载时获取AI Runner列表
    await this.fetchAIRunners();
  }
};
</script>

<style scoped lang="scss">
@import '../../assets/styles/dark-variables';

.pathology-viewer.dark-theme {
  padding: 10px;
}

.panel {
  width: 380px;
  border: 1px solid $dark-border-color;
  border-radius: 6px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: $dark-bg-primary;
  color: $dark-text-primary;
}

.panel-title {
  padding: 12px 14px;
  font-weight: bold;
  border-bottom: 1px solid $dark-border-color;
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
}

.arrow {
  transition: 0.2s;
}

.arrow.open {
  transform: rotate(90deg);
}

.panel-body {
  padding: 10px 14px;
  background-color: $dark-bg-primary;
}

.switch-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.label {
  margin-left: 10px;
  font-size: 14px;
  color: $dark-text-primary;
}

/* Switch */
.switch {
  position: relative;
  width: 38px;
  height: 20px;
  display: inline-block;
}

.switch input {
  display: none;
}

.slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: $dark-bg-panel;
  border-radius: 20px;
  transition: 0.2s;
}

.slider:before {
  content: "";
  position: absolute;
  width: 16px;
  height: 16px;
  left: 2px;
  top: 2px;
  background: $dark-text-secondary;
  border-radius: 50%;
  transition: 0.2s;
}

input:checked+.slider {
  background: #4CAF50;
}

input:checked+.slider:before {
  transform: translateX(18px);
}

/* Items */
.item {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
  color: $dark-text-primary;
  border-bottom: 1px solid $dark-border-color;
}

.item:last-child {
  border-bottom: none;
}

.left {
  display: flex;
  align-items: center;
}

.left input {
  margin-right: 6px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}

.right {
  text-align: right;
  min-width: 60px;
}

.grade {
  margin-top: 4px;
  font-size: 14px;
  color: $dark-text-primary;
  padding: 4px 0;
}

.link {
  font-size: 14px;
  color: #64B5F6;
  cursor: pointer;
  display: inline-block;
  margin-top: 8px;
}

.report-content p {
  margin: 5px 0;
  font-size: 14px;
  line-height: 1.4;
  color: $dark-text-primary;
}

/* Modal Styles */
.modal-card {
  max-width: 500px;
  width: auto;
  margin: 0 auto;
}

.modal-card-head {
  background-color: $dark-bg-secondary;
  color: $dark-text-primary;
  border-bottom: 1px solid $dark-border-color;
}

.modal-card-body {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

.modal-card-foot {
  background-color: $dark-bg-secondary;
  border-top: 1px solid $dark-border-color;
}

.modal-card-title {
  color: $dark-text-primary;
}

.field {
  margin-bottom: 1rem;
}

.label {
  color: $dark-text-primary;
}

.select select {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
  border-color: $dark-input-border;
}

.select select:focus {
  border-color: $dark-input-focus-border;
  box-shadow: 0 0 0 0.2rem $dark-input-focus-shadow;
}

.select option {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

/* Run Algorithm Controls */
.run-algorithm-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.run-algorithm-controls .select {
  flex: 1;
}

.run-algorithm-controls .select select {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
  border-color: $dark-input-border;
  width: 100%;
}

.run-algorithm-controls .select select:focus {
  border-color: $dark-input-focus-border;
  box-shadow: 0 0 0 0.2rem $dark-input-focus-shadow;
}

.run-algorithm-controls .select option {
  background-color: $dark-bg-primary;
  color: $dark-text-primary;
}

/* Button Styles */
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
  background-color: #4CAF50;
  border-color: transparent;
  color: white;
}

.button.is-primary:hover {
  background-color: #45a049;
  border-color: transparent;
  color: white;
}

.button.is-primary:disabled {
  background-color: $dark-button-bg;
  border-color: $dark-button-border;
  color: $dark-text-disabled;
}
</style>