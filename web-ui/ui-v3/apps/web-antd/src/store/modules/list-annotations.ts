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

interface ListAnnotationsFilters {
  members: any[] | null;
  reviewers: any[] | null;
  images: any[] | null;
  termsIds: any[] | null;
  tracksIds: any[] | null;
  tags: any[] | null;
  imageGroups: any[] | null;
}

interface ListAnnotationsState {
  previewSize: number | null;
  categorization: any | null;
  perPage: number;
  outlineColor: string | null;
  regroup: boolean | null;
  annotationType: string | null;
  filters: ListAnnotationsFilters;
  fromDate: string | null;
  toDate: string | null;
  currentPages: Record<string, number>; // mapping of type {idProp: currentPage}
}

export const useListAnnotationsStore = defineStore('listAnnotations', {
  state: (): ListAnnotationsState => ({
    previewSize: null,
    categorization: null,
    perPage: 25,
    outlineColor: null,
    regroup: null,
    annotationType: null,
    filters: {
      members: null,
      reviewers: null,
      images: null,
      termsIds: null,
      tracksIds: null,
      tags: null,
      imageGroups: null,
    },
    fromDate: null,
    toDate: null,
    currentPages: {} // mapping of type {idProp: currentPage}
  }),

  actions: {
    setPreviewSize(size: number | null) {
      this.previewSize = size;
    },

    setCategorization(categorization: any | null) {
      this.categorization = categorization;
    },

    setPerPage(perPage: number) {
      this.perPage = perPage;
    },

    setOutlineColor(color: string | null) {
      this.outlineColor = color;
    },

    setAnnotationType(type: string | null) {
      this.annotationType = type;
    },

    setFilter(payload: { filterName: string; propValue: any }) {
      this.filters = { ...this.filters, [payload.filterName]: payload.propValue };
    },

    setFromDate(date: string | null) {
      this.fromDate = date;
    },

    setToDate(date: string | null) {
      this.toDate = date;
    },

    setRegroup(regroup: boolean | null) {
      this.regroup = regroup;
    },

    resetPagesAndFilters() {
      // Reset all filters
      this.filters = {
        members: null,
        reviewers: null,
        images: null,
        termsIds: null,
        tracksIds: null,
        tags: null,
        imageGroups: null,
      };
      
      this.fromDate = null;
      this.toDate = null;
      this.regroup = false;
      this.currentPages = {};
    },

    setCurrentPage(payload: { prop: string; page: number }) {
      this.currentPages = { ...this.currentPages, [payload.prop]: payload.page };
    }
  }
});