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

/**
 * Check if WebP format is supported by the browser
 * @returns true if WebP is supported, false otherwise
 */
function isWebPSupported(): boolean {
  let elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  // very old browser like IE 8, canvas not supported
  return false;
}

export const SUPPORT_WEBP: boolean = isWebPSupported();
export const IMAGE_FORMAT: string = (SUPPORT_WEBP) ? 'webp' : 'jpg';

interface SplitImageUrlResult {
  host: string;
  pathname: string;
  params: URLSearchParams;
}

/**
 * Split an image URL into its components
 * @param rawUrl The raw URL to split
 * @returns An object containing the host, pathname and params
 */
export function splitImageUrl(rawUrl: string): SplitImageUrlResult {
  let url = new URL(rawUrl);
  let pathname = url.pathname.split('.')[0];
  let params = url.searchParams;

  return {
    host: `${url.protocol}//${url.host}`,
    pathname: pathname,
    params: params
  };
}

interface CombineImageUrlParams {
  host: string;
  pathname: string;
  format: string;
  params: URLSearchParams | Record<string, string>;
}

/**
 * Combine image URL components into a full URL
 * @param params The components to combine
 * @returns The combined URL
 */
export function combineImageUrl(params: CombineImageUrlParams): string {
  const { host, pathname, format, params: urlParams } = params;
  
  let searchParams: URLSearchParams;
  if (!(urlParams instanceof URLSearchParams)) {
    searchParams = new URLSearchParams(urlParams);
  } else {
    searchParams = urlParams;
  }
  
  let formattedParams = searchParams.toString();
  let sep = (formattedParams.length > 0) ? '?' : '';
  return `${host}${pathname}.${format}${sep}${formattedParams}`;
}

/**
 * Change the format of an image URL
 * @param url The URL to change
 * @param newFormat The new format to use (default: IMAGE_FORMAT)
 * @returns The URL with the new format
 */
export function changeImageUrlFormat(url: string, newFormat: string = IMAGE_FORMAT): string {
  return combineImageUrl({format: newFormat, ...splitImageUrl(url)});
}