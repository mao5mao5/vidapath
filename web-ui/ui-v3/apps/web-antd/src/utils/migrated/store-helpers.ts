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

// Helpers for Pinia (inspired by vuex-pathify)

import _ from 'lodash';
import type { Store } from 'pinia';

/**
 * @typedef {Object} Options
 * @property {String|Array} rootModuleProp  The name of the component property containing the path to the root module to
 *                                          use; this root path will be prefixed to the provided path
 * @property {Number} debounce The debounce delay
 */

interface Options {
  rootModuleProp?: string | string[];
  debounce?: number;
}

/**
 * Getter for a computed property allowing to easily retrieve the value of a store property
 * This function must be called from a Vue.js component
 * @example
 * computed: {
 *   myProp: get('myModule/myProp')
 * }
 *
 * @example
 * computed: {
 *   myProp: sync('myProp', {rootModuleProp: 'modulePath'}),
 *   modulePath() {
 *     return 'myModule';
 *   }
 * }
 *
 * @param {String|Array<String>} path Store path to the property
 * @param {Options} [options] Options refining the way to get the property
 * @returns A computed getter for the targetted property
 */
export function get(path: string | string[], options: Options = {}) {
  const arrayPath = convertToArrayPath(path);
  return {
    get(this: any) {
      const fullPath = buildFullPath(arrayPath, this, options);
      return getValue(this.$store, fullPath);
    }
  };
}

/**
 * Provides getter and setter for a computed property that should be synchronized with a store property
 * This function must be called from a Vue.js component
 * @example
 * computed: {
 *   myProp: sync('myModule/myProp')
 * }
 *
 * @param {String|Array<String>} path Store path to the property
 * @param {Options} [options] Options refining the way to sync the property
 * @returns Computed getter and setter for the targetted property
 */
export function sync(path: string | string[], options: Options = {}) {
  const arrayPath = convertToArrayPath(path);
  
  return {
    get(this: any) {
      return getValue(this.$store, arrayPath);
    },
    set: debounce(function (this: any, propValue: any) {
      const mutationName = getMutationName(arrayPath);
      this.$store.commit(mutationName, propValue);
    }, options)
  };
}

/**
 * Provides getter and setter for a computed property that should be synchronized with a filter stored in Vuex
 * This function must be called from a Vue.js component, and the targetted module should be constructed as shown in the example
 * @example
 * // Vue.js component
 * computed: {
 *   myFilter: syncFilter('myModule', 'myFilter')
 * }
 * // myModule structure
 * namespaced: true,
 * state: {
 *   filters: {
 *     myFilter: null
 *   }
 * },
 * mutations: {
 *   setFilter(state, {filterName, propValue}) {
 *     state.filters[filterName] = propValue;
 *   },
 * }
 *
 * @param {String|Array<String>} modulePath Path to the store module containing the filters
 * @param {String} filterName The name of the filter property
 * @param {Options} [options] Options refining the way to sync the filter
 * @returns Computed getter and setter for the targetted filter
 */
export function syncFilter(modulePath: string | string[], filterName: string, options: Options = {}) {
  const arrayModulePath = convertToArrayPath(modulePath);

  return {
    get(this: any) {
      const fullPath = buildFullPath(arrayModulePath, this, options);
      return getValue(this.$store, fullPath).filters[filterName];
    },
    set: debounce(function (this: any, propValue: any) {
      const path = buildFullPath(arrayModulePath, this, options);
      this.$store.commit(path.join('/') + '/setFilter', {filterName, propValue});
    }, options)
  };
}

/**
 * Provides getter and setter for a computed property that should be synchronized with a bounds filter (min, max bounds)
 * stored in Vuex
 * This function must be called from a Vue.js component, that also defines a property giving the max upper bound, and the
 * targetted module should be constructed as shown in the example
 * @example
 * // Vue.js component
 * computed: {
 *   myFilter: sync('myModule', 'myFilter', 'maxValue'),
 *   maxValue() {return 15;}
 * }
 * // myModule structure
 * namespaced: true,
 * state: {
 *   filters: {
 *     myFilter: null // null value for inactive filter (computed property will be equal to [0, maxValue])
 *   }
 * },
 * mutations: {
 *   setFilter(state, {filterName, propValue}) {
 *     state.filters[filterName] = propValue;
 *   },
 * }
 *
 * @param {String|Array<String>} modulePath Path to the store module containing the filters
 * @param {String} filterName The name of the filter property
 * @param {String} maxProp The name of the component property containing the max allowed value
 * @param {Options} [options] Options refining the way to sync the filter
 * @returns Computed getter and setter for the targetted filter
 */
