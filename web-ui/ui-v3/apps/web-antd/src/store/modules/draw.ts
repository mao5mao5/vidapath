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

interface DrawState {
  activeTool: string;
  termsNewAnnots: number[];
  tracksNewAnnots: number[];
  activeEditTool: string | null;
  ongoingEdit: boolean;
}

export const useDrawStore = defineStore('draw', {
  state: (): DrawState => ({
    activeTool: 'select',
    termsNewAnnots: [],
    tracksNewAnnots: [],
    activeEditTool: null,
    ongoingEdit: false
  }),

  actions: {
    activateTool(tool: string) {
      this.activeTool = tool;
    },

    activateEditTool(tool: string | null) {
      this.activeEditTool = tool;
    },

    setOngoingEdit(value: boolean) {
      this.ongoingEdit = value;
    },

    setTermsNewAnnots(terms: number[]) {
      this.termsNewAnnots = terms;
    },

    filterTermsNewAnnots(terms: any[]) { // keep only the terms that still exist
      let idTerms = terms.map(term => term.id);
      this.termsNewAnnots = this.termsNewAnnots.filter(id => idTerms.includes(id));
    },

    setTracksNewAnnots(tracks: number[]) {
      this.tracksNewAnnots = tracks;
    },

    filterTracksNewAnnots(tracks: any[]) { // keep only the tracks that still exist
      let idTracks = tracks.map(track => track.id);
      this.tracksNewAnnots = this.tracksNewAnnots.filter(id => idTracks.includes(id));
    }
  }
});