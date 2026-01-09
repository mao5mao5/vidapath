<!-- Copyright (c) 2009-2022. Authors: see NOTICE file.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.-->

<template>
  <div>
    <table class="table">
      <tbody>
        <tr>
          <!-- <td><strong>{{ $t('image') }}</strong></td> -->
          <td>

            <div>
              <!-- <a @click="openCrop(annotation)" class="level-item button is-small">
        {{ $t('button-view-crop') }}
      </a> -->
              <!-- <router-link v-if="showImageInfo" :to="annotationURL" class="button is-link is-small">
          {{ $t('button-view-in-image') }}
        </router-link> -->
              <!-- <image-name :image="image" /> -->
              <div class="actions">
                <!-- <input class="input" placeholder="add comments" v-model="inputedcomment" /> -->
                <button v-if="isPropDisplayed('comments') && comments" class="button" @click="openCommentsModal()"
                  :title="$t('button-comments')">
                  <i class="fas fa-comment"></i>
                </button>

                <button v-if="!showImageInfo" class=" button" @click="$emit('centerView')" :title="'Focus Center'">
                  <i class="fas fa-map-marker-alt"></i>
                </button>

                <button class="button" @click="copyURL()" :title="$t('button-copy-url')">
                  <i class="fas fa-copy"></i>
                </button>

                <button v-if="canEdit" class="button is-danger" @click="confirmDeletion()" :title="$t('button-delete')">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          </td>
        </tr>


        <!-- <tr >
        <td><strong>{{$t('channel')}}</strong></td>
        <td>
          <channel-name :channel="sliceChannel" />
        </td>
      </tr> -->

        <template v-if="isPropDisplayed('creation-info')">
          <tr>
            <td>Author: {{ creator.fullName }} at {{ Number(annotation.created) | moment('ll') }}</td>
            <!-- <td>
              {{ creator.fullName }}
            </td> -->
          </tr>
          <!-- <template v-if="!isReviewedAnnotation">
            <tr>
              <td><strong>{{ $t('created-on') }}</strong></td>
              <td> {{ Number(annotation.created) | moment('ll') }} </td>
            </tr>
            <tr v-if="isImageInReviewMode">
              <td><strong>{{ $t('reviewed-annotation-status') }}</strong></td>
              <td>
                <span class="tag is-danger">
                  {{ $t('reviewed-annotation-status-not-validated') }}
                </span>
              </td>
            </tr>
          </template> -->
          <!-- <template v-else>
            <tr>
              <td><strong>{{ $t('reviewed-by') }}</strong></td>
              <td>
                {{ reviewer.fullName }}
              </td>
            </tr>
            <tr>
              <td><strong>{{ $t('reviewed-on') }}</strong></td>
              <td> {{ Number(annotation.created) | moment('ll') }} </td>
            </tr>
            <tr v-if="isImageInReviewMode">
              <td><strong>{{ $t('reviewed-annotation-status') }}</strong></td>
              <td>
                <span class="tag is-success">
                  {{ $t('reviewed-annotation-status-validated') }}
                </span>
              </td>
            </tr>
          </template> -->
        </template>

        <template v-if="isPropDisplayed('geometry-info')">
          <tr>
            <td v-if="annotation.area > 0">{{ $t('area') }}: {{ `${annotation.area.toFixed(3)} ${annotation.areaUnit}`
              }}
            </td>
          </tr>
          <tr>
            <td v-if="annotation.perimeter > 0">{{ $t(annotation.area > 0 ? 'perimeter' : 'length') }}: {{
              `${annotation.perimeter.toFixed(3)}
              ${annotation.perimeterUnit}` }}</td>
          </tr>

          <!-- <tr v-if="annotation.perimeter > 0">
            <td><strong>{{ $t(annotation.area > 0 ? 'perimeter' : 'length') }}</strong></td>
            <td>{{ `${annotation.perimeter.toFixed(3)} ${annotation.perimeterUnit}` }}</td>
          </tr> -->

          <!-- <tr v-if="profile">
          <td>
            <strong v-if="isPoint">{{$t('profile')}}</strong>
            <strong v-else>{{$t('profile-projection')}}</strong>
          </td>
          <td><button class="button is-small" @click="openRegularProfileModal">{{$t('inspect-button')}}</button></td>
        </tr>

        <tr v-if="profile && !isPoint">
          <td>
            <strong>{{spatialProjection}}</strong>
          </td>
          <td><button class="button is-small" @click="openSpatialProfileModal">{{$t('inspect-button')}}</button></td>
        </tr> -->
        </template>

        <!-- TERMS -->
        <tr v-if="isPropDisplayed('terms')">
          <td colspan="2">
            <b-tag v-for="{ term, user } in associatedTerms" :key="term.id"
              :title="$t('associated-by', { username: user.fullName })">
              <cytomine-term :term="term" />
              <button v-if="canEditTerms" class="delete is-small" :title="$t('button-delete')"
                @click="removeTerm(term.id, user.id)">
              </button>
            </b-tag>
            <div v-if="canEditTerms" class="add-term-wrapper" v-click-outside="() => showTermSelector = false">
              <b-field>
                <b-input size="is-small" expanded :placeholder="$t('add-term')" v-model="addTermString"
                  @focus="showTermSelector = true" />
              </b-field>

              <div class="ontology-tree-container" v-show="showTermSelector">
                <ontology-tree class="ontology-tree" 
                  :ontologies="ontologies" 
                  :searchString="addTermString"
                  :selectedNodes="annotation.term" 
                  @newTerm="newTerm" 
                  @select="addTerm"
                  @unselect="removeTerm" />
              </div>
            </div>
          </td>
        </tr>

        <tr v-if="isPropDisplayed('tags')">
          <td>
            <!-- <h5>{{ $t('tags') }}</h5> -->
            <cytomine-tags :object="annotation" :canEdit="canEdit" />
          </td>
        </tr>

        <tr v-if="isPropDisplayed('description')">
          <td>
            <!-- <h5>{{ $t('description') }} :</h5> -->
            <cytomine-description :object="annotation" :canEdit="canEdit" :maxPreviewLength="300" />
          </td>
        </tr>

        <!-- TRACKS -->
        <!-- <tr v-if="isPropDisplayed('tracks') && maxRank > 1">
        <td colspan="2">
          <h5>{{$t('tracks')}}</h5>
          <b-tag v-for="{track} in associatedTracks" :key="track.id">
            <cytomine-track :track="track" />
            <button v-if="canEditTerms" class="delete is-small" :title="$t('button-delete')"
                    @click="removeTrack(track.id)">
            </button>
          </b-tag>
          <div class="add-track-wrapper" v-if="canEditTerms" v-click-outside="() => showTrackSelector = false">
            <b-field>
              <b-input
                size="is-small"
                expanded
                :placeholder="$t('add-track')"
                v-model="addTrackString"
                @focus="showTrackSelector = true"
              />
            </b-field>

            <div class="track-tree-container" v-show="showTrackSelector">
              <track-tree
                class="track-tree"
                :tracks="availableTracks"
                :searchString="addTrackString"
                :selectedNodes="associatedTracksIds"
                :allowNew="true"
                :image="image"
                @newTrack="newTrack"
                @select="addTrack"
                @unselect="removeTrack"
              />
            </div>
          </div>
          <em v-else-if="!associatedTracks.length">{{$t('no-track')}}</em>
        </td>
      </tr> -->

        <!-- PROPERTIES -->
        <!-- <tr v-if="isPropDisplayed('properties')">
          <td colspan="2">
            <h5>{{ $t('properties') }}</h5>
            <cytomine-properties :object="annotation" :canEdit="canEdit" @update="$emit('updateProperties')" />
          </td>
        </tr> -->

        <!-- <tr v-if="isPropDisplayed('attached-files')">
        <td colspan="2">
          <h5>{{$t('attached-files')}}</h5>
          <attached-files :object="annotation" :canEdit="canEdit" />
        </td>
      </tr> -->

        <!-- <template>
        <tr>
          <td colspan="2">
            <h5>{{ $t('similar-annotations') }}</h5>
            <button class="button is-small is-fullwidth" @click="$emit('searchSimilarAnnotations')">
              {{ $t('search-similar-annotation') }}
            </button>
          </td>
        </tr>
      </template> -->

        <!-- <template v-if="isPropDisplayed('linked-annotations')">
        <tr>
          <td colspan="2">
            <h5>{{$t('linked-annotations')}}</h5>
              <annotation-links-preview
                  :size="linkCropSize"
                  :link-color="linkColor"
                  :show-main-annotation="false"
                  :show-select-all-button="!showImageInfo"
                  :allow-annotation-selection="true"
                  :annotation="annotation"
                  :images="images"
                  @select="$emit('select', $event)"
              />
          </td>
        </tr>
      </template> -->

        <!-- <template v-if="currentAccount.isDeveloper">
          <tr>
            <td><strong>{{ $t('id') }}</strong></td>
            <td>{{ annotation.id }}</td>
          </tr>
        </template> -->
      </tbody>
    </table>
  </div>
