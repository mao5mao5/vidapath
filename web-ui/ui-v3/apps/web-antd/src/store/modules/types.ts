// Store模块相关的类型定义

// 从cytomine-client导入类型
export type { 
  User,
  MyAccount,
  Project,
  Ontology,
  ProjectConnection,
  UserCollection,
  AnnotationType
} from 'cytomine-client';

// 其他相关类型定义
export interface CurrentUserState {
  user: User | null;
  account: MyAccount | null;
  expandedSidebar: boolean;
  increment: number;
  shortTermToken: string | null;
}

export interface CurrentProjectState {
  project: Project | null;
  configUI: Record<string, any>;
  ontology: Ontology | null;
  managers: User[];
  members: User[];
  currentViewer: string | null;
}

// 添加注解类型定义
export interface Annotation {
  id: number;
  user: number;
  type: string;
  reviewUser?: number;
  [key: string]: any;
}

// 添加图像类型定义
export interface Image {
  id: number;
  user: number;
  [key: string]: any;
}