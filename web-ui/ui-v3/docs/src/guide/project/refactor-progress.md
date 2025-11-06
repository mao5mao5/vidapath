# UI 重构进度记录

本文档记录了从旧版 UI 项目迁移到新版 Vue 3 + Vite 项目的重构进度。

## 概述

项目正在将旧的基于 Vue 2 的 UI 项目重构为基于 Vue 3 + Vite + TypeScript 的现代化前端架构。重构工作遵循渐进式迁移的原则，优先处理基础设施和通用工具函数，然后逐步迁移组件和页面。

## 已完成工作

### 工具函数迁移

已完成迁移的工具函数：

1. **constants.js** → **constants.ts**
   - 将 JavaScript 常量定义转换为 TypeScript 格式
   - 添加了完整的类型定义

2. **string-utils.js** → **string-utils.ts**
   - 字符串处理工具函数迁移
   - 添加了 TypeScript 类型注解

3. **color-manipulation.js** → **color-manipulation.ts**
   - 颜色处理工具函数迁移
   - 修复了原代码中的全局变量依赖问题
   - 改进了模块化结构

4. **annotation-utils.js** → **annotation-utils.ts**
   - 注解处理工具函数迁移
   - 添加了完整的 TypeScript 类型支持

5. **store-helpers.js** → **store-helpers.ts**
   - Vuex 辅助工具函数迁移至适用于 Pinia 的版本
   - 添加了完整的 TypeScript 类型支持
   - 保留了原有的功能和 API 设计

6. **style-utils.js** → **style-utils.ts**
   - OpenLayers 样式工具函数迁移
   - 添加了完整的 TypeScript 类型支持
   - 保留了原有的功能和 API 设计

7. **geometry-utils.js** → **geometry-utils.ts**
   - 几何处理工具函数迁移
   - 添加了完整的 TypeScript 类型支持
   - 保留了原有的功能和 API 设计

8. **image-utils.js** → **image-utils.ts**
   - 图像处理工具函数迁移
   - 添加了完整的 TypeScript 类型支持
   - 保留了原有的功能和 API 设计

### Store重构

已完成初步重构的store模块：
1. **current-user.js** → **current-user.ts**
   - 将Vuex模块重构为Pinia store
   - 添加了完整的TypeScript类型支持
   - 导入并使用了本地的cytomine-client库
   - 保留了原有的功能和API设计

2. **current-project.js** → **current-project.ts**
   - 将Vuex模块重构为Pinia store
   - 添加了完整的TypeScript类型支持
   - 导入并使用了本地的cytomine-client库
   - 保留了原有的功能和API设计
   - 完善了getter功能实现

3. **list-projects.js** → **list-projects.ts**
   - 将Vuex模块重构为Pinia store
   - 添加了完整的TypeScript类型支持
   - 保留了原有的功能和API设计

4. **ontologies.js** → **ontologies.ts**
   - 将Vuex模块重构为Pinia store
   - 添加了完整的TypeScript类型支持
   - 保留了原有的功能和API设计

5. **app-stores.js** → **app-stores.ts**
   - 将Vuex模块重构为Pinia store
   - 添加了完整的TypeScript类型支持
   - 保留了原有的功能和API设计

6. **project_modules/list-annotations.js** → **list-annotations.ts**
   - 将Vuex模块重构为Pinia store
   - 添加了完整的TypeScript类型支持
   - 保留了原有的功能和API设计

7. **project_modules/list-image-groups.js** → **list-image-groups.ts**
   - 将Vuex模块重构为Pinia store
   - 添加了完整的TypeScript类型支持
   - 保留了原有的功能和API设计

8. **project_modules/list-images.js** → **list-images.ts**
   - 将Vuex模块重构为Pinia store
   - 添加了完整的TypeScript类型支持
   - 保留了原有的功能和API设计

9. **project_modules/viewer.js** → **viewer.ts**
   - 将Vuex模块重构为Pinia store
   - 添加了完整的TypeScript类型支持
   - 保留了原有的功能和API设计
   - 实现了模块间动态注册和通信机制

10. **project_modules/viewer_modules/image.js** → **image.ts**
    - 将Vuex模块重构为Pinia store
    - 添加了完整的TypeScript类型支持
    - 保留了原有的功能和API设计
    - 修复了ImageInstance接口定义，添加了width和height属性

11. **project_modules/viewer_modules/image_modules/colors.js** → **colors.ts**
    - 将Vuex模块重构为Pinia store
    - 添加了完整的TypeScript类型支持
    - 保留了原有的功能和API设计

12. **project_modules/viewer_modules/image_modules/draw.js** → **draw.ts**
    - 将Vuex模块重构为Pinia store
    - 添加了完整的TypeScript类型支持
    - 保留了原有的功能和API设计

13. **project_modules/viewer_modules/image_modules/view.js** → **view.ts**
    - 将Vuex模块重构为Pinia store
    - 添加了完整的TypeScript类型支持
    - 保留了原有的功能和API设计

### 组件移植

已完成初步移植的组件：
1. **PageNotFound.vue** → **PageNotFound.vue**
   - 从Options API迁移到Composition API
   - 从Buefy组件迁移到Ant Design Vue组件
   - 保留了原有的功能和UI设计

