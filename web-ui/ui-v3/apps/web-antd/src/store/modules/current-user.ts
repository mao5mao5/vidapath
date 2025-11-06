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
import { Cytomine, User, MyAccount } from 'cytomine-client';
// import { updateToken } from '@/utils/token-utils';

export interface CurrentUserState {
  user: User | null;
  account: MyAccount | null;
  expandedSidebar: boolean;
  increment: number;
  shortTermToken: string | null;
}

function getDefaultState(): CurrentUserState {
  return {
    user: null,
    account: null,
    expandedSidebar: false,
    increment: 0,
    shortTermToken: null
  };
}

export const useCurrentUserStore = defineStore('currentUser', {
  state: (): CurrentUserState => getDefaultState(),

  actions: {
    setUser(user: User | null) {
      this.user = user ? { ...user } : null;
    },

    setAccount(account: MyAccount | null) {
      this.account = account ? { ...account } : null;
    },

    setShortTermToken(value: string | null) {
      this.shortTermToken = value;
    },

    setAdminByNow(value: boolean) {
      if (this.user) {
        this.user.adminByNow = value;
      }
    },

    setExpandedSidebar(val: boolean) {
      this.expandedSidebar = val;
    },

    resetState() {
      Object.assign(this, getDefaultState());
    },

    async fetchUser() {
      try {
        const [user, account] = await Promise.all([
          User.fetchCurrent(), 
          MyAccount.fetch()
        ]);

        if (user.id) { // fetchCurrent() redirects to home page if user not authenticated => check that id is set
          this.setUser(user);
        } else {
          this.setUser(null);
        }

        if (account) {
          this.setAccount(account);
        } else {
          this.setAccount(null);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        this.setUser(null);
        this.setAccount(null);
      }
    },

    async updateAccount(account: MyAccount) {
      try {
        // Need to be sequential because the token needs to be refreshed to send updated claims to core.
        await account.update();
        await this.fetchUser();
      } catch (error) {
        console.error('Failed to update account:', error);
        throw error;
      }
    },

    async openAdminSession() {
      try {
        await Cytomine.instance.openAdminSession();
        this.setAdminByNow(true);
      } catch (error) {
        console.error('Failed to open admin session:', error);
        throw error;
      }
    },

    async closeAdminSession() {
      try {
        await Cytomine.instance.closeAdminSession();
        await this.fetchUser();
      } catch (error) {
        console.error('Failed to close admin session:', error);
        throw error;
      }
    }
  },

  getters: {
    currentShortTermToken: (state) => {
      return state.shortTermToken;
    }
  }
});