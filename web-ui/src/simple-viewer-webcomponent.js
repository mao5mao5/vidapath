/*
* Copyright (c) 2009-2022. Authors: see NOTICE file.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*      http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import Vue from 'vue';
import wrap from '@vue/web-component-wrapper';

// 创建一个简化的Viewer组件用于演示
const SimpleViewer = {
  name: 'SimpleViewer',
  props: ['idProject', 'idImages', 'idSlices'],
  template: `
    <div class="simple-viewer">
      <h2>Cytomine Viewer (Web Component)</h2>
      <p>Project ID: {{ idProject }}</p>
      <p>Images ID: {{ idImages }}</p>
      <p>Slices ID: {{ idSlices || 'None' }}</p>
      <div class="viewer-placeholder">
        <p>This is a placeholder for the actual viewer</p>
      </div>
    </div>
  `,
  mounted() {
    console.log('Simple Viewer Web Component mounted');
    console.log('Project ID:', this.idProject);
    console.log('Images ID:', this.idImages);
    console.log('Slices ID:', this.idSlices);
  }
};

// 包装组件为Web Component
const WrappedComponent = wrap(Vue, SimpleViewer);

// 定义Web Component
customElements.define('cytomine-viewer', WrappedComponent);