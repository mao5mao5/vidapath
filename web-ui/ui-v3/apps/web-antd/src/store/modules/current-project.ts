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

import { defineStore } from 'pinia';
import { 
  AnnotationType,
  Cytomine,
  Ontology,
  Project,
  ProjectConnection,
  ProjectMemberRole,
  UserCollection,
  User
} from 'cytomine-client';
import { useCurrentUserStore } from './current-user';
import type { Annotation, Image } from './types';

// import {getAllTerms} from '@/utils/ontology-utils';

interface CurrentProjectState {
  project: Project | null;
  configUI: Record<string, any>;
  ontology: Ontology | null;
  managers: User[];
  members: User[];
  currentViewer: string | null;
}

function getDefaultState(): CurrentProjectState {
  return {
    project: null,
    configUI: {},
    ontology: null,
    managers: [],
    members: [],
    currentViewer: null,
  };
}

export const useCurrentProjectStore = defineStore('currentProject', {
  state: (): CurrentProjectState => getDefaultState(),

  actions: {
    resetState() {
      Object.assign(this, getDefaultState());
    },

    setProject(project: Project | null) {
      this.project = project;
    },

    setOntology(ontology: Ontology | null) {
      this.ontology = ontology;
    },

    setConfigUI(config: Record<string, any>) {
      this.configUI = config;
    },

    setManagers(managers: User[]) {
      this.managers = managers;
    },

    setMembers(members: User[]) {
      this.members = members;
    },

    setCurrentViewer(id: string | null) {
      this.currentViewer = id;
    },

    async loadProject(idProject: number) {
      try {
        let projectChange = !this.project || this.project.id !== idProject;
        let project = await Project.fetch(idProject);
        this.setProject(project);
        // this.setProjectInProjectsModule(project); // 需要实现对应方法

        let promises = [
          this.fetchUIConfig(),
          this.fetchOntology(),
          this.fetchProjectMembers()
        ];

        if (projectChange) {
          promises.push(new ProjectConnection({project: idProject}).save());
        }
        await Promise.all(promises);
      } catch (error) {
        console.error('Failed to load project:', error);
      }
    },

    async reloadProject() {
      try {
        if (this.project) {
          let project = await Project.fetch(this.project.id);
          this.setProject(project);
        }
      } catch (error) {
        console.error('Failed to reload project:', error);
      }
    },

    async updateProject(updatedProject: Project) {
      try {
        let reloadOntology = this.project?.ontology !== updatedProject.ontology;
        this.setProject(updatedProject);
        // this.setProjectInProjectsModule(updatedProject); // 需要实现对应方法
        
        if (reloadOntology) {
          await this.fetchOntology();
        }
      } catch (error) {
        console.error('Failed to update project:', error);
      }
    },

    async fetchUIConfig() {
      try {
        if (this.project) {
          let config = await Cytomine.instance.fetchUIConfigCurrentUser(this.project.id);
          this.setConfigUI(config);
        }
      } catch (error) {
        console.error('Failed to fetch UI config:', error);
      }
    },

    async fetchProjectMembers() {
      try {
        if (this.project) {
          let collection = new UserCollection({
            filterKey: 'project',
            filterValue: this.project.id,
          });

          let members = (await collection.fetchAll()).array;
          let managers = members.filter((u: User) => u.role === ProjectMemberRole.MANAGER || u.role === ProjectMemberRole.REPRESENTATIVE);

          this.setManagers(managers);
          this.setMembers(members);
        }
      } catch (error) {
        console.error('Failed to fetch project members:', error);
      }
    },

    async fetchFollowers(userId: number, imageId: number) {
      try {
        return await UserCollection.fetchFollowers(userId, imageId);
      } catch (error) {
        console.error('Failed to fetch followers:', error);
      }
    },

    async fetchOntology() {
      try {
        if (this.project?.ontology) {
          let ontology = await Ontology.fetch(this.project.ontology);
          this.setOntology(ontology);
        } else {
          this.setOntology(null);
        }
      } catch (error) {
        console.error('Failed to fetch ontology:', error);
      }
    }
  },

  getters: {
    canEditLayer: (state) => {
      return (idLayer: number) => {
        // 在Pinia中访问其他store
        const currentUserStore = useCurrentUserStore();
        const currentUser = currentUserStore.user;
        const project = state.project;
        
        if (!currentUser || !project) return false;
        
        const isManager = state.managers.some(manager => manager.id === currentUser.id);
        return (currentUser.adminByNow || (!currentUser.guestByNow && isManager)) ||
               (!project.isReadOnly && (idLayer === currentUser.id || !project.isRestricted));
      };
    },

    canEditAnnot: (state) => {
      return (annot: Annotation) => {
        const currentUserStore = useCurrentUserStore();
        const currentUser = currentUserStore.user;
        
        if (!currentUser) return false;
        
        const idLayer = annot.user;
        if (annot.type === AnnotationType.REVIEWED) {
          return currentUser.adminByNow || (!currentUser.guestByNow && annot.reviewUser === currentUser.id);
        }
        
        // 复用canEditLayer逻辑
        return this.canEditLayer(idLayer);
      };
    },

    canEditImage: (state) => {
      return (image: Image) => {
        const currentUserStore = useCurrentUserStore();
        const currentUser = currentUserStore.user;
        const project = state.project;
        
        if (!currentUser || !project) return false;
        
        const isManager = state.managers.some(manager => manager.id === currentUser.id);
        return (currentUser.adminByNow || (!currentUser.guestByNow && isManager)) ||
               (!currentUser.guestByNow && !project.isReadOnly && (image.user === currentUser.id || !project.isRestricted));
      };
    },

    canManageProject: (state) => {
      return () => {
        const currentUserStore = useCurrentUserStore();
        const currentUser = currentUserStore.user;
        
        if (!currentUser) return false;
        
        // true iff current user is admin or project manager
        return currentUser.adminByNow || 
               (!currentUser.guestByNow && state.managers.some(user => user.id === currentUser.id));
      };
    },

    contributors: (state) => {
      let idsManagers = state.managers.map(user => user.id);
      return state.members.filter(user => !idsManagers.includes(user.id));
    },

    terms: (state) => {
      // return state.ontology ? getAllTerms(state.ontology) : null;
      return null; // 临时返回值
    },

    currentProjectModule: (state) => {
      if (!state.project) {
        return null;
      }
      return `projects/${state.project.id}/`;
    },

    currentViewer: (state) => {
      // 需要访问全局状态中的projects
      return null;
    },

    currentViewerModule: (state) => {
      // 需要依赖currentProjectModule getter
      const currentProjectModule = state.project ? `projects/${state.project.id}/` : '';
      return `${currentProjectModule}viewers/${state.currentViewer}/`;
    },

    imageModule: (state) => {
      return (index: number) => {
        // 需要依赖currentViewerModule getter
        const currentProjectModule = state.project ? `projects/${state.project.id}/` : '';
        const currentViewerModule = `${currentProjectModule}viewers/${state.currentViewer}/`;
        return `${currentViewerModule}images/${index}/`;
      };
    }
  }
});