</template>

<script>
import { get } from '@/utils/store-helpers';

import { AnnotationTerm, AnnotationType, AnnotationCommentCollection, AnnotationTrack, PropertyCollection } from '@/api';
import copyToClipboard from 'copy-to-clipboard';
import ImageName from '@/components/image/ImageName';
import CytomineDescription from '@/components/description/CytomineDescription';
import CytomineProperties from '@/components/property/CytomineProperties';
import CytomineTags from '@/components/tag/CytomineTags';
import CytomineTerm from '@/components/ontology/CytomineTerm';
import AttachedFiles from '@/components/attached-file/AttachedFiles';
import OntologyTree from '@/components/ontology/OntologyTree';
import TrackTree from '@/components/track/TrackTree';
import CytomineTrack from '@/components/track/CytomineTrack';
import AnnotationCommentsModal from './AnnotationCommentsModal';
import ProfileModal from '@/components/viewer/ProfileModal';
import AnnotationLinksPreview from '@/components/annotations/AnnotationLinksPreview';
import { appendShortTermToken } from '@/utils/token-utils.js';
import ChannelName from '@/components/viewer/ChannelName';
import constants from '@/utils/constants.js';
import { Description } from '@/api';

export default {
  name: 'annotations-details',
  components: {
    ChannelName,
    ImageName,
    CytomineDescription,
    CytomineTerm,
    OntologyTree,
    CytomineTags,
    CytomineProperties,
    AttachedFiles,
    TrackTree,
    CytomineTrack,
    AnnotationLinksPreview,
  },
  props: {
    index: { type: String },
    annotation: { type: Object },
    terms: { type: Array },
    tracks: { type: Array },
    users: { type: Array },
    images: { type: Array },
    slices: { type: Array, default: () => [] },
    profiles: { type: Array, default: () => [] },
    showImageInfo: { type: Boolean, default: true },
    showChannelInfo: { type: Boolean, default: false },
    showComments: { type: Boolean, default: false }
  },
  data() {
    return {
      addTermString: '',
      addTrackString: '',
      showTermSelector: false,
      showTrackSelector: false,
      comments: null,
      revTerms: 0,
      revTracks: 0,
      linkCropSize: 64,
      linkColor: '696969',
      // properties: [],
      loadPropertiesError: false,
      description: null,
      inputedcomment: '',
    };
  },
  computed: {
    configUI: get('currentProject/configUI'),
    currentAccount: get('currentUser/account'),
    shortTermToken: get('currentUser/shortTermToken'),
    imageModule() {
      return this.$store.getters['currentProject/imageModule'](this.index);
    },
    ontologies() {
      return this.$store.getters[this.imageModule + 'ontologies'];
    },
    creator() {
      return this.users.find(user => user.id === this.annotation.user) || {};
    },
    isReviewedAnnotation() {
      return this.annotation.type === AnnotationType.REVIEWED;
    },
    reviewer() {
      if (this.isReviewedAnnotation) {
        return this.users.find(user => user.id === this.annotation.reviewUser) || {};
      }
      return null;
    },
    canEdit() {
      return this.$store.getters['currentProject/canEditAnnot'](this.annotation);
    },
    canEditTerms() {
      // HACK: because core prevents from modifying term of algo annot (https://github.com/cytomine/Cytomine-core/issues/1138 & 1139)
      // + term modification forbidden for reviewed annotation
      return this.canEdit; //&& this.annotation.type === AnnotationType.USER;
    },
    image() {
      return this.images.find(image => image.id === this.annotation.image) ||
        { 'id': this.annotation.image, 'instanceFilename': this.annotation.instanceFilename };
    },
    isImageInReviewMode() {
      return this.image.inReview;
    },
    sliceChannel() {
      return this.slices.find(slice => slice.id === this.annotation.slice) || {};
    },
    maxRank() {
      return this.image.depth * this.image.duration * this.image.channels;
    },
    profile() {
      return this.profiles.find(profile => profile.image === this.image.baseImage);
    },
    annotationURL() {
      console.log('annotation', this.annotation);
      return `/project/${this.annotation.project}/image/${this.annotation.image}/annotation/${this.annotation.id}`;
    },
    associatedTerms() {
      if (this.annotation.userByTerm) {
        return this.annotation.userByTerm.map(ubt => {
          let term = this.terms.find(term => ubt.term === term.id);
          let user = this.users.find(user => user.id === ubt.user[0]) || {}; // QUESTION: can we have several users?
          return { term, user };
        });
      } else {
        return [];
      }
    },
    associatedTracks() {
      if (this.annotation.annotationTrack) {
        return this.annotation.annotationTrack.map(at => {
          let track = this.tracks.find(track => at.track === track.id);
          return { track };
        });
      } else {
        return [];
      }
    },
    associatedTracksIds() {
      this.revTracks;
      return this.associatedTracks.map(({ track }) => track.id);
    },
    availableTracks() {
      return this.tracks.filter(track => track.image === this.annotation.image);
    },
    isPoint() {
      return this.annotation.location && this.annotation.location.includes('POINT');
    },
    // internalUseFilteredProperties() {
    //   return this.properties.filter(prop => !prop.key.startsWith(constants.PREFIX_HIDDEN_PROPERTY_KEY));
    // },
    spatialProjection() {
      if (this.image.channels > 1) {
        return this.$t('fluorescence-spectra');
      } else if (this.image.depth > 1) {
        return this.$t('depth-spectra');
      } else if (this.image.duration > 1) {
        return this.$t('temporal-spectra');
      }
      return this.$t('spatial-projection');
    }
  },
  methods: {
    appendShortTermToken,
    isPropDisplayed(prop) {
      return this.configUI[`project-explore-annotation-${prop}`];
    },
    openCrop(annotation) {
      window.location.assign(appendShortTermToken(annotation.url + '?draw=true&complete=true&increaseArea=1.25', this.shortTermToken), '_blank');
    },
    copyURL() {
      copyToClipboard(window.location.origin + '/#' + this.annotationURL);
      this.$notify({ type: 'success', text: this.$t('notif-success-annot-URL-copied') });
    },

    async newTerm(term) { // a new term was added to the ontology
      this.$emit('addTerm', term);
      this.$store.dispatch('currentProject/fetchOntology');
      this.addTerm(term.id);
    },

    async addTerm(idTerm) {
      if (idTerm) {
        try {
          await new AnnotationTerm({ annotation: this.annotation.id, term: idTerm }).save();
          this.$emit('updateTerms');
          this.showTermSelector = false;
        } catch (error) {
          this.$notify({ type: 'error', text: this.$t('notif-error-add-term') });
          this.revTerms++;
        } finally {
          this.addTermString = '';
        }
      }
    },
    async removeTerm(idTerm, idUser) {
      idUser = idUser || this.findUserByTerm(idTerm); // if term removed from ontology tree, idUser not set => find it manually
      if (!idUser) {
        return;
      }

      try {
        await AnnotationTerm.delete(this.annotation.id, idTerm, Number(idUser));
        this.$emit('updateTerms');
      } catch (error) {
        console.log(error);
        this.$notify({ type: 'error', text: this.$t('notif-error-remove-term') });
        this.revTerms++;
      }
    },
    findUserByTerm(idTerm) {
      if (this.annotation.userByTerm) {
        let match = this.annotation.userByTerm.find(ubt => ubt.term === idTerm);
        if (match) {
          return match.user[0];
        }
      }
    },

    async newTrack(track) {
      this.$emit('addTrack', track);
      this.addTrack(track.id);
    },
    async addTrack(idTrack) {
      if (idTrack) {
        try {
          await new AnnotationTrack({ annotation: this.annotation.id, track: idTrack }).save();
          this.$emit('updateTracks');
          this.showTrackSelector = false;
        } catch (error) {
          this.$notify({ type: 'error', text: this.$t('notif-error-add-track') });
          this.revTracks++;
        } finally {
          this.addTrackString = '';
        }
      }
    },
    async removeTrack(idTrack) {
      if (idTrack) {
        try {
          await AnnotationTrack.delete(this.annotation.id, idTrack);
          this.$emit('updateTracks');
        } catch (error) {
          this.$notify({ type: 'error', text: this.$t('notif-error-remove-track') });
          this.revTracks++;
        } finally {
          this.addTrackString = '';
        }
      }
    },

    openCommentsModal() {
      this.$buefy.modal.open({
        parent: this,
        component: AnnotationCommentsModal,
        props: { annotation: this.annotation, comments: this.comments },
        hasModalCard: true,
        events: { 'addComment': this.addComment }
      });
    },

    addComment(comment) {
      this.comments.unshift(comment);
    },

    openSpatialProfileModal() {
      this.openProfileModal(true);
    },

    openRegularProfileModal() {
      this.openProfileModal(false);
    },

    openProfileModal(spatialAxis) {
      this.$buefy.modal.open({
        parent: this,
        component: ProfileModal,
        props: { annotation: this.annotation, image: this.image, spatialAxis },
        hasModalCard: true
      });
    },

    confirmDeletion() {
      this.$buefy.dialog.confirm({
        title: this.$t('confirm-deletion'),
        message: this.$t('confirm-deletion-annotation'),
        type: 'is-danger',
        confirmText: this.$t('button-confirm'),
        cancelText: this.$t('button-cancel'),
        onConfirm: () => this.deleteAnnot()
      });
    },

    async deleteAnnot() {
      try {
        await this.annotation.delete();
        this.$emit('deletion');
      } catch (err) {
        this.$notify({ type: 'error', text: this.$t('notif-error-annotation-deletion') });
      }
    }
  },
  async created() {
    if (this.isPropDisplayed('comments') && this.annotation.type === AnnotationType.USER) {
      try {
        this.comments = (await AnnotationCommentCollection.fetchAll({ annotation: this.annotation })).array;
        if (this.showComments) {
          this.openCommentsModal();
        }
      } catch (error) {
        console.log(error);
        this.$notify({ type: 'error', text: this.$t('notif-error-fetch-annotation-comments') });
      }
    }

    try {
      this.description = await Description.fetch(this.object);
    } catch (err) {
      // the error may make sense if the object has no description
    }

    // try {
    //   this.properties = (await PropertyCollection.fetchAll({ object: this.annotation })).array;
    // } catch (error) {
    //   this.loadPropertiesError = true;
    //   console.log(error);
    // }

    this.$eventBus.$emit('hide-similar-annotations');
  },
  destroyed() {
    this.$eventBus.$emit('hide-similar-annotations');
  },
};
</script>