2. **viewer/CytomineViewer.vue** → **viewer/CytomineViewer.vue**
   - 从Options API迁移到Composition API
   - 从Vuex store迁移到Pinia store
   - 从Buefy组件迁移到Ant Design Vue组件
   - 保留了原有的功能和UI设计
   - 修复了潜在的类型问题
   - 修复了导入路径问题，使用正确的路径别名

3. **viewer/CytomineImage.vue** → **viewer/CytomineImage.vue**
   - 从Options API迁移到Composition API
   - 从Vuex store迁移到Pinia store
   - 从VueLayers组件迁移到简化实现
   - 保留了原有的功能和UI设计
   - 修复了潜在的类型问题
   - 修复了导入路径问题，使用正确的路径别名

4. **viewer/ImageList.vue** → **viewer/ImageList.vue**
   - 从Options API迁移到Composition API
   - 从Buefy组件迁移到Ant Design Vue组件
   - 保留了原有的功能和UI设计

5. **viewer/ImageSelector.vue** → **viewer/ImageSelector.vue**
   - 从Options API迁移到Composition API
   - 从Buefy组件迁移到Ant Design Vue组件
   - 保留了原有的功能和UI设计

6. **WebComponentViewer.vue** → **WebComponentViewer.vue**
   - 创建用于集成Vue 2 Web Components的Vue 3组件
   - 支持在Vue 3环境中使用Vue 2构建的Web Components
   - 添加了路由参数处理
   - 实现了Web Component脚本动态加载

### 路由配置

已完成的路由配置：
1. **viewer路由**
   - 添加了viewer路由配置
   - 支持:idProject/:idImages/:idSlices?路径参数
   - 配置了中英文翻译

2. **webcomponent-viewer路由**
   - 添加了Web Component Viewer路由配置
   - 支持:idProject/:idImages/:idSlices?路径参数
   - 配置了中英文翻译

### 辅助文件

- **types.ts**: 创建了专门的 TypeScript 类型定义文件，导入了cytomine-client中的类型
- **index.ts**: 更新了导出文件以包含所有迁移的工具函数

### 存放位置

所有迁移的工具函数都存放在：
```
/apps/web-antd/src/utils/migrated/
```

所有重构的store模块存放在：
```
/apps/web-antd/src/store/modules/
```

所有移植的组件存放在：
```
/apps/web-antd/src/views/migrated/components/
```

所有路由配置存放在：
```
/apps/web-antd/src/router/routes/modules/
```

## 已处理的复杂机制

### 模块间动态注册和通信机制

完成了对Vuex动态模块注册机制的重构，适配Pinia架构：
1. **viewer模块**中实现了图像模块的动态注册和注销功能
2. **viewer模块**中实现了跨模块通信机制，支持图像间联动操作
3. **image模块**中完善了状态管理和功能接口
4. **view模块**中添加了视图相关的计算属性

## 待完善结构

在重构过程中，发现以下结构需要进一步完善：

1. **currentViewer getter** - 依赖于全局projects状态，需要完整的projects模块支持
2. **setProjectInProjectsModule方法** - 需要实现此方法来支持projects模块的更新
3. **terms getter** - 需要导入并使用getAllTerms工具函数来完善此getter
4. **projects状态管理** - 需要建立完整的projects状态管理结构来支持项目查看器功能

## 集成方案

### Web Components 集成方案

为了实现Vue 2项目与Vue 3项目的集成，采用了以下方案：

1. **构建Vue 2组件为Web Components**：
   - 在Vue 2项目中创建专门的Web Components入口文件
   - 添加构建脚本用于生成Web Components
   - 将Viewer组件封装为标准Web Component
   - 由于原始组件存在ESLint问题，创建了简化版示例组件

2. **在Vue 3项目中使用Web Components**：
   - 创建Vue 3组件用于加载和使用Vue 2构建的Web Components
   - 实现参数传递和事件通信
   - 添加路由配置以访问Web Component Viewer
   - 实现Web Component脚本的动态加载

3. **文件集成**：
   - 成功将Vue 2项目构建的Web Component文件复制到Vue 3项目中
   - 在Vue 3项目中实现了Web Component的动态加载和使用

## 下一步计划

### Store重构

计划将旧版Vuex store重构为Pinia store，包括以下模块：
- 图像数据状态管理
- 注解数据状态管理
- 应用配置状态管理
- project_modules中的模块（viewer等）
- viewer_modules中的模块

### 组件移植

计划将更多组件从旧项目移植到新项目：
- viewer目录下的其他组件
- 项目和图像管理相关组件
- 注解和本体相关组件

### 创建工具函数使用示例

为展示如何在新项目中使用这些迁移的工具函数，需要创建使用示例。

### 编写单元测试

为迁移的工具函数编写测试用例，确保功能正确性。

## 重构路线图

### 短期目标（1-2周）
- 完成所有工具函数的迁移和重构
- 完成基础UI组件迁移（表单组件、按钮等）
- 建立完整的开发规范和代码模板
- 完成store重构

### 中期目标（1-2个月）
- 完成核心业务组件迁移
- 完成主要页面组件迁移
- 建立完整的测试体系

### 长期目标（3-6个月）
- 完成所有组件迁移
- 性能优化和用户体验改进
- 文档完善和团队培训