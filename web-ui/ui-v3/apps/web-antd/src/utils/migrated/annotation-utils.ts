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

import {AnnotationTermCollection, AnnotationType, AnnotationTrackCollection, AnnotationLinkCollection,
  AnnotationCollection} from 'cytomine-client';

import type { Annotation, Layer, AnnotationTerm } from './types';

/** Enum providing the actions that can be performed on annotations */
export const Action = Object.freeze({
  SELECT: 'select',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete'
});

/**
 * Fetch the terms associated to the provided annot, and populate term and userByTerm properties accordingly
 *
 * @param {Object} annot The annotation to update
 */
export async function updateTermProperties(annot: Annotation): Promise<void> {
  let annotTerms = await AnnotationTermCollection.fetchAll({filterKey: 'annotation', filterValue: annot.id});
  annot.term = [];
  annot.userByTerm = [];
  let mapping: {[key: number]: number} = {};
  annotTerms.array.forEach(({term, user}: AnnotationTerm) => {
    if (!annot.term.includes(term)) {
      mapping[term] = annot.term.length;
      annot.term.push(term);
      annot.userByTerm.push({term, user: [user]});
    } else { // this term was already treated => add user to existing userByTerm object related to the term
      annot.userByTerm[mapping[term]].user.push(user);
    }
  });
}

/**
 * Fetch the tracks associated to the provided annot, and populate track and annotationTrack properties accordingly
 *
 * @param {Object} annot The annotation to update
 */
export async function updateTrackProperties(annot: Annotation): Promise<void> {
  let annotTracks = await AnnotationTrackCollection.fetchAll({filterKey: 'annotation', filterValue: annot.id});
  annot.track = annotTracks.array.map((at: any) => at.track);
  annot.annotationTrack = annotTracks.array;
}

/**
 * Fetch the annotation links and annotation group associated to the provided annot, and populate accordingly
 *
 * @param {Object} annot The annotation to update
 */
export async function updateAnnotationLinkProperties(annot: Annotation): Promise<void> {
  let annotLinks = (await AnnotationLinkCollection.fetchAll({filterKey: 'annotation', filterValue: annot.id})).array;
  annot.group = (annotLinks.length > 0) ? annotLinks[0].group : null;
  annot.annotationLink = annotLinks.map((link: any) => {
    return {
      id: link.id,
      updated: link.updated,
      annotation: link.annotationIdent,
      image: link.image,
      group: link.group
    };
  });
}

export async function listAnnotationsInGroup(project: number, group: number): Promise<Annotation[]> {
  let collection = new AnnotationCollection({
    project: project,
    group: group,
    showWKT: true,
    showTerm: true,
    showGIS: true,
    showTrack: true,
    showLink: true,
    showImageGroup: true
  });
  return (await collection.fetchAll()).array as Annotation[];
}

/**
 * Checks whether an annotation belongs to the provided layer and image
 *
 * @param {Object} annot The annotation
 * @param {Object} layer The layer
 * @param {Array} [slices] The slice identifiers
 *
 * @returns {Boolean} whether or not the annotation belongs to the provided layer and image
 */
export function annotBelongsToLayer(annot: Annotation, layer: Layer, slices: number[] | null = null): boolean {
  if (slices && !slices.includes(annot.slice)) {
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(annot, 'user')) {
    let isReviewed = annot.type === AnnotationType.REVIEWED;
    return layer.isReview ? isReviewed : (!isReviewed && annot.user === layer.id);
  }

  return annot.annotationLayer !== undefined && annot.annotationLayer.id === layer.id;
}