<style scoped lang="scss">
@import '../../assets/styles/dark-variables';


.table {
  width: 100%;
  font-size: $details-font-size;
  background: $dark-bg-primary;
  color: $dark-text-primary;
}

.table th,
.table td {
  vertical-align: middle;
  color: $dark-text-primary;
  border-color: $dark-table-border;
}

.table tr:hover {
  background-color: $dark-table-hover-bg;
}

h5 {
  font-weight: 600;
  margin-bottom: 0.6em;
  color: $dark-text-primary;
}

.actions .button {
  width: 2rem;
  height: 2rem;
  border-radius: 2%;
  margin: 2px;
  background-color: $dark-button-bg;
  color: $dark-text-primary;
  border-color: $dark-button-border;
  /* box-sizing: border-box; */
}

.actions .button:hover {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}

.actions .button.is-danger {
  background-color: $dark-button-danger-bg;
  border-color: $dark-button-danger-border;
}

.actions .button.is-danger:hover {
  background-color: $dark-button-danger-hover-bg;
  border-color: $dark-button-danger-hover-border;
}

.actions .button.is-link {
  background-color: $dark-button-link-bg;
  border-color: $dark-button-link-border;
}

.actions .button.is-link:hover {
  background-color: $dark-button-link-hover-bg;
  border-color: $dark-button-link-hover-border;
}

