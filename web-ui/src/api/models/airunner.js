import Model from './model.js';
import Cytomine from '../cytomine.js';

export default class AIRunner extends Model {

  /** @inheritdoc */
  static get callbackIdentifier() {
    return 'airunner';
  }

  /** @inheritdoc */
  _initProperties() {
    super._initProperties();

    this.name = null;
    this.runnerName = null;
    this.runnerAddress = null;
    this.description = null;
    this.terms = null;
    this.supportedImageFormats = null;
    this.supportedSourceTypes = null;
    this.supportedScopes = null;
    this.supportedAlgorithmTypes = null;
    this.created = null;
    this.updated = null;
  }

  /** @inheritdoc */
  get uri() {
    if (!this.isNew()) {
      return `airunners/${this.id}.json`;
    } else {
      return 'airunners.json';
    }
  }

  /**
   * Fetch all AI runners
   *
   * @returns {Array<AIRunner>} The list of AI runners
   */
  static async fetchAll() {
    let response = await Cytomine.instance.api.get('airunners.json');
    let data = response.data;
    let airunners = [];

    // Handle both array response and paginated response
    let items = Array.isArray(data) ? data : (data.collection || []);
    
    for (let i = 0; i < items.length; i++) {
      airunners.push(new AIRunner(items[i]));
    }
    return airunners;
  }
  
  /**
   * Fetch runner info from third party
   *
   * @returns {AIRunner} The updated AI runner
   */
  async fetchRunnerInfo() {
    let response = await Cytomine.instance.api.post(`fetch/airunners/${this.id}.json`);
    this.populate(response.data);
    return this;
  }
}