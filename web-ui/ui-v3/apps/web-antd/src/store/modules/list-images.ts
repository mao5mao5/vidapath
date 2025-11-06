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

interface ListImagesFilters {
  formats: any[] | null;
  vendors: any[] | null;
  selectedTags: any[] | null;
  magnifications: any[] | null;
  resolutions: any[] | null;
  boundsWidth: any | null;
  boundsHeight: any | null;
  boundsUserAnnotations: any | null;
  boundsReviewedAnnotations: any | null;
}

interface ListImagesState {
  searchString: string;
  filtersOpened: boolean;
  filters: ListImagesFilters;
  currentPage: number;
  perPage: number;
  sortField: string | null;
  sortOrder: string;
  openedDetails: any[];
}

export const useListImagesStore = defineStore('listImages', {
  state: (): ListImagesState => ({
    searchString: '',
    filtersOpened: false,
    filters: {
      formats: null,
      vendors: null,
      selectedTags: null,
      magnifications: null,
      resolutions: null,
      boundsWidth: null,
      boundsHeight: null,
      boundsUserAnnotations: null,
      boundsReviewedAnnotations: null
    },
    currentPage: 1,
    perPage: 10,
    sortField: null,
    sortOrder: 'asc',
    openedDetails: []
  }),

  actions: {
    setSearchString(searchString: string) {
      this.searchString = searchString;
    },

    setFiltersOpened(value: boolean) {
      this.filtersOpened = value;
    },

    setFilter(payload: { filterName: string; propValue: any }) {
      this.filters = { ...this.filters, [payload.filterName]: payload.propValue };
    },

    setCurrentPage(page: number) {
      this.currentPage = page;
    },

    setPerPage(perPage: number) {
      this.perPage = perPage;
    },

    setSortField(field: string | null) {
      this.sortField = field;
    },

    setSortOrder(order: string) {
      this.sortOrder = order;
    },

    setOpenedDetails(value: any[]) {
      this.openedDetails = value;
    }
  },

  getters: {
    nbActiveFilters: (state) => {
      return Object.values(state.filters).filter(val => val).length; // count the number of not null values
    },

    nbEmptyFilters: (state) => {
      return Object.values(state.filters).filter(val => val && val.length === 0).length;
    }
  }
});