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

interface AppStore {
  id: number;
  [key: string]: any;
}

interface AppStoresState {
  stores: AppStore[];
}

export const useAppStoresStore = defineStore('appStores', {
  state: (): AppStoresState => ({
    stores: [],
  }),

  actions: {
    set(stores: AppStore[]) {
      this.stores = stores;
    },

    add(store: AppStore) {
      this.stores.push(store);
    },

    delete(store: AppStore) {
      this.stores = this.stores.filter(s => s.id !== store.id);
    },

    reset() {
      this.stores = [];
    }
  },

  getters: {
    stores: (state) => state.stores,
  }
});