export function syncBoundsFilter(
  modulePath: string | string[], 
  filterName: string, 
  maxProp: string, 
  options: Options = {}
) {
  const arrayModulePath = convertToArrayPath(modulePath);

  return {
    get(this: any) {
      const value = getValue(this.$store, buildFullPath(arrayModulePath, this, options)).filters[filterName];
      return value ? value : [0, this[maxProp]];
    },
    set: debounce(function (this: any, bounds: [number, number]) {
      const path = buildFullPath(arrayModulePath, this, options);
      const propValue = bounds[0] !== 0 || bounds[1] !== this[maxProp] ? bounds : null;
      this.$store.commit(path.join('/') + '/setFilter', {filterName, propValue});
    }, options)
  };
}

/**
 * Provides getter and setter for a computed property that should be synchronized with a multiselect filter stored in Vuex
 * This function must be called from a Vue.js component, that also defines a property giving the available options, and the
 * targetted module should be constructed as shown in the example
 * @example
 * // Vue.js component
 * computed: {
 *   myFilter: sync('myModule', 'myFilter', 'availableOptions'),
 *   availableOptions() {return [1, 2, 3];}
 * }
 * // myModule structure
 * namespaced: true,
 * state: {
 *   filters: {
 *     myFilter: null // null value for inactive filter (computed property will be equal to copy of available options)
 *   }
 * },
 * mutations: {
 *   setFilter(state, {filterName, propValue}) {
 *     state.filters[filterName] = propValue;
 *   },
 * }
 *
 * @param {String|Array<String>} path Path to the store module containing the filters
 * @param {String} filterName The name of the filter property
 * @param {String} optionsProp The name of the component property containing the available options
 * @param {Options} [options] Options refining the way to sync the filter
 * @returns Computed getter and setter for the targetted filter
 */
export function syncMultiselectFilter(
  modulePath: string | string[], 
  filterName: string, 
  optionsProp: string, 
  options: Options = {}
) {
  const arrayModulePath = convertToArrayPath(modulePath);

  return {
    get(this: any) {
      const value = getValue(this.$store, buildFullPath(arrayModulePath, this, options)).filters[filterName];
      return value ? value : this[optionsProp].slice();
    },
    set: debounce(function (this: any, selectedOptions: any[]) {
      const path = buildFullPath(arrayModulePath, this, options);
      const propValue = (selectedOptions.length === this[optionsProp].length) ? null : selectedOptions;
      this.$store.commit(path.join('/') + '/setFilter', {filterName, propValue});
    }, options)
  };
}

// wrapper for lodash debounce that debounces the function iff the debounce delay specified in options is > 0
function debounce<T extends Function>(fct: T, options: Options): T {
  if (options.debounce) {
    return _.debounce(fct, options.debounce) as unknown as T;
  } else {
    return fct;
  }
}

function convertToArrayPath(path: string | string[]): string[] {
  if (!path) {
    return [];
  }
  if (Array.isArray(path)) {
    return path;
  }
  if (typeof path === 'string') {
    return path.split('/');
  }
  throw new Error('Path must be a string or an array');
}

function buildFullPath(path: string[], component: any, options: Options): string[] {
  if (options.rootModuleProp) {
    const rootPath = convertToArrayPath(component[options.rootModuleProp]);
    return [...rootPath, ...path];
  }
  return path;
}

function getValue(store: Store, path: string[]): any {
  let obj: any = store.state;
  for (let i = 0; i < path.length; i++) {
    obj = obj[path[i]];
  }
  return obj;
}

function getMutationName(path: string[]): string {
  const variableName = path[path.length - 1];
  const modulePath = path.slice(0, path.length - 1);
  return modulePath.join('/') + '/set' + variableName.charAt(0).toUpperCase() + variableName.slice(1);
}