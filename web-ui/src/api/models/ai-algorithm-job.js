import Model from './model.js';
import Cytomine from '../cytomine.js';

export default class AIAlgorithmJob extends Model {

  /** @inheritdoc */
  static get callbackIdentifier() {
    return 'aialgorithmjob';
  }

  /** @inheritdoc */
  _initProperties() {
    super._initProperties();

    this.sessionId = null;
    this.airunnerId = null;
    this.projectId = null;
    this.imageId = null;
    this.parameters = null;
    this.source = null;
    this.imageServer = null;
    this.statusCode = null;
    this.status = null;
    this.message = null;
    this.data = null;
    this.created = null;
    this.updated = null;
  }

  /** @inheritdoc */
  get uri() {
    if (!this.isNew()) {
      return `ai-algorithm-jobs/${this.id}`;
    } else {
      return 'ai-algorithm-jobs';
    }
  }

  /**
   * 获取所有AI算法任务列表
   *
   * @returns {Array<AIAlgorithmJob>} AI算法任务列表
   */
  static async list() {
    let response = await Cytomine.instance.api.get('ai-algorithm-jobs');
    let data = response.data;
    let jobs = [];

    // Handle both array response and paginated response
    let items = Array.isArray(data) ? data : (data.collection || []);
    
    for (let i = 0; i < items.length; i++) {
      jobs.push(new AIAlgorithmJob(items[i]));
    }
    return jobs;
  }

  /**
   * 获取特定AI算法任务信息
   *
   * @param {number} id - AI算法任务ID
   * @returns {AIAlgorithmJob} AI算法任务对象
   */
  static async fetch(id) {
    let response = await Cytomine.instance.api.get(`ai-algorithm-jobs/${id}`);
    return new AIAlgorithmJob(response.data);
  }

  /**
   * 运行AI算法
   *
   * @param {Object} requestData - 请求数据
   * @param {number} requestData.airunnerId - AI Runner ID
   * @param {number} requestData.projectId - 项目ID
   * @param {number} requestData.imageId - 图像ID
   * @param {Object} requestData.parameters - 参数
   * @param {string} requestData.source - 数据源
   * @param {Object} requestData.imageServer - 影像服务器信息
   * @returns {Object} 运行结果
   */
  static async runAlgorithm(requestData) {
    let response = await Cytomine.instance.api.post('run/algorithm', requestData);
    return response.data;
  }
}