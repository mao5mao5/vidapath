/*
* Copyright (c) 2009-2021. Authors: see NOTICE file.
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

// 注意：在新项目中，我们需要适配 Vue 3 和新的 Keycloak 集成方式
// 这里暂时保留原有逻辑，但在实际使用时需要根据新项目的 Keycloak 集成方式进行调整

export function appendShortTermToken(url: string | null, shortTermToken: string | null): string | null {
  if (url === null || shortTermToken === null) {
    return url;
  }
  if (url.indexOf('?') === -1) {
    return url + '?Authorization=Bearer ' + shortTermToken;
  } else {
    return url + '&Authorization=' + encodeURI('Bearer ' + shortTermToken);
  }
}

export async function updateToken(minValidity: number = 70): Promise<string | undefined> {
  // 在新项目中，需要根据实际的 Keycloak 集成方式来实现
  // 这里暂时保留接口，实际实现需要根据新项目的 Keycloak 集成方式进行调整
  console.warn('updateToken function needs to be implemented based on the new Keycloak integration');
  return Promise.resolve(undefined);
  
  // 原有实现（需要适配）：
  // await Vue.$keycloak.updateToken(minValidity);
  // return Vue.$keycloak.token;
}