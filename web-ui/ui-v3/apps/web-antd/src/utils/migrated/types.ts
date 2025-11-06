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

// Annotation相关类型定义
export interface Annotation {
  id: number;
  term: number[];
  userByTerm: Array<{term: number, user: number[]}>;
  track: number[];
  annotationTrack: any[];
  group: number | null;
  annotationLink: Array<{
    id: number;
    updated: string;
    annotation: number;
    image: number;
    group: number;
  }>;
  slice: number;
  type: string;
  user: number;
  annotationLayer?: {
    id: number;
  };
}

// Layer相关类型定义
export interface Layer {
  id: number;
  isReview?: boolean;
}

// AnnotationTerm相关类型定义
export interface AnnotationTerm {
  term: number;
  user: number;
}