a.is-fullwidth {
  width: auto;
  color: $dark-text-primary;
}

a.is-fullwidth:hover {
  color: #cccccc;
}

.add-term-wrapper,
.add-track-wrapper {
  position: relative;
}

.ontology-tree-container,
.track-tree-container {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 500;
  padding-top: 5px;
  background: $dark-bg-secondary;
  width: 100%;
  max-height: 30vh;
  overflow: auto;
  box-shadow: 0 2px 3px rgba(10, 10, 10, 0.1), 0 0 0 1px rgba(10, 10, 10, 0.1);
  border-radius: 4px;
  margin-top: 4px;
  color: $dark-text-primary;
}

/**
* https://stackoverflow.com/a/55368933
* Since the project is using Sass and Vue 2.6.10, use `::v-deep` instead of `>>>` so it doesn't break validation.
* Note that it's deprecated but will in Vue 3.
* TODO: update >>> and ::v-deep using the unified :deep() selector when using the latest Vue.
*/
::v-deep .sl-vue-tree-node-item {
  font-size: 0.9em;
  color: $dark-text-primary;
}

::v-deep .tag {
  margin-right: 5px;
  margin-bottom: 5px !important;
  background-color: $dark-tag-bg;
  color: $dark-text-primary;
  border: 1px solid $dark-tag-border;
}

::v-deep .tag:hover {
  background-color: $dark-tag-hover-bg;
}

::v-deep .input,
::v-deep .textarea,
::v-deep .select select {
  background-color: $dark-input-bg;
  color: $dark-text-primary;
  border-color: $dark-input-border;
}

::v-deep .input::placeholder,
::v-deep .textarea::placeholder,
::v-deep .select select::placeholder {
  color: $dark-text-disabled;
}

::v-deep .input:focus,
::v-deep .textarea:focus,
::v-deep .select select:focus {
  border-color: $dark-input-focus-border;
  box-shadow: 0 0 0 0.2rem $dark-input-focus-shadow;
}

::v-deep .button {
  background-color: $dark-button-bg;
  color: $dark-text-primary;
  border: 1px solid $dark-button-border;
}

::v-deep .button:hover {
  background-color: $dark-button-hover-bg;
  border-color: $dark-button-hover-border;
}

::v-deep strong {
  color: $dark-text-primary;
}
</style>
